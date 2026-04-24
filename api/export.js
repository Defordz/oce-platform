// api/export.js — Génération du fichier Word avec corrections
// Retourne un fichier .doc HTML compatible Word avec tracked changes visuels

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { corrections, fileName, score, synthese, date } = req.body;

  if (!corrections || !corrections.length) {
    return res.status(400).json({ error: 'Aucune correction fournie' });
  }

  const typeColors = {
    forme: { bg: '#dbeafe', fg: '#1e40af', label: 'FORME' },
    fond: { bg: '#fdf5e0', fg: '#7a4a00', label: 'FOND' },
    terminologie: { bg: '#e8f5ec', fg: '#1a5c2a', label: 'TERMINOLOGIE' },
    bilingue: { bg: '#f0e8f8', fg: '#4a1a6e', label: 'BILINGUE' },
  };

  const borderColors = {
    forme: '#3b82f6',
    fond: '#b8962e',
    terminologie: '#1a5c2a',
    bilingue: '#4a1a6e',
  };

  const rows = corrections.map((c, i) => {
    const tc = typeColors[c.type] || { bg: '#f0f0f0', fg: '#333', label: c.type };
    const bc = borderColors[c.type] || '#aaa';
    return `
    <tr>
      <td style="padding:0;border-bottom:1px solid #e8e3d8;border-left:4px solid ${bc}">
        <div style="padding:12px 14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="background:${tc.bg};color:${tc.fg};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.03em">${tc.label}</span>
            ${c.code ? `<span style="font-size:10px;color:#8a8aaa;font-family:monospace">${c.code}</span>` : ''}
            <span style="font-size:11px;color:#8a8aaa;margin-left:auto">Correction ${i + 1}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
            <del style="font-size:12px;color:#8b1a1a;background:#fdf0f0;padding:1px 6px;border-radius:3px">${escapeHtml(c.original)}</del>
            <span style="font-size:12px;color:#8a8aaa">→</span>
            <ins style="font-size:12px;color:#1a5c2a;background:#e8f5ec;padding:1px 6px;border-radius:3px;text-decoration:none;font-weight:500">${escapeHtml(c.suggested)}</ins>
          </div>
          <div style="font-size:11px;color:#4a4a6a;line-height:1.5">${escapeHtml(c.reason)}</div>
        </div>
      </td>
    </tr>`;
  }).join('');

  const scoreColor = score >= 7 ? '#1a5c2a' : score >= 5 ? '#7a4a00' : '#8b1a1a';
  const scoreBg = score >= 7 ? '#e8f5ec' : score >= 5 ? '#fdf5e0' : '#fdf0f0';

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content="Microsoft Word 15">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 11pt; margin: 2.5cm; color: #1a1a2e; line-height: 1.6; }
    h1 { font-size: 16pt; color: #0f2650; margin-bottom: 6px; font-weight: bold; }
    h2 { font-size: 12pt; color: #1a3a6e; margin-top: 20px; margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid #d8d3c8; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; }
    .header-bar { background: #0f2650; color: white; padding: 12px 18px; border-radius: 4px; margin-bottom: 20px; }
    .meta { font-size: 10pt; color: #8a8aaa; margin-bottom: 20px; }
    .score-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11pt; font-weight: bold; }
    .synthese-box { background: #f0ede4; border-left: 3px solid #0f2650; padding: 10px 14px; margin-bottom: 20px; font-size: 10.5pt; color: #4a4a6a; line-height: 1.6; }
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #d8d3c8; font-size: 9pt; color: #8a8aaa; text-align: center; }
  </style>
</head>
<body>
  <div class="header-bar">
    <div style="font-size:13pt;font-weight:bold">⚖️ Conseil de la Concurrence — Corrections OCE</div>
    <div style="font-size:10pt;opacity:.7;margin-top:4px">Plateforme de Correction des Opérations de Concentration Économique</div>
  </div>

  <h1>${escapeHtml(fileName || 'Document corrigé')}</h1>
  <div class="meta">
    Généré le ${date || new Date().toLocaleDateString('fr-FR')} &nbsp;·&nbsp;
    ${corrections.length} correction(s) acceptée(s) &nbsp;·&nbsp;
    <span class="score-badge" style="background:${scoreBg};color:${scoreColor}">Score qualité : ${score}/10</span>
  </div>

  ${synthese ? `<div class="synthese-box">${escapeHtml(synthese)}</div>` : ''}

  <h2>Corrections appliquées (${corrections.length})</h2>
  <table>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="footer">
    Conseil de la Concurrence du Maroc &nbsp;·&nbsp; Plateforme de Correction OCE v1.0 &nbsp;·&nbsp; Usage interne — Rapporteurs
  </div>
</body>
</html>`;

  const safeFileName = (fileName || 'document').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_');

  res.setHeader('Content-Type', 'application/msword; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}_corrige.doc"`);
  return res.status(200).send(html);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
