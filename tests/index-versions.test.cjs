// RSK-020 y DEC-035 (FP-5): cada script se pide con la versión que tiene.
// Si index.html (o js/modules.json) pide ?v=X y el archivo va por otra versión, el
// navegador puede quedarse con la copia vieja y hace falta Ctrl+F5. Desde FP-5 todos
// coinciden; este test no deja que vuelvan a separarse.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inventory } = require('../tools/index-versions.cjs');

const ROOT = path.join(__dirname, '..');
const rows = inventory(ROOT);
const html = rows.filter((r) => r.from === 'index.html');
const mods = rows.filter((r) => r.from === 'modules.json');

// Archivos sin versión en la cabecera: no hay contra qué comparar su ?v. Cuando alguno
// declare «Versión: X», sale de esta lista (el test lo pide) y queda controlado.
const SIN_VERSION = ['js/item-icons.js', 'js/legendary-tree.js'];
// analytics.js no lleva ?v: en producción es otro archivo (GA, DEC-006).
const SIN_V = ['js/analytics.js'];

test('todo script local de index.html y de modules.json existe', () => {
  assert.deepEqual(rows.filter((r) => r.status === 'falta').map((r) => r.src), []);
});

test('index.html pide cada script con la versión que declara el archivo (RSK-020)', () => {
  const off = html.filter((r) => r.status === 'atrasada').map((r) => r.src + ' pide ' + r.v + ' y el archivo va por ' + r.file);
  assert.deepEqual(off, [], 'actualizá el ?v en index.html (por el canal de parches)');
});

test('las excepciones son exactamente las conocidas', () => {
  assert.deepEqual(html.filter((r) => r.status === 'sin-version').map((r) => r.src).sort(), SIN_VERSION);
  assert.deepEqual(html.filter((r) => r.status === 'sin-v').map((r) => r.src), SIN_V);
});

test('modules.json: cada módulo con su versión exacta y sin cargarse también desde index.html', () => {
  assert.ok(mods.length >= 1, 'el manifiesto ya carga módulos');
  mods.forEach((m) => assert.equal(m.status, 'ok', m.src + ' pide ' + m.v + ' y el archivo va por ' + m.file));
  const both = mods.filter((m) => html.some((h) => h.src === m.src)).map((m) => m.src);
  assert.deepEqual(both, [], 'un módulo se carga desde un solo lugar');
});

test('primer módulo del manifiesto: wv-tabs-skin.js (Cámara del Brujo) se carga por boot.js', () => {
  assert.ok(mods.some((m) => m.src === 'js/wv-tabs-skin.js'));
  assert.ok(!html.some((h) => h.src === 'js/wv-tabs-skin.js'));
  // Se carga después de DOMContentLoaded: no puede esperar solo ese evento.
  const src = fs.readFileSync(path.join(ROOT, 'js', 'wv-tabs-skin.js'), 'utf8');
  assert.match(src, /document\.readyState === 'loading'\) document\.addEventListener\('DOMContentLoaded', onReady\);\s*else onReady\(\);/);
});
