// lib/anthropic.js
// Appel unique au modèle Claude pour toute la plateforme, cote SERVEUR.
//
//  - Modèle centralisé (variable ANTHROPIC_MODEL possible pour en changer sans
//    toucher au code).
//  - Sortie STRUCTURÉE : le modèle remplit obligatoirement un outil dont le
//    schéma JSON est imposé. Fin des « Réponse du modèle illisible ».
//  - Partie fixe du prompt (règles + consignes) mise en cache : analyses
//    successives plus rapides et moins coûteuses.
//  - Relance automatique sur les erreurs passagères (surcharge, réseau) et sur
//    une réponse tronquée (limite de longueur relevée).

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 504, 529]);
const MAX_ATTEMPTS = 2;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Filet de sécurité : JSON éventuellement entouré de texte.
function extractJson(text) {
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s < 0 || e <= s) return null;
  try { return JSON.parse(text.slice(s, e + 1)); } catch { return null; }
}

function httpError(message, status) { const e = new Error(message); e.status = status; return e; }

/**
 * @param {object} p
 * @param {string} p.apiKey
 * @param {string} p.system   partie fixe (mise en cache)
 * @param {string} p.user     partie variable (le document)
 * @param {{name:string, description:string, input_schema:object}} p.tool
 * @param {number} [p.maxTokens]
 * @returns {Promise<object>} l'objet conforme au schéma de l'outil
 */
export async function callStructured({ apiKey, system, user, tool, maxTokens = 8000 }) {
  let withTemperature = true;
  let tokens = maxTokens;
  let lastError = 'Réponse du modèle illisible.';
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    const body = {
      model: MODEL,
      max_tokens: tokens,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [{ role: 'user', content: user }],
    };
    if (withTemperature) body.temperature = 0;

    let r;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      lastError = 'Service du modèle injoignable : ' + e.message;
      attempt++; if (attempt < MAX_ATTEMPTS) await sleep(1500);
      continue;
    }

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      const msg = (err.error && err.error.message) || `Anthropic HTTP ${r.status}`;
      // Certains modèles récents refusent le réglage de température : on le retire sans compter d'essai.
      if (r.status === 400 && withTemperature && /temperature/i.test(msg)) { withTemperature = false; continue; }
      if (RETRYABLE.has(r.status)) {
        lastError = r.status === 529 || r.status === 503 ? 'Le modèle est momentanément surchargé, réessayez dans un instant.' : msg;
        attempt++; if (attempt < MAX_ATTEMPTS) await sleep(2000);
        continue;
      }
      throw httpError(msg, 502);
    }

    const data = await r.json();
    const blocks = Array.isArray(data.content) ? data.content : [];
    const truncated = data.stop_reason === 'max_tokens';
    const use = blocks.find(b => b.type === 'tool_use' && b.name === tool.name);
    if (!truncated && use && use.input && typeof use.input === 'object') return use.input;

    const fromText = extractJson(blocks.filter(b => b.type === 'text').map(b => b.text).join(''));
    if (!truncated && fromText) return fromText;

    // Réponse tronquée : on relance avec une limite doublée.
    lastError = truncated ? 'Réponse du modèle tronquée (document très long).' : 'Réponse du modèle illisible.';
    if (truncated) tokens = Math.min(tokens * 2, 32000);
    attempt++;
  }
  throw httpError(lastError, 502);
}
