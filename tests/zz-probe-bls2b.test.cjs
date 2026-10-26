'use strict';
// Sonda BLS-2b (BL-074). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
test('sonda', () => {
  const a = rd('js/api-gw2.js');
  const L = a.split('\n');
  for (const re of [/function __cacheClear|__cacheClear\s*[:=]\s*function|function cacheClear/, /function __cacheStats|function cacheStats/, /function purgeExpired|function __purge/]) {
    const i = L.findIndex((l) => re.test(l));
    if (i < 0) { console.log('no ' + re); continue; }
    console.log('=== ' + re + ' line ' + (i + 1));
    console.log(L.slice(i, i + 40).map((l, j) => (i + j + 1) + ': ' + l.slice(0, 170)).join('\n'));
  }
  const s = rd('js/settings-manager.js').split('\n');
  const k = s.findIndex((l) => /function clearApiCache/.test(l));
  console.log('=== settings clearApiCache ' + (k + 1));
  console.log(s.slice(k, k + 30).map((l, j) => (k + j + 1) + ': ' + l.slice(0, 170)).join('\n'));
  const h = rd('index.html').split('\n');
  h.forEach((l, i) => { if (/api-gw2|storage\.js|analytics\.js|<script/.test(l) && i < 820) console.log('IDX ' + (i + 1) + ': ' + l.trim().slice(0, 150)); });
  console.log(rd('tools/size-budget.json').split('\n').filter((l) => /api-gw2|settings-manager|index/.test(l)).join('\n'));
});
