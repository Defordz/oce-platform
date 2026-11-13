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

test('garde-fous : emplacements à compléter et doublons des règles écartés, signalements de la grille', async () => {
  process.env.ANTHROPIC_API_KEY = 'k';
  let sent;
  const saved = globalThis.fetch;
  globalThis.fetch = async (u, o) => { sent = JSON.parse(o.body); return { ok: true, json: async () => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'rapport_corrections', input: {
    controle_societes: [{ societe: 'Gotion GmbH', forme_juridique: 'manquante', droit_applicable: 'absent', immatriculation: 'absente', denomination_constante: true }],
    controle_sens: [], synthese: 's', score: 7, corrections: [
      { type: 'fond', code: 'A-07', original: 'شركة «Gotion GmbH» بشوراني', suggested: 'شركة «Gotion GmbH»، مسجلة في السجل التجاري بـ[المدينة] تحت رقم [...]، بشوراني', reason: 'x' },
      { type: 'terminologie', code: 'A-15', original: 'القطاع الاقتصادي المعني', suggested: 'القطاعات الاقتصادية المعنية', reason: 'y' },
      { type: 'forme', code: '', original: 'مجموعتي (Volkswagen) و (Gotion)يخص', suggested: 'مجموعتي (Volkswagen) و(Gotion) يخص', reason: 'z' } ] } }] }) }; };
  const { default: handler } = await import('../api/analyze.js');
  const res = { setHeader() {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; } };
  const text = 'القطاع الاقتصادي المعني:\nبين مجموعتي (Volkswagen) و (Gotion)يخص التزود\nمن قِبل شركة «Gotion GmbH» بشوراني';
  await handler({ method: 'POST', headers: {}, body: { docType: 'cp_ar', modele: 'claude-sonnet-5-5', opts: { forme: true, fond: true, terminologie: true }, consignes: seed, text } }, res);
  globalThis.fetch = saved;
  assert.equal(sent.model, 'claude-sonnet-5-5');
  const sugg = res.body.corrections.map(c => c.suggested);
  assert.ok(!sugg.some(x => x.includes('[المدينة]')), 'emplacement à compléter écarté');
  assert.equal(res.body.corrections.filter(c => c.original.startsWith('القطاع')).length, 1, 'un seul A-15');
  assert.ok(sugg.includes('مجموعتي (Volkswagen) و(Gotion) يخص'));
  assert.ok(res.body.warnings.some(w => w.kind === 'grille' && w.message.includes('Gotion GmbH')));
});

test('doublon d’une règle de pays proposé sans la virgule (Sonnet) : écarté', async () => {
  process.env.ANTHROPIC_API_KEY = 'k';
  const saved = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'rapport_corrections', input: {
    controle_societes: [], controle_sens: [], synthese: 's', score: 7, corrections: [
      { type: 'forme', code: 'A-14', original: 'République populaire de Chine', suggested: 'جمهورية الصين الشعبية', reason: 'x' },
      { type: 'forme', code: 'A-14', original: 'Allemagne .', suggested: 'ألمانيا.', reason: 'y' },
      { type: 'forme', code: '', original: 'بـجمهورية', suggested: 'بجمهورية', reason: 'z' } ] } }] }) });
  const { default: handler } = await import('../api/analyze.js');
  const res = { setHeader() {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; } };
  const text = 'يقع مقرها بـجمهورية الصين الشعبية بـ Hefei, province d’Anhui, République populaire de Chine.\nBerliner Ring 2, 38440 Wolfsburg, Allemagne .';
  await handler({ method: 'POST', headers: {}, body: { docType: 'cp_ar', opts: { forme: true }, consignes: seed, text } }, res);
  globalThis.fetch = saved;
  const o = res.body.corrections.map(c => c.original);
  assert.equal(o.filter(x => x.includes('Chine')).length, 1);
  assert.equal(o.filter(x => x.includes('Allemagne')).length, 1);
  assert.ok(o.includes('بـجمهورية'));
});
