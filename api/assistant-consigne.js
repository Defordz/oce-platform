// api/assistant-consigne.js
// Assistant de création de consignes : l'utilisateur décrit en langage courant
// la correction voulue (avec, si possible, un exemple « avant → après ») ;
// le modèle rédige la fiche complète (type de document, catégorie, mode, texte,
// exemples, expression régulière le cas échéant) ou pose UNE question si la
// demande est ambiguë. Une règle automatique n'est jamais renvoyée sans avoir
// été exécutée ici sur ses propres exemples : en cas d'échec, le modèle est
// relancé avec le détail de l'échec.

import { requireAppPassword } from '../lib/auth.js';
import { callStructured } from '../lib/anthropic.js';
import { applyRules, runRegexPass } from './analyze.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const DOCTYPES = ['cp_fr', 'cp_ar', 'decision_ar', 'lettre_ar', 'lettre_fr', 'lettres', 'bilingue', 'tous'];
const CATEGORIES = ['FORME', 'FOND', 'TERMINOLOGIE', 'BILINGUE'];
const MAX_ROUNDS = 3;

const TOOL = {
  name: 'reponse_assistant',
  description: "Répond à l'utilisateur : soit une question de précision, soit une proposition de consigne complète.",
  input_schema: {
    type: 'object',
    properties: {
      statut: { type: 'string', enum: ['question', 'proposition'] },
      message: { type: 'string', description: "Réponse à l'utilisateur, en français simple, 1 à 4 phrases, sans jargon technique." },
      doublon: { type: 'string', description: "Code d'une consigne existante qui couvre déjà la demande ou la contredit, sinon chaîne vide." },
      consigne: {
        type: 'object',
        properties: {
          doctype: { type: 'string', enum: DOCTYPES },
          category: { type: 'string', enum: CATEGORIES },
          mode: { type: 'string', enum: ['regex', 'claude'] },
          label: { type: 'string', description: 'Titre court de la consigne (moins de 60 caractères).' },
          text: { type: 'string', description: 'La règle, rédigée pour un correcteur : ce qui est attendu, ce qui est fautif, les limites.' },
          examples: { type: 'string', description: 'Une ligne par exemple : « ✗ fautif → ✓ corrigé ».' },
          regex: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                find: { type: 'string', description: 'Expression régulière JavaScript (sans les barres obliques).' },
                replace: { type: 'string', description: 'Remplacement ($1, $<nom>).' },
                flags: { type: 'string', description: "Drapeaux, « g » au minimum ; « gm » si l'expression utilise ^ ou $." },
                label: { type: 'string', description: 'Motif affiché avec la correction.' },
              },
              required: ['find', 'replace', 'flags', 'label'],
            },
          },
        },
        required: ['doctype', 'category', 'mode', 'label', 'text', 'examples'],
      },
      tests: {
        type: 'array',
        description: 'Pour une règle automatique : au moins trois essais, dont un texte qui NE DOIT PAS changer.',
        items: {
          type: 'object',
          properties: {
            avant: { type: 'string' },
            apres: { type: 'string', description: 'Texte attendu après application (identique à « avant » si rien ne doit changer).' },
          },
          required: ['avant', 'apres'],
        },
      },
    },
    required: ['statut', 'message'],
  },
};

function setCors(res) {
  if (ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-password');
}

function systemPrompt(existing) {
  return `Tu assistes un rapporteur du Conseil de la concurrence du Maroc qui veut ajouter une CONSIGNE à sa plateforme de correction de documents (communiqués, décisions, lettres). Il n'est pas informaticien : il décrit la correction voulue avec ses mots, parfois avec un exemple. Tu rédiges la fiche complète à sa place.

TYPES DE DOCUMENT (doctype) :
- cp_fr : communiqué de presse en français ; cp_ar : communiqué en arabe (بلاغ) ; bilingue : correspondance FR/AR des communiqués
- decision_ar : décision du Conseil en arabe (قرار)
- lettre_ar : lettre en arabe ; lettre_fr : lettre en français ; lettres : règle commune aux lettres des deux langues
- tous : tous les documents
CATÉGORIES : FORME (orthographe, typographie, formules, présentation), FOND (qualification, références juridiques, structure, cohérence), TERMINOLOGIE (termes consacrés), BILINGUE (cohérence entre versions).

DEUX MODES :
- « regex » : remplacement AUTOMATIQUE et certain. À choisir quand la faute se reconnaît mécaniquement à sa forme (un mot ou une formule fixe à remplacer par une autre, une espace, un signe). Tu écris alors une ou plusieurs expressions régulières JavaScript avec leur remplacement.
- « claude » : règle de JUGEMENT, appliquée par le modèle de correction à la lecture. À choisir dès que la correction dépend du contexte, du sens ou du destinataire, ou qu'un remplacement mécanique risquerait de toucher des cas légitimes.
Dans le doute, choisis « claude » : une règle automatique trop large abîme des documents officiels.

RÈGLES D'ÉCRITURE DES EXPRESSIONS RÉGULIÈRES :
- Syntaxe JavaScript ; drapeau « g » toujours ; « m » si ^ ou $ ; pas de drapeau « i » en arabe.
- Lettres arabes : [\\u0621-\\u064A]. Frontière de mot arabe : (?<![\\u0621-\\u064A]) avant, (?![\\u0621-\\u064A]) après (\\b ne fonctionne pas en arabe).
- Pense aux préfixes collés en arabe (و ف ب ل ال) : capture-les et restitue-les (ex. (?<p>[وف]?)… remplacé par $<p>…).
- Vise l'expression la plus étroite qui couvre la demande. Ne remplace jamais dans un nom propre ou une dénomination sociale.
- Le remplacement ne doit rien changer d'autre que la faute : conserve les espaces et la ponctuation voisines.

MÉTHODE :
1. Si la demande ne dit pas à quel type de document elle s'applique, ou si elle peut se comprendre de deux façons qui donneraient deux règles différentes, pose UNE seule question courte (statut « question »), avec les choix possibles. Sinon ne pose pas de question.
2. Vérifie les consignes existantes ci-dessous : si l'une couvre déjà la demande ou la contredit, indique son code dans « doublon » et explique-le dans le message ; propose alors de la compléter plutôt que d'en créer une seconde.
3. Rédige la fiche : « label » court ; « text » clair et complet, rédigé en français (les formules arabes citées entre « ») ; « examples » sur le modèle « ✗ fautif → ✓ corrigé » en reprenant l'exemple de l'utilisateur s'il en a donné un.
4. En mode « regex », fournis au moins trois « tests » : la faute signalée, une variante (préfixe, autre position), et un texte voisin correct qui ne doit PAS changer. Ils seront exécutés ; ils doivent passer.
5. « message » explique en une à quatre phrases simples ce que fera la consigne et dans quels documents, sans aucun terme technique (ne parle ni de regex ni de mode).

CONSIGNES EXISTANTES (code, type, mode, titre) :
${existing}`;
}

const PREFIX = {
  cp_fr: { FORME: 'F', FOND: 'D', TERMINOLOGIE: 'T', BILINGUE: 'B' }, cp_ar: 'A',
  decision_ar: { FORME: 'DEC-F', FOND: 'DEC-S', TERMINOLOGIE: 'DEC-T', BILINGUE: 'DEC-T' },
  lettre_ar: 'LA', lettre_fr: 'LF', lettres: 'LG', tous: 'G', bilingue: { TERMINOLOGIE: 'T', BILINGUE: 'B', FORME: 'B', FOND: 'B' },
};
export function nextCode(doctype, category, consignes) {
  const p = PREFIX[doctype] || 'X';
  const prefix = typeof p === 'string' ? p : (p[category] || 'X');
  const re = new RegExp('^' + prefix.replace(/[-]/g, '\\-') + '-(\\d+)$');
  let max = 0;
  for (const c of consignes) { const m = re.exec(String((c && c.code) || '')); if (m) max = Math.max(max, +m[1]); }
  return `${prefix}-${String(max + 1).padStart(2, '0')}`;
}

// Exécute une règle automatique sur ses essais. Renvoie le détail et les erreurs.
export function runTests(consigne, tests) {
  const errors = [], results = [];
  const rule = { ...consigne, code: 'ESSAI', active: true };
  for (const r of (consigne.regex || [])) {
    try { new RegExp(r.find, (r.flags || '').includes('g') ? r.flags : (r.flags || '') + 'g'); }
    catch (e) { errors.push(`Expression invalide « ${r.find} » : ${e.message}`); }
  }
  if (errors.length) return { errors, results };
  for (const t of (tests || [])) {
    const obtenu = applyRules(t.avant, consigne.doctype, [rule]);
    const ok = obtenu === t.apres;
    results.push({ avant: t.avant, attendu: t.apres, obtenu, ok });
    if (!ok) errors.push(`Essai en échec : « ${t.avant} » devait donner « ${t.apres} », la règle donne « ${obtenu} ».`);
  }
  if (!(tests || []).some(t => t.avant !== t.apres)) errors.push('Aucun essai ne montre la correction attendue.');
  if (!(tests || []).some(t => t.avant === t.apres)) errors.push('Il manque un essai de texte correct qui ne doit pas changer.');
  return { errors, results };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  if (!requireAppPassword(req, res)) return;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Configuration serveur incomplète : ANTHROPIC_API_KEY manquante côté Vercel.' });

  const body = req.body || {};
  const consignes = Array.isArray(body.consignes) ? body.consignes : [];

  // Essai d'une règle sur un texte fourni par l'utilisateur (aucun appel au modèle).
  if (body.essai && body.consigne) {
    const rule = { ...body.consigne, code: body.consigne.code || 'ESSAI', active: true };
    const corrections = runRegexPass({ text: String(body.essai).slice(0, 60000), docType: rule.doctype, consignes: [rule] });
    return res.status(200).json({ corrections: corrections.map(c => ({ original: c.original, suggested: c.suggested })) });
  }

  const messages = (Array.isArray(body.messages) ? body.messages : []).filter(m => m && typeof m.content === 'string' && m.content.trim()).slice(-12);
  if (!messages.length || messages[messages.length - 1].role !== 'user') return res.status(400).json({ error: 'Message manquant.' });

  const existing = consignes.filter(c => c && c.code).map(c => `${c.code} | ${c.doctype} | ${c.mode} | ${c.label}${c.active === false ? ' (inactive)' : ''}`).join('\n') || '(aucune)';
  const system = systemPrompt(existing);
  const transcript = messages.map(m => `${m.role === 'user' ? 'UTILISATEUR' : 'ASSISTANT'} : ${m.content.trim()}`).join('\n\n');
  let user = `CONVERSATION :\n${transcript}\n\nRéponds au dernier message de l'utilisateur.`;

  try {
    let out = null, check = { errors: [], results: [] };
    for (let round = 0; round < MAX_ROUNDS; round++) {
      out = await callStructured({ apiKey, system, user, tool: TOOL, maxTokens: 4000 });
      if (out.statut !== 'proposition' || !out.consigne) break;
      const c = out.consigne;
      if (!DOCTYPES.includes(c.doctype) || !CATEGORIES.includes(c.category)) { out.statut = 'question'; out.message = 'À quel type de document cette consigne doit-elle s\'appliquer ?'; delete out.consigne; break; }
      if (c.mode !== 'regex') { c.regex = null; break; }
      if (!Array.isArray(c.regex) || !c.regex.length) { check = { errors: ['Mode « regex » sans expression.'], results: [] }; }
      else check = runTests(c, out.tests);
      if (!check.errors.length) break;
      user = `CONVERSATION :\n${transcript}\n\nTa proposition précédente a échoué à la vérification :\n${JSON.stringify({ regex: c.regex, tests: out.tests })}\n${check.errors.map(e => '- ' + e).join('\n')}\nCorrige les expressions (ou les essais s'ils étaient mal écrits), ou passe en mode « claude » si la correction ne peut pas être mécanique.`;
    }
    if (out.statut !== 'proposition' || !out.consigne) {
      return res.status(200).json({ statut: 'question', message: out.message || 'Pouvez-vous préciser la correction voulue ?', doublon: out.doublon || '' });
    }
    const c = out.consigne;
    let note = '';
    if (c.mode === 'regex' && check.errors.length) {
      // La règle automatique n'a pas pu être validée : on la livre comme règle de jugement.
      c.mode = 'claude'; c.regex = null; check = { errors: [], results: [] };
      note = " La correction automatique n'a pas pu être garantie sur les essais : la consigne sera appliquée par le correcteur à la lecture.";
    }
    const code = nextCode(c.doctype, c.category, consignes);
    const today = new Date().toISOString().slice(0, 10);
    const fiche = {
      scope: ['tout'], active: true, regex: c.mode === 'regex' ? c.regex.map(r => ({ find: r.find, replace: r.replace, flags: (r.flags || 'g').includes('g') ? r.flags : r.flags + 'g', label: r.label })) : null,
      version: '1.0', created: today, code, id: code, doctype: c.doctype, category: c.category, mode: c.mode,
      label: String(c.label || '').slice(0, 90), text: String(c.text || ''), examples: String(c.examples || ''),
      notes: `[${today.split('-').reverse().join('/')}] Créée avec l'assistant.`,
    };
    return res.status(200).json({ statut: 'proposition', message: (out.message || '') + note, doublon: out.doublon || '', consigne: fiche, essais: check.results });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}
