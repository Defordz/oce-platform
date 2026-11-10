// Contrôles déterministes des décisions : chaque incohérence injectée dans une
// décision de référence (fictive) doit être signalée, et la référence saine ne
// doit produire aucun avertissement.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runDecisionChecks } from '../lib/decisions.js';

const REF = `قرار مجلس المنافسة عدد 100/ق/2026
الصادر بتاريخ 8 ذو الحجة 1447 الموافق لـ 25 ماي 2026
والمتعلق بتولي شركة "Alpha Holding SA" المراقبة الحصرية لشركة "Beta Industries SARL"
إن مجلس المنافسة؛
بناء على القانون رقم 104.12 المتعلق بحرية الأسعار والمنافسة الصادر بتنفيذه الظهير الشريف رقم 1.14.116 الصادر في 2 رمضان 1435 الموافق لـ 30 يونيو 2014، كما تم تغييره وتتميمه؛
وبناء على القانون رقم 20.13 المتعلق بمجلس المنافسة الصادر بتنفيذه الظهير الشريف رقم 1.14.117 الصادر في 2 رمضان 1435 الموافق لـ 30 يونيو 2014، كما تم تغييره وتتميمه؛
وبناء على المرسوم رقم 2.14.652 الصادر في 8 صفر 1436 الموافق لـ فاتح دجنبر 2014 بتطبيق القانون رقم 104.12 المتعلق بحرية الأسعار والمنافسة، كما تم تغييره وتتميمه؛
وبناء على المرسوم رقم 2.15.109 الصادر في 16 شعبان 1436 الموافق لـ 4 يونيو 2015 بتطبيق القانون رقم 20.13 المتعلق بمجلس المنافسة، كما تم تغييره وتتميمه؛
وبناء على اجتماع اللجنة الدائمة لمجلس المنافسة المنعقد بتاريخ 8 ذو الحجة 1447 الموافق لـ 25 ماي 2026 طبقا لمقتضيات المادة 14 من القانون رقم 20.13 كما تم تغييره وتتميمه؛
وبعد تأكد رئيس مجلس المنافسة من توفر النصاب القانوني لأعضاء اللجنة الدائمة طبقا لمقتضيات المادة 14 من القانون رقم 20.13 المتعلق بمجلس المنافسة كما تم تغييره وتتميمه؛
وبناء على ملف تبليغ عملية التركيز الاقتصادي المسجل لدى الأمانة العامة لمجلس المنافسة تحت عدد 090/ع.ت.إ/2026، بتاريخ 10 ذو القعدة 1447 الموافق لـ 28 أبريل 2026، والمتعلق بتولي شركة "Alpha Holding SA" المراقبة الحصرية لشركة "Beta Industries SARL"؛
وبناء على قرار المقرر العام لمجلس المنافسة رقم 115/2026 بتاريخ 12 ذو القعدة 1447 الموافق لـ 30 أبريل 2026، القاضي بتعيين السيدة فلانة الفلانية مقررة في الموضوع، طبقا لأحكام المادة 27 من القانون رقم 104.12؛
وبعد تبليغ السلطة الحكومية المكلفة بالمنافسة بنظير من ملف التبليغ بتاريخ 18 ذو القعدة 1447 الموافق لـ 06 ماي 2026؛
وبعد نشر بلاغ مجلس المنافسة حول عملية التركيز الاقتصادي بتاريخ 19 ذو القعدة 1447 الموافق لـ 07 ماي 2026؛
وبعد استكمال جميع وثائق الملف بتاريخ 23 ذو القعدة 1447 الموافق لـ 11 ماي 2026؛
وبعد تقديم المقرر العام ومقررة الموضوع للتقرير المعد بشأن عملية التركيز المذكورة، خلال اجتماع اللجنة الدائمة لمجلس المنافسة المنعقد بتاريخ 8 ذو الحجة 1447 الموافق لـ 25 ماي 2026؛
وحيث إن مراقبة عمليات التركيز تستوجب التحقق من توفر الشروط المنصوص عليها في المادتين 11 و12 من القانون رقم 104.12؛
وحيث إن العملية تشكل تركيزا حسب مدلول المادة 11 وتستوفي شرطا من شروط المادة 12؛
وحيث إن السوق المعنية بهذه العملية هي سوق وطنية؛
وحيث إن العملية لن يكون لها أي تأثير أفقي أو عمودي أو تكتلي سلبي على المنافسة؛
قرر ما يلي:
المادة الأولى: أن ملف تبليغ عملية التركيز الاقتصادي المسجل لدى الأمانة العامة لمجلس المنافسة تحت عدد 090/ع.ت.إ/2026، بتاريخ 10 ذو القعدة 1447 الموافق لـ 28 أبريل 2026، يستوفي الشروط القانونية.
المادة الثانية: يرخص مجلس المنافسة بعملية التركيز الاقتصادي المتعلقة بتولي شركة "Alpha Holding SA" المراقبة الحصرية لشركة "Beta Industries SARL".
تم التداول بشأن هذا القرار من لدن اللجنة الدائمة لمجلس المنافسة، خلال اجتماعها المنعقد بتاريخ 8 ذو الحجة 1447 الموافق لـ 25 ماي 2026، بحضور السيد أحمد الأول رئيسا للجلسة، والسيدة سلمى الثانية، والسيد كريم الثالث، أعضاء.
رئيس المجلس ورئيس الجلسة: أحمد الأول
نائبة الرئيس: سلمى الثانية                                 نائب الرئيس: كريم الثالث`;

const kinds = t => runDecisionChecks(t).map(w => w.kind);
const sub = (a, b) => { assert.ok(REF.includes(a), 'motif introuvable : ' + a); return REF.replace(a, b); };

test('décision de référence : aucun avertissement', () => assert.deepEqual(runDecisionChecks(REF), []));
test('numéro de dossier différent à l’article premier', () => assert.ok(kinds(REF.replace('المسجل لدى الأمانة العامة لمجلس المنافسة تحت عدد 090/ع.ت.إ/2026، بتاريخ 10 ذو القعدة 1447 الموافق لـ 28 أبريل 2026، يستوفي', 'المسجل لدى الأمانة العامة لمجلس المنافسة تحت عدد 009/ع.ت.إ/2026، بتاريخ 10 ذو القعدة 1447 الموافق لـ 28 أبريل 2026، يستوفي')).includes('cohérence')));
test('date du titre différente de la délibération', () => assert.ok(kinds(sub('الصادر بتاريخ 8 ذو الحجة 1447 الموافق لـ 25 ماي 2026', 'الصادر بتاريخ 9 ذو الحجة 1447 الموافق لـ 26 ماي 2026')).includes('date')));
test('date hégirienne impossible', () => assert.ok(kinds(sub('بتاريخ 12 ذو القعدة 1447', 'بتاريخ 60 ذو القعدة 1447')).includes('date')));
test('année hégirienne erronée', () => assert.ok(kinds(sub('بتاريخ 18 ذو القعدة 1447', 'بتاريخ 18 ذو القعدة 1446')).includes('date')));
test('numéro de dahir erroné', () => assert.ok(kinds(sub('1.14.116', '1.14.161')).includes('visa')));
test('date du décret erronée', () => assert.ok(kinds(sub('16 شعبان 1436', '15 شعبان 1436')).includes('visa')));
test('étape postérieure à la décision', () => assert.ok(kinds(sub('الموافق لـ 11 ماي 2026', 'الموافق لـ 11 يونيو 2026')).includes('chronologie')));
test('décision moins de dix jours après la publication', () => assert.ok(kinds(sub('19 ذو القعدة 1447 الموافق لـ 07 ماي 2026', '28 ذو القعدة 1447 الموافق لـ 16 ماي 2026')).includes('chronologie')));
test('Commission permanente et Section mélangées', () => assert.ok(kinds(sub('خلال اجتماع اللجنة الدائمة لمجلس المنافسة', 'خلال اجتماع فرع المجلس')).includes('formation')));
test('signataire absent de la délibération', () => assert.ok(kinds(sub('نائب الرئيس: كريم الثالث', 'نائب الرئيس: سمير الرابع')).includes('signataires')));
test('accord du rapporteur', () => assert.ok(kinds(sub('ومقررة الموضوع', 'ومقرر الموضوع')).includes('accord')));
test('dénomination différente à l’article deux', () => assert.ok(kinds(sub('المراقبة الحصرية لشركة "Beta Industries SARL".', 'المراقبة الحصرية لشركة "Beta Industry SARL".')).includes('parties')));
test('millésime du numéro de décision', () => assert.ok(kinds(sub('100/ق/2026', '100/ق/2025')).includes('cohérence')));
test('analyse concurrentielle absente', () => assert.ok(kinds(sub('أفقي أو عمودي أو تكتلي', 'محتمل')).includes('conformité')));

// Le bloc des signatures n'est jamais retouché par le modèle ; le visa de
// publication garde « مشروع التركيز ».
test('signatures protégées et « مشروع التركيز » dans le référentiel', async () => {
  process.env.ANTHROPIC_API_KEY = 'k';
  const { default: seed } = await import('../lib/consignesSeed.js');
  assert.ok(seed.find(c => c.code === 'DEC-S-01').text.includes('حول مشروع التركيز الاقتصادي'));
  const saved = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'rapport_corrections', input: { synthese: 's', score: 8, corrections: [
    { type: 'forme', code: '', original: 'سلمى الثانية                                 نائب الرئيس', suggested: 'سلمى الثانية نائب الرئيس', reason: 'x' },
    { type: 'forme', code: '', original: 'وحيث إن السوق المعنية بهذه العملية هي سوق وطنية', suggested: 'وحيث إن السوق المعنية بهذه العملية سوق وطنية', reason: 'y' } ] } }] }) });
  const { default: handler } = await import('../api/analyze.js');
  const res = { setHeader() {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; } };
  await handler({ method: 'POST', headers: {}, body: { text: REF, docType: 'decision_ar', opts: { forme: true }, consignes: [] } }, res);
  globalThis.fetch = saved;
  assert.equal(res.code, 200);
  assert.equal(res.body.corrections.length, 1);
  assert.ok(res.body.corrections[0].original.startsWith('وحيث'));
});

// Variantes de rédaction admises (essai Mutandis / Enosis) : aucune fausse alerte.
test('« 16 من شعبان », quantième à deux chiffres, deux rapporteures', () => {
  let t = sub('16 شعبان 1436 الموافق لـ 4 يونيو 2015', '16 من شعبان 1436 الموافق لـ 04 يونيو 2015');
  t = t.replace('القاضي بتعيين السيدة فلانة الفلانية مقررة في الموضوع', 'القاضيين بتعيين كل من السيدة فلانة الفلانية والسيدة علانة العلانية كمقررتين في الموضوع').replace('ومقررة الموضوع', 'ومقررتي الموضوع');
  assert.deepEqual(runDecisionChecks(t), []);
});
test('millésime grégorien à la place de l’année hégirienne', () => {
  const w = runDecisionChecks(sub('23 ذو القعدة 1447 الموافق لـ 11 ماي 2026', '23 ذو القعدة 2026 الموافق لـ 11 ماي 2026'));
  assert.equal(w.length, 1);
  assert.ok(w[0].message.startsWith('Année hégirienne erronée'));
});
