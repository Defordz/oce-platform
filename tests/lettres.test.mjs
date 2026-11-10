// Protocole des lettres arabes : catégorie du destinataire et formules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { letterCorrections, letterAddressee, applyLetterFormulas } from '../lib/lettres.js';

const lettre = (entete, corps) => `${entete}\n- الرباط -\nالموضوع : طلب معلومات\nسلام تام بوجود مولانا الإمام،\n${corps}\nوتفضلوا، السيد الوزير، بقبول فائق عبارات التقدير والاحترام والسلام.`;
const run = (entete, corps, destinataire) => letterCorrections({ text: lettre(entete, corps), docType: 'lettre_ar', destinataire });
const has = (r, a, b) => r.corrections.some(c => c.original === a && c.suggested === b);

test('ministre : ligne honorifique, formules et clôture', () => {
  const r = run('السيدة وزيرة الاقتصاد والمالية', 'وبعد، يشرفني أن أحيطكم علما أنه قد تم التبليغ، ويشرفني أن أطلب من سيادتكم انتداب ممثل عنكم.');
  assert.equal(r.categorie, 'public');
  assert.ok(has(r, 'السيدة وزيرة الاقتصاد والمالية', 'الفاضلة المحترمة\nالسيدة وزيرة الاقتصاد والمالية'));
  assert.ok(has(r, 'أحيطكم علما', 'أحيط سيادتكم علما'));
  assert.ok(has(r, 'أطلب من سيادتكم انتداب', 'أطلب منكم التفضل مشكورين بانتداب'));
  assert.ok(r.corrections.some(c => c.suggested.includes('السيدة الوزيرة المحترمة')));
});
test('dirigeant d’établissement public : même protocole que le ministre', () => {
  for (const e of ['السيد المدير العام لوكالة التنمية الفلاحية', 'السيد مدير مكتب الصرف', 'السيد رئيس الهيئة المغربية لسوق الرساميل', 'السيد والي بنك المغرب']) {
    const r = run(e, 'وبعد، يشرفني أن أحيطكم علما، وأطلب من سيادتكم التفضل مشكورين بموافاة الأمانة العامة.');
    assert.equal(r.categorie, 'public', e);
    assert.ok(has(r, e, 'الفاضل المحترم\n' + e), e);
    assert.ok(has(r, 'وأطلب من سيادتكم التفضل مشكورين بموافاة', 'وأطلب منكم التفضل مشكورين بموافاة'), e);
  }
});
test('société : pas de ligne honorifique, formules simples', () => {
  const r = run('السيد المدير العام لشركة "Alpha SA"', 'وبعد، يشرفني أن أحيط سيادتكم علما، ويشرفني أن أطلب من سيادتكم التفضل مشكورين بانتداب ممثل، ونطلب منكم موافاة الأمانة العامة.');
  assert.equal(r.categorie, 'autre');
  assert.ok(!r.corrections.some(c => c.suggested.includes('الفاضل')));
  assert.ok(has(r, 'أحيط سيادتكم علما', 'أحيطكم علما'));
  assert.ok(has(r, 'أطلب من سيادتكم التفضل مشكورين بانتداب', 'أطلب من سيادتكم انتداب'));
  assert.ok(has(r, 'ونطلب منكم موافاة', 'وأطلب من سيادتكم موافاة'));
});
test('lettre déjà conforme : aucune correction', () => {
  const r = letterCorrections({ docType: 'lettre_ar', text: 'الفاضل المحترم\nالسيد وزير التشغيل\n- الرباط -\nسلام تام بوجود مولانا الإمام،\nوبعد، يشرفني أن أحيط سيادتكم علما، ويشرفني أن أطلب منكم التفضل مشكورين بانتداب ممثل.\nوتفضلوا، السيد الوزير المحترم، بقبول فائق عبارات التقدير والاحترام والسلام.' });
  assert.deepEqual(r.corrections, []);
});
test('catégorie imposée par l’utilisateur, Commissaire du Gouvernement non classé', () => {
  assert.equal(letterAddressee('السيد رئيس جامعة محمد الخامس\nسلام تام').cat, null);
  assert.equal(letterAddressee('السيد رئيس جامعة محمد الخامس\nسلام تام', 'public').cat, 'public');
  assert.equal(letterAddressee('السيد مندوب الحكومة لدى مجلس المنافسة\nسلام تام').cat, null);
});
test('construction non reconnue : signalée, non réécrite', () => {
  const r = run('السيد وزير العدل', 'وبعد، أطلب منكم أن توافوا الأمانة العامة بالوثائق.');
  assert.ok(!r.corrections.some(c => c.original.startsWith('أطلب')));
  assert.equal(r.warnings.length, 1);
});
test('alignement des suggestions du modèle', () => {
  assert.equal(applyLetterFormulas('يشرفني أن أحيط سيادتكم علما أنه', 'autre'), 'يشرفني أن أحيطكم علما أنه');
  assert.equal(applyLetterFormulas('texte', null), 'texte');
});
