'use strict';
// Sonda BLS-2a (BL-074). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
test('sonda', () => {
  const a = rd('js/api-gw2.js');
  const L = a.split('\n');
  const find = (re) => L.findIndex((l) => re.test(l));
  for (const re of [/function lsGet\(/, /function lsSet\(/, /function lsDel\(/, /function lsHas\(/, /function getCache\(/, /function putCache\(/]) {
    const i = find(re);
    console.log('=== ' + re + ' line ' + (i + 1));
    console.log(L.slice(i, i + 24).map((l, j) => (i + j + 1) + ': ' + l.slice(0, 180)).join('\n'));
  }
  console.log('BYTES ' + Buffer.byteLength(a));
  console.log('localStorage refs: ' + (a.match(/localStorage\./g) || []).length);
  L.forEach((l, i) => { if (/localStorage\./.test(l) && !/^\s*(\/\/|\*)/.test(l)) console.log('LS ' + (i + 1) + ': ' + l.trim().slice(0, 170)); });
});
