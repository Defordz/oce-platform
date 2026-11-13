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
// Certains modeles refusent d'imposer l'outil (tool_choice "tool"/"any") ou le
// reglage de temperature : on le memorise pour ne plus le tenter.
// Mémorisé PAR MODÈLE : un modèle peut accepter la température 0, un autre non.
const unsupportedBy = {};
const unsupportedFor = m => (unsupportedBy[m] = unsupportedBy[m] || { forcedTool: false, temperature: false });
// Modèles proposés à l'essai dans l'interface (choix limité à cette liste).
export const MODELES = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'];

// Tarifs en dollars par million de jetons (platform.claude.com, page « Pricing »,
// consultée le 13/11/2026) : entrée, sortie, écriture de cache (5 min), lecture de cache.
// Haiku 5.5 : tarif multiplié par cinq au-delà de 100 000 jetons d'entrée par requête.
const TARIFS = {
  'claude-opus-5-5': { in: 4, out: 20, cw: 5, cr: 0.2 },
  'claude-sonnet-5-5': { in: 2, out: 10, cw: 2.5, cr: 0.1 },
  'claude-haiku-5-5': { in: 0.1, out: 0.5, cw: 0.125, cr: 0.01, long: { seuil: 100000, in: 0.5, out: 2.5, cw: 0.625, cr: 0.05 } },
};
/** Coût en dollars d'un appel, d'après les jetons renvoyés par l'API. */
export function coutAppel(modele, u = {}) {
  const t0 = TARIFS[modele];
  if (!t0) return null;
  const entree = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
  const t = t0.long && entree > t0.long.seuil ? t0.long : t0;
  return ((u.input_tokens || 0) * t.in + (u.output_tokens || 0) * t.out + (u.cache_creation_input_tokens || 0) * t.cw + (u.cache_read_input_tokens || 0) * t.cr) / 1e6;
}
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
export async function callStructured({ apiKey, system, user, tool, maxTokens = 8000, model }) {
  const modele = model && MODELES.includes(model) ? model : MODEL;
  const unsupported = unsupportedFor(modele);
  let withTemperature = !unsupported.temperature;
  let forced = !unsupported.forcedTool;
  let tokens = maxTokens;
  let lastError = 'Réponse du modèle illisible.';
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    const body = {
      model: modele,
      max_tokens: tokens,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      tools: [tool],
      tool_choice: forced ? { type: 'tool', name: tool.name } : { type: 'auto' },
      messages: [{ role: 'user', content: forced ? user : `${user}\n\nRéponds uniquement en appelant l'outil ${tool.name}.` }],
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
      if (r.status === 400 && withTemperature && /temperature/i.test(msg)) { withTemperature = false; unsupported.temperature = true; continue; }
      if (r.status === 400 && forced && /tool_choice/i.test(msg)) { forced = false; unsupported.forcedTool = true; continue; }
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
    // _meta : modèle et température réellement appliqués, jetons consommés et coût.
    const u = data.usage || {};
    const meta = { modele, temperature: withTemperature ? 0 : null, jetons: { entree: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0), sortie: u.output_tokens || 0 }, cout: coutAppel(modele, u) };
    if (!truncated && use && use.input && typeof use.input === 'object') return Object.assign(use.input, { _meta: meta });

    const fromText = extractJson(blocks.filter(b => b.type === 'text').map(b => b.text).join(''));
    if (!truncated && fromText) return Object.assign(fromText, { _meta: meta });

    // Réponse tronquée : on relance avec une limite doublée.
    lastError = truncated ? 'Réponse du modèle tronquée (document très long).' : 'Réponse du modèle illisible.';
    if (truncated) tokens = Math.min(tokens * 2, 32000);
    attempt++;
  }
  throw httpError(lastError, 502);
}
