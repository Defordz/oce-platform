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

test('F-19 et A-15 (essai VW / Gotion)', async () => {
  const { applyRules } = await import('../api/analyze.js');
  const f = t => applyRules(t, 'cp_fr', seed.filter(c => c.code === 'F-19'));
  assert.equal(f('société de droit marocain inscrite au registre du commerce de Rabat'), 'société de droit marocain immatriculée au Registre du Commerce de Rabat');
  assert.equal(f('immatriculée au registre du commerce du tribunal'), 'immatriculée au Registre du Commerce du tribunal');
  assert.equal(f('immatriculée au Registre du commerce et des sociétés du Luxembourg'), 'immatriculée au Registre du commerce et des sociétés du Luxembourg');
  const a = t => applyRules(t, 'cp_ar', seed.filter(c => c.code === 'A-15'));
  assert.equal(a('القطاع الاقتصادي المعني:\nقطاع صناعة السيارات.'), 'القطاعات الاقتصادية المعنية:\nقطاع صناعة السيارات.');
  assert.equal(a('يهم القطاع الاقتصادي المعني بالعملية'), 'يهم القطاع الاقتصادي المعني بالعملية');
});

test('A-16 : SAS = « شركة أسهم مبسطة »', async () => {
  const { applyRules } = await import('../api/analyze.js');
  const a = t => applyRules(t, 'cp_ar', seed.filter(c => c.code === 'A-16'));
  assert.equal(a('وهي شركة مساهمة مبسطة خاضعة للقانون المغربي'), 'وهي شركة أسهم مبسطة خاضعة للقانون المغربي');
  assert.equal(a('بشركة المساهمة المبسطة'), 'بشركة أسهم مبسطة');
  assert.equal(a('شركات المساهمة المبسطة'), 'شركات أسهم مبسطة');
  assert.equal(a('وهي شركة مساهمة خاضعة للقانون الألماني'), 'وهي شركة مساهمة خاضعة للقانون الألماني');
});

test('DEC-F-09 : SAS = « شركة أسهم مبسطة » dans les décisions', async () => {
  const { applyRules } = await import('../api/analyze.js');
  const d = t => applyRules(t, 'decision_ar', seed.filter(c => c.code === 'DEC-F-09'));
  assert.equal(d('وهي شركة مساهمة مبسطة خاضعة للقانون الفرنسي'), 'وهي شركة أسهم مبسطة خاضعة للقانون الفرنسي');
  assert.equal(d('شركة المساهمة المبسطة'), 'شركة أسهم مبسطة');
  assert.equal(d('وهي شركة مساهمة خاضعة للقانون المغربي'), 'وهي شركة مساهمة خاضعة للقانون المغربي');
});
