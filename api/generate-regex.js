// api/generate-regex.js
// Claude génère une regex à partir d'une description en français naturel

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description, examples, doctype, category } = req.body;
  if (!description) return res.status(400).json({ error: 'description requise' });

  const systemPrompt = `Tu es un expert en expressions régulières (regex) spécialisé dans les documents juridiques marocains relatifs aux opérations de concentration économique (loi n°104-12).

Ton rôle : générer des regex JavaScript précises à partir d'une description en français naturel.

RÈGLES IMPORTANTES :
- Les regex doivent fonctionner sur du texte extrait de fichiers Word (.docx)
- Le texte peut contenir des caractères spéciaux : « » ' ' — – \u00A0 \u202F
- Utiliser des lookbehind/lookahead pour éviter les faux positifs
- Les groupes de capture utilisent la notation $1 $2 $3 (style JavaScript)
- Les flags possibles : g (global), i (insensible à la casse), gi (les deux)
- Générer des tests réalistes basés sur les documents du Conseil de la Concurrence

Réponds UNIQUEMENT en JSON valide sans markdown ni backticks.

Format exact :
{
  "regex": [
    {
      "find": "<pattern regex>",
      "replace": "<remplacement avec $1 $2 etc>",
      "flags": "g" | "gi" | "i",
      "label": "<description courte de ce que fait ce pattern>"
    }
  ],
  "explication": "<explication en français de comment fonctionne la regex, 2-3 phrases>",
  "tests": [
    {
      "input": "<phrase type incorrecte tirée d'un vrai communiqué OCE>",
      "expected": "<phrase corrigée>",
      "passes": true
    },
    {
      "input": "<phrase correcte qui ne doit PAS être modifiée>",
      "expected": "<même phrase, inchangée>",
      "passes": true
    },
    {
      "input": "<autre cas d'erreur fréquent>",
      "expected": "<correction>",
      "passes": true
    }
  ],
  "avertissements": "<risques de faux positifs ou limitations, null si aucun>"
}

Note : si la règle nécessite plusieurs patterns (ex: guillemets ouvrants ET fermants), inclure plusieurs objets dans le tableau "regex".`;

  const userMsg = `Génère une regex pour la règle suivante :

Description : ${description}
${examples ? `Exemples fournis : ${examples}` : ''}
Type de document : ${doctype || 'cp_fr'}
Catégorie : ${category || 'FORME'}

Contexte : communiqués de presse du Conseil de la Concurrence du Maroc relatifs aux opérations de concentration économique.`;

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
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: 'Erreur API Claude', detail: err });
    }

    const data = await resp.json();
    const raw = data.content.map(c => c.text || '').join('');
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return res.status(500).json({ error: 'JSON invalide', raw });
    }

    // Valider les tests côté serveur
    if (parsed.regex && parsed.tests) {
      for (const test of parsed.tests) {
        try {
          let result = test.input;
          for (const pat of parsed.regex) {
            const flags = (pat.flags || 'g').includes('g') ? pat.flags : pat.flags + 'g';
            const re = new RegExp(pat.find, flags);
            result = result.replace(re, pat.replace.replace(/\$(\d+)/g, '\$$1'));
          }
          test.actual = result;
          test.passes = result === test.expected;
        } catch (e) {
          test.actual = 'ERREUR: ' + e.message;
          test.passes = false;
        }
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
