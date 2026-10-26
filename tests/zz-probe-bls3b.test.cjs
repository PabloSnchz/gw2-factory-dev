'use strict';
// Sonda BLS-3b (BL-074): qué tests fijan versiones de converter-modal, acc-view y gn-idb. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda', () => {
  const T = fs.readdirSync(path.join(ROOT, 'tests')).filter((n) => /\.(c?js)$/.test(n) && !/zz-probe/.test(n));
  for (const n of T) {
    const s = fs.readFileSync(path.join(ROOT, 'tests', n), 'utf8');
    if (!/converter-modal|acc-view|gn-idb|AccView|GNIdb/.test(s)) continue;
    s.split('\n').forEach((l, i) => {
      if (/2\.0\.0|1\.1\.0|1\.0\.0|VERSION|version|Versi/.test(l)) console.log(n + ':' + (i + 1) + ': ' + l.trim().slice(0, 170));
    });
  }
  const S = fs.readFileSync(path.join(ROOT, 'tests', 'acc-view.test.cjs'), 'utf8').split('\n');
  S.forEach((l, i) => { if (/achmeta|META_KEY|function load|runInNewContext|Storage\s*[:=]|store\b/.test(l)) console.log('AV ' + (i + 1) + ': ' + l.trim().slice(0, 170)); });
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'size-budget.json'), 'utf8'));
  console.log('BUDGET ' + JSON.stringify(B).slice(0, 1500));
});
