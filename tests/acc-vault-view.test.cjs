// Cuentas renovado (BL-070, CTA-3): js/acc-vault-view.js, la pestaña Llavero. Corre con: node --test tests/*.test.cjs
// Abre tu archivo de siempre en modo lectura: todo enmascarado, «Ver» 20 s, «Copiar» vacía el portapapeles a
// los 30 s, se cierra a los 5 minutos sin uso y al salir de Cuentas; con el Llavero abierto, Mis cuentas suma
// sus etiquetas y muestra en gris las cuentas sin Key (D7).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/acc-vault-view.js');
const CAT = JSON.parse(read('assets/data/accounts/catalog.json'));
const J = (x) => JSON.parse(JSON.stringify(x));
const FILES = ['js/acc-model.js', 'js/acc-vault.js', 'js/acc-vault-view.js', 'js/acc-view.js'];

const DATA = { version: 1, lastUpdated: '2026-10-26', accounts: [
  { id: 'c1', name: 'Mi main', login: { email: 'gato@ejemplo.com', password: 'PASS-MAIN-1', gmailPassword: 'GMAIL-1' },
    services: { twitch: { linked: true, username: 'gatonegro', email: 'tw@ejemplo.com', password: 'TWITCH-1' }, geforceNow: { linked: true } },
    apiKey: { value: 'KEY-MAIN-SECRETA' }, notes: 'Nota «uno»', tags: ['farming', 'mi-tag'], gw2: { accountName: 'Gato Negro.1234' } },
  { id: 'c2', name: 'Sin key', login: { email: 'otra@ejemplo.com', password: 'PASS-OTRA-2' }, tags: ['alter', 'taxi'], gw2: { accountName: 'Otra.5678' } },
] };
const PASS = 'contraseña de prueba 1';

function fakeDom() {
  const els = {};
  function el(id, tag) {
    const n = {
      tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', hidden: false, listeners: {}, parentNode: null, value: '', dispatched: [], textContent: '',
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; },
      removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; },
      appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
      insertBefore(c, ref) { const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); c.parentNode = this; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      dispatchEvent(e) { this.dispatched.push(e.type); }, click() {},
      contains() { return false; }, querySelector() { return null; },
    };
    Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } });
    if (id) n.id = id;
    return n;
  }
  const panel = el('accountsPanel', 'section');
  panel.appendChild(el('accountsTitle', 'h2'));
  panel.appendChild(el(null, 'div'));
  el('keySelectGlobal', 'select'); el('keysMenuBtn', 'button');
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null, hasFocus: () => true,
    getElementById: (id) => els[id] || (/^(vkPass|vkClock)$/.test(id) && els.cvRoot && els.cvRoot.innerHTML.includes('id="' + id + '"') ? el(id) : null),
    createElement: (t) => el(null, t), addEventListener() {},
  };
  return { els, panel, document };
}

const ACC = { name: 'Gato Negro.1234', created: '2012-08-28T00:00:00Z', access: ['GuildWars2'], daily_ap: 0, monthly_ap: 0, guilds: [] };
async function boot(opts) {
  opts = opts || {};
  const D = fakeDom(), store = Object.assign({}, opts.store || {}), timers = [], toasts = [], clip = [], win = { listeners: {} };
  let T = Date.UTC(2026, 9, 26, 1, 0);
  class FDate extends Date { static now() { return T; } }
  const sb = {
    console: { info() {}, warn() {} }, crypto: globalThis.crypto, TextEncoder, TextDecoder, atob, btoa, Date: FDate,
    document: D.document, location: { hash: '#/account/accounts' }, Event: function (t) { this.type = t; }, Promise,
    setTimeout: (f, ms) => { if ((ms || 0) < 1000) { f(); return 0; } timers.push({ f, at: T + ms, on: true }); return timers.length; },
    clearTimeout: (i) => { if (timers[i - 1]) timers[i - 1].on = false; },
    setInterval: (f) => { win.tick = f; return 99; }, clearInterval: () => { win.tick = null; },
    addEventListener: (t, f) => { (win.listeners[t] = win.listeners[t] || []).push(f); },
    toast: (k, t) => toasts.push(k + ': ' + t),
    navigator: { clipboard: { writeText: (s) => { clip.push(s); return Promise.resolve(); } } },
    fetch: (u) => {
      const ok = (v) => Promise.resolve({ ok: true, json: () => Promise.resolve(J(v)) });
      if (u === 'assets/data/accounts/catalog.json') return ok(CAT);
      const p = u.replace('https://api.guildwars2.com', '').split('?')[0];
      if (p === '/v2/tokeninfo') return ok({ permissions: ['account'] });
      if (p === '/v2/account') return ok(ACC);
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
    },
    Storage: {
      STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys', ACCOUNT_SELECTED: 'gn:account:selected' },
      get: (k) => (k === 'gn:account:keys' ? J(opts.keys || [{ value: 'KEY-MAIN-SECRETA', label: 'Mi main', tag: 'main' }]) : k === 'gn:account:selected' ? 'KEY-MAIN-SECRETA' : k in store ? JSON.parse(store[k]) : null),
      set: (k, v) => { store[k] = JSON.stringify(v); },
    },
  };
  sb.window = sb;
  vm.createContext(sb);
  FILES.forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  await flush();
  const host = D.els.cvRoot;
  const ev = (type, target, extra) => host.listeners[type].forEach((f) => f(Object.assign({ target, preventDefault() {} }, extra || {})));
  const btn = (attrs) => ({ getAttribute: (k) => attrs[k] || null, parentNode: null });
  const advance = async (ms) => { T += ms; timers.filter((t) => t.on && t.at <= T).forEach((t) => { t.on = false; t.f(); }); if (win.tick) win.tick(); await flush(); };
  return { sb, D, host, store, toasts, clip, win, ev, btn, advance, now: () => T };
}
const flush = async () => { for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r)); };
async function encrypted(sb) { return sb.AccVault.encryptV2(DATA, PASS, { iter: 1000 }); }
async function openWith(x, text, pass) {
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  x.ev('change', { id: 'vkFile', files: [{ name: 'mis-cuentas.enc', text: () => Promise.resolve(text) }] });
  await flush();
  x.D.els.vkPass = { id: 'vkPass', value: pass };
  x.ev('click', x.btn({ 'data-vk': 'open' }));
  // WebCrypto descifra en otro hilo: espero en tiempo real a que termine.
  for (let i = 0; i < 200 && x.sb.AccVaultView._pure.state().busy; i++) await new Promise((r) => setTimeout(r, 10));
  await flush();
}

test('archivo: presupuesto, versión, manifiesto entre acc-vault y acc-view, fuera de index.html, sin storage propio ni emojis', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, Buffer.byteLength(SRC) + ' bytes');
  assert.match(SRC, /Versión: 1\.1\.0/);
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|indexedDB|fetch\(/, 'no guarda ni manda nada');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  const a = man.indexOf('js/acc-vault.js'), b = man.indexOf('js/acc-vault-view.js'), c = man.indexOf('js/acc-view.js');
  assert.ok(a >= 0 && a < b && b < c, 'acc-vault, después la pestaña, después acc-view');
  assert.doesNotMatch(read('index.html'), /acc-vault/);
  assert.equal(read('js/accounts-panel.js').includes("'accounts:lastFile'"), true, 'la copia que lee es la del panel anterior');
});

test('tiempos D4: «Ver» 20 s, portapapeles 30 s, cierre a los 5 minutos', () => {
  const sb = { console: { info() {} } };
  sb.window = sb; vm.createContext(sb); vm.runInContext(SRC, sb);
  const P = sb.AccVaultView._pure;
  assert.equal(P.REVEAL, 20000); assert.equal(P.CLIP, 30000); assert.equal(P.IDLE, 300000);
  assert.equal(P.LEGACY_KEY, 'accounts:lastFile');
  assert.equal(P.clock(300000), '5:00'); assert.equal(P.clock(61001), '1:02'); assert.equal(P.clock(-5), '0:00');
});

test('CSS: solo los textos y superficies del theme que ya mide Cuentas (4.5:1 en los 19), una columna en el celular', () => {
  const css = (() => { const sb = { console: { info() {} } }; sb.window = sb; vm.createContext(sb); vm.runInContext(SRC, sb); return sb.AccVaultView._pure.CSS; })();
  const colors = [...css.matchAll(/(?:^|[;{])color:([^;}]+)/g)].map((m) => m[1].trim());
  assert.ok(colors.length >= 5);
  colors.forEach((c) => assert.match(c, /^var\(--tx-[12]\)$/, 'texto ' + c));
  [...css.matchAll(/background:([^;}]+)/g)].forEach((m) => assert.match(m[1].trim(), /^var\(--bg-[01]\)$/, 'fondo ' + m[1]));
  assert.match(css, /@media \(max-width:900px\)\{\.vk-grid\{grid-template-columns:1fr\}/);
});

test('cerrado: pide archivo y contraseña, sin secretos; el panel anterior queda a mano', async () => {
  const x = await boot();
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  const h = x.host.innerHTML;
  assert.match(h, /<h3 id="vkT">Tu Llavero está cerrado<\/h3>/);
  assert.match(h, /<input type="file" id="vkFile" accept="\.enc,\.json,\.txt"/);
  assert.match(h, /<input type="password" id="vkPass" autocomplete="off"/);
  assert.match(h, /data-vk="legacy" aria-pressed="false">Mostrar el panel anterior/);
  assert.ok(x.D.panel.classList.contains('cv-mine'), 'el panel viejo escondido');
  x.ev('click', x.btn({ 'data-vk': 'legacy' }));
  assert.ok(!x.D.panel.classList.contains('cv-mine'), 'a pedido, se ve el panel viejo');
  assert.match(x.host.innerHTML, /aria-pressed="true">Ocultar el panel anterior/);
  x.D.els.vkPass = { id: 'vkPass', value: 'x' };
  x.ev('click', x.btn({ 'data-vk': 'open' }));
  assert.match(x.host.innerHTML, /role="alert">Elegí tu archivo \.enc\./);
  const y = await boot({ store: { 'accounts:lastFile': JSON.stringify({ name: 'guardado.enc', data: 'U2FsdGVkX1+abc' }) } });
  y.ev('click', y.btn({ 'data-cv-tab': 'vault' }));
  assert.match(y.host.innerHTML, /Último archivo abierto en este navegador: <b>guardado\.enc<\/b>/);
});

test('abrir: contraseña mala avisa; buena muestra todo enmascarado, los campos que hay y nada más', async () => {
  const x = await boot();
  const text = await encrypted(x.sb);
  await openWith(x, text, 'otra cosa');
  assert.match(x.host.innerHTML, /Esa contraseña no abre este archivo/);
  assert.ok(!x.sb.AccVaultView.isOpen());
  await openWith(x, text, PASS);
  assert.ok(x.sb.AccVaultView.isOpen());
  const h = x.host.innerHTML;
  assert.match(h, /Llavero abierto · <b>mis-cuentas\.enc<\/b> · 2 cuentas · se cierra solo en <b id="vkClock">5:00<\/b>/);
  ['PASS-MAIN-1', 'GMAIL-1', 'TWITCH-1', 'KEY-MAIN-SECRETA', 'PASS-OTRA-2', PASS].forEach((s) => assert.ok(!h.includes(s), s + ' no va al HTML'));
  assert.match(h, /<b id="vkN-0">Mi main<\/b><small>Gato Negro\.1234<\/small>/);
  assert.match(h, /data-vk-show="0:password" aria-pressed="false">Ver<span class="cv-sr"> Contraseña de Mi main<\/span>/);
  assert.match(h, /data-vk-copy="0:twitchPassword">Copiar/);
  assert.match(h, /GeForce NOW<\/span><span class="vk-v">Vinculada<\/span>/);
  assert.match(h, /<span class="vk-v vk-note">Nota «uno»<\/span>/);
  assert.ok(!/data-vk-show="1:twitchPassword"/.test(h), 'la segunda no tiene Twitch: no se inventa la fila');
  assert.doesNotMatch(h, /cifrado anterior/, 'v2 no lleva el aviso');
  assert.ok(x.toasts.includes('success: Llavero abierto: 2 cuentas'));
  x.ev('input', { id: 'vkQ', value: 'TAXI' });
  assert.ok(!x.host.innerHTML.includes('vkN-0') && x.host.innerHTML.includes('vkN-1'), 'busca por etiqueta sin mayúsculas');
});

test('«Ver» muestra un dato y lo oculta a los 20 s; «Copiar» lo copia y vacía el portapapeles a los 30 s', async () => {
  const x = await boot();
  await openWith(x, await encrypted(x.sb), PASS);
  x.ev('click', x.btn({ 'data-vk-show': '0:password' }));
  assert.match(x.host.innerHTML, /<span class="vk-v">PASS-MAIN-1<\/span>/);
  assert.match(x.host.innerHTML, /aria-pressed="true">Ocultar/);
  assert.ok(!x.host.innerHTML.includes('GMAIL-1'), 'solo ese dato');
  x.ev('click', x.btn({ 'data-vk-show': '0:password' }));
  assert.ok(!x.host.innerHTML.includes('PASS-MAIN-1'), '«Ocultar» lo oculta ya');
  x.ev('click', x.btn({ 'data-vk-show': '0:password' }));
  await x.advance(19000);
  assert.ok(x.host.innerHTML.includes('PASS-MAIN-1'));
  await x.advance(1000);
  assert.ok(!x.host.innerHTML.includes('PASS-MAIN-1'), 'a los 20 s se oculta');
  x.ev('click', x.btn({ 'data-vk-copy': '0:gmailPassword' }));
  await flush();
  assert.deepEqual(x.clip, ['GMAIL-1']);
  await x.advance(29000);
  assert.deepEqual(x.clip, ['GMAIL-1']);
  await x.advance(1000);
  assert.deepEqual(x.clip, ['GMAIL-1', ''], 'a los 30 s vacía el portapapeles');
});

test('se cierra solo a los 5 minutos sin uso, al salir de Cuentas y con «Cerrar ya»; lo descifrado se va', async () => {
  const x = await boot();
  const text = await encrypted(x.sb);
  await openWith(x, text, PASS);
  await x.advance(240000);
  x.ev('keydown', { id: 'vkQ' }, { key: 'a' });
  await x.advance(240000);
  assert.ok(x.sb.AccVaultView.isOpen(), 'escribir reinicia la cuenta');
  x.ev('click', x.btn({ 'data-vk': 'legacy' }));
  await x.advance(240000);
  assert.ok(x.sb.AccVaultView.isOpen(), 'tocar un botón también');
  await x.advance(61000);
  assert.ok(!x.sb.AccVaultView.isOpen());
  assert.ok(x.toasts.some((t) => /pasaron 5 minutos sin uso/.test(t)));
  assert.match(x.host.innerHTML, /Tu Llavero está cerrado/);
  assert.deepEqual(J(x.sb.AccVaultView._pure.state().list), []);
  assert.equal(x.sb.AccVaultView._pure.state().data, null);
  await openWith(x, text, PASS);
  x.sb.location.hash = '#/meta';
  x.win.listeners.hashchange.forEach((f) => f());
  assert.ok(!x.sb.AccVaultView.isOpen(), 'al salir de Cuentas');
  await openWith(x, text, PASS);
  x.ev('click', x.btn({ 'data-vk': 'lock' }));
  assert.ok(!x.sb.AccVaultView.isOpen());
});

test('Mis cuentas con el Llavero abierto: suma sus etiquetas a la tarjeta de su Key y muestra en gris la que no tiene Key (D7)', async () => {
  const x = await boot();
  const before = x.host.innerHTML;
  assert.match(before, /1 cuenta con Key/);
  await openWith(x, await encrypted(x.sb), PASS);
  x.ev('click', x.btn({ 'data-cv-tab': 'mine' }));
  const h = x.host.innerHTML;
  assert.match(h, /1 cuenta con Key/, 'la de solo Llavero no cuenta como Key');
  assert.match(h, />Farming<\/span>/);
  assert.match(h, />mi-tag<\/span>/);
  assert.match(h, /<b id="cvN-vk1">Otra\.5678<\/b>/);
  assert.match(h, /Está en tu Llavero, pero no tiene API Key en la Bóveda: cargala para ver sus datos\./);
  assert.ok(!/data-cv-use="vk1"/.test(h), 'sin Key no hay «Usar esta»');
  assert.ok(!h.includes('cvN-vk0'), 'la que tiene Key no aparece dos veces');
  assert.ok(!h.includes('PASS-OTRA-2'));
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  x.ev('click', x.btn({ 'data-vk': 'lock' }));
  x.ev('click', x.btn({ 'data-cv-tab': 'mine' }));
  assert.ok(!x.host.innerHTML.includes('cvN-vk1'), 'al cerrar se van');
  const z = await boot({ keys: [] });
  await openWith(z, await encrypted(z.sb), PASS);
  z.ev('click', z.btn({ 'data-cv-tab': 'mine' }));
  assert.match(z.host.innerHTML, /<b id="cvN-vk0">Gato Negro\.1234<\/b>/, 'sin ninguna Key, igual se ven las del Llavero');
  assert.match(z.host.innerHTML, /<b id="cvN-vk1">Otra\.5678<\/b>/);
});
