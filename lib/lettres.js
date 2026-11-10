// lib/lettres.js
// Contrôles DÉTERMINISTES des lettres (français et arabe), sans le modèle :
//  - jour de la semaine conforme à la date ;
//  - audition et date limite de réponse fixées un jour ouvré (ni samedi, ni
//    dimanche, ni jour férié) ;
//  - délai minimal entre l'envoi et l'audition, et entre l'envoi et la date
//    limite de réponse ;
//  - date limite de réponse précise (pas « قبيل الجلسة », « dans les meilleurs
//    délais ») et antérieure ou égale à l'audition ;
//  - chronologie : courriers, décisions et réunions cités antérieurs à l'envoi ;
//    année du numéro de décision conforme à sa date ; numéros de courriers
//    croissants avec leurs dates ;
//  - emplacements non remplis ; pièces jointes et référence annoncées.
// Chaque contrôle produit un avertissement (aucune correction automatique).

import { parseISO, toISO, weekday, formatLongFR } from './dates.js';
import { holidayOn } from './feries.js';

const MOIS_AR = {
  'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'ابريل': 4, 'إبريل': 4, 'ماي': 5, 'مايو': 5,
  'يونيو': 6, 'يونيه': 6, 'يوليوز': 7, 'يوليو': 7, 'غشت': 8, 'أغسطس': 8, 'شتنبر': 9, 'سبتمبر': 9,
  'أكتوبر': 10, 'اكتوبر': 10, 'نونبر': 11, 'نوفمبر': 11, 'دجنبر': 12, 'ديسمبر': 12,
};
const MOIS_FR = {
  janvier: 1, 'février': 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7,
  'août': 8, aout: 8, septembre: 9, octobre: 10, novembre: 11, 'décembre': 12, decembre: 12,
};
const JOURS_AR = { 'الأحد': 0, 'الاحد': 0, 'الإثنين': 1, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الاربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6 };
const JOURS_FR = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };
const NOM_JOUR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const keys = o => Object.keys(o).sort((a, b) => b.length - a.length).join('|');
const latin = s => String(s).replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x0660));
// Marques de direction et tatweel retirés avant l'analyse (les positions ne servent qu'aux messages).
const clean = s => String(s || '').replace(/[‎‏‪-‮ـ]/g, '');
const isoOf = (y, m, d) => { const dt = new Date(Date.UTC(y, m - 1, d)); return dt.getUTCMonth() === m - 1 ? toISO(dt) : null; };
const isolate = s => (/[؀-ۿ]/.test(s) ? `⁨${s}⁩` : s);

// Dates en toutes lettres, avec le jour de la semaine éventuel.
//  AR : « يوم الخميس 29 أكتوبر 2026 », « فاتح أبريل 2026 », « 21 يناير2026 »
//  FR : « le lundi 3 novembre 2026 », « 1er avril 2026 »
const RE_AR = new RegExp(`(?:(?<jour>${keys(JOURS_AR)})\\s+)?(?<d>فاتح|[0-9٠-٩]{1,2})\\s*(?<m>${keys(MOIS_AR)})\\s*(?<y>[0-9٠-٩]{4})`, 'g');
const RE_FR = new RegExp(`(?:(?<jour>${keys(JOURS_FR)})\\s+)?(?<d>1er|[0-9]{1,2})\\s+(?<m>${keys(MOIS_FR)})\\s+(?<y>[0-9]{4})`, 'gi');

// Rôle d'une date selon ce qui la précède (fenêtre de 90 caractères, même paragraphe).
const CTX = {
  ar: {
    audition: /(?:جلسة|اجتماع|لقاء|المناظرة)[^.\n؛]{0,90}(?:يوم|بتاريخ)\s*$|(?:عقدها|ستعقد|سيتم\s+عقدها|المزمع\s+عقدها|المقرر\s+عقدها)\s*(?:يوم)?\s*$/,
    delai: /(?:أجل\s+أقصاه|أقصاه|في\s+أجل|داخل\s+أجل|قبل|في\s+موعد\s+أقصاه|لا\s+يتعدى)\s*(?:يوم)?\s*$/,
    passe: /(?:بتاريخ|الصادر|الصادرة|المؤرخ|المؤرخة|توصل|عقب|بعد)\s*(?:في|يوم)?\s*$/,
    // Événement déjà intervenu (« عقب عقد جلسة إنصات بتاريخ … ») : prioritaire.
    anterieur: /(?<![\u0621-\u064A])[وف]?(?:عقب|إثر|بعد|تم\s+عقد|عقدت|انعقدت|المنعقدة)(?![\u0621-\u064A])[^.\n؛]{0,60}(?:بتاريخ|يوم)\s*$/,
    liste: new RegExp(`(?:${keys(MOIS_AR)})\\s*(?:[0-9]{4})?\\s*و\\s*$`),
  },
  fr: {
    audition: /(?:audition|réunion|entretien|séance)[^.\n;]{0,90}(?:le|du)\s*$|(?:tiendra|se\s+tiendra|prévue|fixée)\s+(?:le|au)\s*$/i,
    delai: /(?:au\s+plus\s+tard\s+le|ne\s+dépassant\s+pas\s+le|avant\s+le|d'ici\s+le|jusqu'au)\s*$/i,
    passe: /(?:en\s+date\s+du|du|daté[e]?\s+du|reçu[e]?\s+le|notifié[e]?\s+(?:au\s+[^,.]{0,60})?le|réalisée?\s+(?:antérieurement\s+)?le|tenue?\s+le|le)\s*$/i,
    anterieur: /(?:à\s+la\s+suite\s+de|après|suite\s+à|tenue?|intervenue?)[^.\n;]{0,60}(?:le|du)\s*$/i,
    liste: /(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(?:[0-9]{4})?\s*(?:et|,)\s*$/i,
  },
};

export function extractLetterDates(text, lang) {
  const out = [];
  const lines = clean(text).split('\n');
  lines.forEach((line, li) => {
    const re = lang === 'ar' ? RE_AR : RE_FR;
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line))) {
      const g = m.groups;
      const day = g.d === 'فاتح' ? 1 : +latin(g.d.replace(/er$/i, ''));
      const month = lang === 'ar' ? MOIS_AR[g.m] : MOIS_FR[g.m.toLowerCase()];
      const iso = isoOf(+latin(g.y), month, day);
      if (!iso) continue;
      let before = line.slice(Math.max(0, m.index - 140), m.index);
      if (m.index < 12 && li > 0) before = (lines[li - 1] + ' ' + before).slice(-140);
      const c = CTX[lang];
      const role = c.anterieur.test(before) ? 'passe'
        : c.audition.test(before) ? 'audition' : c.delai.test(before) ? 'delai'
        : c.passe.test(before) || c.liste.test(before) ? 'passe' : 'autre';
      const jour = g.jour ? (lang === 'ar' ? JOURS_AR[g.jour] : JOURS_FR[g.jour.toLowerCase()]) : null;
      out.push({ iso, text: m[0], jour, role, line: li, index: m.index });
    }
  });
  // Listes de dates partageant l'année : « 25 مارس و25 ماي و19 يونيو 2026 »
  if (lang === 'ar') {
    const reList = new RegExp(`(?<d>فاتح|[0-9]{1,2})\\s*(?<m>${keys(MOIS_AR)})\\s+و\\s*(?=(?:فاتح|[0-9]{1,2})\\s*(?:${keys(MOIS_AR)}))`, 'g');
    lines.forEach((line, li) => {
      let m;
      while ((m = reList.exec(line))) {
        const yr = /([0-9]{4})/.exec(line.slice(m.index));
        if (!yr) continue;
        const iso = isoOf(+yr[1], MOIS_AR[m.groups.m], m.groups.d === 'فاتح' ? 1 : +m.groups.d);
        if (iso && !out.some(x => x.line === li && x.index === m.index)) out.push({ iso, text: m[0].replace(/\s+و\s*$/, ''), jour: null, role: 'passe', line: li, index: m.index });
      }
    });
  }
  return out;
}

const isWeekend = iso => [0, 6].includes(weekday(iso));
// Décret n° 2-14-652, art. 18 : « Sauf cas d'urgence, les convocations aux
// auditions sont faites dans un délai qui ne peut être inférieur à une semaine
// de l'audience. » Aucun minimum légal pour la réponse à une demande
// d'informations : le délai est celui que fixe la lettre (loi 104-12, art. 29
// et 73 : « dans le délai prescrit »).
export const DELAI_AUDITION_LEGAL = 7;
// Règle du Conseil (décision du 3 novembre 2026) : jamais moins de 10 jours pour répondre.
export const DELAI_REPONSE_MIN = 10;

const VAGUE = {
  ar: /(?:قبيل\s+(?:جلسة|الجلسة|موعد)|قبل\s+(?:موعد\s+)?(?:انعقاد\s+)?(?:ال)?جلسة|قبل\s+موعد\s+(?:ال)?اجتماع|في\s+أقرب\s+(?:الآجال|وقت)|في\s+أسرع\s+وقت|في\s+الوقت\s+المناسب|عاجلا)/,
  fr: /(?:dans\s+les\s+meilleurs\s+délais|dès\s+que\s+possible|au\s+plus\s+vite|rapidement|dans\s+un\s+délai\s+raisonnable|avant\s+(?:la\s+tenue\s+de\s+)?l['’]audition)/i,
};
const DEMANDE_INFO = {
  ar: /(?:موافاة|بموافاة|الإدلاء|تزويد|بالمعطيات|بالمعلومات|بالعناصر|بالوثائق|بنسخة)/,
  fr: /(?:fournir|transmettre|communiquer|faire\s+parvenir|adresser)\b/i,
};
const CONVOCATION = { ar: /جلسة\s+(?:الاستماع|استماع|إنصات|الإنصات)/, fr: /\baudition\b/i };
const PLACEHOLDER = /…{2,}|\.{4,}|_{3,}|\bX{2,}\b|\[[^\]]{0,30}\]|(?:بتاريخ|شركة|السيد|Monsieur|Madame|société|le)\s*$/m;

/**
 * @param {object} p
 * @param {string} p.text        texte de la lettre (un paragraphe par ligne)
 * @param {'lettre_ar'|'lettre_fr'} p.docType
 * @param {string} [p.envoi]     date d'envoi prévue, AAAA-MM-JJ (défaut : aucune)
 * @param {object} [p.delais]    { audition: jours minimum, reponse: jours minimum }
 * @returns {{warnings: {kind:string, message:string}[], dates: object[]}}
 */
export function runLetterChecks({ text, docType, envoi, delais = {} }) {
  delais = { audition: DELAI_AUDITION_LEGAL, reponse: DELAI_REPONSE_MIN, ...delais };
  const lang = docType === 'lettre_ar' ? 'ar' : 'fr';
  const warnings = [];
  const warn = (kind, message) => warnings.push({ kind, message });
  const T = clean(text);
  const dates = extractLetterDates(T, lang);
  const env = envoi && parseISO(envoi) ? envoi : null;

  for (const d of dates) {
    const label = `« ${isolate(d.text)} »`;
    // 1. Jour de la semaine
    if (d.jour !== null && d.jour !== weekday(d.iso)) {
      warn('date', `${label} : le ${formatLongFR(d.iso).replace(/^\S+\s/, '')} est un ${NOM_JOUR[weekday(d.iso)]}, pas un ${NOM_JOUR[d.jour]}.`);
    }
    if (d.role === 'audition' || d.role === 'delai') {
      const quoi = d.role === 'audition' ? "L'audition" : 'La date limite de réponse';
      // 2. Jour ouvré
      if (isWeekend(d.iso)) warn('date', `${quoi} ${label} tombe un ${NOM_JOUR[weekday(d.iso)]}.`);
      const h = holidayOn(d.iso);
      if (h) warn('date', `${quoi} ${label} tombe un jour férié : ${h.nom}${h.estime ? ' (date religieuse estimée, à confirmer)' : ''}.`);
      // 3. Délais à compter de l'envoi
      if (env) {
        if (d.iso <= env) warn('date', `${quoi} ${label} n'est pas postérieure à la date d'envoi (${formatLongFR(env)}).`);
        else {
          // Délais en jours calendaires (le décret parle d'« une semaine »).
          const n = Math.round((parseISO(d.iso) - parseISO(env)) / 86400000);
          const min = d.role === 'audition' ? (delais.audition ?? DELAI_AUDITION_LEGAL) : delais.reponse;
          if (min && n < min) {
            const base = d.role === 'audition' && min <= DELAI_AUDITION_LEGAL
              ? " ; le décret n° 2-14-652 (art. 18) exige au moins une semaine entre la convocation et l'audition, sauf urgence"
              : d.role === 'delai' && min === DELAI_REPONSE_MIN
                ? ` ; la règle du Conseil accorde au moins ${DELAI_REPONSE_MIN} jours pour répondre`
                : ` ; minimum retenu : ${min} jours`;
            warn('delai', `${quoi} ${label} n'est qu'à ${n} jour(s) de l'envoi (${formatLongFR(env)})${base}.`);
          }
        }
      }
    }
    // 4. Chronologie : ce qui est cité comme passé doit précéder l'envoi
    if (d.role === 'passe' && env && d.iso > env) warn('chronologie', `${label} est cité comme antérieur, mais il est postérieur à la date d'envoi (${formatLongFR(env)}).`);
  }

  // 5. Date limite de réponse : présente, précise, antérieure à l'audition
  const auditions = dates.filter(d => d.role === 'audition');
  const delaisR = dates.filter(d => d.role === 'delai');
  const demandeInfo = DEMANDE_INFO[lang].test(T);
  const vague = VAGUE[lang].exec(T);
  if (vague) warn('delai', `Délai de réponse imprécis : « ${isolate(vague[0])} ». Indiquer une date précise.`);
  const lieAuJourDeLaJournee = lang === 'ar' ? /أقصاه\s+يوم\s+الجلسة/.test(T) : /au\s+plus\s+tard\s+le\s+jour\s+de\s+l['’]audition/i.test(T);
  if (demandeInfo && !delaisR.length && !vague && !lieAuJourDeLaJournee) warn('delai', 'Des informations sont demandées sans date limite de réponse précise.');
  if (auditions.length && delaisR.length) {
    const a = auditions[0].iso;
    for (const r of delaisR) if (r.iso > a) warn('delai', `La date limite de réponse « ${isolate(r.text)} » est postérieure à l'audition « ${isolate(auditions[0].text)} ».`);
  }
  if (CONVOCATION[lang].test(T) && /(?:يشرفني\s+أن\s+(?:أدعوكم|أطلب)|ملزمون\s+بحضور|je\s+vous\s+(?:invite|prie)|convoqu)/i.test(T)) {
    if (!auditions.length) warn('audition', "Convocation à une audition sans date d'audition reconnue.");
    else if (!(lang === 'ar' ? /الساعة/ : /(?:^|\s)à\s+\d{1,2}\s*(?:h|heures?)\b/i).test(T)) warn('audition', "Convocation à une audition sans heure.");
  }

  // 6. Décisions : année du numéro = année de la date
  const reDec = lang === 'ar'
    ? /(?:عدد\s*)?([0-9]+)\s*\/\s*ق\s*\/\s*([0-9]{4})[^\n]{0,40}?بتاريخ\s*/g
    : /n°\s*([0-9]+)\s*\/\s*([0-9]{4})[^\n]{0,40}?(?:du|en\s+date\s+du)\s*/gi;
  let md;
  while ((md = reDec.exec(T))) {
    const after = T.slice(md.index + md[0].length);
    const dd = extractLetterDates(after.split('\n')[0], lang).find(x => x.index === 0);
    if (dd && dd.iso.slice(0, 4) !== md[2]) warn('chronologie', `Décision « ${isolate(md[0].trim())} ${isolate(dd.text)} » : l'année du numéro (${md[2]}) ne correspond pas à celle de la date (${dd.iso.slice(0, 4)}).`);
  }

  // 7. Numéros de courriers croissants avec leurs dates (« رسالاتي رقم 320، و627، و751 بتاريخ 25 مارس و25 ماي و19 يونيو 2026 »)
  if (lang === 'ar') {
    const mm = /رسالات[يه]?\s+رقم\s+([0-9،,\sو]+?)\s+بتاريخ\s+([^\n]+)/.exec(T);
    if (mm) {
      const nums = (mm[1].match(/[0-9]+/g) || []).map(Number);
      const ds = extractLetterDates(mm[2], 'ar').sort((a, b) => a.index - b.index).map(d => d.iso);
      if (nums.length > 1 && nums.length === ds.length) {
        for (let i = 1; i < nums.length; i++) if ((nums[i] > nums[i - 1]) !== (ds[i] > ds[i - 1])) { warn('chronologie', 'Les numéros des courriers cités ne suivent pas l’ordre de leurs dates.'); break; }
      }
    }
  }

  // 8. Emplacements non remplis
  T.split('\n').forEach(l => {
    const p = PLACEHOLDER.exec(l);
    if (!p || !l.trim().length) return;
    const extrait = l.slice(Math.max(0, p.index - 40), p.index + p[0].length).replace(/\s{2,}/g, ' ').trim();
    warn('emplacement', `Emplacement non rempli : « ${isolate(extrait)} ».`);
  });

  // 9. Pièces jointes et référence
  if (lang === 'ar') {
    const annonce = /(?:رفقته|طيه|رفقة\s+هذه|تجدون\s+[^.\n]{0,20}نسخة)/.test(T);
    const ligne = /^\s*المرفقات\s*(?::|$)/m.test(T);
    if (annonce && !ligne) warn('structure', 'Pièce jointe annoncée dans le corps sans ligne « المرفقات : ».');
    if (!annonce && ligne) warn('structure', 'Ligne « المرفقات : » sans pièce annoncée dans le corps.');
    if (/(?:رسال|مراسل|إحالت|كتاب|شكايت|طلب)[\u0621-\u064A]*\s+(?:[^.\n]{0,40}?\s)?المشار\s+إليها?\s+(?:في\s+المرجع\s+)?أعلاه/.test(T) && !/^\s*(?:المرجع|المراجع)\s*(?::|$)/m.test(T)) warn('structure', 'Le corps renvoie à un courrier « المشار إليها أعلاه » sans ligne « المرجع : ».');
  } else {
    if (/ci-joint|en\s+annexe|vous\s+trouverez\s+(?:ci-joint|en\s+pièce)/i.test(T) && !/^\s*(?:P\.\s*J\.|Pièces?\s+jointes?)\s*:/im.test(T)) warn('structure', 'Pièce jointe annoncée sans ligne « P.J. : ».');
    if (/ci-dessus\s+référencée|susvisée|visée\s+en\s+référence/i.test(T) && !/^\s*(?:Réf(?:érence)?s?\.?)\s*:/im.test(T)) warn('structure', 'Le corps renvoie à un courrier référencé sans ligne « Référence : ».');
  }
  return { warnings, dates };
}

// --- Corrections déterministes de protocole (lettres arabes) -----------------
// Deux catégories de destinataires :
//  - « public » : ministres, et dirigeants d'administrations ou d'établissements
//    publics (directeur, directeur général, président, wali…). En-tête précédé
//    de la ligne « الفاضل المحترم » / « الفاضلة المحترمة » ; formules
//    « يشرفني أن أحيط سيادتكم علما » et « أطلب منكم التفضل مشكورين ».
//  - « autre » (sociétés, associations, avocats, personnes physiques…) :
//    « يشرفني أن أحيطكم علما » et « أطلب من سيادتكم », sans « التفضل مشكورين ».
// La catégorie est déduite de l'en-tête, ou imposée par l'utilisateur
// (destinataire = 'public' | 'autre'). Indéterminée : aucune correction.
// Pour un ministre, la clôture reçoit « المحترم(ة) » et le genre suit l'en-tête
// ou la correction sourcée de la vérification en ligne (fusionnée ici).
// Ces corrections sont « exclusives » : une suggestion du modèle sur le même
// passage est écartée.
const RE_MINISTRE = /^(?:الفاضل(?:ة)?\s+المحترم(?:ة)?\s+)?(السيد(?:ة)?)\s+(?:ال)?وزير(?:ة)?(?:[\s‎‏]|$)/;
const RE_DIRIGEANT = /^(?:الفاضل(?:ة)?\s+المحترم(?:ة)?\s+)?(السيد(?:ة)?)\s+(?:ال)?(?:مدير(?:ة)?|رئيس(?:ة)?|والي|عامل|كاتب(?:ة)?|مندوب(?:ة)?|مفوض|محافظ|خازن|مفتش|عميد|وسيط)(?:[\s‎‏]|$)/;
const RE_HONORIFIQUE = /^الفاضل(?:ة)?\s+المحترم(?:ة)?\s*[،,]?\s*$/;
const honorifique = f => (f ? 'الفاضلة المحترمة' : 'الفاضل المحترم');
// Indices d'une entité privée ou associative, puis d'une entité publique.
const RE_PRIVE = /شركة|شركات|مجموعة|مسير|جمعية|فيدرالية|الجامعة\s+المغربية\s+لحقوق|نقابة|اتحاد|كونفدرالية|تعاونية|تجمع|غرفة|الأستاذ|محاماة|محامي|[A-Za-z]{3,}/;
const RE_PUBLIC = /وكال(?:ة|ات)|(?:ال)?مكتب|مديري(?:ة|ات)|(?:ال)?إدارة|(?:ال)?هيئة|(?:ال)?صندوق|(?:ال)?مجلس|(?:ال)?مؤسسة|بنك\s+المغرب|(?:ال)?مندوبية|(?:ال)?مرصد|(?:ال)?معهد|(?:ال)?خزينة|(?:ال)?مركز|(?:ال)?سلطة|وزارة|(?:ال)?جهة|ولاية|عمالة|إقليم|جماعة|الحكومة|(?:ال)?محكمة|النيابة|(?:ال)?مقاولات\s+العمومية/;
const RE_COMMISSAIRE = /مندوب(?:ة)?\s+الحكومة\s+لدى\s+مجلس\s+المنافسة/;
// Noms d'action qui suivent « التفضل مشكورين بـ » dans les lettres du Conseil.
const MASDAR = '(?:موافا[ةت]|انتداب|دعوة|إبداء|مد(?=ي|نا|\\s)|تزويد|إرسال|حضور|تعيين|إفادة|إحالة|توجيه|تمكين|إخبار|إشعار|تقديم|إعطاء)';

// Formules selon la catégorie : [motif, remplacement(m) -> texte | null si la
// réécriture demande une relecture, libellé].
function formules(cat) {
  const B = '(?<![\\u0621-\\u064A])';
  const pub = cat === 'public';
  const reM = new RegExp('^(?:ب)?' + MASDAR);
  return [
    [pub ? new RegExp(B + 'أحيطكم\\s+علما', 'g') : new RegExp(B + 'أحيط\\s+سيادتكم\\s+علما', 'g'), () => (pub ? 'أحيط سيادتكم علما' : 'أحيطكم علما'), "Formule d'information"],
    [new RegExp(B + '(?<pre>[وف]?)(?<v>[أن]طلب)\\s+(?<a>منكم|من\\s+سيادتكم)(?<t>\\s+التفضل(?:\\s+مشكورين)?)?\\s+(?<n>\\S+)', 'g'), m => {
      const { pre, t, n } = m.groups;
      if (pub) {
        if (t) return `${pre}أطلب منكم التفضل مشكورين ${n}`;
        if (reM.test(n) && !n.startsWith('ب')) return `${pre}أطلب منكم التفضل مشكورين ب${n}`;
        return null;
      }
      if (!t) return `${pre}أطلب من سيادتكم ${n}`;
      if (n.startsWith('ب') && reM.test(n)) return `${pre}أطلب من سيادتكم ${n.slice(1)}`;
      return null;
    }, 'Formule de demande'],
  ];
}
/** Aligne un texte libre (suggestion du modèle) sur les formules de la catégorie. */
export function applyLetterFormulas(str, cat) {
  let out = String(str || '');
  if (!cat) return out;
  for (const [re, fn] of formules(cat)) out = out.replace(re, (...a) => { const m = [a[0]]; m.groups = a[a.length - 1]; const v = fn(m); return v === null ? a[0] : v; });
  return out;
}

/** Catégorie du destinataire d'une lettre arabe : { cat, ministre, feminin, ligne } */
export function letterAddressee(text, force) {
  const lines = String(text || '').split('\n');
  let end = lines.findIndex(l => /سلام\s+تام|^\s*الموضوع/.test(l));
  if (end < 0) end = Math.min(lines.length, 8);
  const head = lines.slice(0, end).map(clean).join(' ');
  let ligne = -1, ministre = false, feminin = null;
  for (let i = 0; i < end; i++) {
    const L = clean(lines[i].trim());
    if (RE_MINISTRE.test(L)) { ligne = i; ministre = true; break; }
  }
  if (ligne < 0) for (let i = 0; i < end; i++) {
    const L = clean(lines[i].trim());
    if (RE_DIRIGEANT.test(L)) { ligne = i; break; }
  }
  if (ligne >= 0) feminin = /^(?:الفاضل(?:ة)?\s+المحترم(?:ة)?\s+)?السيدة/.test(clean(lines[ligne].trim()));
  let cat = null;
  if (ministre) cat = 'public';
  else if (force === 'public' || force === 'autre') cat = force;
  else if (RE_COMMISSAIRE.test(head)) cat = null;          // Commissaire du Gouvernement : formules propres
  else if (RE_PRIVE.test(head)) cat = 'autre';
  else if (ligne >= 0 && RE_PUBLIC.test(head)) cat = 'public';
  else if (/^\s*(?:السيد(?:ة)?|الأستاذ(?:ة)?)\s/m.test(lines.slice(0, end).map(l => clean(l.trim())).join('\n')) && ligne < 0) cat = 'autre';
  return { cat, ministre, feminin, ligne, end };
}

export function letterCorrections({ text, docType, verifCorrections = [], destinataire }) {
  const corrections = [], merged = new Set();
  if (docType !== 'lettre_ar') return { corrections, merged, categorie: null };
  const lines = String(text || '').split('\n');
  const dest = letterAddressee(text, destinataire);
  const { cat, ministre, ligne } = dest;
  let feminin = dest.feminin;
  const push = (original, suggested, reason) => { if (original !== suggested) corrections.push({ type: 'forme', code: 'LG-09', original, suggested, reason, deterministic: true, exclusive: true }); };
  const qui = ministre ? "d'un ministre" : "d'un dirigeant d'administration ou d'établissement public";

  // 1. En-tête : ligne « الفاضل المحترم » avant la qualité (catégorie « public »).
  if (cat === 'public' && ligne >= 0) {
    const i = ligne, L = lines[i].trim();
    let Lnew = L;
    verifCorrections.forEach((v, k) => { if (v.original && Lnew.includes(v.original)) { Lnew = Lnew.replace(v.original, v.suggested); merged.add(k); } });
    Lnew = Lnew.replace(/\s+المحترم(?:ة)?\s*$/, '');            // jamais « المحترم » après la qualité
    const surMemeLigne = /^الفاضل/.test(Lnew);
    const base = surMemeLigne ? Lnew.replace(/^الفاضل(?:ة)?\s+المحترم(?:ة)?\s+/, '') : Lnew;
    feminin = /^السيدة/.test(clean(base));
    const hon = honorifique(feminin);
    let prev = -1;
    for (let j = i - 1; j >= 0; j--) if (lines[j].trim()) { prev = j; break; }
    const P = prev >= 0 ? lines[prev].trim() : '';
    if (surMemeLigne) {
      push(L, `${hon} ${base}`, `Formule d'en-tête ${qui} : « ${hon} ».`);
    } else if (RE_HONORIFIQUE.test(clean(P))) {
      if (clean(P).replace(/[\s،,]+$/, '') !== hon) push(P, hon, `Formule d'en-tête accordée au genre du destinataire : « ${hon} ».`);
      push(L, Lnew, 'Qualité du destinataire.');
    } else {
      push(L, `${hon}\n${Lnew}`, `Avant la qualité ${qui}, la ligne « ${hon} ».`);
    }
  }

  // 2. Clôture d'un ministre : « وتفضلوا، السيد الوزير المحترم، ».
  if (ministre && feminin !== null) {
    const reClo = /وتفضلوا\s*[،,]?\s*(السيد(?:ة)?\s+(?:ال)?وزير(?:ة)?)((?:\s+المنتدب(?:ة)?)?)((?:\s+المحترم(?:ة)?)?)\s*([،,])/;
    for (const line of lines) {
      const m = reClo.exec(line);
      if (!m) continue;
      const voulu = `${feminin ? 'السيدة الوزيرة' : 'السيد الوزير'}${m[2] ? (feminin ? ' المنتدبة' : ' المنتدب') : ''} ${feminin ? 'المحترمة' : 'المحترم'}`;
      const actuel = `${m[1]}${m[2]}${m[3]}`;
      if (actuel.replace(/\s+/g, ' ') !== voulu) push(m[0], m[0].replace(actuel, voulu), `Clôture d'une lettre à un ministre : « ${voulu} ».`);
      break;
    }
  }

  // 3. Formules d'information et de demande, selon la catégorie. Non
  // exclusives : une suggestion plus large du modèle est conservée, après
  // alignement sur ces mêmes formules (applyLetterFormulas).
  const warnings = [];
  if (cat) {
    const pour = cat === 'public' ? 'ministre ou dirigeant d\'établissement public' : 'destinataire autre qu\'un ministre ou un dirigeant d\'établissement public';
    for (const [re, fn, nom] of formules(cat)) {
      for (const m of String(text || '').matchAll(re)) {
        const voulu = fn(m);
        if (voulu === null) warnings.push({ kind: 'formule', message: cat === 'public'
          ? `Formule de demande attendue pour ce destinataire : « أطلب منكم التفضل مشكورين بـ… » (trouvé : « \u2068${m[0]}\u2069 »).`
          : `Formule de demande attendue pour ce destinataire : « أطلب من سيادتكم … », sans « التفضل مشكورين » (trouvé : « \u2068${m[0]}\u2069 »).` });
        else if (voulu !== m[0]) corrections.push({ type: 'forme', code: 'LG-09', original: m[0], suggested: voulu, reason: `${nom} (${pour}).`, deterministic: true });
      }
    }
  }
  return { corrections, merged, categorie: cat, ministre, warnings };
}
