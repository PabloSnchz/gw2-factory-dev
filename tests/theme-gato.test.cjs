// Theme oficial "Gato Negro" (DEC-025): construido con el Gato Design System y legible (WCAG 2.1 AA).
// Si un color cambia y deja de cumplir el contraste, este test falla.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const vars = (css) => Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const GATO = read('css/themes/gato.css');
const BOVEDA = read('css/themes/boveda.css');
const g = vars(GATO);

function lum(hex) {
  const c = hex.replace('#', '');
  const ch = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

test('gato.css define todas las variables que usa la Bóveda (las mismas que el theme Bóveda)', () => {
  const missing = Object.keys(vars(BOVEDA)).filter((k) => !(k in g));
  assert.deepEqual(missing, []);
});

test('gato.css aplica también sin data-theme (theme por defecto) y sin BOM', () => {
  assert.match(GATO, /:root,\s*\[data-theme="gato"\]\s*\{/);
  assert.ok(!GATO.startsWith('\uFEFF'));
});

test('gato.css usa la paleta del Gato Design System, con la obsidiana de mi universo (BV-6)', () => {
  assert.equal(g['--bg'], '#0B0B10', 'obsidiana del universo: fondo');
  assert.equal(g['--panel'], '#15151D', 'obsidiana del universo: superficie');
  assert.equal(g['--text'], '#F4F6FA', 'niebla-50');
  assert.equal(g['--acc-1'], '#A896FF', 'arcano-300');
  assert.equal(g['--gn-gold'], '#F2B94B', 'ámbar-500');
});

test('contraste: todo texto del theme Gato cumple AA (4.5:1) sobre sus fondos', () => {
  const texts = ['--text', '--tx-1', '--tx-2', '--tx-3', '--muted', '--acc-1', '--acc-2', '--acc-warn', '--acc-err',
    '--gn-gold', '--gn-gold-2', '--accent', '--accent-2', '--color-green', '--color-amber', '--color-red', '--color-blue',
    '--color-gray', '--gw-muted', '--gw-ok', '--gw-bad'];
  const backs = ['--bg', '--bg-0', '--bg-1', '--bg-2', '--panel', '--btn', '--gw-card-bg'];
  const fails = [];
  for (const t of texts) for (const b of backs) {
    const r = ratio(g[t], g[b]);
    if (r < 4.5) fails.push(`${t} sobre ${b} = ${r.toFixed(2)}`);
  }
  for (const k of ['green', 'amber', 'red', 'blue', 'gray']) {
    const r = ratio(g[`--color-${k}`], g[`--color-${k}-bg`]);
    if (r < 4.5) fails.push(`--color-${k} sobre --color-${k}-bg = ${r.toFixed(2)}`);
  }
  assert.deepEqual(fails, []);
});

test('contraste: bordes de controles visibles (3:1)', () => {
  assert.ok(ratio(g['--btn-border'], g['--btn']) >= 3 || ratio(g['--btn-border'], g['--bg']) >= 3, 'borde de botón');
  assert.ok(ratio(g['--btn-border'], g['--bg']) >= 3, 'borde de botón sobre el fondo');
});

// BL-092 BV-6a: los paneles son de la misma familia que el fondo y mi globo de css/universo.css.
const UNI = read('css/universo.css');
const OLD = ['#0F1117', '#1A1F2B', '#2E3649', '#232A3A', '#3B4560', '#6B7690', '#1D3436', '#38352F', '#392630', '#212E49', '#1E2A2B', '#151C1F', '#22263A'];
function mixHex(fg, bg, a) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const f = p(fg), b = p(bg);
  return f.map((v, i) => Math.round(b[i] + (v - b[i]) * a));
}

test('BV-6: fondo, superficies y bordes son los de mi universo, sin el gris azulado de antes', () => {
  for (const k of ['--bg', '--bg-0']) assert.equal(g[k], '#0B0B10', k);
  for (const k of ['--bg-1', '--bg-2', '--panel', '--gw-card-bg']) assert.equal(g[k], '#15151D', k);
  for (const k of ['--bd-1', '--panel-border', '--gw-card-borda']) assert.equal(g[k], '#2A2A38', k);
  assert.match(UNI, /:root:is\(\[data-theme="gato"\],:not\(\[data-theme\]\)\) \{ background: #0B0B10; \}/, 'el fondo del universo es el mismo');
  assert.match(UNI, /--svk-bg|#15151D/, 'mi globo usa la misma superficie');
  const left = OLD.filter((h) => GATO.toUpperCase().replace(/\/\*[\s\S]*?\*\//g, '').includes(h));
  assert.deepEqual(left, [], 'no queda ningún color azulado de antes');
});

test('BV-6: cada tinte semántico es su color al 14 % sobre la superficie (y se sigue leyendo)', () => {
  for (const k of ['green', 'amber', 'red', 'blue']) {
    const want = mixHex(g['--color-' + k], g['--panel'], 0.14);
    const got = [1, 3, 5].map((i) => parseInt(g['--color-' + k + '-bg'].slice(i, i + 2), 16));
    got.forEach((v, i) => assert.ok(Math.abs(v - want[i]) <= 1, '--color-' + k + '-bg canal ' + i + ': ' + v + ' vs ' + want[i]));
  }
});

test('BV-6: la muestra del selector y la barra del navegador usan los colores nuevos', () => {
  const sel = read('js/theme-selector.js').match(/id: 'gato',[^\n]*colors: \['(#\w+)', '(#\w+)'/);
  assert.ok(sel, 'muestra de Gato Negro en el selector');
  assert.equal(sel[1], g['--bg']);
  assert.equal(sel[2], g['--panel']);
  assert.match(read('index.html'), new RegExp('<meta name="theme-color" content="' + g['--bg'] + '"/>'));
});
