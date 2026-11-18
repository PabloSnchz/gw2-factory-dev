// Sonda BL-092 BV-6a (se borra después): dónde aparecen a mano los colores del theme Gato Negro.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const HEX = ['0F1117', '1A1F2B', '2E3649', '232A3A', '3B4560', '6B7690', '1D3436', '38352F', '392630', '212E49', '1E2A2B', '151C1F', '22263A', '7B5CFF'];
const RE = new RegExp('#(' + HEX.join('|') + ')\\b|rgba?\\(\\s*123\\s*,\\s*92\\s*,\\s*255|rgba?\\(\\s*26\\s*,\\s*31\\s*,\\s*43|rgba?\\(\\s*15\\s*,\\s*17\\s*,\\s*23|rgba?\\(\\s*46\\s*,\\s*54\\s*,\\s*73|rgba?\\(\\s*59\\s*,\\s*69\\s*,\\s*96', 'i');
function walk(d, out) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (!/^(node_modules|\.git|assets|docs|factory|ai-memory)$/.test(f.name)) walk(p, out); }
    else if (/\.(css|js|cjs|html|json)$/.test(f.name)) out.push(p);
  }
  return out;
}
test('censo de colores del theme Gato escritos a mano', () => {
  const files = walk(ROOT, []);
  const rows = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f);
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    const hits = [];
    lines.forEach((l, i) => { if (RE.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 170)); });
    if (hits.length) rows.push({ rel, n: hits.length, size: fs.statSync(f).size, hits });
  }
  rows.sort((a, b) => b.n - a.n);
  console.log('ARCHIVOS ' + rows.length + ' LINEAS ' + rows.reduce((s, r) => s + r.n, 0));
  for (const r of rows) {
    console.log('== ' + r.rel + ' (' + r.n + ' líneas, ' + r.size + ' B)');
    for (const h of r.hits.slice(0, r.rel.startsWith('css/themes/') ? 3 : 14)) console.log('   ' + h);
  }
  // quién lee --panel/--bg-1 de forma fija en los tests de contraste
  for (const f of files.filter((x) => /tests\//.test(x))) {
    const s = fs.readFileSync(f, 'utf8');
    if (/gato\.css/.test(s)) console.log('LEE gato.css: ' + path.relative(ROOT, f));
  }
});
