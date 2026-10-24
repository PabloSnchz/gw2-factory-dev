// Logros (BL-067, LOG-5): revisión final. Contraste AA en los 19 themes, teclado, lector de
// pantalla, movimiento reducido y celular, sobre los módulos de Logros. La guarda es la de la
// Bienvenida (Welcome._pure.contrastFixes), aplicada sobre #achievementsPanel por js/ach-view.js.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const MODULES = ['js/ach-view.js', 'js/ach-cards.js', 'js/ach-categories.js', 'js/ach-armory.js'];
const J = (v) => JSON.parse(JSON.stringify(v));

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
const W = loadWelcome();

// Colores de texto de los módulos: var(--x) o var(--x,#fallback).
const VAR = /^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/;
function textColors() {
  const out = new Map();
  MODULES.forEach((f) => read(f).replace(/(?:^|[{;'"])\s*color\s*:\s*([^;}'"!]+)/g, (m, v) => { out.set(v.trim(), f); return m; }));
  return out;
}
const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const HERO = [232, 163, 61, 0.10]; // el dorado suave de la cabecera de Logros (.achx-hero)
function surfaces(eff) {
  const p = (k) => W.parseColor(eff[k]);
  const bg0 = over(p('--bg-0'), [255, 255, 255, 1]);
  const bg1 = over(p('--bg-1') || p('--bg-0'), bg0);
  const bg2 = over(p('--bg-2') || p('--bg-1') || p('--bg-0'), bg1);
  return { bg0, bg1, bg2, hero: over(HERO, bg1) };
}

test('los módulos de Logros solo usan colores de texto del theme (los que cubre la guarda o pasan solos)', () => {
  const bad = [];
  for (const [v, f] of textColors()) {
    const m = v.match(VAR);
    if (!m || !['--tx-1', '--tx-2', '--acc-1', '--color-amber'].includes(m[1])) bad.push(f + ': ' + v);
  }
  assert.deepEqual(bad, []);
  assert.doesNotMatch(MODULES.map(read).join('\n'), /color:var\((--tx-3|--muted)/, 'el gris tenue no se usa como texto en Logros');
});

test('en los 19 themes cada texto de Logros llega a 4.5:1 (fondo, tarjeta y cabecera), el foco a 3:1 y las barras a 3:1', () => {
  assert.equal(THEMES.length, 19, THEMES.map((t) => t.id).join(', '));
  const fails = [];
  THEMES.forEach(({ id, tokens }) => {
    const eff = Object.assign({}, tokens, W.contrastFixes(tokens) || {});
    const S = surfaces(eff);
    for (const [v] of textColors()) {
      const m = v.match(VAR);
      const col = W.parseColor(eff[m[1]] || m[2]);
      assert.ok(col, id + ' ' + v + ' se puede leer');
      const on = m[1] === '--tx-1' || m[1] === '--tx-2' ? ['bg0', 'bg1', 'bg2', 'hero'] : ['bg0', 'bg1'];
      on.forEach((s) => { const r = W.contrast(over(col, S[s]), S[s]); if (r < 4.5) fails.push(id + ' ' + m[1] + '/' + s + ' ' + r.toFixed(2)); });
    }
    ['bg0', 'bg1'].forEach((s) => { const r = W.contrast(over(W.parseColor(eff['--acc-1']), S[s]), S[s]); if (r < 3) fails.push(id + ' foco/' + s + ' ' + r.toFixed(2)); });
    [['--color-green', '#3CC48A'], ['--color-amber', '#F2B94B']].forEach(([k, fb]) => {
      const r = W.contrast(over(W.parseColor(eff[k] || fb), S.bg2), S.bg2);
      if (r < 3) fails.push(id + ' barra ' + k + ' ' + r.toFixed(2));
    });
  });
  assert.deepEqual(fails, []);
});

// ach-view con lo mínimo para probar la guarda sobre #achievementsPanel.
function loadView(tokens, noWelcome) {
  const props = {};
  const panel = { id: 'achievementsPanel', attrs: { hidden: '' }, getAttribute: (k) => (k === 'hidden' ? '' : null), hidden: true,
    style: { setProperty: (k, v) => { props[k] = v; }, removeProperty: (k) => { delete props[k]; } } };
  const win = {
    console: { info() {}, warn() {} }, setTimeout, clearTimeout, Math, JSON, Map, addEventListener() {},
    getComputedStyle: () => ({ getPropertyValue: (k) => (tokens || {})[k] || '' }),
    Welcome: noWelcome ? undefined : { _pure: W }
  };
  win.window = win;
  win.document = { readyState: 'complete', documentElement: {}, getElementById: (id) => (id === 'achievementsPanel' ? panel : null), addEventListener() {} };
  vm.runInContext(read('js/ach-view.js'), vm.createContext(win));
  return { V: win.AchView, props };
}

test('la guarda se pone en #achievementsPanel, saca lo que ya no hace falta y sin la Bienvenida no inventa nada', () => {
  const notion = THEMES.find((t) => t.id === 'notion').tokens;
  const x = loadView(notion);
  x.V._guard();
  const want = J(W.contrastFixes(notion));
  assert.ok(Object.keys(want).length > 0, 'un theme claro necesita correcciones');
  assert.deepEqual(J(x.props), want);
  const gato = THEMES.find((t) => t.id === 'gato').tokens;
  x.V._guard(gato);
  assert.deepEqual(J(x.props), J(W.contrastFixes(gato)), 'lo que ya no hace falta se quita');
  const z = loadView(notion, true);
  z.V._guard();
  assert.deepEqual(J(z.props), {});
});

test('teclado: foco visible en pestañas, filtros, tarjetas y categorías; nadie quita el contorno', () => {
  const all = MODULES.map(read).join('\n');
  assert.doesNotMatch(all, /outline:\s*(none|0)\b/);
  assert.match(read('js/ach-view.js'), /#achxHead button:focus-visible,#achievementsPanel \[role=tabpanel\]:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(read('js/ach-cards.js'), /\.achc-bar button:focus-visible,\.achc-bar input:focus-visible,\.achc-bar select:focus-visible,\.achc-wiki:focus-visible,\.achc-armory:focus-visible,\.achc-link:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(read('js/ach-categories.js'), /#achxCats button\.achg-row:focus-visible,\.achg-seg button:focus-visible,\.achg-search input:focus-visible,\.achg-link:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(read('js/ach-view.js'), /e\.key === 'ArrowRight'[\s\S]*e\.key === 'ArrowLeft'[\s\S]*e\.key === 'Home'[\s\S]*e\.key === 'End'/, 'flechas, Inicio y Fin en las pestañas');
  assert.doesNotMatch(all, /tabindex="[1-9]/, 'sin saltos de orden artificiales');
});

test('lector de pantalla: pestañas con aria, un solo aviso corto al filtrar, mi línea educada y nombres en los enlaces', () => {
  const view = read('js/ach-view.js'), cards = read('js/ach-cards.js'), arm = read('js/ach-armory.js');
  assert.match(view, /role="tablist" aria-label="Secciones de Logros"/);
  assert.match(view, /<div id="achxVoice" class="achx-voice" aria-live="polite"><\/div>/);
  assert.match(cards, /id="achcCount" role="status" aria-live="polite"/);
  assert.match(cards, /role="progressbar" aria-valuemin="0" aria-valuemax="100"/);
  assert.match(cards, /aria-label="Buscar «' \+ esc\(name\) \+ '» en la wiki \(se abre en otra pestaña\)"/);
  assert.match(arm, /aria-label="Ver la legendaria «/);
  assert.doesNotMatch(read('js/achievements.js'), /aria-live/, 'la grilla no es región viva: no lee todas las tarjetas en cada filtro');
});

test('movimiento reducido y celular: sin animaciones propias en tarjetas y categorías; objetivos de 44 px', () => {
  assert.match(read('js/ach-view.js'), /prefers-reduced-motion:reduce\)\{#achxHead \*\{transition-duration:\.001ms!important;animation-duration:\.001ms!important/);
  ['js/ach-cards.js', 'js/ach-categories.js'].forEach((f) => assert.doesNotMatch(read(f), /transition|animation|@keyframes/, f));
  assert.match(read('js/ach-view.js'), /\.achx-tabs \[role=tab\]\{padding:8px 10px;font-size:\.86rem;min-height:44px\}/);
  assert.match(read('js/ach-cards.js'), /\.achc-seg button\{flex:1;min-height:44px\}/);
  assert.match(read('js/ach-cards.js'), /\.achc-wiki,\.achc-armory\{min-height:44px/);
});

test('se retiró achievements-theme.js: ni el archivo ni quien lo cargue', () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'js', 'achievements-theme.js')), false);
  assert.doesNotMatch(read('index.html'), /achievements-theme/);
  assert.doesNotMatch(read('js/modules.json'), /achievements-theme/);
  MODULES.concat(['js/achievements.js']).forEach((f) => assert.ok(Buffer.byteLength(read(f)) <= 40 * 1024, f + ' dentro de 40 KB'));
});
