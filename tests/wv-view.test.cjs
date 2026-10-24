// Cámara del Brujo (BL-064, CAM-1): cabecera nueva y tres pestañas sobre el controlador de siempre.
// js/wv-view.js se carga por js/modules.json (DEC-035) y maneja los botones viejos, que quedan ocultos.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'wv-view.js'), 'utf8');
const UTC = (s) => Date.parse(s);
const H = 3600000, MIN = 60000;

// Nodo mínimo: atributos, hidden, click y eventos.
function node(id, attrs) {
  const n = { id, attrs: Object.assign({}, attrs || {}), listeners: {}, clicks: 0, style: {}, children: [], _h: '' };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.removeAttribute = (k) => { delete n.attrs[k]; };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  n.click = () => { n.clicks++; (n.onclick || (() => {}))(); };
  Object.defineProperty(n, 'hidden', { get: () => 'hidden' in n.attrs, set: (v) => { if (v) n.attrs.hidden = ''; else delete n.attrs.hidden; } });
  Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
  n.querySelectorAll = () => [];
  n.querySelector = () => null;
  return n;
}

const OBJ = (list, meta) => Object.assign({ objectives: list }, meta || {});
const o = (cur, tot, claimed) => ({ progress_current: cur, progress_complete: tot, claimed: !!claimed });

function load(opts = {}) {
  const nodes = {};
  const add = (n) => { nodes[n.id] = n; return n; };
  const panel = add(node('wvPanel'));
  panel.firstChild = null;
  panel.insertBefore = (c) => { panel.children.unshift(c); nodes[c.id] = c; };
  const btn = (id, sel) => add(node(id, { 'aria-selected': sel ? 'true' : 'false' }));
  btn('wvTabBtnDaily', opts.tab === undefined || opts.tab === 'daily');
  btn('wvTabBtnWeekly', opts.tab === 'weekly');
  btn('wvTabBtnSpecial', opts.tab === 'special');
  btn('wvTabBtnShop', opts.tab === 'shop');
  add(node('wvObjectivesDashboardPanel', opts.dash ? {} : { hidden: '' }));
  if (opts.pd) add(node('wvPDPanel', {}));
  const key = add(node('keySelectGlobal')); key.value = opts.token === undefined ? 'KEY-1' : opts.token;
  const calls = [];
  const head = { children: [], appendChild(c) { this.children.push(c); nodes[c.id] = c; } };
  const res = (v) => Promise.resolve(v);
  const win = {
    console: { info() {}, log() {}, warn() {} },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {}, Promise, Date, Math, JSON,
    location: { hash: '#/account/wizards-vault' },
    toast: (k, m) => calls.push(['toast', k, m]),
    Storage: { STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys' }, get: (k) => (k === 'gn:account:keys' ? [{}, {}, {}, {}, {}] : null) },
    GW2Api: {
      getWVSeason: () => res({ title: 'Ecos de Tyria', end: '2099-12-14T17:00:00Z' }),
      getWVAccount: () => res({ astral_acclaim: 2340 }),
      getAccountWVListings: () => res([{ id: 1, cost: 600, purchased: 2, purchase_limit: 3 }, { id: 2, cost: 200, purchased: 0, purchase_limit: 5 }]),
      getWVDaily: () => res(OBJ([o(3, 3), o(1, 1, true), o(5, 10), o(2, 2, true), o(1, 1, true), o(0, 1), o(1, 1, true), o(4, 4, true)], { meta_progress_current: 3, meta_progress_complete: 4, meta_reward_astral: 150 })),
      getWVWeekly: () => res(OBJ([o(1, 1), o(1, 2)])),
      getWVSpecial: () => res(OBJ([]))
    },
    WV: {
      __getShopState: () => opts.shop || null,
      refreshObjectives: (f) => calls.push(['WV.refreshObjectives', f]),
      hideObjectivesDashboard: () => { calls.push(['WV.hideObjectivesDashboard']); nodes.wvObjectivesDashboardPanel.hidden = true; }
    },
    WVShopUI: { refresh: (f) => calls.push(['WVShopUI.refresh', f]) },
    WVObjectivesDashboard: { refresh: (f) => calls.push(['WVObjectivesDashboard.refresh', f]) },
    WVPurchaseDetail: {
      show: () => calls.push(['PD.show']),
      hide: () => calls.push(['PD.hide']),
      refresh: (f) => calls.push(['PD.refresh', f])
    }
  };
  win.window = win;
  win.document = {
    readyState: 'complete', head,
    getElementById: (id) => nodes[id] || null,
    createElement: () => node(''),
    addEventListener() {}
  };
  win.addEventListener = () => {};
  // Los ids se asignan después de createElement: el nodo se registra al insertarlo.
  vm.runInContext(SRC, vm.createContext(win));
  // Los objetos que devuelve el contexto vm son de otro «realm»: se comparan por valor.
  const P = {};
  Object.keys(win.WVView._pure).forEach((k) => {
    const v = win.WVView._pure[k];
    P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? JSON.parse(JSON.stringify(r)) : r; };
  });
  return { win, nodes, calls, V: win.WVView, P, host: () => nodes.wvxHead };
}
const tick = () => new Promise((r) => setTimeout(r, 5));
const fire = (x, type, attrs, ev) => {
  const target = node('t', attrs); target.parentNode = x.host();
  (x.host().listeners[type] || []).forEach((f) => f(Object.assign({ target, preventDefault() {} }, ev || {})));
};

test('versión 1.2.0, la misma que pide js/modules.json', () => {
  assert.match(SRC, /\* Versión: 1\.2\.0 /);
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8'));
  assert.deepEqual(m.modules.filter((x) => x.src === 'js/wv-view.js'), [{ src: 'js/wv-view.js', v: '1.2.0' }]);
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /wv-view\.js/, 'se carga por el manifiesto, no por index.html');
  assert.match(SRC, /readyState === 'loading'[^\n]*DOMContentLoaded', init\);\s*else if \(doc\) init\(\);/, 'arranca aunque cargue tarde');
});

test('resets: diario 00:00 UTC y semanal lunes 07:30 UTC', () => {
  const { P } = load();
  assert.equal(P.nextDailyReset(UTC('2026-10-23T23:59:00Z')), UTC('2026-10-24T00:00:00Z'));
  assert.equal(P.nextDailyReset(UTC('2026-10-24T00:00:00Z')), UTC('2026-10-25T00:00:00Z'));
  assert.equal(P.nextWeeklyReset(UTC('2026-10-26T07:00:00Z')), UTC('2026-10-26T07:30:00Z'), 'lunes antes de las 07:30: hoy');
  assert.equal(P.nextWeeklyReset(UTC('2026-10-26T07:30:00Z')), UTC('2026-11-02T07:30:00Z'), 'lunes a las 07:30: la semana que viene');
  assert.equal(P.nextWeeklyReset(UTC('2026-10-25T23:00:00Z')), UTC('2026-10-26T07:30:00Z'), 'domingo');
  assert.equal(P.fmtLeft(4 * 24 * H + 8 * H + 5 * MIN), '4 d 8 h');
  assert.equal(P.fmtLeft(3 * H + 12 * MIN), '3 h 12 min');
  assert.equal(P.fmtLeft(12 * MIN + 59000), '12 min');
  assert.equal(P.fmtLeft(30000), 'menos de 1 min');
  assert.equal(P.fmtInt(2340), '2.340');
  assert.equal(P.fmtInt(-1380), '−1.380');
});

test('temporada: nombre, fin en fecha UTC y días que quedan', () => {
  const { P } = load();
  const s = { title: 'Ecos de Tyria', end: '2026-12-14T17:00:00Z' };
  assert.equal(P.seasonLine(s, UTC('2026-10-23T12:00:00Z')), 'Temporada «Ecos de Tyria» · termina el 14/12 (en 52 d)');
  assert.equal(P.seasonLine(s, UTC('2026-12-14T15:00:00Z')), 'Temporada «Ecos de Tyria» · termina el 14/12 (en 2 h 0 min)');
  assert.equal(P.seasonLine(s, UTC('2026-12-15T00:00:00Z')), 'Temporada «Ecos de Tyria» · terminó el 14/12');
  assert.equal(P.seasonLine({ title: '—', end: null }, 0), 'Temporada actual');
  assert.equal(P.seasonLine(null, 0), 'Temporada actual');
});

test('objetivos: completados, listos para reclamar y la recompensa del día (no «de la temporada»)', () => {
  const { P } = load();
  const c = P.countObjectives(OBJ([o(3, 3), o(1, 1, true), o(5, 10), o(0, 0)], { meta_progress_current: 3, meta_progress_complete: 4, meta_reward_astral: 150 }));
  assert.deepEqual(c, { total: 4, done: 2, ready: 1, claimed: 1, meta: { cur: 3, total: 4, reward: 150 }, aa: 0, readyAA: 0 });
  assert.deepEqual(P.countObjectives(OBJ([{ progress: 1, total: 0 }])).done, 1, 'sin total: con algo de avance cuenta como hecho');
  assert.deepEqual(P.countObjectives(null), { total: 0, done: 0, ready: 0, claimed: 0, meta: null, aa: 0, readyAA: 0 });
});

test('AA: gastada según la API y reservada para lo fijado (sin lo marcado ni lo comprado)', () => {
  const { P } = load();
  const rows = [{ id: 1, cost: 600, purchased: 1, purchase_limit: 3 }, { id: 2, cost: 200, purchased: 2, purchase_limit: 5 }, { id: 3, cost: 50, purchased: 4, purchase_limit: null }];
  assert.equal(P.spentAA(rows), 600 + 400 + 200);
  assert.equal(P.reservedAA(rows, { 1: true, 2: true, 3: true }, { 1: 1 }), 600 * 1 + 200 * 3, 'el ilimitado no reserva');
  assert.equal(P.reservedAA(rows, { 2: true }, { 2: 9 }), 0, 'lo marcado de más no da negativo');
  assert.equal(P.spentAA(null), 0);
});

test('vista activa: Compras y el dashboard son «Todas las cuentas»; si no, la pestaña del controlador', () => {
  const { P } = load();
  assert.deepEqual(P.activeView({ pdOpen: true, dashOpen: true, lastTab: 'shop' }), { tab: 'accounts', sub: 'purchases' });
  assert.deepEqual(P.activeView({ dashOpen: true, lastTab: 'daily' }), { tab: 'accounts', sub: 'weekly' });
  assert.deepEqual(P.activeView({ lastTab: 'shop' }), { tab: 'shop', sub: null });
  assert.deepEqual(P.activeView({ lastTab: 'special' }), { tab: 'objectives', sub: 'special' });
  assert.deepEqual(P.activeView({ lastTab: 'raro' }), { tab: 'objectives', sub: 'daily' });
});

test('cabecera: temporada, resets, AA, hoy, semana, gastada y la ayuda a la vista', async () => {
  const x = load();
  await tick();
  const h = x.host().innerHTML;
  assert.ok(x.nodes['wv-view-css'] || x.win.document.head.children.length, 'inyecta su CSS');
  assert.match(x.P.CSS, /#wvPanel>\.panel-head,#wvPanel>\.wv-season,#wvPanel>nav\.tabs\{display:none!important\}/, 'oculta la cabecera y los botones viejos');
  assert.match(h, /<h2 id="wvxTitle">Cámara del Brujo<\/h2><p>Temporada «Ecos de Tyria» · termina el 14\/12 \(en \d+ d\)<\/p>/);
  assert.match(h, /Reset diario <b data-wvx-clock="daily">en /);
  assert.match(h, /Semanal <b data-wvx-clock="weekly">lun 07:30 UTC · en /);
  assert.match(h, /<small>AA disponible<\/small><b>2\.340<\/b><em>para gastar en la Tienda<\/em>/);
  assert.match(h, /<small>Hoy<\/small><b>6 <span>de 8<\/span><\/b><div class="wvx-bar" aria-hidden="true"><i style="width:75%">/);
  assert.match(h, /<small>Esta semana<\/small><b>1 <span>de 2<\/span>/);
  assert.match(h, /<small>Gastada en la temporada<\/small><b>1\.200<\/b>/);
  assert.match(h, /data-wvx="why" aria-expanded="false" aria-controls="wvxWhy">ⓘ ¿Por qué tarda en actualizarse\?<\/button><p id="wvxWhy" hidden>La API de Guild Wars 2 actualiza los objetivos recién cuando entrás al juego/);
  assert.doesNotMatch(h, /Meta de la temporada/);
});

test('cabecera sin API Key ni datos: guiones, sin inventar números', async () => {
  const x = load({ token: '' });
  await tick();
  const h = x.host().innerHTML;
  assert.match(h, /<small>AA disponible<\/small><b>—<\/b>/);
  assert.match(h, /<small>Hoy<\/small><b>—<\/b><em>sin datos todavía<\/em>/);
  assert.match(h, /<small>Gastada en la temporada<\/small><b>—<\/b>/);
  assert.match(h, /<p>Temporada actual<\/p>/);
});

test('una semana sin objetivos todavía no muestra «0 de 0» ni una barra vacía', () => {
  const { P } = load();
  const h = P.headHTML({ view: { tab: 'shop', sub: null }, season: 'Temporada actual', dailyLeft: '1 h 0 min', weeklyLeft: '1 d 0 h',
    aa: 0, aaNote: '', daily: { total: 0, done: 0 }, weekly: { total: 2, done: 0 }, spent: 0, counts: {}, ready: 0, pinned: 0, accounts: 0 });
  assert.match(h, /<small>Hoy<\/small><b>—<\/b><em>sin datos todavía<\/em>/);
  assert.match(h, /<small>Esta semana<\/small><b>0 <span>de 2<\/span><\/b><div class="wvx-bar" aria-hidden="true"><i style="width:0%">/);
  assert.doesNotMatch(h, /NaN/);
});

test('con la Tienda cargada usa su AA y dice cuánto queda reservado para lo fijado', async () => {
  const shop = { aa: 900, merged: [{ id: 1, cost: 600, purchased: 1, purchase_limit: 3 }], pinned: { 1: true }, marks: {} };
  const x = load({ shop, tab: 'shop' });
  await tick();
  const h = x.host().innerHTML;
  assert.match(h, /<small>AA disponible<\/small><b>900<\/b><em>reservada para fijados: 1\.200<\/em>/);
  assert.match(h, /data-wvx-tab="shop" aria-selected="true" aria-controls="wvTabShop" tabindex="0">Tienda<span class="wvx-badge">1 fijado<\/span>/);
});

test('tres pestañas con contadores; Objetivos trae el segmento Diarias, Semanales y Especiales', async () => {
  const x = load();
  await tick();
  const h = x.host().innerHTML;
  assert.match(h, /<div class="wvx-tabs" role="tablist" aria-label="Secciones de la Cámara del Brujo">/);
  assert.match(h, /id="wvxTab-objectives" data-wvx-tab="objectives" aria-selected="true" aria-controls="wvTabDaily" tabindex="0">Objetivos<span class="wvx-badge wvx-badge--gold">2 listos<\/span>/);
  assert.match(h, /data-wvx-tab="shop" aria-selected="false" aria-controls="wvTabShop" tabindex="-1">Tienda<\/button>/);
  assert.match(h, /data-wvx-tab="accounts" aria-selected="false" aria-controls="wvObjectivesDashboardPanel" tabindex="-1">Todas las cuentas<span class="wvx-badge">5<\/span>/);
  assert.match(h, /data-wvx-sub="daily" aria-pressed="true">Diarias<em>6\/8<\/em>/);
  assert.match(h, /data-wvx-sub="weekly" aria-pressed="false">Semanales<em>1\/2<\/em>/);
  assert.match(h, /data-wvx-sub="special" aria-pressed="false">Especiales<\/button>/, 'sin objetivos especiales, sin contador');
  assert.equal((h.match(/role="tab"/g) || []).length, 3);
});

test('navegar: cada pestaña usa el botón o la ruta de siempre', async () => {
  let x = load();
  await tick();
  fire(x, 'click', { 'data-wvx-tab': 'shop' });
  assert.equal(x.nodes.wvTabBtnShop.clicks, 1);
  fire(x, 'click', { 'data-wvx-sub': 'weekly' });
  assert.equal(x.nodes.wvTabBtnWeekly.clicks, 1);
  fire(x, 'click', { 'data-wvx-tab': 'accounts' });
  assert.equal(x.win.location.hash, '#/account/wizards-vault/objectives-dashboard');

  x = load({ dash: true });
  await tick();
  assert.match(x.host().innerHTML, /data-wvx-tab="accounts" aria-selected="true"[\s\S]*data-wvx-sub="weekly" aria-pressed="true">Objetivos semanales[\s\S]*data-wvx-sub="purchases" aria-pressed="false">Compras fijadas/);
  fire(x, 'click', { 'data-wvx-sub': 'purchases' });
  assert.deepEqual(x.calls.filter((c) => c[0] !== 'toast').map((c) => c[0]), ['WV.hideObjectivesDashboard', 'PD.show'], 'cierra el dashboard antes de abrir Compras');
  assert.equal(x.win.location.hash, '#/account/wizards-vault');

  x = load({ pd: true });
  await tick();
  assert.match(x.host().innerHTML, /data-wvx-sub="purchases" aria-pressed="true"/);
  fire(x, 'click', { 'data-wvx-tab': 'objectives' });
  assert.deepEqual(x.calls.map((c) => c[0]), ['PD.hide'], 'sale de Compras antes de volver a Objetivos');
  assert.equal(x.nodes.wvTabBtnDaily.clicks, 1);
});

test('teclado: flechas, Inicio y Fin recorren las tres pestañas', async () => {
  const x = load();
  await tick();
  fire(x, 'keydown', { 'data-wvx-tab': 'objectives' }, { key: 'ArrowRight' });
  assert.equal(x.nodes.wvTabBtnShop.clicks, 1);
  fire(x, 'keydown', { 'data-wvx-tab': 'objectives' }, { key: 'ArrowLeft' });
  assert.equal(x.win.location.hash, '#/account/wizards-vault/objectives-dashboard');
  fire(x, 'keydown', { 'data-wvx-tab': 'shop' }, { key: 'Home' });
  assert.equal(x.nodes.wvTabBtnDaily.clicks, 1);
  fire(x, 'keydown', { 'data-wvx-tab': 'shop' }, { key: 'Enter' });
  assert.equal(x.nodes.wvTabBtnShop.clicks, 1, 'otras teclas no navegan');
});

test('«Actualizar» refresca lo que estás mirando; «¿Por qué tarda?» se abre y se cierra', async () => {
  for (const [opts, want] of [[{}, 'WV.refreshObjectives'], [{ tab: 'shop' }, 'WVShopUI.refresh'], [{ dash: true }, 'WVObjectivesDashboard.refresh'], [{ pd: true }, 'PD.refresh']]) {
    const x = load(opts);
    await tick();
    fire(x, 'click', { 'data-wvx': 'refresh' });
    assert.deepEqual(x.calls[0], [want, true], JSON.stringify(opts));
    assert.equal(x.calls[1][0], 'toast');
  }
  const x = load();
  await tick();
  fire(x, 'click', { 'data-wvx': 'why' });
  assert.match(x.host().innerHTML, /aria-expanded="true" aria-controls="wvxWhy">[^<]*<\/button><p id="wvxWhy">/);
  fire(x, 'click', { 'data-wvx': 'why' });
  assert.match(x.host().innerHTML, /<p id="wvxWhy" hidden>/);
});

test('reglas de la Bóveda: Storage para las cuentas, nada de claves crudas ni endpoints nuevos', () => {
  assert.doesNotMatch(SRC, /localStorage/);
  assert.doesNotMatch(SRC, /fetch\(|api\.guildwars2\.com/);
  assert.match(SRC, /S\.get\(S\.STORAGE_KEYS\.ACCOUNT_KEYS\)/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'archivo nuevo dentro del presupuesto de 40 KB');
});
