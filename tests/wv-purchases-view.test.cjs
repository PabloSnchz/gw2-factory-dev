// Cámara del Brujo (BL-064, CAM-5): cómo se ve Todas las cuentas → Compras fijadas.
// js/wv-purchases-view.js son funciones puras (números y HTML) y estilos; los datos y
// las acciones viven en js/wv-purchase-detail.js.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'wv-purchases-view.js'), 'utf8');
const SHOP = fs.readFileSync(path.join(ROOT, 'js', 'wv-shop-ui.js'), 'utf8');
const J = (v) => JSON.parse(JSON.stringify(v));

function load() {
  const win = { console: { info() {}, warn() {} }, Promise, Date, Math, JSON, Map, Object, Array, String, Number };
  win.window = win;
  vm.runInContext(SRC, vm.createContext(win));
  return win.WVPurchasesView;
}
const V = load();

const row = (id, item, cost, limit, purchased) => ({ id, item_id: item, cost, purchase_limit: limit, purchased, item_count: 1 });
const META = { 100: { name: 'Cofre de Mística', icon: 'cofre.png' }, 101: { name: 'Trébol místico', icon: 'trebol.png' }, 102: { name: 'Zz <Ilimitado>', icon: '' } };
const metaOf = (id) => META[id] || null;
function accounts() {
  return [
    { token: 'K1-aaaa-1111', fp: 'K1-a…1111', name: 'Gato.1234', tag: 'main', aa: 500, rows: [row(10, 100, 100, 3, 1), row(11, 101, 30, 5, 5), row(12, 102, 1, null, 2)],
      pinned: { 10: 1, 11: 1 }, marks: { 10: 1 }, isOnline: true, lastPlayedChar: 'Actividad hace 3 min' },
    { token: 'K2-bbbb-2222', fp: 'K2-b…2222', name: 'Alter.5678', tag: 'alter', aa: 100, rows: [row(10, 100, 100, 3, 0), row(11, 101, 30, 5, 0), row(12, 102, 1, null, 0)],
      pinned: { 10: 1, 12: 1 }, marks: {}, isOnline: false },
    { token: 'K3-cccc-3333', fp: 'K3-c…3333', name: 'Farm.9012', tag: '', aa: 0, rows: [], pinned: { 10: 1 }, marks: {}, error: '503' },
    { token: 'K4-dddd-4444', fp: 'K4-d…4444', name: 'Rota.0000', tag: 'f2p', aa: 900, rows: [row(10, 100, 100, 3, 0)], pinned: {}, marks: {} }
  ];
}

test('versión 1.0.0 por el manifiesto (no en index.html); dentro de los 40 KB; sin emoji', () => {
  assert.match(SRC, /Versión: 1\.0\.0/);
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8'));
  const m = man.modules.find((x) => x.src === 'js/wv-purchases-view.js');
  assert.ok(m, 'js/wv-purchases-view.js está en js/modules.json');
  assert.equal(m.v, '1.0.0');
  assert.equal(V.version, '1.0.0');
  assert.ok(!/wv-purchases-view\.js/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')), 'no se carga desde index.html');
  assert.ok(Buffer.byteLength(SRC) <= 40960, 'pesa ' + Buffer.byteLength(SRC));
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u2705\u26A0]/u.test(SRC), 'sin emoji');
});

test('unidades: mismas reglas que la Tienda (rowNumbers de wv-shop-ui.js)', () => {
  const win = { console: { info() {}, warn() {} }, document: null, Promise, Map };
  win.window = win;
  vm.runInContext(SHOP, vm.createContext(win));
  const shop = win.WVShopUI._pure.rowNumbers;
  const cases = [[row(1, 1, 10, 3, 1), { 1: 1 }], [row(1, 1, 10, 3, 1), { 1: 9 }], [row(1, 1, 10, 3, 3), { 1: 2 }], [row(1, 1, 10, null, 4), { 1: 2 }], [row(1, 1, 10, 5, 0), {}], [row(1, 1, 10, 2, 0), { 1: -3 }]];
  cases.forEach(([r, m]) => assert.deepEqual(J(V.units(r, m)), J(shop(r, m))));
  assert.deepEqual(J(V.units(row(1, 1, 10, 3, 1), { 1: 9 })), { limit: 3, api: 1, marked: 2, max: 2, left: 0, apiFull: false, done: true });
});

test('números por cuenta y resumen: la AA disponible descuenta lo marcado; las ilegibles no cuentan', () => {
  const a = accounts();
  assert.deepEqual(J(V.accountNumbers(a[0])), { aa: 500, marked: 100, reserved: 100, cells: 2, done: 1, leftUnits: 1, avail: 400, diff: 300 });
  assert.deepEqual(J(V.accountNumbers(a[1])), { aa: 100, marked: 0, reserved: 300, cells: 1, done: 0, leftUnits: 3, avail: 100, diff: -200 });
  assert.deepEqual(J(V.summarize(a)), { avail: 1400, reserved: 400, leftUnits: 4, cells: 3, done: 1, short: 1, shortAA: 200, readable: 3, marked: 100 });
  const justo = { aa: 300, rows: [row(10, 100, 100, 3, 0)], pinned: { 10: 1 }, marks: {} };
  assert.equal(V.summarize([justo]).short, 0, 'con la AA justa, llega');
});

test('columnas: ítems fijados en alguna cuenta, por nombre (marcar no las mueve); totales por ítem', () => {
  const a = accounts();
  const cols = V.itemColumns(a, metaOf);
  assert.deepEqual(J(cols.map((c) => c.id)), ['10', '11', '12']);
  assert.equal(cols[0].name, 'Cofre de Mística');
  assert.equal(cols[0].icon, 'cofre.png');
  assert.equal(V.itemColumns(a, () => null)[0].name, 'Ítem #100');
  const names = { 100: 'Zeta', 101: 'Alfa', 102: 'Beta' };
  assert.deepEqual(J(V.itemColumns(a, (id) => ({ name: names[id] })).map((c) => c.id)), ['11', '12', '10'], 'por nombre, no por número');
  assert.deepEqual(J(V.itemColumns([{ rows: [row(10, 100, 100, 3, 0)], pinned: { 10: 0 } }], metaOf)), [], 'un fijado en 0 es «no fijado»');
  assert.deepEqual(J(V.itemTotals(a, cols[0])), { left: 4, aa: 400, accounts: 2, pinnedIn: 2 });
  assert.deepEqual(J(V.itemTotals(a, cols[1])), { left: 0, aa: 0, accounts: 0, pinnedIn: 1 });
  assert.deepEqual(J(V.itemTotals(a, cols[2])), { left: 0, aa: 0, accounts: 0, pinnedIn: 0 }, 'sin límite no suma');
});

test('orden y filtros: a la que más le falta primero (ilegibles al final), nombre, como en Cuentas, más AA; búsqueda y pendientes', () => {
  const a = accounts();
  const names = (o) => V.arrangeRows(a, o).map((x) => x.name);
  assert.deepEqual(names({ sort: 'need' }), ['Alter.5678', 'Gato.1234', 'Rota.0000', 'Farm.9012']);
  assert.deepEqual(names({ sort: 'name' }), ['Alter.5678', 'Farm.9012', 'Gato.1234', 'Rota.0000']);
  assert.deepEqual(names({ sort: 'keys' }), ['Gato.1234', 'Alter.5678', 'Farm.9012', 'Rota.0000']);
  assert.deepEqual(names({ sort: 'aa' }), ['Rota.0000', 'Gato.1234', 'Alter.5678', 'Farm.9012']);
  assert.deepEqual(names({ sort: 'keys', pendingOnly: true }), ['Gato.1234', 'Alter.5678', 'Farm.9012']);
  assert.deepEqual(names({ sort: 'keys', q: ' GATO ' }), ['Gato.1234']);
});

test('celdas: no fijado, fuera de la tienda, sin límite, en curso con −/+, completo y completo según la API', () => {
  const a = accounts();
  const cols = V.itemColumns(a, metaOf);
  const off = V.cellHTML(a[0], cols[2]);
  assert.match(off, /No fijado en esta cuenta/);
  assert.ok(!/data-wvp-step/.test(off));
  const notShop = V.cellHTML({ name: 'X', fp: 'x', pinned: { 10: 1 }, rows: [] }, cols[0]);
  assert.match(notShop, /No está en la tienda de esta cuenta/);
  assert.match(V.cellHTML(a[1], cols[2]), /0 \/ ∞/);
  const run = V.cellHTML(a[0], cols[0]);
  assert.match(run, /1<em>\+1<\/em> \/ 3/);
  assert.match(run, /aria-label="Comprado 1, marcado 1 de 3"/);
  assert.match(run, /data-wvp-step="-1" data-fp="K1-a…1111" data-id="10" aria-label="Una menos">/);
  assert.match(run, /data-wvp-step="1" data-fp="K1-a…1111" data-id="10" aria-label="Una más">/);
  assert.match(run, /aria-label="Compras marcadas por vos: Cofre de Mística en Gato\.1234"/);
  assert.ok(!/Completo/.test(run));
  const zero = V.cellHTML(a[1], cols[0]);
  assert.match(zero, /data-wvp-step="-1"[^>]* disabled>/, '− apagado sin marcas');
  const full = V.cellHTML(Object.assign({}, a[0], { marks: { 10: 2 } }), cols[0]);
  assert.match(full, /Completo/);
  assert.match(full, /data-wvp-step="1"[^>]* disabled>/, '+ apagado en el tope');
  assert.match(full, /data-wvp-step="-1"[^>]*aria-label="Una menos">/, '− sigue para corregir');
  const api = V.cellHTML(a[0], cols[1]);
  assert.match(api, /Completo/);
  assert.ok(!/data-wvp-step/.test(api), 'si la API ya lo vio todo, no hay nada que marcar');
});

test('matriz: AA disponible, reservada y balance por cuenta; online; seleccionada; ilegible; fila «Faltan»; escapa', () => {
  const a = accounts();
  a[1].name = 'Alter<b>';
  const cols = V.itemColumns(a, metaOf);
  const h = V.matrixHTML(V.arrangeRows(a, { sort: 'keys' }), cols, a, 'K2-b…2222');
  assert.match(h, /<caption class="wvp-sr">Compras fijadas de todas las cuentas<\/caption>/);
  assert.match(h, /<th scope="col" class="wvp-acc">Cuenta<\/th><th scope="col" class="wvp-n">AA disponible<\/th><th scope="col" class="wvp-n">Reservada<\/th><th scope="col" class="wvp-n">Balance<\/th>/);
  assert.match(h, /<img src="cofre\.png" alt="" width="28" height="28" loading="lazy"><span class="wvp-in">Cofre de Mística<\/span><span class="wvp-ic">100<span class="wvp-aa">AA<\/span> c\/u/);
  assert.match(h, /Zz &lt;Ilimitado&gt;/);
  assert.match(h, /Alter&lt;b&gt;<small>alter<\/small><small class="wvp-sel-acc">seleccionada<\/small>/);
  assert.ok(!/Alter<b>/.test(h));
  assert.match(h, /wvp-good">\+300<span class="wvp-aa">AA<\/span><span class="wvp-sr"> le sobra/);
  assert.match(h, /wvp-bad">−200<span class="wvp-aa">AA<\/span><span class="wvp-sr"> le falta/);
  assert.match(h, /data-wvp-online="K1-a…1111"><i class="wvp-dot wvp-dot--on" aria-hidden="true"><\/i>Activa<small>Actividad hace 3 min<\/small>/);
  assert.match(h, /Sin actividad reciente/);
  assert.match(h, /<tr class="wvp-err">.*Farm\.9012.*No se pudo leer/);
  assert.match(h, /<th scope="row" class="wvp-acc">Faltan<\/th>/);
  assert.match(h, /<b>4 compras<\/b><small>400<span class="wvp-aa">AA<\/span> · 2 cuentas<\/small>/);
  assert.match(h, /src="assets\/icons\/Cuentas\/547827\.png"/, 'ícono por tipo, como Cartera');
  assert.equal(V.accountIcon('', 'K3-cccc-3333'), V.accountIcon('', 'K3-cccc-3333'), 'el decorativo es fijo');
  ['a', 'K3-cccc-3333', 'zzzzzzzzzzzzzzzz', 'ÑÑÑ-9999-ÿÿÿÿ', 'E1A2C3D4-0000-FFFF'].forEach((tk) =>
    assert.match(V.accountIcon('', tk), /^assets\/icons\/Cuentas\/17706\d\d\.png$/, tk));
  assert.match(V.matrixHTML([], [], [], ''), /Todavía no fijaste compras[\s\S]*data-wvp-shop/);
  assert.match(V.matrixHTML([], cols, a, ''), /Ninguna cuenta coincide/);
});

test('números de arriba: disponible, reservada, cuentas que no llegan y fijados completos', () => {
  const h = V.statsHTML(V.summarize(accounts()), 4);
  assert.match(h, /AA disponible<\/small><b>1\.400<span class="wvp-aa">AA<\/span><\/b><em>ya descontada la que marcaste/);
  assert.match(h, /Reservada para fijados<\/small><b>400<span class="wvp-aa">AA<\/span><\/b><em>4 compras pendientes/);
  assert.match(h, /Cuentas que no llegan<\/small><b class="wvp-bad">1 <span>de 4<\/span><\/b><em>les faltan 200/);
  assert.match(h, /Fijados completos<\/small><b>1 <span>de 3<\/span><\/b><div class="wvp-bar" aria-hidden="true"><i style="width:33%">/);
  const ok = V.statsHTML({ avail: 10, reserved: 0, leftUnits: 0, cells: 0, done: 0, short: 0, shortAA: 0, readable: 1, marked: 0 }, 1);
  assert.match(ok, /en 1 cuenta<\/em>/);
  assert.match(ok, /nada pendiente/);
  assert.match(ok, /todas llegan con su AA/);
});

test('vista: cargando, error con reintento, barra con búsqueda, «Gestionar» con 3 acciones, deshacer y leyenda', () => {
  const base = { accounts: [], loading: true, view: { q: '', pendingOnly: false, sort: 'need' }, metaOf };
  assert.match(V.viewHTML(base), /Leyendo las compras fijadas de tus cuentas…/);
  assert.match(V.viewHTML(Object.assign({}, base, { loading: false, error: 'Sin <cuentas>' })), /Sin &lt;cuentas&gt;[\s\S]*data-wvp-retry/);
  const st = { accounts: accounts(), view: { q: '', pendingOnly: true, sort: 'aa' }, metaOf, syncedAt: '10:05', menuOpen: true, status: 'Estado online: 1/4', statusKind: 'error',
    undo: { msg: 'Quité 2 fijados.', until: 20000 } };
  const h = V.viewHTML(st, 12000);
  assert.match(V.toolHTML({ q: 'a"b' }), /data-wvp-q placeholder="Buscar cuenta…" aria-label="Buscar cuenta" value="a&quot;b"/);
  assert.match(h, /data-id="10"/);
  assert.ok(!/Trébol místico/.test(h), 'sin pendientes en ninguna cuenta, la columna se va');
  assert.match(h, /data-wvp-pending aria-pressed="true"/);
  assert.match(h, /<option value="aa" selected>más AA<\/option>/);
  assert.match(h, /data-wvp-menu aria-haspopup="menu" aria-expanded="true">Gestionar ▾/);
  ['sync', 'copy', 'clear'].forEach((id) => assert.match(h, new RegExp('data-wvp-act="' + id + '"')));
  assert.match(h, /<hr><button type="button" role="menuitem" data-wvp-act="clear" class="wvp-danger">Quitar fijados de todas las cuentas…/);
  assert.match(h, /data-wvp-online-all/);
  assert.match(h, /Datos de la API de las 10:05/);
  assert.match(h, /<div class="wvp-undo" role="status"><span>Quité 2 fijados\.<\/span><button type="button" class="wvp-chip" data-wvp-undo>Deshacer<\/button><small data-wvp-left>8 s<\/small>/);
  assert.match(h, /id="wvpdStatusMsg" class="wvp-status wvp-status--err" role="status">Estado online: 1\/4/);
  assert.match(h, /1 cuenta no se pudo leer: tocá «↻ Actualizar» arriba/);
  assert.match(h, /Comprado según la API[\s\S]*Marcado por vos/);
  assert.ok(!/data-id="12"/.test(h), '«Solo con pendientes» saca las columnas sin pendientes');
  assert.equal(V.undoHTML({ msg: 'x', until: 1000 }, 2000), '', 'vencido no se muestra');
  assert.ok(!/aria-expanded="true"|role="menu"/.test(V.viewHTML(Object.assign({}, st, { menuOpen: false }), 12000)));
});

test('reglas: solo pinta (sin almacenamiento, red ni globales viejos), tokens del GDS, celular a 2 columnas', () => {
  assert.ok(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest|GW2Api|WVSeasonStore/.test(SRC));
  assert.ok(!/enhanceShopCards|wvpd-manual-input|MutationObserver/.test(SRC));
  assert.ok(!/style="(?!width:)/.test(SRC), 'sin estilos en línea salvo el ancho de las barras');
  assert.match(V.CSS, /var\(--bd-1\)/);
  assert.match(V.CSS, /@media \(max-width:900px\)\{\.wvp-stats\{grid-template-columns:1fr 1fr/);
  assert.match(V.CSS, /\.wvp-acc\{position:sticky;left:0/);
  assert.match(V.CSS, /\.wvp-step button\{width:36px;height:36px\}/, 'botones de 36 px en el celular');
});
