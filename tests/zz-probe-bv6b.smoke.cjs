// Sonda BL-092 BV-6b (se borra después): de dónde sacan el fondo los paneles de los módulos.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const files = [];
for (const d of ['css', 'js']) for (const f of fs.readdirSync(path.join(ROOT, d))) if (/\.(css|js)$/.test(f)) files.push(d + '/' + f);
files.push('index.html');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
function lum(r, g, b) { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
test('fondos de paneles y colores oscuros escritos a mano', () => {
  // 1) reglas con «panel» en el selector y un background
  let n = 0;
  for (const f of files) {
    const src = read(f);
    const re = /([^{}\n'"]*[Pp]anel[^{}\n'"]*)\{([^{}]*background[^{}]*)\}/g;
    let m;
    while ((m = re.exec(src)) && n < 140) {
      const bg = (m[2].match(/background(?:-color|-image)?\s*:\s*[^;'"]+/g) || []).join(' | ');
      if (!bg) continue;
      n++;
      console.log('PANEL ' + f + ' :: ' + m[1].trim().slice(-110) + ' => ' + bg.slice(0, 200));
    }
  }
  // 2) colores oscuros fijos (no var()) por archivo
  for (const f of files) {
    const src = read(f).replace(/\/\*[\s\S]*?\*\//g, '');
    const cnt = {};
    for (const m of src.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
      const h = m[1]; const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      if (lum(r, g, b) < 0.04 && b - r >= 6) cnt['#' + h.toUpperCase()] = (cnt['#' + h.toUpperCase()] || 0) + 1;
    }
    for (const m of src.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/g)) {
      const [r, g, b, a] = [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]];
      if (lum(r, g, b) < 0.04 && b - r >= 6 && a >= 0.5) cnt['rgba(' + r + ',' + g + ',' + b + ')'] = (cnt['rgba(' + r + ',' + g + ',' + b + ')'] || 0) + 1;
    }
    const k = Object.keys(cnt);
    if (k.length) console.log('OSCUROS-AZULADOS ' + f + ' (' + k.reduce((s, x) => s + cnt[x], 0) + '): ' + k.sort((a, b) => cnt[b] - cnt[a]).slice(0, 18).map((x) => x + '×' + cnt[x]).join(' '));
  }
});
