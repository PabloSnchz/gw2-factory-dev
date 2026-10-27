// BL-059 SHV-4b: «Lo que recuerdo de vos» (js/shv-recall.js). DOM, ventana, memoria y globo falsos.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/shv-recall.js');

// ------------------------------------------------------------------ DOM mínimo
class El {
  constructor(doc, tag) { this.ownerDocument = doc; this.tagName = String(tag).toUpperCase(); this.children = []; this.attrs = {}; this.parentNode = null; this.ls = {}; this.style = {}; this.hidden = false; this.textContent = ''; this.clicks = 0; }
  get id() { return this.attrs.id || ''; } set id(v) { this.attrs.id = String(v); }
  get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = String(v); }
  get type() { return this.attrs.type || ''; } set type(v) { this.attrs.type = String(v); }
  get nextSibling() { const p = this.parentNode; if (!p) return null; const i = p.children.indexOf(this); return p.children[i + 1] || null; }
  setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; } removeAttribute(k) { delete this.attrs[k]; }
  appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref) { if (c.parentNode) c.parentNode.removeChild(c); const i = this.children.indexOf(ref); c.parentNode = this; this.children.splice(i < 0 ? this.children.length : i, 0, c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
  all() { const out = []; const walk = (n) => n.children.forEach((c) => { out.push(c); walk(c); }); walk(this); return out; }
  matches(sel) { const m = sel.match(/^([a-z]*)((?:[.#][\w-]+)*)$/i); if (!m) throw new Error('selector ' + sel); if (m[1] && this.tagName !== m[1].toUpperCase()) return false; for (const p of m[2].match(/[.#][\w-]+/g) || []) { if (p[0] === '.' && !this.className.split(/\s+/).includes(p.slice(1))) return false; if (p[0] === '#' && this.id !== p.slice(1)) return false; } return true; }
  querySelector(sel) { return this.all().find((n) => n.matches(sel)) || null; }
  querySelectorAll(sel) { return this.all().filter((n) => n.matches(sel)); }
  addEventListener(t, f) { (this.ls[t] = this.ls[t] || []).push(f); }
  dispatchEvent(e) { e.target = e.target || this; (this.ls[e.type] || []).forEach((f) => f(e)); return true; }
  click() { this.clicks++; this.dispatchEvent({ type: 'click' }); }
}
class Doc extends El {
  constructor() { super(null, '#document'); this.ownerDocument = this; this.head = this.appendChild(new El(this, 'head')); this.body = this.appendChild(new El(this, 'body')); this.readyState = 'complete'; }
  createElement(t) { return new El(this, t); }
  getElementById(id) { return this.all().find((n) => n.id === id) || null; }
}
function fakeLS(init) {
  const m = new Map(Object.entries(init || {}));
  return { get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m };
}
const DAY = 864e5, T0 = new Date(2026, 9, 20, 12).getTime();

function load(opts) {
  opts = opts || {};
  const doc = new Doc();
  const menu = doc.body.appendChild(doc.createElement('ul'));
  menu.id = 'gnTbSet';
  for (const id of ['otro', 'shvQuietBtn', 'ultimo']) { const li = menu.appendChild(doc.createElement('li')); li.appendChild(doc.createElement('button')).id = id; }
  const calls = { dialogs: [], toasts: [], urls: [], revoked: [] };
  const answers = (opts.answers || []).slice();
  const GNUI = {
    dialog(o) {
      calls.dialogs.push(o);
      const w = doc.body.appendChild(doc.createElement('div')); w.className = 'gn-dlg';
      const b = w.appendChild(doc.createElement('div')); b.className = 'gn-dlg__b';
      const a = answers.length ? answers.shift() : 'cancel';
      return Promise.resolve().then(() => { doc.body.removeChild(w); calls.lastBody = b; return { action: a, value: null }; });
    },
    toast(k, t) { calls.toasts.push([k, t]); }
  };
  const mem = opts.mem === null ? null : Object.assign({
    _paused: false, _forgot: 0,
    stats() { return { accounts: 27, snapshots: 54, chars: 18 * 1024, cap: 64 * 1024, paused: this._paused, first: T0, last: T0 + DAY, days: 2 }; },
    paused(v) { if (typeof v === 'boolean') this._paused = v; return this._paused; },
    forget() { this._forgot++; return { ok: true, snapshots: 54 }; },
    exportData() { return { app: 'boveda-del-gato-negro', kind: 'shv-memory', v: 1, accounts: { a1b2c3d4: [{ date: '2026-10-20', values: { 1: 100 } }], ffff0000: [{}, {}] } }; }
  }, opts.mem || {});
  const bub = Object.assign({ _q: false, _seen: 12, _fs: 0, quiet() { return this._q; }, seenCount() { return this._seen; }, forgetSeen() { this._fs++; const n = this._seen; this._seen = 0; return { ok: true, seen: n }; } }, opts.bub || {});
  class FakeBlob { constructor(parts, o) { this.text = parts.join(''); this.type = o.type; } }
  const window = {
    console: { info() {} }, document: doc, localStorage: fakeLS(opts.ls), GNUI, ShvMemory: mem, ShvBubble: bub,
    Shiruvana: { AVATAR: 'assets/shiruvana.png' }, Blob: FakeBlob,
    URL: { createObjectURL: (b) => { calls.urls.push(b); return 'blob:1'; }, revokeObjectURL: (u) => calls.revoked.push(u) },
    navigator: opts.nav, setTimeout: (f) => setTimeout(f, 0) // el tiempo límite de estimate llega después de las promesas
  };
  vm.runInNewContext(SRC, { window, globalThis: {}, Date, Math, JSON, Object, String, Array, Promise, Number, RegExp });
  return { window, doc, menu, calls, R: window.ShvRecall, mem, bub };
}

test('el ítem va en Ajustes, al lado de «Silenciar a Shiruvana», una sola vez y manejable con el teclado', () => {
  const t = load();
  const b = t.doc.getElementById('shvRecallBtn');
  assert.ok(b);
  assert.equal(b.getAttribute('role'), 'menuitem');
  assert.equal(b.parentNode.getAttribute('role'), 'none');
  assert.equal(b.querySelector('span').textContent, 'Lo que recuerdo de vos');
  const ids = t.menu.children.map((li) => li.children[0].id);
  assert.deepEqual(ids, ['otro', 'shvQuietBtn', 'shvRecallBtn', 'ultimo']);
  assert.equal(t.R.wire(), true);
  assert.equal(t.doc.all().filter((n) => n.id === 'shvRecallBtn').length, 1);
  assert.ok(t.doc.getElementById('shv-recall-css'));
});

test('la ventana dice qué guardo, cuánto ocupa, el estado y el medidor; foco en «Cerrar»', async () => {
  const ls = { 'gn:shv:wallet': 'x'.repeat(5000), 'gn:shv:seen': 'y'.repeat(100), 'gw2_keys': 'z'.repeat(1_000_000) };
  const t = load({ ls, nav: { storage: { estimate: async () => ({ usageDetails: { indexedDB: 3 * 1024 * 1024 } }) } } });
  assert.equal(await t.R.open(), 'cancel');
  const d = t.calls.dialogs[0];
  assert.equal(d.title, 'Lo que recuerdo de vos');
  assert.equal(d.focus, 'cancel');
  assert.deepEqual([...d.actions.map((a) => a.label)], ['Descargar mi memoria', 'Dejar de recordar', 'Borrar todo', 'Cerrar']);
  assert.equal(d.actions[2].kind, 'danger');
  assert.equal(d.text[0], 'Tu Cartera: una foto por día de 27 cuentas, del 20/10 al 21/10 (2 días). Ocupa 18 KB de mis 64 KB.');
  assert.equal(d.text[1], 'Mensajes que ya viste: 12, guardados como huellas de 8 caracteres (nunca el texto).');
  assert.equal(d.text[2], 'Aparezco en globo: sí. Recuerdo cosas nuevas: sí.');
  assert.match(d.text[3], /^Este navegador \(lo comparten producción y DEV\): 982 KB de ~5,0 M \(19 %\)\. Lo mío: 5,0 KB \(0,1 %\)\. Aparte, las cachés grandes de la API \(IndexedDB\) ocupan 3,0 MB\.$/);
  assert.ok(!d.text.join(' ').includes('zzz'), 'nunca muestro valores');
  const bar = t.calls.lastBody.querySelector('.shv-rc-bar');
  assert.ok(bar, 'la barra del medidor');
  assert.equal(bar.getAttribute('aria-hidden'), 'true');
  assert.equal(bar.children[0].style.width, '19%');
  assert.equal(bar.hasAttribute('data-level'), false);
});

test('en pausa y silenciada lo digo; sin fotos lo digo; sin estimate no hablo de IndexedDB', async () => {
  const t = load({ bub: { _q: true }, mem: { stats() { return { accounts: 0, snapshots: 0, chars: 0, cap: 65536, paused: true, first: null, last: null, days: 0 }; } } });
  await t.R.open();
  const d = t.calls.dialogs[0];
  assert.equal(d.text[0], 'Tu Cartera: todavía no guardé ninguna foto.');
  assert.match(d.text[2], /^Aparezco en globo: no, me silenciaste .* Recuerdo cosas nuevas: no, me pediste que deje de recordar/);
  assert.equal(d.actions[1].label, 'Volver a recordar');
  assert.ok(!/IndexedDB/.test(d.text[3]));
});

test('más del 85 %: la barra se marca alta; si estimate no contesta, abro igual', async () => {
  const t = load({ ls: { big: 'z'.repeat(4_600_000) }, nav: { storage: { estimate: () => new Promise(() => {}) } } });
  await t.R.open();
  assert.ok(!/IndexedDB/.test(t.calls.dialogs[0].text[3]));
  assert.equal(t.calls.lastBody.querySelector('.shv-rc-bar').getAttribute('data-level'), 'alto');
});

test('«Descargar mi memoria» baja un JSON sin Keys y vuelve a la ventana con el foco en el mismo botón', async () => {
  const t = load({ answers: ['dl', 'cancel'] });
  await t.R.open();
  assert.equal(t.calls.urls.length, 1);
  const data = JSON.parse(t.calls.urls[0].text);
  assert.equal(data.kind, 'shv-memory');
  assert.equal(t.calls.urls[0].type, 'application/json');
  await new Promise((r) => setTimeout(r, 5));
  assert.deepEqual([...t.calls.revoked], ['blob:1']);
  const a = t.doc.all().find((n) => n.tagName === 'A');
  assert.equal(a, undefined, 'el enlace temporal se va');
  assert.deepEqual(t.calls.toasts[0], ['success', 'Listo: te bajé 3 fotos de tu Cartera (sin ninguna Key).']);
  assert.equal(t.calls.dialogs.length, 2);
  assert.equal(t.calls.dialogs[1].focus, 'dl');
});

test('sin fotos no descargo nada', () => {
  const t = load({ mem: { exportData: () => ({ accounts: {} }) } });
  assert.equal(t.R.download(), false);
  assert.equal(t.calls.urls.length, 0);
  assert.equal(t.calls.toasts[0][0], 'info');
});

test('«Dejar de recordar» pausa y el botón pasa a «Volver a recordar»', async () => {
  const t = load({ answers: ['pause', 'pause', 'cancel'] });
  await t.R.open();
  assert.equal(t.calls.dialogs[1].actions[1].label, 'Volver a recordar');
  assert.equal(t.calls.dialogs[1].focus, 'pause');
  assert.equal(t.calls.dialogs[2].actions[1].label, 'Dejar de recordar');
  assert.equal(t.mem._paused, false);
  assert.match(t.calls.toasts[0][1], /^Listo: dejo de recordar/);
  assert.match(t.calls.toasts[1][1], /^Listo: vuelvo a recordar/);
});

test('«Borrar todo» pregunta con el detalle y el foco en «Cancelar»; cancelar no borra nada', async () => {
  const t = load({ answers: ['forget', 'cancel', 'cancel'] });
  await t.R.open();
  const q = t.calls.dialogs[1];
  assert.equal(q.tone, 'danger');
  assert.equal(q.role, 'alertdialog');
  assert.equal(q.focus, 'cancel');
  assert.deepEqual([...q.actions.map((a) => a.id)], ['cancel', 'dl', 'ok']);
  assert.equal(q.text[0], 'Borro 54 fotos de la Cartera (27 cuentas, del 20/10 al 21/10) y 12 mensajes que ya viste: te voy a volver a contar lo que ya te conté.');
  assert.match(q.text[1], /No toco «Silenciar» ni «Dejar de recordar»/);
  assert.match(q.text[2], /producción y DEV/);
  assert.equal(t.mem._forgot, 0);
  assert.equal(t.bub._fs, 0);
  assert.equal(t.calls.dialogs.length, 3, 'vuelve a la ventana');
});

test('«Borrar todo» borra fotos y vistos (no la pausa ni el silencio); «Descargar y borrar» baja primero', async () => {
  const t = load({ answers: ['forget', 'ok', 'cancel'] });
  t.mem._paused = true;
  await t.R.open();
  assert.equal(t.mem._forgot, 1);
  assert.equal(t.bub._fs, 1);
  assert.equal(t.mem._paused, true, 'la pausa queda');
  assert.deepEqual(t.calls.toasts.at(-1), ['success', 'Listo: borré 54 fotos y 12 mensajes vistos.']);
  assert.equal(t.calls.urls.length, 0);
  const t2 = load({ answers: ['forget', 'dl', 'cancel'] });
  await t2.R.open();
  assert.equal(t2.calls.urls.length, 1, 'bajó antes de borrar');
  assert.equal(t2.mem._forgot, 1);
});

test('si no pude borrar, lo digo', async () => {
  const t = load({ answers: ['ok'], mem: { forget: () => ({ ok: false, snapshots: 3 }) } });
  assert.equal(await t.R.forgetAll(), false);
  assert.equal(t.calls.toasts.at(-1)[0], 'error');
});

test('sin mi memoria cargada lo digo, sin romper', async () => {
  const t = load({ mem: null });
  await t.R.open();
  assert.match(t.calls.dialogs[0].text[0], /no cargó/);
  assert.equal(t.R.download(), false);
});

test('el medidor solo cuenta: clave + valor, y separa lo mío (gn:shv:*)', () => {
  const t = load();
  const L = fakeLS({ 'gn:shv:wallet': 'abc', 'gn:shv:x': '', otra: '12345' });
  const u = t.R._pure.usage(L);
  assert.deepEqual(JSON.parse(JSON.stringify(u)), { total: 33, mine: 24, keys: 3, quota: 5242880, pct: 0, minePct: 0 });
  assert.equal(t.R._pure.size(820), '820 caracteres');
  assert.equal(t.R._pure.size(18 * 1024), '18 KB');
  assert.equal(t.R._pure.size(5 * 1024 + 300), '5,3 KB');
  assert.equal(t.R._pure.size(3.1 * 1024 * 1024), '3,1 M');
  assert.equal(t.R._pure.fileName(T0), 'shiruvana-memoria-2026-10-20.json');
});

test('reglas de la casa y orden de carga', () => {
  assert.match(SRC, /Versión: 1\.0\.0/);
  assert.ok(!/innerHTML|insertAdjacentHTML/.test(SRC), 'texto, nunca HTML');
  assert.ok(!/fetch\(|GW2Api/.test(SRC), 'no pido nada a la API');
  assert.ok(!/setItem|removeItem/.test(SRC), 'no escribo claves por mi cuenta');
  const css = SRC.match(/var CSS = \[([\s\S]*?)\]\.join/)[1];
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(css.replace(/'#' \+ BTN_ID/g, '')), 'colores del theme, sin hex');
  assert.ok(Buffer.byteLength(SRC) < 20 * 1024, 'menos de 20 KB');
  const src = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  if (src.includes('js/shv-recall.js')) {
    assert.ok(src.indexOf('js/shv-recall.js') > src.indexOf('js/shv-memory.js'));
    assert.ok(src.indexOf('js/shv-recall.js') > src.indexOf('js/shv-bubble.js'));
  }
});
