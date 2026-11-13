import { test } from 'node:test';
import assert from 'node:assert/strict';
import { horsRapport } from '../api/analyze.js';

const T = 'Sommaire\nLa décision n° 25/ ق /46 du 9 avril 2025.\nLa société « Irca » est active.';

test('rapports : corrections écartées (mise en page, arabe)', () => {
  assert.equal(horsRapport({ original: 'Sommaire ', suggested: 'Sommaire' }, T, 'rapport'), true);
  assert.equal(horsRapport({ original: '   ', suggested: '' }, T, 'rapport'), true);
  assert.equal(horsRapport({ original: 'n° 25/ ق /46', suggested: 'n° 25/ق/46' }, T, 'rapport'), true);
});

test('rapports : corrections gardées', () => {
  assert.equal(horsRapport({ original: 'société «Irca', suggested: 'société « Irca' }, T, 'rapport'), false);
  assert.equal(horsRapport({ original: 'la prise du contrôle', suggested: 'la prise de contrôle' }, T, 'rapport'), false);
  assert.equal(horsRapport({ original: 'Sommaire ', suggested: 'Sommaire' }, T, 'cp_fr'), false);
});

import { REGLES_RAPPORT } from '../api/analyze.js';
const appliquer = t => REGLES_RAPPORT.reduce((x, c) => c.regex.reduce((y, p) => y.replace(new RegExp(p.find, p.flags), p.replace), x), t);

test('rapports : règles fixes (numéros de lois et décrets, « il sera procédé »)', () => {
  assert.equal(appliquer('la loi n° 104.12 et la loi n°20.13'), 'la loi n° 104-12 et la loi n° 20-13');
  assert.equal(appliquer('le décret n° 2.14.652 pris'), 'le décret n° 2-14-652 pris');
  assert.equal(appliquer('Ensuite, sera procédé à l’appréciation. Il sera procédé.'), 'Ensuite, il sera procédé à l’appréciation. Il sera procédé.');
  assert.equal(appliquer('1.1.Conformité à la loi n° 104.1216'), '1.1.Conformité à la loi n° 104.1216'); // ligne de sommaire (page collée)
});
