// api/analyze.js — Vercel Serverless Function
// Appelé par le frontend pour analyser un document avec Claude

export default async function handler(req, res) {
  // CORS headers
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
    bilingue: 'document bilingue FR/AR relatif à une opération de concentration économique',
    decision_ar: 'قرار مجلس المنافسة بالعربية',
  }[docType] || 'document juridique';

  const consignesText = (consignes || [])
    .filter(c => c.doctype === docType || c.doctype === 'tous')
    .slice(0, 10)
    .map(c => `[${c.code}] ${c.label}: ${c.text.substring(0, 150)}`)
    .join('\n');

  const systemPrompt = `Tu es rapporteur expert au Conseil de la Concurrence du Maroc spécialisé en concentrations économiques.
Analyse ce ${typeLabel} et fournis des corrections précises basées sur ces consignes :

${consignesText}

Options actives : ${activeOpts || 'forme, fond, terminologie'}

INSTRUCTIONS :
- Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks
- Identifie entre 5 et 10 corrections pertinentes et réalistes
- Pour chaque correction, cite le code de consigne si applicable

Format JSON exact :
{
  "score": <1-10>,
  "synthese": "<2-3 phrases de synthèse>",
  "corrections": [
    {
      "type": "forme" | "fond" | "terminologie" | "bilingue",
      "code": "<code consigne ou vide>",
      "original": "<texte erroné extrait du document>",
      "suggested": "<texte corrigé>",
      "reason": "<explication courte>"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Analyse ce document :\n\n${text.substring(0, 4000)}` }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(500).json({ error: 'Erreur API Claude', detail: err });
    }

    const data = await response.json();
    const raw = data.content.map(c => c.text || '').join('');

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return res.status(500).json({ error: 'Réponse JSON invalide de Claude', raw });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
