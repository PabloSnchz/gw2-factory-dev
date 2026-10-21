// Marca oficial de Gato Negro Factory en La Bóveda (DEC-024 §1, DEC-025).
// El gato es el mismo del panel (brandMark() de gw2-factory-dashboard/gds/icons.js): no se rediseña.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const SVG = fs.readFileSync(path.join(__dirname, '..', 'assets', 'brand', 'gato-negro.svg'), 'utf8');
const shapes = (s) => [...s.matchAll(/<(rect|path|ellipse)\b[^>]*\/>/g)].map((m) => m[0]);

// Geometría y colores exactos de brandMark(), con los tokens del GDS resueltos.
const EXPECTED = [
  '<rect x="1" y="1" width="30" height="30" rx="8" fill="#232A3A" stroke="#7B5CFF"/>',
  '<path d="M8 25V12l3-5 3 4h4l3-4 3 5v13c0 1-1 2-2 2H10c-1 0-2-1-2-2z" fill="#0F1117"/>',
  '<ellipse cx="13" cy="17" rx="1.6" ry="2.2" fill="#F2B94B"/>',
  '<ellipse cx="19" cy="17" rx="1.6" ry="2.2" fill="#F2B94B"/>',
];

test('el gato de La Bóveda es exactamente el gato oficial del panel', () => {
  assert.deepEqual(shapes(SVG), EXPECTED);
  assert.equal(createHash('sha256').update(shapes(SVG).join('\n')).digest('hex'),
    createHash('sha256').update(EXPECTED.join('\n')).digest('hex'));
});

test('el SVG es un archivo de imagen válido y accesible', () => {
  assert.match(SVG, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(SVG, /viewBox="0 0 32 32"/);
  assert.match(SVG, /<title[^>]*>Gato Negro Factory<\/title>/);
  assert.match(SVG.trim(), /<\/svg>$/);
});

test('el SVG no ejecuta nada ni carga recursos externos', () => {
  assert.doesNotMatch(SVG, /<script|on\w+=|href=|<image|<foreignObject/i);
});
