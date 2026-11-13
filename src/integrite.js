// src/integrite.js
// Contrôle du fichier Word relu, juste avant le téléchargement : on vérifie que
// rien n'a été perdu ni mal remis en passant par les codes de pseudonymisation.
//  1. Vue « refuser toutes les modifications » : le texte est identique, paragraphe
//     par paragraphe, au document d'origine (corps et notes de bas de page).
//  2. Vue « accepter toutes les modifications » et commentaires : aucun code
//     ([SOC_1], [PERS_2]…) ne reste.
//  3. Chaque nom, adresse et numéro remplacé figure autant de fois que dans l'original.
//  4. Corrections appliquées et commentaires ancrés : décompte.
// Fonctions pures sur les chaînes XML : testables hors navigateur.

import { paraText } from './wordComments.js';

const L = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE_PARA = /<w:p\b(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
const RE_RESTE = /\[\s*(?:SOC|PERS|NOM|ADR|ID)_\d+(?:_\d+)?\s*\]/g;
const decodeXml = s => String(s).replace(/&(?:#x([0-9a-fA-F]+)|#(\d+)|lt|gt|quot|apos|amp);/g, (m, h, d) => (h ? String.fromCodePoint(parseInt(h, 16)) : d ? String.fromCodePoint(+d) : ({ '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&amp;': '&' })[m]));

// Texte « tout accepter » d'un paragraphe : sans les suppressions, avec les insertions.
export function paraAccepte(p) {
  const sansDel = p.replace(/<w:del\b[^>]*>[\s\S]*?<\/w:del>/g, '');
  return decodeXml([...sansDel.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(m => m[1]).join(''));
}
const paras = (xml, f) => (xml ? [...xml.matchAll(RE_PARA)].map(m => f(m[0])) : []);
const compter = (texte, forme) => (texte.match(new RegExp(`(?<![${L}0-9_])${esc(forme)}(?![${L}0-9_])`, 'gu')) || []).length;
const extrait = s => (s.length > 90 ? s.slice(0, 90) + '…' : s);

/**
 * @returns {{ok: boolean, controles: {ok: boolean, libelle: string, detail?: string}[]}}
 */
export function verifierFichierFinal({ docAvant, docApres, notesAvant = null, notesApres = null, commentsApres = null, table = null, corrections = { retenues: 0, appliquees: 0 }, commentaires = null }) {
  const controles = [];

  // 1. Texte d'origine intact.
  const ecarts = [];
  for (const [nom, avant, apres] of [['corps', docAvant, docApres], ['notes', notesAvant, notesApres]]) {
    if (!avant) continue;
    const a = paras(avant, paraText), b = paras(apres, paraText);
    if (a.length !== b.length) { ecarts.push(`${nom} : ${a.length} paragraphes à l'origine, ${b.length} dans le fichier relu`); continue; }
    a.forEach((t, i) => { if (t !== b[i]) ecarts.push(`${nom}, paragraphe ${i + 1} : « ${extrait(t)} »`); });
  }
  controles.push(ecarts.length
    ? { ok: false, libelle: "Texte d'origine modifié en dehors des corrections suivies", detail: ecarts.slice(0, 5).join(' ; ') }
    : { ok: true, libelle: "Texte d'origine intact : en refusant toutes les modifications, on retrouve exactement le rapport déposé" });

  // 2. Aucun code restant.
  const accepte = paras(docApres, paraAccepte).concat(paras(notesApres, paraAccepte)).join('\n');
  const enComment = commentsApres ? paras(commentsApres, paraAccepte).join('\n') : '';
  const restes = [...new Set((accepte + '\n' + enComment).match(RE_RESTE) || [])];
  controles.push(restes.length
    ? { ok: false, libelle: 'Codes restés dans le fichier', detail: restes.slice(0, 10).join(', ') }
    : { ok: true, libelle: 'Aucun code de pseudonymisation dans le texte, les corrections ni les commentaires' });

  // 3. Noms, adresses et numéros remis à l'identique.
  if (table && table.paires && table.paires.length) {
    const origine = paras(docAvant, paraText).concat(paras(notesAvant, paraText)).join('\n');
    const manques = [];
    let total = 0;
    for (const [forme] of table.paires) {
      const n0 = compter(origine, forme), n1 = compter(accepte, forme);
      total += n0;
      if (n0 !== n1) manques.push(`« ${extrait(forme)} » : ${n0} dans l'original, ${n1} dans le fichier relu`);
    }
    controles.push(manques.length
      ? { ok: false, libelle: 'Noms, adresses ou numéros qui ne se retrouvent pas à l\'identique', detail: manques.slice(0, 8).join(' ; ') }
      : { ok: true, libelle: `${table.nombre} noms, adresses et numéros remis à l'identique (${total} occurrences, comme dans l'original)` });
  }

  // 4. Corrections et commentaires.
  if (corrections.retenues) {
    const manquent = corrections.retenues - corrections.appliquees;
    controles.push({ ok: manquent === 0, libelle: manquent ? `${corrections.appliquees} corrections appliquées sur ${corrections.retenues} : ${manquent} n'ont pas pu être placées (listées plus bas)` : `${corrections.appliquees} corrections appliquées sur ${corrections.retenues}` });
  }
  if (commentaires && commentaires.total) {
    controles.push({ ok: !commentaires.nonLocalises, libelle: commentaires.nonLocalises ? `${commentaires.total} commentaires, dont ${commentaires.nonLocalises} placés en tête du document faute d'avoir retrouvé le passage` : `${commentaires.total} commentaires ancrés sur le passage cité` });
  }
  return { ok: controles.every(c => c.ok), controles };
}
