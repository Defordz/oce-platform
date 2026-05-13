// api/chat-consigne.js
// Endpoint pour le chat de création de consignes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, existingCodes } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages requis' });

  const systemPrompt = `Tu es un expert en droit de la concurrence marocain et en expressions régulières JavaScript.
Tu aides un rapporteur du Conseil de la Concurrence à créer des consignes de correction pour les communiqués relatifs aux opérations de concentration économique (loi n°104-12).

Quand l'utilisateur décrit une règle, génère une consigne structurée avec une regex JavaScript si applicable.

Réponds TOUJOURS avec ce bloc JSON entre les marqueurs, suivi d'une explication en français :

---CONSIGNE---
{
  "code": "<code proposé ex: F-14>",
  "doctype": "cp_fr",
  "category": "FORME",
  "label": "<intitulé court>",
  "text": "<description complète>",
  "examples": "<exemples incorrect → correct, un par ligne>",
  "regex": [
    {"find": "<pattern JS>", "replace": "<remplacement $1 $2>", "flags": "g", "label": "<description>"}
  ]
}
---FIN---

Puis donne une explication simple (2-3 phrases) et montre 3 tests sur des exemples réels de communiqués OCE.

Si la règle ne peut pas être automatisée par regex (règle de fond subjective), mets "regex": null.

Codes déjà utilisés à éviter : ${(existingCodes||[]).join(', ')}`;

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
        messages,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: 'Erreur API Claude', detail: err });
    }

    const data = await resp.json();
    const text = data.content?.map(c => c.text || '').join('') || '';
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
