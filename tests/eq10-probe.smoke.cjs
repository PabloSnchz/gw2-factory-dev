// BL-084 EQ-10: guarda final de la ficha de builds (equipo, rasgos como en el juego, notas, cómo se juega, Importar y
// Editor). Contraste AA en los 19 temas de toda mezcla de color detrás de texto, letra mínima, controles nativos,
// rendimiento de la ficha de las 104 builds y tamaño de los datos que carga. Sin red.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const MODS = ['bld-sheet.js', 'bld-gearview.js', 'bld-traitview.js', 'bld-notes.js', 'bld-play.js', 'bld-import.js', 'bld-editor.js', 'bld-ae2.js', 'bld-items.js'];
const SRC = {};
MODS.forEach((f) => { SRC[f] = read('js/' + f); });

// ------------------------------------------------------------------ color (mismo cálculo que tests/bld-ui.test.cjs)
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
const VIEW = read('js/bld-view.js');
const COLOR = /var COLOR = '(#[0-9A-Fa-f]{6})'/.exec(VIEW)[1];
const MODP = Number(/'\{--gn-mod:color-mix\(in srgb,' \+ COLOR \+ ' (\d+)%,var\(--tx-1\)\)/.exec(VIEW)[1]) / 100;
const PROF = ((/var PROF_COLOR = \{([^}]*)\}/.exec(VIEW) || ['', ''])[1].match(/#[0-9A-Fa-f]{6}/g) || []);

// Toda mezcla «color del módulo o de la profesión» sobre un fondo del tema: { f, who, p, bg }.
function mixes(src) {
  const re = /color-mix\(in srgb,var\((--gn-mod|--bld-prof)(?:,var\(--gn-mod\))?\) (\d+)%,var\((--bg-\d)\)\)/g;
  const out = [];
  Object.keys(src).forEach((f) => { let m; while ((m = re.exec(src[f]))) out.push({ f, who: m[1], p: +m[2] / 100, bg: m[3] }); });
  return out;
}
function fails(list) {
  const out = [];
  THEMES.forEach(({ id, t }) => {
    const c = (k) => parse(t[k]);
    const bg0 = over(c('--bg-0'), [255, 255, 255, 1]), bg1 = over(c('--bg-1'), bg0), bg2 = over(c('--bg-2'), bg1);
    const BG = { '--bg-0': bg0, '--bg-1': bg1, '--bg-2': bg2 };
    const tx1 = over(c('--tx-1'), bg1), tx2 = over(c('--tx-2'), bg1), mod = mix(parse(COLOR), tx1, MODP);
    list.forEach((x) => {
      const cols = x.who === '--bld-prof' ? PROF.map(parse).concat([mod]) : [mod];
      cols.forEach((col) => [['--tx-1', tx1], ['--tx-2', tx2]].forEach(([n, tx]) => {
        const r = ratio(tx, mix(col, BG[x.bg], x.p));
        if (r < 4.5) out.push(id + ' · ' + x.f + ' ' + Math.round(x.p * 100) + '% ' + n + ' ' + r.toFixed(2));
      }));
    });
  });
  return out;
}

test('EQ-10 contraste: el texto sobre toda mezcla de color de la ficha llega a 4.5:1 en los 19 temas', () => {
  assert.equal(THEMES.length, 19);
  assert.equal(PROF.length, 9, 'los colores de las 9 profesiones');
  const list = mixes(SRC);
  assert.ok(list.some((x) => x.f === 'bld-traitview.js' && x.who === '--bld-prof'), 'mide la banda de habilidades');
  const bad = fails(list);
  assert.deepEqual(bad, [], bad.slice(0, 12).join('\n'));
});

test('EQ-10 contraste: la guarda no mide en el vacío (con el 26% de antes, falla)', () => {
  const src = { 'bld-traitview.js': SRC['bld-traitview.js'].replace(/(var\(--bld-prof,var\(--gn-mod\)\) )\d+%/, '$126%') };
  const bad = fails(mixes(src));
  assert.ok(bad.some((x) => /^one-dark/.test(x)), 'one-dark con 26% no se lee');
});

test('EQ-10 letra, foco y controles: nada menor a .7rem, foco visible, botones nativos con type', () => {
  MODS.forEach((f) => {
    const s = SRC[f];
    (s.match(/font-size:\.(\d+)rem/g) || []).forEach((x) => assert.ok(Number('0.' + /\.(\d+)/.exec(x)[1]) >= 0.7, f + ': ' + x));
    assert.doesNotMatch(s, /outline:\s*(none|0)\b/, f + ' no esconde el foco');
    (s.match(/<button\b[^>]*/g) || []).forEach((b) => assert.match(b, /type="(button|submit)"/, f + ': ' + b.slice(0, 60)));
  });
  ['bld-gearview.js', 'bld-traitview.js'].forEach((f) => {
    assert.match(SRC[f], /role="tooltip"/, f + ': la descripción es un tooltip');
    assert.match(SRC[f], /aria-describedby=/, f + ': y el lector la asocia');
    assert.match(SRC[f], /Escape/, f + ': Escape la cierra');
    assert.match(SRC[f], /:focus-visible\{outline:\d/, f + ': foco visible');
  });
  ['bld-sheet.js', 'bld-gearview.js', 'bld-traitview.js'].forEach((f) => assert.match(SRC[f], /@media \(max-width:720px\)/, f + ': celular'));
  assert.match(SRC['bld-editor.js'], /@media \(max-width:980px\)/);
});

test('EQ-10 rendimiento: la ficha de cada una de las 104 builds se arma muy por debajo de 200 ms', () => {
  globalThis.GNBldCode = require('../js/bld-code.js');
  globalThis.GNBldShow = require('../js/bld-show.js');
  globalThis.GNBldItems = require('../js/bld-items.js');
  globalThis.GNBldGearView = require('../js/bld-gearview.js');
  globalThis.GNBldRef = require('../js/bld-ref.js');
  globalThis.GNBldTraitView = require('../js/bld-traitview.js');
  globalThis.GNBldNotes = require('../js/bld-notes.js');
  globalThis.GNBldPlay = require('../js/bld-play.js');
  globalThis.GNBldAe2 = require('../js/bld-ae2.js');
  const SH = require('../js/bld-sheet.js');
  const CAT = JSON.parse(read('assets/data/builds/catalog.json'));
  const GEAR = JSON.parse(read('assets/data/builds/gear.json')).gear;
  globalThis.GNBldLib = { _state: { cat: CAT }, _pure: { stateOf: () => 'vigente', latestPatch: () => '', ROLES: {}, benchHTML: () => '', issueUrl: () => '' },
    list: () => CAT.builds, byId: (id) => CAT.builds.find((b) => b.id === id) };
  assert.equal(CAT.builds.length, 104);
  let max = 0, slow = '';
  const t0 = process.hrtime.bigint();
  CAT.builds.forEach((b) => {
    const a = process.hrtime.bigint();
    const v = GEAR[b.id] ? globalThis.GNBldItems.sheet(GEAR[b.id], null) : null;
    SH._state.gear[b.id] = v;
    const h = SH._pure.sheetHTML({ b, nav: SH._pure.navOf(CAT.builds, b.id), latest: '', gear: v });
    assert.ok(h.length > 0);
    if (v && v.armor && v.armor.length) assert.match(h, /data-sheet="ae2"/, b.id + ': con equipo, «Copiar AE2»');
    const ms = Number(process.hrtime.bigint() - a) / 1e6;
    if (ms > max) { max = ms; slow = b.id; }
    delete SH._state.gear[b.id];
  });
  const all = Number(process.hrtime.bigint() - t0) / 1e6;
  for (const k of ['GNBldCode', 'GNBldShow', 'GNBldItems', 'GNBldGearView', 'GNBldRef', 'GNBldTraitView', 'GNBldNotes', 'GNBldPlay', 'GNBldAe2', 'GNBldLib']) delete globalThis[k];
  assert.ok(max < 200, 'la más lenta: ' + slow + ' ' + max.toFixed(1) + ' ms');
  assert.ok(all < 2000, 'las 104: ' + all.toFixed(0) + ' ms');
});

test('EQ-10 datos: lo que carga la ficha tiene tope (se pide al abrir una ficha, no al entrar a Builds)', () => {
  const kb = (f) => Buffer.byteLength(read(f)) / 1024;
  assert.ok(kb('assets/data/builds/gear.json') < 64, 'gear.json ' + kb('assets/data/builds/gear.json').toFixed(1) + ' KB');
  assert.ok(kb('assets/data/builds/notes.json') < 300, 'notes.json ' + kb('assets/data/builds/notes.json').toFixed(1) + ' KB');
  const notes = JSON.parse(read('assets/data/builds/notes.json'));
  const ids = new Set(JSON.parse(read('assets/data/builds/catalog.json')).builds.map((b) => b.id));
  const keys = Object.keys(notes.notes || notes).filter((k) => ids.has(k));
  assert.equal(keys.length, 104, 'una nota por build de la Biblioteca');
});
