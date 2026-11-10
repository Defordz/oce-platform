// Référentiel des consignes : expressions régulières valides, codes uniques,
// et fusion automatique des révisions dans le store.
import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../lib/consignesSeed.js';

test('codes uniques', () => { const codes = seed.map(c => c.code); assert.equal(new Set(codes).size, codes.length); });
test('expressions régulières compilables', () => {
  for (const c of seed) for (const r of (c.regex || [])) assert.doesNotThrow(() => new RegExp(r.find, r.flags || 'g'), `${c.code} : ${r.find}`);
});
test('champs obligatoires', () => { for (const c of seed) assert.ok(c.code && c.label && c.text && c.doctype && c.category && c.mode, c.code); });
test('fusion du référentiel', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'x';
  const { mergeSeed } = await import('../lib/consignesStore.js');
  const stored = [{ code: 'A', text: 'ancien', active: false }, { code: 'PERSO', text: 'utilisateur' }, { code: 'C', text: 'inchangé' }];
  const ref = [{ code: 'A', text: 'révisé', maj: '2026-11-10', active: true }, { code: 'B', text: 'nouveau', maj: '2026-11-10' }, { code: 'C', text: 'référentiel sans révision' }];
  const { list, changed } = mergeSeed(stored, ref, '');
  assert.deepEqual(changed, ['A', 'B']);
  assert.equal(list.find(c => c.code === 'A').text, 'révisé');
  assert.equal(list.find(c => c.code === 'A').active, false, "l'état inactif choisi par l'utilisateur est conservé");
  assert.equal(list.find(c => c.code === 'C').text, 'inchangé');
  assert.ok(list.find(c => c.code === 'PERSO'));
  assert.deepEqual(mergeSeed(list, ref, '2026-11-10').changed, []);
});
