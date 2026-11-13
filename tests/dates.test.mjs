// Dates des communiqués (essai VW / Gotion du 13/11/2026).
import test from 'node:test';
import assert from 'node:assert/strict';
import { runDatePass } from '../lib/dates.js';

const DATES = { publication: '2026-11-19', deadline: '2026-11-30' };
const pairs = r => r.corrections.map(c => [c.original, c.suggested]);

test('« soitle » collé : date limite trouvée et repère rétabli', () => {
  const r = runDatePass({ docType: 'cp_fr', dates: DATES, text: '10 jours à partir de la date de publication du présent communiqué, soitle 23 novembre 2026.\nFait à Rabat, le 15 novembre 2026.' });
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(pairs(r), [['Fait à Rabat, le 15 novembre 2026', 'Fait à Rabat, le 19 novembre 2026'], ['soitle 23 novembre 2026', 'soit le 30 novembre 2026']]);
});
test('« نونبر.2026 » et « حرر بالرباط » : date lue, formule consacrée', () => {
  const r = runDatePass({ docType: 'cp_ar', dates: DATES, text: '10 أيام ابتداء من تاريخ نشر هذا البلاغ، وينتهي هذا الأجل يوم 23 نونبر 2026.\nحرر بالرباط بتاريخ 15 نونبر.2026' });
  assert.deepEqual(pairs(r), [['حرر بالرباط بتاريخ 15 نونبر.2026', 'حرر في الرباط بتاريخ 19 نونبر 2026'], ['ينتهي هذا الأجل يوم 23 نونبر 2026', 'ينتهي هذا الأجل يوم 30 نونبر 2026']]);
});
test('date juste mal ponctuée : seule la ponctuation est corrigée', () => {
  const r = runDatePass({ docType: 'cp_ar', dates: { publication: '2026-11-19' }, text: 'حرر في الرباط بتاريخ 19 نونبر.2026' });
  assert.deepEqual(pairs(r), [['حرر في الرباط بتاريخ 19 نونبر.2026', 'حرر في الرباط بتاريخ 19 نونبر 2026']]);
});
test('date juste et bien écrite : aucune correction', () => {
  const r = runDatePass({ docType: 'cp_fr', dates: DATES, text: '10 jours à compter de la publication, soit le 30 novembre 2026.\nFait à Rabat, le 19 novembre 2026.' });
  assert.deepEqual(r.corrections, []);
});
test('une suggestion du modèle sur la date est écartée au profit de la date saisie', async () => {
  process.env.ANTHROPIC_API_KEY = 'k';
  const saved = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'rapport_corrections', input: { synthese: 's', score: 8, corrections: [
    { type: 'forme', code: '', original: 'soitle 23 novembre 2026', suggested: 'soit le 23 novembre 2026', reason: 'espace' } ] } }] }) });
  const { default: handler } = await import('../api/analyze.js');
  const res = { setHeader() {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; } };
  await handler({ method: 'POST', headers: {}, body: { docType: 'cp_fr', dates: DATES, opts: { forme: true }, consignes: [], text: 'Délai : 10 jours, soitle 23 novembre 2026.\nFait à Rabat, le 19 novembre 2026.' } }, res);
  globalThis.fetch = saved;
  assert.deepEqual(res.body.corrections.map(c => c.suggested), ['soit le 30 novembre 2026']);
});

// Extrait recopié par le modèle avec les diacritiques dans un autre ordre
// (kasra puis shadda) : réaligné sur le passage exact du document.
test('réalignement des extraits arabes', async () => {
  const { realignOriginal } = await import('../api/analyze.js');
  const doc = "انطلاقًا من المادة الفعالة للكاثود (CAM) ستُورِّدُها جزئيًا لدى  ''الشركة المشتركة المغربية''.";
  const modele = "ستُورِّدُها جزئيًا لدى ''الشركة المشتركة المغربية''".replace('ِّ', 'ِّ');
  assert.ok(!doc.includes(modele));
  const r = realignOriginal(doc, modele);
  assert.ok(doc.includes(r));
  assert.ok(r.startsWith('ستُورِّدُها') && r.endsWith("المغربية''"));
  assert.equal(realignOriginal(doc, 'absent'), 'absent');
});
