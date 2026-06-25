// lib/consignesStore.js
// Source unique des consignes : un seul document JSON dans Vercel Blob (acces prive).
// Lu par le moteur de correction et par l'API ; ecrit uniquement par l'endpoint authentifie.

import { put, list } from '@vercel/blob';
import seed from './consignesSeed.js';

const PATHNAME = 'consignes/current.json';

function token() {
  const t = process.env.BLOB_READ_WRITE_TOKEN;
  if (!t) throw new Error('BLOB_READ_WRITE_TOKEN manquant (creer un store Blob sur Vercel).');
  return t;
}

// Lit la liste des consignes. Au tout premier appel, le store est vide :
// on y verse les donnees initiales (seed) puis on les renvoie.
export async function readConsignes() {
  const t = token();
  const { blobs } = await list({ prefix: PATHNAME, token: t });

  if (!blobs.length) {
    await writeConsignes(seed);
    return seed;
  }

  const res = await fetch(blobs[0].url, {
    headers: { Authorization: `Bearer ${t}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Lecture du blob echouee : ${res.status}`);
  return await res.json();
}

// Ecrit (remplace) la liste complete des consignes.
export async function writeConsignes(consignes) {
  if (!Array.isArray(consignes)) throw new Error('Le format attendu est un tableau de consignes.');
  await put(PATHNAME, JSON.stringify(consignes, null, 2), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
    token: token(),
  });
  return consignes.length;
}
