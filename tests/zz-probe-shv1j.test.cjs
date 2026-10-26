'use strict';
// Sonda SHV-1j (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l.slice(0, 170)).join('\n');
const grepf = (f, re) => { const L = rd(f).split('\n'); const out = []; L.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.slice(0, 190)); }); return out.join('\n'); };
test('sonda', () => {
  console.log(lines('js/wallet-dashboard.js', 1000, 1049));
  console.log(lines('js/shiruvana-places.js', 86, 111));
});
