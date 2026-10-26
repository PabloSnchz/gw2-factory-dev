'use strict';
// Sonda SHV-1k (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const grepf = (f, re) => { const L = rd(f).split('\n'); const out = []; L.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.slice(0, 190)); }); return out.join('\n'); };
test('sonda', () => {
  for (const f of fs.readdirSync(path.join(ROOT, 'tests')).filter((x) => /\.c?js$/.test(x))) {
    const s = fs.readFileSync(path.join(ROOT, 'tests', f), 'utf8');
    const hits = [];
    if (/emitRefreshEvents/.test(s)) hits.push('emitRefreshEvents');
    if (/shiruvana-places/.test(s) && /VERSION|1\.3\.1/.test(s)) hits.push('places-version');
    if (/2\.9\.0/.test(s)) hits.push('app-2.9.0');
    if (/guideItems/.test(s)) hits.push('guideItems');
    if (/shiruvana\.js/.test(s)) hits.push('shiruvana.js');
    if (hits.length) console.log(f + ' ' + hits.join(','));
  }
  console.log('--- places test');
  console.log(grepf('tests/shiruvana-places.test.cjs', /guideItems|deepEqual|version|VERSION/));
  console.log('--- size-budget');
  console.log(grepf('tools/size-budget.json', /app\.js|shiruvana|index\.html|wallet/));
});
