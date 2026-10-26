'use strict';
// Sonda BLS-2c (BL-074). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda', () => {
  const dir = path.join(ROOT, 'tests');
  for (const f of fs.readdirSync(dir).filter((x) => /\.c?js$/.test(x) && !/^zz-/.test(x))) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    const h = [];
    for (const w of ['lsSet', 'lsGet', 'lsDel', 'lsHas', 'localStorage', 'api-gw2', '__cacheClear', 'clearApiCache', 'GNIdb', 'indexedDB']) if (s.includes(w)) h.push(w);
    if (h.includes('api-gw2') && (h.includes('lsSet') || h.includes('lsGet') || h.includes('__cacheClear') || h.includes('localStorage'))) console.log(f + ' ' + h.join(','));
  }
});
