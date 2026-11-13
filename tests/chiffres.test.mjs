// Contrôles chiffrés sans modèle (rapports d'instruction).
import test from 'node:test';
import assert from 'node:assert/strict';
import { controleTotaux, controleMemeFait } from '../src/chiffres.js';

const cell = t => `<w:tc><w:p><w:r><w:t>${t}</w:t></w:r></w:p></w:tc>`;
const tab = (legende, rows) => `<w:p><w:r><w:t>${legende}</w:t></w:r></w:p><w:tbl>${rows.map(r => `<w:tr>${r.map(cell).join('')}</w:tr>`).join('')}</w:tbl>`;
const doc = body => `<w:document><w:body>${body}</w:body></w:document>`;

test('total juste : rien ; total faux : signalé avec la légende du tableau', () => {
  const ok = doc(tab('Tableau 3 : Parts de marché', [['Opérateur', 'CA (en dirhams)', 'Part'], ['A', '1 000 000', '60,5 %'], ['B', '500 000', '39,5 %'], ['Total', '1 500 000', '100 %']]));
  assert.deepEqual(controleTotaux(ok), []);
  const faux = doc(tab('Tableau 4 : Parts de marché', [['Opérateur', 'CA (en dirhams)', 'Part'], ['A', '1 000 000', '63 %'], ['B', '500 000', '39 %'], ['Total', '1 500 001', '100 %']]));
  const o = controleTotaux(faux);
  assert.equal(o.length, 2);
  assert.ok(o[0].observation.startsWith('Tableau 4, colonne « CA (en dirhams) »'));
  assert.equal(o[0].gravite, 'a_verifier');
  assert.equal(o[1].gravite, 'importante');
  assert.equal(o[0].extrait, 'Tableau 4 : Parts de marché');
});
test('pourcentages arrondis tolérés, « soit » dans les cellules, tirets', () => {
  const t = doc(tab('Tableau 7', [['Associés', 'Avant', 'Après'], ['X', '99 parts, soit 0,19 %', '-'], ['Y', '52 110 parts, soit 99,81 %', '-'], ['Z', '-', '52 209 parts, soit 100 %'], ['Total', '52 209 parts, soit 100 %', '52 209 parts, soit 100 %']])
    + tab('Tableau 8', [['Marque', 'Part'], ['a', '26 %'], ['b', '24 %'], ['c', '18 %'], ['d', '32 %'], ['Total', '100 %']]));
  assert.deepEqual(controleTotaux(t), []);
});
test('même fait, deux chiffres ; montants presque identiques ; pas de faux positif', () => {
  const base = 'Au titre de l’exercice 2025, le chiffre d’affaires net de la société « Alpha SA » s’établit à 5 723 993,00 euros.';
  assert.deepEqual(controleMemeFait(base + '\nLa société « Alpha SA » a réalisé un chiffre d’affaires de 5 723 993,00 euros en 2025.'), []);
  const o = controleMemeFait(base + '\nLa société « Alpha SA » a réalisé un chiffre d’affaires de 5 732 993,00 euros en 2025.');
  assert.equal(o.length, 1);
  assert.ok(o[0].observation.includes('5 723 993,00') && o[0].observation.includes('5 732 993,00'));
  // années, périmètres, segments et seuils différents : pas de comparaison
  assert.deepEqual(controleMemeFait(base + '\nLa société « Alpha SA » a réalisé un chiffre d’affaires de 4 100 000,00 euros en 2024.'
    + '\nLe chiffre d’affaires pharmaceutique de la société « Alpha SA » s’établit à 1 852 491 711,00 euros au titre de l’exercice 2025.'
    + '\nLa société « Beta » a réalisé un chiffre d’affaires de 900 000 dirhams en 2024 et de 950 000 dirhams en 2025.'
    + '\nLe seuil de l’article 12 est fixé à 50 millions de dirhams.'), []);
  // participation au capital
  const c = controleMemeFait('La société « A » détient 99,68 % du capital social de la société « B ».\nPar ailleurs, « A » détient 99,25 % du capital de « B ».');
  assert.equal(c.length, 1);
});
