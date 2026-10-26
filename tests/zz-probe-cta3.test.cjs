'use strict';
// Sonda temporal CTA-3: un archivo cifrado con el CryptoJS 4.2.0 real (el que carga index.html) se abre con
// js/acc-vault.js. Imprime vectores fijos para el test definitivo. Se borra después de leer el OUT.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('sonda: CryptoJS real contra AccVault', async () => {
  const r = await fetch('https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.js');
  console.log('CDN', r.status);
  const cj = await r.text();
  const box = { console: { info() {} }, crypto: globalThis.crypto };
  box.window = box; box.self = box;
  vm.createContext(box);
  vm.runInContext('var module = undefined, exports = undefined, define = undefined;\n' + cj + '\nthis.CryptoJS = CryptoJS;', box);
  const CJ = box.CryptoJS;
  const data = { version: 1, lastUpdated: '2026-10-26', accounts: [{ id: 'cuenta_1', name: 'Mi main', login: { email: 'gato@ejemplo.com', password: 'P4ss-ñandú!', gmailPassword: 'gm41l' }, services: { twitch: { linked: true, username: 'gatonegro', email: 'tw@ejemplo.com', password: 'tw-pass' }, geforceNow: { linked: true } }, apiKey: { value: 'ABCD1234-EF56-7890-ABCD-1234567890EFABCD1234-EF56-7890-ABCD-1234567890EF' }, notes: 'Notas con «comillas» y\nsalto', tags: ['main', 'keys', 'mi-tag'], gw2: { accountName: 'Gato.1234' }, expansions: { core: true }, campoRaro: { a: [1, 2] } }] };
  const pass = 'contraseña de prueba 1';
  const ct = CJ.AES.encrypt(JSON.stringify(data), pass).toString();
  console.log('VECTOR', ct);
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'acc-vault.js'), 'utf8');
  const sb = { console: { info() {} }, crypto: globalThis.crypto, TextEncoder, TextDecoder, atob, btoa };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(src, sb);
  const out = await sb.AccVault.open(ct, pass);
  console.log('FORMAT', out.format, 'EQUAL', JSON.stringify(out.data) === JSON.stringify(data));
  assert.deepEqual(JSON.parse(JSON.stringify(out.data)), data);
  let bad = null;
  try { await sb.AccVault.open(ct, 'otra'); } catch (e) { bad = e.code; }
  console.log('BAD', bad);
  const v2 = await sb.AccVault.encryptV2(data, pass, { iter: 1000 });
  const back = await sb.AccVault.open(v2, pass);
  console.log('V2', JSON.stringify(back.data) === JSON.stringify(data));
});
