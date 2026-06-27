// lib/auth.js
// Controle du mot de passe partage de l'application.
//
// Le mot de passe est range dans la variable d'environnement APP_PASSWORD cote
// Vercel. Le client l'envoie dans l'en-tete "x-app-password" a chaque appel.
// Un appel sans le bon mot de passe (ex: curl direct) est rejete en 401.
//
// Comportement volontaire : si APP_PASSWORD n'est PAS configuree, le controle
// laisse passer (fail-open). Ainsi l'app ne se bloque pas entre le moment ou tu
// deploies ce code et le moment ou tu ajoutes la variable. Des qu'APP_PASSWORD
// existe cote Vercel, la protection est active sur tous les endpoints.

export function requireAppPassword(req, res) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return true; // non configure -> ne bloque pas
  const given = (req.headers['x-app-password'] || '').toString();
  if (given !== expected) {
    res.status(401).json({ error: "Mot de passe de l'application requis ou incorrect." });
    return false;
  }
  return true;
}
