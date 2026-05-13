// api/get-consignes.js
// Lit les consignes depuis le fichier consignes.json sur GitHub

const GITHUB_OWNER = 'Defordz';
const GITHUB_REPO = 'oce-platform';
const FILE_PATH = 'consignes.json';
const BRANCH = 'main';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'oce-platform',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('GitHub API error:', err);
      return res.status(500).json({ error: 'Impossible de lire les consignes', detail: err });
    }

    const data = await response.json();

    // Le contenu est encodé en base64
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const consignes = JSON.parse(content);

    return res.status(200).json({
      consignes,
      sha: data.sha, // nécessaire pour la mise à jour
      lastModified: data.last_modified || null,
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
