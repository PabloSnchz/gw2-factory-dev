// Cuentas renovado (BL-070, CTA-4b): «Importar desde Excel» (window.AccVaultImport, dentro de js/acc-vault-edit.js).
// Corre con: node --test tests/*.test.cjs. Lee las columnas de la plantilla de siempre, arma el mismo formato de
// cuenta, abre el Llavero sin guardar y se guarda con el cifrado nuevo; no baja ni guarda nada en claro. Además,
// el panel anterior (y su asistente de 4 archivos) ya no se ofrece.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
// Vive dentro de js/acc-vault-edit.js (el manifiesto está en su tope de 30 módulos): se mide su sección.
const FULL = read('js/acc-vault-edit.js');
const SRC = FULL.slice(FULL.indexOf('// ===== Importar desde Excel'.replace('=====', '='.repeat(66))), FULL.indexOf('fin de Importar desde Excel'));
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
  const xl = { calls: [] }, D = fakeDom(), store = Object.assign({}, opts.store || {}), removed = [], timers = [], toasts = [], blobs = [], win = { listeners: {} };
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
    XLSX: opts.noXlsx ? undefined : fakeXlsx(xl, opts.rows),
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
  return { sb, D, host, store, removed, toasts, blobs, win, ev, btn, advance, xl };
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


// SheetJS de mentira: la hoja ya viene como filas; registra con qué opciones se la lee y qué plantilla se escribe.
function fakeXlsx(xl, rows) {
  return {
    read: (u8, o) => { xl.calls.push(['read', Object.prototype.toString.call(u8) === '[object Uint8Array]', o.type]); return { SheetNames: ['Cuentas'], Sheets: { Cuentas: { rows: rows || [] } } }; },
    utils: {
      sheet_to_json: (ws, o) => { xl.calls.push(['sheet_to_json', o.raw, o.defval]); return J(ws.rows); },
      aoa_to_sheet: (aoa) => ({ aoa }), book_new: () => ({ sheets: {} }),
      book_append_sheet: (wb, ws, name) => { wb.sheets[name] = ws; },
    },
    writeFile: (wb, name) => { xl.written = { name, sheets: J(wb.sheets) }; },
  };
}
const ROWS = [
  { id: 'mi_cuenta_1', nombre: 'Mi main', email: ' gato@ejemplo.com ', password: ' clave con espacios ', gmailPassword: 'GM-1', apiKey: 'KEY-MAIN-SECRETA', twitch_user: 'gatonegro', twitch_email: 'tw@ejemplo.com', twitch_password: 'TW-1', geforce_linked: 'TRUE', notas: 'Nota\nlarga', tags: 'main, farming,mi-tag' },
  { id: '', nombre: '', email: '', password: '', gmailPassword: '', apiKey: '', twitch_user: '', twitch_email: '', twitch_password: '', geforce_linked: '', notas: '', tags: '' },
  { Nombre: 'Alter', 'Twitch User': '', EMAIL: 'alt@ejemplo.com', Password: '1234', 'GeForce Linked': 'FALSE', Tags: 'alter' },
];
const file = (name, size) => ({ name, size: size || 100, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
async function importWith(x, f) {
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  x.ev('change', { id: 'vkXlsx', files: [f], value: 'C:\\fakepath\\x' });
  await wait(x, () => x.sb.AccVaultImport._pure.state().busy);
}

test('archivo: la sección de importación dentro de acc-vault-edit.js, nada en claro, sin red ni almacenamiento; manifiesto en su tope', () => {
  assert.ok(SRC.length > 2000 && SRC.length < FULL.length, 'la sección existe');
  assert.ok(Buffer.byteLength(FULL) <= 40 * 1024, Buffer.byteLength(FULL) + ' bytes');
  assert.match(FULL, /Versión: 1\.1\.0/);
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.match(code, /function importFile\(/);
  assert.doesNotMatch(code, /localStorage|sessionStorage|Storage\.|fetch\(|Blob|createObjectURL|JSON\.stringify|CryptoJS/, 'no guarda, no baja ni manda nada');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.indexOf('js/acc-vault-edit.js') >= 0 && man.indexOf('js/acc-vault-edit.js') < man.indexOf('js/acc-view.js'));
  assert.ok(!man.includes('js/acc-vault-import.js') && !fs.existsSync(path.join(ROOT, 'js', 'acc-vault-import.js')), 'no hay un archivo aparte');
  assert.ok(man.length <= 30, 'js/boot.js carga hasta 30 módulos');
  assert.match(read('index.html'), /xlsx-0\.20\.2\/package\/dist\/xlsx\.full\.min\.js/, 'SheetJS lo carga index.html');
});

test('filas: las columnas de la plantilla de siempre dan el mismo formato de cuenta; encabezados flexibles; filas vacías fuera', () => {
  const sb = { console: { info() {} } }; sb.window = sb; vm.createContext(sb); vm.runInContext(FULL, sb);
  const P = sb.AccVaultImport._pure;
  assert.equal(sb.AccVaultImport.version, sb.AccVaultEdit.version);
  assert.deepEqual(J(P.COLUMNS), ['id', 'nombre', 'email', 'password', 'gmailPassword', 'apiKey', 'twitch_user', 'twitch_email', 'twitch_password', 'geforce_linked', 'notas', 'tags']);
  assert.equal(P.EXAMPLE.length, P.COLUMNS.length);
  assert.deepEqual(J(P.EXAMPLE.filter((x, i) => /password|apiKey/i.test(P.COLUMNS[i]))), ['', '', '', ''], 'la plantilla no trae contraseñas ni Key');
  const d = J(P.rowsToData(ROWS, '2026-10-26'));
  assert.equal(d.version, 2); assert.equal(d.lastUpdated, '2026-10-26');
  assert.equal(d.accounts.length, 2, 'la fila vacía no cuenta');
  assert.deepEqual(d.accounts[0], { id: 'mi_cuenta_1', name: 'Mi main', login: { email: 'gato@ejemplo.com', password: ' clave con espacios ', gmailPassword: 'GM-1' },
    services: { twitch: { linked: true, username: 'gatonegro', email: 'tw@ejemplo.com', password: 'TW-1' }, geforceNow: { linked: true } },
    apiKey: { value: 'KEY-MAIN-SECRETA' }, notes: 'Nota\nlarga', tags: ['main', 'farming', 'mi-tag'] });
  assert.deepEqual(d.accounts[1], { id: 'cuenta_3', name: 'Alter', login: { email: 'alt@ejemplo.com', password: '1234', gmailPassword: '' },
    services: { twitch: { linked: false, username: null, email: null, password: null }, geforceNow: { linked: false } },
    apiKey: null, notes: '', tags: ['alter'] });
  const n = J(P.rowToAccount({ email: 'solo@mail.com', twitch_password: 'tp' }, 4));
  assert.equal(n.name, 'solo@mail.com', 'sin nombre, el email');
  assert.equal(n.services.twitch.linked, true, 'con cualquier dato de Twitch, vinculada');
  ['TRUE', 'true', 'Verdadero', 'sí', 'si', '1', 'x'].forEach((s) => assert.equal(P.yes(s), true, s));
  ['FALSE', '', '0', 'no'].forEach((s) => assert.equal(P.yes(s), false, s));
  assert.equal(P.norm(' Twitch-User '), 'twitch_user');
  assert.equal(P.MAX_BYTES, 5 * 1024 * 1024);
});

test('importar: el Excel abre el Llavero sin guardar, avisa, y se guarda con el cifrado nuevo; nada en claro en ningún lado', async () => {
  const x = await boot({ rows: ROWS });
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  let h = x.host.innerHTML;
  assert.match(h, /<input type="file" id="vkXlsx" accept="\.xlsx,\.xls,\.csv" class="vk-file-in">Importar desde Excel/);
  assert.match(h, /data-vk="tpl">Descargar plantilla/);
  assert.match(h, /No se baja nada en claro/);
  const ch = { id: 'vkXlsx', files: [file('mis-cuentas.xlsx')], value: 'C:\\fakepath\\x' };
  x.ev('change', ch);
  await wait(x, () => x.sb.AccVaultImport._pure.state().busy);
  assert.equal(ch.value, '', 'el elegido se limpia: se puede volver a importar el mismo');
  assert.deepEqual(x.xl.calls, [['read', true, 'array'], ['sheet_to_json', false, '']], 'lee como texto, con las vacías en blanco');
  assert.ok(x.sb.AccVaultView.isOpen());
  assert.ok(x.sb.AccVaultView.isDirty(), 'queda sin guardar');
  h = x.host.innerHTML;
  assert.match(h, /Llavero abierto · <b>mis-cuentas<\/b> · 2 cuentas/);
  assert.match(h, /Esto vino de tu Excel y todavía no está guardado/);
  assert.match(h, /Tenés cambios sin guardar/);
  assert.ok(!h.includes('clave con espacios') && !h.includes('KEY-MAIN-SECRETA'), 'enmascarado como siempre');
  assert.ok(x.toasts.some((t) => /^success: Importé 2 cuentas\. .*borrá el Excel/.test(t)));
  assert.deepEqual(Object.keys(x.store).filter((k) => !/^gn:accounts:(cards|achmeta)$/.test(k)), [], 'no guardó nada del Excel en el navegador');
  assert.ok(!JSON.stringify(x.store).includes('clave con espacios'));
  assert.equal(x.blobs.length, 0, 'no bajó nada');
  x.ev('click', x.btn({ 'data-vke': 'save' }));
  x.D.over = { vkeP1: { id: 'vkeP1', value: NEWPASS }, vkeP2: { id: 'vkeP2', value: NEWPASS } };
  x.ev('click', x.btn({ 'data-vke': 'save-go' }));
  await wait(x, () => x.sb.AccVaultEdit._pure.state().busy);
  x.D.over = null;
  assert.equal(x.D.anchors.at(-1).download, 'mis-cuentas-v2.enc');
  const back = J((await x.sb.AccVault.open(x.blobs[0], NEWPASS)).data);
  assert.equal(back.accounts[0].login.password, ' clave con espacios ');
  assert.equal(back.accounts.length, 2);
  assert.ok(!x.blobs[0].includes('gato@'), 'cifrado');
  assert.doesNotMatch(x.host.innerHTML, /Esto vino de tu Excel/, 'ya guardado');
}, { timeout: 30000 });

test('importar: Excel vacío o enorme no abre nada; sin SheetJS lo dice; la plantilla baja con las columnas de siempre', async () => {
  const x = await boot({ rows: [ROWS[1]] });
  await importWith(x, file('vacio.xlsx'));
  assert.ok(!x.sb.AccVaultView.isOpen());
  assert.ok(x.toasts.includes('error: No encontré cuentas en ese Excel. ¿Usaste la plantilla?'));
  await importWith(x, file('enorme.xlsx', 6 * 1024 * 1024));
  assert.ok(x.toasts.includes('error: Ese archivo es muy grande para ser tu planilla de cuentas.'));
  assert.equal(x.xl.calls.filter((c) => c[0] === 'read').length, 1, 'el enorme ni se lee');
  x.ev('click', x.btn({ 'data-vk': 'tpl' }));
  assert.equal(x.xl.written.name, 'plantilla_cuentas.xlsx');
  assert.deepEqual(x.xl.written.sheets.Cuentas.aoa[0], J(x.sb.AccVaultImport._pure.COLUMNS));
  const y = await boot({ noXlsx: true });
  y.ev('click', y.btn({ 'data-cv-tab': 'vault' }));
  assert.match(y.host.innerHTML, /id="vkXlsx" accept="[^"]*" class="vk-file-in" disabled>/);
  assert.match(y.host.innerHTML, /No pude cargar el lector de Excel/);
  y.ev('click', y.btn({ 'data-vk': 'tpl' }));
  assert.ok(y.toasts.includes('error: No pude armar la plantilla. Recargá la página (Ctrl+F5).'));
});

test('el panel anterior ya no se ofrece: ni cerrado ni abierto, y su cuerpo queda escondido', async () => {
  const x = await boot({ rows: ROWS });
  x.ev('click', x.btn({ 'data-cv-tab': 'vault' }));
  assert.doesNotMatch(x.host.innerHTML, /panel anterior|asistente/i);
  assert.ok(x.D.panel.classList.contains('cv-mine'), 'el cuerpo viejo, escondido');
  await importWith(x, file('c.xlsx'));
  assert.doesNotMatch(x.host.innerHTML, /panel anterior|asistente/i);
  assert.ok(x.D.panel.classList.contains('cv-mine'));
  assert.doesNotMatch(read('js/acc-vault-view.js'), /legacyHTML|data-vk="legacy"/);
});
