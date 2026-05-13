// api/save-consignes.js
// Sauvegarde les consignes dans le fichier consignes.json sur GitHub

const GITHUB_OWNER = 'Defordz';
const GITHUB_REPO = 'oce-platform';
const FILE_PATH = 'consignes.json';
const BRANCH = 'main';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { consignes, sha, message } = req.body;

  if (!consignes || !sha) {
    return res.status(400).json({ error: 'consignes et sha requis' });
  }

  try {
    // Encoder le contenu en base64
    const content = Buffer.from(JSON.stringify(consignes, null, 2)).toString('base64');

    const commitMessage = message || `Mise à jour consignes — ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`;

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'oce-platform',
      },
      body: JSON.stringify({
        message: commitMessage,
        content,
        sha,   // SHA du fichier actuel — obligatoire pour la mise à jour
        branch: BRANCH,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('GitHub API error:', err);
      return res.status(500).json({ error: 'Impossible de sauvegarder', detail: err });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      newSha: data.content.sha,
      commit: data.commit.sha,
      message: commitMessage,
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
