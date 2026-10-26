'use strict';
// Sonda SHV-1c (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l).join('\n');
const grepf = (f, re, ctx) => { const L = rd(f).split('\n'); const out = []; L.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.slice(0, 200)); }); return out.join('\n'); };
test('sonda', () => {
  console.log('--- shiruvana-places guide');
  console.log(grepf('js/shiruvana-places.js', /function \w+\(|guideItems|prior|id:\s*'|VERSION/));
  console.log('--- shiruvana-voice.test');
  console.log(rd('tests/shiruvana-voice.test.cjs').slice(0, 3900));

});
