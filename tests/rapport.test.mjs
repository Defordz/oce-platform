// Rapports d'instruction : commentaires Word et relecture de cohérence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { addComments, paraText } from '../src/wordComments.js';
process.env.APP_PASSWORD = 'essai';

const DOC = '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'
  + '<w:p><w:pPr><w:pStyle w:val="Titre1"/></w:pPr><w:r><w:t>I. Présentation des parties</w:t></w:r></w:p>'
  + '<w:p><w:r><w:t xml:space="preserve">La société Alpha a réalisé un chiffre d’affaires de </w:t></w:r><w:del w:id="1"><w:r><w:delText>120</w:delText></w:r></w:del><w:ins w:id="2"><w:r><w:t>121</w:t></w:r></w:ins><w:r><w:t xml:space="preserve"> millions de dirhams en 2025.</w:t></w:r></w:p>'
  + '<w:p><w:r><w:t>Alpha &amp; Fils détient 60 % du marché.</w:t></w:r></w:p>'
  + '<w:sectPr/></w:body></w:document>';
const RELS = '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="x" Target="styles.xml"/></Relationships>';
const CT = '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>';

test('texte original d’un paragraphe révisé', () => {
  const p = DOC.match(/<w:p>(?:(?!<\/w:p>)[\s\S])*Alpha a réalisé[\s\S]*?<\/w:p>/)[0];
  assert.equal(paraText(p), 'La société Alpha a réalisé un chiffre d’affaires de 120 millions de dirhams en 2025.');
});

test('commentaires ancrés, créés et déclarés', () => {
  const r = addComments({ documentXml: DOC, commentsXml: null, relsXml: RELS, contentTypesXml: CT, date: '2026-11-13T10:00:00Z', comments: [
    { extrait: "chiffre d'affaires de 120 millions de dirhams", texte: '[Important · Chiffres] 120 millions ici, 150 millions en section III.' },
    { extrait: 'Alpha & Fils détient 60 %', texte: 'Somme des parts > 100 %.' },
    { extrait: 'passage inexistant', texte: 'Renvoi.' } ] });
  assert.equal(r.ancres, 2); assert.equal(r.nonLocalises, 1);
  assert.equal((r.documentXml.match(/<w:commentRangeStart /g) || []).length, 3);
  assert.equal((r.documentXml.match(/<w:commentReference /g) || []).length, 3);
  // le paragraphe révisé reçoit le commentaire, après ses propriétés éventuelles
  assert.ok(/<w:p><w:commentRangeStart w:id="900000"\/><w:r><w:t xml:space="preserve">La société Alpha/.test(r.documentXml));
  // non localisé : premier paragraphe, après <w:pPr>
  assert.ok(/<\/w:pPr><w:commentRangeStart w:id="900002"\/>/.test(r.documentXml));
  assert.ok(r.commentsXml.includes('Passage non localisé'));
  assert.ok(r.commentsXml.includes('&gt; 100 %'));
  assert.ok(r.relsXml.includes('relationships/comments'));
  assert.ok(r.contentTypesXml.includes('/word/comments.xml'));
});

test('comments.xml existant : identifiants à la suite, relation non dupliquée', () => {
  const existing = '<?xml version="1.0"?><w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:comment w:id="900007" w:author="X"><w:p/></w:comment></w:comments>';
  const rels = RELS.replace('</Relationships>', '<Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/></Relationships>');
  const r = addComments({ documentXml: DOC, commentsXml: existing, relsXml: rels, contentTypesXml: CT, comments: [{ extrait: 'Présentation des parties', texte: 'x' }] });
  assert.ok(r.commentsXml.includes('w:id="900008"'));
  assert.equal((r.relsXml.match(/relationships\/comments/g) || []).length, 1);
});

test('relecture de cohérence : extraits réalignés, observations triées', async () => {
  process.env.ANTHROPIC_API_KEY = 'k';
  const saved = globalThis.fetch;
  let sent;
  globalThis.fetch = async (u, o) => { sent = JSON.parse(o.body); return { ok: true, json: async () => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'rapport_coherence', input: { synthese: 's', observations: [
    { categorie: 'renvois', gravite: 'a_verifier', extrait: 'voir annexe  4', extrait_lie: '', observation: "L'annexe 4 n'existe pas." },
    { categorie: 'chiffres', gravite: 'importante', extrait: 'Alpha détient 60 %', extrait_lie: 'Beta détient 55 %', observation: 'Somme supérieure à 100 %.' } ] } }] }) }; };
  const { default: handler } = await import('../api/coherence.js');
  const res = { setHeader() {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; } };
  await handler({ method: 'POST', headers: { 'x-app-password': 'essai' }, body: { text: 'Alpha détient 60 % du marché.\nBeta détient 55 % du marché (voir annexe 4).' } }, res);
  globalThis.fetch = saved;
  assert.equal(res.code, 200);
  assert.equal(sent.tools[0].name, 'rapport_coherence');
  assert.equal(res.body.observations[0].gravite, 'importante');
  assert.equal(res.body.observations[1].extrait, 'voir annexe 4');
  assert.ok(res.body.observations.every(o => o.localise));
});

test('prompt de langue des rapports', async () => {
  const { buildPrompt } = await import('../api/analyze.js');
  const p = buildPrompt({ text: 'x', docType: 'rapport', opts: { forme: true }, consignes: [{ code: 'F-01', doctype: 'cp_fr', mode: 'claude', category: 'FORME', label: 'L', text: 'T' }] });
  assert.ok(p.system.includes('Corrige UNIQUEMENT la langue'));
  assert.ok(!p.system.includes('[F-01]'), 'pas de consigne des communiqués');
});

test('sommaire évité, note de bas de page ancrée sur son appel', () => {
  const doc = '<w:document xmlns:w="w"><w:body>'
    + '<w:sdt><w:sdtContent><w:p><w:r><w:t>2. Analyse des effets</w:t></w:r></w:p></w:sdtContent></w:sdt>'
    + '<w:p><w:r><w:t>2. Analyse des effets</w:t></w:r></w:p>'
    + '<w:p><w:r><w:t>Le chiffre d’affaires est converti</w:t></w:r><w:r><w:footnoteReference w:id="7"/></w:r><w:r><w:t>.</w:t></w:r></w:p>'
    + '</w:body></w:document>';
  const notes = '<w:footnotes><w:footnote w:type="separator" w:id="-1"><w:p/></w:footnote><w:footnote w:id="7"><w:p><w:r><w:footnoteRef/></w:r><w:r><w:t xml:space="preserve"> Taux de change de la DGI pour 2025.</w:t></w:r></w:p></w:footnote></w:footnotes>';
  const r = addComments({ documentXml: doc, commentsXml: null, relsXml: RELS, contentTypesXml: CT, footnotesXml: notes, comments: [
    { extrait: '2. Analyse des effets', texte: 'titre' }, { extrait: '(1) Taux de change de la DGI pour 2025.', texte: 'note' } ] });
  assert.equal(r.nonLocalises, 0);
  assert.ok(/<\/w:sdt><w:p><w:commentRangeStart w:id="900000"\/>/.test(r.documentXml), 'titre du corps, pas le sommaire');
  assert.ok(/<w:p><w:commentRangeStart w:id="900001"\/><w:r><w:t>Le chiffre/.test(r.documentXml), 'paragraphe qui appelle la note');
  assert.ok(r.commentsXml.includes('(Note de bas de page n° 1) note'));
});
