// BL-092 BV-6b (pedido de Pablo, 2026-11-18): los paneles de los módulos como los de La Guarida.
// Oscuros, con el color del módulo solo en el borde de arriba y una luz leve; sin el tinte que llenaba el fondo.
// Corre con: node --test tests/*.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const CSS = read('css/universo.css').replace(/\/\*[\s\S]*?\*\//g, '');
const S = ':root:is([data-theme="gato"],:not([data-theme]))';
// el color de cada módulo es el de su botón en la barra lateral (js/sidebar-nav.js)
const SIDEBAR = read('js/sidebar-nav.js');
const color = (id) => (SIDEBAR.match(new RegExp("id: '" + id + "'[^}]*color: '(#[0-9A-Fa-f]{6})'")) || [])[1];
const PANELS = { welcomePanel: '#A896FF', walletPanel: 'cards', walletDashboardPanel: 'cards', metaPanel: 'meta', wvPanel: 'wv',
  activitiesPanel: 'activities', homesteadPanel: 'homestead', raidTrackerPanel: 'raids', achievementsPanel: 'achievements',
  inventoryPanel: 'characters', legendaryArmoryPanel: 'armory', buildsPanel: 'builds', accountsPanel: 'accounts' };
const want = (p) => (PANELS[p].startsWith('#') ? PANELS[p] : color(PANELS[p]));
function rule(sel) {
  const i = CSS.indexOf(sel + ' {');
  assert.ok(i >= 0, 'falta ' + sel);
  return CSS.slice(i + sel.length + 2, CSS.indexOf('}', i));
}
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function lum(c) { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('cada panel de módulo: borde de arriba en el color de su botón de la barra lateral, con luz leve y brillo suave', () => {
  for (const p of Object.keys(PANELS)) {
    const c = want(p);
    assert.ok(c, 'color de ' + p);
    const r = rule(S + ' #' + p);
    assert.match(r, new RegExp('border-top-color:\\s*' + c), p + ': borde de arriba ' + c);
    const [R, G, B] = rgb(c);
    const luz = r.match(/radial-gradient\([^)]*rgba\((\d+),(\d+),(\d+),\.(\d+)\)/);
    assert.ok(luz, p + ': luz desde la esquina');
    assert.deepEqual(luz.slice(1, 4).map(Number), [R, G, B], p + ': la luz es del color del módulo');
    assert.ok(Number('0.' + luz[4]) <= 0.1, p + ': la luz es leve (≤ 10 %)');
    assert.match(r, new RegExp('box-shadow:\\s*0 -2px 16px -8px rgba\\(' + R + ',' + G + ',' + B + ','), p + ': brillo sobre el borde');
    assert.match(r, /linear-gradient\(180deg, #1C1C26, #15151D/, p + ': el panel es oscuro, como en La Guarida');
  }
});

test('la base común: panel oscuro, borde fino de la línea del universo y 3 px arriba; sin tintes en las cabeceras', () => {
  const ids = Object.keys(PANELS).map((p) => '#' + p).join(',');
  const base = rule(S + ' :is(' + ids + ')');
  assert.match(base, /border:\s*1px solid #2A2A38/);
  assert.match(base, /border-top:\s*3px solid/);
  assert.match(base, /border-radius:\s*16px/);
  assert.doesNotMatch(base, /color-mix|rgba\((?!0,0,0)/, 'la base no tiene color de módulo');
  const heroes = CSS.match(new RegExp(S.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' :is\\(' + ids.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\) :is\\(([^)]*)\\) \\{\\s*background: none;'));
  assert.ok(heroes, 'las cabeceras pierden su degradado');
  for (const h of ['.wvx-hero', '.achx-hero', '.av-hero', '.iv-hero', '.rv-hero', '.arm-hero', '.mh-head', '.wn-hero', '.wl-head']) assert.ok(heroes[1].split(',').includes(h), h);
});

test('le gana al tinte de js/gn-shell.js (los paneles con un solo contenedor) sin !important', () => {
  const shell = read('js/gn-shell.js');
  for (const id of ['raidTrackerPanel', 'inventoryPanel', 'activitiesPanel', 'achievementsPanel', 'wvPanel', 'legendaryArmoryPanel']) {
    assert.ok(shell.includes("'#" + id), 'gn-shell sigue tiñendo ' + id + ' (si no, esta regla sobra)');
    assert.ok(CSS.includes(S + ' #' + id + ' {'), 'lo apago en ' + id);
  }
  // especificidad: :root + :is() + #id (1,2,0) contra #id.clase o #id:has() (1,1,0) de gn-shell
  assert.doesNotMatch(CSS, /!important/);
});

test('los textos de color siguen en AA sobre el panel nuevo (lo más claro: #1C1C26 con la luz del módulo)', () => {
  const top = (c) => rgb('#1C1C26').map((v, i) => Math.round(v + (rgb(c)[i] - v) * 0.08));
  const fails = [];
  // antetítulos de BV-2 (sección 5) sobre su panel, y los textos del theme
  const ante = [...CSS.matchAll(/#(\w+)::before \{ content: "[^"]+" \/ ""; color: (#[0-9A-F]{6}); \}/g)];
  assert.ok(ante.length >= 10, 'antetítulos');
  for (const p of Object.keys(PANELS)) for (const t of ['#F4F6FA', '#C9D0DA', '#8E96A3', '#A896FF', '#F2B94B', '#E8B34B'].concat(ante.map((a) => a[2]))) {
    const r = ratio(rgb(t), top(want(p)));
    if (r < 4.5) fails.push(p + ' ' + t + ' ' + r.toFixed(2));
  }
  assert.deepEqual(fails, []);
});
