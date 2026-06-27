// api/login.js
// Valide le mot de passe partage saisi a l'ecran de connexion.
// Renvoie 200 si correct (ou si APP_PASSWORD n'est pas encore configure),
// 401 sinon. Ne stocke rien : la verification reelle se refait a chaque appel
// des autres endpoints.

import { requireAppPassword } from '../lib/auth.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

function setCors(res) {
  if (ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-password');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  if (!requireAppPassword(req, res)) return;
  return res.status(200).json({ ok: true });
}
