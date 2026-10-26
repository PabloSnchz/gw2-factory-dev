'use strict';
// Sonda SHV-2c (BL-059): cómo lee app.js la Cartera. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const L = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8').split('\n');
test('sonda', () => {
  for (let i = 55; i <= 80; i++) console.log(i + ': ' + (L[i - 1] || '').slice(0, 170));
  L.forEach((l, i) => { if (/\.wallet\(|window\.API|root\.API|API = |const API|var API|json:\s|function json|dispatchEvent|CustomEvent\(/.test(l)) console.log('A ' + (i + 1) + ': ' + l.trim().slice(0, 170)); });
});
