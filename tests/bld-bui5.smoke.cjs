// BUI-5 sonda (borrar después): contraste de Builds en los 19 temas y de dónde sale --gn-mod.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'css', 'themes');

function readTheme(file) {
  const css = fs.readFileSync(path.join(DIR, file), 'utf8');
  const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'));
  const t = {};
  block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return { t, css };
}
function parse(v) {
  if (!v) return null;
  v = String(v).trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(v);
  if (m) { let a = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return [+m[1], +m[2], +m[3], a]; }
  return null;
}
const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const mix = (a, b, p) => [0, 1, 2].map((i) => a[i] * p + b[i] * (1 - p)).concat(1);
const lum = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test('BUI-5 sonda de contraste', () => {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.css')).sort();
  console.log('TEMAS', files.length);
  const MOD = parse('#C9B6FF');
  files.forEach((f) => {
    const { t, css } = readTheme(f);
    const need = ['--bg-0', '--bg-1', '--bg-2', '--bd-1', '--tx-1', '--tx-2', '--acc-1', '--color-green', '--color-red', '--color-amber'];
    const miss = need.filter((k) => !parse(t[k]));
    const c = (k, fb) => parse(t[k]) || parse(fb);
    const bg0 = over(c('--bg-0', '#000'), [255, 255, 255, 1]);
    const bg1 = over(c('--bg-1', '#000'), bg0);
    const bg2 = over(c('--bg-2', '#000'), bg1);
    const mod = t['--gn-mod'] ? parse(t['--gn-mod']) || MOD : MOD;
    const surf = { bg0, bg1, bg2, sel0: mix(mod, bg0, 0.16), sel2: mix(mod, bg2, 0.22), prim: mix(mod, bg2, 0.38), hero: mix(mod, bg1, 0.12) };
    const fails = [];
    const chk = (name, fg, bg, min) => { const r = ratio(fg, bg); if (r < min) fails.push(name + ' ' + r.toFixed(2)); };
    ['--tx-1', '--tx-2'].forEach((k) => Object.keys(surf).forEach((s) => chk(k + '/' + s, over(c(k, '#888'), surf[s]), surf[s], 4.5)));
    ['--color-green', '--color-red'].forEach((k) => ['bg1', 'bg2'].forEach((s) => chk(k + '/' + s, over(c(k, '#888'), surf[s]), surf[s], 4.5)));
    chk('tx-2*.75/bg0 (perfil editor)', mix(over(c('--tx-2', '#888'), bg0), bg0, 0.75), bg0, 4.5);
    chk('tx-1*.7/bg0 (prof lib sin ícono)', mix(over(c('--tx-1', '#888'), bg0), bg0, 0.7), bg0, 4.5);
    ['bg0', 'bg1', 'bg2'].forEach((s) => chk('gn-mod/' + s + ' (3:1 indicador)', mod, surf[s], 3));
    chk('acc-1/bg1 (foco 3:1)', over(c('--acc-1', '#888'), bg1), bg1, 3);
    const light = lum(bg0) > 0.4;
    const gm = (css.match(/[^\n]*gn-mod[^\n]*/g) || []).slice(0, 3);
    console.log('TEMA', f.replace('.css', ''), light ? 'CLARO' : 'oscuro', 'faltan[' + miss.join(',') + ']', 'gn-mod-en-tema[' + gm.join(' | ') + ']');
    console.log('  FALLAS', fails.length ? fails.join(' · ') : 'ninguna');
  });
  ['css/main.css', 'css/theme-polish.css', 'js/gn-frame.js'].forEach((p) => {
    const abs = path.join(ROOT, p);
    if (!fs.existsSync(abs)) return console.log('NO', p);
    const s = fs.readFileSync(abs, 'utf8');
    const hits = s.match(/[^\n]{0,120}gn-mod[^\n]{0,120}/g) || [];
    console.log('GNMOD', p, hits.length);
    hits.slice(0, 12).forEach((h) => console.log('   ', h.trim()));
  });
});
