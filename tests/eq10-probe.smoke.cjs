// Sonda temporal EQ-10 (2): porcentaje seguro del tinte de la banda de habilidades y rendimiento de la ficha. Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
function parse(v) {
  if (!v) return null; v = String(v).trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (m) { let h = m[1]; if (h.length <= 4) h = h.split('').map((c) => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1]; }
  m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i.exec(v);
  return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null;
}
const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const mix = (a, b, p) => [0, 1, 2].map((i) => a[i] * p + b[i] * (1 - p)).concat(1);
const lum = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const DIR = path.join(ROOT, 'css', 'themes');
const THEMES = fs.readdirSync(DIR).filter((f) => f.endsWith('.css')).sort().map((f) => {
  const css = fs.readFileSync(path.join(DIR, f), 'utf8'); const block = css.slice(css.indexOf('{') + 1, css.indexOf('}')); const t = {};
  block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; }); return { id: f.replace(/\.css$/, ''), t };
});
const VIEW = read('js/bld-view.js');
const COLOR = /var COLOR = '(#[0-9A-Fa-f]{6})'/.exec(VIEW)[1];
const MODP = Number(/'\{--gn-mod:color-mix\(in srgb,' \+ COLOR \+ ' (\d+)%,var\(--tx-1\)\)/.exec(VIEW)[1]) / 100;
const PROF = ((/var PROF_COLOR = \{([^}]*)\}/.exec(VIEW) || ['', ''])[1].match(/#[0-9A-Fa-f]{6}/g) || []);
for (let p = 26; p >= 6; p -= 2) {
  let n = 0, worst = 99, who = '';
  THEMES.forEach(({ id, t }) => {
    const c = (k) => parse(t[k]); const bg0 = over(c('--bg-0'), [255, 255, 255, 1]), bg1 = over(c('--bg-1'), bg0);
    const tx1 = over(c('--tx-1'), bg1), tx2 = over(c('--tx-2'), bg1), mod = mix(parse(COLOR), tx1, MODP);
    PROF.map(parse).concat([mod]).forEach((col) => {
      const s = mix(col, bg0, p / 100);
      [tx1, tx2].forEach((tx) => { const r = ratio(tx, s); if (r < 4.5) n++; if (r < worst) { worst = r; who = id; } });
    });
  });
  console.log('banda ' + p + '%: fallas ' + n + ' · peor ' + worst.toFixed(2) + ' (' + who + ')');
}
// rendimiento: ficha completa (equipo, notas, cómo se juega) de las 104 builds
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
console.log('notes api', Object.keys(globalThis.GNBldNotes).join(','));
globalThis.GNBldLib = { _state: { cat: CAT }, _pure: { stateOf: () => 'vigente', latestPatch: () => '', ROLES: {}, benchHTML: () => '', issueUrl: () => '' }, list: () => CAT.builds, byId: (id) => CAT.builds.find((b) => b.id === id) };
const t0 = process.hrtime.bigint();
let max = 0, maxId = '', total = 0;
CAT.builds.forEach((b) => {
  const a = process.hrtime.bigint();
  const v = GEAR[b.id] ? globalThis.GNBldItems.sheet(GEAR[b.id], null) : null;
  SH._state.gear[b.id] = v;
  const h = SH._pure.sheetHTML({ b, nav: SH._pure.navOf(CAT.builds, b.id), latest: '', gear: v });
  total += h.length;
  const ms = Number(process.hrtime.bigint() - a) / 1e6;
  if (ms > max) { max = ms; maxId = b.id; }
});
console.log('ficha x104: total ' + (Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1) + ' ms · máx ' + max.toFixed(2) + ' ms (' + maxId + ') · html ' + (total / 1024).toFixed(0) + ' KB');
const notes = read('assets/data/builds/notes.json');
console.log('notes.json ' + (Buffer.byteLength(notes) / 1024).toFixed(1) + ' KB · gear.json ' + (Buffer.byteLength(read('assets/data/builds/gear.json')) / 1024).toFixed(1) + ' KB');
const t1 = process.hrtime.bigint(); JSON.parse(notes); console.log('parse notes ' + (Number(process.hrtime.bigint() - t1) / 1e6).toFixed(1) + ' ms');
