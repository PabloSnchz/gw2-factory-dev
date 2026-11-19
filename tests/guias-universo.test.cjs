// BL-094: las guías de usuario en mi universo, solo con el theme Gato Negro (FEAT-028).
// Vigila css/guias.css (mismas reglas que css/universo.css: todo con el theme oficial, nada en los otros 18,
// sin tocar tokens) y que cada guía migrada cargue el universo con la versión real de cada archivo.
// GU-1: «Primeros pasos». GU-2: la «Guía por módulo» (cada módulo ya es un .modsec con el color de su botón).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const CSS = read('css/guias.css');
const UNIVERSO = read('css/universo.css');
const SCOPE = ':root:is([data-theme="gato"],:not([data-theme]))';
const MIGRATED = ['docs/user-guide.html', 'docs/user-guide-avanzado.html'];
const version = (css) => (css.match(/Versión: ([\d.]+)/) || [])[1];

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
      else if (!/^@keyframes/.test(head)) out.push({ sel: head, body });
      i = j;
    }
  })(src);
  return out;
}
function splitSel(sel) {
  const out = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (ch === ',' && !depth) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}

test('css/guias.css: cada regla es solo para el theme Gato Negro (y el primer pintado)', () => {
  const rs = rules(CSS);
  assert.ok(rs.length >= 15, 'hay reglas');
  rs.forEach((r) => splitSel(r.sel).forEach((s) => assert.ok(s.trim().startsWith(SCOPE), 'sin el alcance del theme: ' + s.trim())));
});

test('css/guias.css: no toca tokens, sin !important ni backdrop-filter, holgado en 40 KB', () => {
  rules(CSS).forEach((r) => {
    assert.doesNotMatch(r.body, /(^|;|\s)--[\w-]+\s*:/, 'define un token en ' + r.sel);
    assert.doesNotMatch(r.body, /!important/, '!important en ' + r.sel);
    assert.doesNotMatch(r.body, /backdrop-filter/, 'backdrop-filter en ' + r.sel);
  });
  assert.ok(Buffer.byteLength(CSS) <= 40 * 1024);
  assert.ok(version(CSS), 'tiene «Versión: x.y.z» en la cabecera');
});

test('css/guias.css: el fondo «Taller» no se copia, sale de css/universo.css (una sola fuente)', () => {
  assert.doesNotMatch(CSS.replace(/\/\*[\s\S]*?\*\//g, ''), /body::(before|after)|gn-uv-chispas/);
  assert.match(UNIVERSO, /body::before\s*\{[\s\S]*?48px/, 'universo.css sigue trayendo la cuadrícula del Taller');
});

test('css/guias.css: el antetítulo no entra en el nombre del título (texto alternativo vacío)', () => {
  const ante = rules(CSS).filter((r) => /::before$/.test(r.sel) && /content:\s*"/.test(r.body));
  assert.ok(ante.length >= 1, 'hay antetítulo');
  ante.forEach((r) => assert.match(r.body, /content:\s*"[^"]+"\s*\/\s*""/, r.sel));
});

for (const guide of MIGRATED) {
  const html = read(guide);

  test(`${guide}: carga el theme, después css/universo.css y después css/guias.css, con su versión real`, () => {
    const at = (re) => { const m = html.match(re); assert.ok(m, 'falta ' + re); return m; };
    const theme = html.indexOf('id="themeStylesheet"');
    const uni = at(/<link rel="stylesheet" href="\.\.\/css\/universo\.css\?v=([\d.]+)">/);
    const gui = at(/<link rel="stylesheet" href="\.\.\/css\/guias\.css\?v=([\d.]+)">/);
    assert.ok(theme > 0 && uni.index > theme && gui.index > uni.index, 'orden: theme → universo → guías');
    assert.ok(gui.index < html.indexOf('<style>'), 'antes del <style> de la guía, que es para los 19 themes');
    assert.equal(uni[1], version(UNIVERSO), 'el ?v de universo.css es el del archivo (caché)');
    assert.equal(gui[1], version(CSS), 'el ?v de guias.css es el del archivo (caché)');
    // la Bóveda pide la misma versión de universo.css
    assert.ok(read('index.html').includes('href="css/universo.css?v=' + uni[1] + '"'), 'misma versión que index.html');
  });

  if (guide === 'docs/user-guide.html') test(`${guide}: cada capítulo es un panel con su color y su título, numerado en orden`, () => {
    const secs = [...html.matchAll(/<section class="sec" style="--x:(#[0-9A-F]{6})" aria-labelledby="([\w-]+)">([\s\S]*?)<\/section>/g)];
    const h2 = (html.match(/<h2[ >]/g) || []).length;
    assert.ok(secs.length >= 5, 'hay capítulos');
    assert.equal(secs.length, h2, 'cada título de capítulo va en su panel');
    secs.forEach((m, i) => {
      const id = m[2];
      assert.ok(m[3].includes('<h2 id="' + id + '"><span class="num">' + (i + 1) + '.</span> '), id + ': el panel se nombra con su título y el número ' + (i + 1));
      assert.equal((m[3].match(/<h2[ >]/g) || []).length, 1, id + ': un solo título por panel');
    });
  });

  if (guide === 'docs/user-guide-avanzado.html') test(`${guide}: cada módulo es un panel del universo con el color de su botón`, () => {
    const secs = [...html.matchAll(/<section class="modsec" id="mod-(\w+)"([^>]*)>/g)];
    assert.ok(secs.length >= 13, 'Inicio, los 10 módulos, Keys y Ajustes');
    assert.equal(secs.length, (html.match(/<h2[ >]/g) || []).length, 'cada título va en su panel');
    secs.forEach((m) => assert.match(m[2], /^( style="--x:#[0-9A-F]{6}")?$/, m[1] + ': solo el color del módulo en línea'));
    const panel = rules(CSS).find((r) => /:is\(\.sec, \.modsec\)$/.test(r.sel) && /border-top:\s*3px solid var\(--x/.test(r.body));
    assert.ok(panel, 'guias.css pinta .modsec como panel de La Guarida');
    assert.match(panel.body, /linear-gradient\(180deg, #1C1C26, #15151D/);
    ['.wrap > .box', '.toc a', '.chips code', '.keys code', '.uso dt'].forEach((s) =>
      assert.ok(rules(CSS).some((r) => r.sel.endsWith(s)), 'falta el estilo de ' + s));
    const toc = rules(CSS).find((r) => r.sel.endsWith('.toc a'));
    assert.doesNotMatch(toc.body, /min-height|display/, 'el alto de 44 px lo da la guía: no se pisa');
  });
}

// Contraste WCAG sobre el panel del universo (#1C1C26 arriba, #15151D abajo).
function lum(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
}
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test('contraste AA: el texto del theme Gato Negro y el ámbar sobre el panel, el código y la página', () => {
  const tok = (k) => read('css/themes/gato.css').match(new RegExp(k + ':\\s*(#[0-9A-Fa-f]{6})'))[1];
  const fondos = ['#1C1C26', '#15151D', '#2A2A38', '#0B0B10'];
  // todo color de texto que pone guias.css (no los bordes ni los fondos), más el texto del theme
  const textos = [...new Set(rules(CSS).flatMap((r) => [...r.body.matchAll(/(?:^|[;\s])color:\s*(#[0-9A-Fa-f]{6})/g)].map((m) => m[1].toUpperCase())))];
  assert.ok(textos.length >= 2, 'guias.css pone colores de texto');
  [tok('--tx-1'), tok('--tx-2')].concat(textos).forEach((c) => fondos.forEach((bg) => {
    assert.ok(ratio(c, bg) >= 4.5, c + ' sobre ' + bg + ' da ' + ratio(c, bg).toFixed(2));
  }));
  assert.match(CSS, /#E8B34B/, 'el ámbar del universo');
});
