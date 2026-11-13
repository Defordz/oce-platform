import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifierFichierFinal } from '../src/integrite.js';
import { detecterNoms, construireTable } from '../src/pseudonyme.js';

const P = t => `<w:p><w:r><w:t xml:space="preserve">${t}</w:t></w:r></w:p>`;
const avant = `<w:body>${P('La société « Maphar SA » a réalisé des prestation.')}${P('M. Hugues Le Feunteun est gérant.')}</w:body>`;
const texte = 'La société « Maphar SA » a réalisé des prestation.\nM. Hugues Le Feunteun est gérant.';
const table = construireTable(texte, detecterNoms(texte).entites);
// Correction suivie : « prestation » -> « prestations ».
const apresOk = `<w:body><w:p><w:r><w:t xml:space="preserve">La société « Maphar SA » a réalisé des prestation</w:t></w:r><w:ins w:id="1"><w:r><w:t>s</w:t></w:r></w:ins><w:r><w:t>.</w:t></w:r></w:p>${P('M. Hugues Le Feunteun est gérant.')}</w:body>`;

test('fichier conforme : texte intact, aucun code, noms remis', () => {
  const r = verifierFichierFinal({ docAvant: avant, docApres: apresOk, table, corrections: { retenues: 1, appliquees: 1 } });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.controles[2].libelle, /remis à l'identique/);
});

test('code resté dans le fichier et nom perdu : signalés', () => {
  const apres = apresOk.replace('Maphar', '[SOC_1]');
  const r = verifierFichierFinal({ docAvant: avant, docApres: apres, table });
  assert.equal(r.ok, false);
  assert.ok(r.controles.some(c => !c.ok && /Codes restés/.test(c.libelle)));
  assert.ok(r.controles.some(c => !c.ok && /Maphar/.test(c.detail || '')));
  assert.ok(r.controles.some(c => !c.ok && /Texte d'origine modifié/.test(c.libelle)));
});

test('texte modifié hors suivi des modifications : signalé', () => {
  const apres = apresOk.replace('est gérant', 'est le gérant');
  const r = verifierFichierFinal({ docAvant: avant, docApres: apres, table });
  assert.ok(r.controles.some(c => !c.ok && /paragraphe 2/.test(c.detail || '')));
});
