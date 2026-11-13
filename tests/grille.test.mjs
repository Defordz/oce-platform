// Communiqués : grille de relecture obligatoire, consignes de comparaison FR/AR
// écartées de l'analyse d'un document seul, modèle et température renvoyés.
import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../lib/consignesSeed.js';
import { buildPrompt } from '../api/analyze.js';

test('prompt des communiqués : grille demandée, consignes B-0x absentes', () => {
  const p = buildPrompt({ text: 'x', docType: 'cp_ar', opts: { forme: true, fond: true, terminologie: true }, consignes: seed });
  assert.ok(p.system.includes('controle_societes'));
  assert.ok(!/\[B-0\d\]/.test(p.system));
  const d = buildPrompt({ text: 'x', docType: 'decision_ar', opts: { forme: true, fond: true }, consignes: seed });
  assert.ok(!d.system.includes('controle_societes'));
});
test('schéma imposé aux communiqués et réponse enrichie', async () => {
  process.env.ANTHROPIC_API_KEY = 'k';
  let sent;
  const saved = globalThis.fetch;
  globalThis.fetch = async (u, o) => { sent = JSON.parse(o.body); return { ok: true, json: async () => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'rapport_corrections', input: {
    controle_societes: [{ societe: 'X SA', forme_juridique: 'manquante', droit_applicable: 'conforme', immatriculation: 'conforme', denomination_constante: true }],
    controle_sens: [{ fait: 'Y fournit Z', verdict: 'incoherent' }], corrections: [], synthese: 's', score: 7 } }] }) }; };
  const { default: handler } = await import('../api/analyze.js');
  const res = { setHeader() {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; } };
  await handler({ method: 'POST', headers: {}, body: { docType: 'cp_fr', opts: { forme: true, fond: true }, consignes: [], text: 'Communiqué' } }, res);
  globalThis.fetch = saved;
  assert.deepEqual(sent.tools[0].input_schema.required.slice(0, 2), ['controle_societes', 'controle_sens']);
  assert.equal(sent.temperature, 0);
  assert.equal(res.body.grille.societes.length, 1);
  assert.deepEqual(res.body.appel, { modele: 'claude-opus-5-5', temperature: 0 });
});
