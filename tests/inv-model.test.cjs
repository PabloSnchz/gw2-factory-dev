// Modelo de Inventario y Personajes (BL-070, INV-1): categorías oficiales de materiales, los sets del Multicuenta
// verificados contra la API (RUN-041 y RUN-042, 2026-10-25), «¿dónde está?» y la tabla del Multicuenta.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/inv-model.js');
const win = { console: { info() {} } };
win.window = win;
vm.runInContext(SRC, vm.createContext(win), { filename: 'js/inv-model.js' });
// El modelo corre en otro contexto de vm: sus arreglos y objetos se pasan a este contexto para compararlos.
const RAW = win.InvModel._pure;
const plain = (x) => (x === undefined ? x : JSON.parse(JSON.stringify(x)));
const M = {};
Object.keys(RAW).forEach((k) => { M[k] = typeof RAW[k] === 'function' ? (...a) => plain(RAW[k](...a)) : plain(RAW[k]); });
const CATS = JSON.parse(read('assets/data/inventory/material-categories.json')).categories;
const SETS = JSON.parse(read('assets/data/inventory-sets.json')).sets;

test('el archivo entra en el presupuesto, declara su versión y no pide, no guarda ni toca el DOM', () => {
  assert.ok(Buffer.byteLength(SRC) < 40 * 1024, 'menos de 40 KB (DEC-035)');
  const v = SRC.match(/Versión: (\d+\.\d+\.\d+)/)[1];
  assert.equal(win.InvModel.version, v);
  assert.doesNotMatch(SRC, /\bfetch\(|localStorage|sessionStorage|document\./);
});

test('categorías de materiales: las 9 de /v2/materials, en español y en el orden del juego', () => {
  assert.deepEqual(CATS.map((c) => c.id), [6, 29, 37, 46, 30, 5, 49, 50, 38]);
  assert.deepEqual(CATS.map((c) => c.order), [1, 2, 3, 4, 5, 6, 7, 9, 10]);
  assert.equal(CATS.find((c) => c.id === 30).name, 'Gemas y joyas');
  assert.equal(CATS.find((c) => c.id === 50).name, 'Materiales de escribanía');
  CATS.forEach((c) => assert.match(c.name, /^(Materiales|Gemas|Ingredientes)/));
});

test('sets del Multicuenta: los 3 de siempre, con sus ítems, sin repetidos', () => {
  assert.deepEqual(SETS.map((s) => s.id), ['high_value', 'crafting_materials', 'symbols_etc']);
  assert.deepEqual(SETS.map((s) => s.name), ['Alto Valor', 'Materiales de artesanía', 'Símbolos y demás']);
  assert.equal(SETS[0].items.length, 8);
  assert.equal(SETS[2].items.length, 32);
  assert.deepEqual(Object.keys(SETS[1].tiers), ['t6', 't5', 't4', 't3']);
  assert.deepEqual(SETS[1].defaultTiers, ['t6']);
  const all = [];
  SETS.forEach((s) => (s.items || []).forEach((i) => all.push(i.id)));
  Object.values(SETS[1].tiers).forEach((t) => { assert.equal(t.items.length, 8); t.items.forEach((i) => all.push(i.id)); });
  assert.equal(new Set(all).size, all.length, 'ningún ítem en dos lugares');
});

test('tiers verificados en la API: viales y tótems de cada tier (RUN-042)', () => {
  const tier = (k) => Object.fromEntries(SETS[1].tiers[k].items.map((i) => [i.id, i.name]));
  // id → nombre en español de /v2/items (inglés entre paréntesis)
  const want = {
    t6: { 24295: 'Vial de sangre poderosa', 24300: 'Tótem elaborado' },       // Powerful Blood, Elaborate Totem
    t5: { 24294: 'Vial de sangre potente', 24299: 'Tótem intrincado' },       // Potent Blood, Intricate Totem
    t4: { 24293: 'Vial de sangre espesa', 24363: 'Tótem grabado' },           // Thick Blood, Engraved Totem
    t3: { 24292: 'Vial de sangre', 24298: 'Tótem' }                            // Blood, Totem
  };
  Object.entries(want).forEach(([k, m]) => Object.entries(m).forEach(([id, name]) => assert.equal(tier(k)[id], name, k + ' ' + id)));
  assert.ok(!(24297 in tier('t3')), 'el tótem pequeño (24297) es Tier 2, no Tier 3');
});

test('materiales: por la categoría de la API, en orden; los que están en 0 cuentan como lugar pero no como guardados', () => {
  const g = M.groupMaterials([
    { id: 1, category: 30, count: 5 }, { id: 2, category: 6, count: 0 }, { id: 3, category: 6, count: 250 },
    { id: 4, category: 6, count: 900 }, { id: 5, category: 777, count: 3 }
  ], CATS);
  assert.deepEqual(g.map((c) => c.id).slice(0, 2), [6, 29]);
  const basic = g[0];
  assert.deepEqual(basic.items.map((i) => i.id), [4, 3], 'de más a menos');
  assert.equal(basic.held, 2);
  assert.equal(basic.slots, 3);
  const last = g[g.length - 1];
  assert.equal(last.name, 'Otros materiales', 'una categoría nueva no se pierde');
  assert.deepEqual(last.items, [{ id: 5, count: 3 }]);
});

test('banco: ocupado, libre y pestañas de 30; si no se pudo leer, sin datos', () => {
  const bank = Array.from({ length: 60 }, (_, i) => (i % 3 ? { id: 10, count: 1 } : null));
  assert.deepEqual(M.bankSummary(bank), { used: 40, total: 60, free: 20, tabs: 2 });
  assert.deepEqual(M.bankSummary(null), { used: null, total: null, free: null, tabs: null });
  assert.equal(M.bankTab(0), 1); assert.equal(M.bankTab(29), 1); assert.equal(M.bankTab(30), 2);
});

test('¿dónde está?: suma depósito, banco con su pestaña, ranuras compartidas y bolsas de cada personaje', () => {
  const idx = M.indexPlaces({
    materials: [{ id: 19721, count: 1200 }, { id: 19976, count: 0 }],
    bank: [null, { id: 19721, count: 20 }].concat(Array(60).fill(null), [{ id: 19721, count: 10 }]),
    shared: [{ id: 19721, count: 250 }, null],
    characters: [
      { name: 'Lyra', bags: [{ inventory: [{ id: 19721, count: 3 }, null] }, null, { inventory: [{ id: 19721, count: 1 }] }] },
      { name: 'Ash', bags: [{ inventory: [{ id: 19675, count: 7 }] }] }
    ]
  });
  assert.deepEqual(idx.unread, []);
  const p = M.placesOf(idx, 19721);
  assert.equal(p.total, 1484);
  assert.deepEqual(p.places.map((x) => [x.kind, x.name, x.tab, x.count]), [
    ['materials', null, null, 1200], ['bank', null, 1, 20], ['bank', null, 3, 10], ['shared', null, null, 250], ['char', 'Lyra', null, 4]
  ]);
  assert.equal(M.placesOf(idx, 19976).total, 0, 'lo que está en 0 no figura');
  assert.equal(M.placesOf(idx, 19675).places[0].name, 'Ash');
});

test('¿dónde está?: una fuente que no se pudo leer no suma y queda dicha', () => {
  const idx = M.indexPlaces({ materials: [{ id: 1, count: 5 }], bank: null, shared: [], characters: null });
  assert.deepEqual(idx.unread, ['bank', 'characters']);
  assert.equal(M.placesOf(idx, 1).total, 5);
});

test('buscar: sin distinguir mayúsculas ni tildes; primero lo que empieza igual, después lo que más tenés', () => {
  const idx = M.indexPlaces({ materials: [{ id: 1, count: 2 }, { id: 2, count: 90 }, { id: 3, count: 5 }, { id: 4, count: 1 }], bank: [], shared: [], characters: [] });
  const meta = { 1: { name: 'Trébol místico' }, 2: { name: 'Moneda mística' }, 3: { name: 'Pegote de ectoplasma' }, 4: { name: 'Polvo de cristal' } };
  assert.deepEqual(M.search(idx, meta, 'p').map((r) => r.id), [3, 4], 'los dos empiezan con «p»: primero el que más tenés');
  assert.deepEqual(M.search(idx, meta, 'o').map((r) => r.id), [2, 3, 1, 4], 'ninguno empieza con «o»: de más a menos');
  assert.deepEqual(M.search(idx, meta, 'pol').map((r) => r.id), [4], 'solo el que coincide');
  const meta2 = Object.assign({}, meta, { 2: { name: 'Esencia de pegote' } });
  assert.deepEqual(M.search(idx, meta2, 'pegote').map((r) => r.id), [3, 2], 'empieza igual gana aunque tengas menos');
  assert.deepEqual(M.search(idx, meta, 'trebol').map((r) => r.id), [1]);
  assert.deepEqual(M.search(idx, meta, 'MÍST').map((r) => r.id), [2, 1]);
  assert.deepEqual(M.search(idx, meta, 'mist').map((r) => r.id), [2, 1]);
  assert.deepEqual(M.search(idx, meta, 'tre').map((r) => r.id), [1], 'empieza igual gana');
  assert.deepEqual(M.search(idx, meta, '   '), []);
});

test('sets con tiers: los elegidos, del más alto al más bajo; sin elegir, los de siempre (Tier 6)', () => {
  const s = SETS[1];
  assert.equal(M.setItems(s).length, 8);
  assert.ok(M.setItems(s).every((i) => i.tier === 't6'));
  const two = M.setItems(s, ['t3', 't5']);
  assert.equal(two.length, 16);
  assert.equal(two[0].tier, 't5'); assert.equal(two[15].tier, 't3');
  const desordenado = { tiers: { t3: { items: [{ id: 3 }] }, t6: { items: [{ id: 6 }] }, t5: { items: [{ id: 5 }] } } };
  assert.deepEqual(M.setItems(desordenado, ['t3', 't6', 't5']).map((i) => i.id), [6, 5, 3], 'del tier más alto al más bajo');
  assert.equal(M.setItems(SETS[2]).length, 32);
  assert.deepEqual(M.setItems(null), []);
});

test('Multicuenta: total por cuenta y de todas, valor con el precio de venta; una cuenta sin datos no es 0', () => {
  const a = M.indexPlaces({ materials: [{ id: 1, count: 10 }], bank: [{ id: 2, count: 1 }], shared: [], characters: [{ name: 'X', bags: [{ inventory: [{ id: 1, count: 5 }] }] }] });
  const b = M.indexPlaces({ materials: [{ id: 1, count: 3 }], bank: null, shared: [], characters: [] });
  const prices = { 1: { sells: { unit_price: 100 } }, 2: { sells: { unit_price: 2500 } } };
  const t = M.multiTable([{ label: 'Principal', index: a }, { label: 'Alt', index: b }, { label: 'Rota', index: null }], [1, 2], prices);
  assert.deepEqual(t.rows[0].cells, [15, 1]);
  assert.equal(t.rows[0].value, 15 * 100 + 2500);
  assert.deepEqual(t.rows[1].partial, ['bank'], 'se avisa que el banco no se leyó');
  assert.deepEqual(t.rows[2].cells, [null, null]);
  assert.equal(t.rows[2].value, null);
  assert.deepEqual(t.totals, [18, 1]);
  assert.equal(t.value, 18 * 100 + 2500);
  assert.equal(M.valueOf([9], [4], {}), 0, 'sin precio no suma');
});
