// src/renvois.js
// Contrôle des renvois SANS modèle (gratuit), pour les rapports d'instruction :
//  - sommaire : chaque titre du sommaire doit se retrouver tel quel dans le corps ;
//  - tableaux, figures, graphiques : numérotation suivie (ni trou ni doublon) et
//    renvois du texte (« voir le tableau 7 ») vers une légende qui existe.
// Le sens d'un renvoi (« ainsi qu'il est exposé ci-après ») relève du modèle.
// Observations au même format que src/chiffres.js.

import { paraText } from './wordComments.js';

const norm = s => String(s || '')
  .replace(/[’ʼ‘`]/g, "'")
  .replace(/[«»“”"]/g, '"')
  .replace(/[\s   ]+/g, ' ')
  .trim()
  .toLowerCase();

const obs = (extrait, observation, extrait_lie = '') => ({ categorie: 'renvoi', gravite: 'a_verifier', source: 'regle', extrait, extrait_lie, observation });
const court = s => (s.length > 80 ? s.slice(0, 80) + '…' : s);

// Lignes du sommaire : après « Sommaire » ou « Table des matières », les lignes qui
// finissent par un numéro de page. Renvoie [{ligne, titres candidats}] et l'indice de fin.
function lireSommaire(lignes) {
  const i0 = lignes.findIndex(l => /^(sommaire|table des matières)$/i.test(l.trim()));
  if (i0 < 0) return { entrees: [], fin: 0 };
  const entrees = [];
  let i = i0 + 1;
  for (; i < lignes.length; i++) {
    const l = lignes[i].trim();
    if (!/\d$/.test(l) || l.length > 250) break;
    const sansNum = l.replace(/^(?:[IVXLC]+\.|\d+(?:\.\d+)*\.?)[  ]*/, '');
    // Numéro de page collé au titre : 1 à 3 chiffres (« … loi n° 104-1215 » = « 104-12 » + page 15).
    const candidats = [1, 2, 3].map(k => sansNum.slice(0, -k).trim()).filter(t => t.length >= 3);
    entrees.push({ ligne: l, candidats: [...new Set(candidats)] });
  }
  return { entrees, fin: i };
}

// Titres du corps : paragraphes de niveau hiérarchique (style « Titre n » ou niveau
// hiérarchique posé sur le paragraphe), limités aux niveaux que le sommaire affiche.
export function titresDuCorps(documentXml, stylesXml) {
  if (!documentXml) return null;
  const styles = new Map();
  for (const m of String(stylesXml || '').matchAll(/<w:style\b[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g)) {
    const ol = /<w:outlineLvl w:val="(\d)"/.exec(m[2]), b = /<w:basedOn w:val="([^"]+)"/.exec(m[2]);
    styles.set(m[1], { outline: ol ? +ol[1] : null, basedOn: b ? b[1] : null });
  }
  const niveauStyle = (id, k = 0) => { const st = styles.get(id); if (!st || k > 10) return null; return st.outline ?? (st.basedOn ? niveauStyle(st.basedOn, k + 1) : null); };
  const tm = [...documentXml.matchAll(/<w:pStyle w:val="(?:TM|TOC|toc) ?(\d)"/g)].map(m => +m[1]);
  const maxNiv = tm.length ? Math.max(...tm) : 3;
  const titres = [];
  for (const m of documentXml.matchAll(/<w:p\b(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)) {
    const pPr = (/<w:pPr>[\s\S]*?<\/w:pPr>/.exec(m[0]) || [''])[0];
    const ol = /<w:outlineLvl w:val="(\d)"/.exec(pPr), ps = /<w:pStyle w:val="([^"]+)"/.exec(pPr);
    const niv = ol ? +ol[1] : ps ? niveauStyle(ps[1]) : null;
    if (niv == null || niv >= maxNiv) continue;
    const t = paraText(m[0]).replace(/[\s\u00a0\u202f\u2009]+/g, ' ').trim();
    if (t) titres.push(t);
  }
  return titres;
}

const sansNumero = t => t.replace(/^(?:[IVXLC]+\.|\d+(?:\.\d+)*\.?)[ \u00a0]*/, '');
const VIDES = new Set(['des', 'les', 'aux', 'pour', 'sur', 'par', 'dans', 'avec', 'une', 'du', 'de', 'la', 'le', 'et']);
const mots = t => new Set(norm(t).split(/[^a-zà-ÿ0-9]+/).filter(w => w.length > 2 && !VIDES.has(w)));
// Part des mots communs, rapportée au plus long des deux titres.
const proximite = (a, b) => { const A = mots(a), B = mots(b); const c = [...A].filter(w => B.has(w)).length; return c / Math.max(1, A.size, B.size); };
const MAJ_SOMMAIRE = 'Mettre à jour le sommaire (clic droit sur le sommaire, « Mettre à jour les champs »).';

/**
 * Sommaire contre titres du corps. Avec le XML du document, la comparaison se fait
 * dans les deux sens (titre du sommaire absent du corps, titre du corps absent du
 * sommaire) ; sans lui, seulement du sommaire vers le texte.
 */
export function controleSommaire(text, documentXml = null, stylesXml = null) {
  const lignes = String(text || '').split('\n');
  const { entrees, fin } = lireSommaire(lignes);
  if (entrees.length < 2) return [];
  const affiche = e => e.candidats.filter(t => !/\d$/.test(t)).sort((a, b) => b.length - a.length)[0] || e.candidats[0];
  const titres = titresDuCorps(documentXml, stylesXml);
  const ref = titres && titres.length ? titres.map(sansNumero) : lignes.slice(fin);
  const corps = new Set(ref.map(norm));
  const sommaire = new Set(entrees.flatMap(e => e.candidats.map(norm)));
  let absentsCorps = entrees.filter(e => !e.candidats.some(t => corps.has(norm(t))));
  let absentsSommaire = titres && titres.length ? [...new Set(titres)].filter(t => !sommaire.has(norm(sansNumero(t)))) : [];
  const out = [];
  // Titre renommé : on rapproche, du plus proche au moins proche, un titre absent du
  // corps et un titre absent du sommaire qui partagent la moitié de leurs mots au moins.
  const paires = [];
  absentsSommaire.forEach(t => absentsCorps.forEach(e => { const sc = proximite(affiche(e), sansNumero(t)); if (sc >= 0.5) paires.push({ t, e, sc }); }));
  paires.sort((a, b) => b.sc - a.sc);
  for (const { t, e } of paires) {
    if (!absentsSommaire.includes(t) || !absentsCorps.includes(e)) continue;
    out.push(obs(t, `Le sommaire indique « ${court(affiche(e))} », le titre dans le corps du rapport est « ${court(sansNumero(t))} ». ${MAJ_SOMMAIRE}`, e.ligne));
    absentsCorps = absentsCorps.filter(x => x !== e);
    absentsSommaire = absentsSommaire.filter(x => x !== t);
  }
  absentsSommaire.forEach(t => out.push(obs(t, `Le titre « ${court(sansNumero(t))} » n'apparaît pas dans le sommaire. ${MAJ_SOMMAIRE}`)));
  absentsCorps.forEach(e => out.push(obs(e.ligne, `Le titre « ${court(affiche(e))} » du sommaire n'a pas été retrouvé dans le corps du rapport : titre modifié ou supprimé. ${MAJ_SOMMAIRE}`)));
  // Beaucoup d'écarts : le sommaire n'a pas été mis à jour ; une seule observation.
  if (out.length > 4) return [obs(out[0].extrait, `Le sommaire ne correspond plus aux titres du rapport (${out.length} écarts), par exemple : ${out[0].observation.replace(' ' + MAJ_SOMMAIRE, '').replace(/\.$/, '')}. ${MAJ_SOMMAIRE}`, out[0].extrait_lie)];
  return out;
}

const PLURIEL = { tableau: 'tableaux', figure: 'figures', graphique: 'graphiques' };
const UN = { tableau: 'un tableau', figure: 'une figure', graphique: 'un graphique' };
const AU = { tableau: 'au tableau', figure: 'à la figure', graphique: 'au graphique' };

export function controleNumerotation(text) {
  const lignes = String(text || '').split('\n');
  const out = [];
  for (const [type, re, reRenvoi] of [
    ['tableau', /^Tableau\s*(?:n°\s*)?(\d+)\b/i, /\b(?:au|le|du|dans le|voir le|cf\.?)\s+tableau\s*(?:n°\s*)?(\d+)\b/gi],
    ['figure', /^Figure\s*(?:n°\s*)?(\d+)\b/i, /\b(?:à la|la|de la|dans la|voir la|cf\.?)\s+figure\s*(?:n°\s*)?(\d+)\b/gi],
    ['graphique', /^Graphique\s*(?:n°\s*)?(\d+)\b/i, /\b(?:au|le|du|dans le|voir le|cf\.?)\s+graphique\s*(?:n°\s*)?(\d+)\b/gi],
  ]) {
    const legendes = [];
    lignes.forEach(l => { const m = re.exec(l.trim()); if (m) legendes.push({ n: +m[1], ligne: l.trim() }); });
    const vus = new Map();
    let prec = 0;
    for (const g of legendes) {
      if (vus.has(g.n)) out.push(obs(g.ligne, `Deux ${PLURIEL[type]} portent le numéro ${g.n} : numérotation à revoir.`, vus.get(g.n)));
      else if (g.n !== prec + 1 && g.n > prec) out.push(obs(g.ligne, `La numérotation des ${PLURIEL[type]} passe de ${prec} à ${g.n} : ${UN[type]} manque ou la numérotation est à revoir.`));
      vus.set(g.n, g.ligne);
      prec = Math.max(prec, g.n);
    }
    // Renvois du texte vers un numéro sans légende.
    const signale = new Set();
    lignes.forEach(l => {
      if (re.test(l.trim())) return; // la légende elle-même
      for (const m of l.matchAll(reRenvoi)) {
        const n = +m[1];
        if (vus.has(n) || signale.has(n)) continue;
        signale.add(n);
        const i = Math.max(0, m.index - 60);
        out.push(obs(l.slice(i, m.index + m[0].length + 40).trim(), `Le texte renvoie ${AU[type]} ${n}, qui n'existe pas dans le rapport (${legendes.length} au total).`));
      }
    });
  }
  return out.slice(0, 8);
}

export function controleRenvois({ text, documentXml = null, stylesXml = null }) {
  return controleSommaire(text, documentXml, stylesXml).concat(controleNumerotation(text));
}
