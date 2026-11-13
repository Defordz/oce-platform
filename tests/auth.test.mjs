import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireAppPassword } from '../lib/auth.js';

const rep = () => ({ code: 200, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });

test('mot de passe non configuré : accès fermé (503), jamais ouvert à tous', () => {
  const avant = process.env.APP_PASSWORD;
  delete process.env.APP_PASSWORD;
  const r = rep();
  assert.equal(requireAppPassword({ headers: {} }, r), false);
  assert.equal(r.code, 503);
  if (avant !== undefined) process.env.APP_PASSWORD = avant;
});

test('mot de passe configuré : bon mot de passe accepté, mauvais refusé', () => {
  const avant = process.env.APP_PASSWORD;
  process.env.APP_PASSWORD = 'Été2026*';
  const ok = rep(), ko = rep();
  assert.equal(requireAppPassword({ headers: { 'x-app-password': encodeURIComponent('Été2026*') } }, ok), true);
  assert.equal(requireAppPassword({ headers: { 'x-app-password': 'faux' } }, ko), false);
  assert.equal(ko.code, 401);
  if (avant === undefined) delete process.env.APP_PASSWORD; else process.env.APP_PASSWORD = avant;
});
