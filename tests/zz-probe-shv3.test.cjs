// Sonda SHV-3 (se borra después): qué publica la Armería Legendaria para que yo la lea sin pedir nada nuevo.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const FILES = ['legendary-tracker.js', 'legendary-tree.js', 'legendary-tree-ui.js', 'render-catologo.js', 'legendary-recipes.js'];
const RE = /root\.\w+\s*=|window\.\w+\s*=|\bexports\b|commerce\/prices|getCommercePrices|getAccountMaterials|getAccountBank|dispatchEvent\(new|CustomEvent\('|gn:legendary|localStorage|Storage\.(get|set)\(|function (missing|faltan|remaining|shopping|totals|computeTotals|cost|queue|getQueue|state|getState)\w*\(/;
test('superficie de la Armería', () => {
  const out = [];
  FILES.forEach((f) => {
    const s = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), lines = s.split('\n');
    const hits = [];
    lines.forEach((l, i) => { if (RE.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 200)); });
    out.push('## ' + f + ' (' + s.length + ' B, ' + lines.length + ' líneas)\n' + lines.slice(0, 12).map((l) => '   ' + l.slice(0, 160)).join('\n') + '\n' + hits.slice(0, 40).join('\n'));
  });
  console.log(out.join('\n\n'));
});
