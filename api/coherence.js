// api/coherence.js
// Rapports d'instruction : relecture de COHÉRENCE du document entier.
// Priorité aux contradictions majeures de faits et aux erreurs de chiffres ;
// les renvois inexacts et les omissions importantes sont relevés aussi, en
// nombre limité et en une phrase simple qui oriente le lecteur. Le modèle rend,
// pour chaque observation, l'extrait exact où l'ancrer. Les observations deviennent des
// commentaires Word ; le texte n'est jamais modifié par cette relecture.

import { requireAppPassword } from '../lib/auth.js';
import { callStructured } from '../lib/anthropic.js';
import { realignOriginal, NOTE_PSEUDONYMES } from './analyze.js';

export const config = { maxDuration: 300 };

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MAX_CHARS = 400000;      // environ 100 000 mots
const MAX_OBS = 20;
const MAX_PAR_TYPE = { renvoi: 5, omission: 5 };

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
            categorie: { type: 'string', enum: ['contradiction', 'chiffres', 'renvoi', 'omission'] },
            gravite: { type: 'string', enum: ['importante', 'a_verifier'], description: "« importante » : contradiction certaine qui rend le rapport faux ; « a_verifier » : écart de faible portée, contradiction probable, renvoi ou omission." },
            extrait: { type: 'string', description: 'Passage EXACT du rapport, mot pour mot, pris dans UN SEUL paragraphe (20 à 200 caractères), sur lequel ancrer le commentaire.' },
            extrait_lie: { type: 'string', description: "Le passage avec lequel le premier est en contradiction, mot pour mot (s'il y en a un), sinon chaîne vide." },
            observation: { type: 'string', description: "Le constat, en français : une ou deux phrases pour une contradiction ou un chiffre ; UNE phrase simple pour un renvoi ou une omission. Pas de reformulation proposée." },
          },
          required: ['categorie', 'gravite', 'extrait', 'extrait_lie', 'observation'],
        },
      },
      synthese: { type: 'string', description: 'Appréciation générale de la cohérence du rapport, en 2 ou 3 phrases.' },
    },
    required: ['observations', 'synthese'],
  },
};

export const SYSTEM = `Tu relis, pour le Conseil de la concurrence du Maroc, un RAPPORT D'INSTRUCTION relatif à une opération de concentration économique. Ta tâche principale : relever les CONTRADICTIONS MAJEURES DE FAITS et les ERREURS DE CHIFFRES, c'est-à-dire ce qui, laissé en l'état, rendrait le rapport faux. Accessoirement, tu signales les RENVOIS inexacts et les OMISSIONS importantes, brièvement.

Le rapport est rédigé en français. Ses notes de bas de page figurent à la fin, numérotées « (n) » : elles font partie du rapport et entrent dans la vérification.

Relève :
1. CONTRADICTIONS DE FAITS : deux passages du rapport qui affirment des faits incompatibles. Exemples : deux personnes ou deux sociétés différentes pour le même rôle (titulaire d'une marque, acquéreur, entité qui prend le contrôle) ; une opération décrite comme contrôle exclusif puis conjoint ; un marché dit national puis analysé comme régional ; deux dates différentes pour le même acte ; une absence de chevauchement affirmée puis des chevauchements analysés.
2. CHIFFRES : un même chiffre (chiffre d'affaires, part de marché, pourcentage de capital, prix, montant, nombre d'entités) qui diffère d'un passage à l'autre ; un total qui ne correspond pas à la somme de ses éléments ; des parts d'un même marché dont la somme dépasse 100 % ; une conversion ou un calcul de seuil (article 12) faux.

3. RENVOIS (au plus ${MAX_PAR_TYPE.renvoi}) : un renvoi interne qui ne tient pas : « ci-après » ou « ci-dessus » sans le développement annoncé, un tableau, une section, une note ou une annexe cités qui ne contiennent pas ce qui est annoncé.
4. OMISSIONS (au plus ${MAX_PAR_TYPE.omission}) : seulement une information indispensable à l'instruction qui manque dans le rapport (chiffre d'affaires ou actionnariat d'une partie, droit applicable ou immatriculation d'une société, délimitation d'un marché analysé, date d'un acte de la procédure).
Pour les renvois et les omissions : gravité « a_verifier » et une seule phrase simple qui oriente le lecteur, par exemple « Le développement annoncé ci-après sur l'apport de la marque n'a pas été retrouvé. » ou « Le chiffre d'affaires de la cible au Maroc pour 2024 n'est pas indiqué. ». Pas d'explication ni de recommandation.

Ne relève PAS : les questions laissées ouvertes, les imprécisions, le sommaire (contrôlé par ailleurs), le style, la langue, l'appréciation concurrentielle elle-même. Une contradiction probable mais pas certaine (par exemple deux prénoms différents pour ce qui semble être la même personne, dans le même rôle) se relève en « a_verifier » : ne la passe pas sous silence.

Méthode :
- Lis tout le rapport avant de conclure. Ne t'appuie que sur le texte du rapport.
- Une observation par problème. Au plus ${MAX_OBS} observations : d'abord les contradictions et les chiffres, les plus graves en tête, puis les renvois et les omissions ; zéro si le rapport est cohérent.
- Pour une omission, « extrait » est le passage où l'information aurait dû figurer (recopié exactement) et « extrait_lie » une chaîne vide.
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
    const parType = {};
    const observations = (Array.isArray(out.observations) ? out.observations : [])
      .filter(o => o && o.observation && o.extrait)
      .filter(o => { const max = MAX_PAR_TYPE[o.categorie]; parType[o.categorie] = (parType[o.categorie] || 0) + 1; return !max || parType[o.categorie] <= max; })
      .slice(0, MAX_OBS)
      .map(o => {
        const extrait = realignOriginal(text, String(o.extrait).trim());
        const lie = o.extrait_lie ? realignOriginal(text, String(o.extrait_lie).trim()) : '';
        return { categorie: o.categorie || 'autre', gravite: o.gravite === 'importante' ? 'importante' : 'a_verifier', extrait, extrait_lie: lie, observation: String(o.observation).trim(), localise: text.includes(extrait) };
      });
    // Contradictions et chiffres d'abord (les plus graves en tête), puis renvois et omissions.
    const ordre = { importante: 0, a_verifier: 1 }, rang = { contradiction: 0, chiffres: 0, renvoi: 1, omission: 2 };
    observations.sort((a, b) => (rang[a.categorie] ?? 0) - (rang[b.categorie] ?? 0) || ordre[a.gravite] - ordre[b.gravite]);
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
