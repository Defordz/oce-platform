// api/analyze.js — Vercel Serverless Function v2
// Corrections : consignes complètes, document complet, prompt structuré

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, docType, consignes, activeOpts } = req.body;

  if (!text) return res.status(400).json({ error: 'text requis' });

  // ── 1. LABEL DU TYPE DE DOCUMENT ──
  const typeLabel = {
    cp_fr: 'communiqué de presse en français relatif à une opération de concentration économique (OCE)',
    cp_ar: 'بلاغ صحفي بالعربية متعلق بعملية التركيز الاقتصادي',
    bilingue: 'document bilingue FR/AR relatif à une opération de concentration économique',
    decision_ar: 'قرار مجلس المنافسة بالعربية',
  }[docType] || 'document juridique';

  // ── 2. CONSIGNES COMPLÈTES — sans troncature, sans limite de nombre ──
  const relevantConsignes = (consignes || []).filter(
    c => c.doctype === docType || c.doctype === 'tous' || c.doctype === 'bilingue'
  );

  // Construire le bloc consignes avec texte complet + exemples
  const consignesBloc = relevantConsignes.map(c => {
    let bloc = `\n### [${c.code}] ${c.label} (${c.category})`;
    bloc += `\nRègle : ${c.text}`;
    if (c.examples) bloc += `\nExemples :\n${c.examples}`;
    if (c.notes) bloc += `\nSource : ${c.notes}`;
    return bloc;
  }).join('\n');

  // ── 3. OPTIONS ACTIVES ──
  const optsActives = activeOpts || 'forme, fond, terminologie';

  // ── 4. PROMPT STRUCTURÉ ET PRÉCIS ──
  const systemPrompt = `Tu es rapporteur senior au Conseil de la Concurrence du Maroc, expert en rédaction des communiqués d'opérations de concentration économique (OCE).

Ta mission : analyser ce ${typeLabel} et identifier toutes les corrections nécessaires en te basant STRICTEMENT sur les consignes ci-dessous.

## CONSIGNES DE CORRECTION APPLICABLES
${consignesBloc}

## OPTIONS ACTIVES
${optsActives}

## MÉTHODE D'ANALYSE
1. Lis le document en entier
2. Pour chaque consigne applicable, vérifie si le document la respecte
3. Si une consigne est violée, crée une correction
4. Cite TOUJOURS le code de consigne correspondant
5. L'original doit être du TEXTE EXACT extrait du document (pas une paraphrase)
6. La correction doit être le texte tel qu'il devrait apparaître

## FORMAT DE RÉPONSE
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires.

{
  "score": <entier 1-10 reflétant la qualité globale du document>,
  "synthese": "<2-3 phrases résumant les problèmes principaux et la conformité générale>",
  "corrections": [
    {
      "type": "forme" | "fond" | "terminologie" | "bilingue",
      "code": "<code consigne ex: F-01>",
      "original": "<texte exact extrait du document avec l'erreur>",
      "suggested": "<texte corrigé exact>",
      "reason": "<explication courte référençant la consigne>"
    }
  ]
}

IMPORTANT :
- Si le document respecte une consigne → ne pas créer de correction pour elle
- Si tu trouves une erreur non couverte par les consignes → type="forme" ou "fond" sans code
- Nombre de corrections : entre 0 (document parfait) et 15 maximum
- Score 10 = document parfaitement conforme, score 1 = nombreuses violations graves`;

  // ── 5. APPEL CLAUDE AVEC DOCUMENT COMPLET ──
  // Limite à 12000 caractères pour rester dans les limites raisonnables
  // (un CP complet fait ~3000-5000 caractères, donc 12000 couvre les cas bilingues)
  const documentTexte = text.length > 12000
    ? text.substring(0, 12000) + '\n\n[... document tronqué à 12000 caractères ...]'
    : text;

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
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Analyse ce document et fournis les corrections :\n\n${documentTexte}`
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      return res.status(500).json({
        error: 'Erreur API Claude',
        status: response.status,
        detail: err
      });
    }

    const data = await response.json();
    const raw = data.content.map(c => c.text || '').join('');

    let parsed;
    try {
      const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Raw:', raw.substring(0, 500));
      return res.status(500).json({
        error: 'Réponse JSON invalide de Claude',
        raw: raw.substring(0, 1000)
      });
    }

    // Valider et nettoyer la réponse
    if (!parsed.corrections) parsed.corrections = [];
    if (!parsed.score) parsed.score = 5;
    if (!parsed.synthese) parsed.synthese = 'Analyse complétée.';

    // Filtrer les corrections vides
    parsed.corrections = parsed.corrections.filter(
      c => c.original && c.suggested && c.original !== c.suggested
    );

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      error: 'Erreur serveur',
      detail: err.message
    });
  }
}
