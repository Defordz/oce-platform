// lib/decisions.js
// Vérifications structurelles DÉTERMINISTES des décisions du Conseil (decision_ar).
// Elles SIGNALENT (avertissements) sans corriger : une incohérence peut venir
// d'une date erronée, d'un numéro mal recopié ou d'un paragraphe déplacé, et
// c'est au relecteur de trancher. Règles établies sur les onze décisions
// modèles (contrôle exclusif, contrôle conjoint, fusion, entreprise commune,
// acquisition d'actifs, en Commission permanente et en Section, et dérogation).

const GREG = { 'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'ابريل': 4, 'ماي': 5, 'مايو': 5, 'يونيو': 6, 'يونيه': 6, 'يوليوز': 7, 'يوليو': 7, 'غشت': 8, 'شتنبر': 9, 'سبتمبر': 9, 'أكتوبر': 10, 'اكتوبر': 10, 'نونبر': 11, 'نوفمبر': 11, 'دجنبر': 12, 'ديسمبر': 12 };
const HIJRI = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const HIJRI_ALT = { 'ربيع الاول': 3, 'ربيع الآخر': 4, 'ربيع الاخر': 4, 'ربيع الثاني': 4, 'جمادى الاولى': 5, 'جمادى الأولى': 5, 'جمادى الثانية': 6, 'جمادى الآخرة': 6, 'جمادى الاخرة': 6, 'ذي القعدة': 11, 'ذو القعدة': 11, 'ذي الحجة': 12, 'ذو الحجة': 12 };
const hijriMonth = name => { const n = name.replace(/\s+/g, ' ').trim(); const i = HIJRI.indexOf(n); return i >= 0 ? i + 1 : (HIJRI_ALT[n] || 0); };
const GREG_RE = Object.keys(GREG).sort((a, b) => b.length - a.length).join('|');
const HIJRI_RE = [...new Set(HIJRI.concat(Object.keys(HIJRI_ALT)))].sort((a, b) => b.length - a.length).map(s => s.replace(/ /g, '\\s+')).join('|');

function digits(s) {
  let out = '';
  for (const ch of String(s)) {
    const o = ch.codePointAt(0);
    if (o >= 0x0660 && o <= 0x0669) out += String.fromCharCode(o - 0x0660 + 48);
    else if (o >= 0x06F0 && o <= 0x06F9) out += String.fromCharCode(o - 0x06F0 + 48);
    else out += ch;
  }
  return out;
}
// Texte de travail : sans tatweel, voyelles ni marques de direction ; chiffres ASCII.
const strip = s => digits(s).replace(/[ـً-ْٰ‎‏‪-‮⁦-⁩]/g, '');
const bare = s => strip(s).replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ');

// Date grégorienne « 25 ماي 2026 » / « فاتح أبريل 2026 ».
const RE_G = new RegExp('(\\d{1,2}|فاتح)\\s*(' + GREG_RE + ')\\s*(\\d{4})', 'g');
// Date hégirienne « 8 ذو الحجة 1447 ».
const RE_H = new RegExp('(\\d{1,2}|فاتح)\\s*(?:من\\s+)?(' + HIJRI_RE + ')\\s*(\\d{4})', 'g');
const dnum = d => (d === 'فاتح' ? 1 : +d);
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

function gregDates(s) {
  const out = [];
  for (const m of s.matchAll(RE_G)) out.push({ iso: iso(+m[3], GREG[m[2]], dnum(m[1])), label: `${m[1]} ${m[2]} ${m[3]}`, index: m.index });
  return out;
}
function hijriDates(s) {
  const out = [];
  for (const m of s.matchAll(RE_H)) out.push({ d: dnum(m[1]), m: hijriMonth(m[2]), y: +m[3], label: `${m[1]} ${m[2].replace(/\s+/g, ' ')} ${m[3]}`, index: m.index, end: m.index + m[0].length });
  return out;
}
// Calendrier hégirien arithmétique (repère) : l'écart avec le calendrier
// marocain, fondé sur l'observation, ne dépasse pas deux jours.
function hijriToJdn(y, m, d) { return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439; }
function gregToJdn(isoDate) { const [y, m, d] = isoDate.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000) + 2440588; }
const addDays = (isoDate, n) => new Date(Date.UTC(+isoDate.slice(0, 4), +isoDate.slice(5, 7) - 1, +isoDate.slice(8, 10)) + n * 86400000).toISOString().slice(0, 10);

const LATIN = s => [...new Set((strip(s).match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9&.'’-]*/g) || []).map(w => w.replace(/[.'’-]+$/, '').toUpperCase()).filter(w => w.length > 1))];

export function runDecisionChecks(text) {
  const warnings = [];
  const warn = (kind, message) => { if (!warnings.some(w => w.message === message)) warnings.push({ kind, message }); };
  const paras = String(text || '').split('\n').map(p => strip(p).trim()).filter(Boolean);
  const B = paras.map(bare);
  const full = B.join('\n');
  const has = (...alts) => alts.some(a => full.includes(bare(a)));
  const iDisp = B.findIndex(p => p.includes('قرر ما يلي'));
  const iDelib = B.findIndex(p => p.startsWith('تم التداول'));
  const iOuv = B.findIndex(p => p.startsWith('ان مجلس المنافسة'));
  const before = iDisp >= 0 ? iDisp : paras.length;
  const isDerog = has('الاستثناء') && has('الفقرة الثانية من المادة 14', 'الفقرة 2 من المادة 14');

  // 1) Ordre des sections présentes.
  const MARKERS = [['ouverture', 'ان مجلس المنافسة'], ['visas', 'بناء على'], ['considérants', 'وحيث'], ['dispositif', 'قرر ما يلي'], ['délibération', 'تم التداول']];
  const present = [];
  for (const [name, mk] of MARKERS) { const i = full.indexOf(mk); if (i >= 0) present.push({ name, i }); }
  for (let i = 1; i < present.length; i++) {
    if (present[i].i < present[i - 1].i) warn('structure', `Ordre des sections inhabituel : « ${present[i].name} » apparaît avant « ${present[i - 1].name} ».`);
  }

  // 2) Visas des textes : numéros et dates de promulgation (données fixes).
  const TEXTES = [
    { nom: 'loi n° 104.12', re: /القانون رقم\s*(?:104[.\-]12|12[.\-]104)[^؛\n]*الظهير/, attendu: ['1.14.116', '2 رمضان 1435', '30 يونيو 2014'] },
    { nom: 'loi n° 20.13', re: /القانون رقم\s*(?:20[.\-]13|13[.\-]20)[^؛\n]*الظهير/, attendu: ['1.14.117', '2 رمضان 1435', '30 يونيو 2014'] },
    { nom: 'décret n° 2.14.652', re: /المرسوم رقم\s*2[.\-]14[.\-]652\s*الصادر/, attendu: ['8 صفر 1436', ['فاتح دجنبر 2014', 'فاتح ديسمبر 2014', '1 دجنبر 2014', '01 دجنبر 2014'], '104'] },
    { nom: 'décret n° 2.15.109', re: /المرسوم رقم\s*2[.\-]15[.\-]109\s*الصادر/, attendu: ['16 شعبان 1436', '4 يونيو 2015', '13'] },
  ];
  const sp = s => s.replace(/\s+/g, ' ').replace(/(\d)(?=[ء-ي])/g, '$1 ').replace(/([ء-ي])(?=\d)/g, '$1 ').replace(/(?:ل|لـ)\s*(?=فاتح|\d)/g, '').replace(/(\d)\s+من\s+(?=[\u0621-\u064A])/g, '$1 ').replace(/(?<!\d)0(\d)(?!\d)/g, '$1');
  for (const t of TEXTES) {
    const p = paras.slice(0, before).find(x => t.re.test(x));
    if (!p) { warn('visa', `Visa attendu absent ou incomplet : ${t.nom}.`); continue; }
    const P = sp(p);
    for (const a of t.attendu) {
      const alts = Array.isArray(a) ? a : [a];
      if (!alts.some(x => P.includes(x))) warn('visa', `Visa (${t.nom}) : mention attendue « ${alts[0]} » absente ou différente. Vérifier le numéro du dahir et les dates de promulgation.`);
    }
  }

  // 3) Dates : couples hégire / grégorien, cohérence et vraisemblance.
  const pairs = new Map();   // iso grégorien -> Set(libellé hégirien)
  for (const p of paras) {
    const hs = hijriDates(p), gs = gregDates(p);
    for (const h of hs) {
      if (h.d > 30 || h.d < 1) warn('date', `Date hégirienne impossible : « ${h.label} ».`);
      if (h.y < 1300 || h.y > 1500) { warn('date', `Année hégirienne erronée : « ${h.label} »${h.y > 1900 ? " (c'est un millésime grégorien)" : ''}.`); continue; }
      const g = gs.find(x => x.index >= h.end && x.index - h.end < 25);
      if (!g) continue;
      const k = `${h.d} ${h.m} ${h.y}`;
      if (!pairs.has(g.iso)) pairs.set(g.iso, new Map());
      pairs.get(g.iso).set(k, h.label);
      if (h.d >= 1 && h.d <= 30 && h.m) {
        const ecart = Math.abs(hijriToJdn(h.y, h.m, h.d) - gregToJdn(g.iso));
        if (ecart > 2) warn('date', `Correspondance de dates à vérifier : « ${h.label} » ne correspond pas à « ${g.label} » (écart d'environ ${ecart} jours).`);
      }
    }
  }
  for (const [g, hs] of pairs) {
    if (hs.size > 1) warn('date', `Une même date grégorienne (${g.split('-').reverse().join('/')}) reçoit deux dates hégiriennes différentes : ${[...hs.values()].map(x => `« ${x} »`).join(' et ')}.`);
  }

  // 4) Date de la décision : titre, réunion, présentation du rapport, délibération.
  const first = (p, after) => { if (!p) return null; const s = after ? p.slice(Math.max(0, p.indexOf(after))) : p; return gregDates(s)[0] || null; };
  const titre = paras.slice(0, iOuv >= 0 ? iOuv : 4);
  const dTitre = first(titre.find(p => p.includes('الصادر بتاريخ')), 'الصادر بتاريخ');
  const seances = [];
  if (dTitre) seances.push(['titre', dTitre]);
  paras.forEach((p, i) => {
    const b = B[i];
    if (i < before && /^و?بناء على اجتماع/.test(b)) { const d = first(p, 'المنعقد'); if (d) seances.push(['visa de la réunion', d]); }
    if (i < before && /^و?بعد تقديم/.test(b) && b.includes('المنعقد')) { const d = first(p, 'المنعقد'); if (d) seances.push(['présentation du rapport', d]); }
    if (i === iDelib) { const d = first(p); if (d) seances.push(['délibération', d]); }
  });
  const dSeance = seances.length ? seances[0][1] : null;
  const distinctes = [...new Set(seances.map(s => s[1].iso))];
  if (distinctes.length > 1) warn('date', `Date de la décision incohérente : ${seances.map(([n, d]) => `${n} « ${d.label} »`).join(' ; ')}.`);

  // 5) Numéro de la décision : millésime conforme à la date.
  const mNum = full.match(/قرار مجلس المنافسة\s*(?:تحت\s*)?عدد\s*(\d+)\s*\/\s*ق\s*\/\s*(\d{4})/);
  if (mNum && dSeance && mNum[2] !== dSeance.iso.slice(0, 4)) warn('cohérence', `Le numéro de la décision porte le millésime ${mNum[2]} alors qu'elle est datée de ${dSeance.iso.slice(0, 4)}.`);

  // 6) Dossier de notification : même numéro et même date dans les visas et à l'article premier.
  const reDossier = /عدد\s*(\d+)\s*\/\s*ع\s*\.?\s*ت\s*\.?\s*[اإ]\s*\.?\s*\/\s*(\d{4})/g;
  const dossiers = [];
  paras.forEach((p, i) => { for (const m of p.matchAll(reDossier)) { const d = gregDates(p.slice(m.index))[0]; dossiers.push({ num: m[1], an: m[2], date: d && d.index < 90 ? d : null, i }); } });
  const nums = [...new Set(dossiers.map(d => `${d.num}/${d.an}`))];
  if (nums.length > 1) warn('cohérence', `Numéro de dossier de notification incohérent : ${nums.join(' et ')}. Il doit être identique dans les visas et à l'article premier.`);
  const dd = [...new Set(dossiers.filter(d => d.date).map(d => d.date.iso))];
  if (dd.length > 1) warn('cohérence', `Date d'enregistrement du dossier incohérente : ${dossiers.filter(d => d.date).map(d => `« ${d.date.label} »`).filter((x, i, a) => a.indexOf(x) === i).join(' et ')}.`);
  const dDossier = (dossiers.find(d => d.date) || {}).date || null;

  // 7) Chronologie de la procédure.
  const etapes = [];
  paras.slice(0, before).forEach((p, i) => {
    const b = B[i];
    const add = (nom, after) => { const d = first(p, after); if (d) etapes.push({ nom, d }); };
    if (/^و?بناء على قرار المقرر العام/.test(b)) add('désignation du rapporteur', 'بتاريخ');
    else if (/^و?بعد تبليغ السلطة الحكومية/.test(b)) add('notification à l\'autorité gouvernementale', 'بتاريخ');
    else if (/^و?بعد نشر بلاغ/.test(b)) add('publication du communiqué', 'بتاريخ');
    else if (/^و?بعد استكمال/.test(b)) add('complétude du dossier', 'بتاريخ');
  });
  for (const e of etapes) {
    if (dDossier && e.d.iso < dDossier.iso) warn('chronologie', `Chronologie : ${e.nom} (« ${e.d.label} ») antérieure à l'enregistrement du dossier (« ${dDossier.label} »).`);
    if (dSeance && e.d.iso > dSeance.iso) warn('chronologie', `Chronologie : ${e.nom} (« ${e.d.label} ») postérieure à la date de la décision (« ${dSeance.label} »).`);
  }
  if (dDossier && dSeance && dDossier.iso > dSeance.iso) warn('chronologie', `Chronologie : dossier enregistré (« ${dDossier.label} ») après la date de la décision (« ${dSeance.label} »).`);
  const pub = etapes.find(e => e.nom === 'publication du communiqué');
  if (pub && dSeance && addDays(pub.d.iso, 10) > dSeance.iso) warn('chronologie', `Délai des observations des tiers : la décision (« ${dSeance.label} ») intervient moins de dix jours après la publication du communiqué (« ${pub.d.label} »).`);

  // 8) Formation : Commission permanente ou Section, jamais les deux.
  const cp = /اللجنة الدائمة/.test(full);
  const sec = /فرع مجلس المنافسة|فرع المجلس|رئيس الفرع|اعضاء الفرع|اجتماع الفرع|عضو الفرع|عضوة الفرع/.test(full);
  if (cp && sec) warn('formation', 'Formation incohérente : le texte cite à la fois la Commission permanente (« اللجنة الدائمة ») et la Section (« الفرع »).');
  const quorum = B.find(p => p.includes('النصاب القانوني'));
  if (quorum && sec && !cp && !/المادة 38 من النظام الداخلي/.test(quorum)) warn('formation', 'Quorum de la Section : la référence attendue est « المادة 38 من النظام الداخلي ».');
  if (quorum && cp && !sec && !/المادة 14 من القانون رقم\s*(?:20[.\-]13|13[.\-]20)/.test(quorum)) warn('formation', 'Quorum de la Commission permanente : la référence attendue est « المادة 14 من القانون رقم 20.13 ».');

  // 9) Signataires : chacun doit figurer dans le paragraphe de délibération.
  if (iDelib >= 0) {
    const delib = B[iDelib].replace(/\s+/g, ' ');
    for (const p of paras.slice(iDelib + 1)) {
      for (const m of bare(p).matchAll(/(?:رئيس[^:]{0,30}|نائبة? الرئيس|عضوة? الفرع|عضوة?)\s*:\s*([^:]+?)(?=\s{2,}|\s+(?:نائبة? الرئيس|عضوة? الفرع|رئيس)\s*:|$)/g)) {
        const nom = m[1].replace(/\s+/g, ' ').trim();
        if (nom && nom.length < 40 && !delib.includes(nom)) warn('signataires', `Signataire « ${nom} » absent du paragraphe de délibération.`);
      }
    }
  }

  // 10) Rapporteur : accord en genre sur tout le texte.
  const mRap = full.match(/بتعيين السيد(ة?)\s+[^،؛\n]{2,40}?\s+مقرر(ة?|ا)\s+في الموضوع/);
  if (mRap) {
    const fem = mRap[1] === 'ة';
    if (fem !== (mRap[2] === 'ة')) warn('accord', `Accord du rapporteur : « السيد${mRap[1]} … مقرر${mRap[2]} في الموضوع ».`);
    if (fem && /مقرر الموضوع/.test(full)) warn('accord', 'Accord : la rapporteure est une femme (« السيدة … مقررة »), mais le texte porte « مقرر الموضوع ».');
    if (!fem && /مقررة الموضوع/.test(full)) warn('accord', 'Accord : le rapporteur est un homme (« السيد … مقررا »), mais le texte porte « مقررة الموضوع ».');
  }

  // 11) Parties : mêmes dénominations dans le titre et à l'article deux.
  if (!isDerog && iDisp >= 0) {
    const art2 = paras.slice(iDisp + 1, iDelib >= 0 ? iDelib : undefined).find(p => /يرخص مجلس المنافسة/.test(bare(p)));
    const tWords = LATIN(titre.join(' ')), aWords = art2 ? LATIN(art2) : [];
    if (tWords.length && aWords.length) {
      const manque = tWords.filter(w => !aWords.includes(w)), plus = aWords.filter(w => !tWords.includes(w));
      if (manque.length || plus.length) warn('parties', `Dénominations différentes entre le titre et l'article deux : ${manque.length ? `dans le titre seulement « ${manque.join(' ')} »` : ''}${manque.length && plus.length ? ' ; ' : ''}${plus.length ? `à l'article deux seulement « ${plus.join(' ')} »` : ''}.`);
    }
  }

  // 12) Éléments de fond attendus (présence).
  const need = (label, ok) => { if (!ok) warn('conformité', `Élément de fond attendu absent : ${label}.`); };
  need("qualification au sens de l'article 11", has('المادة 11'));
  need("seuils de l'article 12", has('المادة 12'));
  if (isDerog) {
    need('autorisation à titre exceptionnel (art. 14, 2e alinéa)', has('بصفة استثنائية'));
  } else {
    need('visa de la notification à l\'autorité gouvernementale', has('تبليغ السلطة الحكومية'));
    need('visa de la publication du communiqué', has('نشر بلاغ'));
    need('définition du marché pertinent', has('السوق المعنية', 'الأسواق المعنية', 'السوقين المعنيتين', 'تحديد السوق', 'تحديد الأسواق'));
    need('analyse des effets horizontaux', has('أفقي', 'الأفقية'));
    need('analyse des effets verticaux', has('عمودي', 'العمودية'));
    need('analyse des effets congloméraux', has('تكتل', 'التكتلية'));
    need('dispositif, article premier (« يستوفي الشروط القانونية »)', has('يستوفي الشروط القانونية'));
    need('dispositif, article deux (« يرخص مجلس المنافسة »)', has('يرخص مجلس المنافسة'));
  }
  need('visa de la désignation du rapporteur (article 27)', has('بتعيين'));
  need('paragraphe de délibération (« تم التداول »)', iDelib >= 0);
  return warnings;
}
