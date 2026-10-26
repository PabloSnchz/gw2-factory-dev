'use strict';
// Sonda temporal TOP-1 (BL-070 paso 5). Solo lee el repo. Se borra después de leer OUT-092.
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rd = (p) => { try { return fs.readFileSync(path.join(R, p), 'utf8'); } catch (_) { return ''; } };

test('sonda TOP-1: quién mira el cargador, el tope o window.toast', () => {
  const t = fs.readdirSync(path.join(R, 'tests')).filter(f => /\.c?js$/.test(f) && !f.startsWith('zz-'));
  console.log('TESTS', t.length);
  const re = /boot\.js|GNBoot|\b30\b[^\n]{0,40}m[oó]dulo|<=\s*30|modules\.length|window\.toast\s*=|toast\.legacy|#toasts|'toasts'|"toasts"|toast--|toast__/;
  for (const f of t) {
    rd('tests/' + f).split('\n').forEach((l, i) => { if (re.test(l)) console.log('T|' + f + ':' + (i + 1) + '|' + l.trim().slice(0, 170)); });
  }
  const ix = rd('index.html');
  ix.split('\n').forEach((l, i) => { if (/boot\.js|id="toasts"/.test(l)) console.log('IX|' + (i + 1) + '|' + l.trim()); });
  const b = rd('tools/size-budget.json');
  console.log('BUDGET', b.length, b.replace(/\s+/g, ' ').slice(0, 1500));
});
