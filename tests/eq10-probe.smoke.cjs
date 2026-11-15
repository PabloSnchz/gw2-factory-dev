// Sonda temporal EQ-10: mezclas de color de los módulos de BL-084, contraste en los 19 temas, medias y tamaños. Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const MODS = ['bld-sheet.js', 'bld-gearview.js', 'bld-traitview.js', 'bld-notes.js', 'bld-play.js', 'bld-import.js', 'bld-editor.js', 'bld-show.js', 'bld-ae2.js', 'bld-items.js', 'bld-bench.js', 'bld-rows.js', 'bld-mine.js', 'bld-lib.js', 'bld-view.js'];
const SRC = {}; MODS.forEach((f) => { SRC[f] = read('js/' + f); });
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
const VIEW = SRC['bld-view.js'];
const COLOR = /var COLOR = '(#[0-9A-Fa-f]{6})'/.exec(VIEW)[1];
const MODP = Number(/'\{--gn-mod:color-mix\(in srgb,' \+ COLOR \+ ' (\d+)%,var\(--tx-1\)\)/.exec(VIEW)[1]) / 100;
const PROF = ((/var PROF_COLOR = \{([^}]*)\}/.exec(VIEW) || ['', ''])[1].match(/#[0-9A-Fa-f]{6}/g) || []);
console.log('COLOR', COLOR, 'mod', MODP, 'prof', PROF.join(' '));
const RE = /color-mix\(in srgb,(var\(--[\w-]+(?:,var\(--[\w-]+\))?\)|var\(--[\w-]+,#[0-9a-fA-F]+\)|#[0-9a-fA-F]{6}|' \+ COLOR \+ ') (\d+)%,(var\(--[\w-]+\)|transparent)\)/g;
const found = [];
MODS.slice(0, 9).forEach((f) => {
  let m; while ((m = RE.exec(SRC[f]))) {
    const i = m.index, ctx = SRC[f].slice(Math.max(0, SRC[f].lastIndexOf('{', i) - 70), i).replace(/\s+/g, ' ');
    found.push({ f, a: m[1], p: +m[2] / 100, b: m[3], ctx: ctx.slice(-110) });
  }
});
console.log('mezclas en módulos BL-084:', found.length);
found.forEach((x) => console.log(' ', x.f, x.a, Math.round(x.p * 100) + '%', x.b, '←', x.ctx));
// contraste: texto tx-1/tx-2 sobre cada mezcla cuyo fondo es bg-*, con color = gn-mod o cada profesión
const bad = {};
THEMES.forEach(({ id, t }) => {
  const c = (k) => parse(t[k]);
  const bg0 = over(c('--bg-0'), [255, 255, 255, 1]), bg1 = over(c('--bg-1'), bg0), bg2 = over(c('--bg-2'), bg1);
  const BG = { '--bg-0': bg0, '--bg-1': bg1, '--bg-2': bg2 };
  const tx1 = over(c('--tx-1'), bg1), tx2 = over(c('--tx-2'), bg1);
  const mod = mix(parse(COLOR), tx1, MODP);
  found.forEach((x) => {
    const base = BG[(/var\((--bg-\d)\)/.exec(x.b) || [])[1]];
    if (!base) return;
    const cols = /bld-prof/.test(x.a) ? PROF.map(parse) : /gn-mod/.test(x.a) ? [mod] : /acc-1/.test(x.a) ? [over(c('--acc-1'), bg1)] : /COLOR/.test(x.a) ? [parse(COLOR)] : [];
    cols.forEach((col, k) => {
      const s = mix(col, base, x.p);
      [['tx-1', tx1, 4.5], ['tx-2', tx2, 4.5]].forEach(([n, tx, min]) => {
        const r = ratio(tx, s);
        if (r < min) { const key = x.f + ' ' + x.a + ' ' + Math.round(x.p * 100) + '% ' + x.b + ' ' + n; (bad[key] = bad[key] || []).push(id + (PROF.length && /bld-prof/.test(x.a) ? '/' + PROF[k] : '') + ' ' + r.toFixed(2)); }
      });
    });
  });
});
console.log('fallas de contraste (texto sobre mezcla):', Object.keys(bad).length);
Object.keys(bad).forEach((k) => console.log('  ' + k + ' → ' + bad[k].length + ': ' + bad[k].slice(0, 6).join(', ')));
// tx-2 sobre bg-0/1/2 crudos (por si un tema no llega)
THEMES.forEach(({ id, t }) => {
  const c = (k) => parse(t[k]); const bg0 = over(c('--bg-0'), [255, 255, 255, 1]), bg1 = over(c('--bg-1'), bg0), bg2 = over(c('--bg-2'), bg1);
  const tx2 = over(c('--tx-2'), bg1); const r = Math.min(ratio(tx2, bg0), ratio(tx2, bg1), ratio(tx2, bg2)); if (r < 4.5) console.log('  tx-2 crudo', id, r.toFixed(2));
});
// medias, tamaños de letra, foco y controles
MODS.slice(0, 7).forEach((f) => {
  const s = SRC[f];
  const fs_ = (s.match(/font-size:\.(\d+)rem/g) || []).map((x) => +('0.' + /\.(\d+)/.exec(x)[1])).filter((v) => v < 0.7);
  console.log(f, 'bytes', s.length, '@media', (s.match(/@media[^{]*/g) || []).join(' | ') || '—', '· letra < .7rem:', fs_.join(',') || '—',
    '· tabindex', (s.match(/tabindex=/g) || []).length, '· role=tooltip', (s.match(/role=\\?"tooltip/g) || []).length, '· Escape', /Escape/.test(s), '· focus-visible', /focus-visible/.test(s),
    '· min-height:44', /min-height:44px/.test(s), '· lazy', (s.match(/loading=\\?"lazy/g) || []).length);
});
