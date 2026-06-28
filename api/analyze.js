// api/analyze.js
// Analyse d'un document via Claude, cote SERVEUR.
// Remplace l'appel direct a api.anthropic.com qui exposait la cle dans le navigateur.
// La cle ANTHROPIC_API_KEY ne quitte jamais le serveur ; le prompt est construit ici.

import { requireAppPassword } from '../lib/auth.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MODEL = 'claude-opus-4-5';      // identifiant centralise (a revoir en phase finitions)
const MAX_TOKENS = 4000;
const MAX_DOC_CHARS = 30000;

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
    .filter(c => c && c.active !== false && c.mode !== 'regex' &&
      (c.doctype === docType || c.doctype === 'bilingue' || c.doctype === 'tous'));

  // Met en forme une consigne avec son contenu COMPLET (texte + exemples).
  const fmt = c => {
    let s = `[${c.code}] ${c.label}\n${String(c.text || '').trim()}`;
    if (c.examples) s += `\nExemples : ${String(c.examples).trim()}`;
    return s;
  };
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

  const full = String(text || '');
  const doc = full.substring(0, MAX_DOC_CHARS);
  const truncated = full.length > MAX_DOC_CHARS ? '...[tronqué]' : '';

  return `Tu es un expert en correction de documents juridiques du Conseil de la Concurrence marocain.
Tu dois analyser le document et trouver TOUTES les erreurs présentes.

Type de document: ${docType}

${formeInstructions}
${fondInstructions}
${terminologieInstructions}

DOCUMENT À CORRIGER:
${doc}${truncated}

RÈGLES IMPORTANTES:
- Le champ "original" doit contenir EXACTEMENT le texte tel qu'il apparaît dans le document, mot pour mot
- Le document conserve les sauts de ligne entre les sections : le champ "original" doit être un extrait situé sur UNE SEULE ligne, jamais à cheval sur deux lignes
- Le champ "suggested" contient la correction
- Si un mot parasite est inséré dans un mot (ex: "dsdmet"), "original" = "dsdmet" et "suggested" = "met"
- Cherche TOUTES les occurrences de chaque type d'erreur dans tout le document
- Les corrections purement mécaniques (espaces de guillemets, accords simples, numéros de loi et de décret) sont déjà appliquées automatiquement par ailleurs : concentre-toi sur ce qui demande du jugement.
- Le champ "code" doit être EXACTEMENT l'un des codes de consignes listés plus haut (ex: F-03, D-04, T-01), ou vide. N'invente JAMAIS un code qui ne figure pas dans la liste fournie.
- Ne pas inventer des erreurs qui n'existent pas

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks:
{
  "corrections": [
    {
      "type": "forme|fond|terminologie|bilingue",
      "code": "F-01 ou vide si pas de consigne applicable",
      "original": "texte exact du document avec l'erreur",
      "suggested": "texte corrigé",
      "reason": "explication courte"
    }
  ],
  "synthese": "résumé de l'analyse en 2-3 phrases",
  "score": 7
}`;
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

function runRegexPass({ text, docType, consignes }) {
  const list = Array.isArray(consignes) ? consignes : [];
  const full = String(text || '');
  const out = [];
  for (const c of list) {
    if (!c || c.active === false) continue;
    if (!Array.isArray(c.regex) || !c.regex.length) continue;
    const applicable = c.doctype === docType || c.doctype === 'bilingue' || c.doctype === 'tous';
    if (!applicable) continue;
    const type = catToType(c.category);
    for (const p of c.regex) {
      if (!p || !p.find) continue;
      let gflags = p.flags || '';
      if (!gflags.includes('g')) gflags += 'g';
      const sflags = gflags.replace('g', '');
      let re, sre;
      try { re = new RegExp(p.find, gflags); sre = new RegExp(p.find, sflags); }
      catch (e) { continue; }
      const repl = p.replace != null ? p.replace : '';
      for (const m of full.matchAll(re)) {
        const matched = m[0];
        if (!matched) continue;
        const replaced = matched.replace(sre, repl);
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

// --- Vérifications structurelles déterministes propres aux décisions (decision_ar) ---
// Deux contrôles, validés sur le corpus des décisions exemplaires (zéro fausse alerte) :
//  1) la chronologie des étapes procédurales (clauses « وبعد ») doit être croissante ;
//  2) les sections présentes doivent apparaître dans l'ordre canonique.
// Ces contrôles SIGNALENT (warnings) sans corriger : une date hors séquence peut venir
// d'une date erronée ou d'un paragraphe déplacé, c'est au relecteur de trancher.

const GREG_MONTHS = { "يناير":1,"فبراير":2,"مارس":3,"أبريل":4,"ابريل":4,"ماي":5,"مايو":5,"يونيو":6,"يونيه":6,"يوليوز":7,"يوليو":7,"غشت":8,"شتنبر":9,"سبتمبر":9,"أكتوبر":10,"اكتوبر":10,"نونبر":11,"نوفمبر":11,"دجنبر":12,"ديسمبر":12 };
const GREG_MONTHS_RE = Object.keys(GREG_MONTHS).sort((a, b) => b.length - a.length).join('|');

function normArabicDigits(s) {
  let out = '';
  for (const ch of String(s)) {
    const o = ch.codePointAt(0);
    if (o >= 0x0660 && o <= 0x0669) out += String.fromCharCode(o - 0x0660 + 0x30);
    else if (o >= 0x06F0 && o <= 0x06F9) out += String.fromCharCode(o - 0x06F0 + 0x30);
    else out += ch;
  }
  return out;
}
function stripArabic(s) {
  return String(s).replace(/[\u0640\u064B-\u0652\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ');
}
function firstGregDate(s) {
  const m = normArabicDigits(s).match(new RegExp('(\\d{1,2})\\s+(' + GREG_MONTHS_RE + ')\\s+(\\d{4})'));
  if (!m) return null;
  return { key: (+m[3]) * 10000 + GREG_MONTHS[m[2]] * 100 + (+m[1]), label: m[1] + ' ' + m[2] + ' ' + m[3] };
}
function runDecisionChecks(text) {
  const warnings = [];
  const paras = String(text || '').split('\n').map(p => p.trim()).filter(Boolean);

  // 1) Chronologie des clauses « وبعد » avant le dispositif.
  const seq = [];
  for (const p of paras) {
    if (p.includes('قرر ما يلي')) break;
    const pn = stripArabic(p);
    if (pn.startsWith('وبعد') || pn.startsWith('بعد')) {
      const d = firstGregDate(p);
      if (d) seq.push(d);
    }
  }
  for (let i = 1; i < seq.length; i++) {
    if (seq[i].key < seq[i - 1].key) {
      warnings.push({ kind: 'chronologie', message: `Ordre chronologique rompu dans les visas : la date « ${seq[i].label} » apparaît après « ${seq[i - 1].label} » alors qu'elle lui est antérieure. Vérifier l'ordre des paragraphes ou la date.` });
    }
  }

  // 2) Ordre des sections présentes (on ne signale pas une section absente).
  const MARKERS = [['ouverture', 'ان مجلس المنافسة'], ['visas', 'بناء على'], ['considérants', 'وحيث'], ['dispositif', 'قرر ما يلي'], ['délibération', 'تم التداول']];
  const full = stripArabic(paras.join('\n'));
  const present = [];
  for (const [name, mk] of MARKERS) {
    const i = full.indexOf(stripArabic(mk));
    if (i >= 0) present.push({ name, i });
  }
  for (let i = 1; i < present.length; i++) {
    if (present[i].i < present[i - 1].i) {
      warnings.push({ kind: 'structure', message: `Ordre des sections inhabituel : « ${present[i].name} » apparaît avant « ${present[i - 1].name} ».` });
    }
  }

  // 3) Cohérence du numéro de dossier de notification (visas vs article premier).
  const nums = [];
  const normedFull = normArabicDigits(paras.join('\n'));
  const reNum = /عدد\s*(\d+)\s*\/\s*ع/g;
  let mm;
  while ((mm = reNum.exec(normedFull)) !== null) nums.push(mm[1]);
  const distinct = [...new Set(nums)];
  if (distinct.length > 1) {
    warnings.push({ kind: 'cohérence', message: `Numéro de dossier de notification incohérent : ${distinct.join(' / ')}. Il doit être identique dans les visas et dans l'article premier.` });
  }

  // 4) Conformité de structure de fond : présence des éléments attendus.
  // La dérogation (exception au titre de l'art. 14, 2e alinéa) suit une trame
  // allégée, sans définition de marché ni analyse concurrentielle.
  const hasM = (...alts) => alts.some(a => full.includes(stripArabic(a)));
  const need = (label, ok) => { if (!ok) warnings.push({ kind: 'conformité', message: `Élément de fond attendu absent : ${label}.` }); };
  const isDerog = hasM('الاستثناء') && hasM('الفقرة الثانية من المادة 14', 'الفقرة 2 من المادة 14');

  need("qualification au sens de l'article 11", hasM('المادة 11'));
  need("seuils de l'article 12", hasM('المادة 12'));
  if (isDerog) {
    need('autorisation à titre exceptionnel (art. 14, 2e alinéa)', hasM('بصفة استثنائية'));
  } else {
    need('définition du marché pertinent', hasM('السوق المعنية', 'الأسواق المعنية', 'تحديد السوق', 'تحديد الأسواق'));
    need('analyse des effets horizontaux', hasM('أفقي', 'الأفقية'));
    need('analyse des effets verticaux', hasM('عمودي', 'العمودية'));
    need('analyse des effets congloméraux', hasM('تكتل', 'التكتلية'));
  }
  need('dispositif — article premier (يستوفي الشروط القانونية)', hasM('يستوفي الشروط القانونية'));
  need('dispositif — article deux (يرخص مجلس المنافسة)', hasM('يرخص مجلس المنافسة'));

  return warnings;
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
  const { text, docType, opts, consignes } = body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: "Champ 'text' manquant ou invalide." });
  }

  const prompt = buildPrompt({ text, docType: docType || 'cp_fr', opts: opts || {}, consignes });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(502).json({ error: (err.error && err.error.message) || `Anthropic HTTP ${r.status}` });
    }

    const data = await r.json();
    const rawText = (data.content && data.content[0] && data.content[0].text) || '';
    const raw = rawText.trim().replace(/^```[\s\S]*?\n/, '').replace(/```[\s]*$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(502).json({ error: "Réponse du modèle illisible (JSON invalide)." });
    }

    // Passe regex deterministe + fusion avec les corrections de Claude.
    const regexCorr = runRegexPass({ text, docType: docType || 'cp_fr', consignes });
    const corrections = mergeDedup(regexCorr, parsed.corrections || []);

    // Vérifications structurelles déterministes, uniquement pour les décisions.
    const warnings = (docType === 'decision_ar') ? runDecisionChecks(text) : [];

    return res.status(200).json({
      corrections,
      synthese: parsed.synthese || '',
      score: parsed.score,
      deterministic: regexCorr.length,
      warnings,
    });
  } catch (e) {
    return res.status(500).json({ error: "Erreur lors de l'analyse : " + e.message });
  }
}

export { runRegexPass, leftAnchor, mergeDedup, catToType };
