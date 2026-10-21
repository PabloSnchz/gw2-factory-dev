// Armería: etiquetas y expansión de cada legendaria (BL-046). Corre con: node --test tests/*.test.cjs
// - chips con la jerga de la comunidad: "Abalorio" y "Espaldar";
// - la expansión real de cada pieza (Klobjarne Geirr es de Janthir Wilds, Verano Infinito de Visions of Eternity);
// - filtros y grilla en orden de salida del juego.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const JS = path.join(__dirname, '..', 'js');

function cargar() {
  const registro = {};
  const win = {
    console: { info() {}, log() {}, warn() {} },
    LegendaryTracker: {
      registerRender(map) { registro.r = map; return true; },
      registerItemModal() { return true; },
      getOwnershipCounts() { return { tengo: 0, faltan: 0 }; },
      getQueue() { return []; }
    }
  };
  win.window = win;
  win.document = { getElementById: () => ({}), createElement: () => ({}), head: { appendChild() {} } };
  win.setTimeout = setTimeout;
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(JS, 'legendary-data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(JS, 'render-catologo.js'), 'utf8'), ctx);
  return { win, r: registro.r, items: win.LegendaryCatalog.items };
}

const byId = (items, id) => items.find((x) => x.id === id);

test('etiquetas: los chips dicen Abalorio y Espaldar, no Joya ni Capa', () => {
  const { r, items } = cargar();
  const html = r.filterBar({}, items);
  assert.match(html, />Abalorio \(\d+\)</);
  assert.match(html, />Espaldar \(\d+\)</);
  assert.doesNotMatch(html, />Joya |>Capa /);
  const grid = r.catalogGrid(items.filter((x) => x.type === 'trinket' || x.type === 'back'), {});
  assert.doesNotMatch(grid, />Joya<|>Capa</);
});

test('expansión: las legendarias nuevas tienen su expansión real', () => {
  const { items } = cargar();
  const esperado = {
    103815: 'JW',   // Klobjarne Geirr
    104857: 'JW',   // Orrax Manifestado
    107022: 'VoE',  // Verano Infinito
    109070: 'VoE',  // Estela radiante
    109012: 'VoE',  // Conflicto Interminable
    105653: 'VoE',  // Ancora Pax
    106273: 'VoE',  // Ancora Bellum
    110020: 'VoE',  // Jornal Estelar
    101582: 'SotO', // Reliquia legendaria
    78556: 'HoT',   // Chuka y Champawat
    81908: 'HoT',   // Aurora
    87109: 'PoF',   // Garra del Khan-Ur
    92991: 'Core',  // Trascendencia
    93105: 'Core',  // Confluencia
    30684: 'Core',  // Colmilloescarcha (sin corrección)
    96356: 'EoD'    // Mordisco de Aurene (sin corrección)
  };
  for (const [id, exp] of Object.entries(esperado)) {
    const it = byId(items, Number(id));
    assert.ok(it, 'falta el id ' + id);
    assert.equal(it.expansion, exp, it.name);
  }
});

test('expansión: armaduras por set', () => {
  const { items } = cargar();
  const armor = items.filter((x) => x.type === 'armor');
  const por = (re) => armor.filter((x) => re.test(x.name));
  for (const it of por(/^Perfected Envoy/)) assert.equal(it.expansion, 'HoT', it.name);
  for (const it of por(/^Obsidian /)) assert.equal(it.expansion, 'SotO', it.name);
  for (const it of por(/^Selachimorpha/)) assert.equal(it.expansion, 'VoE', it.name);
  for (const it of por(/^Eikasia/)) assert.equal(it.expansion, 'Core', it.name);
  const competitivo = /Hero's|^Ardent Glorious/; // PvP y WvW
  for (const it of por(competitivo)) assert.equal(it.expansion, 'Core', it.name);
  assert.equal(por(/^Obsidian /).length, 18);
  assert.equal(por(competitivo).length, 90);
  // Ninguna armadura queda con la expansión adivinada de antes.
  assert.equal(armor.filter((x) => x.expansion === 'PoF').length, 0);
});

test('filtros: todas las expansiones, en orden de salida, y cada pieza cuenta en una', () => {
  const { r, items } = cargar();
  const html = r.filterBar({}, items);
  const orden = [...html.matchAll(/data-ftype="expansion" data-fvalue="([A-Za-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(orden, ['Core', 'HoT', 'PoF', 'EoD', 'SotO', 'JW', 'VoE']);
  assert.match(html, />Janthir Wilds \(2\)</);
  assert.match(html, />Visions of Eternity \(\d+\)</);
  const total = [...html.matchAll(/data-ftype="expansion"[^>]*>[^<]*\((\d+)\)</g)].reduce((a, m) => a + Number(m[1]), 0);
  assert.equal(total, items.length);
});

test('grilla: agrupada por expansión en orden de salida', () => {
  const { r, items, win } = cargar();
  const html = r.catalogGrid(items, {});
  const ids = [...html.matchAll(/class="card lt-item-card" data-id="(\d+)"/g)].map((m) => Number(m[1]));
  assert.equal(ids.length, items.length);
  const orden = win.LegendaryCatalogUI.EXPANSION_ORDER;
  const pos = ids.map((id) => orden.indexOf(byId(items, id).expansion));
  for (let i = 1; i < pos.length; i++) assert.ok(pos[i] >= pos[i - 1], 'fuera de orden en la posición ' + i);
});
