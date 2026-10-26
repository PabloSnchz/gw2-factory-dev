'use strict';
// Sonda SHV-1i (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l.slice(0, 170)).join('\n');
const grepf = (f, re) => { const L = rd(f).split('\n'); const out = []; L.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.slice(0, 190)); }); return out.join('\n'); };
test('sonda', () => {
  console.log(grepf('js/wallet-theme.js', /function (ensureShell|readCard|readRow|isTable|txt)\b|var S = |S = \{|lastAt/));
  const L = rd('js/wallet-theme.js').split('\n');
  const a = L.findIndex((l) => /function ensureShell/.test(l)); console.log(lines('js/wallet-theme.js', a + 1, a + 40));
  const b = L.findIndex((l) => /function readCard/.test(l)); console.log(lines('js/wallet-theme.js', b + 1, b + 22));
});
