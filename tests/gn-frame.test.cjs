// Marco común (BL-067 pasos 4 a 8): Actividades, Raids, Inventario y Personajes y Cuentas
// reciben superficies, cabecera, guarda de contraste y accesibilidad sin tocar sus archivos.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/gn-frame.js');
const SURF = read('js/gn-surface.js');
const J = (v) => JSON.parse(JSON.stringify(v));
const noop = () => {};

const THEMES_DIR = path.join(ROOT, 'css', 'themes');
function readTheme(file) {
  const css = fs.readFileSync(path.join(THEMES_DIR, file), 'utf8');
  const t = {};
  css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return t;
}
const THEMES = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css')).sort().map((f) => ({ id: f.replace(/\.css$/, ''), tokens: readTheme(f) }));

function panel(id, withTitle = true) {
  const p = { id, props: {}, attrs: {} };
  p.style = { setProperty: (k, v) => { p.props[k] = v; }, removeProperty: (k) => { delete p.props[k]; } };
  p.setAttribute = (k, v) => { p.attrs[k] = String(v); };
  p.removeAttribute = (k) => { delete p.attrs[k]; };
  p.getAttribute = (k) => (k in p.attrs ? p.attrs[k] : null);
  p.title = withTitle ? { id: '' } : null;
  p.querySelector = (sel) => (sel === '.panel__title' ? p.title : null);
  return p;
}
function load(opts = {}) {
  const nodes = {}, listeners = {}, timers = [];
  (opts.panels || []).forEach((id) => { nodes[id] = panel(id); });
  const win = {
    console: { info: noop, warn: noop }, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat,
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout: noop,
    getComputedStyle: () => ({ getPropertyValue: (k) => (opts.tokens || {})[k] || '' }),
    addEventListener: (e, fn) => { (listeners[e] = listeners[e] || []).push(fn); }
  };
  win.window = win;
  win.document = { readyState: 'complete', documentElement: {}, head: { appendChild: (c) => { nodes[c.id] = c; } },
    getElementById: (id) => nodes[id] || null, createElement: () => ({}), addEventListener: (e, fn) => { (listeners['doc:' + e] = listeners['doc:' + e] || []).push(fn); } };
  const ctx = vm.createContext(win);
  if (!opts.noSurface) vm.runInContext(SURF, ctx);
  vm.runInContext(SRC, ctx);
  return { win, F: win.GNFrame, S: win.GNSurface, nodes, listeners, timers, flush: () => timers.splice(0).forEach((f) => f()) };
}
const { F } = load();
const SP = load().S._pure;

test('versión 1.0.1, en js/modules.json justo después de gn-surface.js, fuera de index.html y dentro de 40 KB', () => {
  assert.match(SRC, /\* Versión: 1\.0\.1 /);
  const m = JSON.parse(read('js/modules.json')).modules.map((x) => x.src + '@' + x.v);
  assert.deepEqual(m.slice(0, 2), ['js/gn-surface.js@1.0.0', 'js/gn-frame.js@1.0.1']);
  assert.doesNotMatch(read('index.html'), /gn-frame\.js/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
});

test('los seis paneles de los pasos 4 a 8 (sin Strikes desde BL-070 RAI-5b), con el color y el ícono oficial que muestra la Bienvenida', () => {
  const P = J(F._pure.PANELS);
  assert.deepEqual(P.map((p) => p.id), ['activitiesPanel', 'raidTrackerPanel', 'inventoryPanel', 'charactersPanel', 'inventoryDashboardPanel', 'accountsPanel']);
  const wel = read('js/welcome-panel.js');
  P.forEach((p) => {
    assert.ok(fs.existsSync(path.join(ROOT, p.icon)), p.id + ' ícono ' + p.icon);
    const re = new RegExp("id: '" + p.mod + "'[^}]*icon: '" + p.icon.replace(/[./]/g, '\\$&') + "', color: '" + p.color + "'");
    assert.match(wel, re, p.id + ' coincide con la Bienvenida');
  });
});

test('en los 19 themes cada color de texto de esos módulos llega a 4.5:1 sobre la tarjeta y la bandeja reales', () => {
  const fails = [];
  let fixed = 0;
  THEMES.forEach(({ id, tokens }) => {
    const sf = SP.surfaces(tokens), card = SP.parse(sf['--bg-1']), tray = SP.parse(sf['--gn-tray']);
    const st = load().S.surfaceTokens(tokens);
    const fx = F._pure.guardFixes(st, SP);
    fixed += Object.keys(fx).length;
    const eff = Object.assign({}, tokens, fx);
    const keys = ['--tx-1'].concat(J(F._pure.TEXT_KEYS));
    keys.forEach((k) => {
      const c = SP.parse(eff[k] || { '--color-green': '#3fb950', '--color-amber': '#F2B94B', '--color-red': '#F47C7C', '--color-blue': '#6EA3FF', '--gn-gold': '#F2B94B' }[k]);
      if (!c) return;
      [['tarjeta', card], ['bandeja', tray]].forEach(([n, bg]) => { const r = SP.contrast(SP.over(c, bg), bg); if (r < 4.5) fails.push(id + ' ' + k + '/' + n + ' ' + r.toFixed(2)); });
    });
  });
  assert.deepEqual(fails, []);
  assert.ok(fixed > 0, 'algo corrige (los themes claros con verde o ámbar)');
  const gato = F._pure.guardFixes(load().S.surfaceTokens(THEMES.find((t) => t.id === 'gato').tokens), SP);
  assert.deepEqual(J(gato), {}, 'Gato Negro, el theme oficial, no necesita nada');
});

test('apply: marca los paneles que existen, registra sus superficies, pone el color y nombra la región por su título', () => {
  const tokens = THEMES.find((t) => t.id === 'notion').tokens;
  const x = load({ tokens, panels: ['raidTrackerPanel', 'accountsPanel'] });
  assert.deepEqual(J(x.F.marked()).sort(), ['accountsPanel', 'raidTrackerPanel']);
  const r = x.nodes.raidTrackerPanel;
  assert.equal(r.attrs['data-gn-frame'], 'raids');
  assert.equal(r.attrs['data-gn-surface'], 'light');
  assert.equal(r.props['--gn-mod'], '#F47C7C');
  assert.ok(r.props['--bg-1'] && r.props['--gn-tray'], 'superficies de gn-surface');
  assert.equal(r.title.id, 'raidTrackerPanelGnTitle');
  assert.equal(r.attrs['aria-labelledby'], 'raidTrackerPanelGnTitle');
  assert.ok(J(x.S.scopes()).includes('accountsPanel'));
  assert.ok(x.nodes['gn-frame-css'], 'inyecta su CSS');
});

test('los paneles que arma el JS al navegar se marcan cuando aparecen (hashchange, gn:tabchange)', () => {
  const x = load({ tokens: THEMES.find((t) => t.id === 'gato').tokens });
  assert.deepEqual(J(x.F.marked()), []);
  x.nodes.activitiesPanel = panel('activitiesPanel');
  x.listeners.hashchange.forEach((f) => f());
  x.flush();
  assert.equal(x.nodes.activitiesPanel.attrs['data-gn-frame'], 'activities');
  x.nodes.charactersPanel = panel('charactersPanel');
  x.listeners['doc:gn:tabchange'].forEach((f) => f());
  x.flush();
  assert.equal(x.nodes.charactersPanel.attrs['data-gn-frame'], 'characters');
});

test('sin gn-surface.js no rompe: marca y nombra, sin superficies ni guarda', () => {
  const x = load({ noSurface: true, tokens: THEMES[0].tokens, panels: ['accountsPanel'] });
  assert.equal(x.nodes.accountsPanel.attrs['data-gn-frame'], 'accounts');
  assert.equal(x.nodes.accountsPanel.props['--bg-1'], undefined);
});

test('regla de Pablo: el ícono oficial de la cabecera crece (40 px en su placa) y nunca se oculta', () => {
  const css = F._pure.CSS;
  assert.match(css, /\.panel__title > img,\[data-gn-frame\] \.panel__title > span:first-child > img:first-child\{width:40px;height:40px/);
  assert.doesNotMatch(css, /img[^{]*\{[^}]*(display:none|visibility:hidden|opacity:0)/);
});

test('accesibilidad y alcance: foco visible, movimiento reducido, 44 px en el celular, todo dentro de los paneles, sin pedidos ni almacenamiento', () => {
  const css = F._pure.CSS;
  assert.match(css, /:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /max-width:720px\)\{\[data-gn-frame\] :is\(button,\.btn,select[^)]*\)\{min-height:44px\}/);
  assert.doesNotMatch(css, /outline:\s*(none|0)/);
  css.split('\n').forEach((l) => assert.ok(/^\[data-gn-frame\]|^@media [^{]+\{\[data-gn-frame\]/.test(l), 'fuera del marco: ' + l.slice(0, 50)));
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
});

test('no toca los archivos congelados: el marco no los nombra ni los carga', () => {
  assert.doesNotMatch(SRC, /activities\.js|raid-tracker\.js|strike-tracker\.js|characters\.js|inventory-hub\.js|accounts-panel\.js/);
});
