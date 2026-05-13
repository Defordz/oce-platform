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

  // Toutes les consignes du type concerné, texte complet
  const consignesFiltered = (consignes || [])
    .filter(c => c.doctype === docType || c.doctype === 'tous');

  const consignesText = consignesFiltered
    .map(c => {
      let entry = `[${c.code}] ${c.label}: ${c.text}`;
      if (c.examples) entry += `\n   Exemples: ${c.examples}`;
      return entry;
    })
    .join('\n\n');

  const systemPrompt = `Tu es rapporteur expert au Conseil de la Concurrence du Maroc spécialisé en concentrations économiques.

Analyse ce ${typeLabel} et applique TOUTES les consignes suivantes sans exception :

=== CONSIGNES OBLIGATOIRES (${consignesFiltered.length} consignes) ===
${consignesText}
=== FIN DES CONSIGNES ===

OPTIONS ACTIVES : ${activeOpts || 'forme, fond, terminologie'}

INSTRUCTIONS STRICTES :
- Vérifie le document par rapport à CHAQUE consigne listée ci-dessus
- Si une consigne s'applique au document, génère une correction même si l'erreur semble mineure
- Le champ "original" doit contenir le texte EXACT tel qu'il apparaît dans le document, en incluant suffisamment de contexte (5 à 10 mots autour de l'erreur) pour que le texte soit unique dans le document
- Ne jamais isoler juste un nom de société — toujours inclure les mots qui précèdent et suivent
- Exemple correct : "original": "de «Adeesy SARLAU» aux côtés" (avec contexte)
- Exemple incorrect : "original": "«Adeesy SARLAU»" (trop court, ambigu)
- Le champ "code" doit contenir le code de la consigne appliquée (ex: F-13)
- Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks

Format JSON exact :
{
  "score": <1-10>,
  "synthese": "<2-3 phrases de synthèse mentionnant les consignes appliquées>",
  "corrections": [
    {
      "type": "forme" | "fond" | "terminologie" | "bilingue",
      "code": "<code consigne obligatoire>",
      "original": "<texte exact extrait du document>",
      "suggested": "<texte corrigé>",
      "reason": "<explication courte citant la consigne>"
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
