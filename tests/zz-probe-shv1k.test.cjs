'use strict';
// Sonda SHV-1k2 (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l.slice(0, 200)).join('\n');
test('sonda', () => {
  console.log(lines('js/app.js', 1, 9));
  console.log(lines('js/shiruvana-places.js', 1, 34));
  const s = rd('tests/idea64-dos-pestanas.test.js'); let i = -1;
  while ((i = s.indexOf('emitRefreshEvents', i + 1)) >= 0) console.log('IDEA64 ' + s.slice(Math.max(0, i - 300), i + 300).replace(/\s+/g, ' '));
  const a = rd('js/app.js'); let j = a.indexOf("console.info('[app] emitRefreshEvents'");
  console.log('APPCOUNT ' + a.split("console.info('[app] emitRefreshEvents', detail);").length);
  console.log(lines('js/shiruvana.js', 1, 4));
});
