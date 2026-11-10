// api/analyze.js
// Analyse d'un document via Claude, cote SERVEUR.
// La cle ANTHROPIC_API_KEY ne quitte jamais le serveur ; le prompt est construit ici.
// Trois passes fusionnees : dates (deterministe), regex (deterministe), Claude (jugement).

import { requireAppPassword } from '../lib/auth.js';
import { callStructured } from '../lib/anthropic.js';
import { runDatePass } from '../lib/dates.js';
import { runLetterChecks, letterCorrections, letterAddressee, applyLetterFormulas } from '../lib/lettres.js';
import { verifyEntities } from '../lib/verify.js';
import { runDecisionChecks } from '../lib/decisions.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MAX_TOKENS = 16000;
const MAX_DOC_CHARS = 100000;

const TYPE_LABELS = {
  cp_fr: 'communiqué de presse en français',
  cp_ar: 'communiqué de presse en arabe (بلاغ)',
  decision_ar: 'décision du Conseil en arabe (قرار)',
  lettre_ar: 'lettre du Conseil en arabe (مراسلة)',
  lettre_fr: 'lettre du Conseil en français',
  bilingue: 'document bilingue',
};
const isLetter = t => /^lettre_/.test(String(t || ''));

// Consigne applicable a un type de document. Les lettres recoivent leurs
// consignes propres (lettre_fr / lettre_ar), les regles communes ('lettres')
// et les regles generales ('tous'), jamais les correspondances bilingues des
// communiques.
function appliesTo(c, docType) {
  if (!c) return false;
  if (c.doctype === docType || c.doctype === 'tous') return true;
  if (isLetter(docType)) return c.doctype === 'lettres';
  return c.doctype === 'bilingue';
}
const SCOPE_LABELS = {
  titre: 'le titre', resume: 'le résumé non confidentiel', rubriques: 'les rubriques du tableau',
  tableau: 'les rubriques du tableau', formules: "les formules d'ouverture", tout: 'tout le document',
};

// Outil impose au modele : sa reponse est toujours un objet conforme a ce schema.
const ANALYZE_TOOL = {
  name: 'rapport_corrections',
  description: 'Renvoie toutes les corrections relevées dans le document, une synthèse et une note.',
  input_schema: {
    type: 'object',
    properties: {
      corrections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['forme', 'fond', 'terminologie', 'bilingue'] },
            code: { type: 'string', description: "Code exact d'une consigne listée, ou chaîne vide." },
            original: { type: 'string', description: 'Extrait EXACT du document, mot pour mot, sur une seule ligne.' },
            suggested: { type: 'string', description: 'Le même extrait, corrigé.' },
            reason: { type: 'string', description: 'Explication courte.' },
          },
          required: ['type', 'code', 'original', 'suggested', 'reason'],
        },
      },
      synthese: { type: 'string', description: "Résumé de l'analyse en 2 ou 3 phrases." },
      score: { type: 'integer', minimum: 1, maximum: 10, description: 'Qualité du document, de 1 à 10.' },
    },
    required: ['corrections', 'synthese', 'score'],
  },
};

function setCors(res) {
  // CORS restreint au domaine de production (ALLOWED_ORIGIN), jamais '*'.
  if (ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-password');
}

function buildPrompt({ text, docType, opts, consignes }) {
  // Consignes applicables : actives, du bon type de document, et qui relevent
  // du JUGEMENT (mode 'claude' ou 'compare'). Les consignes 'regex' purement
  // mecaniques sont garanties par la passe deterministe, inutile de les
  // soumettre a Claude (ce qui creerait des doublons).
  const applicable = (Array.isArray(consignes) ? consignes : [])
    .filter(c => c && c.active !== false && c.mode !== 'regex' && appliesTo(c, docType));

  // Met en forme une consigne avec son contenu COMPLET (texte, perimetre, exemples).
  const fmt = c => {
    let s = `[${c.code}] ${c.label}\n${String(c.text || '').trim()}`;
    const scope = Array.isArray(c.scope) ? c.scope.filter(x => x && x !== 'tout') : [];
    if (scope.length) s += `\nPérimètre : uniquement ${scope.map(x => SCOPE_LABELS[x] || x).join(' et ')}.`;
    if (c.examples) s += `\nExemples : ${String(c.examples).trim()}`;
    return s;
  };
  // Regles automatiques actives : rappelees au modele pour qu'il ne les contredise pas.
  const rulesC = (Array.isArray(consignes) ? consignes : [])
    .filter(c => c && c.active !== false && Array.isArray(c.regex) && c.regex.length && c.mode === 'regex' && appliesTo(c, docType))
    .map(c => `- [${c.code}] ${c.label} : ${String(c.text || '').trim()}`).join('\n');
  const cat = k => String(k || '').toUpperCase();
  const formeC = applicable.filter(c => cat(c.category) === 'FORME').map(fmt).join('\n\n');
  const fondC = applicable.filter(c => cat(c.category) === 'FOND').map(fmt).join('\n\n');
  const termC = applicable.filter(c => cat(c.category) === 'TERMINOLOGIE' || cat(c.category) === 'BILINGUE').map(fmt).join('\n\n');

  const formeInstructions = opts && opts.forme ? `
CORRECTIONS DE FORME (orthographe, frappe, typographie, accords, majuscules) :
- Fautes d'orthographe, lettres manquantes ou en trop, mots parasites insérés dans un mot (ex: "dsdmet" → "met").
- Erreurs de frappe, problèmes de typographie (guillemets, espaces), majuscules manquantes ou incorrectes.
${formeC ? `\nConsignes de forme applicables :\n${formeC}\n` : ''}` : '';

  const fondInstructions = opts && opts.fond ? `
CORRECTIONS DE FOND (formulations juridiques, structure, qualification) selon la loi n°104-12 :
- Qualifications juridiques erronées, références légales incorrectes, désignation des parties, structure non conforme.
${fondC ? `\nConsignes de fond applicables :\n${fondC}\n` : ''}` : '';

  const terminologieInstructions = opts && opts.terminologie && termC ? `
TERMINOLOGIE CONSACRÉE (termes et correspondances officiels à respecter) :
${termC}
` : '';

  const structureDecision = `REPÈRES DE STRUCTURE D'UNE DÉCISION (pour le périmètre des consignes) :
- TITRE : « قرار مجلس المنافسة عدد …/ق/… », « الصادر بتاريخ … », puis l'objet « والمتعلق بـ… ».
- OUVERTURE : « إن مجلس المنافسة؛ ».
- VISAS : paragraphes « بناء على … ؛ » et « وبعد … ؛ » (textes, réunion, quorum, dossier de notification, désignation du rapporteur, notification à l'autorité gouvernementale, publication du communiqué, complétude du dossier, présentation du rapport).
- CONSIDÉRANTS : paragraphes « وحيث … ؛ » (article 13, articles 11 et 12, qualification, seuils, parties, objectifs, marchés concernés, effets horizontaux, verticaux et congloméraux, conclusion).
- DISPOSITIF : « قرر ما يلي: », « المادة الأولى », « المادة الثانية ».
- DÉLIBÉRATION : « تم التداول بشأن هذا القرار … », puis les signatures.
Une consigne qui précise un périmètre ne s'applique QUE dans ce périmètre.`;
  const structure = docType === 'decision_ar' ? structureDecision : isLetter(docType) ? `REPÈRES DE STRUCTURE D'UNE LETTRE (pour le périmètre des consignes) :
- DESTINATAIRE : qualité, entité et ville du destinataire, en tête de lettre (« الفاضل المحترم / السيد وزير … / - الرباط - » ; « À l'attention de Maître … »).
- RUBRIQUES : « الموضوع » / « المرجع » / « المرفقات » (« Objet » / « Référence » / « P.J. »).
- OUVERTURE : « سلام تام بوجود مولانا الإمام، » puis « وبعد، » (lettre arabe) ; l'appel (« Maître, », « Madame la Ministre, ») dans une lettre française.
- CORPS : contexte, fondement juridique, demande, modalités (date, heure, lieu, délai, adresse électronique).
- CLÔTURE : la formule de politesse finale.
Une consigne qui précise un périmètre ne s'applique QUE dans ce périmètre.` : `REPÈRES DE STRUCTURE (pour le périmètre des consignes) :
- TITRE : le texte qui précède la formule d'ouverture (« Conformément à l'article 13… » ou « طبقا للمادة 13… »).
- RUBRIQUES DU TABLEAU : « Noms des entreprises et groupes concernés », « L'acquéreur », « La cible », « Nature de l'opération », « Secteurs économiques concernés », « Délai… », et leurs équivalents arabes.
- RÉSUMÉ NON CONFIDENTIEL : de « RÉSUMÉ NON CONFIDENTIEL DE L'OPÉRATION FOURNI PAR LES PARTIES » (« ملخص غير سري للعملية مسلم من قبل الأطراف ») jusqu'à « Fait à Rabat » (« حرر في الرباط »).
Une consigne qui précise un périmètre ne s'applique QUE dans ce périmètre.`;
  const datesRule = isLetter(docType)
    ? `- Les DATES de la lettre (jour de la semaine, jours fériés, délai de convocation, délai de réponse, chronologie des courriers et décisions cités) sont contrôlées automatiquement par ailleurs : ne propose AUCUNE correction portant sur une date.
- Les dénominations officielles des entités et les qualités des destinataires sont vérifiées en ligne par ailleurs : ne corrige une dénomination que si l'erreur est manifeste dans le texte lui-même (grammaire, incohérence entre deux passages).`
    : docType === 'decision_ar'
    ? `- Sont contrôlés automatiquement par ailleurs, et ne doivent faire l'objet d'AUCUNE correction : les dates (hégire et grégorien) et leur chronologie, le numéro de la décision et celui du dossier, les numéros et dates des dahirs et des décrets, les noms des membres et des signataires.
- Ne modifie jamais une dénomination sociale, un nom propre, un chiffre ni une part de marché : signale seulement une différence entre deux passages du même document.
- Le texte de la décision appartient à ses rédacteurs : ne reformule pas l'analyse concurrentielle, ne corrige que les erreurs. Les formules de référence des consignes servent à repérer un mot manquant ou une erreur : ne remplace jamais une tournure correcte par une variante équivalente.
- Ne propose aucune correction dans les lignes de signature qui suivent le paragraphe « تم التداول » (les espaces multiples y servent à la mise en page).`
    : `- Les DATES de publication et de clôture des observations sont vérifiées et corrigées automatiquement par ailleurs : ne propose AUCUNE correction portant sur ces dates.`;

  // Partie FIXE (identique d'une analyse a l'autre pour un meme type) : mise en cache.
  const system = `Tu es un expert en correction de documents juridiques du Conseil de la concurrence du Maroc (loi n°104-12 relative à la liberté des prix et de la concurrence).
Tu analyses un document et tu relèves TOUTES les erreurs qu'il contient, en appliquant strictement les consignes ci-dessous.

Type de document : ${TYPE_LABELS[docType] || docType}

${structure}
${formeInstructions}${fondInstructions}${terminologieInstructions}
RÈGLES IMPORTANTES :
- "original" contient EXACTEMENT le texte tel qu'il apparaît dans le document, mot pour mot, sur UNE SEULE ligne (jamais à cheval sur deux lignes).
- "suggested" contient le même extrait, corrigé.
- Si un mot parasite est inséré dans un mot (ex: "dsdmet"), "original" = "dsdmet" et "suggested" = "met".
- Relève TOUTES les occurrences de chaque type d'erreur dans tout le document.
- Les corrections purement mécaniques (espaces de guillemets, accords simples, numéros de loi et de décret, noms de pays des adresses) sont déjà appliquées automatiquement par ailleurs : concentre-toi sur ce qui demande du jugement.
- Les formes fixées par les règles automatiques ci-dessous font foi, même si une autre forme te paraît plus correcte : ne propose JAMAIS de les modifier ni d'y revenir.${rulesC ? `\n${rulesC}` : ''}
${datesRule}
- "code" est EXACTEMENT l'un des codes de consignes listés plus haut (ex: F-03, D-04, T-01), ou une chaîne vide. N'invente JAMAIS un code.
- N'invente pas d'erreur : en cas de doute, ne corrige pas.
- Renseigne ton résultat avec l'outil rapport_corrections : synthèse en 2 ou 3 phrases et note de 1 à 10.`;

  const full = String(text || '');
  const doc = full.substring(0, MAX_DOC_CHARS);
  const truncated = full.length > MAX_DOC_CHARS ? '\n...[tronqué]' : '';
  const user = `DOCUMENT À CORRIGER :\n${doc}${truncated}`;

  return { system, user };
}

// ----------------------------------------------------------------------------
// PASSE REGEX (deterministe)
// Applique les consignes qui portent un tableau "regex" sur le texte extrait,
// et produit des corrections au MEME format que celles de Claude.
// ----------------------------------------------------------------------------

function catToType(cat) {
  switch (String(cat || '').toUpperCase()) {
    case 'FOND': return 'fond';
    case 'TERMINOLOGIE': return 'terminologie';
    case 'BILINGUE': return 'bilingue';
    default: return 'forme';
  }
}

// Etend la correction vers la GAUCHE juste assez pour que "original" soit UNIQUE
// dans le texte (donc unique aussi dans n'importe quel paragraphe), ce qui permet
// au moteur (qui cherche la 1re occurrence par paragraphe) de localiser CHAQUE
// occurrence. On ne traverse jamais un saut de ligne (donc jamais un paragraphe).
// Exemple : cinq "... Ltd.»" deviennent "Alpha Ltd.»", "Beta Ltd.»", etc.
function leftAnchor(text, s, matched) {
  const occ = sub => {
    let n = 0, i = 0;
    while ((i = text.indexOf(sub, i)) !== -1) { n++; i += sub.length || 1; }
    return n;
  };
  if (occ(matched) <= 1) return s;            // deja unique sans contexte
  const MAX_BACK = 60;
  let li = s;
  while (li > 0 && (s - li) < MAX_BACK) {
    const ch = text[li - 1];
    if (ch === '\n' || ch === '\r') break;    // ne pas franchir un paragraphe
    li--;
    if (occ(text.slice(li, s) + matched) <= 1) break;
  }
  return li;
}

// Construit le remplacement a partir des groupes de la correspondance trouvee
// dans le TEXTE COMPLET (et non en reappliquant la regex sur l'extrait seul,
// ce qui perdait le contexte des lookbehind et ignorait silencieusement la regle).
function expandReplacement(repl, m) {
  return String(repl).replace(/\$(\$|&|<([^>]+)>|\d{1,2})/g, (tok, k, name) => {
    if (k === '$') return '$';
    if (k === '&') return m[0];
    if (name !== undefined) return (m.groups && m.groups[name] != null) ? m.groups[name] : '';
    const n = +k;
    if (n > 0 && n < m.length) return m[n] != null ? m[n] : '';
    if (k.length === 2) { const n1 = +k[0]; if (n1 > 0 && n1 < m.length) return (m[n1] != null ? m[n1] : '') + k[1]; }
    return tok;
  });
}

function runRegexPass({ text, docType, consignes }) {
  const list = Array.isArray(consignes) ? consignes : [];
  const full = String(text || '');
  const out = [];
  for (const c of list) {
    if (!c || c.active === false) continue;
    if (!Array.isArray(c.regex) || !c.regex.length) continue;
    if (!appliesTo(c, docType)) continue;
    const type = catToType(c.category);
    for (const p of c.regex) {
      if (!p || !p.find) continue;
      let gflags = p.flags || '';
      if (!gflags.includes('g')) gflags += 'g';
      let re;
      try { re = new RegExp(p.find, gflags); }
      catch (e) { continue; }
      const repl = p.replace != null ? p.replace : '';
      for (const m of full.matchAll(re)) {
        const matched = m[0];
        if (!matched) continue;
        const replaced = expandReplacement(repl, m);
        if (replaced === matched) continue;
        const s = m.index;
        const li = leftAnchor(full, s, matched);
        const left = full.slice(li, s);
        out.push({
          type,
          code: c.code || '',
          original: left + matched,
          suggested: left + replaced,
          reason: (p.label || 'correction déterministe') + ' [regex ' + (c.code || '') + ']',
          deterministic: true,
        });
      }
    }
  }
  return out;
}

// Applique les regles automatiques (consignes regex actives) a un texte libre.
function applyRules(str, docType, consignes) {
  let out = String(str || '');
  for (const c of (Array.isArray(consignes) ? consignes : [])) {
    if (!c || c.active === false || !Array.isArray(c.regex) || !c.regex.length) continue;
    if (!appliesTo(c, docType)) continue;
    for (const p of c.regex) {
      if (!p || !p.find) continue;
      let flags = p.flags || ''; if (!flags.includes('g')) flags += 'g';
      let re; try { re = new RegExp(p.find, flags); } catch (e) { continue; }
      const repl = p.replace != null ? p.replace : '';
      out = out.replace(re, (...a) => {
        const named = typeof a[a.length - 1] === 'object' && a[a.length - 1] !== null ? a[a.length - 1] : undefined;
        const m = a.slice(0, a.length - (named ? 3 : 2)); m.groups = named;
        return expandReplacement(repl, m);
      });
    }
  }
  return out;
}

// Les suggestions du modele ne peuvent jamais contredire une regle automatique :
// chaque suggestion est harmonisee avec ces regles (ex. « ذات مسؤولية محدودة »
// ramene a « ذات المسؤولية المحدودة », « prise du contrôle » a « prise de
// contrôle ») ; celle qui ne change plus rien est ecartee.
function harmonizeWithRules(claudeCorr, docType, consignes) {
  const norm = s => String(s || '').replace(/[\u00a0\s]+/g, ' ').trim();
  const out = [];
  for (const c of (Array.isArray(claudeCorr) ? claudeCorr : [])) {
    if (!c || !c.original) continue;
    const suggested = applyRules(c.suggested, docType, consignes);
    if (norm(suggested) === norm(c.original)) continue;
    out.push(suggested === c.suggested ? c : { ...c, suggested });
  }
  return out;
}

// Fusionne regex (en premier, car garanties) puis Claude, en retirant les
// doublons exacts. Les chevauchements de plage sont geres en aval par le moteur.
function mergeDedup(regexCorr, claudeCorr) {
  const norm = s => String(s || '')
    .replace(/[\u00a0\s]+/g, ' ')
    .replace(/[\u2019\u02bc\uff07\u2018]/g, "'")
    .trim();
  const seen = new Set();
  const out = [];
  const all = regexCorr.concat(Array.isArray(claudeCorr) ? claudeCorr : []);
  for (const c of all) {
    if (!c || !c.original) continue;
    const key = norm(c.original) + '=>' + norm(c.suggested);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
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
  const { text, opts, consignes, dates, envoi } = body;
  const verifierEnLigne = isLetter(body.docType) && body.verifierEnLigne !== false;
  const docType = body.docType || 'cp_fr';
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: "Champ 'text' manquant ou invalide." });
  }

  const built = buildPrompt({ text, docType, opts: opts || {}, consignes });
  const system = built.system;
  let user = built.user;
  const destinataire = ['public', 'autre'].includes(body.destinataire) ? body.destinataire : undefined;
  if (docType === 'lettre_ar') {
    const cat = letterAddressee(text, destinataire).cat;
    if (cat) user = `CATÉGORIE DU DESTINATAIRE (déterminée par ailleurs) : ${cat === 'public' ? "ministre ou dirigeant d'une administration ou d'un établissement public" : 'autre destinataire (société, association, avocat, personne physique)'}. Les formules d'en-tête, d'information et de demande propres à cette catégorie sont corrigées automatiquement : n'y touche pas.\n\n${user}`;
  }

  try {
    // Analyse principale et, pour les lettres, vérification en ligne des
    // dénominations, menées en parallèle.
    const [parsed, verif] = await Promise.all([
      callStructured({ apiKey, system, user, tool: ANALYZE_TOOL, maxTokens: MAX_TOKENS }),
      verifierEnLigne ? verifyEntities({ apiKey, text, docType, envoi }) : Promise.resolve(null),
    ]);

    // Passes deterministes (dates puis regex), prioritaires sur Claude, puis fusion.
    const datePass = runDatePass({ text, docType, dates });
    const regexCorr = runRegexPass({ text, docType, consignes });
    // Protocole des lettres (en-tête et clôture d'un ministre) ; une correction
    // sourcée de la vérification en ligne portant sur l'en-tête y est fusionnée.
    const verifCorr = verif ? verif.corrections : [];
    const proto = isLetter(docType) ? letterCorrections({ text, docType, verifCorrections: verifCorr, destinataire }) : { corrections: [], merged: new Set(), warnings: [] };
    const deterministic = proto.corrections.concat(datePass.corrections, regexCorr);
    const exclusive = proto.corrections.filter(c => c.exclusive);
    const aligne = c => { const sug = applyLetterFormulas(c.suggested, proto.categorie); return sug === c.suggested ? c : { ...c, suggested: sug }; };
    const touchesExclusive = c => exclusive.some(d => d.original.includes(c.original) || c.original.includes(d.original));
    const claudeCorr = harmonizeWithRules((parsed.corrections || []).concat(verifCorr.filter((_, k) => !proto.merged.has(k))), docType, consignes)
      .filter(c => !touchesExclusive(c)).map(aligne).filter(c => c.suggested.replace(/\s+/g, ' ').trim() !== c.original.replace(/\s+/g, ' ').trim());
    // Décisions : le bloc des signatures (après « تم التداول ») n'est jamais retouché.
    let kept = claudeCorr;
    if (docType === 'decision_ar') {
      const iD = text.lastIndexOf('تم التداول');
      const fin = iD >= 0 ? text.indexOf('\n', iD) : -1;
      if (fin >= 0) kept = claudeCorr.filter(c => { const i = text.indexOf(c.original); return i < 0 || i < fin; });
    }
    const corrections = mergeDedup(deterministic, kept);

    // Verifications structurelles : decisions, lettres, et coherence des dates des communiques.
    const warnings = ((docType === 'decision_ar') ? runDecisionChecks(text) : [])
      .concat(isLetter(docType) ? runLetterChecks({ text, docType, envoi }).warnings : [])
      .concat(proto.warnings || [])
      .concat(datePass.warnings)
      .concat(verif ? verif.warnings : []);

    return res.status(200).json({
      corrections,
      synthese: parsed.synthese || '',
      score: parsed.score,
      deterministic: deterministic.length,
      warnings,
      verifications: verif ? verif.verifications : [],
      categorie: proto.categorie || null,
    });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}

export { runDecisionChecks };
export { runRegexPass, leftAnchor, mergeDedup, catToType, buildPrompt, expandReplacement, applyRules, harmonizeWithRules, appliesTo };
