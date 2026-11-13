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

const L = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';
const RE_MOT = new RegExp(`[${L}]+`, 'g');
const MAJ = /^[A-ZÀ-ÖØ-ÞŒ]/;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const TYPES = { SOC: 'Sociétés et groupes', PERS: 'Personnes', NOM: 'Autres noms cochés' };

// Code tel qu'il circule : [SOC_1], [PERS_3], [NOM_2], variante [SOC_1_2].
// Au retour, on tolère un code sans crochets ou avec des espaces.
const RE_CODE = /\[\s*((?:SOC|PERS|NOM)_\d+(?:_\d+)?)\s*\]|\b((?:SOC|PERS|NOM)_\d+(?:_\d+)?)\b/g;

// Mots jamais remplacés : formes juridiques, mots génériques des dénominations,
// institutions, titres, structure du rapport, pays, sigles courants.
const FORMES = 'sa sas sasu sarl sarlau au snc sca scs gie gmbh ltd limited llc llp lp inc corp plc bv nv ag spa se sl srl sci co cie ste sté';
const GENERIQUES = `groupe group groupes holding holdings corporation company compagnie companies international internationale industries industrie
  industriel industriels industrielle services service solutions healthcare health pharma pharmaceutical pharmaceuticals pharmaceutique pharmaceutiques
  laboratoire laboratoires laboratories labs motors mobility automotive care distribution distributions trading invest investment investments capital
  partners partenaires associés associates associes consulting conseil conseils véhicules vehicules technologies technology systems global east middle
  north south west central afrique africa african maroc morocco moroccan marocain marocaine europe european france finance finances bank banque
  assurance assurances immobilier immobilière real estate energy énergie food foods agro développement development participations participation
  management fund fonds equity ventures logistics logistique transport transports retail market markets consumer products produits brands
  commerce commercial commerciale alimentaire alimentaires cosmétique cosmétiques promotion maghreb médical médicale medical santé beauté hygiène
  chimie chimique pharmacie pharmacies nationale national atlantique sud nord centre new nouvelle nouveaux import export`;
const INSTITUTIONS = `conseil concurrence commission permanente section ministère ministre ministres direction directeur directrice général générale généraux
  adjoint adjointe rapporteur rapporteure rapporteurs président présidente vice secrétariat secrétaire gouvernement royaume roi majesté état etat
  loi décret dahir arrêté code bulletin officiel tribunal cour internet impôts douanes trésor office agence autorité haut haute union européenne
  nations unies chambre registre ompic cnss dgi ammc anrt dmp cnops anam amo oms ocde omc bam bkam services instruction enquête
  monsieur madame mademoiselle maître mme mlle mm dr pr me m messieurs mesdames docteur professeur
  tableau tableaux figure graphique annexe annexes introduction conclusion conclusions sommaire référence références source sources note notes
  partie parties chapitre titre article articles page total opération opérations cible cibles acquéreur acquéreurs vendeur vendeurs cédant cédants
  notifiante projet accord contrat transaction société sociétés entreprise entreprises recommandation analyse
  i ii iii iv v vi vii viii ix x xi xii
  tva ht ttc mad dh dhs eur usd ue ca pdm pib ihh hhi atc
  janvier février mars avril mai juin juillet août septembre octobre novembre décembre
  japon chine inde espagne italie allemagne portugal belgique suisse luxembourg pays bas royaume uni uk usa états unis tunisie algérie égypte
  sénégal côte ivoire turquie émirats arabes arabie saoudite qatar canada brésil russie`;
const PARTICULES = 'de du des d la le les l et el ben ibn bel ait aït van von di da del della der den y';
const STOP = new Set(`${FORMES} ${GENERIQUES} ${INSTITUTIONS} ${PARTICULES}`.split(/\s+/).filter(Boolean));
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

/**
 * Repère les noms de sociétés et de personnes.
 * @returns {{entites: Array<{cle, type, libelle, formes:{forme:string,n:number}[], n:number, source:'ancre'|'personne'|'suggestion', coche:boolean, premier:number}>}}
 */
export function detecterNoms(text) {
  text = String(text || '');
  const occ = indexer(text);
  const minuscules = new Set([...occ.keys()].filter(w => w === w.toLowerCase()));
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
  const denomination = n => {
    const mots = motsDistinctifs(n).filter(w => MAJ.test(w));
    if (mots.length) return mots.forEach(w => ajouter(w, 'SOC', 'ancre'));
    const p = String(n).replace(new RegExp(`[ \u00a0,]+(?:${FORMES.split(' ').join('|')})\\.?$`, 'i'), '').replace(/^(?:la|le|les|l['’])\s*/i, '').trim();
    if (p.length >= 4 && MAJ.test(p) && /\s/.test(p)) { const cle = 'phrase:' + p.toLowerCase(); if (!ent.has(cle)) ent.set(cle, { cle, type: 'SOC', source: 'ancre', phrase: p }); }
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
  const reAncreN = new RegExp(`(?:^|[^${L}])(?:${ANCRES})[ \\u00a0]+(${motMaj}(?:[ \\u00a0]+(?:(?:&|et|de|du|des)[ \\u00a0]+)?${motMaj}){0,4})`, 'gu');
  for (const m of text.matchAll(reAncreN)) motsDistinctifs(m[1]).forEach(w => { if (MAJ.test(w)) ajouter(w, 'SOC', 'ancre'); });

  // 3. Dénominations suivies d'une forme juridique : « Somapharma SARL », « CFAO Motors Maroc S.A. ».
  const reForme = new RegExp(`((?:${motMaj}[ \\u00a0]+(?:(?:&|de|du|des)[ \\u00a0]+)?){1,5})(?:S\\.?A\\.?S\\.?U?|S\\.?A\\.?R\\.?L\\.?(?:[ \\u00a0]?A\\.?U\\.?)?|SARLAU|S\\.A\\.|SA|SCA|SNC|GmbH|Ltd|LLC|LLP|Inc|PLC|Plc|AG|B\\.?V\\.?|N\\.?V\\.?|S\\.p\\.A\\.|SpA)(?![${L}])`, 'gu');
  for (const m of text.matchAll(reForme)) {
    motsDistinctifs(m[1]).forEach(w => {
      // Hors ancre explicite, un mot qui existe aussi en minuscules est un mot courant (« Ainsi », « Selon »).
      if (MAJ.test(w) && !minuscules.has(w.toLowerCase())) ajouter(w, 'SOC', 'ancre');
    });
  }

  // 4. Termes définis : « (ci-après « TTC ») ».
  const reDef = new RegExp(`ci-après(?:[ \\u00a0]+(?:dénommée?s?|désignée?s?|appelée?s?|ensemble))?[ \\u00a0]*,?[ \\u00a0]*(?:(?:la|le|les|l['’])[ \\u00a0]*)?«[ \\u00a0]*([^»\\n]{1,60}?)[ \\u00a0]*»`, 'giu');
  for (const m of text.matchAll(reDef)) motsDistinctifs(m[1]).forEach(w => { if (MAJ.test(w) && !minuscules.has(w.toLowerCase())) ajouter(w, 'SOC', 'ancre'); });

  // 5. Suggestions (décochées) : autres mots capitalisés jamais écrits en minuscules
  //    (concurrents des tableaux, mais aussi lieux et marques : à trier par l'utilisateur).
  for (const [w, pos] of occ) {
    const cle = w.toLowerCase();
    if (ent.has(cle) || !MAJ.test(w) || w.length < 3 || STOP.has(cle) || minuscules.has(cle)) continue;
    // Terminaisons de mots français courants (titres de colonnes, débuts de phrase).
    if (w !== w.toUpperCase() && SUFFIXES_FR.test(w)) continue;
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
      for (const m of text.matchAll(new RegExp(`(?<![${L}0-9_])${esc(e.phrase).replace(/ /g, '[ \\u00a0]+')}(?![${L}0-9_])`, 'giu'))) {
        if (m[0] === m[0].toLowerCase()) continue;
        if (!vu.has(m[0])) vu.set(m[0], { forme: m[0], n: 0, premier: m.index });
        vu.get(m[0]).n++;
      }
      formes.push(...vu.values());
    } else for (const [w, pos] of occ) {
      if (w.toLowerCase() !== e.cle) continue;
      const n = (w === w.toLowerCase()) ? pos.filter(i => dansAdresse(text, i, w.length)).length : pos.length;
      if (n) formes.push({ forme: w, n, premier: pos[0] });
    }
    if (!formes.length) continue;
    // Forme de référence : la plus fréquente ; à égalité, la graphie courante plutôt que les majuscules d'un titre.
    const capitales = f => (f.forme === f.forme.toUpperCase() && f.forme.length > 3 ? 1 : 0);
    formes.sort((a, b) => b.n - a.n || capitales(a) - capitales(b) || a.premier - b.premier);
    entites.push({ cle: e.cle, type: e.type, libelle: formes[0].forme, formes: formes.map(({ forme, n }) => ({ forme, n })), n: formes.reduce((s, f) => s + f.n, 0), source: e.source, coche: e.source !== 'suggestion', premier: Math.min(...formes.map(f => f.premier)) });
  }
  const ordreType = { SOC: 0, PERS: 1, NOM: 2 };
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
  const compteur = { SOC: 0, PERS: 0, NOM: 0 };
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
  const formes = [...vers.keys()].sort((a, b) => b.length - a.length).map(esc);
  const re = new RegExp(`(?<![${L}0-9_])(?:${formes.join('|')})(?![${L}0-9_])`, 'gu');
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
