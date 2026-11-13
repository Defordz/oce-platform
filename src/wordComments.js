// src/wordComments.js
// Ajout de COMMENTAIRES Word (bulles en marge) dans un .docx, sans toucher au
// texte. Utilisé par le module « rapports d'instruction » pour les observations
// de cohérence. Fonctions pures sur les chaînes XML : testables hors navigateur.
//
// Chaque observation porte un « extrait » recopié du document. Le commentaire
// est ancré sur le paragraphe qui contient cet extrait (ancrage au paragraphe :
// robuste même quand le paragraphe porte déjà des modifications suivies).
// Un extrait introuvable est ancré au premier paragraphe, avec la mention
// « passage non localisé ».

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const REL_COMMENTS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments';
const CT_COMMENTS = 'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml';
const ID_BASE = 900000; // hors de la plage des identifiants de révision

const escXml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decodeXml = s => String(s).replace(/&(?:#x([0-9a-fA-F]+)|#(\d+)|lt|gt|quot|apos|amp);/g, (m, h, d) => (h ? String.fromCodePoint(parseInt(h, 16)) : d ? String.fromCodePoint(+d) : ({ '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&amp;': '&' })[m]));

// Forme de comparaison : espaces réduites, diacritiques arabes et tatweel retirés,
// apostrophes et guillemets unifiés.
export function normalize(s) {
  return String(s || '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[’ʼ‘`]/g, "'")
    .replace(/[«»“”"]/g, '"')
    .replace(/[\s   ]+/g, ' ')
    .trim();
}

// Texte ORIGINAL d'un paragraphe : sans les insertions suivies, avec le texte supprimé.
export function paraText(p) {
  const sansIns = p.replace(/<w:ins\b[^>]*>[\s\S]*?<\/w:ins>/g, '');
  return decodeXml([...sansIns.matchAll(/<w:(?:t|delText)(?:\s[^>]*)?>([^<]*)<\/w:(?:t|delText)>/g)].map(m => m[1]).join(''));
}

function findPara(paras, extrait) {
  const e = normalize(extrait);
  if (!e) return -1;
  let i = paras.findIndex(t => t.includes(e));
  if (i >= 0) return i;
  // Repli : début de l'extrait (le modèle a pu abréger la fin).
  const debut = e.slice(0, 50);
  if (debut.length >= 20) { i = paras.findIndex(t => t.includes(debut)); if (i >= 0) return i; }
  return -1;
}

function commentXml(id, texte, { author, initials, date }) {
  const paras = String(texte).split('\n').filter(x => x.trim().length);
  const body = paras.map((t, k) => `<w:p>${k === 0 ? '<w:pPr><w:pStyle w:val="CommentText"/></w:pPr><w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:annotationRef/></w:r>' : ''}<w:r><w:t xml:space="preserve">${escXml(t)}</w:t></w:r></w:p>`).join('');
  return `<w:comment w:id="${id}" w:author="${escXml(author)}" w:date="${date}" w:initials="${escXml(initials)}">${body}</w:comment>`;
}

/**
 * @param {object} p
 * @param {string} p.documentXml   word/document.xml
 * @param {string|null} p.commentsXml  word/comments.xml existant, ou null
 * @param {string} p.relsXml       word/_rels/document.xml.rels
 * @param {string} p.contentTypesXml [Content_Types].xml
 * @param {{texte:string, extrait:string}[]} p.comments
 * @returns {{documentXml, commentsXml, relsXml, contentTypesXml, ancres:number, nonLocalises:number}}
 */
export function addComments({ documentXml, commentsXml, relsXml, contentTypesXml, comments, author = 'OCE Correction', initials = 'OCE', date }) {
  date = date || new Date().toISOString().split('.')[0] + 'Z';
  const list = (comments || []).filter(c => c && c.texte);
  if (!list.length) return { documentXml, commentsXml, relsXml, contentTypesXml, ancres: 0, nonLocalises: 0 };

  // Paragraphes du corps (ceux qui ont du texte), dans l'ordre.
  const re = /<w:p\b(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
  const spans = [];
  for (const m of documentXml.matchAll(re)) {
    const t = normalize(paraText(m[0]));
    if (t) spans.push({ start: m.index, end: m.index + m[0].length, xml: m[0], text: t });
  }
  if (!spans.length) return { documentXml, commentsXml, relsXml, contentTypesXml, ancres: 0, nonLocalises: list.length };

  // Identifiants : au-delà de ceux déjà présents dans comments.xml.
  let maxId = ID_BASE - 1;
  if (commentsXml) for (const m of commentsXml.matchAll(/<w:comment\b[^>]*\bw:id="(\d+)"/g)) maxId = Math.max(maxId, +m[1]);

  const parPara = new Map(); // index de paragraphe -> [ids]
  const nouveaux = [];
  let nonLocalises = 0;
  list.forEach(c => {
    let i = findPara(spans.map(s => s.text), c.extrait);
    let texte = c.texte;
    if (i < 0) { i = 0; nonLocalises++; texte = '(Passage non localisé dans le document.)\n' + texte; }
    const id = ++maxId;
    nouveaux.push(commentXml(id, texte, { author, initials, date }));
    if (!parPara.has(i)) parPara.set(i, []);
    parPara.get(i).push(id);
  });

  // Insertion des marques dans les paragraphes (de la fin vers le début).
  let doc = documentXml;
  [...parPara.keys()].sort((a, b) => b - a).forEach(i => {
    const s = spans[i];
    let p = s.xml;
    const ids = parPara.get(i);
    const debut = ids.map(id => `<w:commentRangeStart w:id="${id}"/>`).join('');
    const fin = ids.map(id => `<w:commentRangeEnd w:id="${id}"/><w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="${id}"/></w:r>`).join('');
    // Après les propriétés du paragraphe (<w:pPr>, toujours en premier), sinon après la balise ouvrante.
    const open = p.indexOf('>') + 1;
    const pPr = /^<w:pPr\b(?:[^>]*\/>|[\s\S]*?<\/w:pPr>)/.exec(p.slice(open));
    const k = open + (pPr ? pPr[0].length : 0);
    p = p.slice(0, k) + debut + p.slice(k);
    p = p.replace(/<\/w:p>$/, fin + '</w:p>');
    doc = doc.slice(0, s.start) + p + doc.slice(s.end);
  });

  // comments.xml
  let cx;
  if (commentsXml) cx = commentsXml.replace(/<\/w:comments>\s*$/, nouveaux.join('') + '</w:comments>');
  else cx = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:comments xmlns:w="${W_NS}">${nouveaux.join('')}</w:comments>`;

  // Relation et type de contenu, s'ils manquent.
  let rels = relsXml;
  if (!rels.includes(REL_COMMENTS)) {
    let rid = 'rIdOceComments', k = 1;
    while (rels.includes(`Id="${rid}"`)) rid = 'rIdOceComments' + (k++);
    rels = rels.replace(/<\/Relationships>\s*$/, `<Relationship Id="${rid}" Type="${REL_COMMENTS}" Target="comments.xml"/></Relationships>`);
  }
  let ct = contentTypesXml;
  if (!/PartName="\/word\/comments\.xml"/.test(ct)) ct = ct.replace(/<\/Types>\s*$/, `<Override PartName="/word/comments.xml" ContentType="${CT_COMMENTS}"/></Types>`);

  return { documentXml: doc, commentsXml: cx, relsXml: rels, contentTypesXml: ct, ancres: list.length - nonLocalises, nonLocalises };
}
