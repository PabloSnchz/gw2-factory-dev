// Cuentas renovado (BL-070, CTA-4a): js/acc-vault-edit.js, editar el Llavero y guardarlo con el cifrado nuevo.
// Corre con: node --test tests/*.test.cjs. Agregar, editar y borrar sin perder nada (ni lo que no conozco),
// guardar como «…-v2.enc» comprobando antes que abre igual, copia cifrada en el navegador (D3) y, con cambios
// sin guardar, el Llavero no se cierra a los 5 minutos ni al salir de Cuentas.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/acc-vault-edit.js');
const CAT = JSON.parse(read('assets/data/accounts/catalog.json'));
const J = (x) => JSON.parse(JSON.stringify(x));
const FILES = ['js/acc-model.js', 'js/acc-vault.js', 'js/acc-vault-view.js', 'js/acc-vault-edit.js', 'js/acc-view.js'];

const DATA = { version: 1, lastUpdated: '2026-10-20', accounts: [
  { id: 'c1', name: 'Mi main', login: { email: 'gato@ejemplo.com', password: 'PASS-MAIN-1', gmailPassword: 'GMAIL-1' },
    services: { twitch: { linked: true, username: 'gatonegro', email: 'tw@ejemplo.com', password: 'TWITCH-1' }, geforceNow: { linked: 'TRUE' } },
    apiKey: { value: 'KEY-MAIN-SECRETA', extra: 1 }, notes: 'Nota «uno»', tags: ['main', 'mi-tag'], gw2: { accountName: 'Gato Negro.1234', created: '2012-08-28' }, campoRaro: { a: [1, 2] } },
  { id: 'c2', name: 'Otra', login: { email: 'otra@ejemplo.com', password: 'PASS-OTRA-2' }, apiKey: 'KEY-EN-TEXTO', tags: 'alter, taxi', gw2: { accountName: 'Otra.5678' } },
] };
const PASS = 'contraseña de prueba 1', NEWPASS = 'nueva-clave-segura';

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const unesc = (s) => s.replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENT[m]);

function fakeDom() {
  const els = {};
  function el(id, tag) {
    const n = {
      tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', hidden: false, listeners: {}, parentNode: null, value: '', dispatched: [], textContent: '', focused: 0,
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; },
      removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; },
      appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
      insertBefore(c, ref) { const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); c.parentNode = this; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      dispatchEvent(e) { this.dispatched.push(e.type); }, click() { this.clicked = (this.clicked || 0) + 1; }, focus() { D.focused = this.id; },
      contains() { return false; }, querySelector() { return null; },
    };
    Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } });
    if (id) n.id = id;
    return n;
  }
  const D = { els, focused: null, anchors: [] };
  const panel = el('accountsPanel', 'section');
  panel.appendChild(el('accountsTitle', 'h2'));
  panel.appendChild(el(null, 'div'));
  el('keySelectGlobal', 'select'); el('keysMenuBtn', 'button');
  // Lo que está dibujado existe: se busca por id en el HTML del panel (con su valor y si está tildado).
  const live = (id) => {
    const h = els.cvRoot ? els.cvRoot.innerHTML : '';
    if (!h.includes('id="' + id + '"')) return null;
    const n = el(id);
    const inp = h.match(new RegExp('<input[^>]*id="' + id + '"[^>]*>'));
    if (inp) { const m = inp[0].match(/ value="([^"]*)"/); n.value = m ? unesc(m[1]) : ''; n.checked = / checked/.test(inp[0]); }
    const ta = h.match(new RegExp('<textarea id="' + id + '"[^>]*>([\\s\\S]*?)</textarea>'));
    if (ta) n.value = unesc(ta[1]);
    return n;
  };
  D.document = {
    readyState: 'complete', head: el(null, 'head'), body: el(null, 'body'), activeElement: null, hasFocus: () => true,
    getElementById: (id) => (D.over && id in D.over ? D.over[id] : els[id] && !/^(vke|vkPass|vkClock)/.test(id) ? els[id] : live(id)),
    createElement: (t) => { const n = el(null, t); if (t === 'a') D.anchors.push(n); return n; }, addEventListener() {},
  };
  D.panel = panel;
  return D;
}

const ACC = { name: 'Gato Negro.1234', created: '2012-08-28T00:00:00Z', access: ['GuildWars2'], daily_ap: 0, monthly_ap: 0, guilds: [] };
async function boot(opts) {
  opts = opts || {};
  const D = fakeDom(), store = Object.assign({}, opts.store || {}), removed = [], timers = [], toasts = [], blobs = [], win = { listeners: {} };
  let T = Date.UTC(2026, 9, 26, 2, 0);
  class FDate extends Date { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }
  function FBlob(parts) { this.text = parts.join(''); blobs.push(this.text); }
  const sb = {
    console: { info() {}, warn() {} }, crypto: globalThis.crypto, TextEncoder, TextDecoder, atob, btoa, Date: FDate, Blob: FBlob,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    document: D.document, location: { hash: '#/account/accounts' }, Event: function (t) { this.type = t; }, Promise,
    setTimeout: (f, ms) => { if ((ms || 0) < 1000) { f(); return 0; } timers.push({ f, at: T + ms, on: true }); return timers.length; },
    clearTimeout: (i) => { if (timers[i - 1]) timers[i - 1].on = false; },
    setInterval: (f) => { win.tick = f; return 99; }, clearInterval: () => { win.tick = null; },
    addEventListener: (t, f) => { (win.listeners[t] = win.listeners[t] || []).push(f); },
    toast: (k, t) => toasts.push(k + ': ' + t),
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
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
      get: (k) => (k === 'gn:account:keys' ? [{ value: 'KEY-MAIN-SECRETA', label: 'Mi main', tag: 'main' }] : k === 'gn:account:selected' ? 'KEY-MAIN-SECRETA' : k in store ? JSON.parse(store[k]) : null),
      set: (k, v) => { store[k] = JSON.stringify(v); },
      remove: (k) => { removed.push(k); delete store[k]; },
    },
  };
  sb.window = sb;
  vm.createContext(sb);
  FILES.forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  await flush();
  const host = D.els.cvRoot;
  const ev = (type, target, extra) => host.listeners[type].forEach((f) => f(Object.assign({ target, preventDefault() {} }, extra || {})));
  const btn = (attrs) => ({ getAttribute: (k) => (k in attrs ? attrs[k] : null), parentNode: null });
  const advance = async (ms) => { T += ms; timers.filter((t) => t.on && t.at <= T).forEach((t) => { t.on = false; t.f(); }); if (win.tick) win.tick(); await flush(); };
  return { sb, D, host, store, removed, toasts, blobs, win, ev, btn, advance };
}
const flush = async () => { for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r)); };
const wait = async (x, busy) => { for (let i = 0; i < 400 && busy(); i++) await new Promise((r) => setTimeout(r, 10)); await flush(); };
async function openWith(x, text, pass) {
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  x.ev('change', { id: 'vkFile', files: [{ name: 'mis-cuentas.enc', text: () => Promise.resolve(text) }] });
  await flush();
  x.D.over = { vkPass: { id: 'vkPass', value: pass } };
  x.ev('click', x.btn({ 'data-vk': 'open' }));
  await wait(x, () => x.sb.AccVaultView._pure.state().busy);
  x.D.over = null;
}
// Escribe en el formulario dibujado: parte de lo que se ve y cambia solo lo pedido.
function typeInto(x, changes) {
  x.D.over = {};
  const h = x.host.innerHTML;
  [...h.matchAll(/id="(vke[FT]-[\w-]+)"/g)].forEach((m) => { x.D.over[m[1]] = x.D.document.getElementById(m[1]); });
  x.D.over = Object.assign({}, x.D.over);
  Object.keys(changes).forEach((k) => {
    const n = x.D.over[k] || { id: k };
    if (typeof changes[k] === 'boolean') n.checked = changes[k]; else n.value = changes[k];
    x.D.over[k] = n;
  });
}
async function save(x, p1, p2) {
  x.ev('click', x.btn({ 'data-vke': 'save' }));
  x.D.over = { vkeP1: { id: 'vkeP1', value: p1 }, vkeP2: { id: 'vkeP2', value: p2 === undefined ? p1 : p2 } };
  x.ev('click', x.btn({ 'data-vke': 'save-go' }));
  await wait(x, () => x.sb.AccVaultEdit._pure.state().busy);
  x.D.over = null;
}

test('archivo: presupuesto, versión, manifiesto entre la vista del Llavero y acc-view, nada en claro, sin CryptoJS', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, Buffer.byteLength(SRC) + ' bytes');
  assert.match(SRC, /Versión: 1\.1\.0/);
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(code, /localStorage|sessionStorage|CryptoJS|fetch\(/);
  assert.equal((code.match(/S\.set\(/g) || []).length, 1, 'escribe una sola cosa en el navegador');
  assert.match(code, /S\.set\(V2_KEY, \{ name: name, data: text/, 'y es el texto cifrado');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  const a = man.indexOf('js/acc-vault-view.js'), b = man.indexOf('js/acc-vault-edit.js'), c = man.indexOf('js/acc-view.js');
  assert.ok(a >= 0 && a < b && b < c);
  assert.doesNotMatch(read('index.html'), /acc-vault-edit/);
  assert.doesNotMatch(read('js/storage.js'), /'accounts:vault2'/, 'la copia nueva no es gn: y el respaldo no la toca');
});

test('editar toca solo lo que cambió: lo demás, también lo desconocido, queda igual; la Key conserva su forma', () => {
  const sb = { console: { info() {} } }; sb.window = sb; vm.createContext(sb);
  vm.runInContext(read('js/acc-vault.js'), sb); vm.runInContext(SRC, sb);
  const P = sb.AccVaultEdit._pure, a = DATA.accounts[0], same = { name: 'Mi main', accountName: 'Gato Negro.1234', email: 'gato@ejemplo.com', password: 'PASS-MAIN-1', gmailPassword: 'GMAIL-1',
    twitchUser: 'gatonegro', twitchEmail: 'tw@ejemplo.com', twitchPassword: 'TWITCH-1', apiKey: 'KEY-MAIN-SECRETA', geforce: true, notes: 'Nota «uno»', tags: ['main', 'mi-tag'] };
  assert.deepEqual(J(P.apply(a, same)), J(a), 'sin cambios, idéntica (GeForce «TRUE» del Excel incluido)');
  const b = J(P.apply(a, Object.assign({}, same, { password: ' nueva ', geforce: false, apiKey: 'KEY-NUEVA', tags: ['alter'] })));
  assert.equal(b.login.password, ' nueva ');
  assert.equal(b.services.geforceNow.linked, false);
  assert.deepEqual(b.apiKey, { value: 'KEY-NUEVA', extra: 1 });
  assert.deepEqual(b.tags, ['alter']);
  assert.deepEqual(b.campoRaro, { a: [1, 2] });
  assert.equal(b.gw2.created, '2012-08-28');
  const c = J(P.apply(DATA.accounts[1], { name: 'Otra', accountName: 'Otra.5678', email: 'otra@ejemplo.com', password: 'PASS-OTRA-2', gmailPassword: '', twitchUser: '', twitchEmail: '', twitchPassword: '', apiKey: 'KEY-2', geforce: false, notes: '', tags: ['alter', 'taxi'] }));
  assert.equal(c.apiKey, 'KEY-2', 'la Key en texto sigue en texto');
  assert.equal(c.tags, 'alter, taxi', 'las mismas etiquetas no cambian de forma');
  assert.equal(c.services, undefined, 'no inventa Twitch ni GeForce');
  const d = J(P.apply(a, Object.assign({}, same, { twitchUser: '', twitchEmail: '', twitchPassword: '' })));
  assert.equal(d.services.twitch.linked, false, 'sin datos de Twitch, deja de estar vinculada');
  const n = J(P.apply(null, { name: 'Nueva', accountName: '', email: 'n@x.com', password: 'p', gmailPassword: '', twitchUser: '', twitchEmail: '', twitchPassword: '', apiKey: '', geforce: false, notes: '', tags: [] }, 5));
  assert.deepEqual(n, { id: 'cuenta_5', name: 'Nueva', login: { email: 'n@x.com', password: 'p' }, services: {}, apiKey: null, notes: '', tags: [] });
  assert.deepEqual(J(P.tagList('farming, Mi-Tag ,, mi-tag', ['main', 'farming'])), ['main', 'farming', 'Mi-Tag']);
  assert.equal(P.outName('mis-cuentas.enc'), 'mis-cuentas-v2.enc');
  assert.equal(P.outName('mis-cuentas-v2.enc'), 'mis-cuentas-v2.enc');
  assert.equal(P.outName('llavero'), 'llavero-v2.enc');
  assert.equal(P.outName(''), 'llavero-v2.enc');
  assert.equal(P.MIN_PASS, 8);
  assert.equal(P.V2_KEY, 'accounts:vault2'); assert.equal(P.OLD_KEY, 'accounts:lastFile');
});

test('CSS: solo textos y superficies del theme, 44 px en el celular', () => {
  const sb = { console: { info() {} } }; sb.window = sb; vm.createContext(sb); vm.runInContext(SRC, sb);
  const css = sb.AccVaultEdit._pure.CSS;
  [...css.matchAll(/(?:^|[;{])color:([^;}]+)/g)].forEach((m) => assert.match(m[1].trim(), /^var\(--tx-[12]\)$/, m[1]));
  [...css.matchAll(/background:([^;}]+)/g)].forEach((m) => assert.match(m[1].trim(), /^var\(--bg-[01]\)$/, m[1]));
  assert.match(css, /@media \(max-width:900px\)\{[^\n]*min-height:44px/);
});

test('editar en pantalla: el formulario trae los datos, «Listo» cambia solo eso y avisa que falta guardar', async () => {
  const x = await boot();
  await openWith(x, await x.sb.AccVault.encryptV2(DATA, PASS, { iter: 1000 }), PASS);
  let h = x.host.innerHTML;
  assert.match(h, /data-vke="add">Agregar cuenta/);
  assert.match(h, /data-vke-edit="0">Editar<span class="cv-sr"> Mi main/);
  assert.doesNotMatch(h, /Tenés cambios sin guardar/);
  x.ev('click', x.btn({ 'data-vke-edit': '0' }));
  h = x.host.innerHTML;
  assert.match(h, /<h3 id="vkeT">Editar «Mi main»<\/h3>/);
  assert.match(h, /id="vkeF-password" value="PASS-MAIN-1" autocomplete="new-password"/);
  assert.match(h, /<input type="checkbox" id="vkeF-geforce" checked>/);
  assert.match(h, /<input type="checkbox" id="vkeT-main" checked>Principal/);
  assert.match(h, /id="vkeF-tags" value="mi-tag"/);
  assert.doesNotMatch(h, /vk-grid/, 'mientras edito, solo el formulario');
  assert.equal(x.D.focused, 'vkeF-name', 'el foco va al primer campo');
  typeInto(x, { 'vkeF-password': ' CAMBIADA 9 ', 'vkeF-email': '  nuevo@ejemplo.com ', 'vkeT-farming': true });
  x.ev('click', x.btn({ 'data-vke': 'apply' }));
  const d = J(x.sb.AccVaultView.data());
  assert.equal(d.accounts[0].login.password, ' CAMBIADA 9 ', 'la contraseña va tal cual, con sus espacios');
  assert.equal(d.accounts[0].login.email, 'nuevo@ejemplo.com', 'el resto sin espacios en los bordes');
  assert.deepEqual(d.accounts[0].tags, ['main', 'farming', 'mi-tag']);
  assert.deepEqual(d.accounts[0].campoRaro, { a: [1, 2] });
  assert.equal(d.accounts[0].services.geforceNow.linked, 'TRUE', 'lo que no toqué no cambia de forma');
  assert.deepEqual(d.accounts[1], DATA.accounts[1], 'la otra cuenta, intacta');
  assert.match(x.host.innerHTML, /Tenés cambios sin guardar/);
  assert.equal(x.D.focused, 'vkeSave');
  x.ev('click', x.btn({ 'data-vke-edit': '0' }));
  typeInto(x, { 'vkeF-name': '  ' });
  x.ev('click', x.btn({ 'data-vke': 'apply' }));
  assert.match(x.host.innerHTML, /role="alert">Poné un nombre para la cuenta\./);
  x.ev('keydown', { id: 'vkeF-name' }, { key: 'Escape' });
  assert.doesNotMatch(x.host.innerHTML, /vkeT/, 'Escape cancela');
});

test('agregar y borrar (con confirmación); Mis cuentas se entera', async () => {
  const x = await boot();
  await openWith(x, await x.sb.AccVault.encryptV2(DATA, PASS, { iter: 1000 }), PASS);
  x.ev('click', x.btn({ 'data-vke': 'add' }));
  assert.match(x.host.innerHTML, /Agregar una cuenta/);
  typeInto(x, { 'vkeF-name': 'Tercera', 'vkeF-accountName': 'Ter.0001', 'vkeT-f2p': true });
  x.ev('click', x.btn({ 'data-vke': 'apply' }));
  let d = J(x.sb.AccVaultView.data());
  assert.equal(d.accounts.length, 3);
  assert.equal(d.accounts[2].name, 'Tercera');
  assert.deepEqual(d.accounts[2].tags, ['f2p']);
  assert.match(x.host.innerHTML, /<b id="vkN-2">Tercera<\/b>/);
  x.ev('click', x.btn({ 'data-vke-del': '1' }));
  assert.match(x.host.innerHTML, /¿Borro «Otra» del Llavero\?/);
  assert.equal(x.D.focused, 'vkeDelOk');
  assert.equal(x.sb.AccVaultView.data().accounts.length, 3, 'todavía no');
  x.ev('click', x.btn({ 'data-vke': 'del-ok' }));
  d = J(x.sb.AccVaultView.data());
  assert.deepEqual(d.accounts.map((a) => a.name), ['Mi main', 'Tercera']);
  x.ev('click', x.btn({ 'data-cv-tab': 'mine' }));
  assert.match(x.host.innerHTML, /<b id="cvN-vk1">Ter\.0001<\/b>/, 'la nueva, en gris en Mis cuentas');
});

test('guardar: contraseña corta o distinta no baja nada; bien, baja «-v2.enc» que abre igual y deja la copia nueva sin tocar la vieja', async () => {
  const x = await boot({ store: { 'accounts:lastFile': JSON.stringify({ name: 'mis-cuentas.enc', data: 'U2FsdGVkX1+viejo' }) } });
  await openWith(x, await x.sb.AccVault.encryptV2(DATA, PASS, { iter: 1000 }), PASS);
  x.ev('click', x.btn({ 'data-vke-edit': '1' }));
  typeInto(x, { 'vkeF-notes': 'nota nueva' });
  x.ev('click', x.btn({ 'data-vke': 'apply' }));
  await save(x, 'corta');
  assert.match(x.host.innerHTML, /al menos 8 caracteres/);
  await save(x, NEWPASS, NEWPASS + 'x');
  assert.match(x.host.innerHTML, /no son iguales/);
  assert.equal(x.blobs.length, 0, 'no bajó nada');
  const realOpen = x.sb.AccVault.open;
  x.sb.AccVault.open = () => Promise.resolve({ format: 'v2', data: { accounts: [] } });
  await save(x, NEWPASS);
  assert.match(x.host.innerHTML, /No pude guardar: el archivo cifrado no dio lo mismo al abrirlo\. No se bajó nada\./);
  assert.equal(x.blobs.length, 0, 'si la comprobación falla, no baja nada');
  assert.equal(x.store['accounts:vault2'], undefined);
  x.sb.AccVault.open = realOpen;
  await save(x, NEWPASS);
  assert.equal(x.blobs.length, 1);
  assert.equal(x.D.anchors.at(-1).download, 'mis-cuentas-v2.enc');
  assert.equal(x.D.anchors.at(-1).clicked, 1);
  const file = x.blobs[0];
  ['PASS-MAIN-1', 'KEY-EN-TEXTO', 'nota nueva', 'gato@'].forEach((s) => assert.ok(!file.includes(s), s + ' no va en claro'));
  assert.equal(JSON.parse(file).kdf.iter, 600000, 'D2: 600.000 de verdad al guardar');
  const back = J((await x.sb.AccVault.open(file, NEWPASS)).data);
  const want = J(DATA); want.accounts[1].notes = 'nota nueva'; want.lastUpdated = '2026-10-26';
  assert.deepEqual(back, want, 'abre con todo: lo editado, lo que no y lo desconocido');
  const copy = JSON.parse(x.store['accounts:vault2']);
  assert.equal(copy.name, 'mis-cuentas-v2.enc');
  assert.equal(copy.data, file, 'la copia es el mismo archivo cifrado');
  assert.deepEqual(x.removed, [], 'la copia vieja queda: producción comparte el navegador y la usa');
  assert.ok(x.store['accounts:lastFile'], 'sigue ahí');
  assert.doesNotMatch(x.host.innerHTML, /Tenés cambios sin guardar/);
  assert.ok(x.toasts.includes('success: Guardé mis-cuentas-v2.enc con el cifrado nuevo.'));
  x.ev('click', x.btn({ 'data-vk': 'lock' }));
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  assert.match(x.host.innerHTML, /Último archivo abierto en este navegador: <b>mis-cuentas-v2\.enc<\/b>/, 'la próxima vez abre la copia nueva');
}, { timeout: 30000 });

test('con cambios sin guardar no se cierra a los 5 minutos ni al salir de Cuentas; a los 15 sí; el navegador avisa', async () => {
  const x = await boot();
  await openWith(x, await x.sb.AccVault.encryptV2(DATA, PASS, { iter: 1000 }), PASS);
  const ev = { returnValue: undefined, preventDefault() { this.prevented = true; } };
  x.win.listeners.beforeunload.forEach((f) => f(ev));
  assert.equal(ev.prevented, undefined, 'sin cambios, no molesta');
  x.ev('click', x.btn({ 'data-vke-del': '0' }));
  x.ev('click', x.btn({ 'data-vke': 'del-ok' }));
  x.win.listeners.beforeunload.forEach((f) => f(ev));
  assert.equal(ev.prevented, true);
  assert.equal(ev.returnValue, '');
  x.sb.location.hash = '#/meta';
  x.win.listeners.hashchange.forEach((f) => f());
  assert.ok(x.sb.AccVaultView.isOpen(), 'al salir no lo cierro');
  assert.ok(x.toasts.includes('info: Dejé tu Llavero abierto: tenés cambios sin guardar.'));
  await x.advance(6 * 60000);
  assert.ok(x.sb.AccVaultView.isOpen(), 'a los 5 minutos tampoco');
  await x.advance(9 * 60000);
  assert.ok(!x.sb.AccVaultView.isOpen(), 'a los 15 sí');
  assert.ok(x.toasts.some((t) => /pasaron 15 minutos sin uso/.test(t)));
});

test('Crear Llavero nuevo: vacío, agrego una cuenta y lo guardo como llavero-v2.enc', async () => {
  const x = await boot();
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  assert.match(x.host.innerHTML, /data-vk="new">Crear Llavero nuevo/);
  x.ev('click', x.btn({ 'data-vk': 'new' }));
  assert.ok(x.sb.AccVaultView.isOpen());
  assert.match(x.host.innerHTML, /0 cuentas/);
  x.ev('click', x.btn({ 'data-vke': 'add' }));
  typeInto(x, { 'vkeF-name': 'Primera', 'vkeF-password': 'p1' });
  x.ev('click', x.btn({ 'data-vke': 'apply' }));
  await save(x, NEWPASS);
  assert.equal(x.D.anchors.at(-1).download, 'llavero-v2.enc');
  const back = J((await x.sb.AccVault.open(x.blobs[0], NEWPASS)).data);
  assert.equal(back.version, 2);
  assert.equal(back.accounts[0].login.password, 'p1');
}, { timeout: 30000 });
