import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detecterNoms, construireTable, pseudonymiser, restaurer, restaurerCorrection, restaurerObservation } from '../src/pseudonyme.js';

const TEXTE = `Le groupe Maphar a notifié l'opération. Ainsi, Maphar SA est actionnaire de la société « Cooper », et Cooper est filiale de Maphar.
La société « MEABAN MAROC SARL » est la cible ; Meaban Maroc fournit des services de promotion.
M. François Le Feunteun est cité une fois, M. Hugues Le Feunteun plusieurs fois.
Les sociétés « Promotion Maghreb » et « DS Pharma » sont concurrentes. Site : www.maphar.ma.
Monsieur le Rapporteur Général a désigné Mme Rajaa MAGHRABI.`;

const prep = (t = TEXTE) => { const { entites } = detecterNoms(t); return { entites, table: construireTable(t, entites) }; };

test('une même société garde le même code, avec ou sans forme juridique ni mot générique', () => {
  const { table } = prep();
  const p = pseudonymiser(TEXTE, table);
  assert.match(p, /Le groupe \[SOC_1\] a notifié/);
  assert.match(p, /\[SOC_1\] SA est actionnaire/);
  assert.match(p, /filiale de \[SOC_1\]\./);
  assert.match(p, /www\.\[SOC_1_2\]\.ma/);           // forme en minuscules d'une adresse web
  assert.ok(!/Maphar|maphar|Cooper|Feunteun|MAGHRABI|Rajaa/.test(p), p);
  assert.match(p, /Ainsi, /);                          // mot courant laissé
  assert.match(p, /Monsieur le Rapporteur Général/);   // titres laissés
});

test('autre graphie : code dérivé, et aller-retour exact au caractère près', () => {
  const { table } = prep();
  const p = pseudonymiser(TEXTE, table);
  assert.match(p, /« \[SOC_\d+_2\] MAROC SARL »/);
  assert.match(p, /\[SOC_\d+\] Maroc fournit/);
  assert.equal(restaurer(p, table).texte, TEXTE);
});

test('personnes : prénoms et nom codés séparément (deux prénoms, un même nom)', () => {
  const { table } = prep();
  const p = pseudonymiser(TEXTE, table);
  const a = /M\. (\[PERS_\d+\]) Le (\[PERS_\d+\]) est cité/.exec(p);
  const b = /M\. (\[PERS_\d+\]) Le (\[PERS_\d+\]) plusieurs/.exec(p);
  assert.ok(a && b, p);
  assert.notEqual(a[1], b[1]);
  assert.equal(a[2], b[2]);
});

test('dénomination faite de mots génériques : remplacée en entier', () => {
  const { entites, table } = prep();
  assert.ok(entites.some(e => e.libelle === 'Promotion Maghreb' && e.coche));
  const p = pseudonymiser(TEXTE, table);
  assert.match(p, /« \[SOC_\d+\] » et « \[SOC_\d+\] Pharma »/);
  assert.match(p, /services de promotion\./); // le mot courant reste
});

test('suggestions décochées par défaut, ajout manuel pris en compte', () => {
  const t = 'Les parts de Sothema et de Laprophan figurent au tableau.\nSothema\n12 %';
  const { entites } = detecterNoms(t);
  const s = entites.find(e => e.libelle === 'Sothema');
  assert.ok(s && !s.coche && s.type === 'NOM');
  const table = construireTable(t, entites, ['Laprophan SA']);
  const p = pseudonymiser(t, table);
  assert.match(p, /de \[NOM_\d+\] figurent/);
  assert.match(p, /Sothema/);
});

test('correction restaurée ; correction qui touche à un nom écartée', () => {
  const { table } = prep();
  const code = pseudonymiser('la société « Cooper »', table).match(/\[SOC_\d+\]/)[0];
  const ok = restaurerCorrection({ original: `la societe « ${code} »`, suggested: `la société « ${code} »`, reason: `accent (${code})` }, table);
  assert.deepEqual(ok, { original: 'la societe « Cooper »', suggested: 'la société « Cooper »', reason: 'accent (Cooper)' });
  assert.equal(restaurerCorrection({ original: `de ${code}`, suggested: `d'${code}`, reason: '' }, table), null);
  assert.equal(restaurerCorrection({ original: `la ${code}`, suggested: `le ${code}`, reason: '' }, table), null);
  assert.equal(restaurerCorrection({ original: `${code} et ${code}`, suggested: `${code}`, reason: '' }, table), null);
  assert.equal(restaurerCorrection({ original: '[SOC_99] est', suggested: '[SOC_99] est', reason: '' }, table), null);
});

test('observation de cohérence remise en clair, code tolérant sans crochets', () => {
  const { table } = prep();
  const p = pseudonymiser(TEXTE, table);
  const pers = /M\. (\[PERS_\d+\])/.exec(p)[1].slice(1, -1);
  const o = restaurerObservation({ extrait: `M. [${pers}] Le`, extrait_lie: '', observation: `Le prénom ${pers} diffère.`, localise: true }, table);
  assert.equal(o.extrait, 'M. François Le');
  assert.equal(o.observation, 'Le prénom François diffère.');
  assert.equal(o.localise, true);
});

test('collision : un texte qui contient déjà un code est signalé', () => {
  const t = 'La société « Maphar » et le code [SOC_1] déjà présent.';
  const { entites } = detecterNoms(t);
  assert.equal(construireTable(t, entites).collision, true);
});

test('sigle donné entre parenthèses après une dénomination', () => {
  const t = 'La société « Commerce et Distribution des Produits Alimentaires » (« CODIPAC ») vend. CODIPAC achète.';
  const { entites } = detecterNoms(t);
  assert.ok(entites.some(e => e.libelle === 'CODIPAC' && e.type === 'SOC' && e.coche));
  assert.ok(entites.some(e => e.libelle === 'Commerce et Distribution des Produits Alimentaires' && e.coche));
});

test('adresses et numéros d\'immatriculation remplacés en entier, aller-retour exact', () => {
  const t = `La société « Meaban Maroc » est immatriculée au registre du commerce de Casablanca sous le numéro 97789, dont le siège social est situé au numéro 106, rue Abderrahman Sehraoui à Casablanca. Le groupe a son siège aux numéros 57-59 rue Yves Kermen, 92100 Boulogne-Billancourt, immatriculée au registre du commerce et des sociétés de Nanterre sous le numéro B 552 056 152.
Identifiant commun de l’entreprise n° 002204262000052
La mise en place du contrat, au cours de l'exercice 2025, porte sur la route du nord.`;
  const { entites } = detecterNoms(t);
  const table = construireTable(t, entites);
  const p = pseudonymiser(t, table);
  assert.match(p, /sous le numéro \[ID_1\], dont le siège social est situé au \[ADR_1\]\./);
  assert.match(p, /aux \[ADR_2\], immatriculée/);
  assert.match(p, /sous le numéro \[ID_2\]\./);
  assert.match(p, /n° \[ID_3\]/);
  assert.match(p, /mise en place du contrat, au cours de l'exercice 2025, porte sur la route du nord/); // mots de voie ordinaires laissés
  assert.ok(!/Sehraoui|Kermen|97789|552 056|0022042/.test(p), p);
  assert.equal(restaurer(p, table).texte, t);
  // Les mots d'une adresse remplacée ne sont pas proposés en plus.
  assert.ok(!entites.some(e => e.type === 'NOM' && /Sehraoui|Kermen/.test(e.libelle)));
});
