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

test('el enlace a la bio usa los colores oficiales de Gato Negro, fijos y legibles', () => {
  const badge = HTML.slice(HTML.indexOf('href="https://pablosnchz.github.io/bio/"'));
  assert.match(badge, /background-color: #232A3A; color: #F4F6FA;/, 'lado obsidiana');
  assert.match(badge, /background-color: #5A3DDB; color: #FFFFFF;/, 'lado arcano (6,7:1)');
  assert.doesNotMatch(HTML, /#E1306C|#555555/, 'sin los colores anteriores');
});

test('index.html carga mi voz después de la bienvenida, con la versión de cada archivo', () => {
  const at = (re) => { const m = HTML.match(re); assert.ok(m, String(re)); return m.index; };
  const welcome = at(/<script defer src="js\/welcome-panel\.js\?v=[\d.]+"><\/script>/);
  const voice = at(/<script defer src="js\/shiruvana\.js\?v=1\.0\.0"><\/script>/);
  const places = at(/<script defer src="js\/shiruvana-places\.js\?v=1\.0\.0"><\/script>/);
  assert.ok(welcome < voice && voice < places, 'orden: bienvenida, componente, lugares');
  for (const f of ['shiruvana.js', 'shiruvana-places.js']) {
    const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
    assert.match(src, /Versión: 1\.0\.0/, f + ': la versión del archivo coincide con la de index.html (caché)');
  }
});

test('index.html pide la versión del selector que trae el theme oficial', () => {
  const m = HTML.match(/js\/theme-selector\.js\?v=([\d.]+)/);
  assert.ok(m, 'falta el script del selector');
  const src = fs.readFileSync(path.join(ROOT, 'js', 'theme-selector.js'), 'utf8');
  assert.equal(m[1], src.match(/Versión: ([\d.]+)/)[1], 'la versión del script coincide con la del archivo (caché)');
});
