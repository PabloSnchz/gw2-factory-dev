// tests/welcome-tags.test.cjs — BL-096 OJ-1 (EYE-001/EYE-002): en la compu, las etiquetas
// «Con Key / Sin Key» de «¿Qué puedo hacer aquí?» no se montan sobre el título del módulo.
// La etiqueta sigue arriba a la derecha (welcome-panel.js), y la tarjeta le reserva su renglón
// con padding-top. La regla vive en css/theme-polish.css porque js/welcome-panel.js está a 46 bytes
// de su techo de 48 KB (tools/size-budget.json): no puede crecer.
// En el celular (≤720 px) la etiqueta ya va en el flujo y la tarjeta vuelve a su relleno de 12 px.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WP = fs.readFileSync(path.join(ROOT, 'js', 'welcome-panel.js'), 'utf8');
const POL = fs.readFileSync(path.join(ROOT, 'css', 'theme-polish.css'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const SEL = '#welcomePanel .wl-mod:has(.wl-tag)';
const mq = (() => {
  const i = POL.indexOf('@media (max-width: 720px)');
  if (i < 0) return '';
  return POL.slice(i, POL.indexOf('}\n}', i) + 3);
})();
const desk = POL.replace(mq, '');

test('la etiqueta sigue arriba a la derecha en la compu y en el flujo en el celular (welcome-panel.js)', () => {
  assert.match(WP, /#welcomePanel \.wl-tag\{position:absolute;top:8px;right:10px;/);
  const i = WP.indexOf('@media (max-width:720px)');
  assert.ok(i > 0 && WP.indexOf('#welcomePanel .wl-tag{position:static}', i) > i, 'en el corte de 720 px la etiqueta va en el flujo');
});

test('en la compu la tarjeta con etiqueta reserva su renglón (≥ 26 px: top 8 + alto de la etiqueta)', () => {
  const i = desk.indexOf(SEL + ' {');
  assert.ok(i >= 0, 'existe la regla de reserva fuera del corte de celular');
  const m = desk.slice(i, desk.indexOf('}', i)).match(/padding-top:\s*(\d+)px/);
  assert.ok(m && Number(m[1]) >= 26, 'reserva al menos 26 px');
});

test('en el celular la tarjeta vuelve a 12 px (gana a la reserva por estar en el mismo selector, después)', () => {
  assert.ok(mq, 'hay corte a 720 px en theme-polish.css');
  assert.match(mq, /#welcomePanel \.wl-mod:has\(\.wl-tag\) \{\s*padding-top:\s*12px;/);
  assert.ok(POL.indexOf(mq) > POL.indexOf(SEL + ' {'), 'el corte va después de la regla de la compu');
});

test('el selector gana a la regla base de la Bienvenida sin !important (más específico)', () => {
  const block = POL.slice(POL.indexOf(SEL + ' {'));
  assert.doesNotMatch(block.slice(0, block.indexOf('}')), /!important/);
  assert.match(WP, /#welcomePanel \.wl-mod\{position:relative;display:flex;[^']*padding:12px 14px 12px 17px/);
});

test('index.html pide theme-polish con la versión que declara el archivo, 2.4.1 o más nueva (sin caché vieja)', () => {
  const v = (POL.match(/Theme Polish v(\d+)\.(\d+)\.(\d+)/) || []).slice(1).map(Number);
  assert.equal(v.length, 3, 'theme-polish declara su versión');
  assert.ok(INDEX.includes('css/theme-polish.css?v=' + v.join('.') + '"'), 'index.html pide la ' + v.join('.'));
  assert.ok(v[0] > 2 || (v[0] === 2 && (v[1] > 4 || (v[1] === 4 && v[2] >= 1))), 'la reserva llegó en la 2.4.1');
});
