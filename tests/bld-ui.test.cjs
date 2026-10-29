// BL-082 BUI-5 y BUI-6: guarda de Builds en los 19 temas, teclado, lector de pantalla, celular y rendimiento.
// BUI-6b: el marco de Cuentas (gradiente del módulo en el panel) y las tarjetas con el tinte de las 9 profesiones.
// El contraste se calcula con los porcentajes que de verdad usa el CSS de bld-view/bld-lib/bld-editor y con los
// tokens reales de css/themes/: si alguien sube una mezcla o agrega un tema que no llega a WCAG AA, falla acá.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BLD = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /^bld-.*\.js$/.test(f)).sort();
const SRC = {};
BLD.forEach((f) => { SRC[f] = read('js/' + f); });
const VIEW = SRC['bld-view.js'], LIB = SRC['bld-lib.js'], ED = SRC['bld-editor.js'];

// ------------------------------------------------------------------ color
function parse(v) {
  if (!v) return null;
  v = String(v).trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = h.split('').map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i.exec(v);
  return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null;
}
const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const mix = (a, b, p) => [0, 1, 2].map((i) => a[i] * p + b[i] * (1 - p)).concat(1);
const lum = (c) => {
  const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const DIR = path.join(ROOT, 'css', 'themes');
const THEMES = fs.readdirSync(DIR).filter((f) => f.endsWith('.css')).sort().map((f) => {
  const css = fs.readFileSync(path.join(DIR, f), 'utf8');
  const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'));
  const t = {};
  block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return { id: f.replace(/\.css$/, ''), t };
});

// Lo que dice el CSS (si cambia la forma, el test lo avisa en vez de medir otra cosa).
function pct(src, re, what) { const m = re.exec(src); assert.ok(m, 'encuentro en el CSS: ' + what); return Number(m[1]) / 100; }
function op(src, re, what) { const m = re.exec(src); assert.ok(m, 'encuentro en el CSS: ' + what); return Number('0.' + m[1]); }
const CFG = {
  color: /var COLOR = '(#[0-9A-Fa-f]{6})'/.exec(VIEW)[1],
  mod: pct(VIEW, /'\{--gn-mod:color-mix\(in srgb,' \+ COLOR \+ ' (\d+)%,var\(--tx-1\)\)/, '--gn-mod mezclado con el texto'),
  ok: pct(VIEW, /--bld-ok:color-mix\(in srgb,var\(--color-green,#3fb950\) (\d+)%,var\(--tx-1\)\)/, '--bld-ok'),
  err: pct(VIEW, /--bld-err:color-mix\(in srgb,var\(--color-red,#F47C7C\) (\d+)%,var\(--tx-1\)\)/, '--bld-err'),
  focus: pct(VIEW, /--bld-focus:color-mix\(in srgb,var\(--acc-1\) (\d+)%,var\(--tx-1\)\)/, '--bld-focus'),
  hero: pct(VIEW, /background:linear-gradient\(180deg,color-mix\(in srgb,' \+ COLOR \+ ' (\d+)%,transparent\),transparent 300px\)/, 'gradiente del módulo en el panel'),
  tint: pct(VIEW, /\.bld-card\.bld-band\{[^}]*color-mix\(in srgb,var\(--bld-prof,var\(--gn-mod\)\) (\d+)%,var\(--bg-1\)\) 56px/, 'tinte de la profesión detrás del texto'),
  prof: (/var PROF_COLOR = \{([^}]*)\}/.exec(VIEW) || ['', ''])[1].match(/#[0-9A-Fa-f]{6}/g) || [],
  prim: pct(VIEW, /\.bld-btn\.is-primary\{background:color-mix\(in srgb,var\(--gn-mod\) (\d+)%,var\(--bg-0\)\)/, 'botón principal'),
  // El mayor porcentaje de acento detrás de texto elegido, en las 3 pestañas que lo usan.
  sel: Math.max.apply(null, [VIEW, LIB, ED].map((s) => Math.max.apply(null, [0].concat((s.match(/color-mix\(in srgb,var\(--gn-mod\) \d+%,var\(--bg-0\)\)/g) || [])
    .map((x) => Number(/(\d+)%/.exec(x)[1]) / 100))))),
};

function fails(t) {
  const c = (k) => parse(t[k]);
  const bg0 = over(c('--bg-0'), [255, 255, 255, 1]);
  const bg1 = over(c('--bg-1'), bg0);
  const bg2 = over(c('--bg-2'), bg1);
  const tx1 = over(c('--tx-1'), bg1), tx2 = over(c('--tx-2'), bg1);
  const mod = mix(parse(CFG.color), tx1, CFG.mod);
  // BUI-6b: la cabecera va sobre el gradiente del módulo (color crudo sobre la bandeja); el texto de las tarjetas, sobre el
  // tinte de cada una de las 9 profesiones. El arte de la élite va en la franja de arriba, sin texto encima.
  const surf = { '--bg-0': bg0, '--bg-1': bg1, '--bg-2': bg2, 'elegido': mix(mod, bg0, CFG.sel), 'principal': mix(mod, bg0, CFG.prim),
    'cabecera': mix(parse(CFG.color), bg0, CFG.hero) };
  CFG.prof.forEach((p) => { surf['tarjeta ' + p] = mix(parse(p), bg1, CFG.tint); });
  const out = [];
  const chk = (n, a, b, min) => { const r = ratio(a, b); if (r < min) out.push(n + ' ' + r.toFixed(2)); };
  [['--tx-1', tx1], ['--tx-2', tx2]].forEach(([n, x]) => Object.keys(surf).forEach((s) => chk(n + ' / ' + s, x, surf[s], 4.5)));
  [['--color-green', CFG.ok], ['--color-red', CFG.err]].forEach(([k, p]) => ['--bg-0', '--bg-1', '--bg-2'].forEach((s) =>
    chk(k + ' (mezclado) / ' + s, mix(over(c(k), surf[s]), tx1, p), surf[s], 4.5)));
  ['--bg-0', '--bg-1', '--bg-2'].forEach((s) => chk('acento / ' + s + ' (3:1)', mod, surf[s], 3));
  ['--bg-0', '--bg-1'].forEach((s) => chk('foco / ' + s + ' (3:1)', mix(over(c('--acc-1'), bg1), tx1, CFG.focus), surf[s], 3));
  return out;
}

test('están los 19 temas y definen los colores que usa Builds', () => {
  assert.equal(THEMES.length, 19, THEMES.map((x) => x.id).join(', '));
  THEMES.forEach(({ id, t }) => ['--bg-0', '--bg-1', '--bg-2', '--bd-1', '--tx-1', '--tx-2', '--acc-1', '--color-green', '--color-red']
    .forEach((k) => assert.ok(parse(t[k]), id + ' define ' + k + ' (' + t[k] + ')')));
});

test('en los 19 temas el texto de Builds llega a 4.5:1 y el acento y el foco a 3:1 (WCAG AA)', () => {
  const bad = THEMES.map(({ id, t }) => [id, fails(t)]).filter(([, f]) => f.length);
  assert.deepEqual(bad.map(([id]) => id), [], bad.map(([id, f]) => id + ': ' + f.join(' · ')).join('\n'));
});

test('sin el arreglo de BUI-5 la guarda sí detecta el problema (no mide en el vacío)', () => {
  const save = Object.assign({}, CFG);
  Object.assign(CFG, { mod: 1, ok: 1, err: 1, focus: 1, prim: 0.38, hero: 0.12 });
  const notion = THEMES.find((x) => x.id === 'notion');
  const f = fails(notion.t);
  Object.assign(CFG, save);
  assert.ok(f.some((x) => /--color-green/.test(x)), 'el verde puro sobre Notion no se lee');
  assert.ok(f.some((x) => /^acento/.test(x)), 'el lavanda puro sobre Notion no llega a 3:1');
  const od = THEMES.find((x) => x.id === 'one-dark');
  Object.assign(CFG, { tint: 0.18 });
  const g = fails(od.t);
  Object.assign(CFG, save);
  assert.ok(g.some((x) => /tarjeta #FFD166/.test(x)), 'un tinte fuerte del Guerrero no se lee en One Dark');
  assert.equal(CFG.prof.length, 9, 'los colores de las 9 profesiones');
});

test('colores: nada fijo en el CSS de Builds salvo el acento del módulo y los respaldos de var()', () => {
  BLD.forEach((f) => {
    const s = SRC[f].replace(/var\(--[\w-]+,#[0-9a-fA-F]{3,8}\)/g, '').replace(/var COLOR = '#[0-9A-Fa-f]{6}';/, '');
    const hex = (s.match(/'[^'\n]*#[0-9a-fA-F]{3,8}\b[^'\n]*'/g) || []).filter((l) => /\{[^}]*#[0-9a-fA-F]{3,8}\b/.test(l));
    assert.deepEqual(hex, [], f + ' tiene colores fijos');
  });
});

test('texto entero: las profesiones sin elegir se atenúan solo en el ícono', () => {
  assert.doesNotMatch(LIB, /\.bld-pf\{[^}]*opacity/);
  assert.doesNotMatch(ED, /\.bld-ed-pf\{[^}]*opacity/);
  assert.match(LIB, /\.bld-pf img\{opacity:\.7\}/);
  assert.match(ED, /\.bld-ed-pf img\{opacity:\.75\}/);
  assert.doesNotMatch(ED, /font-size:\.6\d?rem/, 'nada más chico que .7rem');
});

test('teclado y lector: foco visible, pestañas con flechas, botones nativos y avisos que se leen', () => {
  assert.match(VIEW, /:focus-visible\{outline:2px solid var\(--bld-focus\);outline-offset:2px\}/);
  assert.match(VIEW, /prefers-reduced-motion:reduce/);
  BLD.forEach((f) => {
    assert.doesNotMatch(SRC[f], /outline:\s*(none|0)\b/, f + ' no esconde el foco');
    (SRC[f].match(/<button\b[^>]*/g) || []).forEach((b) => assert.match(b, /type="(button|submit)"/, f + ': ' + b.slice(0, 60)));
    assert.doesNotMatch(SRC[f], /<(div|span|li|img)\b[^>]*\b(onclick|data-(lib|ed|mine)-?\w*)=/, f + ': todo lo que se toca es un control nativo');
  });
  assert.match(VIEW, /role="tablist"/);
  assert.match(VIEW, /ArrowRight[\s\S]{0,200}ArrowLeft[\s\S]{0,200}Home[\s\S]{0,120}End/);
  assert.match(VIEW, /setAttribute\('role', 'status'\); host\.setAttribute\('aria-live', 'polite'\)/, 'el aviso de «copiado» se lee');
  assert.match(ED, /aria-pressed="' \+ on \+ '" aria-label="'/, 'cada rasgo dice su nombre y si está elegido');
  assert.match(ED, /aria-haspopup="true" aria-expanded="/, 'los casilleros de la barra dicen que abren un selector');
  assert.match(LIB, /aria-pressed="' \+ \(f\.prof === p\) \+ '" aria-label="'/, 'cada profesión dice su nombre');
});

test('celular: controles de 44 px a 720 px y grillas que pasan a una columna', () => {
  const i = VIEW.indexOf("'@media (max-width:720px){");
  assert.ok(i > 0);
  assert.match(VIEW.slice(i, i + 160), /:is\(button,\.bld-btn,select,input,textarea\)\{min-height:44px\}/);
  assert.match(VIEW, /@media \(max-width:900px\)\{[\s\S]{0,400}\.bld-stats\{grid-template-columns:1fr 1fr/);
  assert.match(LIB, /@media \(max-width:560px\)\{[\s\S]{0,300}grid-template-columns:1fr/);
  assert.match(ED, /@media \(max-width:980px\)/);
  assert.match(LIB, /\.bld-pf\{min-width:44px;height:44px/);
});

test('rendimiento: la biblioteca filtra y dibuja las 104 builds muy por debajo de 2 s (y de 200 ms)', () => {
  const raw = read('assets/data/builds/catalog.json');
  assert.ok(Buffer.byteLength(raw) < 150 * 1024, 'catálogo de ' + (Buffer.byteLength(raw) / 1024).toFixed(1) + ' KB');
  globalThis.GNBldCode = require('../js/bld-code.js');
  globalThis.GNBldShow = require('../js/bld-show.js');
  const P = require('../js/bld-lib.js')._pure;
  const t0 = process.hrtime.bigint();
  const cat = JSON.parse(raw);
  const latest = P.latestPatch(cat, null);
  const all = { prof: 0, elite: 0, mode: '', role: '', weapon: '', damage: '', state: '', q: '' };
  let html = '';
  for (let i = 0; i < 5; i++) html = P.filter(cat.builds, all, latest).map((b) => P.cardHTML(b, latest)).join('');
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 5;
  delete globalThis.GNBldCode; delete globalThis.GNBldShow;
  assert.ok(html.length > 0);
  assert.ok(ms < 200, 'filtrar y dibujar todo: ' + ms.toFixed(1) + ' ms');
  assert.equal((html.match(/<img\b/g) || []).filter((x) => x).length, (html.match(/<img\b[^>]*loading="lazy"/g) || []).length, 'los emblemas cargan a medida que se ven');
});

test('BUI-6b el marco de Cuentas: gradiente del panel, cabecera sin fondo, pestañas debajo de la línea; tarjetas con franja de la élite', () => {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  require('node:vm').runInNewContext(VIEW, sb, { filename: 'js/bld-view.js' });
  const P = sb.GNBld._pure;
  const ok = 'https://render.guildwars2.com/file/ABC/123.png';
  const idn = { elites: { 74: { background: ok }, 81: { background: 'https://evil.example/x.png' } } };
  assert.equal(P.bgOf(74, idn), ok);
  assert.equal(P.bgOf(81, idn), '', 'otro dominio: nada');
  assert.equal(P.bandStyle(74, idn, 2), ' style="--bld-bg:url(' + ok + ');--bld-prof:#FFD166"');
  assert.equal(P.bandStyle(81, idn, 1), ' style="--bld-prof:#72C1D9"', 'sin arte: igual lleva el color de su profesión');
  assert.equal(P.bandStyle(999, idn, 0), '');
  assert.equal(P.bandStyle(74, { elites: { 74: { background: ok + '") ;x:url("' } } }, 0), '', 'nada de comillas ni CSS colado');
  const h = P.viewHTML({ tab: 'lib' });
  assert.match(h, /<div class="bld-hero" id="bldHero"><div class="bld-row">/, 'la cabecera no lleva imagen ni estilo propio');
  assert.ok(h.indexOf('class="bld-hero"') < h.indexOf('class="bld-tabs"'), 'las pestañas van después de la cabecera');
  assert.match(VIEW, /' \.bld-hero\{border-bottom:1px solid var\(--bd-1\);padding:20px 24px 18px\}'/, 'como Cuentas: la cabecera la cierra una línea');
  assert.doesNotMatch(VIEW, /\.bld-hero::(before|after)/, 'sin capas propias en la cabecera');
  assert.match(VIEW, /' \.bld-tabs\{display:flex;gap:4px;margin:16px 24px 10px;border-bottom:1px solid var\(--bd-1\)/, 'pestañas 16 px debajo de la línea, con la suya');
  assert.match(VIEW, /transparent 300px\),var\(--gn-tray,var\(--bg-1\)\)!important\}/, 'el gradiente es del panel y se funde a los 300 px');
  assert.match(VIEW, /\.bld-card\.bld-band::before\{content:"";position:absolute;left:0;right:0;top:0;height:56px;/, 'la franja va de lado a lado');
  assert.match(LIB, /V\.bandStyle\(b\.elite, null, b\.prof\)/);
  assert.match(SRC['bld-mine.js'], /V\.bandStyle\(eliteOf\(b\), null, b\.profession\)/);
});
