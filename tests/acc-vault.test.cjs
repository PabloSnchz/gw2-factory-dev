// Cuentas renovado (BL-070, CTA-3): js/acc-vault.js, el núcleo del Llavero. Corre con: node --test tests/*.test.cjs
// Abre tu archivo de hoy (CryptoJS 4.2.0: «Salted__», EVP_BytesToKey con MD5, AES-256-CBC) sin CryptoJS, lee y
// escribe el formato nuevo (PBKDF2-SHA256 600.000 + AES-256-GCM) y no pierde ningún dato, ni los que no conoce.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const nodeCrypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/acc-vault.js');
const J = (x) => JSON.parse(JSON.stringify(x));

function box() {
  const sb = { console: { info() {} }, crypto: globalThis.crypto, TextEncoder, TextDecoder, atob, btoa };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'acc-vault.js' });
  return sb.AccVault;
}
const V = box(), P = V._pure;

// Vector fijo: lo cifró el CryptoJS 4.2.0 real del CDN (el mismo que carga index.html) en RUN-079, 2026-10-26.
const DATA = { version: 1, lastUpdated: '2026-10-26', accounts: [{ id: 'cuenta_1', name: 'Mi main', login: { email: 'gato@ejemplo.com', password: 'P4ss-ñandú!', gmailPassword: 'gm41l' }, services: { twitch: { linked: true, username: 'gatonegro', email: 'tw@ejemplo.com', password: 'tw-pass' }, geforceNow: { linked: true } }, apiKey: { value: 'ABCD1234-EF56-7890-ABCD-1234567890EFABCD1234-EF56-7890-ABCD-1234567890EF' }, notes: 'Notas con «comillas» y\nsalto', tags: ['main', 'keys', 'mi-tag'], gw2: { accountName: 'Gato.1234' }, expansions: { core: true }, campoRaro: { a: [1, 2] } }] };
const PASS = 'contraseña de prueba 1';
const VECTOR = 'U2FsdGVkX18dtV3Ub06q1fbevNGqEBYtArovDlkB2IiAa6vG8fDbWf2McoRTy6xuJ2ujU3qrHEHdX/7VgUoLRs2CrRc8iNDiUdvLjIXeUGOLPT71CapJeIBS4prcCiqJj05R4gPcUFj8ZkE5Ars9+Wg7L4kMD2bZgrbN28/UlDXbxO3pEDi5SAGNBlno48iPsuKtU4p84VdWW2c15Nx+0EmIc+by18qqadIIMdjz6Ktkhfx48Z1xGsKDpLy1T0+HDQPJoRoTscOad0vxD3yM01gfG83j2ZMFUWKwAFcbYnGaUYbooSRu3pIoB7S4wu7H7JojWBFx6oWzSuVWLC92sBR1Q5kyNiVqL6WpD5heRm2tfXeP6+Hzse605OeKV78vhS5YAiij4zEXZcdBFYdXM1cDcMswoSlNuumbth0RJmvZgzeLZdOurhoOmIUjsq5B0NLipN20GBhJXQjXNJ6iJq0UyEHJymnArkcOozMpn+FQDuA0wdf8iHYxjeCr0hIQg95neDh2EBSGRi8NCWL6SIdNWopNsgroJussshgxpLtIao/HgaLEFcSO+M3idyIywli4YbIocM1A2ibmLsTu9zExbZBFc83HgItpaLRSBPwLb98JsUCCRotTzLxzoKNtk9nCQMSJg35kUhe2czJlfwsFx2xeUMnNLVNaLRUgAJnsMEistCCfLAn4mJOVhBASmgrmuvHhQTNrRaaE5fNyFfck0v4WUDO2dUwfb6ozyG29UBH4k6opExbl164QQ6B907IH78n9xWZ1iifSAhfU3w==';
const code = (p) => p.then(() => 'OK', (e) => e.code || e.message);

test('archivo: presupuesto, versión, sin DOM, sin storage, sin red, sin CryptoJS; en el manifiesto antes de la vista', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.match(SRC, /Versión: 1\.0\.0/);
  assert.equal(V.version, '1.0.0');
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(code, /document\.|localStorage|sessionStorage|fetch\(|XMLHttpRequest|CryptoJS\./);
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.indexOf('js/acc-vault.js') >= 0 && man.indexOf('js/acc-vault.js') < man.indexOf('js/acc-vault-view.js'));
  assert.equal(V.ITER, 600000, 'D2: 600.000 iteraciones (OWASP)');
});

test('MD5 y EVP_BytesToKey propios dan lo mismo que node:crypto', () => {
  ['', 'abc', 'contraseña de prueba 1', 'x'.repeat(200)].forEach((s) => {
    const b = new TextEncoder().encode(s);
    assert.equal(Buffer.from(P.md5(b)).toString('hex'), nodeCrypto.createHash('md5').update(Buffer.from(b)).digest('hex'), JSON.stringify(s));
  });
  const salt = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]), kv = P.evpKDF(PASS, salt, 32, 16);
  const pw = Buffer.from(PASS), d1 = nodeCrypto.createHash('md5').update(Buffer.concat([pw, salt])).digest();
  const d2 = nodeCrypto.createHash('md5').update(Buffer.concat([d1, pw, salt])).digest(), d3 = nodeCrypto.createHash('md5').update(Buffer.concat([d2, pw, salt])).digest();
  assert.equal(Buffer.from(kv.key).toString('hex'), Buffer.concat([d1, d2]).toString('hex'));
  assert.equal(Buffer.from(kv.iv).toString('hex'), d3.toString('hex'));
});

test('tu archivo de hoy (CryptoJS 4.2.0 real) se abre entero, también los campos que no conozco', async () => {
  assert.equal(V.detect(VECTOR), 'legacy');
  const r = await V.open(VECTOR, PASS);
  assert.equal(r.format, 'legacy');
  assert.deepEqual(J(r.data), DATA);
  assert.deepEqual(J(r.data.accounts[0].campoRaro), { a: [1, 2] });
  assert.equal(await code(V.open(VECTOR, 'otra contraseña')), 'BAD_PASSWORD');
  assert.equal(await code(V.open(VECTOR.slice(0, 60) + 'A' + VECTOR.slice(61), PASS)), 'BAD_PASSWORD', 'un archivo tocado no abre');
});

test('formato nuevo: ida y vuelta, detecta cambios y contraseña mala; nada en claro; pide 8 caracteres', async () => {
  const salt = new Uint8Array(16).fill(7), iv = new Uint8Array(12).fill(9);
  const t = await V.encryptV2(DATA, PASS, { iter: 1000, salt, iv });
  const o = JSON.parse(t);
  assert.equal(o.gnVault, 2);
  assert.deepEqual(J(o.kdf), { name: 'PBKDF2', hash: 'SHA-256', iter: 1000, salt: Buffer.from(salt).toString('base64') });
  assert.deepEqual(J(o.cipher), { name: 'AES-GCM', iv: Buffer.from(iv).toString('base64') });
  ['gato@ejemplo.com', 'P4ss', 'tw-pass', 'ABCD1234', 'main'].forEach((s) => assert.ok(!t.includes(s), s + ' no queda en claro'));
  assert.equal(V.detect(t), 'v2');
  const r = await V.open(t, PASS);
  assert.equal(r.format, 'v2');
  assert.deepEqual(J(r.data), DATA);
  assert.equal(await code(V.open(t, 'otra contraseña')), 'BAD_PASSWORD');
  const ct = Buffer.from(o.ct, 'base64'); ct[3] ^= 1;
  assert.equal(await code(V.open(JSON.stringify(Object.assign({}, o, { ct: ct.toString('base64') })), PASS)), 'BAD_PASSWORD', 'AES-GCM detecta el cambio');
  const t0 = Date.now();
  assert.equal(await code(V.open(JSON.stringify(Object.assign({}, o, { kdf: Object.assign({}, o.kdf, { iter: 99999999 }) })), PASS)), 'BAD_PASSWORD', 'tope de iteraciones');
  assert.ok(Date.now() - t0 < 1500, 'un archivo con 99.999.999 iteraciones no congela el navegador: se rechaza sin derivar');
  assert.equal(await code(V.open(JSON.stringify(Object.assign({}, o, { cipher: { name: 'AES-CBC', iv: o.cipher.iv } })), PASS)), 'BAD_PASSWORD');
  assert.match(await code(V.encryptV2(DATA, '1234567')), /al menos 8 caracteres/);
  const a = JSON.parse(await V.encryptV2(DATA, PASS, { iter: 1000 })), b = JSON.parse(await V.encryptV2(DATA, PASS, { iter: 1000 }));
  assert.notEqual(a.kdf.salt, b.kdf.salt, 'sal al azar');
  assert.notEqual(a.cipher.iv, b.cipher.iv, 'iv al azar');
  assert.equal(Buffer.from(a.kdf.salt, 'base64').length, 16);
  assert.equal(Buffer.from(a.cipher.iv, 'base64').length, 12);
});

test('lo que no es un Llavero se dice así', async () => {
  for (const x of ['', 'hola', '{"a":1}', btoa('Salted_'), JSON.stringify({ gnVault: 3 })]) assert.equal(await code(V.open(x, PASS)), 'NOT_VAULT', x);
});

test('campos: los 9 de hoy con su ícono; valor, máscara y lista sin secretos', async () => {
  assert.deepEqual(J(V.FIELDS.map((f) => f.key)), ['email', 'password', 'gmailPassword', 'twitchUser', 'twitchEmail', 'twitchPassword', 'geforce', 'apiKey', 'notes']);
  V.FIELDS.forEach((f) => assert.ok(fs.existsSync(path.join(ROOT, f.icon)), f.icon));
  const a = DATA.accounts[0];
  assert.equal(V.value(a, 'password'), 'P4ss-ñandú!');
  assert.equal(V.value(a, 'twitchPassword'), 'tw-pass');
  assert.equal(V.value(a, 'apiKey'), a.apiKey.value);
  assert.equal(V.value({ apiKey: 'KEY-EN-TEXTO' }, 'apiKey'), 'KEY-EN-TEXTO', 'la Key como texto también');
  assert.equal(V.value(a, 'geforce'), true);
  assert.equal(V.value({ services: { geforceNow: { linked: 'TRUE' } } }, 'geforce'), true, 'lo que venía del Excel');
  assert.equal(V.value({}, 'geforce'), false);
  assert.equal(V.value({}, 'password'), '');
  const f = (k) => V.FIELDS.find((x) => x.key === k);
  assert.equal(V.mask('P4ss-ñandú!', f('password')), '••••••••');
  assert.equal(V.mask('gato@ejemplo.com', f('email')), 'gat•••@ejemplo.com');
  assert.equal(V.mask(a.apiKey.value, f('apiKey')), 'ABCD-••••-90EF');
  assert.equal(V.mask('', f('password')), '');
  assert.equal(V.mask('una-contraseña-larga@123', f('password')), '••••••••', 'una contraseña nunca asoma, aunque sea larga o tenga @');
  const e = J(V.entries(DATA));
  assert.deepEqual(e, [{ i: 0, name: 'Mi main', accountName: 'Gato.1234', tags: ['main', 'keys', 'mi-tag'], keyFp: V.fingerprint(a.apiKey.value),
    fields: ['email', 'password', 'gmailPassword', 'twitchUser', 'twitchEmail', 'twitchPassword', 'geforce', 'apiKey', 'notes'] }]);
  ['P4ss', 'gm41l', 'tw-pass', 'ABCD1234', 'gato@'].forEach((s) => assert.ok(!JSON.stringify(e).includes(s), s));
  assert.deepEqual(J(V.entries({ accounts: [{ tags: 'farming, taxi ,', login: { password: 'x' } }] })), [{ i: 0, name: 'Cuenta 1', accountName: '', tags: ['farming', 'taxi'], keyFp: '', fields: ['password'] }]);
  assert.deepEqual(J(V.entries(null)), []);
  assert.equal(V.fingerprint('abc'), '1a47e90b', 'FNV-1a de 32 bits, la misma de Mis cuentas');
});
