// src/pseudonyme.js
// Pseudonymisation des rapports d'instruction AVANT tout envoi au modèle.
// Tout se passe dans le navigateur : seuls des codes ([SOC_1], [PERS_2]…)
// quittent le poste ; les vrais noms sont remis dans les corrections et les
// observations au retour, avant la production du fichier Word.
//
// Seuls les noms de SOCIÉTÉS et de PERSONNES sont remplacés. Le remplacement
// porte sur le mot distinctif, pas sur la dénomination complète : « le groupe
// Maphar », « Maphar SA » et « Maphar » deviennent « le groupe [SOC_1] »,
// « [SOC_1] SA » et « [SOC_1] ». Le modèle voit ainsi que c'est la même société ;
// les mots génériques (SA, Groupe, Holding, Maroc…) restent lisibles.
//
// Une autre graphie du même nom (« MEABAN » pour « Meaban ») reçoit un code
// dérivé ([SOC_2_2]) : le retour aux vrais noms est ainsi exact, caractère par
// caractère, ce qui permet d'appliquer les corrections dans le document d'origine.
// Fonctions pures : testables hors navigateur.

import { paraText } from './wordComments.js';

const L = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';
const RE_MOT = new RegExp(`[${L}]+`, 'g');
const MAJ = /^[A-ZÀ-ÖØ-ÞŒ]/;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Motif d'une dénomination en plusieurs mots : espaces ou traits d'union indifférents,
// accents ignorés (« Avant-Scène », « Avant Scène », « AVANT SCENE »).
const VARIANTES = { a: 'aàâä', c: 'cç', e: 'eéèêë', i: 'iîï', o: 'oôö', u: 'uùûü', y: 'yÿ' };
const BASE = {}; for (const [b, v] of Object.entries(VARIANTES)) for (const ch of v) BASE[ch] = v;
function motifSouple(p) {
  return String(p).trim().split(/[\s\u00a0\-‑]+/).map(w => [...w].map(ch => { const v = BASE[ch.toLowerCase()]; return v ? `[${v}]` : esc(ch); }).join('')).join('[\\s\\u00a0\\-‑]+');
}

export const TYPES = { SOC: 'Sociétés et groupes', PERS: 'Personnes', ADR: 'Adresses', ID: "Numéros d'immatriculation", NOM: 'Autres noms cochés' };

// Code tel qu'il circule : [SOC_1], [PERS_3], [NOM_2], variante [SOC_1_2].
// Au retour, on tolère un code sans crochets ou avec des espaces.
const RE_CODE = /\[\s*((?:SOC|PERS|NOM|ADR|ID)_\d+(?:_\d+)?)\s*\]|\b((?:SOC|PERS|NOM|ADR|ID)_\d+(?:_\d+)?)\b/g;

// Mots jamais remplacés : formes juridiques, mots génériques des dénominations,
// institutions, titres, structure du rapport, pays, sigles courants.
const FORMES = 'sa sas sasu sarl sarlau au sau snc sca scs scsp gie gmbh kg kgaa ltd limited llc llp lp gp inc corp plc bv nv ag spa se sl srl sci co cie ste sté aps as ab oy oyj asa pte pty bhd sdn ltda lda kft zrt sro bvba sprl sicav sicar raif fcp';
const GENERIQUES = `groupe group groupes holding holdings corporation company compagnie companies international internationale industries industrie
  industriel industriels industrielle services service solutions healthcare health pharma pharmaceutical pharmaceuticals pharmaceutique pharmaceutiques
  laboratoire laboratoires laboratories labs motors mobility automotive care distribution distributions trading invest investment investments capital
  partners partenaires associés associates associes consulting conseil conseils véhicules vehicules technologies technology systems global east middle
  north south west central afrique africa african maroc morocco moroccan marocain marocaine europe european france finance finances bank banque
  assurance assurances immobilier immobilière real estate energy énergie food foods agro développement development participations participation
  management fund fonds equity ventures logistics logistique transport transports retail market markets consumer products produits brands
  commerce commercial commerciale alimentaire alimentaires cosmétique cosmétiques promotion maghreb médical médicale medical santé beauté hygiène
  chimie chimique pharmacie pharmacies nationale national atlantique sud nord centre new nouvelle nouveaux import export
  bidco midco topco holdco newco finco propco acquisition acquisitions fund funds associates general partner investors investor
  anonyme mondial mondiale digital digitale agency agence events event événements évènements communication media médias concept production productions
  us uk usa united kingdom states america american denmark danish netherlands dutch germany german spain spanish italy italian ireland irish
  switzerland swiss belgium luxembourg asia pacific emea mena worldwide world`;
const INSTITUTIONS = `conseil concurrence commission permanente section ministère ministre ministres direction directeur directrice général générale généraux
  adjoint adjointe rapporteur rapporteure rapporteurs président présidente vice secrétariat secrétaire gouvernement royaume roi majesté état etat
  loi décret dahir arrêté code bulletin officiel tribunal cour internet impôts douanes trésor office agence autorité haut haute union européenne
  nations unies chambre registre ompic cnss dgi ammc anrt dmp cnops anam amo oms ocde omc bam bkam services instruction enquête
  monsieur madame mademoiselle maître mme mlle mm dr pr me m messieurs mesdames docteur professeur
  tableau tableaux figure graphique annexe annexes introduction conclusion conclusions sommaire référence références source sources note notes
  partie parties chapitre titre article articles page total opération opérations cible cibles acquéreur acquéreurs vendeur vendeurs cédant cédants
  notifiante projet accord contrat transaction société sociétés entreprise entreprises recommandation analyse rapport rapports décision avis
  i ii iii iv v vi vii viii ix x xi xii
  tva ht ttc mad dh dhs eur usd ue ca pdm pib ihh hhi atc
  janvier février mars avril mai juin juillet août septembre octobre novembre décembre
  japon chine inde espagne italie allemagne portugal belgique suisse luxembourg pays bas royaume uni uk usa états unis tunisie algérie égypte
  sénégal côte ivoire turquie émirats arabes arabie saoudite qatar canada brésil russie`;
const PARTICULES = 'de du des d la le les l et en el ben ibn bel ait aït van von di da del della der den y';
const STOP = new Set(`${FORMES} ${GENERIQUES} ${INSTITUTIONS} ${PARTICULES}`.split(/\s+/).filter(Boolean));
// Suggestions seulement : lieux et mots courants qui prennent souvent une majuscule
// (titres de colonnes, débuts de ligne). Une dénomination qui les contient reste repérée.
const LIEUX = new Set(`afrique asie europe amérique océanie danemark angleterre galles écosse irlande londres paris york delaware jersey guernesey
  amsterdam bruxelles genève zurich madrid barcelone milan rome lisbonne francfort munich berlin dubaï dubai abou dhabi doha riyad caire tunis alger
  dakar abidjan lagos nairobi johannesburg singapour hong kong tokyo pékin shanghai mumbai casablanca rabat tanger marrakech fès agadir kénitra
  mohammedia malaisie argentine australie costa rica macédoine serbie pakistan ukraine vietnam mexique chili colombie pérou indonésie thaïlande
  philippines corée nigeria kenya ghana grèce pologne roumanie hongrie autriche suède norvège finlande israël iran irak liban jordanie koweït
  bahreïn oman mauritanie mali niger tchad cameroun gabon congo angola madagascar maurice danois danoise américain américaine britannique
  allemand allemande français française italien italienne espagnol espagnole néerlandais néerlandaise luxembourgeois luxembourgeoise`.split(/\s+/).filter(Boolean));
const COURANTS = new Set(`pièce pièces suite street level stock partner pet animal world city french forfait forfaits régie plateforme organigramme
  schéma exercice montant activité activités secteur segment marché marchés produit ventes gamme gammes nature client clients fournisseur
  fournisseurs opérateur opérateurs part parts chiffre affaires importance catégorie catégories pays origine destination volume valeur`.split(/\s+/).filter(Boolean));
const RE_PARTICULE_MIN = new RegExp(`^(?:${PARTICULES.split(' ').join('|')})$`);
const SUFFIXES_FR = /(?:tions?|sions?|ments?|ités?|ages?|ances?|ences?|eurs?|euses?|iques?|ismes?|istes?|ées?|és?|ants?|antes?|aires?|oires?|ures?|ives?|ifs?|ibles?|ables?|eries?|iats?|ogies?|omies?|èmes?|aises?|elles?|ales|aux)$/;

// Mots distinctifs d'une dénomination ou d'un nom de personne.
function motsDistinctifs(nom) {
  return (String(nom).match(RE_MOT) || []).filter(w => w.length >= 2 && !STOP.has(w.toLowerCase()));
}

// Toutes les occurrences des mots du texte, une fois pour toutes.
function indexer(text) {
  const occ = new Map(); // forme -> [positions]
  for (const m of text.matchAll(RE_MOT)) {
    const w = m[0];
    if (!occ.has(w)) occ.set(w, []);
    occ.get(w).push(m.index);
  }
  return occ;
}

// La forme en minuscules n'est retenue que si elle n'apparaît que dans une
// adresse web ou électronique (www.maphar.ma, contact@maphar.ma).
function dansAdresse(text, i, n) {
  const avant = text.slice(Math.max(0, i - 2), i), apres = text.slice(i + n, i + n + 2);
  return /[A-Za-z0-9][.@/]$/.test(avant) || /^[.@/][A-Za-z0-9]/.test(apres);
}

const ABREV = /(?:^|[^A-Za-zÀ-ÿ])(?:M|MM|Mme|Mlle|Dr|Pr|Me|St|Ste|Cie|[A-Z])$/;
// Début de phrase ou de ligne : un mot capitalisé à cet endroit n'indique rien.
function enDebut(text, i) {
  let j = i - 1;
  while (j >= 0 && /[ \t  «"“(\[*•·\-–]/.test(text[j])) j--;
  if (j < 0) return true;
  const c = text[j];
  if (c === '\n' || c === '!' || c === '?' || c === '•') return true;
  if (c === '.') return !ABREV.test(text.slice(Math.max(0, j - 5), j));
  return false;
}

// Mots affichés en capitales par la mise en forme Word (petites capitales, majuscules)
// alors qu'ils sont tapés en minuscules : titres de rapport, pages de garde.
// Renvoie, pour chaque mot en minuscules, son nombre d'occurrences dans ces passages.
export function motsEnCapitales(documentXml, stylesXml) {
  const out = new Map();
  if (!documentXml) return out;
  const actif = x => /<w:(?:caps|smallCaps)\b(?![^>]*w:val="(?:false|0|off)")[^>]*\/>/.test(x || '');
  const stylesCaps = new Set();
  for (const m of String(stylesXml || '').matchAll(/<w:style\b[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g)) if (actif((/<w:rPr>[\s\S]*?<\/w:rPr>/.exec(m[2]) || [''])[0])) stylesCaps.add(m[1]);
  for (const p of documentXml.matchAll(/<w:p\b(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)) {
    const pPr = (/<w:pPr>[\s\S]*?<\/w:pPr>/.exec(p[0]) || [''])[0];
    const pCaps = stylesCaps.has((/<w:pStyle w:val="([^"]+)"/.exec(pPr) || [])[1]);
    // Les mots sont souvent coupés entre plusieurs passages (« mou » + « lay ») : on recolle
    // les passages en capitales qui se suivent avant de découper en mots.
    let texte = '';
    for (const r of p[0].matchAll(/<w:r\b(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g)) {
      const rPr = (/<w:rPr>[\s\S]*?<\/w:rPr>/.exec(r[1]) || [''])[0];
      const explicite = /<w:(?:caps|smallCaps)\b/.test(rPr);
      const caps = explicite ? actif(rPr) : (pCaps || stylesCaps.has((/<w:rStyle w:val="([^"]+)"/.exec(rPr) || [])[1]));
      texte += caps ? [...r[1].matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(m => m[1]).join('') : ' ';
    }
    for (const w of texte.match(RE_MOT) || []) if (w === w.toLowerCase()) out.set(w, (out.get(w) || 0) + 1);
  }
  return out;
}

/**
 * Repère les noms de sociétés et de personnes.
 * @returns {{entites: Array<{cle, type, libelle, formes:{forme:string,n:number}[], n:number, source:'ancre'|'personne'|'suggestion', coche:boolean, premier:number}>}}
 */
export function detecterNoms(text, { documentXml = null, stylesXml = null } = {}) {
  text = String(text || '');
  const occ = indexer(text);
  // Un mot en minuscules affiché en capitales (titre en petites capitales) n'est pas un
  // mot courant : « foxtrot » dans le titre est le nom « Foxtrot ».
  const capitales = motsEnCapitales(documentXml, stylesXml);
  const enCapitales = w => (capitales.get(w) || 0) >= (occ.get(w) || []).length;
  // (Une forme en minuscules qui n'apparaît que dans une adresse web, « www.maphar.ma », ne compte pas.)
  const minuscules = new Set([...occ].filter(([w, pos]) => w === w.toLowerCase() && !enCapitales(w) && pos.some(i => !dansAdresse(text, i, w.length))).map(([w]) => w));
  const ent = new Map(); // clé -> entité
  const ajouter = (mot, type, source) => {
    const cle = mot.toLowerCase();
    if (mot.length < 2 || STOP.has(cle) || ent.has(cle)) return; // premier type vu : personne, puis société
    ent.set(cle, { cle, type, source });
  };

  // 1. Personnes : civilité suivie du prénom et du nom.
  const nomPers = `(?:[A-ZÀ-ÖØ-ÞŒ][${L}'’-]*|(?:${PARTICULES.split(' ').join('|')})(?![${L}]))`;
  const rePers = new RegExp(`(?:^|[^${L}])(?:M\\.|MM\\.|Mme|Mmes|Mlle|Monsieur|Madame|Mademoiselle|Maître|Me|Dr|Pr)\\s+(${nomPers}(?:[ \\u00a0]+${nomPers}){0,4})`, 'gu');
  for (const m of text.matchAll(rePers)) {
    // On s'arrête au dernier mot capitalisé (« M. Le Feunteun était » : « était » est exclu par le motif).
    for (const w of motsDistinctifs(m[1])) if (MAJ.test(w)) ajouter(w, 'PERS', 'personne');
  }

  // 2. Sociétés désignées : « la société « X » », « le groupe X », « les sociétés « X », « Y » et « Z » ».
  const ANCRES_MIN = 'sociétés?|groupes?|filiales?|holdings?|cabinets?|laboratoires?|compagnies?|entreprises?|entités?|banques?|fonds|distributeurs?|fabricants?|fournisseurs?|concurrents?|grossistes?|actionnaires?|partenaires?|clients?|répartiteurs?|importateurs?|prestataires?';
  const ANCRES = ANCRES_MIN + '|' + ANCRES_MIN.split('|').map(a => a[0].toUpperCase() + a.slice(1)).join('|');
  // Dénomination entre guillemets : ses mots distinctifs ; à défaut (« Promotion Maghreb »,
  // nom fait de mots génériques), la dénomination entière, sans sa forme juridique.
  // Un mot qui existe aussi en minuscules dans le texte (« En », « Avant », « Nouvelle ») est
  // un mot courant : il n'est pas remplacé seul, sinon chaque « En outre » deviendrait un code.
  const distinctifs = n => motsDistinctifs(n).filter(w => MAJ.test(w) && !minuscules.has(w.toLowerCase()));
  const COMPOSE = new RegExp(`[A-ZÀ-ÖØ-ÞŒ][${L}]+(?:-[A-ZÀ-ÖØ-Þa-zà-ÿ][${L}]+)+`, 'gu');
  // Nom de société : un nom composé avec trait d'union (« Avant-Scène ») est remplacé en
  // entier et ses mots ne le sont pas isolément (« avant » reste un mot courant) ; les
  // autres mots distinctifs sont remplacés un à un. Renvoie vrai si un nom a été retenu.
  const nomSociete = n => {
    const composes = (String(n).match(COMPOSE) || []).filter(c => !(c.match(RE_MOT) || []).every(w => STOP.has(w.toLowerCase())));
    composes.forEach(c => { const cle = 'phrase:' + c.toLowerCase(); if (!ent.has(cle)) ent.set(cle, { cle, type: 'SOC', source: 'ancre', phrase: c }); });
    const reste = composes.reduce((x, c) => x.replace(c, ' '), String(n));
    const mots = distinctifs(reste);
    mots.forEach(w => ajouter(w, 'SOC', 'ancre'));
    return mots.length > 0 || composes.length > 0;
  };
  const denomination = n => {
    if (nomSociete(n)) return;
    // Dénomination faite de mots courants : on la remplace en entier, ou seulement son
    // nom composé (« La Nouvelle Société Avant-Scène SA » -> « Avant-Scène »).
    let p = String(n).replace(new RegExp(`[ \u00a0,]+(?:${FORMES.split(' ').join('|')})\\.?$`, 'i'), '').replace(/^(?:la|le|les|l['’])\s*/i, '').trim();
    const compose = p.match(new RegExp(`[A-ZÀ-ÖØ-ÞŒ][${L}]+(?:-[A-ZÀ-ÖØ-Þa-zà-ÿ][${L}]+)+`, 'u'));
    if (compose) p = compose[0];
    else if (!/\s/.test(p) || !(p.match(RE_MOT) || []).every(w => MAJ.test(w) || RE_PARTICULE_MIN.test(w))) return;
    if (p.length >= 4 && MAJ.test(p)) { const cle = 'phrase:' + p.toLowerCase(); if (!ent.has(cle)) ent.set(cle, { cle, type: 'SOC', source: 'ancre', phrase: p }); }
  };
  const reAncreG = new RegExp(`(?:^|[^${L}])(?:${ANCRES})[ \\u00a0]*«[ \\u00a0]*([^»\\n]{1,80}?)[ \\u00a0]*»((?:[ \\u00a0]*(?:,|et|ou)[ \\u00a0]*«[ \\u00a0]*[^»\\n]{1,80}?[ \\u00a0]*»)*)`, 'giu');
  for (const m of text.matchAll(reAncreG)) {
    const noms = [m[1], ...[...(m[2] || '').matchAll(/«[  ]*([^»\n]{1,80}?)[  ]*»/g)].map(x => x[1])];
    noms.forEach(denomination);
  }
  // « Laboratoires STAGMA », « Groupe Maphar » entre guillemets, sans mot d'annonce devant.
  const reGuillAncre = new RegExp(`«[ \\u00a0]*((?:${ANCRES_MIN.split('|').map(a => a[0].toUpperCase() + a.slice(1)).join('|')})[ \\u00a0][^»\\n]{1,70}?)[ \\u00a0]*»`, 'gu');
  for (const m of text.matchAll(reGuillAncre)) denomination(m[1]);
  const motMaj = `[A-ZÀ-ÖØ-ÞŒ][${L}'’&.-]*`;
  const reAncreN = new RegExp(`(?:^|[^${L}])(?:${ANCRES})[ \\u00a0]+(${motMaj}(?:[ \\u00a0]+(?:(?:&|et|de|du|des|e|y|und|and|of|di|del|della|van|von|der|für|for)[ \\u00a0]+)?${motMaj}){0,4})`, 'gu');
  for (const m of text.matchAll(reAncreN)) nomSociete(m[1]);

  // 3. Dénominations suivies d'une forme juridique : « Somapharma SARL », « CFAO Motors Maroc S.A. ».
  const reForme = new RegExp(`((?:${motMaj}[ \\u00a0]+(?:(?:&|et|de|du|des|e|y|und|and|of|di|del|della|van|von|der|für|for)[ \\u00a0]+)?){1,5})(?:S\\.?A\\.?S\\.?U?|S\\.?A\\.?R\\.?L\\.?(?:[ \\u00a0]?A\\.?U\\.?)?|SARLAU|S\\.A\\.|SA|SCA|SCSp|SCSP|SCS|SNC|GmbH|KG|Ltd|Limited|LLC|LLP|L\\.?P\\.|LP|Inc|Corporation|Corp|PLC|Plc|AG|ApS|A\\/S|AB|Oy|B\\.?V\\.?|N\\.?V\\.?|S\\.p\\.A\\.|SpA|S\\.r\\.l\\.|Srl|S\\.?à[ \\u00a0]?r\\.?l\\.?|Sàrl|Pte|Pty|Ltda)(?![${L}])`, 'gu');
  // (Un mot qui existe aussi en minuscules est un mot courant : « Ainsi », « Selon ».)
  for (const m of text.matchAll(reForme)) nomSociete(m[1]);

  // 4. Termes définis : « (ci-après « TTC ») ».
  const reDef = new RegExp(`ci-après(?:[ \\u00a0]+(?:dénommée?s?|désignée?s?|appelée?s?|ensemble))?[ \\u00a0]*,?[ \\u00a0]*(?:(?:la|le|les|l['’])[ \\u00a0]*)?«[ \\u00a0]*([^»\\n]{1,60}?)[ \\u00a0]*»`, 'giu');
  for (const m of text.matchAll(reDef)) motsDistinctifs(m[1]).forEach(w => { if (MAJ.test(w) && !minuscules.has(w.toLowerCase())) ajouter(w, 'SOC', 'ancre'); });
  // Sigle donné juste après une dénomination : « Commerce et Distribution… » (« CODIPAC »).
  const reSigle = /»[ \u00a0]*\([ \u00a0]*«[ \u00a0]*([^»\n]{2,40}?)[ \u00a0]*»[ \u00a0]*\)/gu;
  for (const m of text.matchAll(reSigle)) motsDistinctifs(m[1]).forEach(w => { if (MAJ.test(w) && !minuscules.has(w.toLowerCase())) ajouter(w, 'SOC', 'ancre'); });
  // Tableaux : colonne dont l'en-tête annonce des sociétés (« Société », « Client », « Fournisseur », « Opérateur »…).
  if (documentXml) {
    const ENTETE = /^(?:sociétés?|entreprises?|clients?|fournisseurs?|opérateurs?|concurrents?|groupes?|filiales?|participations?|dénominations?( sociales?)?|raison sociale|acquéreurs?|cibles?|actionnaires?|associés?|partenaires?|distributeurs?|laboratoires?|importateurs?|grossistes?|prestataires?|entités?|parties?( à l['’]opération)?|nom( de la société)?)$/i;
    const cellule = c => [...c.matchAll(/<w:p\b(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)].map(p => paraText(p[0])).join(' ').replace(/[\s\u00a0]+/g, ' ').trim();
    for (const t of documentXml.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>/g)) {
      const lignes = [...t[0].matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map(r => [...r[0].matchAll(/<w:tc\b[^>]*>[\s\S]*?<\/w:tc>/g)].map(c => cellule(c[0])));
      const k = lignes.length > 1 && lignes[0].length === 1 ? 1 : 0; // ligne de titre fusionnée au-dessus des en-têtes
      if (lignes.length < k + 2) continue;
      lignes[k].forEach((h, j) => {
        if (!ENTETE.test(h)) return;
        lignes.slice(k + 1).forEach(r => nomSociete(r[j] || ''));
      });
    }
  }

  // 5. Adresses et numéros d'immatriculation : remplacés en entier, tels qu'ils sont écrits.
  const zones = []; // passages couverts, pour ne pas en tirer de suggestions
  const literal = (type, t, i) => {
    t = t.replace(/[\s,]+$/, '');
    if (t.length < 3) return;
    zones.push([i, i + t.length]);
    const cle = type.toLowerCase() + ':' + t.toLowerCase();
    if (!ent.has(cle)) ent.set(cle, { cle, type, source: 'ancre', phrase: t });
  };
  const dansZone = i => zones.some(([a, b]) => i >= a && i < b);
  const NUM = `(?:[A-Z][ \\u00a0]?)?\\d[\\d \\u00a0.]*\\d|\\d`;
  const reRC = new RegExp(`(?:registre[ \\u00a0]+du[ \\u00a0]+commerce(?:[ \\u00a0]+et[ \\u00a0]+des[ \\u00a0]+sociétés)?(?:[ \\u00a0]+(?:de|d['’])[ \\u00a0]*[^\\s,;.]+(?:[ -][A-ZÀ-ÖØ-Þ][^\\s,;.]*)*)?|immatriculée?s?|constituée?s?[^.;\\n]{0,60}?)[ \\u00a0]+sous[ \\u00a0]+le[ \\u00a0]+(?:numéro|n°)(?:[ \\u00a0]+d['’](?:enregistrement|immatriculation))?[ \\u00a0]*(${NUM})|(?:numéro|n°)[ \\u00a0]+d['’](?:enregistrement|immatriculation)[ \\u00a0]*:?[ \\u00a0]*(${NUM})`, 'giu');
  const reIdent = new RegExp(`(?:[Ii]dentifiant[ \\u00a0]+[Cc]ommun[ \\u00a0]+de[ \\u00a0]+l['’][ \\u00a0]*[Ee]ntreprise(?:[ \\u00a0]*\\([ \\u00a0]*ICE[ \\u00a0]*\\))?|[Ii]dentifiant[ \\u00a0]+[Ff]iscal|[Pp]atente|[Tt]axe[ \\u00a0]+[Pp]rofessionnelle|(?<![${L}])(?:ICE|IF|CNSS|RCS|R\\.?C\\.?|SIREN|SIRET)(?![${L}]))[ \\u00a0]*(?:[A-ZÀ-ÖØ-Þ][${L}-]+[ \\u00a0]+)?(?:n°|N°|numéro|:)?[ \\u00a0]*:?[ \\u00a0]*(${NUM})`, 'gu');
  for (const re of [reRC, reIdent]) for (const m of text.matchAll(re)) {
    const num = m[1] || m[2];
    if (!num || /^\\d{4}$/.test(num.trim())) continue; // une année n'est pas un numéro d'immatriculation
    literal('ID', num, m.index + m[0].length - num.length);
  }
  // Adresse : numéro (ou kilomètre) et voie, puis code postal, quartier, ville.
  // Un mot de voie seul (« mise en place », « au cours de ») ne suffit pas : il faut
  // un numéro devant, ou un siège, une adresse, une domiciliation juste avant.
  const VOIE = 'rue|avenue|av\\.|boulevard|bd\\.?|bld\\.?|place|allée|impasse|route|chemin|quai|lotissement|lot\\.|zone|parc|quartier|hay|résidence|immeuble|angle|cité|square|cours|esplanade|technopole|technopark|B\\.?P\\.?|boîte postale';
  const reAdr = new RegExp(`(?<![${L}])((?:(?:n°|N°|numéros?|nos?\\.?)[ \\u00a0]*\\d+[A-Za-z]?(?:[ \\u00a0]*[-–/][ \\u00a0]*\\d+)?(?:[ \\u00a0]*(?:bis|ter))?[ \\u00a0]*,?[ \\u00a0]*|(?:kilomètre|km)[ \\u00a0]*\\d+(?:[,.]\\d+)?[ \\u00a0]+(?:(?:de|du|sur)[ \\u00a0]+(?:la[ \\u00a0]+|l['’])?)?|\\d+[A-Za-z]?(?:[ \\u00a0]*[-–/][ \\u00a0]*\\d+)?(?:[ \\u00a0]*(?:bis|ter))?[ \\u00a0]*,?[ \\u00a0]*)?)(?:${VOIE})(?![${L}])[^,;.\\n()«»]{0,70}?(?=[ \\u00a0]+à[ \\u00a0]|[,;.\\n()«»]|$)`, 'giu');
  const SEG = new RegExp(`^(?:,[ \\u00a0]*(?:\\d{4,5}[ \\u00a0]+[A-ZÀ-ÖØ-Þ][${L}'’ -]{1,40}?|(?:${VOIE})(?![${L}])[^,;.\\n()«»]{0,50}?|(?:à[ \\u00a0]+)?[A-ZÀ-ÖØ-Þ][${L}'’-]+(?:[ \\u00a0-][A-ZÀ-ÖØ-Þ][${L}'’-]+){0,3})|[ \\u00a0]+à[ \\u00a0]+[A-ZÀ-ÖØ-Þ][${L}'’-]+(?:[ \\u00a0-][A-ZÀ-ÖØ-Þ][${L}'’-]+){0,2})(?=[ \\u00a0]*(?:[,;.\\n()«»]|à[ \\u00a0]|$))`, 'u');
  const INTRO = /(?:siège|situé|située|situés|sis|sise|sises|domicili|adresse|établie?s?|implantée?s?)[^.;\n]{0,40}$/i;
  // Adresse annoncée (« dont le siège social est situé … ») : segment par segment, tant
  // que chacun commence par un chiffre, une majuscule ou un mot d'adresse ; on s'arrête
  // à « ; », à la fin de la phrase ou à une proposition (« , immatriculée », « , laquelle »).
  // Retenue seulement si elle comporte un numéro ou une voie (une ville seule n'est pas une adresse).
  const MOT_ADR = `n°|numéros?|nos?\\.?|${VOIE}|comté|county|étage|suite|level|bureau|bâtiment|tour|floor|street|road|drive|lane|avenue|way|pike|strasse|straße|platz|weg|gade|vej|via|calle`;
  const reIntro = /(?:siège(?:[ \u00a0]+social)?(?:[ \u00a0]+est)?(?:[ \u00a0]+(?:situé|établi|fixé)e?)?|(?:situé|sis|domicilié|établi|implanté)e?s?)[ \u00a0]+(?:(?:au|aux|à|en|dans)[ \u00a0]+(?:l['’][ \u00a0]*)?)?/giu;
  const DEBUT_SEG = new RegExp(`^(?:\\d|[A-ZÀ-ÖØ-Þ]|(?:${MOT_ADR})(?![${L}])|(?:au|aux|en)[ \\u00a0]+[A-ZÀ-ÖØ-Þ])`, 'u');
  const SEG_TXT = /^[^,;\n«»]{1,90}?(?=,|;|\n|$|\.(?:[ \u00a0]+[A-ZÀ-ÖØ-Þ]|[ \u00a0]*$|[ \u00a0]*\n))/u;
  const CLAUSE = /[ \u00a0](?:et|qui|dont|où|lequel|laquelle|lesquels|lesquelles|ainsi|soit|pour|avec)[ \u00a0]/;
  const ADR_OK = new RegExp(`\\d|(?:^|[^${L}])(?:${MOT_ADR})(?![${L}])`, 'iu');
  for (const m of text.matchAll(reIntro)) {
    const debut = m.index + m[0].length;
    let fin = debut, pos = debut, n = 0;
    while (n < 10) {
      const reste = text.slice(pos, pos + 120);
      if (!DEBUT_SEG.test(reste)) break;
      const sg = SEG_TXT.exec(reste);
      if (!sg) break;
      const c = CLAUSE.exec(sg[0]);
      const seg = c ? sg[0].slice(0, c.index) : sg[0];
      fin = pos + seg.replace(/[ \u00a0]+$/, '').length;
      n++;
      if (c) break;
      const suite = /^,[ \u00a0]*/.exec(text.slice(pos + sg[0].length));
      if (!suite) break;
      pos = pos + sg[0].length + suite[0].length;
    }
    const adr = text.slice(debut, fin);
    if (n && ADR_OK.test(adr) && adr.length >= 6) literal('ADR', adr, debut);
  }
  for (const m of text.matchAll(reAdr)) {
    if (dansZone(m.index)) continue;
    if (!m[1] && !INTRO.test(text.slice(Math.max(0, m.index - 60), m.index))) continue;
    let fin = m.index + m[0].length, k;
    for (k = 0; k < 6; k++) {
      const s2 = SEG.exec(text.slice(fin, fin + 120));
      if (!s2 || STOP.has(s2[0].replace(/^[, \u00a0]*(?:à[ \u00a0]+)?/, '').split(/[ \u00a0]/)[0].toLowerCase()) && !/^[, \u00a0]*\d/.test(s2[0]) && !new RegExp(`^[, \\u00a0]*(?:${VOIE})`, 'i').test(s2[0])) break;
      fin += s2[0].length;
    }
    literal('ADR', text.slice(m.index, fin), m.index);
  }

  // 6. Suggestions (décochées) : autres mots capitalisés jamais écrits en minuscules
  //    (concurrents des tableaux, mais aussi lieux et marques : à trier par l'utilisateur).
  for (const [w, tous] of occ) {
    const cle = w.toLowerCase();
    if (ent.has(cle) || !MAJ.test(w) || w.length < 3 || STOP.has(cle) || minuscules.has(cle)) continue;
    const pos = tous.filter(i => !dansZone(i)); // mots d'une adresse déjà remplacée : rien à suggérer
    if (!pos.length) continue;
    // Terminaisons de mots français courants (titres de colonnes, débuts de phrase).
    if (w !== w.toUpperCase() && SUFFIXES_FR.test(w)) continue;
    if (LIEUX.has(cle) || COURANTS.has(cle)) continue;
    // Un mot qui n'apparaît qu'en tête de phrase hors tableau est le plus souvent un mot courant.
    const milieu = pos.some(i => !enDebut(text, i));
    const ligneCourte = pos.some(i => { const a = text.lastIndexOf('\n', i) + 1, b = text.indexOf('\n', i); return (b < 0 ? text.length : b) - a <= 60; });
    if (milieu || ligneCourte) ent.set(cle, { cle, type: 'NOM', source: 'suggestion' });
  }

  // Formes et occurrences de chaque nom.
  const entites = [];
  for (const e of ent.values()) {
    const formes = [];
    if (e.phrase) {
      const vu = new Map();
      for (const m of text.matchAll(new RegExp(`(?<![${L}0-9_])${motifSouple(e.phrase)}(?![${L}0-9_])`, 'giu'))) {
        if (e.type === 'SOC' && m[0] === m[0].toLowerCase() && !(m[0].match(RE_MOT) || []).every(w => capitales.has(w))) continue;
        if (!vu.has(m[0])) vu.set(m[0], { forme: m[0], n: 0, premier: m.index });
        vu.get(m[0]).n++;
      }
      formes.push(...vu.values());
    } else for (const [w, pos] of occ) {
      if (w.toLowerCase() !== e.cle) continue;
      // Forme en minuscules : retenue dans une adresse web ou électronique, ou si elle
      // n'apparaît que dans des passages affichés en capitales.
      const n = (w === w.toLowerCase()) ? (enCapitales(w) ? pos.length : pos.filter(i => dansAdresse(text, i, w.length)).length) : pos.length;
      if (n) formes.push({ forme: w, n, premier: pos[0] });
    }
    if (!formes.length) continue;
    // Forme de référence : la plus fréquente ; à égalité, la graphie courante plutôt que les majuscules d'un titre.
    const toutMaj = f => (f.forme === f.forme.toUpperCase() && f.forme.length > 3 ? 1 : 0);
    formes.sort((a, b) => b.n - a.n || toutMaj(a) - toutMaj(b) || a.premier - b.premier);
    entites.push({ cle: e.cle, type: e.type, libelle: formes[0].forme, formes: formes.map(({ forme, n }) => ({ forme, n })), n: formes.reduce((s, f) => s + f.n, 0), source: e.source, coche: e.source !== 'suggestion', premier: Math.min(...formes.map(f => f.premier)) });
  }
  const ordreType = { SOC: 0, PERS: 1, ADR: 2, ID: 3, NOM: 4 };
  entites.sort((a, b) => ordreType[a.type] - ordreType[b.type] || b.n - a.n);
  return { entites };
}

/**
 * Table de correspondance à partir des noms cochés et des ajouts manuels.
 * @param {string} text
 * @param {Array} entites  sortie de detecterNoms (avec « coche » mis à jour)
 * @param {string[]} ajouts noms saisis par l'utilisateur
 * @returns {{paires: [string,string][], inverse: Map<string,string>, collision: boolean, nombre: number}}
 */
export function construireTable(text, entites, ajouts = []) {
  text = String(text || '');
  const retenues = (entites || []).filter(e => e.coche).map(e => ({ ...e }));
  // Ajouts manuels : mêmes règles que les dénominations (formes juridiques et mots génériques laissés en clair).
  const occ = indexer(text);
  const deja = new Set(retenues.map(e => e.cle));
  for (const a of ajouts || []) {
    const mots = motsDistinctifs(a);
    const liste = mots.length ? mots : (String(a).trim() ? [String(a).trim()] : []);
    for (const w of liste) {
      const cle = w.toLowerCase();
      if (deja.has(cle)) continue;
      deja.add(cle);
      const formes = [...occ].filter(([f]) => f.toLowerCase() === cle && f !== f.toLowerCase()).map(([forme, pos]) => ({ forme, n: pos.length, premier: pos[0] }));
      if (!formes.length && text.includes(w)) formes.push({ forme: w, n: text.split(w).length - 1, premier: text.indexOf(w) });
      if (formes.length) retenues.push({ cle, type: 'NOM', formes, premier: Math.min(...formes.map(f => f.premier)) });
    }
  }
  // Numérotation par type, dans l'ordre d'apparition.
  retenues.sort((a, b) => (a.premier ?? 0) - (b.premier ?? 0));
  const compteur = { SOC: 0, PERS: 0, ADR: 0, ID: 0, NOM: 0 };
  const paires = [], inverse = new Map();
  for (const e of retenues) {
    const base = `${e.type}_${++compteur[e.type]}`;
    e.formes.forEach((f, k) => {
      const code = k === 0 ? base : `${base}_${k + 1}`;
      paires.push([f.forme, code]);
      inverse.set(code, f.forme);
    });
  }
  RE_CODE.lastIndex = 0;
  const collision = RE_CODE.test(text);
  RE_CODE.lastIndex = 0;
  return { paires, inverse, collision, nombre: retenues.length };
}

// Remplacement en une seule passe, formes les plus longues d'abord.
export function pseudonymiser(text, table) {
  text = String(text || '');
  if (!table || !table.paires.length) return text;
  const vers = new Map(table.paires);
  // Un nom peut être suivi d'un chiffre collé (numéro de page d'une ligne de sommaire :
  // « Alami5 ») ; un numéro, lui, ne doit pas être pris dans un nombre plus long.
  const formes = [...vers.keys()].sort((a, b) => b.length - a.length).map(f => esc(f) + (/\d$/.test(f) ? `(?![${L}0-9_])` : `(?![${L}_])`));
  const re = new RegExp(`(?<![${L}0-9_])(?:${formes.join('|')})`, 'gu');
  return text.replace(re, m => `[${vers.get(m)}]`);
}

// Retour aux vrais noms. Les codes inconnus sont laissés et signalés.
export function restaurer(str, table) {
  const inconnus = [];
  const texte = String(str ?? '').replace(RE_CODE, (m, a, b) => {
    const code = a || b;
    if (table.inverse.has(code)) return table.inverse.get(code);
    inconnus.push(code);
    return m;
  });
  return { texte, inconnus };
}

const codes = s => [...String(s || '').matchAll(RE_CODE)].map(m => m[1] || m[2]);
// Mot (ou article élidé) qui précède chaque code : « de », « d' », « la »…
const precedents = s => [...String(s || '').matchAll(RE_CODE)].map(m => {
  const avant = String(s).slice(Math.max(0, m.index - 14), m.index);
  return ((/([A-Za-zÀ-ÿ]+[  ]*['’]?|['’])[  ]*$/.exec(avant) || [''])[0]).replace(/[  ]/g, '').replace('’', "'");
});

/**
 * Correction du modèle -> correction sur le texte réel, ou null si elle touche à un nom :
 * code ajouté, retiré, déplacé ou inconnu ; élision ou article changé devant un nom
 * (« de [SOC_1] » -> « d'[SOC_1] » serait faux une fois le vrai nom remis).
 */
export function restaurerCorrection(c, table) {
  if (!c) return null;
  const a = codes(c.original), b = codes(c.suggested);
  if (a.join('|') !== b.join('|')) return null;
  if (a.some(k => !table.inverse.has(k))) return null;
  const pa = precedents(c.original), pb = precedents(c.suggested);
  if (pa.some((p, k) => p !== pb[k])) return null;
  const out = { ...c };
  for (const k of Object.keys(out)) if (typeof out[k] === 'string') out[k] = restaurer(out[k], table).texte;
  return out;
}

// Observation de cohérence : tous les champs texte sont remis en clair.
export function restaurerObservation(o, table) {
  const out = { ...o };
  let inconnu = false;
  for (const k of Object.keys(out)) if (typeof out[k] === 'string') { const r = restaurer(out[k], table); out[k] = r.texte; if (r.inconnus.length) inconnu = true; }
  if (inconnu) out.localise = false;
  return out;
}
