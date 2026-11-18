// tests/factory-eyes.test.cjs — BL-095 CF-2: mis ojos en DEV (validación y seguridad).
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const eyes = require('../.github/scripts/factory-eyes.cjs');

const TOKEN = 'cfat_secreto_de_prueba_1234567890';
const ACC = '0123456789abcdef0123456789abcdef';

function tmpRepo(reqs) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eyes-'));
  fs.mkdirSync(path.join(root, 'factory/eyes'), { recursive: true });
  for (const [name, obj] of Object.entries(reqs)) {
    fs.writeFileSync(path.join(root, 'factory/eyes', name), typeof obj === 'string' ? obj : JSON.stringify(obj));
  }
  return root;
}
function resp(status, ct, data, extra) {
  const h = Object.assign({ 'content-type': ct }, extra || {});
  return {
    ok: status >= 200 && status < 300, status,
    headers: { get: (k) => h[k.toLowerCase()] || null },
    arrayBuffer: async () => Buffer.from(data),
    text: async () => String(data),
  };
}
const env = { account: ACC, token: TOKEN, sleep: async () => {} };

test('solo apunta a DEV: base fija y nunca producción', () => {
  assert.strictEqual(eyes.BASE, 'https://pablosnchz.github.io/gw2-factory-dev/');
  const { errs, shots } = eyes.validate({ id: 'EYE-001', shots: [{ path: '' }] }, 'factory/eyes/EYE-001.json');
  assert.deepStrictEqual(errs, []);
  assert.ok(shots[0].url.startsWith(eyes.BASE));
  assert.ok(!shots[0].url.includes('gw2-wallet-ligero'));
});

test('rechaza paths que escapan de DEV', () => {
  for (const p of ['../gw2-wallet-ligero/', '/gw2-wallet-ligero/', '//evil.com/', 'a b', 'x\\y', 'https://evil.com']) {
    const { errs } = eyes.validate({ id: 'EYE-002', shots: [{ path: p }] }, 'EYE-002.json');
    assert.ok(errs.length > 0, 'debería rechazar ' + p);
  }
});

test('límites: 1 a 4 capturas, device y wait conocidos, id igual al archivo', () => {
  const five = Array.from({ length: 5 }, () => ({ path: '' }));
  assert.ok(eyes.validate({ id: 'EYE-003', shots: five }, 'EYE-003.json').errs.length);
  assert.ok(eyes.validate({ id: 'EYE-003', shots: [] }, 'EYE-003.json').errs.length);
  assert.ok(eyes.validate({ id: 'EYE-003', shots: [{ device: 'tele' }] }, 'EYE-003.json').errs.length);
  assert.ok(eyes.validate({ id: 'EYE-003', shots: [{ device: 'toString' }] }, 'EYE-003.json').errs.length);
  assert.ok(eyes.validate({ id: 'EYE-003', shots: [{ wait: 'siempre' }] }, 'EYE-003.json').errs.length);
  assert.ok(eyes.validate({ id: 'EYE-009', shots: [{}] }, 'EYE-003.json').errs.length);
  const ok = eyes.validate({ id: 'EYE-003', shots: [{ device: 'compu', fullPage: true }] }, 'EYE-003.json');
  assert.deepStrictEqual(ok.errs, []);
  assert.deepStrictEqual(ok.shots[0].viewport, { width: 1366, height: 900 });
});

test('corre solo los pedidos sin respuesta y guarda PNG + informe', async () => {
  const root = tmpRepo({ 'EYE-001.json': { id: 'EYE-001', shots: [{}] }, 'EYE-001.md': 'ya hecho', 'EYE-002.json': { id: 'EYE-002', shots: [{ path: '#metas' }, { device: 'compu' }] } });
  const calls = [];
  const fake = async (uri, opt) => { calls.push({ uri, opt }); return resp(200, 'image/png', 'PNGDATA', { 'x-browser-ms-used': '1500.4' }); };
  const files = await eyes.run(root, env, fake);
  assert.deepStrictEqual(files, ['factory/eyes/EYE-002-1.png', 'factory/eyes/EYE-002-2.png', 'factory/eyes/EYE-002.md']);
  assert.strictEqual(calls.length, 2);
  assert.ok(calls[0].uri.endsWith('/accounts/' + ACC + '/browser-run/screenshot'));
  assert.strictEqual(JSON.parse(calls[0].opt.body).url, eyes.BASE + '#metas');
  const md = fs.readFileSync(path.join(root, 'factory/eyes/EYE-002.md'), 'utf8');
  assert.match(md, /Estado: OK \(2\/2\)/);
  assert.match(md, /navegador usado: 3001 ms/);
});

test('el token nunca aparece en el informe, aunque Cloudflare lo devuelva', async () => {
  const root = tmpRepo({ 'EYE-004.json': { id: 'EYE-004', shots: [{}] } });
  const fake = async () => resp(403, 'application/json', '{"errors":[{"message":"bad ' + TOKEN + '"}]}');
  await eyes.run(root, env, fake);
  const md = fs.readFileSync(path.join(root, 'factory/eyes/EYE-004.md'), 'utf8');
  assert.ok(!md.includes(TOKEN));
  assert.match(md, /FALLÓ/);
  assert.match(md, /HTTP 403/);
  assert.ok(!fs.existsSync(path.join(root, 'factory/eyes/EYE-004-1.png')));
});

test('no guarda como imagen una respuesta JSON con 200', async () => {
  const root = tmpRepo({ 'EYE-005.json': { id: 'EYE-005', shots: [{}] } });
  const files = await eyes.run(root, env, async () => resp(200, 'application/json', '{"success":false}'));
  assert.deepStrictEqual(files, ['factory/eyes/EYE-005.md']);
});

test('ante 429 espera y reintenta una sola vez', async () => {
  const root = tmpRepo({ 'EYE-006.json': { id: 'EYE-006', shots: [{}] } });
  let n = 0; const waits = [];
  const fake = async () => (++n === 1 ? resp(429, 'application/json', 'slow', { 'retry-after': '5' }) : resp(200, 'image/png', 'P'));
  await eyes.run(root, { ...env, sleep: async (ms) => { waits.push(ms); } }, fake);
  assert.strictEqual(n, 2);
  assert.deepStrictEqual(waits, [5000]);
});

test('respeta 1 pedido cada 10 segundos entre capturas', async () => {
  const root = tmpRepo({ 'EYE-007.json': { id: 'EYE-007', shots: [{}, {}, {}] } });
  const waits = [];
  await eyes.run(root, { ...env, sleep: async (ms) => { waits.push(ms); } }, async () => resp(200, 'image/png', 'P'));
  assert.deepStrictEqual(waits, [11000, 11000]);
});

test('pedido roto: informe RECHAZADO sin llamar a Cloudflare', async () => {
  const root = tmpRepo({ 'EYE-008.json': '{no es json' });
  let called = false;
  const files = await eyes.run(root, env, async () => { called = true; });
  assert.strictEqual(called, false);
  assert.deepStrictEqual(files, ['factory/eyes/EYE-008.md']);
  assert.match(fs.readFileSync(path.join(root, 'factory/eyes/EYE-008.md'), 'utf8'), /RECHAZADO/);
});
