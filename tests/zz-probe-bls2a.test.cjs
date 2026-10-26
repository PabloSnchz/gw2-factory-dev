'use strict';
// Sonda BLS-2d (BL-074). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
test('sonda', () => {
  const L = rd('js/api-gw2.js').split('\n');
  const show = (a, b) => console.log(L.slice(a - 1, b).map((l, j) => (a + j) + ': ' + l.slice(0, 175)).join('\n'));
  L.forEach((l, i) => { if (/^\s*\(function|\}\)\(|var root\s*=|root = /.test(l) && i < 700) console.log('HDR ' + (i + 1) + ': ' + l.slice(0, 150)); });
  show(2318, 2372);
  L.forEach((l, i) => { if (/__cacheClear\s*:|cacheClear:|__cacheStats\s*:/.test(l)) console.log('EXP ' + (i + 1) + ': ' + l.trim().slice(0, 150)); });
  show(1858, 1870);
});
