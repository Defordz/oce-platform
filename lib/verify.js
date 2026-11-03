// lib/verify.js
// Vérification EN LIGNE des dénominations officielles et des qualités des
// destinataires d'une lettre (règle LG-04), côté SERVEUR.
//
// Le modèle dispose de l'outil de recherche web de l'API Anthropic (limité à
// quelques recherches) et rend son résultat par un outil structuré. Chaque
// proposition de correction doit citer sa source ; sans source, rien n'est
// proposé. Les erreurs (recherche désactivée pour l'organisation, surcharge)
// ne bloquent jamais l'analyse principale : elles deviennent un avertissement.

import { MODEL } from './anthropic.js';

const MAX_SEARCHES = 3;
const MAX_ROUNDS = 4;          // relances sur « pause_turn »
const MAX_CHARS = 12000;

export const VERIFY_TOOL = {
  name: 'rapport_denominations',
  description: 'Renvoie le résultat de la vérification des dénominations et des qualités citées dans la lettre.',
  input_schema: {
    type: 'object',
    properties: {
      verifications: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            entite: { type: 'string', description: "L'entité ou la personne vérifiée (ex. « ministère de l'Économie et des Finances »)." },
            original: { type: 'string', description: 'Extrait EXACT de la lettre, mot pour mot, sur une seule ligne.' },
            statut: { type: 'string', enum: ['confirme', 'a_corriger', 'non_verifie'] },
            suggested: { type: 'string', description: "L'extrait corrigé (seulement si statut = a_corriger)." },
            explication: { type: 'string', description: 'Une phrase.' },
            source_url: { type: 'string', description: 'Adresse de la page consultée qui établit la forme officielle.' },
            source_titre: { type: 'string', description: 'Titre ou nom du site de la source.' },
          },
          required: ['entite', 'original', 'statut', 'explication'],
        },
      },
    },
    required: ['verifications'],
  },
};

function systemPrompt(lang) {
  return `Tu vérifies, pour le Conseil de la concurrence du Maroc, les DÉNOMINATIONS OFFICIELLES et les QUALITÉS citées dans une lettre ${lang === 'ar' ? 'en arabe' : 'en français'} : intitulé exact des ministères, administrations, établissements publics et organismes ; titre exact du destinataire (ex. « وزير … », « المدير العام … », « Directeur général … ») ; dénomination sociale des sociétés si elle est vérifiable.

Méthode :
- Ne vérifie que ce qui peut être faux : intitulés de ministères (ils changent avec les gouvernements), titres de responsables, noms d'organismes. Ne vérifie pas le Conseil de la concurrence lui-même.
- Fais au plus ${MAX_SEARCHES} recherches, en privilégiant les sources officielles marocaines (sites .gov.ma, maroc.ma, sgg.gov.ma, cg.gov.ma, sites des établissements) ; à défaut, la presse marocaine de référence.
- « a_corriger » seulement si une source consultée établit clairement la forme officielle ; donne alors l'extrait exact de la lettre (« original ») et sa forme corrigée (« suggested »), dans la langue de la lettre, avec l'adresse de la source.
- « confirme » si une source confirme la forme employée ; « non_verifie » si tu n'as pas trouvé de source fiable.
- N'invente jamais une dénomination ni une source.
Termine en appelant l'outil ${VERIFY_TOOL.name}.`;
}

function httpError(message, status) { const e = new Error(message); e.status = status; return e; }

/**
 * @returns {Promise<{verifications: object[], corrections: object[], warnings: object[]}>}
 */
export async function verifyEntities({ apiKey, text, docType, fetchImpl = fetch }) {
  const lang = docType === 'lettre_ar' ? 'ar' : 'fr';
  const doc = String(text || '').slice(0, MAX_CHARS);
  const messages = [{ role: 'user', content: `LETTRE À VÉRIFIER :\n${doc}` }];
  const tools = [
    { type: 'web_search_20250305', name: 'web_search', max_uses: MAX_SEARCHES, user_location: { type: 'approximate', country: 'MA', timezone: 'Africa/Casablanca' } },
    VERIFY_TOOL,
  ];
  let result = null;
  try {
    for (let round = 0; round < MAX_ROUNDS && !result; round++) {
      const r = await fetchImpl('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: MODEL, max_tokens: 4000, system: systemPrompt(lang), tools, tool_choice: { type: 'auto' }, messages }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw httpError((err.error && err.error.message) || `HTTP ${r.status}`, r.status);
      }
      const data = await r.json();
      const blocks = Array.isArray(data.content) ? data.content : [];
      const use = blocks.find(b => b.type === 'tool_use' && b.name === VERIFY_TOOL.name);
      if (use && use.input) { result = use.input; break; }
      if (data.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: blocks }); continue; }
      // Fin sans appel d'outil : on le demande explicitement une fois.
      messages.push({ role: 'assistant', content: blocks });
      messages.push({ role: 'user', content: `Rends maintenant ton résultat en appelant l'outil ${VERIFY_TOOL.name}.` });
    }
  } catch (e) {
    const off = /web search/i.test(e.message) && /not enabled|disabled/i.test(e.message);
    return {
      verifications: [], corrections: [],
      warnings: [{ kind: 'verification', message: off
        ? "Vérification en ligne indisponible : la recherche web n'est pas activée pour l'organisation dans la console Anthropic."
        : `Vérification en ligne des dénominations non effectuée (${e.message}).` }],
    };
  }

  const list = (result && Array.isArray(result.verifications)) ? result.verifications : [];
  const full = String(text || '');
  const verifications = [], corrections = [];
  for (const v of list) {
    if (!v || !v.entite) continue;
    const url = /^https?:\/\//.test(String(v.source_url || '')) ? v.source_url : '';
    const item = { entite: v.entite, statut: v.statut, explication: v.explication || '', source_url: url, source_titre: v.source_titre || '' };
    // Une correction n'est proposée que si l'extrait existe tel quel et qu'une source est citée.
    if (v.statut === 'a_corriger' && url && v.original && v.suggested && full.includes(v.original) && v.original !== v.suggested) {
      corrections.push({
        type: 'terminologie', code: 'LG-04', original: v.original, suggested: v.suggested,
        reason: `${v.explication || 'Dénomination officielle'} Source : ${v.source_titre ? v.source_titre + ', ' : ''}${url}`,
      });
    } else if (v.statut === 'a_corriger') {
      item.statut = 'non_verifie';
    }
    verifications.push(item);
  }
  return { verifications, corrections, warnings: [] };
}
