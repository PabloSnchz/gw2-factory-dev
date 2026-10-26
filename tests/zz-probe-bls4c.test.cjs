'use strict';
// Sonda BLS-4c (BL-074): contexto de las pocas lecturas que quedan. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const show = (f, a, b) => { const L = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n'); console.log('== ' + f); for (let i = a; i <= b; i++) console.log(i + ': ' + (L[i - 1] || '').slice(0, 170)); };
test('sonda', () => {
  show('js/api-gw2.js', 900, 912);
  show('js/api-gw2.js', 1955, 1972);
  show('js/act-view.js', 60, 68);
  show('js/settings-manager.js', 120, 150);
  show('js/settings-manager.js', 488, 520);
  show('js/meta.js', 1043, 1050);
  const V = fs.readFileSync(path.join(ROOT, 'js/acc-vault-view.js'), 'utf8').split('\n');
  V.forEach((l, i) => { if (/LEGACY_KEY|V2_KEY/.test(l)) console.log('vv:' + (i + 1) + ': ' + l.trim().slice(0, 200)); });
  const E = fs.readFileSync(path.join(ROOT, 'js/acc-vault-edit.js'), 'utf8').split('\n');
  for (let i = 196; i <= 214; i++) console.log('ve:' + i + ': ' + (E[i - 1] || '').slice(0, 200));
  E.forEach((l, i) => { if (/V2_KEY|OLD_KEY/.test(l)) console.log('ve*' + (i + 1) + ': ' + l.trim().slice(0, 200)); });
});
