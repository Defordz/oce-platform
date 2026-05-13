// api/analyze.js — Passe 1 : Claude détecte les problèmes
// Passe 2 (application via regex) est dans App.jsx

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, docType, consignes, activeOpts } = req.body;
  if (!text) return res.status(400).json({ error: 'text requis' });

  const typeLabel = {
    cp_fr: 'communiqué de presse en français relatif à une opération de concentration économique',
    cp_ar: 'بلاغ صحفي بالعربية متعلق بعملية التركيز الاقتصادي',
    bilingue: 'document bilingue FR/AR',
    decision_ar: 'قرار مجلس المنافسة بالعربية',
  }[docType] || 'document juridique';

  const allConsignes = (consignes || []).filter(c => c.doctype === docType || c.doctype === 'tous');
  const withRegex    = allConsignes.filter(c => c.regex !== null && c.regex !== undefined);
  const withoutRegex = allConsignes.filter(c => c.regex === null || c.regex === undefined);

  const regexSummary = withRegex.map(c =>
    `[${c.code}] ${c.label} — application automatique par regex`
  ).join('\n');

  const claudeSummary = withoutRegex.map(c => {
    let e = `[${c.code}] ${c.label}: ${c.text}`;
    if (c.examples) e += `\n   Exemples: ${c.examples}`;
    return e;
  }).join('\n\n');

  const systemPrompt = `Tu es rapporteur expert au Conseil de la Concurrence du Maroc.
Analyse ce ${typeLabel}.

=== CONSIGNES AUTOMATIQUES (regex) — indiquer si applicable ===
${regexSummary || '(aucune)'}

=== CONSIGNES MANUELLES — fournir texte exact du document ===
${claudeSummary || '(aucune)'}

OPTIONS : ${activeOpts || 'forme, fond, terminologie'}

RÈGLES STRICTES :
- Consignes automatiques → type="regex_auto", original="" et suggested="" vides
- Consignes manuelles → original = texte EXACT du document avec 8-10 mots de contexte
- Réponds UNIQUEMENT en JSON valide sans markdown

Format :
{
  "score": <1-10>,
  "synthese": "<2-3 phrases>",
  "regex_applicable": ["F-12","F-13","D-05"],
  "corrections": [
    {"type":"regex_auto","code":"F-12","original":"","suggested":"","reason":"Guillemets sans espaces"},
    {"type":"fond","code":"D-07","original":"société anonyme au capital social","suggested":"société anonyme de droit marocain au capital social","reason":"Droit applicable manquant"}
  ]
}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Analyse:\n\n${text.substring(0, 5000)}` }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: 'Erreur API Claude', detail: err });
    }

    const data = await resp.json();
    const raw = data.content.map(c => c.text || '').join('');
    let parsed;
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
    catch { return res.status(500).json({ error: 'JSON invalide', raw }); }

    // Passer les consignes regex au frontend pour la Passe 2
    parsed.regexConsignes = withRegex;

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
