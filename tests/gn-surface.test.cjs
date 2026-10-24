// Superficies de la Bóveda (CAM-POLISH-001): bandeja, tarjeta, borde, pista y placa calculadas desde el
// theme y declaradas solo dentro de los paneles registrados. js/gn-surface.js se carga por js/modules.json.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/gn-surface.js');
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

// Un panel de mentira: guarda lo que se le pone en style y sus atributos.
function panel(id) {
  const p = { id, props: {}, attrs: {} };
  p.style = { setProperty: (k, v) => { p.props[k] = v; }, removeProperty: (k) => { delete p.props[k]; } };
  p.setAttribute = (k, v) => { p.attrs[k] = String(v); };
  p.removeAttribute = (k) => { delete p.attrs[k]; };
  p.getAttribute = (k) => (k in p.attrs ? p.attrs[k] : null);
  return p;
}
function load(opts = {}) {
  const nodes = {}, head = [];
  (opts.panels || ['wvPanel', 'achievementsPanel']).forEach((id) => { nodes[id] = panel(id); });
  const win = {
    console: { info: noop, warn: noop }, setTimeout, clearTimeout, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat,
    getComputedStyle: () => ({ getPropertyValue: (k) => (opts.tokens || {})[k] || '' }), addEventListener: noop
  };
  win.window = win;
  win.document = { readyState: 'complete', documentElement: {}, head: { appendChild: (c) => { head.push(c); nodes[c.id] = c; } },
    getElementById: (id) => nodes[id] || null, createElement: () => ({}), addEventListener: noop };
  vm.runInContext(SRC, vm.createContext(win));
  return { win, G: win.GNSurface, P: win.GNSurface._pure, nodes, head };
}
const { P } = load();

function loadWelcome() {
  const document = { readyState: 'loading', addEventListener: noop, getElementById: () => null, querySelector: () => null,
    querySelectorAll: () => [], createElement: () => ({ setAttribute: noop, appendChild: noop }) };
  const window = { document, console: { info: noop, warn: noop, log: noop }, location: { hash: '' }, addEventListener: noop,
    Storage: { STORAGE_KEYS: {}, get: () => null, set: noop } };
  vm.runInNewContext(read('js/welcome-panel.js'), { window, Date, JSON, Promise, Math });
  return window.Welcome._pure;
}
const W = loadWelcome();
function loadWV() {
  const window = { console: { info: noop, warn: noop, log: noop }, setTimeout, clearTimeout, addEventListener: noop, location: { hash: '' } };
  window.window = window;
  window.document = { readyState: 'loading', addEventListener: noop, getElementById: () => null };
  vm.runInNewContext(read('js/wv-view.js'), Object.assign(window, { Date, JSON, Math, Object, Promise }));
  return window.WVView._pure;
}
const WV = loadWV();

test('versión 1.0.0, primero en js/modules.json, fuera de index.html y dentro de 40 KB', () => {
  assert.match(SRC, /\* Versión: 1\.0\.0 /);
  const m = JSON.parse(read('js/modules.json')).modules;
  assert.deepEqual(m[0], { src: 'js/gn-surface.js', v: '1.0.0' }, 'antes que las vistas: pintan ya con las superficies');
  assert.doesNotMatch(read('index.html'), /gn-surface\.js/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
});

test('en los 19 themes: la tarjeta se despega de la bandeja, el borde se ve y la barra tiene pista', () => {
  assert.equal(THEMES.length, 19);
  const bad = [];
  let fullTrack = 0;
  THEMES.forEach(({ id, tokens }) => {
    const s = P.surfaces(tokens), c = (k) => P.parse(s[k]);
    const card = c('--bg-1');
    const r = { tray: P.contrast(card, c('--gn-tray')), track: P.contrast(c('--bg-2'), card), border: P.contrast(c('--bd-1'), card),
      strong: P.contrast(c('--bd-2'), card), plate: P.contrast(c('--gn-plate'), card) };
    if (r.tray < 1.14) bad.push(id + ' tarjeta/bandeja ' + r.tray.toFixed(2));
    // La pista también es fondo de texto (hover, botón apretado): donde el texto del theme es tenue
    // (One Dark, Everforest) el texto manda y la pista queda más suave, nunca invisible.
    if (r.track < 1.12) bad.push(id + ' pista ' + r.track.toFixed(2));
    if (r.track >= 1.39) fullTrack++;
    if (r.border < 1.5) bad.push(id + ' borde ' + r.border.toFixed(2));
    if (r.strong < 1.85) bad.push(id + ' borde fuerte ' + r.strong.toFixed(2));
    if (r.plate < 1.12) bad.push(id + ' placa ' + r.plate.toFixed(2));
  });
  assert.deepEqual(bad, []);
  assert.ok(fullTrack >= 17, 'pista completa en ' + fullTrack + ' de 19');
  const gato = P.surfaces(THEMES.find((t) => t.id === 'gato').tokens);
  assert.equal(gato['--gn-tray'], '#0f1117', 'en Gato Negro la bandeja es el fondo, como en la maqueta');
  assert.ok(P.contrast(P.parse(gato['--bg-2']), P.parse(gato['--bg-1'])) >= 1.4, 'y la pista vuelve (hoy 1.00)');
  const mac = P.surfaces(THEMES.find((t) => t.id === 'macos').tokens);
  assert.equal(mac['--bg-1'], '#ffffff', 'en claro la tarjeta queda blanca y la bandeja se oscurece');
  assert.equal(mac.light, true);
});

test('los textos de la Cámara y de Logros siguen en AA sobre tarjeta, bandeja, placa y pista, con las guardas sobre las superficies reales', () => {
  const fails = [];
  THEMES.forEach(({ id, tokens }) => {
    const s = P.surfaces(tokens), c = (k) => P.parse(s[k]);
    const S = { card: c('--bg-1'), tray: c('--gn-tray'), plate: c('--gn-plate'), track: c('--bg-2') };
    const eff = Object.assign({}, tokens, WV.guardFixes(load().G.surfaceTokens(tokens), W.contrastFixes));
    const chk = (k, fb, on) => {
      const col = P.parse(k === 'LINK' ? s['--gn-link'] : (eff[k] || fb));
      if (!col) return;
      on.forEach((x) => { const r = P.contrast(P.over(col, S[x]), S[x]); if (r < 4.5) fails.push(id + ' ' + k + '/' + x + ' ' + r.toFixed(2)); });
    };
    chk('--tx-1', null, ['card', 'tray', 'plate', 'track']);
    chk('--tx-2', null, ['card', 'tray', 'plate', 'track']);
    chk('LINK', null, ['card', 'tray', 'plate']);
    chk('--acc-1', null, ['card', 'tray']);
    [['--color-amber', '#F2B94B'], ['--color-green', '#3CC48A'], ['--color-red', '#F47C7C'], ['--wvx-aa', '#4FC3D9'], ['--wvx-mark', '#9B7BFF'], ['--gn-gold', null], ['--tx-3', null]]
      .forEach(([k, fb]) => chk(k, fb, ['card', 'tray']));
  });
  assert.deepEqual(fails, []);
});

test('apply: pone las superficies y la marca en cada panel registrado, register suma otro y sin theme legible saca todo', () => {
  const gato = THEMES.find((t) => t.id === 'gato').tokens;
  const x = load({ tokens: gato, panels: ['wvPanel', 'achievementsPanel', 'raidTrackerPanel'] });
  const want = P.surfaces(gato);
  ['wvPanel', 'achievementsPanel'].forEach((id) => {
    assert.equal(x.nodes[id].attrs['data-gn-surface'], 'dark');
    ['--gn-tray', '--bg-1', '--bg-2', '--bd-1', '--bd-2', '--gn-plate', '--gn-link', '--gn-elev'].forEach((k) => assert.equal(x.nodes[id].props[k], want[k], id + ' ' + k));
  });
  assert.deepEqual(x.nodes.raidTrackerPanel.props, {}, 'solo los registrados');
  assert.ok(x.nodes['gn-surface-css'], 'inyecta su CSS una vez');
  assert.equal(x.G.register('raidTrackerPanel'), true);
  assert.equal(x.G.register('raidTrackerPanel'), false, 'no repite');
  assert.equal(x.nodes.raidTrackerPanel.props['--bg-1'], want['--bg-1']);
  x.G.apply({});
  assert.deepEqual(x.nodes.wvPanel.props, {});
  assert.equal(x.nodes.wvPanel.attrs['data-gn-surface'], undefined);
  assert.deepEqual(J(x.G.scopes()), ['wvPanel', 'achievementsPanel', 'raidTrackerPanel']);
});

test('las guardas de Logros y de la Cámara calculan sobre las superficies reales cuando el módulo está', () => {
  const notion = THEMES.find((t) => t.id === 'notion').tokens;
  const G = load().G;
  const st = G.surfaceTokens(notion);
  assert.notEqual(st['--bg-0'], notion['--bg-0'], 'la bandeja reemplaza al fondo');
  assert.equal(st['--tx-1'], notion['--tx-1'], 'lo demás queda igual');
  ['js/ach-view.js', 'js/wv-view.js'].forEach((f) => assert.match(read(f), /if \(GS && typeof GS\.surfaceTokens === 'function'\) tk = GS\.surfaceTokens\(tk\);/, f));
});

test('regla de Pablo: los íconos oficiales crecen y nunca se ocultan; a un paso, anillo dorado y etiqueta', () => {
  const css = P.CSS;
  assert.match(css, /\[data-gn-surface\] \.achc-ico\{width:60px;height:60px;padding:4px/);
  assert.match(css, /\.achc-card--step \.achc-ico\{box-shadow:0 0 0 2px var\(--color-amber/);
  assert.match(css, /\.achc-card--step \.achc-name::before\{content:"A UN PASO";content:"A UN PASO" \/ ""/, 'el lector no lo repite');
  assert.match(css, /\.wvs-ic\{width:52px;height:52px/);
  assert.match(css, /\.wvp-it img\{width:34px;height:34px/);
  assert.doesNotMatch(css, /(achc-ico|wvs-ic|wvp-it img|achg-row img)[^{]*\{[^}]*(display:none|visibility:hidden|opacity:0)/);
  assert.match(css, /\.achc-prog::after\{content:attr\(aria-valuenow\) " %";content:attr\(aria-valuenow\) " %" \/ ""/, 'el % ya lo dice la barra');
});

test('solo presentación: sin animaciones, sin quitar el foco, sin pedidos ni almacenamiento', () => {
  assert.doesNotMatch(P.CSS, /transition|animation|@keyframes|outline:\s*(none|0)/);
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
  assert.match(P.CSS, /^\[data-gn-surface\]\.panel\{background:var\(--gn-tray\)\}/, 'el panel es la bandeja');
  P.CSS.split('\n').forEach((l) => assert.ok(/^\[data-gn-surface\]|^@media \(max-width:900px\)\{\[data-gn-surface\]/.test(l), 'todo queda dentro de los paneles: ' + l.slice(0, 60)));
});

test('colores raros o vacíos no rompen nada', () => {
  assert.equal(P.surfaces({}), null);
  assert.equal(P.surfaces({ '--bg-0': 'no', '--tx-1': '#fff' }), null);
  assert.deepEqual(J(P.parse('rgba(255,255,255,0.06)')), [255, 255, 255, 0.06]);
  assert.deepEqual(J(P.parse('#abc')), [170, 187, 204, 1]);
  const glass = P.surfaces(THEMES.find((t) => t.id === 'glassmorphism').tokens);
  assert.match(glass['--bg-1'], /^#[0-9a-f]{6}$/, 'las superficies translúcidas quedan opacas');
});
