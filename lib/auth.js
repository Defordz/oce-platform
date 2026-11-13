// lib/auth.js
// Controle du mot de passe partage de l'application.
//
// Le mot de passe est range dans la variable d'environnement APP_PASSWORD cote
// Vercel. Le client l'envoie dans l'en-tete "x-app-password" a chaque appel,
// ENCODE (encodeURIComponent) : un en-tete HTTP n'accepte que des caracteres
// latins de base, un mot de passe accentue faisait echouer la connexion.
// Un appel sans le bon mot de passe (ex: curl direct) est rejete en 401.
//
// Si APP_PASSWORD n'est PAS configuree, tout est refuse (503) : la plateforme ne
// s'ouvre jamais a tout le monde parce que la variable a ete supprimee ou oubliee
// (les rapports sont confidentiels et chaque analyse consomme le credit Anthropic).
// Ancien comportement (13/11/2026) : laisser passer, ce qui ouvrait l'acces.

export function requireAppPassword(req, res) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    res.status(503).json({ error: "Mot de passe de l'application non configuré côté Vercel (variable APP_PASSWORD) : accès fermé." });
    return false;
  }
  const given = (req.headers['x-app-password'] || '').toString();
  let decoded = given;
  try { decoded = decodeURIComponent(given); } catch { /* valeur non encodee */ }
  // Accepte la forme encodee (nouveau client) et la forme brute (ancien client en cache).
  if (decoded !== expected && given !== expected) {
    res.status(401).json({ error: "Mot de passe de l'application requis ou incorrect." });
    return false;
  }
  return true;
}
