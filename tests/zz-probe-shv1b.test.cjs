'use strict';
// Sonda SHV-1b (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l).join('\n');
const grepf = (f, re, ctx) => { const L = rd(f).split('\n'); const out = []; L.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.slice(0, 200)); }); return out.join('\n'); };
test('sonda', () => {
  console.log('--- welcome-panel guide/shiruvana');
  console.log(grepf('js/welcome-panel.js', /Shiruvana|guide|guia|guía|prior|SCOPES\s*=|function \w+\(/i));

});
