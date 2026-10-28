// BL-078 UNI-4b: los íconos del juego que eligió Pablo (2026-10-28) en las pestañas y los indicadores de cada módulo.
// Con GNKit cargado cada módulo los dibuja; sin GNKit, nada cambia (lo siguen probando los tests de cada módulo).
// Corre con: node --test tests/*.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = Date.parse('2026-10-28T00:30:00Z');

function sandbox(files) {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  ['js/gn-kit.js'].concat(files).forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  return sb;
}
const ic = (h, src) => h.includes('<img class="gk-ic" src="assets/icons/' + src + '"');
const all = (h, list, where) => list.forEach((s) => assert.ok(ic(h, s), where + ': ' + s));

test('Raids: Alas y Encuentros', () => {
  const sb = sandbox(['js/raids-view.js']);
  const CAT = JSON.parse(read('assets/data/raids/catalog.json'));
  const V = sb.RaidsView._pure;
  all(V.viewHTML(V.buildModel(CAT, { hasToken: false, loaded: true }, {}), T), ['raids/raid-icon.png', '784370.png'], 'raids');
});

test('Actividades: Hoy, Semana y los 4 indicadores', () => {
  const V = sandbox(['js/act-model.js', 'js/act-view.js']).ActView._pure;
  all(V.viewHTML(V.buildModel({}, {}, {}, T)), ['534745.png', '155064.png', 'Welcome/102609.png', 'Fractal/2591.png', 'Cuentas/LLave.png', 'Activities/96978.png'], 'actividades');
});

test('Heredad: las 3 pestañas (Glifos y Decoraciones las suma home-extra.js) y los 4 indicadores', () => {
  const V = sandbox(['js/home-view.js']).HomeView._pure;
  const ext = { tabs: [['glyphs', 'Glifos'], ['decor', 'Decoraciones']], tab: 'nodes', html: '' };
  all(V.viewHTML(V.buildModel({}, {}, {}, T), ext), ['Welcome/3380755.png', '1228929.png', '156016.png', 'Cuentas/23033.png', '3601748.png', 'Welcome/222580.png'], 'heredad');
  assert.match(read('js/home-extra.js'), /tabs: \[\['glyphs', 'Glifos'\], \['decor', 'Decoraciones'\]\]/, 'los ids que mapea HS_TAB');
});

test('Cámara del Brujo: las 3 pestañas y los 4 indicadores', () => {
  const V = sandbox(['js/wv-view.js']).WVView._pure;
  const m = { season: 'Temporada actual', aa: null, aaNote: '', daily: null, weekly: null, spent: null, view: { tab: 'objectives', sub: 'daily' },
    counts: {}, ready: 0, pinned: 0, accounts: 0, whyOpen: false, accountsSub: 'weekly', dailyLeft: '1 h', weeklyLeft: '4 d', now: T };
  all(V.headHTML(m), ['3172791.png', '3594051.png', '578844.png', 'Welcome/156108.png', 'Welcome/156107.png', '534745.png', '155064.png'], 'cámara');
});

test('Logros e Inventario: mapas de íconos cableados y el ícono AP sin la wiki', () => {
  const ach = read('js/ach-view.js'), inv = read('js/inv-view.js');
  assert.doesNotMatch(ach, /wiki\.guildwars2\.com\/images/, 'el ícono AP de la wiki dejó de cargar');
  assert.match(ach, /var ICON_AP = 'assets\/icons\/155059\.png';/);
  assert.match(ach, /kitIcon\(ACH_TAB\[t\[0\]\]\)/);
  assert.match(ach, /label = kitIcon\(ACH_STAT\[label\], 16\) \+ label;/);
  assert.match(inv, /kitIcon\(IV_ICON\[t\[1\]\]\)/);
  assert.match(inv, /label = kitIcon\(IV_ICON\[label\], 16\) \+ label;/);
  const K = sandbox([]).GNKit;
  ['tab.ach.cerca', 'tab.ach.categorias', 'tab.ach.legendarias', 'stat.ach.ap', 'tab.inv.multi', 'tab.inv.buscar', 'tab.inv.materiales',
    'tab.inv.banco', 'tab.inv.armeria', 'tab.inv.personajes'].forEach((k) => assert.ok(K.iconSrc(k), k));
});

test('los íconos son decorativos: alt vacío y el nombre sigue en texto', () => {
  const V = sandbox(['js/act-model.js', 'js/act-view.js']).ActView._pure;
  const h = V.viewHTML(V.buildModel({}, {}, {}, T));
  assert.doesNotMatch(h, /<img class="gk-ic"(?![^>]*alt="")[^>]*>/);
  assert.match(h, /<img class="gk-ic" src="assets\/icons\/534745\.png"[^>]*>Hoy/);
});
