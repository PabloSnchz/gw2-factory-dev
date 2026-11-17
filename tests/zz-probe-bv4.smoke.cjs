// Sonda temporal BL-092 BV-4: dónde dibuja cada módulo sus pantallas vacías. Se borra después de RUN-292.
'use strict';
const fs = require('fs'), path = require('path');
const JS = path.join(__dirname, '..', 'js');
const counts = {};
for (const f of fs.readdirSync(JS).filter((x) => /\.js$/.test(x)).sort()) {
  const s = fs.readFileSync(path.join(JS, f), 'utf8');
  const set = new Set();
  for (const m of s.matchAll(/[\w-]*(?:empty|vacio|vacia|blank|nodata|no-data|zero)[\w-]*/gi)) {
    const w = m[0];
    if (/^(isEmpty|empty|Empty|emptyText)$/.test(w)) continue;
    if (/[-_]/.test(w) || /^[a-z]+(Empty|Vacio)/.test(w)) set.add(w);
  }
  if (set.size) console.log(f + ': ' + [...set].slice(0, 14).join(' '));
  for (const w of set) counts[w] = (counts[w] || 0) + 1;
}
console.log('COMUNES: ' + Object.keys(counts).filter((k) => counts[k] > 1).map((k) => k + '×' + counts[k]).join(' '));
