// Sonda SHV-3 (se borra después): cómo la ficha cuenta lo que tenés, lo que falta y los precios.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const grep = (f, re, n) => {
  const lines = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').split('\n'), out = [];
  lines.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.trim().slice(0, 200)); });
  return '## ' + f + '\n' + out.slice(0, n || 30).join('\n');
};
test('stock, precios y precursores', () => {
  console.log(grep('legendary-tracker.js', /stock|price|Prices|precursor|Precursor|loadScript|tpSell|tpBuy|falta|missing/i, 45));
  console.log(grep('legendary-tree-ui.js', /stock|price|falta|need|tpSell|buys|sells|coin|oro|Te faltan|faltan/i, 40));
  console.log(grep('legendary-precursors.js', /^\s*\*|root\.LegendaryPrecursors|get:/, 15));
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  console.log('index carga precursors: ' + /legendary-precursors/.test(idx));
});
