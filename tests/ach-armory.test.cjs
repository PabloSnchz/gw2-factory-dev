// Logros (BL-067, LOG-4): de una colección a su legendaria en la Armería.
// js/ach-armory.js se carga por js/modules.json (DEC-035) y usa las recetas que ya carga la Armería.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'ach-armory.js'), 'utf8');
const RECIPES = fs.readFileSync(path.join(ROOT, 'js', 'legendary-recipes.js'), 'utf8');

function node(id, attrs) {
  const n = { id, attrs: Object.assign({}, attrs || {}), parentNode: null };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  Object.defineProperty(n, 'hidden', { get: () => 'hidden' in n.attrs });
  return n;
}

// Recetas de prueba: A usa la pieza única 501 (y 600, que comparten A y B); B es parte de C.
const FAKE = {
  100: { name: 'Leg A', nameEs: 'Legendaria A', dataStatus: 'recipe', ingredients: [{ itemId: 501 }, { itemId: 600 }] },
  200: { name: 'Leg B', dataStatus: 'recipe', ingredients: [{ itemId: 600 }, { itemId: 700 }] },
  300: { name: 'Leg C', dataStatus: 'recipe', ingredients: [{ itemId: 200 }] },
  95093: { name: 'Marcador', dataStatus: 'placeholder' }
};
const PREC = { 700: { name: 'Precursor B', ingredients: [{ itemId: 701 }] } };

function load(opts = {}) {
  const nodes = {}, calls = [], docListeners = {};
  const win = {
    console: { info() {}, warn() {} }, setTimeout, clearTimeout, Math, JSON, Number, String, Object, Array,
    location: { hash: opts.hash || '#/account/achievements' },
    LegendaryRecipes: opts.real ? undefined : { byItem: FAKE, get: (id) => FAKE[Number(id)] || null },
    LegendaryPrecursors: opts.prec ? { get: (id) => PREC[Number(id)] || null } : undefined,
    LegendaryTracker: { openItemModal: (id) => calls.push(['open', id]) },
    LegendaryTreeUI: { ensurePrecursors: (cb) => { calls.push(['prec']); win._precCb = cb; } },
    AchCards: { render: () => calls.push(['cards']) },
    AchView: { render: () => calls.push(['view']) }
  };
  win.window = win;
  win.document = {
    readyState: 'complete',
    getElementById: (id) => nodes[id] || null,
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); }
  };
  const ctx = vm.createContext(win);
  if (opts.real) vm.runInContext(RECIPES, ctx);
  vm.runInContext(SRC, ctx);
  const showArmory = () => { nodes.legendaryArmoryPanel = node('legendaryArmoryPanel'); nodes.legendaryModeContent = node('legendaryModeContent'); };
  const click = (attrs, ev) => { const t = node('t', attrs); let prevented = false;
    (docListeners.click || []).forEach((f) => f(Object.assign({ target: t, button: 0, preventDefault() { prevented = true; } }, ev || {}))); return prevented; };
  return { win, A: win.AchArmory, P: win.AchArmory._pure, nodes, calls, showArmory, click };
}
const card = (...ids) => ({ r: { id: 1 }, meta: { rewards: ids.map((id) => (typeof id === 'object' ? id : { type: 'Item', id })) } });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('versión 1.0.0, por js/modules.json antes de ach-cards.js, dentro de 40 KB', () => {
  assert.match(SRC, /\* Versión: 1\.0\.0 /);
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).modules;
  const src = m.map((x) => x.src);
  assert.deepEqual(m.filter((x) => x.src === 'js/ach-armory.js'), [{ src: 'js/ach-armory.js', v: '1.0.0' }]);
  assert.ok(src.indexOf('js/ach-armory.js') < src.indexOf('js/ach-cards.js'), 'el enlace está desde la primera pintada');
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /ach-armory\.js/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
});

test('índice pieza → legendaria: la legendaria misma, sus piezas y, con precursores, las partes', () => {
  const x = load();
  const get = (id) => FAKE[id] || null;
  let idx = JSON.parse(JSON.stringify(x.P.buildIndex(Object.keys(FAKE), get)));
  assert.deepEqual(idx['501'], [100]);
  assert.deepEqual(idx['600'].sort(), [100, 200, 300], 'compartida (C la tiene adentro de B)');
  assert.deepEqual(idx['200'].sort(), [200, 300], 'B es legendaria y pieza de C');
  assert.equal(idx['95093'], undefined, 'el marcador no cuenta');
  assert.equal(idx['701'], undefined, 'sin precursores no baja');
  idx = JSON.parse(JSON.stringify(x.P.buildIndex(Object.keys(FAKE), (id) => FAKE[id] || PREC[id] || null)));
  assert.deepEqual(idx['701'].sort(), [200, 300], 'con precursores, las partes');
});

test('a qué legendaria lleva un logro: la recompensa legendaria o la pieza de una sola; nunca una compartida', () => {
  const x = load();
  const idx = x.P.buildIndex(Object.keys(FAKE), (id) => FAKE[id] || null);
  assert.equal(x.P.legendaryIdFor(card(501).meta, idx), 100);
  assert.equal(x.P.legendaryIdFor(card(600).meta, idx), null, 'compartida: no hay salto');
  assert.equal(x.P.legendaryIdFor(card(200).meta, idx), 200, 'si da la legendaria, va a esa');
  assert.equal(x.P.legendaryIdFor(card({ type: 'Title', id: 501 }, 999, 501).meta, idx), 100, 'solo ítems; sigue buscando');
  assert.equal(x.P.legendaryIdFor({}, idx), null);
});

test('con las recetas reales: Colmilloescarcha por su colmillo, y el Don de la Maestría no lleva a ninguna', () => {
  const x = load({ real: true });
  assert.deepEqual(JSON.parse(JSON.stringify(x.A.legendaryFor(card(29166)))), { id: 30684, name: 'Colmilloescarcha' });
  assert.equal(x.A.legendaryFor(card(19674)), null, 'Gift of Mastery: la comparten muchas');
  assert.equal(x.A.legendaryFor(card(19626)), null, 'Gift of Fortune: la comparten muchas');
  assert.equal(x.A.legendaryFor(card(30684)).id, 30684, 'la legendaria misma');
});

test('enlace accesible a la ruta de la Armería, con el nombre de la legendaria', () => {
  const x = load();
  assert.equal(x.A.linkHTML(card(501)), '<a class="achc-armory" href="#/account/legendary-armory" data-ach-armory="100" title="Ver «Legendaria A» en la Armería" aria-label="Ver la legendaria «Legendaria A» en la Armería">Ver en la Armería →</a>');
  assert.equal(x.A.linkHTML(card(600)), '');
  assert.equal(x.P.linkMarkup(1, '<b>').includes('<b>'), false, 'escapa el nombre');
});

test('el clic va a la Armería y, cuando está lista, abre la ficha de esa legendaria', async () => {
  const x = load();
  assert.equal(x.click({ 'data-ach-armory': '100' }), true, 'el clic normal lo maneja el módulo');
  assert.equal(x.win.location.hash, '#/account/legendary-armory');
  assert.deepEqual(x.calls.filter((c) => c[0] === 'open'), [], 'todavía no está la Armería');
  x.showArmory();
  await wait(150);
  assert.deepEqual(x.calls.filter((c) => c[0] === 'open'), [['open', 100]]);
  assert.equal(x.A._state.pending, null);
});

test('Ctrl+clic o el botón del medio: el enlace hace lo suyo; ya en la Armería, abre en el momento', () => {
  const x = load();
  assert.equal(x.click({ 'data-ach-armory': '100' }, { ctrlKey: true }), false);
  assert.equal(x.click({ 'data-ach-armory': '100' }, { button: 1 }), false);
  assert.equal(x.win.location.hash, '#/account/achievements');
  assert.equal(x.click({ 'data-otra-cosa': '1' }), false, 'otros clics no son míos');
  const y = load({ hash: '#/account/legendary-armory' });
  y.showArmory();
  assert.equal(y.A.go(200), true, 'ya en la Armería: abre en el momento');
  assert.deepEqual(y.calls.filter((c) => c[0] === 'open'), [['open', 200]]);
});

test('en «Colecciones legendarias» pide los precursores una sola vez y vuelve a pintar', () => {
  const x = load();
  x.A.wantDeep();
  x.A.wantDeep();
  assert.equal(x.calls.filter((c) => c[0] === 'prec').length, 1);
  x.win._precCb(true);
  assert.deepEqual(x.calls.filter((c) => c[0] === 'cards' || c[0] === 'view').map((c) => c[0]), ['cards', 'view']);
  const y = load({ prec: true });
  y.A.wantDeep();
  assert.equal(y.calls.filter((c) => c[0] === 'prec').length, 0, 'si ya están, no los pide');
  assert.equal(y.A.legendaryFor(card(701)), null, '701 es parte de B y de C: compartida');
});

test('reglas de la Bóveda: sin claves, sin API Key y sin pedidos propios', () => {
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|access_token|getSelectedToken|fetch\(/);
});
