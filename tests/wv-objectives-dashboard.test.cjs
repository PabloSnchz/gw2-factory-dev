// Cámara del Brujo (BL-064, CAM-4): Todas las cuentas → Objetivos semanales.
// js/wv-objectives-dashboard.js 2.0.0 mantiene la API que usan router.js y wv-view.js
// (activate, deactivate, refresh) y pinta una matriz legible de cuentas por objetivos.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'wv-objectives-dashboard.js'), 'utf8');
const J = (v) => JSON.parse(JSON.stringify(v));

const o = (id, title, track, cur, tot, aa, claimed) => ({ id, title, track, progress_current: cur, progress_complete: tot, acclaim: aa, claimed: !!claimed });
const WEEK = {
  K1: { objectives: [o(1, 'Eventos en Janthir', 'PvE', 5, 5, 40, true), o(2, 'Ganá partidas', 'PvP', 3, 3, 50), o(3, 'Capturá una torre', 'WvW', 1, 3, 30)] },
  K2: { objectives: [o(1, 'Eventos en Janthir', 'PvE', 5, 5, 40), o(2, 'Ganá partidas', 'PvP', 0, 3, 50), o(3, 'Capturá una torre', 'WvW', 0, 3, 30)] },
  K3: { objectives: [o(1, 'Eventos en Janthir', 'PvE', 5, 5, 40, true), o(2, 'Ganá partidas', 'PvP', 3, 3, 50, true), o(3, 'Capturá una torre', 'WvW', 3, 3, 30, true)] }
};
const KEYS = [
  { value: 'K1', label: 'Gato.1234', tag: 'main' },
  { value: 'K2', label: 'Alter.5678', tag: 'alter' },
  { value: 'K3', label: 'Farm.9012' },
  { value: 'K4', label: 'Rota.0000' },
  { label: 'sin key' }
];

function load(opts = {}) {
  const nodes = {};
  const panel = { id: 'wvObjectivesDashboardPanel', attrs: { hidden: '' }, listeners: {}, _h: '', focused: 0 };
  panel.addEventListener = (t, f) => { (panel.listeners[t] = panel.listeners[t] || []).push(f); };
  panel.removeAttribute = (k) => { delete panel.attrs[k]; };
  panel.setAttribute = (k, v) => { panel.attrs[k] = v; };
  panel.querySelector = (sel) => (sel === '[data-wvd-pending]' && panel._h.indexOf('data-wvd-pending') >= 0 ? { focus: () => { panel.focused++; } } : null);
  Object.defineProperty(panel, 'innerHTML', { get: () => panel._h, set: (v) => { panel._h = String(v); } });
  nodes[panel.id] = panel;
  const calls = [];
  const head = { appendChild(c) { nodes[c.id] = c; } };
  const keys = opts.keys === undefined ? KEYS : opts.keys;
  const win = {
    console: { info() {}, warn() {} }, Promise, Date, Math, JSON, Object, Array, String, Number,
    document: { head, getElementById: (id) => nodes[id] || null, createElement: () => ({}) },
    localStorage: { getItem: (k) => (k === 'gw2_keys' ? JSON.stringify(keys) : null) },
    GW2Api: {
      getWVWeekly: (tk, op) => {
        calls.push(['getWVWeekly', tk, J(op)]);
        if (tk === 'K4') return Promise.reject(new Error('403'));
        return Promise.resolve(WEEK[tk]);
      }
    },
    WV: { hideObjectivesDashboard: () => calls.push(['WV.hideObjectivesDashboard']) },
    Analytics: { viewModule: (m) => calls.push(['view', m]) }
  };
  win.window = win;
  vm.runInContext(SRC, vm.createContext(win));
  const D = win.WVObjectivesDashboard;
  const P = {};
  Object.keys(D._pure).forEach((k) => {
    const v = D._pure[k];
    P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? J(r) : r; };
  });
  return { D, P, panel, calls, nodes };
}
const tick = () => new Promise((r) => setTimeout(r, 5));
const fire = (x, type, attrs, extra) => {
  const target = Object.assign({ hasAttribute: (k) => k in attrs, parentNode: null }, extra || {});
  x.panel.listeners[type].forEach((f) => f({ target }));
};
const rowNames = (h) => (h.match(/<th scope="row" class="wvd-acc"><span class="wvd-an"><img[^>]*><span>[^<]*/g) || []).map((s) => s.replace(/^.*<span>/, ''));

test('versión 2.0.0 y index.html la pide con el mismo ?v; dentro de los 40 KB', () => {
  assert.match(SRC, /\* Versión: 2\.0\.0 /);
  assert.match(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /src="js\/wv-objectives-dashboard\.js\?v=2\.0\.0"/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
});

test('estados de celda: reclamado, listo, en curso, sin empezar y sin datos', () => {
  const { P } = load();
  const n = P.normalizeObjectives(WEEK.K1);
  assert.deepEqual(n[2], { id: 3, title: 'Capturá una torre', track: 'wvw', mode: 'wvw', progress: 1, total: 3, acclaim: 30, claimed: false, pct: 33 });
  assert.deepEqual(n.map(P.statusOf), ['claimed', 'ready', 'run']);
  assert.equal(P.statusOf(P.normalizeObjectives(WEEK.K2)[1]), 'none');
  assert.equal(P.statusOf(null), 'nodata');
  assert.deepEqual(P.normalizeObjectives(null), []);
});

test('columnas: objetivos únicos de todas las cuentas, por modo (PvE, PvP, WvW) y título', () => {
  const { P } = load();
  const acc = [{ objectives: P.normalizeObjectives({ objectives: [o(9, 'Zeta', 'WvW', 0, 1, 1), o(8, 'Beta', 'PvE', 0, 1, 1)] }) },
    { objectives: P.normalizeObjectives({ objectives: [o(7, 'Alfa', 'PvE', 0, 1, 1), o(8, 'Beta', 'PvE', 1, 1, 1), o(6, 'Duelo', 'PvP', 0, 1, 1)] }) }];
  assert.deepEqual(P.mergeObjectives(acc).map((x) => x.id), [7, 8, 6, 9]);
});

test('resumen: reclamados, listos con su AA, cuenta más atrasada y cuentas al día (las ilegibles no cuentan)', () => {
  const { P } = load();
  const accounts = ['K1', 'K2', 'K3'].map((k, i) => ({ name: KEYS[i].label, objectives: P.normalizeObjectives(WEEK[k]) }));
  accounts.push({ name: 'Rota', error: '403', objectives: [] });
  const objs = P.mergeObjectives(accounts);
  assert.deepEqual(P.accountSummary(accounts[1], objs), { total: 3, claimed: 0, ready: 1, readyAA: 40, done: 1 });
  assert.deepEqual(P.summarize(accounts, objs), { cells: 9, claimed: 4, ready: 2, readyAA: 90, readyAccounts: 2, upToDate: 1, readable: 3,
    latest: { name: 'Alter.5678', done: 1, total: 3, ratio: 1 / 3 } });
  assert.equal(P.summarize([accounts[2]], objs).latest, null, 'si todas están al día no hay «más atrasada»');
  assert.equal(P.summarize([{ name: 'Nueva', objectives: [] }], objs).upToDate, 0, 'una cuenta sin objetivos no está «al día»');
  const tie = P.summarize([{ name: 'Primera', objectives: P.normalizeObjectives(WEEK.K2) }, { name: 'Segunda', objectives: P.normalizeObjectives(WEEK.K2) }], objs);
  assert.equal(tie.latest.name, 'Primera', 'en un empate queda la primera');
  assert.match(P.statsHTML(P.summarize([accounts[1]], objs), 1), /en 1 cuenta<\/em>/);
  assert.equal(P.normalizeObjectives(WEEK.K1)[1].mode, 'pvp');
});

test('orden y filtro: más atrasada primero, por nombre o como en Cuentas; «Solo con pendientes» saca las completas', () => {
  const { P } = load();
  const A = [
    { name: 'Gato', objectives: P.normalizeObjectives(WEEK.K1) },
    { name: 'Alter', objectives: P.normalizeObjectives(WEEK.K2) },
    { name: 'Farm', objectives: P.normalizeObjectives(WEEK.K3) },
    { name: 'Rota', error: 'x', objectives: [] }
  ];
  const objs = P.mergeObjectives(A);
  const names = (op) => P.arrangeRows(A, objs, op).map((a) => a.name);
  assert.deepEqual(names({ sort: 'late' }), ['Alter', 'Gato', 'Farm', 'Rota']);
  assert.deepEqual(names({ sort: 'name' }), ['Alter', 'Farm', 'Gato', 'Rota']);
  assert.deepEqual(names({ sort: 'keys' }), ['Gato', 'Alter', 'Farm', 'Rota']);
  assert.deepEqual(names({ sort: 'keys', pendingOnly: true }), ['Gato', 'Alter', 'Rota'], 'la que no se pudo leer sigue a la vista');
});

test('íconos de cuenta como en Cartera; los decorativos ya no son al azar', () => {
  const { P } = load();
  assert.equal(P.accountIcon('main', 'x'), 'assets/icons/Cuentas/547827.png');
  assert.equal(P.accountIcon('f2p', 'x'), 'assets/icons/Cuentas/102538.png');
  const a = P.accountIcon('', 'TOKEN-A');
  assert.match(a, /^assets\/icons\/Cuentas\/17706(7[89]|8[0-6])\.png$/);
  assert.equal(P.accountIcon('', 'TOKEN-A'), a);
  assert.doesNotMatch(SRC, /Math\.random/);
});

test('activate: carga las cuentas de a 3, pinta números, leyenda, filtros y matriz con texto accesible', async () => {
  const x = load();
  x.D.activate();
  assert.equal('hidden' in x.panel.attrs, false);
  assert.match(x.panel.innerHTML, /role="status">Leyendo los objetivos semanales de tus cuentas…/);
  await tick();
  assert.deepEqual(x.calls.filter((c) => c[0] === 'getWVWeekly').map((c) => c[1]), ['K1', 'K2', 'K3', 'K4'], 'la entrada sin key se ignora');
  assert.deepEqual(x.calls[0], ['view', 'wv_objectives_dashboard']);
  const h = x.panel.innerHTML;
  assert.ok(x.nodes['wv-objectives-dashboard-css']);
  assert.doesNotMatch(h, /Dashboard de Objetivos Semanales|wvodCountdown|style="[^"]*(padding|border|font-size)|✅|✔️|⏳|❌/, 'sin título ni reloj propios, sin estilos en línea ni emoji');
  assert.match(h, /<small>Reclamados<\/small><b>4 <span>de 9<\/span><\/b><div class="wvd-bar" aria-hidden="true"><i style="width:44%"><\/i><\/div>/);
  assert.match(h, /<small>Listos sin reclamar<\/small><b class="wvd-gold">2<\/b><em>\+90<span class="wvd-aa">AA<\/span> en 2 cuentas<\/em>/);
  assert.match(h, /<small>Cuenta más atrasada<\/small><b class="wvd-sm">Alter\.5678<\/b><em>1 de 3<\/em>/);
  assert.match(h, /<small>Cuentas al día<\/small><b>1 <span>de 4<\/span><\/b>/);
  assert.match(h, /<p class="wvd-note" role="status">1 cuenta no se pudo leer: tocá «↻ Actualizar» arriba para reintentar\.<\/p>/);
  assert.match(h, /<span><i class="wvd-dot wvd-dot--claimed"><\/i>Reclamado<\/span>/);
  assert.match(h, /data-wvd-pending aria-pressed="false">Solo con pendientes<\/button>/);
  assert.match(h, /<option value="late" selected>más atrasada<\/option>/);
  assert.match(h, /Datos de la API de las \d\d:\d\d/);
  assert.deepEqual(rowNames(h), ['Alter.5678', 'Gato.1234', 'Farm.9012', 'Rota.0000']);
  assert.match(h, /<th scope="col" title="Eventos en Janthir"><span class="wvd-md wvd-md--pve">PvE<\/span><span class="wvd-ot">Eventos en Janthir<\/span><span class="wvd-oa">\+40<span class="wvd-aa">AA<\/span><\/span><\/th>/);
  assert.match(h, /<td class="wvd-c wvd-c--ready" title="Listo para reclamar · 5 \/ 5"><i class="wvd-dot wvd-dot--ready" aria-hidden="true"><\/i><span class="wvd-sr">Listo para reclamar · 5 \/ 5<\/span><\/td>/);
  assert.match(h, /<td class="wvd-c wvd-c--run" title="En curso · 1 \/ 3"><i class="wvd-mini" aria-hidden="true"><i style="width:33%"><\/i><\/i>/);
  assert.match(h, /wvd-c--none" title="Sin empezar · 0 \/ 3"/);
  assert.match(h, /<img src="assets\/icons\/Cuentas\/157375\.png" alt="" width="24" height="24" loading="lazy"><span>Alter\.5678<small>alter<\/small><\/span>/);
  assert.match(h, /<td class="wvd-tot">0 \/ 3<small class="wvd-gold">1 listo<\/small><\/td>/);
  assert.match(h, /<tr class="wvd-err"><th scope="row" class="wvd-acc">.*Rota\.0000.*<em class="wvd-warn">No se pudo leer<\/em><\/th><td class="wvd-c wvd-c--nodata">/);
  assert.match(h, /<tfoot><tr><th scope="row" class="wvd-acc">Listos por cobrar<\/th><td class="wvd-c"><b class="wvd-gold">1<\/b><\/td><td class="wvd-c"><b class="wvd-gold">1<\/b><\/td><td class="wvd-c"><span aria-hidden="true">·<\/span>/);
});

test('filtros en vivo: «Solo con pendientes» con el foco en el botón y cambio de orden', async () => {
  const x = load();
  x.D.activate();
  await tick();
  fire(x, 'click', { 'data-wvd-pending': '' });
  assert.match(x.panel.innerHTML, /data-wvd-pending aria-pressed="true"/);
  assert.deepEqual(rowNames(x.panel.innerHTML), ['Alter.5678', 'Gato.1234', 'Rota.0000']);
  assert.equal(x.panel.focused, 1);
  fire(x, 'change', { 'data-wvd-sort': '' }, { value: 'name' });
  assert.deepEqual(rowNames(x.panel.innerHTML), ['Alter.5678', 'Gato.1234', 'Rota.0000']);
  assert.match(x.panel.innerHTML, /<option value="name" selected>nombre<\/option>/);
  fire(x, 'click', { 'data-wvd-pending': '' });
  fire(x, 'change', { 'data-wvd-sort': '' }, { value: 'keys' });
  assert.deepEqual(rowNames(x.panel.innerHTML), ['Gato.1234', 'Alter.5678', 'Farm.9012', 'Rota.0000']);
  fire(x, 'change', {}, { value: 'name' });
  assert.deepEqual(rowNames(x.panel.innerHTML), ['Gato.1234', 'Alter.5678', 'Farm.9012', 'Rota.0000'], 'otro select no cambia el orden');
});

test('refresh fuerza la API; una segunda activación no recarga; deactivate oculta y avisa al controlador', async () => {
  const x = load();
  x.D.activate();
  await tick();
  const api = () => x.calls.filter((c) => c[0] === 'getWVWeekly').length;
  const n = api();
  x.D.activate();
  await tick();
  assert.equal(api(), n, 'con datos, activate solo redibuja');
  await x.D.refresh(true);
  assert.deepEqual(x.calls.filter((c) => c[0] === 'getWVWeekly').slice(-1)[0][2], { nocache: true });
  x.D.deactivate();
  assert.equal(x.panel.attrs.hidden, 'hidden');
  assert.deepEqual(x.calls.at(-1), ['WV.hideObjectivesDashboard']);
});

test('sin cuentas lo dice y ofrece reintentar; todas al día; sin objetivos', async () => {
  let x = load({ keys: [] });
  x.D.activate();
  await tick();
  assert.match(x.panel.innerHTML, /role="alert">Todavía no agregaste cuentas: sumalas en Cuentas para ver sus objetivos semanales\.<\/p><button type="button" class="wvd-chip" data-wvd-retry>Reintentar<\/button>/);
  assert.equal(x.calls.filter((c) => c[0] === 'getWVWeekly').length, 0);
  x = load({ keys: [{ value: 'K3', label: 'Farm' }] });
  x.D.activate();
  await tick();
  assert.match(x.panel.innerHTML, /<b class="wvd-sm">—<\/b><em>todas al día<\/em>/);
  fire(x, 'click', { 'data-wvd-pending': '' });
  assert.match(x.panel.innerHTML, /Todas las cuentas tienen todo reclamado esta semana\./);
  const { P } = load();
  assert.equal(P.matrixHTML([], []), '<p class="wvd-empty">Ninguna cuenta tiene objetivos semanales todavía.</p>');
});

test('reglas: escapa nombres; sin endpoints nuevos; la única lectura cruda es la tolerada de gw2_keys; celular', () => {
  const { P } = load();
  const h = P.cellHTML({ claimed: false, pct: 50, progress: 1, total: 2 }) + P.matrixHTML([{ name: '<b>x</b>', objectives: [] }], [{ id: 1, title: '<i>t</i>', mode: 'pve', acclaim: 0 }]);
  assert.doesNotMatch(h, /<b>x<\/b>|<i>t<\/i>/);
  assert.match(h, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.doesNotMatch(SRC, /fetch\(|api\.guildwars2\.com|localStorage\.setItem|onclick=|onmouseover=/);
  assert.deepEqual(SRC.match(/localStorage\.\w+\([^)]*\)/g), ["localStorage.getItem('gw2_keys')"]);
  assert.match(P.CSS, /\.wvd-acc\{position:sticky;left:0/, 'la columna de cuentas queda fija al desplazar');
  assert.match(P.CSS, /@media \(max-width:900px\)\{\.wvd-stats\{grid-template-columns:1fr 1fr/);
});
