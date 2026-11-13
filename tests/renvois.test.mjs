import { test } from 'node:test';
import assert from 'node:assert/strict';
import { controleRenvois, controleSommaire, controleNumerotation } from '../src/renvois.js';

const SOMMAIRE = `RAPPORT
Sommaire
Introduction2
I.Présentation des parties5
1.L’acquéreur5
1.1Conformité à l’article 13 de la loi n° 104-1215
II.Montant de la transaction13
Introduction
Texte.
Présentation des parties
L’acquéreur
Conformité à l’article 13 de la loi n° 104-12
Montant de l’opération
Texte.`;

test('sommaire : titre modifié dans le corps, numéro de page collé au titre', () => {
  const o = controleSommaire(SOMMAIRE);
  assert.equal(o.length, 1);
  assert.match(o[0].observation, /« Montant de la transaction » du sommaire n'a pas été retrouvé/);
  assert.equal(o[0].source, 'regle');
});

test('sommaire contre titres du document Word (styles), dans les deux sens', () => {
  const p = (t, style) => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t>${t}</w:t></w:r></w:p>`;
  const styles = '<w:styles><w:style w:styleId="Titre1"><w:pPr><w:outlineLvl w:val="0"/></w:pPr></w:style><w:style w:styleId="Normal"></w:style></w:styles>';
  const doc = '<w:body>' + p('x', 'TM1') + ['Introduction', 'Présentation des parties', 'L’acquéreur', 'Conformité à l’article 13 de la loi n° 104-12', 'Montant total de la transaction', 'Analyse des marchés'].map(t => p(t, 'Titre1')).join('') + p('Texte courant', 'Normal') + '</w:body>';
  const o = controleSommaire(SOMMAIRE, doc, styles);
  assert.equal(o.length, 2, JSON.stringify(o));
  assert.ok(o.some(x => /Le sommaire indique « Montant de la transaction », le titre dans le corps du rapport est « Montant total de la transaction »/.test(x.observation)));
  assert.ok(o.some(x => /« Analyse des marchés » n'apparaît pas dans le sommaire/.test(x.observation)));
});

test('numérotation des tableaux et renvoi vers un tableau absent', () => {
  const t = 'Tableau 1 : Chiffre d’affaires\nTableau 2 : Parts\nTableau 4 : Prix\nComme le montre le tableau 9, les prix baissent.\nVoir le tableau 2.';
  const o = controleNumerotation(t).map(x => x.observation);
  assert.ok(o.some(x => /passe de 2 à 4 : un tableau manque/.test(x)));
  assert.ok(o.some(x => /renvoie au tableau 9, qui n'existe pas/.test(x)));
  assert.equal(o.length, 2);
});

test('rapport sans sommaire ni tableau : aucune observation', () => {
  assert.deepEqual(controleRenvois({ text: 'Introduction\nTexte sans renvoi.' }), []);
});
