// Sonda SHE-3 (se borra después): qué digo en cada módulo (la función que arma mi mensaje).
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const FILES = ['ach-view.js', 'act-view.js', 'act-week.js', 'home-view.js', 'inv-view.js', 'raids-view.js', 'raids-sheet.js', 'wv-view.js', 'acc-view.js'];
test('mis mensajes por módulo', () => {
  const out = [];
  FILES.forEach((f) => {
    const lines = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').split('\n');
    const idx = lines.findIndex((l) => /root\.Shiruvana\.voice\(/.test(l));
    const kl = [];
    lines.forEach((l, i) => { if (/kind:\s*'/.test(l)) kl.push(i); });
    const shown = new Set();
    kl.forEach((i) => { for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 1); j++) shown.add(j); });
    for (let j = Math.max(0, idx - 6); j <= idx + 1; j++) shown.add(j);
    out.push('## ' + f + '\n' + [...shown].sort((a, b) => a - b).map((j) => (j + 1) + ': ' + lines[j].trim().slice(0, 230)).join('\n'));
  });
  console.log(out.join('\n\n'));
});
