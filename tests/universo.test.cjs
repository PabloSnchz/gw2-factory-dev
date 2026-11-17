// BL-092 (BV-1, BV-2): La Bóveda en mi universo, solo con el theme Gato Negro.
// Vigila las reglas de css/universo.css: todo con el theme oficial, nada en los otros 18,
// sin tocar tokens, ambiente que no se lleva clics, y celular / «reducir movimiento».
// BV-2: los títulos y los indicadores que pinta existen en las vistas, el antetítulo no entra
// en el nombre de la región y cada módulo va en el color de su botón de la barra lateral.
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
// Todo el código de las vistas (index.html y js/), para ver que lo que pinto existe.
const SOURCES = [HTML].concat(fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f))
  .map((f) => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'))).join('\n');

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

// ---------------------------------------------------------------- BV-2: cabeceras
// id del título → [módulo de la barra lateral, grupo]. El orden de los grupos es el que eligió Pablo.
const TITLES = {
  metaTitle: ['meta', 'Lo diario'], wvxTitle: ['wv', 'Lo diario'], avTitle: ['activities', 'Lo diario'],
  hsTitle: ['homestead', 'Lo diario'], rvTitle: ['raids', 'Lo semanal'], achxTitle: ['achievements', 'Tu progreso'],
  ivTitle: ['characters', 'Tu progreso'], armTitle: ['armory', 'Tu progreso'], bldTitle: ['builds', 'Tu progreso'],
  cvTitle: ['accounts', 'Tu cuenta'], welcomeTitle: ['home', 'Bienvenida']
};
// El rosa de la Armería no llega a AA en letra chica sobre su propia cabecera: va aclarado con el texto del theme.
const LIGHTER = { armory: '#E868D4' };
const STATS = ['wvx-st', 'achx-st', 'rv-st', 'av-st', 'iv-st', 'hs-st', 'arm-st', 'cv-st', 'bld-st'];
function sidebarColor(mod) {
  const sbr = fs.readFileSync(path.join(ROOT, 'js', 'sidebar-nav.js'), 'utf8');
  if (mod === 'home') return '#A896FF'; // Inicio usa --acc-1, que en el theme Gato Negro es #A896FF
  const m = sbr.match(new RegExp("id: '" + mod + "',[^}]*?color: '(#[0-9A-Fa-f]{6})'"));
  assert.ok(m, 'la barra lateral no tiene el módulo ' + mod);
  return m[1].toUpperCase();
}

test('BV-2 antetítulo: cada título lleva su grupo, en el color de su módulo y fuera del nombre de la región', () => {
  Object.keys(TITLES).forEach((id) => {
    const [mod, label] = TITLES[id];
    const r = rules(CSS).find((x) => x.sel === SCOPE + ' #' + id + '::before');
    assert.ok(r, 'falta el antetítulo de #' + id);
    assert.match(r.body, new RegExp('content:\\s*"' + label + '"\\s*/\\s*""'), '#' + id + ': «' + label + '» con texto alternativo vacío');
    assert.equal((r.body.match(/color:\s*(#[0-9A-Fa-f]{6})/) || [])[1].toUpperCase(), LIGHTER[mod] || sidebarColor(mod), '#' + id + ': el color de su botón');
  });
  const cartera = rules(CSS).find((x) => x.sel === SCOPE + ' :is(#walletTitle,#walletDashboardPanel .wn-hero .panel__title)::before');
  assert.ok(cartera, 'falta el antetítulo de la Cartera (Mi cartera y Todas las cuentas)');
  assert.match(cartera.body, /content:\s*"Tu oro"\s*\/\s*""/);
  assert.equal((cartera.body.match(/color:\s*(#[0-9A-Fa-f]{6})/) || [])[1].toUpperCase(), sidebarColor('cards'));
  // Ningún antetítulo sin texto alternativo vacío: el nombre de la región sigue siendo el título.
  rules(CSS).filter((x) => /Title[^,]*::before|panel__title\)::before/.test(x.sel) && /content:/.test(x.body))
    .forEach((x) => assert.match(x.body, /content:\s*"[^"]+"\s*\/\s*""/, 'sin texto alternativo vacío: ' + x.sel));
});

test('BV-2 antetítulo: la regla común no pone color (si no, por :is() le ganaría al de cada módulo)', () => {
  const base = rules(CSS).find((x) => /::before$/.test(x.sel) && /text-transform:\s*uppercase/.test(x.body) && /#welcomeTitle/.test(x.sel));
  assert.ok(base, 'falta la regla común del antetítulo');
  assert.doesNotMatch(base.body, /(^|[;\s])color:/);
  assert.match(base.body, /display:\s*block/);
});

test('BV-2 los títulos y los indicadores que pinto existen en las vistas', () => {
  Object.keys(TITLES).concat(['walletTitle']).forEach((id) => {
    assert.ok(SOURCES.indexOf('id="' + id + '"') >= 0, 'ninguna vista tiene id="' + id + '": si cambió, cambialo acá y en universo.css');
  });
  assert.match(SOURCES, /wn-hero[\s\S]*class="panel__title"/, 'Todas las cuentas: el título de la Cartera dentro de .wn-hero');
  STATS.forEach((c) => assert.ok(SOURCES.indexOf('class="' + c + '"') >= 0, 'ninguna vista tiene class="' + c + '"'));
});

// Contraste WCAG: antetítulo (letra chica) ≥ 4.5 sobre la cabecera teñida con el 12 % del módulo
// (js/gn-shell.js) encima de la tarjeta del theme (#1A1F2B); cifras ≥ 4.5 sobre su caja (#0F1117).
function lum(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
}
function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function tint(c, t) {
  return '#' + [1, 3, 5].map((i) => Math.round(parseInt(c.slice(i, i + 2), 16) * t + parseInt('#1A1F2B'.slice(i, i + 2), 16) * (1 - t))
    .toString(16).padStart(2, '0')).join('');
}
test('BV-2 contraste AA: cada antetítulo sobre su cabecera y las cifras sobre su caja', () => {
  rules(CSS).filter((x) => /::before$/.test(x.sel) && /content:\s*"/.test(x.body) && /Title|panel__title/.test(x.sel)).forEach((x) => {
    const c = x.body.match(/color:\s*(#[0-9A-Fa-f]{6})/)[1];
    const id = (x.sel.match(/#(\w+Title)/) || [])[1];
    const mod = id === 'walletTitle' ? 'cards' : TITLES[id][0];
    const bg = tint(sidebarColor(mod), 0.12);
    assert.ok(ratio(c, bg) >= 4.5, x.sel + ': ' + c + ' sobre ' + bg + ' da ' + ratio(c, bg).toFixed(2));
  });
  assert.ok(ratio('#E8B34B', '#0F1117') >= 4.5);
});

test('BV-2 cifras en ámbar en las 9 cabeceras; el tamaño nuevo del título solo en la compu', () => {
  const r = rules(CSS).find((x) => /> b$/.test(x.sel) && /\.wvx-st/.test(x.sel));
  assert.ok(r, 'falta la regla de las cifras');
  STATS.forEach((c) => assert.ok(r.sel.indexOf('.' + c) >= 0, 'faltan las cifras de .' + c));
  assert.ok(r.sel.indexOf('#buildsPanel .bld-st') >= 0, 'Builds escribe sus reglas con #buildsPanel: hace falta para ganarle');
  assert.match(r.body, /color:\s*#E8B34B/);
  const big = media(CSS, '(min-width: 901px)');
  assert.match(big, /font-size:\s*1\.45rem/);
  rules(CSS.replace(big, '')).forEach((x) => {
    if (/Title/.test(x.sel) && !/::before/.test(x.sel)) assert.doesNotMatch(x.body, /font-size/, 'el tamaño del título va solo en la compu');
  });
});
