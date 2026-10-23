// Bienvenida 2.2.0 (WEL-4): guarda de contraste y accesibilidad.
// Lee los 19 themes reales de css/themes/ y exige 4.5:1 (WCAG AA) en cada par texto/fondo que usa la
// Bienvenida, después de las correcciones locales que aplica #welcomePanel. Los themes no se tocan.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'welcome-panel.js'), 'utf8');
const THEMES_DIR = path.join(ROOT, 'css', 'themes');

function el() {
  const n = { children: [], attrs: {}, hidden: false, listeners: {}, _html: '', textContent: '', className: '' };
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); if (k === 'hidden') n.hidden = true; };
  n.removeAttribute = (k) => { if (k === 'hidden') n.hidden = false; };
  n.appendChild = (c) => { c.parentNode = n; n.children.push(c); return c; };
  n.insertBefore = (c) => { c.parentNode = n; n.children.unshift(c); return c; };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  Object.defineProperty(n, 'innerHTML', { get: () => n._html, set: (v) => { n._html = v; } });
  n.querySelector = (s) => (s === '.panel__body' ? n.body : s === '.wl-head' ? n.children.find((c) => c.className === 'wl-head') || null : null);
  return n;
}
function styleObj() {
  const props = {};
  return { props, setProperty: (k, v) => { props[k] = v; }, removeProperty: (k) => { delete props[k]; } };
}

function readTheme(file) {
  const css = fs.readFileSync(path.join(THEMES_DIR, file), 'utf8');
  const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'));
  const t = {};
  block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return t;
}
const THEMES = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css')).sort()
  .map((f) => ({ id: f.replace(/\.css$/, ''), tokens: readTheme(f) }));

function load(opts = {}) {
  const panel = el(); panel.body = el(); panel.style = styleObj();
  const head = el();
  const doc = {}, observers = [];
  let current = opts.theme || {};
  const documentElement = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; observers.forEach((f) => f()); } };
  const window = {
    console: { info() {}, warn() {}, log() {} },
    Storage: { STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys', THEME: 'gn:theme' }, get: () => null, set() {} },
    location: { hash: '' },
    addEventListener() {},
    getComputedStyle: () => ({ getPropertyValue: (k) => (k in current ? ' ' + current[k] : '') }),
    MutationObserver: function (cb) {
      this.observe = (n, o) => { if (o && o.attributes && (o.attributeFilter || []).includes('data-theme')) observers.push(cb); };
    },
  };
  window.document = {
    readyState: 'complete', head, documentElement,
    getElementById: (id) => (id === 'welcomePanel' ? panel : head.children.find((c) => c.id === id) || null),
    createElement: () => el(),
    addEventListener: (t, f) => { (doc[t] = doc[t] || []).push(f); },
  };
  vm.runInNewContext(SRC, { window, Date, JSON, Promise, Math });
  return { W: window.Welcome, P: window.Welcome._pure, panel, doc, documentElement, setTheme: (t) => { current = t; } };
}

const { P } = load();
const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);

// Los pares que usa la Bienvenida (CSS de welcome-panel.js y de la guía de shiruvana-places.js).
function failures(tokens) {
  const eff = Object.assign({}, tokens, JSON.parse(JSON.stringify(P.contrastFixes(tokens))));
  const c = (k) => { const v = P.parseColor(eff[k]); assert.ok(v, k + ' se puede leer: ' + eff[k]); return v; };
  const bg0 = over(c('--bg-0'), [255, 255, 255, 1]);
  const bg1 = over(c('--bg-1'), bg0);
  const on = (fg, bg) => over(c(fg), bg);
  const pairs = [];
  ['--tx-1', '--tx-2', '--tx-3', '--muted', '--color-green', '--gn-gold', '--color-amber', '--acc-1'].forEach((k) => {
    pairs.push([k + ' / --bg-0', on(k, bg0), bg0]);
    pairs.push([k + ' / --bg-1', on(k, bg1), bg1]);
  });
  const acc = on('--acc-1', bg1);
  pairs.push(['--bg-0 / --acc-1 (botón principal)', bg0, acc]);
  const gbg = on('--color-green-bg', bg1), abg = on('--color-amber-bg', bg1);
  pairs.push(['--color-green / --color-green-bg', on('--color-green', gbg), gbg]);
  pairs.push(['--gn-gold / --color-amber-bg', on('--gn-gold', abg), abg]);
  return pairs.map(([n, f, b]) => [n, P.contrast(f, b)]).filter(([, r]) => r < 4.5)
    .map(([n, r]) => n + ' ' + r.toFixed(2));
}

test('están los 19 themes y todos definen los tokens que leo', () => {
  assert.equal(THEMES.length, 19, THEMES.map((t) => t.id).join(', '));
  THEMES.forEach(({ id, tokens }) => {
    ['--bg-0', '--bg-1', '--tx-1', '--tx-3', '--acc-1', '--gn-gold', '--color-green', '--color-amber',
      '--color-green-bg', '--color-amber-bg'].forEach((k) => assert.ok(tokens[k], id + ' define ' + k));
  });
});

test('en los 19 themes cada texto de la Bienvenida llega a 4.5:1 (WCAG AA)', () => {
  const bad = THEMES.map(({ id, tokens }) => [id, failures(tokens)]).filter(([, f]) => f.length);
  assert.deepEqual(bad, [], bad.map(([id, f]) => id + ': ' + f.join(' · ')).join('\n'));
});

test('Gato Negro, el theme oficial, no necesita ninguna corrección', () => {
  const gato = THEMES.find((t) => t.id === 'gato');
  assert.deepEqual(JSON.parse(JSON.stringify(P.contrastFixes(gato.tokens))), {});
});

test('solo corrijo lo que falla y conservo el tono: en Notion el verde pasa a verde oscuro', () => {
  const notion = THEMES.find((t) => t.id === 'notion');
  const fx = JSON.parse(JSON.stringify(P.contrastFixes(notion.tokens)));
  assert.ok(fx['--color-green'], 'el verde de «listo» se corrige');
  const g = P.parseColor(fx['--color-green']);
  assert.ok(g[1] > g[0] && g[1] > g[2], 'sigue siendo verde: ' + fx['--color-green']);
  assert.ok(fx['--color-green-bg'], 'el tinte oscuro se rehace sobre la superficie clara');
  assert.equal(fx['--tx-1'], undefined, 'el texto principal no se toca');
  const tokyo = THEMES.find((t) => t.id === 'tokyo-night').tokens;
  const tf = JSON.parse(JSON.stringify(P.contrastFixes(tokyo)));
  const lum = (h) => P.contrast(P.parseColor(h), [0, 0, 0, 1]);
  assert.ok(tf['--tx-3'] && tf['--tx-3'].toLowerCase() !== tokyo['--tx-1'].toLowerCase(), 'en Tokyo Night el texto tenue se aclara sin volverse texto principal');
  assert.ok(lum(tf['--tx-3']) > lum(tokyo['--tx-3']), 'en un theme oscuro, corregir es aclarar');
  const ps5 = THEMES.find((t) => t.id === 'ps5');
  assert.equal(JSON.parse(JSON.stringify(P.contrastFixes(ps5.tokens)))['--acc-1'], undefined, 'un acento que ya pasa no se toca');
});

test('valores raros o vacíos no rompen nada', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(P.contrastFixes({}))), {});
  assert.deepEqual(JSON.parse(JSON.stringify(P.contrastFixes({ '--bg-0': 'var(--x)', '--tx-1': '#fff' }))), {});
  assert.equal(P.parseColor('rebeccapurple'), null);
  assert.deepEqual(JSON.parse(JSON.stringify(P.parseColor('#abc'))), [170, 187, 204, 1]);
  assert.deepEqual(JSON.parse(JSON.stringify(P.parseColor('rgba(255, 255, 255, 0.6)'))), [255, 255, 255, 0.6]);
});

test('aplico las correcciones en #welcomePanel y las saco cuando el theme nuevo ya no las necesita', () => {
  const notion = THEMES.find((t) => t.id === 'notion').tokens;
  const gato = THEMES.find((t) => t.id === 'gato').tokens;
  const x = load({ theme: notion });
  x.W.activate();
  assert.ok(x.panel.style.props['--color-green'], 'render aplica la guarda');
  x.setTheme(gato);
  x.documentElement.setAttribute('data-theme', 'gato');
  assert.deepEqual(JSON.parse(JSON.stringify(x.panel.style.props)), {}, 'al volver a Gato Negro no queda nada');
  x.setTheme(notion);
  (x.doc.load || []).forEach((f) => f({ target: { id: 'themeStylesheet' } }));
  assert.ok(x.panel.style.props['--color-green'], 'cuando termina de cargar la hoja del theme, vuelvo a medir');
  const before = JSON.stringify(x.panel.style.props);
  (x.doc.load || []).forEach((f) => f({ target: { id: 'otraHoja' } }));
  assert.equal(JSON.stringify(x.panel.style.props), before, 'otras cargas no me importan');
});

test('accesibilidad: grupos con nombre, barra de progreso con nombre y foco visible en «Ver cuáles»', () => {
  const m = P.buildModel({ keys: [{ label: 'A', value: 'k', perms: ['account'] }], selected: 'k' });
  const html = P.headHTML(m) + P.bodyHTML(m, []);
  assert.match(html, /class="wl-pills" role="group" aria-label="Estado de tu Bóveda"/);
  assert.match(html, /class="wl-soc" role="group" aria-label="Comunidad"/);
  assert.match(html, /role="progressbar" aria-label="Configuración de tu Bóveda"/);
  assert.match(P.CSS, /#welcomePanel summary:focus-visible[,{]/);
  // Todo lo que se puede tocar es un control nativo: nada de clics en div/span/li.
  assert.doesNotMatch(html, /<(div|span|li|i)\b[^>]*\b(data-act|onclick|tabindex)=/);
  assert.match(P.CSS, /prefers-reduced-motion/);
});

test('celular: a 720 px los controles miden 44 px y la grilla de módulos pasa a dos columnas', () => {
  const i = P.CSS.indexOf('@media (max-width:720px)');
  assert.ok(i >= 0, 'hay corte a 720 px');
  const mq = P.CSS.slice(i, P.CSS.indexOf('\n', i));
  assert.match(mq, /\.wl-btn,#welcomePanel \.wl-pill\{min-height:44px/);
  assert.match(mq, /\.wl-mods\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(mq, /\.wl-pills\{flex-wrap:nowrap;overflow-x:auto/);
  assert.match(P.CSS, /@media \(max-width:980px\)/);
});
