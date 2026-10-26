'use strict';
// Sonda SHV-1g (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l.slice(0, 170)).join('\n');
test('sonda', () => {
  console.log(lines('js/wallet-dashboard.js', 380, 440));
  console.log(lines('js/wallet-dashboard.js', 640, 700));
});
