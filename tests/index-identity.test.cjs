// Identidad de Gato Negro Factory en index.html (DEC-025): marca oficial, theme oficial por defecto.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const BRAND = 'assets/brand/gato-negro.svg';

test('el logo de la cabecera, el pie y el favicon usan el gato oficial', () => {
  assert.match(HTML, /<img class="brand-logo-compact" src="assets\/brand\/gato-negro\.svg"/);
  assert.match(HTML, /<img class="footer-mark" src="assets\/brand\/gato-negro\.svg"/);
  assert.match(HTML, /<link rel="icon" type="image\/svg\+xml" href="assets\/brand\/gato-negro\.svg"\/>/);
  assert.doesNotMatch(HTML, /logo-gato-negro\.png|assets\/favicon\.png/, 'no queda la marca anterior');
  assert.ok(fs.existsSync(path.join(ROOT, BRAND)));
});

test('la página arranca con el theme oficial Gato Negro (sin parpadeo antes del JS)', () => {
  assert.match(HTML, /<link rel="stylesheet" href="css\/themes\/gato\.css\?v=[\d.]+" id="themeStylesheet">/);
  assert.match(HTML, /<meta name="theme-color" content="#0F1117"\/>/);
});

test('index.html pide la versión del selector que trae el theme oficial', () => {
  const m = HTML.match(/js\/theme-selector\.js\?v=([\d.]+)/);
  assert.ok(m, 'falta el script del selector');
  const src = fs.readFileSync(path.join(ROOT, 'js', 'theme-selector.js'), 'utf8');
  assert.equal(m[1], src.match(/Versión: ([\d.]+)/)[1], 'la versión del script coincide con la del archivo (caché)');
});
