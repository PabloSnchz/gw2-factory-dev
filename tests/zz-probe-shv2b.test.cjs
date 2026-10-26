'use strict';
// Sonda SHV-2b (BL-059): de dónde sale la Cartera y quién la pide. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
const show = (f, a, b) => { const L = rd(f); console.log('== ' + f); for (let i = a; i <= b; i++) console.log(i + ': ' + (L[i - 1] || '').slice(0, 160)); };
test('sonda', () => {
  const A = rd('js/api-gw2.js');
  let at = A.findIndex((l) => /function getAccountWallet\(/.test(l)) + 1;
  show('js/api-gw2.js', at, at + 14);
  show('js/api-gw2.js', 1755, 1768);
  show('js/act-model.js', 130, 140);
  for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter((n) => n.endsWith('.js') && n !== 'api-gw2.js')) {
    rd('js/' + f).forEach((l, i) => { if (/getAccountWallet|account\/wallet/.test(l)) console.log('CALL ' + f + ':' + (i + 1) + ': ' + l.trim().slice(0, 160)); });
  }
});
