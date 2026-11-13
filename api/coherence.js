// api/coherence.js
// Rapports d'instruction : relecture de COHÉRENCE du document entier.
// Recentrée (13/11/2026) sur les contradictions majeures de faits et les
// erreurs de chiffres, pour limiter le coût et le bruit ; le modèle rend,
// pour chacune, l'extrait exact où l'ancrer. Les observations deviennent des
// commentaires Word ; le texte n'est jamais modifié par cette relecture.

import { requireAppPassword } from '../lib/auth.js';
import { callStructured } from '../lib/anthropic.js';
import { realignOriginal, NOTE_PSEUDONYMES } from './analyze.js';

export const config = { maxDuration: 300 };

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MAX_CHARS = 400000;      // environ 100 000 mots
const MAX_OBS = 15;

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
            categorie: { type: 'string', enum: ['contradiction', 'chiffres'] },
            gravite: { type: 'string', enum: ['importante', 'a_verifier'], description: "« importante » : contradiction certaine qui rend le rapport faux ; « a_verifier » : écart certain mais de faible portée (arrondi, écart minime)." },
            extrait: { type: 'string', description: 'Passage EXACT du rapport, mot pour mot, pris dans UN SEUL paragraphe (20 à 200 caractères), sur lequel ancrer le commentaire.' },
            extrait_lie: { type: 'string', description: "Le passage avec lequel le premier est en contradiction, mot pour mot (s'il y en a un), sinon chaîne vide." },
            observation: { type: 'string', description: "Le constat, en français, en une ou deux phrases : ce qui ne concorde pas et où. Pas de reformulation proposée." },
          },
          required: ['categorie', 'gravite', 'extrait', 'extrait_lie', 'observation'],
        },
      },
      synthese: { type: 'string', description: 'Appréciation générale de la cohérence du rapport, en 2 ou 3 phrases.' },
    },
    required: ['observations', 'synthese'],
  },
};

export const SYSTEM = `Tu relis, pour le Conseil de la concurrence du Maroc, un RAPPORT D'INSTRUCTION relatif à une opération de concentration économique. Ta seule tâche : relever les CONTRADICTIONS MAJEURES DE FAITS et les ERREURS DE CHIFFRES, c'est-à-dire ce qui, laissé en l'état, rendrait le rapport faux.

Le rapport est rédigé en français. Ses notes de bas de page figurent à la fin, numérotées « (n) » : elles font partie du rapport et entrent dans la vérification.

Relève uniquement :
1. CONTRADICTIONS DE FAITS : deux passages du rapport qui affirment des faits incompatibles. Exemples : deux personnes ou deux sociétés différentes pour le même rôle (titulaire d'une marque, acquéreur, entité qui prend le contrôle) ; une opération décrite comme contrôle exclusif puis conjoint ; un marché dit national puis analysé comme régional ; deux dates différentes pour le même acte ; une absence de chevauchement affirmée puis des chevauchements analysés.
2. CHIFFRES : un même chiffre (chiffre d'affaires, part de marché, pourcentage de capital, prix, montant, nombre d'entités) qui diffère d'un passage à l'autre ; un total qui ne correspond pas à la somme de ses éléments ; des parts d'un même marché dont la somme dépasse 100 % ; une conversion ou un calcul de seuil (article 12) faux.

Ne relève PAS : les omissions (« le rapport ne précise pas… »), les questions laissées ouvertes, les imprécisions, la structure ou le sommaire, les renvois, le style, la langue, l'appréciation concurrentielle elle-même. Une contradiction probable mais pas certaine (par exemple deux prénoms différents pour ce qui semble être la même personne, dans le même rôle) se relève en « a_verifier » : ne la passe pas sous silence.

Méthode :
- Lis tout le rapport avant de conclure. Ne t'appuie que sur le texte du rapport.
- Une observation par problème. Au plus ${MAX_OBS} observations, les plus graves d'abord ; zéro si le rapport est cohérent.
- « extrait » : recopie EXACTEMENT un passage du rapport (20 à 200 caractères, un seul paragraphe), sans corriger son orthographe ni sa ponctuation : il sert à placer le commentaire dans le fichier Word. Pour une note de bas de page, recopie son texte sans le numéro « (n) ». « extrait_lie » : le passage contradictoire, recopié de la même façon.
- « observation » : une à deux phrases, factuelles. Les montants s'écrivent en entier, sans abréviation ni arrondi.
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
  const pseudonyme = !!(req.body || {}).pseudonyme;
  if (!full.trim()) return res.status(400).json({ error: 'Texte manquant.' });
  const text = full.slice(0, MAX_CHARS);
  const tronque = full.length > MAX_CHARS;

  try {
    const out = await callStructured({ apiKey, system: SYSTEM, user: `${pseudonyme ? NOTE_PSEUDONYMES + "\nDans « observation », désigne les sociétés et les personnes par leurs codes, crochets compris. Deux codes différents désignent deux noms différents : c'est ainsi que tu repères deux prénoms différents pour une même personne.\n\n" : ''}RAPPORT D'INSTRUCTION :\n${text}${tronque ? '\n...[fin tronquée]' : ''}`, tool: COHERENCE_TOOL, maxTokens: 12000 });
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
      cout: out._meta ? out._meta.cout : null,
      avertissement: tronque ? `Rapport très long : seuls les ${MAX_CHARS.toLocaleString('fr-FR')} premiers caractères ont été relus pour la cohérence.` : '',
    });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}
