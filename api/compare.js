// api/compare.js
// Comparaison BILINGUE FR/AR d'un meme communiqué, cote SERVEUR.
// Ne corrige pas un document : signale les ECARTS entre les deux versions.
// Meme modele de securite que /api/analyze : la cle reste cote serveur.

import { requireAppPassword } from '../lib/auth.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MODEL = 'claude-opus-4-5';
const MAX_TOKENS = 4000;
const MAX_DOC_CHARS = 15000;

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
    .filter(c => c.mode === 'compare' || c.doctype === 'bilingue')
    .map(c => `[${c.code}] ${c.label}\n${String(c.text || '')}`)
    .join('\n\n');

  const fr = String(textFr || '').substring(0, MAX_DOC_CHARS);
  const ar = String(textAr || '').substring(0, MAX_DOC_CHARS);

  return `Tu es un expert du Conseil de la Concurrence marocain. On te donne la version FRANCAISE et la version ARABE d'un MEME communiqué de presse. Ta tache est de repérer les ECARTS entre les deux versions, c'est-à-dire les points où elles ne disent pas la même chose. Tu ne corriges PAS les fautes internes d'une version : tu compares les deux.

POINTS A VERIFIER (consignes de cohérence bilingue) :
${compareConsignes}

CE QU'IL FAUT SIGNALER :
- Chiffres différents entre FR et AR : montants de capital, parts, numéros de registre du commerce. (Les POURCENTAGES sont déjà vérifiés automatiquement par ailleurs ; inutile de les signaler ici, sauf s'ils sont liés à un autre écart.)
- Date de clôture des observations différente entre FR et AR (compare jour, mois, année ; les noms de mois diffèrent selon la langue, c'est normal, compare la date réelle).
- Qualification de l'opération différente (contrôle exclusif vs conjoint, création d'entreprise commune).
- Terminologie incohérente avec les glossaires ci-dessus (un terme traduit autrement que la correspondance officielle).
- Toute information présente dans une version et absente de l'autre.

CE QU'IL NE FAUT PAS SIGNALER :
- Les différences de FORMAT des références légales : la loi s'écrit « 104-12 » en français et « 104.12 » en arabe, le décret « 2-14-652 » puis « 2.14.652 ». Ce sont des conventions de langue, pas des écarts.
- Les simples différences de tournure ou de style propres à chaque langue.

VERSION FRANCAISE :
${fr}

VERSION ARABE :
${ar}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "discrepancies": [
    {
      "category": "chiffre|date|qualification|terminologie|autre",
      "fr": "ce que dit la version française",
      "ar": "ce que dit la version arabe",
      "note": "explication courte de l'écart",
      "severity": "haute|moyenne|basse"
    }
  ],
  "summary": "synthèse de la cohérence bilingue en 2-3 phrases"
}`;
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

  const detPercents = comparePercents(textFr, textAr);
  const prompt = buildPrompt({ textFr, textAr, consignes });

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

    const discrepancies = mergeDedup(detPercents, parsed.discrepancies || []);

    return res.status(200).json({
      discrepancies,
      summary: parsed.summary || '',
      deterministic: detPercents.length,
    });
  } catch (e) {
    return res.status(500).json({ error: "Erreur lors de la comparaison : " + e.message });
  }
}

export { normalizeDigits, extractPercents, comparePercents, digitSig };
