// BL-079 (2026-10-28, lo reportó un usuario): la API Key real de GW2 tiene 72 caracteres, 8-4-4-4-20-4-4-4-12
// (dos GUID pegados sin guion en la unión). El formulario la rechazaba porque esperaba un guion ahí.
// Las Keys de este test son INVENTADAS: nunca una Key real en el repo. Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const m = APP.match(/function isValidKeyFormat\(v\)\s*\{\s*return\s*(\/.*\/[a-z]*)\.test\(v\)/);
// eslint-disable-next-line no-eval
const RX = m ? eval(m[1]) : null;
const FAKE = 'ABCDEF01-2345-6789-ABCD-EF0123456789ABCDEF01-2345-6789-ABCD-EF0123456789';

test('acepta la Key con la forma real: 72 caracteres, 8-4-4-4-20-4-4-4-12, mayúsculas o minúsculas', () => {
  assert.ok(RX, 'isValidKeyFormat devuelve una regex');
  assert.equal(FAKE.length, 72);
  assert.deepEqual(FAKE.split('-').map((b) => b.length), [8, 4, 4, 4, 20, 4, 4, 4, 12]);
  assert.ok(RX.test(FAKE));
  assert.ok(RX.test(FAKE.toLowerCase()));
});

test('rechaza lo que no es una Key completa', () => {
  ['', FAKE.slice(0, 36), FAKE.slice(0, 71), FAKE + '0', FAKE.slice(0, 36) + '-' + FAKE.slice(36),
    FAKE.replace('A', 'G'), FAKE.replace(/-/g, '')].forEach((v) => assert.equal(RX.test(v), false, JSON.stringify(v)));
});

test('al pegar se quitan espacios y saltos de línea; el mensaje describe la Key real; versión 2.9.2', () => {
  assert.match(APP, /const value = \(el\.kfValue\?\.value \|\| ''\)\.replace\(\/\\s\+\/g, ''\);/);
  assert.ok(RX.test((' ' + FAKE.slice(0, 40) + '\n' + FAKE.slice(40) + ' ').replace(/\s+/g, '')));
  assert.doesNotMatch(APP, /GUID 8-4-4-4-12/, 'sin el mensaje viejo');
  assert.match(APP, /la API Key de GW2 tiene 72 caracteres/);
  assert.match(APP, /GW2 Wallet app\.js v2\.9\.2/);
  assert.match(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /js\/app\.js\?v=2\.9\.2"/);
});
