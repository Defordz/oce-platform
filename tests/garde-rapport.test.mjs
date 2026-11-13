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
