// lib/dates.js
// Dates des communiqués : calcul de la date limite des observations et
// insertion / rectification DETERMINISTE des dates dans les textes FR et AR.
// Module partagé par le serveur (api/analyze.js, api/compare.js) et par
// l'interface (src/App.jsx) : une seule implémentation de la règle.
//
// Règle du Conseil : le communiqué est publié le jeudi ; la date limite des
// observations est J+10, reportée au lundi suivant si elle tombe un samedi ou
// un dimanche. Publication un jeudi => date limite le lundi qui suit (J+11).

export const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
// Noms des mois selon l'usage marocain (utilisé à l'écriture).
export const MOIS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
const JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// Formes reconnues à la lecture (usage marocain et usage oriental).
const LECTURE_FR = {
  janvier: 1, 'février': 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7,
  'août': 8, aout: 8, 'aoû': 8, septembre: 9, octobre: 10, novembre: 11, 'décembre': 12, decembre: 12,
};
const LECTURE_AR = {
  'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'ابريل': 4, 'إبريل': 4, 'ماي': 5, 'مايو': 5,
  'يونيو': 6, 'يونيه': 6, 'يوليوز': 7, 'يوليو': 7, 'غشت': 8, 'أغسطس': 8, 'شتنبر': 9, 'سبتمبر': 9,
  'أكتوبر': 10, 'اكتوبر': 10, 'نونبر': 11, 'نوفمبر': 11, 'دجنبر': 12, 'ديسمبر': 12,
};
const byLength = obj => Object.keys(obj).sort((a, b) => b.length - a.length).join('|');

// --- Calcul -----------------------------------------------------------------

// Les dates sont manipulées en UTC pour éviter tout décalage de fuseau.
export function parseISO(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return null;
  const dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return (dt.getUTCMonth() === +m[2] - 1) ? dt : null;
}
export const toISO = dt => dt.toISOString().slice(0, 10);
export function addDays(dt, n) { const r = new Date(dt.getTime()); r.setUTCDate(r.getUTCDate() + n); return r; }
const isoOf = (y, m, d) => { const dt = new Date(Date.UTC(y, m - 1, d)); return dt.getUTCMonth() === m - 1 ? toISO(dt) : null; };

// Date limite : J+10, reportée au lundi si elle tombe un samedi ou un dimanche.
export function computeDeadline(pubISO) {
  const p = parseISO(pubISO);
  if (!p) return '';
  let d = addDays(p, 10);
  const wd = d.getUTCDay();
  if (wd === 6) d = addDays(d, 2);
  else if (wd === 0) d = addDays(d, 1);
  return toISO(d);
}

// Prochain jeudi, aujourd'hui inclus.
export function nextThursday(from = new Date()) {
  const base = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()));
  return toISO(addDays(base, (4 - base.getUTCDay() + 7) % 7));
}
export const weekday = iso => { const p = parseISO(iso); return p ? p.getUTCDay() : -1; };
export const isThursday = iso => weekday(iso) === 4;

// --- Mise en forme ----------------------------------------------------------

export function formatFR(iso) {
  const p = parseISO(iso); if (!p) return '';
  const d = p.getUTCDate();
  return `${d === 1 ? '1er' : d} ${MOIS_FR[p.getUTCMonth()]} ${p.getUTCFullYear()}`;
}
export function formatAR(iso) {
  const p = parseISO(iso); if (!p) return '';
  const d = p.getUTCDate();
  return `${d === 1 ? 'فاتح' : d} ${MOIS_AR[p.getUTCMonth()]} ${p.getUTCFullYear()}`;
}
// Libellé avec le jour de la semaine, pour l'interface : « jeudi 1er octobre 2026 ».
export function formatLongFR(iso) {
  const p = parseISO(iso); if (!p) return '';
  return `${JOURS_FR[p.getUTCDay()]} ${formatFR(iso)}`;
}

// --- Lecture des dates dans un texte -----------------------------------------

const toLatinDigits = s => String(s).replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x0660))
  .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x06F0));

// Date en toutes lettres ou numérique, ancrée au début de la chaîne.
const DATE_FR = new RegExp(`^(?:(1\\s?er|[0-3]?\\d)\\s+(${byLength(LECTURE_FR)})\\s+(\\d{4})|([0-3]?\\d)\\s*[/.-]\\s*([01]?\\d)\\s*[/.-]\\s*(\\d{4}))`, 'i');
const DATE_AR = new RegExp(`^(?:(فاتح|[0-9\\u0660-\\u0669]{1,2})\\s+(${byLength(LECTURE_AR)})\\s+([0-9\\u0660-\\u0669]{4})|([0-9\\u0660-\\u0669]{1,2})\\s*[/.-]\\s*([0-9\\u0660-\\u0669]{1,2})\\s*[/.-]\\s*([0-9\\u0660-\\u0669]{4}))`);

function readDate(s, lang) {
  const m = (lang === 'ar' ? DATE_AR : DATE_FR).exec(s);
  if (!m) return null;
  let iso;
  if (m[2]) {
    const dayRaw = lang === 'ar' && m[1] === 'فاتح' ? '1' : toLatinDigits(m[1]).replace(/\s?er$/i, '');
    const month = lang === 'ar' ? LECTURE_AR[m[2]] : LECTURE_FR[m[2].toLowerCase()];
    iso = isoOf(+toLatinDigits(m[3]), month, +dayRaw);
  } else {
    iso = isoOf(+toLatinDigits(m[6]), +toLatinDigits(m[5]), +toLatinDigits(m[4]));
  }
  return { text: m[0], iso };
}

// Repères des deux mentions de date. Chaque repère capture tout le texte qui
// précède la date ; la date (ou l'emplacement vide) suit immédiatement.
const ANCHORS = {
  fr: {
    publication: { re: /Fait\s+à\s+Rabat\s*,?\s*le\b\s*/i },
    deadline: { re: /\bsoit\s+le\b\s*/i, line: /jours?\b/i },
  },
  ar: {
    publication: { re: /حرر\s+(?:ب|في)\s*الرباط\s*[،,]?\s*(?:بتاريخ|في)?\s*/ },
    deadline: { re: /ينتهي\s+هذا\s+الأجل\s+(?:يوم|في)?\s*/ },
  },
};

// Localise une mention dans le texte (une ligne = un paragraphe).
function locate(text, lang, kind) {
  const a = ANCHORS[lang][kind];
  for (const line of String(text || '').split('\n')) {
    if (a.line && !a.line.test(line)) continue;
    const m = a.re.exec(line);
    if (!m) continue;
    const anchor = m[0];
    const rest = line.slice(m.index + anchor.length);
    const date = readDate(rest, lang);
    // Emplacement vide ou provisoire à remplir : rien, pointillés « ...... » ou « …… »,
    // tirets, « XX/XX/XXXX », ou « [date] » / « (date) ». Tout vrai texte est préservé.
    let placeholder = null, addDot = false;
    if (!date) {
      const r = rest.replace(/\s+$/, '');
      if (r === '') { placeholder = ''; addDot = true; }
      else if (/^[\s.…_xX*\-–\/]+$/.test(r)) { placeholder = r; addDot = true; }
      else {
        const b = /^\s*(?:\[[^\]]{0,25}\]|\([^)]{0,25}\))(?=\s*\.?$)/.exec(r);
        if (b) placeholder = b[0];
      }
    }
    return { line, anchor, date, placeholder, addDot, prefix: line.slice(m.index, m.index + anchor.length) };
  }
  return null;
}

// Extrait les deux dates d'un texte, pour les contrôles de cohérence.
export function extractDates(text, lang) {
  const pub = locate(text, lang, 'publication');
  const dl = locate(text, lang, 'deadline');
  return {
    publication: pub && pub.date ? pub.date.iso : null,
    deadline: dl && dl.date ? dl.date.iso : null,
    found: { publication: !!pub, deadline: !!dl },
  };
}

// Produit les corrections (format habituel original/suggested) qui insèrent ou
// rectifient les deux dates, et des avertissements pour relecture.
//   dates : { publication: 'AAAA-MM-JJ', deadline: 'AAAA-MM-JJ' } ou null
export function runDatePass({ text, docType, dates }) {
  const lang = docType === 'cp_ar' ? 'ar' : docType === 'cp_fr' ? 'fr' : null;
  const corrections = [], warnings = [];
  if (!lang) return { corrections, warnings };
  const fmt = lang === 'ar' ? formatAR : formatFR;
  const libelle = { publication: 'date de publication', deadline: 'date limite des observations' };
  const code = { publication: 'DATE', deadline: lang === 'ar' ? 'A-06' : 'D-06' };

  if (dates && (dates.publication || dates.deadline)) {
    for (const kind of ['publication', 'deadline']) {
      const target = dates[kind];
      if (!target || !parseISO(target)) continue;
      const loc = locate(text, lang, kind);
      if (!loc) {
        warnings.push({ kind: 'date', message: `Mention de la ${libelle[kind]} introuvable dans le document : la date ${fmt(target)} n'a pas pu être insérée.` });
        continue;
      }
      if (loc.date && loc.date.iso === target && loc.date.text === fmt(target)) continue; // déjà conforme
      if (!loc.date && loc.placeholder === null) {
        warnings.push({ kind: 'date', message: `La ${libelle[kind]} n'a pas été reconnue après « ${loc.prefix.trim()} » : vérifier et inscrire ${fmt(target)}.` });
        continue;
      }
      const old = loc.date ? loc.date.text : loc.placeholder;
      const sep = /\s$/.test(loc.prefix) || !loc.prefix ? '' : ' ';
      corrections.push({
        type: 'fond',
        code: code[kind],
        original: (loc.prefix + old).trimEnd(),
        suggested: loc.prefix + sep + fmt(target) + (!loc.date && loc.addDot ? '.' : ''),
        reason: `${libelle[kind][0].toUpperCase() + libelle[kind].slice(1)} : ${formatLongFR(target)} (date saisie dans la plateforme)`,
        deterministic: true,
      });
    }
    return { corrections, warnings };
  }

  // Sans dates saisies : simple contrôle de cohérence interne, sans correction.
  const d = extractDates(text, lang);
  if (d.publication && d.deadline) {
    const attendue = computeDeadline(d.publication);
    if (attendue !== d.deadline) {
      warnings.push({ kind: 'date', message: `Date limite des observations (${formatLongFR(d.deadline)}) non conforme à la règle : pour une publication le ${formatLongFR(d.publication)}, la date limite est le ${formatLongFR(attendue)}.` });
    }
  }
  return { corrections, warnings };
}
