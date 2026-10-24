// Cámara del Brujo (BL-064, CAM-5): Todas las cuentas → Compras fijadas.
// js/wv-purchase-detail.js 2.0.0 conserva la API que usan router.js y wv-view.js
// (show, hide, refresh, refreshOnlineStatus), carga las cuentas, marca con −/+,
// gestiona con «Deshacer» y pinta con js/wv-purchases-view.js.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SRC = read('js/wv-purchase-detail.js');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const VIEW = read('js/wv-purchases-view.js');
const MANAGE = read('js/wv-shop-manage.js');
const J = (v) => JSON.parse(JSON.stringify(v));
const flush = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r)); };

const row = (id, item, cost, limit, purchased) => ({ id, item_id: item, cost, purchase_limit: limit, purchased, item_count: 1 });
const SHOPS = {
  'K1-aaaa-1111': { aa: 500, rows: [row(10, 100, 100, 3, 1), row(11, 101, 30, 5, 2)] },
  'K2-bbbb-2222': { aa: 100, rows: [row(10, 100, 100, 3, 0), row(11, 101, 30, 5, 0)] }
};
const ITEMS = new Map([[100, { id: 100, name: 'Cofre de Mística', icon: 'cofre.png' }]]);
const FP1 = 'K1-a…1111', FP2 = 'K2-b…2222';

function el(id, reg) {
  const e = { id, attrs: {}, style: {}, listeners: {}, _h: '', hidden: false, sets: [] };
  e.setAttribute = (k, v) => { e.attrs[k] = String(v); };
  e.removeAttribute = (k) => { delete e.attrs[k]; };
  e.hasAttribute = (k) => k in e.attrs;
  e.getAttribute = (k) => (k in e.attrs ? e.attrs[k] : null);
  e.addEventListener = (t, f) => { (e.listeners[t] = e.listeners[t] || []).push(f); };
  e.insertBefore = (n) => { reg[n.id] = n; };
  e.appendChild = (n) => { reg[n.id] = n; };
  e.focused = [];
  e.cells = {};
  e.querySelector = (sel) => {
    const m = sel.match(/data-wvp-online="([^"]+)"/);
    if (m) return e._h.indexOf('data-wvp-online="' + m[1] + '"') >= 0 ? (e.cells[m[1]] = e.cells[m[1]] || { innerHTML: '' }) : null;
    const a = sel.match(/\[([\w-]+)/);
    return a && e._h.indexOf(a[1]) >= 0 ? { focus: () => e.focused.push(sel), value: '', setSelectionRange() {} } : null;
  };
  e.writes = 0;
  Object.defineProperty(e, 'innerHTML', { get: () => e._h, set: (v) => { e._h = String(v); e.writes++; } });
  return e;
}

// Un botón falso para los clics: atributos y nada más.
function target(attrs, disabled) {
  return { disabled: !!disabled, parentNode: null, getAttribute: (k) => (k in attrs ? String(attrs[k]) : null), hasAttribute: (k) => k in attrs };
}

function load(opts = {}) {
  const reg = {}, calls = [], winL = {}, docL = {};
  ['wvPanel', 'wvTabDaily', 'wvTabWeekly', 'wvTabSpecial', 'wvTabShop', 'wvTabBtnShop'].forEach((id) => { reg[id] = el(id, reg); });
  reg.wvTabDaily.parentNode = reg.wvPanel;
  reg.keySelectGlobal = { value: 'K1-aaaa-1111' };
  const store = { [FP1]: { pinned: { 10: 1, 11: 1 }, marks: { 10: 1 } }, [FP2]: { pinned: { 10: 1 }, marks: {} } };
  Object.assign(store, opts.store || {});
  const bag = (fp) => (store[fp] = store[fp] || { pinned: {}, marks: {} });
  const mutate = () => Promise.resolve().then(() => (winL['wv:season-store:mutate'] || []).forEach((f) => f({})));
  const S = {
    getCurrentSeasonInfo: () => Promise.resolve({ year: 26, seq: 1 }),
    getPinned: (y, q, fp) => Object.assign({}, bag(fp).pinned),
    getMarks: (y, q, fp) => Object.assign({}, bag(fp).marks),
    setMarks: (y, q, fp, p) => { calls.push(['setMarks', fp, J(p)]); Object.keys(p).forEach((k) => { bag(fp).marks[k] = Number(p[k]); }); return mutate(); },
    setPinned: (y, q, fp, p) => { calls.push(['setPinned', fp, J(p)]); Object.keys(p).forEach((k) => { if (p[k]) bag(fp).pinned[k] = 1; else delete bag(fp).pinned[k]; }); return mutate(); },
    delPinned: (y, q, fp, ids) => { calls.push(['delPinned', fp, J(ids)]); ids.forEach((k) => delete bag(fp).pinned[k]); return mutate(); }
  };
  const keys = opts.keys || [{ value: 'K1-aaaa-1111', label: 'Gato.1234', tag: 'main' }, { value: 'K2-bbbb-2222', label: 'Alter.5678' }, { value: 'K3-cccc-3333', label: 'Farm.9012' }, { label: 'sin key' }];
  const ls = { wvpd_open: '0' };
  const doc = {
    readyState: 'complete', head: { appendChild: (n) => { reg[n.id] = n; } },
    getElementById: (id) => reg[id] || null,
    createElement: () => el(null, reg),
    querySelector: () => null,
    addEventListener: (t, f) => { (docL[t] = docL[t] || []).push(f); }
  };
  const win = {
    console: { info() {}, warn() {}, log() {} }, setTimeout, clearTimeout, setInterval, clearInterval, Promise, Date, Math, JSON, Map, Set, Object, Array, String, Number,
    document: doc,
    localStorage: { getItem: (k) => (k === 'gw2_keys' ? JSON.stringify(keys) : (k in ls ? ls[k] : null)), setItem: (k, v) => { ls[k] = String(v); } },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected' }, get: () => null },
    WVSeasonStore: S,
    GW2Api: {
      getWVShopMerged: (tk, o) => { calls.push(['shop', tk, J(o)]); return SHOPS[tk] ? Promise.resolve({ aa: SHOPS[tk].aa, rows: SHOPS[tk].rows.map((r) => Object.assign({}, r)), itemsById: ITEMS }) : Promise.reject(new Error('503')); },
      getAccountInfo: (tk, o) => { calls.push(['info', tk, J(o)]); return Promise.resolve({ last_modified: new Date(Date.now() - 3 * 60000).toISOString(), tk }); },
      isRecentlyActive: (info) => info.tk === 'K1-aaaa-1111',
      getItemsMany: (ids) => { calls.push(['items', J(ids)]); return Promise.resolve(ids.map((id) => ({ id, name: 'Ítem ' + id, icon: 'i' + id + '.png' }))); },
      getWVWeekly: (tk) => { calls.push(['weekly', tk]); return Promise.resolve({}); }
    },
    GN: { progressEta: { computeEta: () => null, fmtEta: () => '' } },
    WV: { setActiveTab: (t) => calls.push(['setActiveTab', t]) },
    toast: (k, m) => calls.push(['toast', k, m]),
    confirm: (m) => { calls.push(['confirm', m]); return opts.confirm !== false; },
    requestAnimationFrame: (f) => f(),
    addEventListener: (t, f) => { (winL[t] = winL[t] || []).push(f); }
  };
  win.window = win;
  const ctx = vm.createContext(win);
  if (opts.view !== false) vm.runInContext(VIEW, ctx);
  vm.runInContext(MANAGE, ctx);
  vm.runInContext(SRC, ctx);
  const panel = () => reg.wvPDPanel;
  const click = (attrs, disabled) => panel().listeners.click.forEach((f) => f({ target: target(attrs, disabled) }));
  return { win, ctx, reg, calls, store, ls, panel, click, docL, winL, PD: win.WVPurchaseDetail };
}

test('versión 2.0.0 con su ?v en index.html; de 91 KB a menos de 40 KB y fuera de los congelados', () => {
  assert.match(SRC, /Versión: 2\.0\.0/);
  assert.match(read('index.html'), /<script defer src="js\/wv-purchase-detail\.js\?v=2\.0\.0"><\/script>/);
  const bytes = Buffer.byteLength(SRC);
  assert.ok(bytes <= 40960, 'pesa ' + bytes);
  const budget = JSON.parse(read('tools/size-budget.json'));
  assert.ok(!budget.congelados['js/wv-purchase-detail.js'] && !budget.advertencia['js/wv-purchase-detail.js'], 'ya es saludable');
});

test('fuera lo que escribía sobre la Tienda vieja y los globales sueltos; solo las lecturas crudas de siempre', () => {
  assert.ok(!/enhanceShopCards|updateManualMark|refreshCardDisplay|MutationObserver|wv-counter-placeholder|injectStyles/.test(CODE));
  assert.ok(!/window\.(getTotalPurchased|findRowByListingId|__wvpdState)\s*=/.test(CODE));
  assert.ok(!/getWVWeekly/.test(CODE), 'la semana vive en Objetivos semanales');
  const raw = [...SRC.matchAll(/localStorage\.getItem\(\s*'([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual([...new Set(raw)], ['gw2_keys', 'wvpd_open']);
  assert.ok(!/style="/.test(SRC), 'sin estilos en línea');
});

test('show: oculta las pestañas viejas, carga cada cuenta (Tienda y online, sin la semana) y pinta la matriz', async () => {
  const t = load();
  assert.ok(t.panel(), 'el panel existe desde el arranque (wv-view.js lo busca)');
  assert.equal(t.panel().attrs.hidden, '');
  await t.PD.show();
  await flush();
  assert.equal(t.ls.wvpd_open, '1');
  assert.equal(t.reg.wvTabShop.attrs.hidden, '');
  assert.ok(!('hidden' in t.panel().attrs));
  assert.equal(t.panel().style.display, 'block');
  const shops = t.calls.filter((c) => c[0] === 'shop').map((c) => c[1]);
  assert.deepEqual(shops, ['K1-aaaa-1111', 'K2-bbbb-2222', 'K3-cccc-3333']);
  assert.equal(t.calls.filter((c) => c[0] === 'info').length, 2, 'online solo de las que se pudieron leer');
  assert.ok(!t.calls.some((c) => c[0] === 'weekly'));
  const h = t.panel().innerHTML;
  assert.match(h, /class="wvp-stats"/);
  assert.match(h, /Gato\.1234<small>main<\/small><small class="wvp-sel-acc">seleccionada/);
  assert.match(h, /Farm\.9012.*No se pudo leer/);
  assert.match(h, /1 cuenta no se pudo leer/);
  assert.match(h, /Cofre de Mística/);
  assert.ok(t.reg['wv-purchase-detail-css'], 'estilos una vez');
  assert.deepEqual(t.calls.find((c) => c[0] === 'items'), ['items', [101]], 'busca solo los íconos que faltan');
  const n = t.calls.length;
  await t.PD.show();
  await flush();
  assert.equal(t.calls.filter((c) => c[0] === 'shop').length, 3, 'una segunda visita no recarga');
  await t.PD.refresh(true);
  await flush();
  assert.ok(t.calls.slice(n).some((c) => c[0] === 'shop' && c[2].nocache === true), '↻ Actualizar fuerza la API');
});

test('−/+: marca la compra de esa cuenta en el almacén, con tope, sin volver a pedir nada a la API', async () => {
  const t = load();
  await t.PD.show();
  await flush();
  const before = t.calls.length;
  const w = t.panel().writes;
  t.click({ 'data-wvp-step': '1', 'data-fp': FP2, 'data-id': '10' });
  await flush();
  assert.equal(t.panel().writes - w, 1, 'se pinta una vez: el aviso del almacén no repinta lo que ya está igual (no se pierde el foco)');
  assert.deepEqual(t.calls.find((c) => c[0] === 'setMarks'), ['setMarks', FP2, { 10: 1 }]);
  assert.match(t.panel().innerHTML, /0<em>\+1<\/em> \/ 3/);
  assert.ok(t.panel().focused.some((s) => s.indexOf('data-wvp-step="1"') >= 0), 'el foco vuelve al botón');
  t.click({ 'data-wvp-step': '1', 'data-fp': FP1, 'data-id': '10' });
  t.click({ 'data-wvp-step': '1', 'data-fp': FP1, 'data-id': '10' });
  await flush();
  assert.deepEqual(t.store[FP1].marks, { 10: 2 }, 'tope: 3 − 1 que vio la API');
  const n = t.calls.filter((c) => c[0] === 'setMarks').length;
  t.PD._act.setMark(FP1, '10', 1);
  await flush();
  assert.equal(t.calls.filter((c) => c[0] === 'setMarks').length, n, 'en el tope no escribe de nuevo');
  t.click({ 'data-wvp-step': '-1', 'data-fp': FP2, 'data-id': '10' }, true);
  await flush();
  assert.equal(t.store[FP2].marks[10], 1, 'un botón apagado no hace nada');
  assert.ok(!t.calls.slice(before).some((c) => c[0] === 'shop' || c[0] === 'info'), 'ni la Tienda ni online se piden de nuevo');
});

test('si la Tienda u otra pestaña cambian marcas o fijados, se relee el almacén y se repinta', async () => {
  const t = load();
  await t.PD.show();
  await flush();
  t.store[FP2].pinned[11] = 1;
  t.winL['wv:season-store:mutate'].forEach((f) => f({}));
  await flush();
  assert.match(t.panel().innerHTML, /data-fp="K2-b…2222" data-id="11"/);
  t.store[FP2].marks[11] = 2;
  t.winL.storage.forEach((f) => f({ key: 'wv:season:current' }));
  assert.match(t.panel().innerHTML, /0<em>\+2<\/em> \/ 5/);
});

test('«Gestionar»: el menú se abre y se cierra; ajustar marcas a la API en todas las cuentas y deshacer', async () => {
  const t = load({ store: { [FP1]: { pinned: { 10: 1 }, marks: { 10: 5 } } } });
  await t.PD.show();
  await flush();
  t.click({ 'data-wvp-menu': '' });
  assert.match(t.panel().innerHTML, /aria-expanded="true"[\s\S]*data-wvp-act="sync"/);
  t.panel().listeners.keydown.forEach((f) => f({ key: 'Escape' }));
  assert.match(t.panel().innerHTML, /aria-expanded="false"/);
  t.click({ 'data-wvp-act': 'sync' });
  await flush();
  assert.deepEqual(t.calls.filter((c) => c[0] === 'setMarks'), [['setMarks', FP1, { 10: 2 }]]);
  assert.match(t.panel().innerHTML, /Ajusté 1 marca a lo que ya registró la API\.[\s\S]*data-wvp-undo>Deshacer/);
  t.click({ 'data-wvp-undo': '' });
  await flush();
  assert.deepEqual(t.store[FP1].marks, { 10: 5 });
  assert.ok(t.calls.some((c) => c[0] === 'toast' && c[2] === 'Listo: lo deshice'));
  assert.ok(!/data-wvp-undo>/.test(t.panel().innerHTML));
});

test('«Gestionar»: copiar los fijados de la cuenta seleccionada (confirma) y quitar todos (confirma); los dos se deshacen', async () => {
  const t = load();
  await t.PD.show();
  await flush();
  await t.PD._act.runAction('copy');
  await flush();
  assert.match(t.calls.find((c) => c[0] === 'confirm')[1], /¿Copiar 2 fijados de la cuenta seleccionada a 1 cuenta más\?/);
  assert.deepEqual(t.calls.filter((c) => c[0] === 'setPinned'), [['setPinned', FP2, { 11: true }]], 'solo agrega lo que falta; la ilegible no participa');
  t.PD._act.runUndo();
  await flush();
  assert.deepEqual(t.calls.find((c) => c[0] === 'delPinned'), ['delPinned', FP2, ['11']]);
  await t.PD._act.runAction('clear');
  await flush();
  assert.match(t.calls.filter((c) => c[0] === 'confirm')[1][1], /¿Quitar 3 fijados de 2 cuentas en esta temporada\?/);
  assert.deepEqual(J(t.store[FP1].pinned), {});
  assert.match(t.panel().innerHTML, /Todavía no fijaste compras/);
  t.PD._act.runUndo();
  await flush();
  assert.deepEqual(J(t.store[FP1].pinned), { 10: 1, 11: 1 });
  assert.deepEqual(J(t.store[FP2].pinned), { 10: 1 });
});

test('«Gestionar»: si no confirmás, no se toca nada', async () => {
  const t = load({ confirm: false });
  await t.PD.show();
  await flush();
  assert.equal(await t.PD._act.runAction('clear'), false);
  assert.equal(await t.PD._act.runAction('copy'), false);
  assert.ok(!t.calls.some((c) => c[0] === 'delPinned' || c[0] === 'setPinned'));
});

test('«Quién está online» actualiza la celda de cada cuenta por su token y avisa el progreso', async () => {
  const t = load();
  await t.PD.show();
  await flush();
  t.store; // las dos legibles ya tienen estado; la ilegible pasa a tenerlo
  t.click({ 'data-wvp-online-all': '' });
  await flush();
  assert.ok(t.calls.filter((c) => c[0] === 'info' && c[2].nocache === true).length === 3);
  assert.match(t.panel().cells['K3-c…3333'].innerHTML, /Sin actividad reciente/);
  assert.ok(t.calls.some((c) => c[0] === 'toast' && /1 cuenta\(s\) activa\(s\)/.test(c[2])));
});

test('hide: vuelve a mostrar las pestañas, deja la Tienda activa y recuerda que se cerró', async () => {
  const t = load();
  await t.PD.show();
  await flush();
  t.PD.hide();
  assert.equal(t.ls.wvpd_open, '0');
  assert.ok(!('hidden' in t.reg.wvTabShop.attrs));
  assert.equal(t.panel().attrs.hidden, '');
  assert.equal(t.panel().style.display, 'none');
  assert.deepEqual(t.calls.filter((c) => c[0] === 'setActiveTab'), [['setActiveTab', 'shop']]);
  assert.equal(typeof t.PD.refreshOnlineStatus, 'function');
  assert.equal(t.PD.version, '2.0.0');
});

test('sin la vista todavía (llega por el manifiesto) avisa y pinta cuando boot.js termina; sin cuentas lo dice', async () => {
  const t = load({ view: false });
  await t.PD.show();
  await flush();
  assert.match(t.panel().innerHTML, /Preparando Compras fijadas…/);
  vm.runInContext(VIEW, t.ctx);
  t.docL['gn:boot-ready'].forEach((f) => f({}));
  assert.match(t.panel().innerHTML, /class="wvp-stats"/);
  const e = load({ keys: [] });
  await e.PD.show();
  await flush();
  assert.match(e.panel().innerHTML, /Todavía no agregaste cuentas[\s\S]*data-wvp-retry/);
  assert.ok(!e.calls.some((c) => c[0] === 'shop'));
});
