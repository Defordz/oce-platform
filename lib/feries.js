// lib/feries.js
// Jours fériés chômés et payés au Maroc (provisoire : complété dès que la liste
// sourcée est disponible).
const FIXES = {
  '01-01': 'Nouvel an',
  '01-11': "Manifeste de l'Indépendance",
  '05-01': 'Fête du Travail',
  '07-30': 'Fête du Trône',
  '08-14': "Allégeance d'Oued Eddahab",
  '08-20': 'Révolution du Roi et du Peuple',
  '08-21': 'Fête de la Jeunesse',
  '11-06': 'Marche Verte',
  '11-18': "Fête de l'Indépendance",
};
const RELIGIEUX = {};
export function holidayOn(iso) {
  if (RELIGIEUX[iso]) return { nom: RELIGIEUX[iso].nom, estime: !!RELIGIEUX[iso].estime };
  const f = FIXES[iso.slice(5)];
  return f ? { nom: f, estime: false } : null;
}
