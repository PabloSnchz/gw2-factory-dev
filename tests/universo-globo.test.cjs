// tests/universo-globo.test.cjs — BL-096 OJ-3 (lo vi en EYE-001): en el celular, mi globo
// plegado con el gato tapaba parte del paso 1 de Inicio. Plegada ocupo menos: pegada al borde, sin
// relleno de más, cara de 40 px y el gato más chico; el botón para abrirme sigue a medida del dedo (44 px).
// Abierta, y en la compu, quedo igual. Las reglas van en css/universo.css (solo con el theme Gato Negro).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const RAW = read('css/universo.css');
const CSS = RAW.replace(/\/\*[\s\S]*?\*\//g, '');
const KIT = read('css/escena-kit.css');
const S = ':root:is([data-theme="gato"],:not([data-theme]))';

function block(src, head) {
  const i = src.indexOf(head + ' {');
  assert.ok(i >= 0, 'falta ' + head);
  let d = 0, j = src.indexOf('{', i);
  for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && !--d) break; }
  return src.slice(i, j + 1);
}
function rule(src, sel) {
  const i = src.indexOf(sel + ' {');
  assert.ok(i >= 0, 'falta ' + sel);
  return src.slice(i + sel.length + 2, src.indexOf('}', i));
}
const num = (body, prop) => Number((body.match(new RegExp('(?:^|[;\\s])' + prop + ':\\s*(\\d+)px')) || [])[1]);
const M = block(CSS, '@media (max-width: 900px)');

test('celular, plegada: pegada al borde y sin relleno de más', () => {
  const r = rule(M, S + ' .svk-globo.is-plegado');
  assert.match(r, /width:\s*auto/);
  assert.ok(num(r, 'right') <= 8, 'a 8 px del borde o menos');
  assert.ok(num(r, 'padding') <= 4, 'relleno de 4 px o menos (el kit trae 8)');
  assert.ok(num(r, 'gap') <= 4, 'separación de 4 px o menos (el kit trae 12)');
});

test('celular, plegada: cara de 40 px y el gato más chico que el del kit (64 px), sentado sobre mi cara', () => {
  const c = rule(M, S + ' .svk-globo.is-plegado .svk-cara');
  assert.equal(num(c, 'width'), 40); assert.equal(num(c, 'height'), 40);
  const g = rule(M, S + ' .svk-globo.is-plegado .svk-gato');
  const kit = rule(KIT, '.svk-globo.is-plegado .svk-gato');
  assert.ok(num(g, 'width') < num(kit, 'width'), 'más chico que el del kit');
  assert.ok(num(g, 'width') >= 44, 'se sigue viendo y se puede tocar');
  assert.match(g, /bottom:\s*calc\(100% - \d+px\)/, 'sentado sobre el borde');
});

test('el botón para abrirme sigue de 44 px y lo de la compu y el globo abierto no cambian', () => {
  const b = rule(M, S + ' .svk-globo .svk-plegar');
  assert.equal(num(b, 'width'), 44); assert.equal(num(b, 'height'), 44);
  const outside = CSS.replace(M, '');
  assert.ok(!/\.is-plegado \.svk-(cara|gato) \{/.test(outside), 'la compu queda como estaba');
  assert.ok(!/\.svk-globo:not\(\.is-plegado\)/.test(CSS), 'abierta, igual que antes');
});

test('ocupo menos: el rectángulo plegado (con el gato) baja al menos un 25 % frente al del kit en el celular', () => {
  const kitG = rule(KIT, '.svk-globo.is-plegado .svk-gato'), myG = rule(M, S + ' .svk-globo.is-plegado .svk-gato');
  const myP = rule(M, S + ' .svk-globo.is-plegado'), myC = rule(M, S + ' .svk-globo.is-plegado .svk-cara');
  const over = (g) => Number((g.match(/bottom:\s*calc\(100% - (\d+)px\)/) || [0, 14])[1]);
  // antes: relleno 8, cara 44, separación 12, botón 44; gato 64 que entra 14 px
  const before = (8 + 44 + 12 + 44 + 8) * (8 + 44 + 8 + num(kitG, 'width') - 14);
  const pad = num(myP, 'padding'), gap = num(myP, 'gap'), cara = num(myC, 'width');
  const h = pad + Math.max(cara, 44) + pad;
  const after = (pad + cara + gap + 44 + pad) * (h + num(myG, 'width') - over(myG));
  assert.ok(after <= before * 0.75, 'antes ' + before + ' px², ahora ' + after + ' px²');
});

test('versión 1.6.0 en el archivo y en index.html; todo con el alcance del theme y sin !important', () => {
  assert.match(RAW, /Versión: 1\.6\.0 \(2026-11-18\)/);
  assert.match(read('index.html'), /css\/universo\.css\?v=1\.6\.0"/);
  const mine = M.split('\n').filter((l) => /is-plegado/.test(l));
  assert.ok(mine.length >= 3);
  mine.forEach((l) => { assert.ok(l.trim().startsWith(S), l); assert.doesNotMatch(l, /!important/); });
});
