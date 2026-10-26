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
  // TOP-6: el distintivo está en el pie y sus estilos en js/gn-topbar.js (index.html no puede pasar 48 KB).
  assert.match(HTML, /<a class="gn-bio" href="https:\/\/pablosnchz\.github\.io\/bio\/"/);
  const badge = fs.readFileSync(path.join(ROOT, 'js', 'gn-topbar.js'), 'utf8');
  assert.match(badge, /background-color: #232A3A; color: #F4F6FA;/, 'lado obsidiana');
  assert.match(badge, /background-color: #5A3DDB; color: #FFFFFF;/, 'lado arcano (6,7:1)');
  assert.doesNotMatch(HTML, /#E1306C|#555555/, 'sin los colores anteriores');
});

test('index.html carga mi voz después de la bienvenida, con la versión de cada archivo', () => {
  const at = (re) => { const m = HTML.match(re); assert.ok(m, String(re)); return m.index; };
  const welcome = at(/<script defer src="js\/welcome-panel\.js\?v=[\d.]+"><\/script>/);
  const voice = at(/<script defer src="js\/shiruvana\.js\?v=1\.0\.0"><\/script>/);
  const placesTag = HTML.match(/<script defer src="js\/shiruvana-places\.js\?v=(\d+)\.[\d.]+"><\/script>/);
  assert.ok(placesTag, 'falta el script de los lugares');
  assert.ok(welcome < voice && voice < placesTag.index, 'orden: bienvenida, componente, lugares');
  const src = (f) => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  assert.match(src('shiruvana.js'), /Versión: 1\.0\.0/, 'shiruvana.js: la versión del archivo coincide con la de index.html (caché)');
  // shiruvana-places.js crece por micro-ciclos (1.1.0 en WEL-3) pero index.html (69 KB) no entra en
  // una publicación de la Factory (LES-028): su ?v= queda atrás y se acepta como RSK-020 (Ctrl+F5).
  // Lo que no puede pasar es un cambio de versión mayor sin que index.html lo pida.
  const v = src('shiruvana-places.js').match(/Versión: (\d+)\.\d+\.\d+/);
  assert.ok(v, 'shiruvana-places.js declara su versión');
  assert.equal(v[1], placesTag[1], 'misma versión mayor que la que pide index.html');
});

test('index.html pide la versión del selector que trae el theme oficial', () => {
  const m = HTML.match(/js\/theme-selector\.js\?v=([\d.]+)/);
  assert.ok(m, 'falta el script del selector');
  const src = fs.readFileSync(path.join(ROOT, 'js', 'theme-selector.js'), 'utf8');
  assert.equal(m[1], src.match(/Versión: ([\d.]+)/)[1], 'la versión del script coincide con la del archivo (caché)');
});

test('FP-4 (DEC-035): zona segura, characters-theme una sola vez y el cargador de módulos al final', () => {
  assert.match(HTML, /<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"\/>/);
  assert.equal((HTML.match(/js\/characters(-theme)?\.js/g) || []).length, 0, 'Personajes viejo y su tema ya no se cargan (BL-070 INV-7)');
  const boot = HTML.match(/<script defer src="js\/boot\.js\?v=([\d.]+)"><\/script>/);
  assert.ok(boot, 'index.html carga el cargador');
  const defers = [...HTML.matchAll(/<script defer src="([^"]+)"/g)];
  assert.equal(defers[defers.length - 1][1], 'js/boot.js?v=' + boot[1], 'el cargador es el último defer: corre cuando todo lo demás ya está');
  const src = fs.readFileSync(path.join(ROOT, 'js', 'boot.js'), 'utf8');
  assert.equal(boot[1], src.match(/Versión: ([\d.]+)/)[1], 'el ?v del cargador coincide con su versión (caché)');
});
