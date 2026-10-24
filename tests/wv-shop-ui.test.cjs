// Cámara del Brujo (BL-064, CAM-3): la Tienda para planificar.
// js/wv-shop-ui.js 2.0.0 mantiene la API que usa router.js (render, refresh, ensureShopToolbar…)
// y le pasa el contexto a js/wv-shop-manage.js para el menú «Gestionar».
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'wv-shop-ui.js'), 'utf8');
const MANAGE = fs.readFileSync(path.join(ROOT, 'js', 'wv-shop-manage.js'), 'utf8');

// ---------------------------------------------------------------- DOM mínimo
function makeDom() {
  const reg = {};
  const focus = [];
  function node(id, attrs) {
    const n = { id, attrs: Object.assign({}, attrs || {}), listeners: {}, _h: '', hidden: false, style: {}, isConnected: true, parentNode: null };
    n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
    n.hasAttribute = (k) => k in n.attrs;
    n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
    n.addEventListener = (t, f, cap) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
    n.matches = (sel) => sel.split(',').some((s) => {
      s = s.trim();
      if (s === '.wvs-menu') return n.cls === 'wvs-menu';
      const m = /^\[([\w-]+)(?:="([^"]*)")?\]$/.exec(s);
      return !!m && (m[2] === undefined ? m[1] in n.attrs : n.attrs[m[1]] === m[2]);
    });
    n.focus = () => focus.push(n.sel || n.id || n.attrs);
    n.prepend = (c) => { reg[c.id] = c; c.parentElement = n; };
    n.appendChild = (c) => { reg[c.id] = c; c.parentElement = n; };
    n.insertAdjacentElement = (_, c) => { reg[c.id] = c; c.parentElement = n.parentElement; };
    n.querySelector = (sel) => {
      const m = /^#([\w-]+)$/.exec(sel);
      if (m && n._h.indexOf('id="' + m[1] + '"') >= 0) return byId(m[1]);
      if (sel === '.wvs-tool' && n._h.indexOf('class="wvs-tool"') >= 0) return {};
      return null;
    };
    n.querySelectorAll = () => [];
    Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
    return n;
  }
  function byId(id) {
    if (reg[id]) return reg[id];
    for (const k of Object.keys(reg)) {
      const h = reg[k]._h;
      const m = new RegExp('<[a-z]+[^>]* id="' + id + '"[^>]*>').exec(h);
      if (m) {
        const n = node(id);
        n.hidden = / hidden[ >]/.test(m[0]);
        reg[id] = n;
        return n;
      }
    }
    return null;
  }
  // Un botón del listado, leído del HTML real (para saber si está deshabilitado).
  function listButton(sel) {
    const area = reg.wvShopList;
    if (!area) return null;
    const attrs = [...sel.matchAll(/\[([\w-]+)="([^"]*)"\]/g)].map((m) => m[1] + '="' + m[2] + '"');
    const enabledOnly = sel.indexOf(':not([disabled])') >= 0;
    const tag = (area._h.match(/<button[^>]*>/g) || []).find((t) => attrs.every((a) => t.indexOf(a) >= 0) && !(enabledOnly && / disabled/.test(t)));
    if (!tag) return null;
    const b = node('');
    b.sel = sel;
    b.disabled = / disabled/.test(tag);
    b.attrs['data-id'] = (/data-id="([^"]*)"/.exec(tag) || [])[1];
    return b;
  }
  const doc = {
    readyState: 'complete',
    head: { appendChild(c) { reg[c.id] = c; } },
    getElementById: byId,
    createElement: () => node(''),
    listeners: {},
    addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
    querySelector(sel) {
      if (sel === '[data-wvs-manage]') return reg.__manageBtn || (reg.__manageBtn = node('', { 'data-wvs-manage': '' }));
      if (sel.indexOf('#wvShopList ') === 0) return listButton(sel.slice(12));
      return null;
    }
  };
  return { reg, node, doc, focus, byId };
}

const ROWS = [
  { id: 1, item_id: 11, cost: 600, purchased: 1, purchase_limit: 3, type: 'Featured' },
  { id: 2, item_id: 12, cost: 200, purchased: 2, purchase_limit: 5, type: 'Normal', item_count: 5 },
  { id: 3, item_id: 13, cost: 350, purchased: 2, purchase_limit: 2, type: 'Normal' },
  { id: 4, item_id: 14, cost: 50, purchased: 4, purchase_limit: null, type: 'Legacy' }
];
const ITEMS = new Map([
  [11, { name: 'Cofre de Mística', rarity: 'Legendary', icon: 'a.png' }],
  [12, { name: 'Trébol místico', rarity: 'Ascended', icon: 'b.png' }],
  [13, { name: 'Caja de infusiones', rarity: 'Exotic', icon: 'c.png' }],
  [14, { name: 'Antiguo', rarity: 'Basic', icon: 'd.png' }]
]);

function load(opts = {}) {
  const D = makeDom();
  const tab = D.node('wvTabShop');
  D.reg.wvTabShop = tab;
  const key = D.node('keySelectGlobal'); key.value = 'AAAA-1111-ZZZZ'; D.reg.keySelectGlobal = key;
  const calls = [];
  const saved = { marks: Object.assign({}, opts.savedMarks || {}), pinned: Object.assign({}, opts.savedPinned || {}) };
  const ok = (v) => Promise.resolve(v);
  const store = {
    getMarks: () => Object.assign({}, saved.marks),
    getPinned: () => Object.assign({}, saved.pinned),
    setMarks: (y, s, fp, p) => { calls.push(['setMarks', fp, p]); Object.assign(saved.marks, p); return ok(); },
    setPinned: (y, s, fp, p) => { calls.push(['setPinned', fp, p]); return opts.pinFails ? Promise.reject(new Error('x')) : ok(); },
    delPinned: (y, s, fp, ids) => { calls.push(['delPinned', fp, ids]); return ok(); }
  };
  const st = Object.assign({
    merged: ROWS.map((r) => Object.assign({}, r)), itemsById: ITEMS, aa: 2340, aaIconUrl: 'aa.png',
    marks: { 1: 1 }, pinned: { 1: true, 2: true }, view: 'cards', q: '', sort: 'name', legacyFilter: 'show',
    season: { year: 26, seq: 1 }, lastToken: 'AAAA-1111-ZZZZ', lastSyncTs: 0
  }, opts.state || {});
  const winListeners = {};
  const win = {
    console: { info() {}, warn() {} }, setTimeout, Promise, Date, Math, JSON, Map, Object, Array, String, Number,
    document: D.doc,
    localStorage: { getItem: (k) => (k === 'gw2_keys' ? JSON.stringify([{ value: 'AAAA-1111-ZZZZ', label: 'Main' }, { value: 'BBBB-2222-YYYY', label: 'Alter' }, { value: 'AAAA-1111-ZZZZ', label: 'Repetida' }, { label: 'Sin key' }]) : null) },
    Storage: { STORAGE_KEYS: { WV_SHOP_VIEW: 'gn:wv:shop:view', WV_SHOP_LEGACY_FILTER: 'gn:wv:shop:legacy_filter' }, set: (k, v) => calls.push(['Storage.set', k, v]) },
    WV: { __getShopState: () => st },
    WVSeasonStore: store,
    GW2Api: { getWVShopMerged: (tk, o) => { calls.push(['getWVShopMerged', tk, o]); return ok({ rows: ROWS.slice(0, 2), itemsById: ITEMS, aa: 1000, aaIconUrl: null }); } },
    toast: (k, m) => calls.push(['toast', k, m]),
    confirm: () => true,
    addEventListener: (t, f) => { (winListeners[t] = winListeners[t] || []).push(f); }
  };
  win.window = win;
  const ctx = vm.createContext(win);
  vm.runInContext(SRC, ctx);
  if (opts.manage !== false) vm.runInContext(MANAGE, ctx);
  const U = win.WVShopUI;
  const P = {};
  Object.keys(U._pure).forEach((k) => {
    const v = U._pure[k];
    P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? JSON.parse(JSON.stringify(r)) : r; };
  });
  return { D, U, P, st, calls, saved, win, winListeners, store };
}
const tick = () => new Promise((r) => setTimeout(r, 5));
const J = (v) => JSON.parse(JSON.stringify(v));
const fire = (x, hostId, type, attrs, ev) => {
  const host = x.D.byId(hostId);
  const target = x.D.node('', attrs); target.parentNode = host;
  (host.listeners[type] || []).forEach((f) => f(Object.assign({ target, key: '' }, ev || {})));
};
const names = (h) => (h.match(/class="wvs-n"[^>]*>[^<]*/g) || []).map((s) => s.replace(/^.*>/, ''));

// ---------------------------------------------------------------- tests
test('versión 2.0.0 en index.html; wv-shop-manage.js 1.0.0 por el manifiesto', () => {
  assert.match(SRC, /\* Versión: 2\.0\.0 /);
  assert.match(MANAGE, /\* Versión: 1\.0\.0 /);
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(idx, /src="js\/wv-shop-ui\.js\?v=2\.0\.0"/);
  assert.doesNotMatch(idx, /wv-shop-manage\.js/);
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8'));
  assert.deepEqual(m.modules.filter((x) => x.src === 'js/wv-shop-manage.js'), [{ src: 'js/wv-shop-manage.js', v: '1.0.0' }]);
  for (const s of [SRC, MANAGE]) assert.ok(Buffer.byteLength(s) <= 40 * 1024, 'dentro de los 40 KB');
});

test('unidades: lo que vio la API, lo marcado (con tope) y lo que queda', () => {
  const { P } = load();
  assert.deepEqual(P.rowNumbers(ROWS[0], { 1: 1 }), { limit: 3, api: 1, marked: 1, max: 2, left: 1, apiFull: false, done: false });
  assert.equal(P.rowNumbers(ROWS[0], { 1: 9 }).marked, 2, 'la marca no pasa lo que queda por comprar');
  assert.deepEqual(P.rowNumbers(ROWS[2], {}), { limit: 2, api: 2, marked: 0, max: 0, left: 0, apiFull: true, done: true });
  assert.deepEqual(P.rowNumbers(ROWS[3], { 4: 3 }), { limit: null, api: 4, marked: 3, max: 999, left: null, apiFull: false, done: false });
});

test('línea de AA: disponible menos lo marcado, reservada para fijados, sobra o falta, gastada', () => {
  const { P } = load();
  const s = P.aaSummary(ROWS, 2340, { 1: true, 2: true }, { 1: 1 });
  assert.deepEqual(s, { aa: 2340, marked: 600, avail: 1740, reserved: 600 + 600, diff: 540, spent: 600 + 400 + 700 + 200 + 600 });
  const h = P.aaLineHTML(s, 'aa.png', '12:05');
  assert.match(h, /AA disponible <b>1\.740<\/b><\/span><span>Marcada sin registrar <b>−600<\/b><\/span><span>Reservada para fijados <b>1\.200<\/b><\/span><span>Sobran <b class="wvs-ok">540<\/b>/);
  assert.match(h, /Gastada esta temporada: 2\.500 · datos de la API de las 12:05/);
  const f = P.aaLineHTML(P.aaSummary(ROWS, 500, { 1: true }, {}), null, '');
  assert.match(f, /Faltan <b class="wvs-need">700<\/b>/);
  assert.doesNotMatch(f, /Marcada sin registrar/);
});

test('filtros: fijados primero, todos por nombre, «Me falta», Legado y búsqueda', () => {
  const { P } = load();
  const base = { itemsById: ITEMS, pinned: { 2: true }, marks: {}, sort: 'name' };
  const ids = (o) => P.filterRows(ROWS, Object.assign({}, base, o)).map((r) => r.id);
  assert.deepEqual(ids({ seg: 'pinned' }), [2, 4, 3, 1]);
  assert.deepEqual(ids({ seg: 'all' }), [4, 3, 1, 2]);
  assert.deepEqual(ids({ seg: 'need' }), [2, 1], 'sin lo completo ni lo ilimitado');
  assert.deepEqual(ids({ seg: 'need', marks: { 1: 2 } }), [2], 'lo marcado completo no falta');
  assert.deepEqual(ids({ seg: 'all', legacy: 'hide' }), [3, 1, 2]);
  assert.deepEqual(ids({ seg: 'all', q: 'trébol' }), [2]);
  assert.deepEqual(ids({ seg: 'all', q: '3' }), [3], 'por ID');
});

test('tarjeta: progreso por unidades, selector −/+ y Máx, fijar con texto', () => {
  const { P } = load();
  const h = P.cardHTML(ROWS[0], ITEMS.get(11), { marks: { 1: 1 }, pinned: { 1: true } });
  assert.match(h, /^<article class="wvs-it wvs-it--pinned" data-id="1">/);
  assert.match(h, /<span class="wvs-n" style="color:#974EFF" title="Cofre de Mística">Cofre de Mística<\/span>/);
  assert.match(h, /data-wvs-pin="1" aria-pressed="true" aria-label="Desfijar Cofre de Mística">★ Fijado<\/button>/);
  assert.match(h, /<span class="wvs-s">600 AA · Destacado<\/span>/);
  assert.match(h, /<span class="wvs-units" role="img" aria-label="Comprado 1, marcado 1 de 3"><i class="a"><\/i><i class="m"><\/i><i><\/i><\/span>/);
  assert.match(h, /<span class="wvs-cnt">1 \+ 1 \/ 3<\/span><span class="wvs-step" role="group" aria-label="Compras marcadas por vos: Cofre de Mística"><button type="button" data-wvs-step="-1" data-id="1" aria-label="Una menos">−<\/button><output aria-live="polite">1<\/output><button type="button" data-wvs-step="1" data-id="1" aria-label="Una más">\+<\/button><\/span><button type="button" class="wvs-max" data-wvs-max="1">Máx<\/button>/);
  assert.doesNotMatch(h, /wv-card|wvpd-manual-input|type="number"|📌|✅|⚠️/);
  const full = P.cardHTML(ROWS[2], ITEMS.get(13), { marks: {}, pinned: {} });
  assert.match(full, /wvs-it--full/);
  assert.match(full, /<span class="wvs-st wvs-st--ok">Completo 2 \/ 2<\/span>/);
  assert.doesNotMatch(full, /wvs-step/);
  const big = P.unitsHTML({ limit: 25, api: 5, marked: 5 });
  assert.match(big, /wvs-units--bar[^>]*><i class="a" style="width:20%"><\/i><i class="m" style="width:20%"><\/i>/);
  assert.equal(P.unitsHTML({ limit: null }), '<span class="wvs-unl">Sin límite</span>');
  const none = P.cardHTML(ROWS[1], ITEMS.get(12), { marks: { 2: 3 }, pinned: {} });
  assert.match(none, /data-wvs-step="-1" data-id="2" aria-label="Una menos">/);
  assert.match(none, /data-wvs-step="1" data-id="2" aria-label="Una más" disabled>/, 'sin lugar: + deshabilitado');
  assert.match(none, /data-wvs-max="2" disabled>/);
  const zero = P.cardHTML(ROWS[1], ITEMS.get(12), { marks: {}, pinned: {} });
  assert.match(zero, /data-wvs-step="-1" data-id="2" aria-label="Una menos" disabled>/, 'en 0: − deshabilitado');
  assert.match(zero, /data-wvs-step="1" data-id="2" aria-label="Una más">/);
});

test('render: barra nueva, AA, tarjetas ordenadas; la API de router.js sigue', async () => {
  const x = load();
  for (const k of ['render', 'refresh', 'setShopLoading', 'ensureShopToolbar', 'syncShopToggleLabel']) assert.equal(typeof x.U[k], 'function', k);
  x.U.render();
  const tb = x.D.reg.wvShopToolbarHost._h;
  assert.match(tb, /<input id="wvShopSearch" class="wvs-q" type="search"/);
  assert.match(tb, /data-wvs-seg="pinned" aria-pressed="true">Fijados primero<\/button><button type="button" data-wvs-seg="all" aria-pressed="false">Todos<\/button><button type="button" data-wvs-seg="need" aria-pressed="false">Me falta<\/button>/);
  assert.match(tb, /<button type="button" class="wvs-btn" data-wvs-manage aria-haspopup="menu" aria-expanded="false" aria-controls="wvShopMenu">Gestionar ▾<\/button><div id="wvShopMenu" class="wvs-dd" role="menu" aria-label="Gestionar la Tienda" hidden><\/div>/);
  assert.doesNotMatch(tb, /Limpiar fijados|Replicar fijados|Limpiar sincronizados|Refrescar/, 'las acciones sueltas salen de la barra');
  assert.match(x.D.reg.wvShopAA._h, /AA disponible <b>1\.740<\/b>/);
  assert.deepEqual(names(x.D.reg.wvShopList._h), ['Cofre de Mística', 'Trébol místico ×5', 'Antiguo', 'Caja de infusiones']);
  assert.ok(x.D.reg['wv-shop-ui-css'], 'inyecta su CSS');
  x.st.view = 'table';
  x.U.render();
  assert.match(x.D.reg.wvShopList._h, /^<div class="wvs-tw"><table class="wvs-tbl"><thead><tr><th scope="col">Ítem<\/th>/);
  assert.match(x.D.reg.wvShopList._h, /<td class="r">1 \+ 1 \/ 3<\/td><td class="r">1<\/td>/);
});

test('−/+ y Máx: guardan la marca de esta cuenta, con tope, y el foco queda en el botón', async () => {
  const x = load();
  x.U.render();
  fire(x, 'wvShopList', 'click', { 'data-wvs-step': '1', 'data-id': '1' });
  assert.equal(x.st.marks[1], 2);
  assert.deepEqual(J(x.calls.at(-1)), ['setMarks', 'AAAA…ZZZZ', { 1: 2 }]);
  assert.match(x.D.reg.wvShopAA._h, /Marcada sin registrar <b>−1\.200<\/b>/);
  assert.equal(x.D.focus.at(-1), '[data-id="1"]:not([disabled])', '+ quedó deshabilitado: el foco pasa a otro botón de la misma tarjeta');
  fire(x, 'wvShopList', 'click', { 'data-wvs-step': '-1', 'data-id': '1' });
  assert.equal(x.D.focus.at(-1), '[data-wvs-step="-1"][data-id="1"]', 'si sigue habilitado, el foco queda en el mismo botón');
  fire(x, 'wvShopList', 'click', { 'data-wvs-step': '1', 'data-id': '1' });
  fire(x, 'wvShopList', 'click', { 'data-wvs-step': '1', 'data-id': '1' });
  assert.equal(x.calls.filter((c) => c[0] === 'setMarks').length, 3, 'sin lugar no escribe');
  fire(x, 'wvShopList', 'click', { 'data-wvs-step': '-1', 'data-id': '1' });
  fire(x, 'wvShopList', 'click', { 'data-wvs-step': '-1', 'data-id': '1' });
  assert.equal(x.st.marks[1], 0);
  fire(x, 'wvShopList', 'click', { 'data-wvs-max': '2' });
  assert.deepEqual(J(x.calls.at(-1)), ['setMarks', 'AAAA…ZZZZ', { 2: 3 }]);
  const disabled = x.D.node('', { 'data-wvs-step': '1', 'data-id': '2' }); disabled.disabled = true;
  const n = x.calls.length;
  disabled.parentNode = x.D.reg.wvShopList;
  x.D.reg.wvShopList.listeners.click.forEach((f) => f({ target: disabled }));
  assert.equal(x.calls.length, n, 'un botón deshabilitado no hace nada');
});

test('fijar y desfijar: se guarda; si el almacén falla, vuelve atrás y avisa', async () => {
  let x = load();
  x.U.render();
  fire(x, 'wvShopList', 'click', { 'data-wvs-pin': '3' });
  assert.equal(x.st.pinned[3], true);
  assert.deepEqual(J(x.calls.at(-1)), ['setPinned', 'AAAA…ZZZZ', { 3: true }]);
  assert.equal(x.D.focus.at(-1), '[data-wvs-pin="3"]');
  fire(x, 'wvShopList', 'click', { 'data-wvs-pin': '1' });
  assert.equal(x.st.pinned[1], undefined);
  assert.deepEqual(J(x.calls.at(-1)), ['delPinned', 'AAAA…ZZZZ', ['1']]);
  x = load({ pinFails: true });
  x.U.render();
  fire(x, 'wvShopList', 'click', { 'data-wvs-pin': '3' });
  await tick();
  assert.equal(x.st.pinned[3], undefined);
  assert.deepEqual(x.calls.at(-1), ['toast', 'error', 'No se pudo fijar']);
});

test('barra: vista y Legado se guardan con Storage (hb98); segmentos y búsqueda filtran', () => {
  const x = load();
  x.U.render();
  const v = x.D.byId('wvShopToggleView'), lf = x.D.byId('wvLegacyFilter'), q = x.D.byId('wvShopSearch');
  v.listeners.click[0]();
  assert.equal(x.st.view, 'table');
  assert.deepEqual(x.calls.at(-1), ['Storage.set', 'gn:wv:shop:view', 'table']);
  lf.value = 'hide';
  lf.listeners.change[0]();
  assert.deepEqual(x.calls.at(-1), ['Storage.set', 'gn:wv:shop:legacy_filter', 'hide']);
  assert.doesNotMatch(x.D.reg.wvShopList._h, /Antiguo/);
  fire(x, 'wvShopToolbarHost', 'click', { 'data-wvs-seg': 'need' });
  assert.equal(x.st.shopSeg, 'need');
  x.st.view = 'cards'; x.U.render();
  assert.deepEqual(names(x.D.reg.wvShopList._h), ['Cofre de Mística', 'Trébol místico ×5']);
  q.value = '  COFRE ';
  q.listeners.input[0]();
  assert.deepEqual(names(x.D.reg.wvShopList._h), ['Cofre de Mística']);
  assert.match(SRC, /\n    if \(v\) v\.addEventListener\('click', function \(\) \{\n      st\.view = \(st\.view === 'cards'\) \? 'table' : 'cards';\n      try \{ Storage\.set\(Storage\.STORAGE_KEYS\.WV_SHOP_VIEW, st\.view\); \} catch \(_\) \{\}\n      WVShopUI\.render\(\);\n    \}\);/, 'la forma que lee hb98');
});

test('«Gestionar»: abre el menú con las 3 acciones, Escape lo cierra y cada acción recibe el contexto', async () => {
  const x = load();
  x.U.render();
  fire(x, 'wvShopToolbarHost', 'click', { 'data-wvs-manage': '' });
  const menu = x.D.byId('wvShopMenu');
  assert.equal(menu.hidden, false);
  assert.equal(x.D.reg.__manageBtn.attrs['aria-expanded'], 'true');
  assert.equal((menu._h.match(/role="menuitem"/g) || []).length, 3);
  assert.match(menu._h, /<hr><button type="button" role="menuitem" data-wvs-act="clear" class="wvs-danger">Quitar fijados de todas las cuentas…<small>Pide confirmación · se puede deshacer durante 10 s<\/small><\/button>/);
  fire(x, 'wvShopToolbarHost', 'keydown', {}, { key: 'Escape' });
  assert.equal(menu.hidden, true);
  assert.equal(x.D.reg.__manageBtn.attrs['aria-expanded'], 'false');
  fire(x, 'wvShopToolbarHost', 'click', { 'data-wvs-manage': '' });
  const inside = x.D.node(''); inside.cls = 'wvs-menu';
  const child = x.D.node(''); child.parentNode = inside;
  x.D.doc.listeners.click.forEach((f) => f({ target: child }));
  assert.equal(menu.hidden, false, 'un clic dentro del menú no lo cierra');
  x.D.doc.listeners.click.forEach((f) => f({ target: x.D.node('') }));
  assert.equal(menu.hidden, true, 'un clic afuera lo cierra');
  let got = null;
  x.win.WVShopManage.run = (id, ctx) => { got = { id, ctx }; };
  fire(x, 'wvShopToolbarHost', 'click', { 'data-wvs-manage': '' });
  fire(x, 'wvShopToolbarHost', 'click', { 'data-wvs-act': 'copy' });
  assert.equal(menu.hidden, true, 'elegir una acción cierra el menú');
  assert.equal(got.id, 'copy');
  assert.equal(got.ctx.fp, 'AAAA…ZZZZ');
  assert.deepEqual(JSON.parse(JSON.stringify(got.ctx.accounts)), [{ fp: 'AAAA…ZZZZ', label: 'Main' }, { fp: 'BBBB…YYYY', label: 'Alter' }]);
  assert.equal(got.ctx.state, x.st);
  assert.equal(got.ctx.undoHost, x.D.byId('wvShopUndo'));
  assert.equal(typeof got.ctx.reload, 'function');
});

test('si otro módulo cambia marcas o fijados, la Tienda se pone al día (y no redibuja de más)', async () => {
  const x = load({ savedMarks: { 1: 1 }, savedPinned: { 1: 1, 2: 1 } });
  x.U.render();
  const before = x.D.reg.wvShopList._h;
  x.D.reg.wvShopList._h = 'SIN CAMBIOS';
  x.winListeners['wv:season-store:mutate'][0]();
  await tick();
  assert.equal(x.D.reg.wvShopList._h, 'SIN CAMBIOS', 'lo guardado (1) y la sesión (true) son lo mismo');
  x.saved.marks[2] = 2;
  x.winListeners['wv:season-store:mutate'][0]();
  await tick();
  assert.equal(x.st.marks[2], 2);
  assert.notEqual(x.D.reg.wvShopList._h, 'SIN CAMBIOS');
  x.st.lastToken = 'OTRA-CUENTA';
  x.saved.marks[3] = 1;
  x.winListeners['wv:season-store:mutate'][0]();
  await tick();
  assert.equal(x.st.marks[3], undefined, 'si la Tienda en pantalla es de otra cuenta, no mezcla sus marcas');
  assert.ok(before.length > 0);
  assert.equal(x.P.norm({ a: true, b: 0, c: 2 }), x.P.norm({ c: '2', a: 1 }));
});

test('refresh: carga la Tienda de la cuenta, relee marcas y fijados; sin cuenta lo dice', async () => {
  const x = load({ savedMarks: { 2: 1 }, savedPinned: { 2: 1 } });
  await x.U.refresh(true);
  assert.deepEqual(J(x.calls[0]), ['getWVShopMerged', 'AAAA-1111-ZZZZ', { nocache: true }]);
  assert.equal(x.st.aa, 1000);
  assert.deepEqual(Object.assign({}, x.st.marks), { 2: 1 });
  assert.deepEqual(names(x.D.reg.wvShopList._h), ['Trébol místico ×5', 'Cofre de Mística']);
  x.D.reg.keySelectGlobal.value = '';
  await x.U.refresh(false);
  assert.equal(x.D.reg.wvTabShop._h, '<p class="wvs-empty">Elegí una cuenta para ver la Tienda.</p>');
});

test('reglas: escapa nombres, sin endpoints nuevos; la única lectura cruda es la tolerada de gw2_keys', () => {
  const { P } = load();
  const h = P.cardHTML({ id: 9, cost: 1, purchased: 0, purchase_limit: 1 }, { name: '<img src=x onerror=1>' }, { marks: {}, pinned: {} });
  assert.match(h, /&lt;img src=x onerror=1&gt;/);
  assert.doesNotMatch(SRC + MANAGE, /fetch\(|api\.guildwars2\.com|localStorage\.setItem|gn:account/);
  assert.deepEqual(SRC.match(/localStorage\.\w+\([^)]*\)/g), ["localStorage.getItem('gw2_keys')"]);
  assert.doesNotMatch(MANAGE, /localStorage/);
  assert.match(P.CSS, /@media \(max-width:900px\)\{[^\n]*\.wvs-seg\{display:flex;width:100%\}/);
  assert.match(P.CSS, /\.wvs-dd\{position:fixed;left:8px;right:8px;bottom:8px/, 'en el celular, «Gestionar» es una hoja inferior');
});
