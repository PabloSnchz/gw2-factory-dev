'use strict';
// Sonda BLS-2e (BL-074). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
test('sonda', () => {
  for (const f of ['tests/idea49.quotavisible.test.js', 'tests/idea50e.cache-expiry-purge.test.js', 'tests/idea50b-hook-cache-mem.test.js']) {
    const s = rd(f);
    for (const w of ['lsSet', 'lsHas', 'lsDel', 'lsGet', 'bodyOf', 'new Function', 'runInNewContext', 'root']) {
      let i = s.indexOf(w), n = 0;
      while (i >= 0 && n < 2) { console.log(f.slice(6, 30) + ' [' + w + '] ' + s.slice(Math.max(0, i - 100), i + 200).replace(/\s+/g, ' ')); i = s.indexOf(w, i + 300); n++; }
    }
  }
});
