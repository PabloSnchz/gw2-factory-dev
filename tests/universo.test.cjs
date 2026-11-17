// BL-092 (BV-1): La Bóveda en mi universo, solo con el theme Gato Negro.
// Vigila las reglas de css/universo.css: todo con el theme oficial, nada en los otros 18,
// sin tocar tokens, ambiente que no se lleva clics, y celular / «reducir movimiento».
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'universo.css'), 'utf8');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SCOPE = ':root:is([data-theme="gato"],:not([data-theme]))';

// Reglas de estilo (selector + cuerpo), entrando en @media; sin comentarios ni @keyframes.
function rules(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  (function walk(s) {
    let i = 0;
    while (i < s.length) {
      const open = s.indexOf('{', i);
      if (open < 0) break;
      const head = s.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (j < s.length && depth) { if (s[j] === '{') depth++; else if (s[j] === '}') depth--; j++; }
      const body = s.slice(open + 1, j - 1);
      if (/^@media/.test(head)) walk(body);
      else if (!/^@keyframes/.test(head)) out.push({ sel: head, body, media: null });
      i = j;
    }
  })(src);
  return out;
}
// Separa «a, b» respetando paréntesis: la coma de :is(…, …) no corta.
function splitSel(sel) {
  const out = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (ch === ',' && !depth) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}
function media(css, q) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const at = src.indexOf('@media ' + q);
  assert.ok(at >= 0, 'falta @media ' + q);
  let depth = 0, j = src.indexOf('{', at);
  const start = j;
  do { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; } while (depth && j < src.length);
  return src.slice(start + 1, j - 1);
}

test('index.html carga css/universo.css después del theme, con la versión del archivo', () => {
  const link = HTML.match(/<link rel="stylesheet" href="css\/universo\.css\?v=([\d.]+)">/);
  assert.ok(link, 'falta el <link> de universo.css');
  assert.ok(link.index > HTML.indexOf('id="themeStylesheet"'), 'va después del theme: le gana por orden a igual especificidad');
  assert.equal(link[1], (CSS.match(/Versión: ([\d.]+)/) || [])[1], 'el ?v coincide con la versión del archivo (caché, RSK-020)');
  assert.ok(Buffer.byteLength(HTML) <= 48 * 1024, 'index.html no pasa los 48 KB');
});

test('cada regla es solo para el theme Gato Negro (y el primer pintado, antes del JS)', () => {
  const rs = rules(CSS);
  assert.ok(rs.length >= 15, 'hay reglas');
  rs.forEach((r) => splitSel(r.sel).forEach((s) => {
    assert.ok(s.trim().startsWith(SCOPE), 'sin el alcance del theme: ' + s.trim());
  }));
});

test('no toca tokens del theme ni usa !important', () => {
  rules(CSS).forEach((r) => {
    assert.doesNotMatch(r.body, /(^|;|\s)--[\w-]+\s*:/, 'define un token en ' + r.sel);
    assert.doesNotMatch(r.body, /!important/, '!important en ' + r.sel);
  });
});

test('fondo y chispas: fijos, detrás de todo y sin llevarse clics', () => {
  const by = (s) => rules(CSS).filter((r) => r.sel === SCOPE + ' ' + s);
  const bg = by('body::before')[0], sp = by('body::after')[0];
  [bg, sp].forEach((r) => {
    assert.match(r.body, /position:\s*fixed/);
    assert.match(r.body, /z-index:\s*-1/);
    assert.match(r.body, /pointer-events:\s*none/);
  });
  assert.match(bg.body, /48px/, 'la cuadrícula del Taller (D1)');
  // Dos tandas iguales separadas 100vh: la vuelta de la animación no salta.
  const dots = sp.body.match(/(\d+)vw (\d+)vh/g).map((d) => d.split(' ').map(parseFloat));
  const a = dots.filter((d) => d[1] < 100), b = dots.filter((d) => d[1] >= 100);
  assert.equal(a.length, b.length);
  a.forEach((d, i) => assert.deepEqual([b[i][0], b[i][1] - 100], d));
  assert.match(CSS, /@keyframes gn-uv-chispas\s*\{\s*from\s*\{\s*transform:\s*translateY\(0\);\s*\}\s*to\s*\{\s*transform:\s*translateY\(-100vh\);/);
});

test('celular: menos chispas; «reducir movimiento» las apaga; nada de backdrop-filter', () => {
  const m = media(CSS, '(max-width: 640px)');
  rules(CSS).forEach((r) => assert.doesNotMatch(r.body, /backdrop-filter/, 'backdrop-filter en ' + r.sel));
  const full = (CSS.match(/body::after\s*\{[\s\S]*?\}/) || [''])[0].match(/vh/g).length;
  const few = (m.match(/body::after\s*\{[\s\S]*?\}/) || [''])[0].match(/vh/g).length;
  assert.ok(few > 0 && few < full, 'menos chispas en el celular');
  assert.match(media(CSS, '(prefers-reduced-motion: reduce)'), /body::after\s*\{[^}]*display:\s*none/);
});

test('barra lateral: el activo con el color de su módulo, y le gana a sidebar-nav.js', () => {
  const act = rules(CSS).find((r) => /\.sbr-list a\.is-active$/.test(r.sel));
  assert.ok(act, 'falta el activo');
  assert.match(act.body, /color-mix\(in srgb, var\(--x/);
  const sbr = fs.readFileSync(path.join(ROOT, 'js', 'sidebar-nav.js'), 'utf8');
  assert.match(sbr, /SIDE \+ ' \.sbr-list a\.is-active\{/, 'la regla que piso sigue existiendo así');
  // sidebar-nav.js la escribe en un <style> que llega después: gano por especificidad (+ :root y el theme).
});

test('presupuesto: universo.css entra holgado en 40 KB', () => {
  assert.ok(Buffer.byteLength(CSS) <= 40 * 1024);
});
