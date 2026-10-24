// Sonda temporal de RAI-5b (BL-070). Se borra después de RUN-037.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const RX = /strike|Strike|STRIKE/;
test('sonda', () => {
  const out = [];
  const files = fs.readdirSync(path.join(ROOT, 'tests')).filter((f) => /\.(c?js)$/.test(f) && !/^zz-|^raids-|^sidebar-nav/.test(f)).map((f) => 'tests/' + f)
    .concat(['tools/legacy/CENSO.md', 'tests/legacy-census.test.cjs']);
  for (const rel of files) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) continue;
    const L = fs.readFileSync(p, 'utf8').split('\n');
    const hits = [];
    L.forEach((l, i) => { if (RX.test(l)) hits.push(i); });
    if (!hits.length) continue;
    out.push('=== ' + rel + ' (' + L.length + ' líneas, ' + hits.length + ' hits)');
    const shown = new Set();
    hits.forEach((i) => { for (let k = Math.max(0, i - 2); k <= Math.min(L.length - 1, i + 2); k++) shown.add(k); });
    let prev = -2;
    [...shown].sort((a, b) => a - b).forEach((k) => { if (k !== prev + 1) out.push('  ...'); out.push(String(k + 1).padStart(4) + '| ' + L[k].slice(0, 200)); prev = k; });
  }
  const lc = fs.readFileSync(path.join(ROOT, 'tests/legacy-census.test.cjs'), 'utf8');
  out.push('=== legacy-census FULL\n' + lc.slice(0, 6000));
  console.log('PROBE-BEGIN\n' + out.join('\n') + '\nPROBE-END');
});
