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

test('gato.css usa la paleta del Gato Design System', () => {
  assert.equal(g['--bg'], '#0F1117', 'obsidiana-950');
  assert.equal(g['--panel'], '#1A1F2B', 'obsidiana-900');
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
