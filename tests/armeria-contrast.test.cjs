// Armería (BL-064, ARM-5): contraste en los 19 themes, teclado y foco que no se pierde.
// Uso la guarda de contraste de la Bienvenida (Welcome._pure.contrastFixes), como la Sidebar. Acá verifico que
// cada color de texto de la Armería llegue a 4.5:1 (WCAG AA) sobre todas sus superficies, con los tintes del
// módulo encima, en los 19 themes reales de css/themes/, y que el foco (--acc-1) llegue a 3:1. Los themes no se tocan.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THEMES_DIR = path.join(ROOT, 'css', 'themes');

function readTheme(file) {
  const css = fs.readFileSync(path.join(THEMES_DIR, file), 'utf8');
  const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'));
  const t = {};
  block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return t;
}
const THEMES = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css')).sort()
  .map((f) => ({ id: f.replace(/\.css$/, ''), tokens: readTheme(f) }));

function loadWelcome() {
  const noop = () => {};
  const document = { readyState: 'loading', addEventListener: noop, getElementById: () => null, querySelector: () => null,
    querySelectorAll: () => [], createElement: () => ({ setAttribute: noop, appendChild: noop }) };
  const window = { document, console: { info: noop, warn: noop, log: noop }, location: { hash: '' }, addEventListener: noop,
    Storage: { STORAGE_KEYS: {}, get: () => null, set: noop } };
  vm.runInNewContext(read('js/welcome-panel.js'), { window, Date, JSON, Promise, Math });
  return window.Welcome._pure;
}
const P = loadWelcome();

// La Armería con lo mínimo: su CSS, su guarda y sus oyentes.
function cargar(opts = {}) {
  const reg = {};
  const nodes = {};
  const props = {};
  const timers = [];
  const el = (id) => ({ id, listeners: {}, addEventListener(t, f, c) { (this.listeners[t] = this.listeners[t] || []).push({ f, c }); } });
  const win = {
    console: { info() {}, log() {}, warn() {} },
    LegendaryTracker: {
      QUEUE_MAX: 5, registerRender(m) { reg.r = m; return true; }, registerItemModal() { return true; },
      getQueue() { return []; }, getOwnershipCounts() { return { tengo: 0, faltan: 206 }; },
      getState() { return { mode: 'catalog', token: 'K', owned: {} }; }, setFilter() { return true; }
    },
    Welcome: opts.noWelcome ? undefined : { _pure: P },
    getComputedStyle: () => ({ getPropertyValue: (k) => (opts.tokens || {})[k] || '' }),
    setTimeout: (f) => { timers.push(f); return timers.length; }
  };
  win.window = win;
  const panel = { id: 'legendaryArmoryPanel', style: {
    setProperty: (k, v) => { props[k] = v; }, removeProperty: (k) => { delete props[k]; } } };
  nodes.legendaryArmoryPanel = panel;
  nodes.legendaryModeContent = el('legendaryModeContent');
  win.document = { getElementById: (id) => nodes[id] || null, createElement: () => ({}), head: { appendChild() {} },
    documentElement: {}, body: {}, activeElement: null };
  vm.runInContext(read('js/legendary-data.js'), vm.createContext(win));
  vm.runInContext(read('js/render-catologo.js'), win);
  return { win, r: reg.r, A: win.LegendaryCatalogUI._arm, props, nodes, timers, items: win.LegendaryCatalog.items };
}
const A = cargar().A;

const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const ARM = [229, 69, 202];
// Superficies de la Armería: fondo, tarjeta, cabecera (tinte .10), chip/cola apretados (.14) y «La tengo» (verde .10).
function surfaces(eff) {
  const c = (k) => P.parseColor(eff[k]);
  const bg0 = over(c('--bg-0'), [255, 255, 255, 1]);
  const bg1 = over(c('--bg-1'), bg0);
  const green = (P.parseColor('#3fb950'));
  return [['--bg-0', bg0], ['--bg-1', bg1], ['cabecera', over(ARM.concat(0.10), bg1)],
    ['apretado', over(ARM.concat(0.14), bg1)], ['la tengo', over(green.slice(0, 3).concat(0.10), bg1)]];
}

function textTokens(css) {
  const out = new Set();
  css.replace(/(?:^|[{;])color:var\((--[\w-]+)/g, (_, k) => { out.add(k); return ''; });
  return [...out].sort();
}

// Dónde va cada color: --tx-1 en todas; --tx-2 también en la cabecera (botón, subtítulo); --tx-3 solo sobre
// --bg-0 y --bg-1 (los tintes son más claros u oscuros que el fondo y le restan contraste al gris).
const ON = { '--tx-1': 5, '--tx-2': 3, '--tx-3': 2 };

function failures(tokens) {
  const eff = Object.assign({}, tokens, JSON.parse(JSON.stringify(P.contrastFixes(tokens))));
  const bad = [];
  const S = surfaces(eff);
  textTokens(A.CSS).forEach((k) => {
    const v = P.parseColor(eff[k]);
    assert.ok(v, k + ' se puede leer: ' + eff[k]);
    S.slice(0, ON[k]).forEach(([n, b]) => {
      const r = P.contrast(over(v, b), b);
      if (r < 4.5) bad.push(k + ' / ' + n + ' ' + r.toFixed(2));
    });
  });
  const acc = P.parseColor(eff['--acc-1']);
  S.slice(0, 2).forEach(([n, b]) => {
    const r = P.contrast(over(acc, b), b);
    if (r < 3) bad.push('foco --acc-1 / ' + n + ' ' + r.toFixed(2));
  });
  return bad;
}

test('la Armería solo usa colores de texto del theme: --tx-1, --tx-2 y --tx-3', () => {
  assert.deepEqual(textTokens(A.CSS), ['--tx-1', '--tx-2', '--tx-3']);
});

test('sobre los tintes solo va --tx-1 o --tx-2: el gris tenue (--tx-3) queda fuera de la cabecera', () => {
  const rule = (sel) => { const i = A.CSS.indexOf(sel + '{'); assert.ok(i >= 0, sel); return A.CSS.slice(i, A.CSS.indexOf('}', i)); };
  assert.match(rule('.arm-sub'), /color:var\(--tx-2\)/);
  assert.match(rule('.arm-hrow h2'), /color:var\(--tx-1\)/);
  assert.match(rule('.arm-btn'), /color:var\(--tx-2\)/);
  assert.match(rule('.arm-chip[aria-pressed="true"]'), /color:var\(--tx-1\)/);
  assert.match(rule('[data-q] .arm-qbtn'), /color:var\(--tx-1\)/);
  assert.match(rule('.arm-own'), /color:var\(--tx-1\)/);
  // Los tintes que mide el test son los del CSS: si alguien los sube, el test de los 19 themes queda viejo.
  assert.match(A.CSS, /\.arm-hero\{[^}]*rgba\(229,69,202,\.10\)/);
  assert.match(A.CSS, /\.arm-chip\[aria-pressed="true"\]\{[^}]*rgba\(229,69,202,\.14\)/);
  assert.match(rule('.arm-own'), /background:rgba\(63,185,80,\.10\)/);
  // Lo de adentro de la cabecera que usa --tx-3 tiene su propio fondo --bg-0.
  assert.match(rule('.arm-st'), /background:var\(--bg-0\)/);
  assert.match(rule('.arm-voice'), /background:var\(--bg-0\)/);
});

test('en los 19 themes cada texto de la Armería llega a 4.5:1 en todas sus superficies, y el foco a 3:1', () => {
  assert.equal(THEMES.length, 19, THEMES.map((t) => t.id).join(', '));
  const bad = THEMES.map(({ id, tokens }) => [id, failures(tokens)]).filter(([, f]) => f.length);
  assert.deepEqual(bad, [], bad.map(([id, f]) => id + ': ' + f.join(' · ')).join('\n'));
});

test('la guarda se aplica sobre el panel de la Armería al pintar, y se limpia al cambiar de theme', () => {
  const tokyo = THEMES.find((t) => t.id === 'tokyo-night').tokens;
  const x = cargar({ tokens: tokyo });
  x.r.filterBar({}, x.items);
  const want = JSON.parse(JSON.stringify(P.contrastFixes(tokyo)));
  assert.ok(Object.keys(want).length, 'tokyo-night necesita corrección (--tx-3 queda bajo)');
  assert.deepEqual(x.props, want);
  const gato = THEMES.find((t) => t.id === 'gato').tokens;
  const y = cargar({ tokens: tokyo });
  y.r.filterBar({}, y.items);
  y.A.contrast(gato);
  assert.deepEqual(y.props, JSON.parse(JSON.stringify(P.contrastFixes(gato))), 'lo que ya no hace falta se quita');
  const z = cargar({ tokens: tokyo, noWelcome: true });
  z.r.filterBar({}, z.items);
  assert.deepEqual(z.props, {}, 'sin la Bienvenida no invento nada');
});

test('teclado: cada control tiene foco visible y ninguno quita el contorno', () => {
  ['.arm-btn:focus-visible', '.arm-tab:focus-visible', '.arm-search:focus-visible', '.arm-chip:focus-visible',
    '.arm-select:focus-visible', '.arm-cname:focus-visible', '.arm-qbtn:focus-visible', '.arm-set>summary:focus-visible']
    .forEach((s) => assert.ok(A.CSS.includes(s), s));
  assert.doesNotMatch(A.CSS, /outline:\s*(none|0)\b/);
});

test('el foco no se pierde cuando el tracker repinta: vuelve al mismo control', () => {
  const x = cargar();
  const c = x.nodes.legendaryModeContent;
  const mk = (attrs, id) => ({ id: id || '', getAttribute: (k) => (k in attrs ? attrs[k] : null),
    closest: () => null, focus() { this.focused = true; } });
  const chip = mk({ 'data-ftype': 'type', 'data-fvalue': 'armor' });
  c.contains = (n) => n !== x.win.document.body;
  x.win.document.activeElement = chip;
  x.r.filterBar({}, x.items);
  assert.equal(x.timers.length, 1, 'agenda la vuelta del foco');
  const fresh = mk({ 'data-ftype': 'type', 'data-fvalue': 'armor' });
  let asked = '';
  c.querySelector = (s) => { asked = s; return s === '[data-ftype="type"][data-fvalue="armor"]' ? fresh : null; };
  x.win.document.activeElement = x.win.document.body;
  x.timers[0]();
  assert.equal(asked, '[data-ftype="type"][data-fvalue="armor"]');
  assert.equal(fresh.focused, true);
  // Las listas, por id; «Limpiar» desaparece: el foco va a «Todas».
  assert.equal(x.A.focusKey(mk({}, 'armF-expansion')), '#armF-expansion');
  assert.equal(x.A.focusKey(mk({ 'data-action': 'clear-filters' })), '[data-ftype="ownership"][data-fvalue=""]');
  assert.equal(x.A.focusKey(mk({ 'data-card-queue': '30684' })), '[data-card-queue="30684"]');
  assert.equal(x.A.focusKey(mk({ 'data-arm-tab': 'progress' })), '[data-arm-tab="progress"]');
  assert.equal(x.A.focusKey(mk({ 'data-arm-act': 'refresh' })), '[data-arm-act="refresh"]');
  assert.equal(x.A.focusKey(null), '');
  // Si el foco ya está en la Armería (otro paso lo puso), no lo muevo; si estaba afuera, no agendo nada.
  const y = cargar();
  const c2 = y.nodes.legendaryModeContent;
  c2.contains = () => false;
  y.win.document.activeElement = chip;
  y.r.filterBar({}, y.items);
  assert.equal(y.timers.length, 0);
});
