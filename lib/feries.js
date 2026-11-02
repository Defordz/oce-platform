// lib/feries.js
// Jours fériés chômés et payés dans les administrations publiques au Maroc.
//
// Sources (consultées le 2 novembre 2026) :
//  - Décret n° 2.77.169 du 28 février 1977 (administrations, établissements
//    publics), version consolidée au 5 février 2026 (portail Adala).
//  - Décret n° 2.23.688 du 5 décembre 2023 (BO n° 7256) : 14 janvier, Nouvel an
//    amazigh, chômé depuis 2024.
//  - Communiqué du Cabinet royal du 4 novembre 2025 et décret n° 2.25.1140 du
//    27 janvier 2026 (BO n° 7480) : 31 octobre, Fête de l'Unité, chômé depuis 2026.
//  - Décret n° 2.05.916 du 20 juillet 2005 : semaine de travail du lundi au vendredi.
//  - Fêtes religieuses : dates annoncées par le ministère des Habous et congés
//    exceptionnels annoncés par le Chef du gouvernement (2025, 2026) ; 2027 :
//    estimations astronomiques, à confirmer à l'annonce officielle.
//
// Mise à jour : ajouter chaque année les dates religieuses annoncées dans
// RELIGIEUX, et retirer la mention « estime » une fois la date officielle.

// Fêtes à date fixe, avec l'année à partir de laquelle elles sont chômées.
const FIXES = {
  '01-01': { nom: 'Nouvel an', depuis: 1977 },
  '01-11': { nom: "Manifeste de l'Indépendance", depuis: 1977 },
  '01-14': { nom: 'Nouvel an amazigh', depuis: 2024 },
  '05-01': { nom: 'Fête du Travail', depuis: 1977 },
  '07-30': { nom: 'Fête du Trône', depuis: 2000 },
  '08-14': { nom: "Journée d'Oued Eddahab", depuis: 1980 },
  '08-20': { nom: 'Révolution du Roi et du Peuple', depuis: 1977 },
  '08-21': { nom: 'Fête de la Jeunesse', depuis: 2000 },
  '10-31': { nom: "Fête de l'Unité", depuis: 2026 },
  '11-06': { nom: 'Marche Verte', depuis: 1977 },
  '11-18': { nom: "Fête de l'Indépendance", depuis: 1977 },
};

// Fêtes religieuses et congés exceptionnels, date par date.
// estime: true = date calculée, pas encore annoncée (à un jour près).
const R = (nom, dates, estime = false) => dates.map(d => [d, { nom, estime }]);
const RELIGIEUX = Object.fromEntries([
  // 2025 (observées)
  ...R('Aïd al-Fitr', ['2025-03-31', '2025-04-01']),
  ...R('Aïd al-Adha', ['2025-06-07', '2025-06-08']),
  ...R("Aïd al-Adha (congé exceptionnel)", ['2025-06-09']),
  ...R('1er Moharram', ['2025-06-27']),
  ...R('Aïd al-Mawlid', ['2025-09-05', '2025-09-06']),
  // 2026 (observées)
  ...R('Aïd al-Fitr', ['2026-03-20', '2026-03-21']),
  ...R("Aïd al-Fitr (congé exceptionnel)", ['2026-03-23']),
  ...R('Aïd al-Adha', ['2026-05-27', '2026-05-28']),
  ...R("Aïd al-Adha (congé exceptionnel)", ['2026-05-29']),
  ...R('1er Moharram', ['2026-06-17']),
  ...R('Aïd al-Mawlid', ['2026-08-25', '2026-08-26']),
  // 2027 (estimées : toute la fourchette est bloquée)
  ...R('Aïd al-Fitr', ['2027-03-09', '2027-03-10', '2027-03-11'], true),
  ...R('Aïd al-Adha', ['2027-05-16', '2027-05-17', '2027-05-18'], true),
  ...R('1er Moharram', ['2027-06-06', '2027-06-07'], true),
  ...R('Aïd al-Mawlid', ['2027-08-15', '2027-08-16', '2027-08-17'], true),
]);

// Dernière année pour laquelle les fêtes religieuses sont renseignées.
export const FERIES_COUVERTURE = 2027;

/** @returns {{nom:string, estime:boolean}|null} */
export function holidayOn(iso) {
  if (RELIGIEUX[iso]) return { ...RELIGIEUX[iso] };
  const f = FIXES[iso.slice(5)];
  return f && +iso.slice(0, 4) >= f.depuis ? { nom: f.nom, estime: false } : null;
}
