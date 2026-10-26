'use strict';
// Sonda SHV-1k3 (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda', () => {
  const L = fs.readFileSync(path.join(ROOT, 'tests/shiruvana-places.test.cjs'), 'utf8').split('\n');
  L.forEach((l, i) => { if (/1\.3\.1|1\\\.3\\\.1|Versi/.test(l)) console.log((i + 1) + ': ' + JSON.stringify(l)); });
});
