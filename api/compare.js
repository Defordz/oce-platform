// api/compare.js
// Comparaison BILINGUE FR/AR d'un meme communiqué, cote SERVEUR.
// Ne corrige pas un document : signale les ECARTS entre les deux versions.
// Meme modele de securite que /api/analyze : la cle reste cote serveur.

import { requireAppPassword } from '../lib/auth.js';
import { callStructured } from '../lib/anthropic.js';
import { extractDates, computeDeadline, formatLongFR } from '../lib/dates.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MAX_TOKENS = 12000;
const MAX_DOC_CHARS = 60000;

// Outil impose au modele : sa reponse est toujours un objet conforme a ce schema.
const COMPARE_TOOL = {
  name: 'rapport_ecarts',
  description: 'Renvoie les écarts relevés entre la version française et la version arabe, et une synthèse.',
  input_schema: {
    type: 'object',
    properties: {
      discrepancies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string', enum: ['chiffre', 'date', 'qualification', 'terminologie', 'autre'] },
            fr: { type: 'string', description: 'Ce que dit la version française.' },
            ar: { type: 'string', description: 'Ce que dit la version arabe.' },
            note: { type: 'string', description: "Explication courte de l'écart." },
            severity: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
          },
          required: ['category', 'fr', 'ar', 'note', 'severity'],
        },
      },
      summary: { type: 'string', description: 'Synthèse de la cohérence bilingue en 2 ou 3 phrases.' },
    },
    required: ['discrepancies', 'summary'],
  },
};

// Dates (publication et cloture) : comparaison FR/AR et controle de la regle
// J+10 reportee au lundi, de maniere deterministe.
function compareDates(textFr, textAr) {
  const fr = extractDates(textFr, 'fr'), ar = extractDates(textAr, 'ar');
  const lab = iso => (iso ? formatLongFR(iso) : 'absente ou illisible');
  const out = [];
  for (const [k, name] of [['publication', 'Date de publication'], ['deadline', 'Date limite des observations']]) {
    if ((fr[k] || ar[k]) && fr[k] !== ar[k]) {
      out.push({ category: 'date', fr: lab(fr[k]), ar: lab(ar[k]), note: `${name} différente entre les deux versions.`, severity: 'haute', deterministic: true });
    }
  }
  for (const [version, d] of [['française', fr], ['arabe', ar]]) {
    if (!d.publication || !d.deadline) continue;
    const attendue = computeDeadline(d.publication);
    if (attendue === d.deadline) continue;
    out.push({
      category: 'date',
      fr: version === 'française' ? lab(d.deadline) : 'non concernée',
      ar: version === 'arabe' ? lab(d.deadline) : 'non concernée',
      note: `Version ${version} : date limite non conforme à la règle (publication le ${lab(d.publication)}, date limite attendue le ${lab(attendue)}).`,
      severity: 'haute', deterministic: true,
    });
  }
  return out;
}

function setCors(res) {
  if (ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-password');
}

// Normalise les chiffres arabes (indo-arabes U+0660-0669 et leur variante
// etendue U+06F0-06F9) en chiffres ASCII, et les separateurs/percent arabes.
function normalizeDigits(s) {
  let out = '';
  for (const ch of String(s || '')) {
    const o = ch.codePointAt(0);
    if (o >= 0x0660 && o <= 0x0669) out += String.fromCharCode(o - 0x0660 + 48);
    else if (o >= 0x06F0 && o <= 0x06F9) out += String.fromCharCode(o - 0x06F0 + 48);
    else if (o === 0x066B) out += '.';      // separateur decimal arabe
    else if (o === 0x066C) out += ' ';      // separateur de milliers arabe
    else if (o === 0x066A) out += '%';      // signe pourcent arabe ٪
    else out += ch;
  }
  return out;
}

// Signature d'un nombre : on ne garde que les chiffres, pour comparer la VALEUR
// independamment du format (42,11 et 42.11 -> "4211").
function digitSig(token) { return token.replace(/[^\d]/g, ''); }

// Extrait le multiensemble des POURCENTAGES d'un texte (deja normalise).
function extractPercents(text) {
  const re = /(\d[\d.,\u00a0 ]*?)\s*%/g;
  const map = new Map(); // signature -> { raw, count }
  let m;
  while ((m = re.exec(text)) !== null) {
    const sig = digitSig(m[1]);
    if (!sig) continue;
    const raw = (m[1].trim() + ' %').replace(/\s+/g, ' ');
    const e = map.get(sig) || { raw, count: 0 };
    e.count++; map.set(sig, e);
  }
  return map;
}

// Compare les pourcentages des deux versions ; renvoie des ecarts deterministes.
function comparePercents(textFr, textAr) {
  const fr = extractPercents(normalizeDigits(textFr));
  const ar = extractPercents(normalizeDigits(textAr));
  const label = (m) => m.raw + (m.count > 1 ? ` (x${m.count})` : '');
  const frOnly = [], arOnly = [];
  for (const [sig, e] of fr) { const a = ar.get(sig); if (!a || a.count !== e.count) frOnly.push(e); }
  for (const [sig, e] of ar) { if (!fr.has(sig)) arOnly.push(e); }

  // Cas non ambigu (un seul ecart de chaque cote) : on apparie en une ligne.
  if (frOnly.length === 1 && arOnly.length === 1) {
    return [{
      category: 'chiffre',
      fr: label(frOnly[0]),
      ar: label(arOnly[0]),
      note: "Pourcentage différent entre les deux versions.",
      severity: 'haute',
      deterministic: true,
    }];
  }

  // Sinon, on liste chaque ecart separement pour ne pas apparier a tort.
  const out = [];
  for (const e of frOnly) out.push({
    category: 'chiffre', fr: label(e), ar: 'absent',
    note: "Pourcentage présent en français, sans équivalent identique en arabe.",
    severity: 'haute', deterministic: true,
  });
  for (const e of arOnly) out.push({
    category: 'chiffre', fr: 'absent', ar: label(e),
    note: "Pourcentage présent en arabe, sans équivalent identique en français.",
    severity: 'haute', deterministic: true,
  });
  return out;
}

function buildPrompt({ textFr, textAr, consignes }) {
  const compareConsignes = (Array.isArray(consignes) ? consignes : [])
    .filter(c => c && c.active !== false && (c.mode === 'compare' || c.doctype === 'bilingue'))
    .map(c => `[${c.code}] ${c.label}\n${String(c.text || '')}`)
    .join('\n\n');

  const fr = String(textFr || '').substring(0, MAX_DOC_CHARS);
  const ar = String(textAr || '').substring(0, MAX_DOC_CHARS);

  const system = `Tu es un expert du Conseil de la concurrence du Maroc. On te donne la version FRANCAISE et la version ARABE d'un MEME communiqué de presse. Ta tache est de repérer les ECARTS entre les deux versions, c'est-à-dire les points où elles ne disent pas la même chose. Tu ne corriges PAS les fautes internes d'une version : tu compares les deux.

POINTS A VERIFIER (consignes de cohérence bilingue) :
${compareConsignes}

CE QU'IL FAUT SIGNALER :
- Chiffres différents entre FR et AR : montants de capital, parts, numéros de registre du commerce. (Les POURCENTAGES sont déjà vérifiés automatiquement par ailleurs ; inutile de les signaler ici, sauf s'ils sont liés à un autre écart.)
- Qualification de l'opération différente (contrôle exclusif vs conjoint, création d'entreprise commune).
- Terminologie incohérente avec les glossaires ci-dessus (un terme traduit autrement que la correspondance officielle).
- Toute information présente dans une version et absente de l'autre.

CE QU'IL NE FAUT PAS SIGNALER :
- Les différences de FORMAT des références légales : la loi s'écrit « 104-12 » en français et « 104.12 » en arabe, le décret « 2-14-652 » puis « 2.14.652 ». Ce sont des conventions de langue, pas des écarts.
- Les simples différences de tournure ou de style propres à chaque langue.
- Les DATES de publication et de clôture des observations : elles sont déjà vérifiées automatiquement par ailleurs.

Renseigne ton résultat avec l'outil rapport_ecarts.`;

  const user = `VERSION FRANCAISE :\n${fr}\n\nVERSION ARABE :\n${ar}`;
  return { system, user };
}

function mergeDedup(deterministic, claudeList) {
  const norm = s => String(s || '').replace(/[\u00a0\s]+/g, ' ').trim().toLowerCase();
  const seen = new Set();
  const out = [];
  const all = deterministic.concat(Array.isArray(claudeList) ? claudeList : []);
  for (const d of all) {
    if (!d) continue;
    const key = norm(d.category) + '|' + norm(d.fr) + '|' + norm(d.ar);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  if (!requireAppPassword(req, res)) return;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Configuration serveur incomplète : ANTHROPIC_API_KEY manquante côté Vercel." });
  }

  const body = req.body || {};
  const { textFr, textAr, consignes } = body;
  if (!textFr || typeof textFr !== 'string' || !textAr || typeof textAr !== 'string') {
    return res.status(400).json({ error: "Les deux textes (textFr et textAr) sont requis." });
  }

  const deterministic = comparePercents(textFr, textAr).concat(compareDates(textFr, textAr));
  const { system, user } = buildPrompt({ textFr, textAr, consignes });

  try {
    const parsed = await callStructured({ apiKey, system, user, tool: COMPARE_TOOL, maxTokens: MAX_TOKENS });
    const discrepancies = mergeDedup(deterministic, parsed.discrepancies || []);
    return res.status(200).json({
      discrepancies,
      summary: parsed.summary || '',
      deterministic: deterministic.length,
    });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}

export { normalizeDigits, extractPercents, comparePercents, digitSig, compareDates, buildPrompt };
