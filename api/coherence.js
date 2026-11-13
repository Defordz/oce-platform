// api/coherence.js
// Rapports d'instruction : relecture de COHÉRENCE du document entier.
// Le modèle relève les contradictions et incohérences (chiffres, parts de
// marché, dates, dénominations, qualification, conclusions, renvois) et rend,
// pour chacune, l'extrait exact où l'ancrer. Les observations deviennent des
// commentaires Word ; le texte n'est jamais modifié par cette relecture.

import { requireAppPassword } from '../lib/auth.js';
import { callStructured } from '../lib/anthropic.js';
import { realignOriginal } from './analyze.js';

export const config = { maxDuration: 300 };

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MAX_CHARS = 400000;      // environ 100 000 mots
const MAX_OBS = 30;

export const COHERENCE_TOOL = {
  name: 'rapport_coherence',
  description: "Renvoie les observations de cohérence relevées dans le rapport d'instruction.",
  input_schema: {
    type: 'object',
    properties: {
      observations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            categorie: { type: 'string', enum: ['contradiction', 'chiffres', 'dates', 'denominations', 'qualification', 'conclusion', 'renvois', 'autre'] },
            gravite: { type: 'string', enum: ['importante', 'a_verifier'], description: "« importante » : contradiction certaine ou erreur qui change le sens ; « a_verifier » : doute raisonnable." },
            extrait: { type: 'string', description: 'Passage EXACT du rapport, mot pour mot, pris dans UN SEUL paragraphe (20 à 200 caractères), sur lequel ancrer le commentaire.' },
            extrait_lie: { type: 'string', description: "Le passage avec lequel le premier est en contradiction, mot pour mot (s'il y en a un), sinon chaîne vide." },
            observation: { type: 'string', description: "Le constat, en français, en une à trois phrases : ce qui ne concorde pas et où. Pas de reformulation proposée." },
          },
          required: ['categorie', 'gravite', 'extrait', 'extrait_lie', 'observation'],
        },
      },
      synthese: { type: 'string', description: 'Appréciation générale de la cohérence du rapport, en 2 ou 3 phrases.' },
    },
    required: ['observations', 'synthese'],
  },
};

export const SYSTEM = `Tu relis, pour le Conseil de la concurrence du Maroc, un RAPPORT D'INSTRUCTION relatif à une opération de concentration économique (loi n° 104-12, décret n° 2-14-652). Ta seule tâche est de vérifier sa COHÉRENCE INTERNE. Tu ne corriges ni la langue ni le style : une autre relecture s'en charge.

Relève, en comparant les sections entre elles :
1. CONTRADICTIONS : deux passages qui affirment des choses incompatibles (une partie dit qu'il n'existe pas de chevauchement d'activités, une autre analyse des effets horizontaux ; un marché défini comme national puis analysé comme régional ; une opération décrite comme contrôle exclusif puis conjoint).
2. CHIFFRES : chiffres d'affaires, parts de marché, pourcentages de capital, montants, nombre d'entités ou de sites qui diffèrent d'une section à l'autre ; parts de marché d'un même marché dont la somme dépasse 100 % ; calcul des seuils de l'article 12 incohérent avec les chiffres donnés.
3. DATES : chronologie impossible (complétude avant notification, réunion avant désignation du rapporteur), dates différentes pour un même acte.
4. DÉNOMINATIONS : une même société ou un même marché désigné de façons différentes au point de créer une ambiguïté ; une partie citée qui n'est jamais présentée.
5. QUALIFICATION : nature de l'opération, contrôle acquis, parties notifiantes, incohérents entre la présentation, l'analyse et la conclusion.
6. CONCLUSION : conclusion ou proposition qui ne découle pas de l'analyse (analyse relevant un risque, conclusion à l'absence d'effet sans explication ; marché analysé mais absent de la conclusion, ou l'inverse).
7. RENVOIS : renvoi à une section, une annexe, un tableau ou un graphique qui n'existe pas dans le document.

Méthode :
- Lis tout le rapport avant de conclure. Ne signale que ce que le texte permet d'établir : pas d'hypothèse sur des faits extérieurs au document, pas d'avis sur le fond de l'analyse concurrentielle quand elle est cohérente.
- Une observation par problème, même s'il revient plusieurs fois (cite le premier passage et, dans l'observation, les autres endroits). Au plus ${MAX_OBS} observations, les plus importantes d'abord.
- « extrait » : recopie EXACTEMENT un passage du rapport (20 à 200 caractères, un seul paragraphe), sans corriger son orthographe ni sa ponctuation : il sert à placer le commentaire dans le fichier Word.
- Les montants s'écrivent en entier, sans abréviation (pas de « kMAD », « M MAD ») ni arrondi.
- S'il n'y a aucune incohérence, renvoie une liste vide et dis-le dans la synthèse.
Termine en appelant l'outil ${COHERENCE_TOOL.name}.`;

function setCors(res) {
  if (ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-password');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  if (!requireAppPassword(req, res)) return;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Configuration serveur incomplète : ANTHROPIC_API_KEY manquante côté Vercel.' });

  const full = String((req.body || {}).text || '');
  if (!full.trim()) return res.status(400).json({ error: 'Texte manquant.' });
  const text = full.slice(0, MAX_CHARS);
  const tronque = full.length > MAX_CHARS;

  try {
    const out = await callStructured({ apiKey, system: SYSTEM, user: `RAPPORT D'INSTRUCTION :\n${text}${tronque ? '\n...[fin tronquée]' : ''}`, tool: COHERENCE_TOOL, maxTokens: 12000 });
    const observations = (Array.isArray(out.observations) ? out.observations : [])
      .filter(o => o && o.observation && o.extrait)
      .slice(0, MAX_OBS)
      .map(o => {
        const extrait = realignOriginal(text, String(o.extrait).trim());
        const lie = o.extrait_lie ? realignOriginal(text, String(o.extrait_lie).trim()) : '';
        return { categorie: o.categorie || 'autre', gravite: o.gravite === 'importante' ? 'importante' : 'a_verifier', extrait, extrait_lie: lie, observation: String(o.observation).trim(), localise: text.includes(extrait) };
      });
    const ordre = { importante: 0, a_verifier: 1 };
    observations.sort((a, b) => ordre[a.gravite] - ordre[b.gravite]);
    return res.status(200).json({
      observations,
      synthese: out.synthese || '',
      appel: out._meta || null,
      avertissement: tronque ? `Rapport très long : seuls les ${MAX_CHARS.toLocaleString('fr-FR')} premiers caractères ont été relus pour la cohérence.` : '',
    });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}
