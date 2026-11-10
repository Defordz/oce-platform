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

const META = 'consignes/meta.json';
const SEED_MAJ = seed.reduce((m, c) => (c.maj && c.maj > m ? c.maj : m), '');

async function readBlob(pathname, t) {
  const { blobs } = await list({ prefix: pathname, token: t });
  const b = blobs.find(x => x.pathname === pathname);
  if (!b) return null;
  const res = await fetch(b.url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
  if (!res.ok) throw new Error(`Lecture du blob echouee : ${res.status}`);
  return await res.json();
}
const putJson = (pathname, data, t) => put(pathname, JSON.stringify(data, null, 2), { access: 'private', contentType: 'application/json', allowOverwrite: true, addRandomSuffix: false, token: t });

// Applique au store les consignes du referentiel revisees depuis « depuis » :
// les nouvelles sont ajoutees, les revisees remplacees (l'etat actif/inactif
// choisi par l'utilisateur est conserve). Les consignes creees par
// l'utilisateur et celles que le referentiel n'a pas revisees ne bougent pas.
export function mergeSeed(stored, seedList, depuis) {
  const out = stored.slice(); const changed = [];
  for (const c of seedList) {
    if (!c.maj || c.maj <= (depuis || '')) continue;
    const i = out.findIndex(x => x && x.code === c.code);
    if (i < 0) { out.push(c); changed.push(c.code); }
    else if (!out[i].maj || out[i].maj < c.maj) { out[i] = { ...c, active: out[i].active !== false && c.active !== false ? true : out[i].active }; changed.push(c.code); }
  }
  return { list: out, changed };
}

// Lit la liste des consignes. Au tout premier appel, le store est vide : on y
// verse le referentiel. Ensuite, les revisions du referentiel plus recentes que
// la derniere synchronisation sont appliquees automatiquement (plus d'import
// manuel apres une mise a jour de la plateforme).
export async function readConsignes() {
  const t = token();
  const stored = await readBlob(PATHNAME, t);
  if (!stored) {
    await writeConsignes(seed);
    await putJson(META, { seedMaj: SEED_MAJ }, t);
    return seed;
  }
  const meta = (await readBlob(META, t).catch(() => null)) || {};
  if (SEED_MAJ > (meta.seedMaj || '')) {
    const { list: merged, changed } = mergeSeed(stored, seed, meta.seedMaj || '');
    // Seule la production inscrit la synchronisation dans le store : une version
    // de test applique les revisions a la lecture, sans rien ecrire, pour ne pas
    // modifier les consignes de la production avant validation.
    if (process.env.VERCEL_ENV === 'production') {
      if (changed.length) await writeConsignes(merged);
      await putJson(META, { seedMaj: SEED_MAJ, derniereSynchro: new Date().toISOString(), codes: changed }, t);
    }
    return merged;
  }
  return stored;
}

// Ecrit (remplace) la liste complete des consignes. La version precedente est
// conservee dans consignes/historique/ (une copie par enregistrement).
export async function writeConsignes(consignes) {
  if (!Array.isArray(consignes)) throw new Error('Le format attendu est un tableau de consignes.');
  const t = token();
  const previous = await readBlob(PATHNAME, t).catch(() => null);
  if (previous) await putJson(`consignes/historique/${new Date().toISOString().replace(/[:.]/g, '-')}.json`, previous, t).catch(() => {});
  await putJson(PATHNAME, consignes, t);
  return consignes.length;
}
