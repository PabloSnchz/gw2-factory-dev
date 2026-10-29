// BUI-6b sonda 2 (borrar después): el CSS completo de la cabecera de Cuentas y Heredad.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const rd = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
test('BUI-6b referencia 2', () => {
  [['js/acc-view.js', 236, 292], ['js/home-view.js', 222, 280]].forEach(([f, a, b]) => {
    const l = rd(f).split('\n');
    console.log('==== ' + f);
    for (let i = a; i <= b && i <= l.length; i++) console.log(i + ': ' + l[i - 1].trim().slice(0, 420));
    const e = /function ensureHost[\s\S]{0,900}/.exec(rd(f));
    console.log('-- ' + (e ? e[0].replace(/\s+/g, ' ') : 'sin ensureHost'));
  });
});
