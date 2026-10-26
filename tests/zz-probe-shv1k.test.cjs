'use strict';
// Sonda SHV-1k (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l.slice(0, 170)).join('\n');
const grepf = (f, re) => { const L = rd(f).split('\n'); const out = []; L.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.slice(0, 190)); }); return out.join('\n'); };
test('sonda', () => {
  console.log(grepf('index.html', /shiruvana|app\.js|boot\.js|wallet-theme|wallet-dashboard/));
  for (const f of fs.readdirSync(path.join(ROOT, 'tests'))) {
    const s = fs.readFileSync(path.join(ROOT, 'tests', f), 'utf8');
    const hits = [];
    if (/emitRefreshEvents/.test(s)) hits.push('emitRefreshEvents');
    if (/shiruvana-places/.test(s) && /VERSION|1\.3\.1/.test(s)) hits.push('places-version');
    if (/app\.js v2\.9\.0|2\.9\.0/.test(s)) hits.push('app-2.9.0');
    if (/modules\.json/.test(s)) hits.push('modules.json');
    if (/guideItems/.test(s)) hits.push('guideItems');
    if (hits.length) console.log(f + ' ' + hits.join(','));
  }
  console.log(grepf('tools/size-budget.json', /app\.js|shiruvana|index\.html|wallet/));
});
