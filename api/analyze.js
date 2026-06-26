// api/analyze.js
// Analyse d'un document via Claude, cote SERVEUR.
// Remplace l'appel direct a api.anthropic.com qui exposait la cle dans le navigateur.
// La cle ANTHROPIC_API_KEY ne quitte jamais le serveur ; le prompt est construit ici.

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MODEL = 'claude-opus-4-5';      // identifiant centralise (a revoir en phase finitions)
const MAX_TOKENS = 4000;
const MAX_DOC_CHARS = 12000;

function setCors(res) {
  // CORS restreint au domaine de production (ALLOWED_ORIGIN), jamais '*'.
  if (ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function buildPrompt({ text, docType, opts, consignes }) {
  const consignesText = (Array.isArray(consignes) ? consignes : [])
    .filter(c => c.doctype === docType || c.doctype === 'bilingue' || c.doctype === 'tous')
    .map(c => `[${c.code}] ${c.label}: ${String(c.text || '').substring(0, 150)}`)
    .join('\n');

  const formeInstructions = opts && opts.forme ? `
CORRECTIONS DE FORME (OBLIGATOIRE - cherche toutes les erreurs suivantes):
- Fautes d'orthographe: mots mal écrits, lettres manquantes ou en trop (ex: "dsd", "pds" insérés dans les mots)
- Mots parasites insérés dans d'autres mots (ex: "dsdmet" → "met", "pdsour" → "pour", "indstéressés" → "intéressés")
- Erreurs de frappe évidentes
- Problèmes de typographie (guillemets, espaces)
- Majuscules manquantes ou incorrectes
` : '';

  const fondInstructions = opts && opts.fond ? `
CORRECTIONS DE FOND (OBLIGATOIRE - cherche toutes les erreurs suivantes):
- Formulations juridiques incorrectes selon la loi n°104-12
- Structure du document non conforme
- Qualifications juridiques erronées (ex: "opération de projet de concentration" → "opération de concentration")
- Références légales incorrectes
- Incohérences dans la désignation des parties
` : '';

  const terminologieInstructions = opts && opts.terminologie ? `
TERMINOLOGIE (cherche les termes non conformes):
${consignesText}
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

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

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

    return res.status(200).json({
      corrections,
      synthese: parsed.synthese || '',
      score: parsed.score,
      deterministic: regexCorr.length,
    });
  } catch (e) {
    return res.status(500).json({ error: "Erreur lors de l'analyse : " + e.message });
  }
}

export { runRegexPass, leftAnchor, mergeDedup, catToType };
