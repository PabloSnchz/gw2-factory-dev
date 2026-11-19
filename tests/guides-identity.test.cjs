// Guías de usuario con la identidad Gato Negro (DEC-025): gato oficial, favicon y el theme que eligió el jugador.
// BL-094 GU-1: cada theme se pide con su versión real, la misma de js/theme-selector.js (THEME_V). Antes iban
// todas con ?v=1.0.0 fijo y el navegador mostraba Gato Negro con los colores de antes de BV-6.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
// Se agregan acá a medida que cada guía se migra.
const GUIDES = ['docs/user-guide.html', 'docs/user-guide-avanzado.html'];

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const styleOf = (html) => html.slice(html.indexOf('<style>'), html.indexOf('</style>'));

// Las versiones que pide La Bóveda: THEME_V de js/theme-selector.js (los que no figuran, 1.0.0).
function themeVersions() {
  const m = read('js/theme-selector.js').match(/var THEME_V = (\{[^}]*\});/);
  assert.ok(m, 'THEME_V en js/theme-selector.js');
  return vm.runInNewContext('(' + m[1] + ')');
}
const THEME_V = themeVersions();
const ver = (t) => THEME_V[t] || '1.0.0';

// Ejecuta el script del theme con un localStorage simulado y devuelve el CSS y el data-theme elegidos.
function themeFor(html, stored) {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const link = { href: '' };
  const attrs = {};
  const document = {
    getElementById: (id) => (id === 'themeStylesheet' ? link : null),
    documentElement: { setAttribute: (k, v) => { attrs[k] = v; } },
  };
  const localStorage = { getItem: (k) => (k in stored ? stored[k] : null) };
  vm.runInNewContext(script, { document, localStorage, JSON });
  return { href: link.href, theme: attrs['data-theme'] };
}

for (const guide of GUIDES) {
  const html = read(guide);

  test(`${guide}: usa el gato oficial y el favicon de la marca`, () => {
    assert.doesNotMatch(html, /logo-gato-negro\.png/);
    assert.match(html, /<img src="\.\.\/assets\/brand\/gato-negro\.svg"/);
    assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\.\.\/assets\/brand\/gato-negro\.svg"\/>/);
  });

  test(`${guide}: los colores salen del theme activo, no están fijos`, () => {
    const loose = styleOf(html).replace(/var\([^)]*\)/g, '').match(/#[0-9a-fA-F]{3,6}\b/g);
    assert.equal(loose, null, 'colores fijos: ' + loose);
    assert.match(html, /<link rel="stylesheet" href="\.\.\/css\/themes\/gato\.css\?v=[\d.]+" id="themeStylesheet">/);
  });

  test(`${guide}: aplica el theme guardado por La Bóveda y cae en Gato Negro si no hay o es inválido`, () => {
    assert.deepEqual(themeFor(html, { 'gn:theme': 'dracula' }), { href: '../css/themes/dracula.css?v=' + ver('dracula'), theme: 'dracula' });
    assert.deepEqual(themeFor(html, { 'gn:theme': '"nord"' }), { href: '../css/themes/nord.css?v=' + ver('nord'), theme: 'nord' });
    assert.deepEqual(themeFor(html, {}), { href: '../css/themes/gato.css?v=' + ver('gato'), theme: 'gato' });
    assert.deepEqual(themeFor(html, { 'gn:theme': 'gato' }), { href: '../css/themes/gato.css?v=' + ver('gato'), theme: 'gato' });
    assert.equal(themeFor(html, { 'gn:theme': '../../evil' }).theme, 'gato');
  });

  test(`${guide}: pide cada theme con la versión de js/theme-selector.js (BL-094)`, () => {
    const first = html.match(/href="\.\.\/css\/themes\/gato\.css\?v=([\d.]+)" id="themeStylesheet"/)[1];
    assert.equal(first, ver('gato'), 'el primer pintado ya con la versión real de Gato Negro');
    Object.keys(THEME_V).forEach((t) => assert.equal(themeFor(html, { 'gn:theme': t }).href, '../css/themes/' + t + '.css?v=' + THEME_V[t], t));
    assert.notEqual(ver('gato'), '1.0.0', 'si Gato Negro vuelve a 1.0.0, revisá este test');
  });
}
