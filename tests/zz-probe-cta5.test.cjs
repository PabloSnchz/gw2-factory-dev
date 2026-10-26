'use strict';
// Sonda temporal CTA-5 (2): imprime con número de línea las zonas de los tests que leen js/accounts-panel.js,
// y el blob de los archivos que voy a parchar. Se borra después de leer el OUT.
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.join(__dirname, '..');
const RE = /accounts-panel|ap\b|panelSrc|panel\b|ALVOS|escritores|lectores/;
const blob = (b) => crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + b.length + '\0'), b])).digest('hex');
test('sonda: contexto', () => {
  for (const f of ['index.html', 'js/router.js', 'tools/size-budget.json', 'tests/hb111-puerta-import.test.js', 'tests/hb80-clic-cuenta.test.js', 'tests/idea55.account-layer.test.js', 'tests/idea61-claves-congeladas.test.js', 'tests/idea64-dos-pestanas.test.js', 'tests/legacy-census.test.cjs', 'tests/t19c-lectores-legacy.test.js', 'tests/hb106-censo-latch.test.js', 'tests/index-identity.test.cjs']) {
    const b = fs.readFileSync(path.join(ROOT, f));
    console.log('BLOB ' + f + ' ' + blob(b) + ' ' + b.length);
  }
  const show = (f, ranges) => {
    const L = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
    for (const [a, z] of ranges) { console.log('=== ' + f + ' ' + a + '-' + z); for (let i = a; i <= Math.min(z, L.length); i++) console.log(String(i).padStart(4) + '|' + L[i - 1]); }
  };
  show('tests/hb111-puerta-import.test.js', [[195, 245]]);
  show('tests/idea55.account-layer.test.js', [[1, 160]]);
  show('tests/idea61-claves-congeladas.test.js', [[205, 275], [430, 460]]);
  show('tests/idea64-dos-pestanas.test.js', [[480, 560]]);
  show('tests/hb80-clic-cuenta.test.js', [[1, 30]]);
  show('tools/size-budget.json', [[1, 60]]);
  show('index.html', [[505, 520], [820, 840]]);
  for (const f of ['tests/legacy-census.test.cjs', 'tests/t19c-lectores-legacy.test.js', 'tests/hb106-censo-latch.test.js', 'tests/index-identity.test.cjs', 'tests/index-versions.test.cjs', 'tests/dev-pages.test.cjs']) {
    const L = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
    L.forEach((l, i) => { if (/accounts|Accounts|scripts? (count|=)|length,\s*\d+|\b\d{2}\b scripts/.test(l)) console.log('HIT ' + f + ':' + (i + 1) + '|' + l.slice(0, 200)); });
  }
});
