// BL-059 SHV-3a: lo que noto de tu legendaria (js/shv-legendary.js), nivel N4, con el formato común de js/shv-core.js.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/shv-legendary.js');

function load() {
  const window = { console: { info() {} } };
  vm.runInNewContext(read('js/shv-core.js'), { window, globalThis: {} });
  vm.runInNewContext(SRC, { window, globalThis: {} });
  return window;
}
const plain = (x) => JSON.parse(JSON.stringify(x));
const ITEM = { id: 30698, name: 'Bifrost' };
// Árbol ya armado (precursores cargados): 3 materiales base, un vendedor y uno sin id.
const TREE = { needsPrecursors: false, status: 'recipe', node: {}, totals: {
  rows: [{ itemId: 19721, name: 'Ectoplasma', need: 250, stock: 0 },
         { itemId: 19976, name: 'Moneda mística', need: 100, stock: 0 },
         { itemId: 20797, name: 'Esquirla de espíritu', need: 200, stock: 0 }],
  vendor: [{ id: 19925, name: 'Obsidiana', count: 10 }, { id: 19925, name: 'Obsidiana', count: 5 }],
  sinId: [{ name: 'Reliquia', count: 1 }], unknown: [] } };
const RECIPE = { status: 'recipe', rows: [
  { itemId: 29185, name: 'El precursor', need: 1 }, { itemId: 19678, name: 'Don de maestría', need: 1 },
  { itemId: 19675, name: 'Trébol místico', need: 77 }] };
const PRICES = { 19721: 3000, 19976: { sells: { unit_price: 15000 } } };   // la esquirla no se vende

test('con el árbol cuento materiales base, oro de lo que se vende y lo que no se vende aparte', () => {
  const w = load();
  const e = plain(w.ShvLegendary.estimate({ item: ITEM, tree: TREE, recipe: RECIPE,
    stock: { 19721: 50, 20797: 999 }, prices: PRICES }));
  assert.equal(e.base, 'tree');
  assert.equal(e.total, 3);
  assert.equal(e.missingKinds, 2);
  assert.equal(e.missingUnits, 300);
  assert.equal(e.gold, 200 * 3000 + 100 * 15000);
  assert.equal(e.buyable, 2);
  assert.equal(e.untradeable, 0, 'la esquirla me sobra: no falta, no cuenta como «no se vende»');
  assert.equal(e.vendor, 1, 'el vendedor se cuenta una vez por id');
  assert.equal(e.unknown, 1);
});

test('lo que falta y no tiene precio no suma oro: va aparte, con su nombre', () => {
  const w = load();
  const e = w.ShvLegendary.estimate({ item: ITEM, tree: TREE, stock: {}, prices: PRICES });
  assert.equal(e.missingKinds, 3);
  assert.equal(e.untradeable, 1);
  assert.deepEqual(plain(e.untradeableNames), ['Esquirla de espíritu']);
  assert.equal(e.gold, 250 * 3000 + 100 * 15000);
});

test('sin precios no invento oro ni digo que algo no se vende', () => {
  const w = load();
  const e = w.ShvLegendary.estimate({ item: ITEM, tree: TREE, stock: {}, prices: null });
  assert.equal(e.priced, false);
  assert.equal(e.gold, 0);
  assert.equal(e.untradeable, 0);
  const o = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: {}, prices: null })[0];
  assert.equal(o.text.length, 1);
  assert.doesNotMatch(o.text.join(' '), /oro|no se vende/);
});

test('sin precursores (D2) cuento la receta directa y lo digo', () => {
  const w = load();
  const pend = { needsPrecursors: true, status: 'pending', node: null, totals: { rows: [] } };
  const e = w.ShvLegendary.estimate({ item: ITEM, tree: pend, recipe: RECIPE, stock: { 19675: 77 }, prices: {} });
  assert.equal(e.base, 'recipe');
  assert.equal(e.total, 3);
  assert.equal(e.missingKinds, 2);
  const o = w.ShvLegendary.observe({ item: ITEM, tree: pend, recipe: RECIPE, stock: { 19675: 77 }, prices: {} })[0];
  assert.match(o.text[0], /^Para Bifrost te faltan 2 de los 3 ingredientes de la receta directa/);
  assert.equal(o.text[1], '2 no se venden: se fabrican o se consiguen jugando.');
  assert.match(o.basis.source, /la receta de la Armería/);
  // Un árbol que avisa que le faltan precursores no se usa aunque traiga filas.
  const half = { needsPrecursors: true, status: 'recipe', totals: TREE.totals };
  assert.equal(w.ShvLegendary.estimate({ item: ITEM, tree: half, recipe: RECIPE, stock: {}, prices: {} }).base, 'recipe');
});

test('la frase completa, con el formato común y su fundamento', () => {
  const w = load();
  const AT = new Date(2026, 9, 27, 4, 10).getTime();
  const list = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: {}, prices: PRICES }, { at: AT });
  const o = w.ShvCore.pick(list);
  assert.equal(o.module, 'legendary');
  assert.equal(o.id, 'falta:30698');
  assert.equal(o.priority, 'media');
  assert.equal(o.kind, 'explica');
  assert.deepEqual(plain(o.text), [
    'Para Bifrost te faltan 3 materiales base (de 3).',
    'Comprando lo que se vende: ~225 oro al precio del Bazar.',
    '1 no se vende: se fabrica o se consigue jugando.']);
  assert.equal(o.action.label, 'Ver qué me falta');
  assert.equal(o.action.act, 'legendary-open:30698');
  assert.equal(w.ShvCore.basisText(o.basis, AT),
    'tu inventario (banco, materiales y personajes) y el árbol de fabricación, con los precios del Bazar · hoy 04:10');
});

test('singular: «te falta 1 material base»', () => {
  const w = load();
  const o = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: { 19721: 250, 19976: 100 }, prices: PRICES })[0];
  assert.equal(o.text[0], 'Para Bifrost te falta 1 material base (de 3).');
});

test('si ya tenés todo te lo digo, sin oro', () => {
  const w = load();
  const o = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: { 19721: 250, 19976: 100, 20797: 200 }, prices: PRICES })[0];
  assert.equal(o.kind, 'saluda');
  assert.deepEqual(plain(o.text), ['Para Bifrost ya tenés todos los materiales base: lo que queda es fabricar.']);
});

test('si no sé, no hablo: sin legendaria, sin receta o sin filas', () => {
  const w = load();
  const L = w.ShvLegendary;
  assert.deepEqual(plain(L.observe(null)), []);
  assert.deepEqual(plain(L.observe({ item: ITEM })), []);
  assert.deepEqual(plain(L.observe({ item: ITEM, recipe: { status: 'no_recipe', rows: [] } })), []);
  assert.deepEqual(plain(L.observe({ item: { name: 'x' }, tree: TREE })), []);
  assert.equal(L.estimate({ item: ITEM, tree: { status: 'recipe', totals: { rows: [{ itemId: 0, need: 5 }] } } }).total, 0,
    'un ingrediente sin id no se puede contar contra el inventario');
  assert.deepEqual(plain(L.observe({ item: ITEM, tree: { status: 'recipe', totals: { rows: [{ itemId: 0, need: 5 }] } } })), []);
});

test('el stock de más no resta, las filas repetidas se suman y los precios raros valen 0', () => {
  const w = load();
  const L = w.ShvLegendary;
  const tree = { status: 'recipe', totals: { rows: [{ itemId: 1, name: 'A', need: 10 }, { itemId: 1, name: 'A', need: 15 }, { itemId: 2, name: 'B', need: 0 }] } };
  const e = L.estimate({ item: ITEM, tree, stock: { 1: -4 }, prices: { 1: 'x' } });
  assert.equal(e.total, 1);
  assert.equal(e.missingUnits, 25);
  assert.equal(e.untradeable, 1);
  assert.equal(L.priceOf({ 3: { sells: { unit_price: 0 } }, 4: { sell: 7 }, 5: NaN }, 3), 0);
  assert.equal(L.priceOf({ 4: { sell: 7 } }, 4), 7);
  assert.equal(L.priceOf({ 5: NaN }, 5), 0);
  assert.equal(L.priceOf(null, 5), 0);
});

test('el oro se redondea y lleva punto de miles; menos de 1 oro se dice así', () => {
  const w = load();
  const g = w.ShvLegendary.goldText;
  assert.equal(g(12345678), '~1.235 oro');
  assert.equal(g(1234567890), '~123.457 oro');
  assert.equal(g(15000), '~2 oro');
  assert.equal(g(4999), 'menos de 1 oro');
});

test('es puro e inerte: no toca el DOM, no guarda, no llama a la API y no está en el manifiesto todavía', () => {
  assert.doesNotMatch(SRC, /document|localStorage|fetch\(|GW2Api|XMLHttpRequest|addEventListener/);
  const mods = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.equal(mods.includes('js/shv-legendary.js'), false);
  assert.ok(Buffer.byteLength(SRC) < 20 * 1024, 'presupuesto de 20 KB');
  assert.match(SRC, /Versión: 1\.0\.0/);
  assert.equal(load().ShvLegendary.version, '1.0.0');
});
