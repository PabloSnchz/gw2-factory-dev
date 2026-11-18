// tests/topbar-select.test.cjs — BL-096 OJ-2 (EYE-001/EYE-002): sin API Key, el selector de cuenta
// (#keySelectGlobal) queda vacío y se veía como una pastilla vacía arriba al centro. Si no tiene ninguna
// cuenta, no se muestra; apenas cargás una Key, vuelve. La regla vive en css/theme-polish.css.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const POL = fs.readFileSync(path.join(ROOT, 'css', 'theme-polish.css'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const APP = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

test('sin cuentas, el selector de cuenta no se muestra (theme-polish.css)', () => {
  const m = POL.match(/#keySelectGlobal:empty\s*\{([^}]*)\}/);
  assert.ok(m, 'existe la regla para el selector vacío');
  assert.match(m[1], /display:\s*none/);
  assert.doesNotMatch(m[1], /!important/);
});

test('la regla solo toca el selector vacío: con una cuenta (una opción) se ve como siempre', () => {
  assert.doesNotMatch(POL, /#keySelectGlobal\s*\{[^}]*display:\s*none/, 'nunca se oculta el selector con cuentas');
});

test('el selector arranca vacío en index.html y app.js lo vacía antes de llenarlo (por eso :empty aplica)', () => {
  assert.match(INDEX, /<select id="keySelectGlobal"[^>]*><\/select>/);
  const i = APP.indexOf('refreshSelects() {');
  assert.ok(i > 0, 'app.js tiene refreshSelects');
  assert.match(APP.slice(i, i + 200), /sel\.innerHTML = '';/);
});

test('el botón Keys sigue a la vista: sin cuentas, por ahí se carga la primera', () => {
  assert.match(INDEX, /<button id="keysMenuBtn" class="gn-tb__btn"/);
  assert.doesNotMatch(POL, /#keysMenuBtn[^{]*\{[^}]*display:\s*none/);
});

test('index.html pide theme-polish con la versión que declara el archivo (sin caché vieja)', () => {
  const v = (POL.match(/Theme Polish v(\d+\.\d+\.\d+)/) || [])[1];
  assert.ok(v, 'theme-polish declara su versión');
  assert.ok(INDEX.includes('css/theme-polish.css?v=' + v + '"'), 'index.html pide la ' + v);
});
