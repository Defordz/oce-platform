// api/consignes.js
// Remplace api/get-consignes.js et api/save-consignes.js (qui ecrivaient sur GitHub sans authentification).
// GET  : renvoie la liste des consignes depuis le store.
// POST : remplace la liste, protege par un jeton administrateur.

import { readConsignes, writeConsignes } from '../lib/consignesStore.js';
import { requireAppPassword } from '../lib/auth.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

function setCors(res) {
  // CORS restreint au domaine de production (defini dans ALLOWED_ORIGIN),
  // au lieu du '*' des anciens endpoints.
  if (ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, x-app-password');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAppPassword(req, res)) return;

  if (req.method === 'GET') {
    try {
      const consignes = await readConsignes();
      return res.status(200).json({ consignes, count: consignes.length });
    } catch (e) {
      return res.status(500).json({ error: 'Lecture des consignes impossible', detail: e.message });
    }
  }

  if (req.method === 'POST') {
    const provided = req.headers['x-admin-token'];
    const expected = process.env.CONSIGNES_ADMIN_TOKEN;
    if (!expected || provided !== expected) {
      return res.status(401).json({ error: 'Non autorise : jeton administrateur invalide ou absent.' });
    }
    try {
      const consignes = req.body?.consignes;
      const count = await writeConsignes(consignes);
      return res.status(200).json({ success: true, count });
    } catch (e) {
      return res.status(400).json({ error: 'Enregistrement impossible', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Methode non autorisee' });
}
