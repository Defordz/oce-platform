// Assistant de consignes : exécution des essais et attribution des codes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runTests, nextCode } from '../api/assistant-consigne.js';

const regle = { doctype: 'lettre_ar', category: 'FORME', mode: 'regex', regex: [{ find: '(?<![\\u0621-\\u064A])(?<p>[وف]?)عبر الإيميل', replace: '$<p>بواسطة البريد الإلكتروني', flags: 'g', label: 'x' }] };
test('essais réussis', () => {
  const r = runTests(regle, [{ avant: 'موافاتي عبر الإيميل', apres: 'موافاتي بواسطة البريد الإلكتروني' }, { avant: 'بواسطة البريد الإلكتروني', apres: 'بواسطة البريد الإلكتروني' }]);
  assert.deepEqual(r.errors, []);
});
test('essai en échec et essai négatif manquant signalés', () => {
  const r = runTests(regle, [{ avant: 'عبر الإيميل', apres: 'عبر البريد' }]);
  assert.equal(r.errors.length, 2);
});
test('expression invalide', () => assert.ok(runTests({ ...regle, regex: [{ find: '(', replace: '', flags: 'g', label: '' }] }, []).errors[0].startsWith('Expression invalide')));
test('codes', () => {
  const cs = [{ code: 'LA-21' }, { code: 'LA-03' }, { code: 'DEC-F-07' }, { code: 'F-18' }];
  assert.equal(nextCode('lettre_ar', 'FORME', cs), 'LA-22');
  assert.equal(nextCode('decision_ar', 'FORME', cs), 'DEC-F-08');
  assert.equal(nextCode('decision_ar', 'FOND', cs), 'DEC-S-01');
  assert.equal(nextCode('cp_fr', 'FORME', cs), 'F-19');
});
