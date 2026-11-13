// src/chiffres.js
// Contrôles CHIFFRÉS d'un rapport d'instruction, sans modèle (gratuits, stables).
// Fonctions pures sur le XML du document : exécutées dans le navigateur.
//
//  1. Totaux des tableaux : chaque ligne « Total » est comparée à la somme des
//     lignes qui la précèdent, colonne par colonne.
//  2. Même fait, deux chiffres : un chiffre d'affaires (même société, même
//     année, même périmètre, même devise), une participation au capital (même
//     détenteur, même société détenue) ou un prix de cession cité deux fois
//     avec deux valeurs différentes.
//  3. Montants presque identiques : deux montants précis de la même devise qui
//     ne diffèrent que de quelques unités (faute de frappe probable).
//
// Chaque constat est rendu comme une observation de la relecture de cohérence
// (catégorie « chiffres »), avec l'extrait où placer le commentaire Word.

const decodeXml = s => String(s).replace(/&(?:#x([0-9a-fA-F]+)|#(\d+)|lt|gt|quot|apos|amp);/g, (m, h, d) => (h ? String.fromCodePoint(parseInt(h, 16)) : d ? String.fromCodePoint(+d) : ({ '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&amp;': '&' })[m]));
const sansIns = x => x.replace(/<w:ins\b[^>]*>[\s\S]*?<\/w:ins>/g, '');
const texteDe = x => decodeXml([...sansIns(x).matchAll(/<w:(?:t|delText)(?:\s[^>]*)?>([^<]*)<\/w:(?:t|delText)>/g)].map(m => m[1]).join('')).replace(/[\s   ]+/g, ' ').trim();
const fmt = (v, dec) => v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/ /g, ' ');

// --- Lecture des nombres (français : espaces de milliers, virgule décimale) ---
const RE_NOMBRE = /(?<![\d,.])(\d{1,3}(?:[   ]\d{3})+|\d+)(?:,(\d+))?(?![\d])/g;
function nombres(s) {
  const out = [];
  for (const m of String(s).matchAll(RE_NOMBRE)) {
    const ent = m[1].replace(/[   ]/g, '');
    const dec = m[2] || '';
    const v = parseFloat(ent + (dec ? '.' + dec : ''));
    const apres = s.slice(m.index + m[0].length, m.index + m[0].length + 4);
    out.push({ v, dec: dec.length, pct: /^\s?%/.test(apres), index: m.index, texte: m[0] });
  }
  return out;
}

// --- 1. Totaux des tableaux ---
// Tableaux du document, avec leur légende (« Tableau 9 : … », paragraphe qui précède).
function tableaux(documentXml) {
  const out = [];
  for (const t of documentXml.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>/g)) {
    const rows = [...t[0].matchAll(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g)].map(r => [...r[0].matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map(c => texteDe(c[0])));
    const avant = documentXml.slice(Math.max(0, t.index - 6000), t.index);
    const paras = [...avant.matchAll(/<w:p\b(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)].map(p => texteDe(p[0])).filter(Boolean);
    out.push({ rows, legende: paras.length ? paras[paras.length - 1] : '' });
  }
  return out;
}
const estTotal = row => row.slice(0, 2).some(c => /^total\b/i.test(c));
const estSousTotal = row => row.slice(0, 2).some(c => /^sous[- ]total/i.test(c));

export function controleTotaux(documentXml) {
  const obs = [];
  tableaux(documentXml).forEach(({ rows, legende }, ti) => {
    const nomTableau = (/^(Tableau\s+\d+)/i.exec(legende) || [])[1] || `Tableau n° ${ti + 1} du document`;
    let debut = 1; // la première ligne est l'en-tête
    rows.forEach((row, ri) => {
      if (!estTotal(row)) return;
      const corps = rows.slice(debut, ri).filter(r => !estSousTotal(r) && !estTotal(r));
      debut = ri + 1;
      if (corps.length < 2) return;
      row.forEach((cell, j) => {
        const tot = nombres(cell);
        if (!tot.length || /^total\b/i.test(cell)) return;
        tot.forEach((t, q) => {
          let somme = 0, n = 0, tolerance = t.pct || t.dec ? 0.5 * Math.pow(10, -t.dec) : 0;
          for (const r of corps) {
            const c = r[j] || '';
            if (/^[-–—]?$/.test(c.trim())) continue;
            const ns = nombres(c);
            if (ns.length <= q || ns[q].pct !== t.pct) return; // colonne hétérogène : pas de contrôle
            somme += ns[q].v; n++;
            if (t.pct) tolerance += 0.5 * Math.pow(10, -ns[q].dec);
          }
          if (n < 2) return;
          const ecart = Math.abs(somme - t.v);
          if (ecart <= tolerance + 1e-9) return;
          const dec = Math.max(t.dec, 0);
          const unite = t.pct ? ' %' : '';
          const entete = (rows[0] || [])[j] || '';
          obs.push({
            categorie: 'chiffres', gravite: t.pct || ecart > Math.max(n, 2) ? 'importante' : 'a_verifier', source: 'regle',
            // Ancrage : la légende du tableau (unique), à défaut l'en-tête de la colonne.
            extrait: legende && legende.length < 300 ? legende : entete || cell,
            observation: `${nomTableau}${entete ? `, colonne « ${entete} »` : ''} : la somme des lignes donne ${fmt(somme, dec)}${unite}, le total indique ${t.texte}${unite} (écart de ${fmt(ecart, dec)}${unite}${!t.pct && ecart <= n ? ', peut-être dû à des arrondis' : ''}).`,
          });
        });
      });
    });
  });
  return obs;
}

// --- 2. Même fait, deux chiffres ---
const RE_ENTITE = /«\s*([^«»]{2,80}?)\s*»/g;
const FORMES = /\s+(?:S\.?A\.?S\.?U?|S\.?A\.?R\.?L\.?(?:\s+AU)?|S\.?A\.?|SE|AG|GmbH|Ltd\.?|Inc\.?|S\.p\.A\.?|Corporation|Corp\.?|Co\.,?\s*Ltd\.?)$/i;
const nomEntite = s => s.replace(FORMES, '').replace(/\s+/g, ' ').trim().toLowerCase();
const RE_DEVISE = /^\s*(?:(millions?|milliards?)\s+(?:de\s+|d['’])?)?(euros?|EUR|€|dirhams?|MAD|DH|dollars?|USD|\$)/i;
const devise = s => (/^(euros?|eur|€)$/i.test(s) ? 'EUR' : /^(dirhams?|mad|dh)$/i.test(s) ? 'MAD' : 'USD');
const RESERVE = /(?:plus de|moins de|environ|près de|presque|inférieure?s? à|supérieure?s? à|jusqu['’]à|au moins|au plus|entre|de l['’]ordre de|en deçà de|au-delà de|dépass\w*|seuil\w*|atteign\w*|soit|ou plus|estim\w*)\s*$/i;
const PHRASE_SEUIL = /seuil|article\s+(?:8|12)\b|25\s?% ou plus|40\s?% des/i;

function phrases(text) {
  // Pas de coupure après une abréviation (« M. Hugues… », « art. 12 », initiales « P. Fabre »).
  return String(text).split('\n').flatMap(p => p.split(/(?<=(?<!\b(?:M|MM|Mme|Me|Dr|Pr|art|al|cf|[A-Z]))[.;])\s+(?=[A-ZÀ-Ý«(])/)).map(s => s.trim()).filter(s => s.length > 20);
}

const NEUTRES = /^(?:net|nets|hors taxes|HT|total|global|annuel)$/i;
const PRODUIT = /\b(?:produits?|marques?|segments?|gammes?|portefeuilles?|activités?|prestations?)\b/i;

// Société à laquelle se rapporte un chiffre d'affaires ; null si ce n'est pas sûr.
function entiteCA(ph, ents, kw, n) {
  const dans = ents.filter(e => e.index > kw.fin && e.index < n.index);
  if (dans.length === 1) return PRODUIT.test(ph.slice(kw.fin, dans[0].index)) ? null : dans[0];
  if (dans.length > 1) return null;
  const avant = ents.filter(e => e.index < kw.debut).pop();
  if (avant && /\ba\s+réalisé\b|\bréalise\b|\bdégage\b/i.test(ph.slice(avant.index, kw.debut)) && !PRODUIT.test(ph.slice(avant.index, kw.debut))) return avant;
  const apres = ents.find(e => e.index > n.index);
  if (apres && /^[^.;]{0,60}\b(?:réalisé|généré|dégagé)\w*\s+(?:la même année\s+)?par\b/i.test(ph.slice(n.index, apres.index)) && !PRODUIT.test(ph.slice(n.index, apres.index))) return apres;
  if (ents.length === 1 && !PRODUIT.test(ph)) return ents[0];
  return null;
}

export function faitsChiffres(text) {
  const faits = [];
  for (const ph of phrases(text)) {
    if (PHRASE_SEUIL.test(ph)) continue;
    const ents = [...ph.matchAll(RE_ENTITE)].map(m => ({ nom: nomEntite(m[1]), brut: m[1], index: m.index }));
    const ns = nombres(ph).filter(n => n.pct || !/^20\d\d$/.test(n.texte));
    const perimetre = /au Maroc|national|marocain/i.test(ph) && !/mondial|monde|consolidé|groupe/i.test(ph) ? 'maroc' : /mondial|monde|consolidé/i.test(ph) ? 'monde' : '';
    ns.forEach((n, i) => {
      const avant = ph.slice(0, n.index);
      if (RESERVE.test(avant.slice(-30))) return;
      const apres = ph.slice(n.index + n.texte.length);
      // Fenêtre : depuis le nombre précédent ; un mot-clé ne vaut que pour le premier chiffre qui le suit.
      const deb = i > 0 ? ns[i - 1].index + ns[i - 1].texte.length : 0;
      const fenetre = ph.slice(deb, n.index);
      const extrait = ph.slice(Math.max(0, n.index - 90), Math.min(ph.length, n.index + n.texte.length + 40)).trim();
      const entApres = ents.find(e => e.index > n.index);
      const entAvant = ents.filter(e => e.index < n.index).pop();
      // Année : celle qui suit le montant (« … dirhams en 2025 »), sinon la plus proche avant.
      const anApres = /^[^.;]{0,45}?\b(20\d\d)\b/.exec(apres);
      const anAvant = [...fenetre.matchAll(/\b(20\d\d)\b/g)].pop() || [...avant.matchAll(/\b(20\d\d)\b/g)].pop();
      const an = anApres ? anApres[1] : anAvant ? anAvant[1] : '';
      if (n.pct) {
        // « A détient 99,68 % du capital … de B »
        if (/^\s?%\s+(?:du|de son|de leur)\s+capital|^\s?%\s+des\s+droits de vote/i.test(apres) && entApres && !RESERVE.test(fenetre)) {
          faits.push({ cle: `capital|${entAvant ? entAvant.nom : ''}|${entApres.nom}`, libelle: `participation de ${entAvant ? '« ' + entAvant.brut + ' » ' : ''}au capital de « ${entApres.brut} »`, v: n.v, dec: n.dec, unite: ' %', texte: n.texte, extrait, phrase: ph });
        }
        return;
      }
      const dv = RE_DEVISE.exec(apres);
      if (!dv) return;
      const mult = dv[1] ? (/milliard/i.test(dv[1]) ? 1e9 : 1e6) : 1;
      const valeur = n.v * mult, precision = 0.5 * Math.pow(10, -n.dec) * mult;
      const cur = devise(dv[2]);
      const unite = ' ' + (cur === 'MAD' ? 'dirhams' : cur === 'EUR' ? 'euros' : 'dollars');
      const fait = { cle: null, montant: true, cur, v: valeur, precision, texte: n.texte + (dv[1] ? ' ' + dv[1] : ''), unite, extrait, phrase: ph };
      const kwCA = [...fenetre.matchAll(/chiffres?\s+d['’]affaires(?:\s+([a-zéèêàç]+))?/gi)].pop();
      const kwPrix = /prix\s+(?:de cession|d['’]acquisition)|valeur de l['’]opération/i.test(fenetre);
      if (kwCA) {
        const kw = { debut: deb + kwCA.index, fin: deb + kwCA.index + kwCA[0].length };
        const adj = kwCA[1] && !/^(?:de|du|des|d|réalisé|généré|s|a|est|qui|au|en|pour)$/i.test(kwCA[1]) && !NEUTRES.test(kwCA[1]) ? kwCA[1].toLowerCase() : '';
        const ent = entiteCA(ph, ents, kw, n);
        if (ent) Object.assign(fait, { cle: `ca|${ent.nom}|${adj}|${an}|${perimetre}|${cur}`, libelle: `chiffre d'affaires${adj ? ' ' + adj : ''}${an ? ' ' + an : ''}${perimetre === 'maroc' ? ' au Maroc' : perimetre === 'monde' ? ' mondial' : ''} de « ${ent.brut} »` });
      } else if (kwPrix) {
        Object.assign(fait, { cle: `prix|${cur}`, libelle: "prix de l'opération" });
      }
      faits.push(fait);
    });
  }
  return faits;
}

export function controleMemeFait(text) {
  const obs = [];
  const faits = faitsChiffres(text);
  const groupes = new Map();
  const dejaVus = new Set();
  for (const f of faits.filter(f => f.cle)) { if (!groupes.has(f.cle)) groupes.set(f.cle, []); groupes.get(f.cle).push(f); }
  for (const [, g] of groupes) {
    const base = g[0];
    for (const f of g.slice(1)) {
      const tol = (base.precision || 0.5 * Math.pow(10, -(base.dec || 0))) + (f.precision || 0.5 * Math.pow(10, -(f.dec || 0)));
      if (Math.abs(f.v - base.v) <= tol) continue;
      dejaVus.add([base.v, f.v].sort().join('|'));
      obs.push({ categorie: 'chiffres', gravite: 'importante', source: 'regle', extrait: f.extrait, extrait_lie: base.extrait,
        observation: `Même fait, deux chiffres : ${base.libelle} vaut ${base.texte}${base.unite} dans un passage et ${f.texte}${f.unite} dans un autre.` });
      break;
    }
  }
  // 3. Montants précis presque identiques (même devise, au moins 6 chiffres) : faute de frappe probable.
  const montants = faits.filter(f => f.montant && f.precision < 1 && f.v >= 100000);
  const vus = dejaVus;
  for (let i = 0; i < montants.length; i++) for (let k = i + 1; k < montants.length; k++) {
    const a = montants[i], b = montants[k];
    if (a.cur !== b.cur || a.v === b.v) continue;
    const ecart = Math.abs(a.v - b.v);
    if (ecart > Math.max(a.v, b.v) * 0.001 || ecart < 1) continue;
    const cle = [a.v, b.v].sort().join('|');
    if (vus.has(cle)) continue; vus.add(cle);
    obs.push({ categorie: 'chiffres', gravite: 'a_verifier', source: 'regle', extrait: b.extrait, extrait_lie: a.extrait,
      observation: `Deux montants presque identiques : ${a.texte} et ${b.texte} (écart de ${fmt(ecart, 0)}). S'il s'agit du même montant, l'un des deux est mal recopié.` });
  }
  return obs;
}

// --- 4. Même nom, prénoms différents (« M. Hugues Le Feunteun » / « M. François Le Feunteun ») ---
const PARTICULE = '(?:Le|La|De|Du|Des|Ben|Ibn|El|Al|Ait|Aït|Van|Von|Di|Da)';
const RE_PERSONNE = new RegExp(`\\b(M\\.|Mme|Monsieur|Madame)\\s+([A-ZÉÈ][a-zéèëêïîôûç]+(?:-[A-ZÉÈ][a-zéèëêïîôûç]+)?(?:\\s+(?!${PARTICULE}\\b)[A-ZÉÈ][a-zéèëêïîôûç]+)?)\\s+((?:${PARTICULE}\\s+)?[A-ZÉÈ][A-Za-zÉÈéèëêïîôûç'’-]+)`, 'g');
export function controleNoms(text) {
  const parNom = new Map();
  for (const ph of phrases(text)) {
    for (const m of ph.matchAll(RE_PERSONNE)) {
      const civ = /^(?:Mme|Madame)$/.test(m[1]) ? 'F' : 'M';
      const cle = civ + '|' + m[3].toLowerCase();
      if (!parNom.has(cle)) parNom.set(cle, new Map());
      const prenoms = parNom.get(cle);
      if (!prenoms.has(m[2])) prenoms.set(m[2], { n: 0, nom: `${m[1]} ${m[2]} ${m[3]}`, extrait: ph.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).trim() });
      prenoms.get(m[2]).n++;
    }
  }
  const obs = [];
  for (const [, prenoms] of parNom) {
    if (prenoms.size < 2) continue;
    const l = [...prenoms.values()].sort((x, y) => y.n - x.n);
    const maj = l[0];
    for (const autre of l.slice(1)) obs.push({ categorie: 'contradiction', gravite: 'a_verifier', source: 'regle', extrait: autre.extrait, extrait_lie: maj.extrait,
      observation: `Même nom, prénoms différents : « ${autre.nom} » (${autre.n} mention${autre.n > 1 ? 's' : ''}) et « ${maj.nom} » (${maj.n} mention${maj.n > 1 ? 's' : ''}). S'il s'agit de la même personne, l'un des prénoms est erroné ; sinon, la seconde personne n'est peut-être pas présentée.` });
  }
  return obs;
}

/** Tous les contrôles chiffrés d'un rapport. */
export function controlesChiffres({ documentXml, text }) {
  return controleTotaux(documentXml).concat(controleMemeFait(text), controleNoms(text));
}
