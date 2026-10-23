// La Sidebar (BL-061, SBR-5): contraste en los 19 themes, teclado y lector de pantalla.
// La Sidebar, la barra del celular, la hoja «Más» y mi rincón usan la guarda de contraste de la Bienvenida
// (Welcome._pure.contrastFixes). Acá verifico que cada color de texto que usan esté cubierto por la guarda y
// llegue a 4.5:1 (WCAG AA) sobre --bg-0 (Sidebar, que es transparente) y --bg-1 (hover, activo, barra, hoja,
// tarjeta y rincón) en los 19 themes reales de css/themes/. Los themes no se tocan.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SIDEBAR = read('js/sidebar-nav.js');
const WELCOME = read('js/welcome-panel.js');
const PLACES = read('js/shiruvana-places.js');
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

// Cargo los tres scripts con lo mínimo para leer sus funciones puras y su CSS (sin armar nada).
function load(src) {
  const noop = () => {};
  const document = {
    readyState: 'loading', addEventListener: noop, getElementById: () => null, querySelector: () => null,
    querySelectorAll: () => [], createElement: () => ({ setAttribute: noop, appendChild: noop }),
  };
  const window = {
    document, console: { info: noop, warn: noop, log: noop }, location: { hash: '' }, addEventListener: noop,
    Storage: { STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys' }, get: () => null, set: noop },
  };
  vm.runInNewContext(src, { window, Date, JSON, Promise, Math });
  return window;
}
const P = load(WELCOME).Welcome._pure;
const S = load(SIDEBAR).SidebarNav;
const PL = load(PLACES).ShiruvanaPlaces;
const CSS = S._pure.CSS + '\n' + PL.CORNER_CSS;

// Colores de texto que la guarda deja en 4.5:1 sobre --bg-0 y --bg-1 (los mismos que exige welcome-contrast).
const GUARDED = ['--tx-1', '--tx-2', '--tx-3', '--muted', '--color-green', '--gn-gold', '--color-amber', '--acc-1'];

function textTokens(css) {
  const out = new Set();
  css.replace(/(?:^|[{;])color:var\((--[\w-]+)/g, (_, k) => { out.add(k); return ''; });
  return [...out].sort();
}

const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
function failures(tokens) {
  const eff = Object.assign({}, tokens, JSON.parse(JSON.stringify(P.contrastFixes(tokens))));
  const c = (k) => { const v = P.parseColor(eff[k]); assert.ok(v, k + ' se puede leer: ' + eff[k]); return v; };
  const bg0 = over(c('--bg-0'), [255, 255, 255, 1]);
  const bg1 = over(c('--bg-1'), bg0);
  const bad = [];
  textTokens(CSS).forEach((k) => {
    [['--bg-0', bg0], ['--bg-1', bg1]].forEach(([n, b]) => {
      const r = P.contrast(over(c(k), b), b);
      if (r < 4.5) bad.push(k + ' / ' + n + ' ' + r.toFixed(2));
    });
  });
  // El foco (contorno de 2 px en --acc-1) es un indicador: pide 3:1 sobre la superficie.
  const ring = P.contrast(over(c('--acc-1'), bg1), bg1);
  if (ring < 3) bad.push('foco --acc-1 / --bg-1 ' + ring.toFixed(2));
  return bad;
}

test('la Sidebar, la barra, la hoja y mi rincón solo usan colores de texto que cubre la guarda', () => {
  const used = textTokens(CSS);
  assert.ok(used.length >= 4, 'leí los colores: ' + used.join(', '));
  assert.deepEqual(used.filter((k) => !GUARDED.includes(k)), [], 'colores sin guarda: ' + used.join(', '));
});

test('la Sidebar le pide a la guarda los mismos tokens que la Bienvenida', () => {
  const m = SIDEBAR.match(/var TOKENS = (\[[^\]]+\])/);
  assert.ok(m, 'hay lista de tokens');
  const mine = JSON.parse(m[1].replace(/'/g, '"'));
  ['--bg-0', '--bg-1', '--tx-1', '--tx-3', '--muted', '--color-green', '--gn-gold', '--color-amber', '--acc-1',
    '--color-green-bg', '--color-amber-bg'].forEach((k) => assert.ok(mine.includes(k), 'leo ' + k));
});

test('en los 19 themes cada texto de la Sidebar llega a 4.5:1 y el foco a 3:1', () => {
  assert.equal(THEMES.length, 19, THEMES.map((t) => t.id).join(', '));
  const bad = THEMES.map(({ id, tokens }) => [id, failures(tokens)]).filter(([, f]) => f.length);
  assert.deepEqual(bad, [], bad.map(([id, f]) => id + ': ' + f.join(' · ')).join('\n'));
});

test('teclado: todo lo que se puede tocar tiene foco visible', () => {
  [/\.sbr-list a:focus-visible\{outline:2px solid var\(--acc-1\)/, /\.sbr-chg:focus-visible\{outline:2px/,
    /#sbrTabs \.sbr-tab:focus-visible\{outline:2px/, /#sbrSheet \.sbr-close:focus-visible\{outline:2px/,
    /\.shv-corner__link:focus-visible\{outline:2px/].forEach((re) => assert.match(CSS, re));
  // Ningún control propio quita el contorno.
  assert.doesNotMatch(CSS, /outline:\s*(none|0)\b/);
});

test('movimiento reducido: sin transición en la lista ni animación en la hoja', () => {
  assert.match(CSS, /@media \(prefers-reduced-motion:reduce\)\{:is\(#appSidebar,#sbrSheet\) \.sbr-list a\{transition:none\}\}/);
  assert.match(CSS, /@media \(prefers-reduced-motion:reduce\)\{#sbrSheet:not\(\[hidden\]\)\{animation:none\}\}/);
});

test('celular: controles de 44 px o más y un solo rincón a la vista', () => {
  const i = CSS.indexOf('@media (max-width:900px){#sideNavPanel');
  assert.ok(i >= 0, 'hay corte a 900 px');
  const mq = CSS.slice(i, CSS.indexOf('\n', i));
  assert.match(mq, /#sbrTabs \.sbr-tab\{[^}]*min-height:52px;min-width:44px/);
  assert.match(mq, /#sbrSheet \.sbr-close\{min-height:44px;min-width:44px/);
  assert.match(mq, /#sbrSheet \.sbr-chg\{min-height:44px\}/);
  assert.match(mq, /#sbrSheet \.sbr-list a\{min-height:48px\}/);
  assert.match(CSS, /@media \(max-width:900px\)\{#appSidebar>\.shv-corner\{display:none\}#sbrSheet \.shv-corner__link\{min-height:44px\}\}/);
  assert.match(CSS, /@media \(min-width:901px\)\{#sbrSheet>\.shv-corner\{display:none\}\}/);
});

test('lector de pantalla: los avisos visuales se leen como texto y las marcas quedan ocultas', () => {
  // «Falta permiso», «Nuevo» y el punto de «Más»: la marca es aria-hidden y el texto va en .sbr-sr.
  assert.match(SIDEBAR, /w\.className = 'sbr-w';\s*w\.setAttribute\('aria-hidden', 'true'\);[\s\S]{0,120}sr\.textContent = ' \(falta permiso\)'/);
  assert.match(SIDEBAR, /n\.className = 'sbr-new';\s*n\.setAttribute\('aria-hidden', 'true'\);[\s\S]{0,160}srn\.textContent = ' \(nuevo\)'/);
  assert.match(SIDEBAR, /dot\.className = 'sbr-dot is-warn';\s*dot\.setAttribute\('aria-hidden', 'true'\);[\s\S]{0,160}s2\.textContent = ' \(hay algo para revisar\)'/);
  assert.match(CSS, /\.sbr-sr\{position:absolute;width:1px;height:1px;[^}]*clip:rect\(0 0 0 0\)/);
  // La hoja es un diálogo con nombre; «Más» dice qué abre y si está abierta; la navegación tiene nombre.
  ["sheet.setAttribute('role', 'dialog')", "sheet.setAttribute('aria-modal', 'true')", "sheet.setAttribute('aria-labelledby', 'sbrSheetT')",
    "more.setAttribute('aria-haspopup', 'dialog')", "more.setAttribute('aria-controls', 'sbrSheet')",
    "tabs.setAttribute('aria-label', 'Navegación principal')", "nav.setAttribute('aria-label', 'Navegación de la Bóveda')",
    "a.setAttribute('aria-current', 'page')"].forEach((x) => assert.ok(SIDEBAR.includes(x), x));
});
