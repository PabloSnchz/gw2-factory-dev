// BL-094 GU-3: mis poses en las guías de usuario, solo con el theme Gato Negro (FEAT-028).
// js/guias-escena.js baja el kit de la Bóveda y pide las poses sin fondo; css/guias.css las pone en momentos
// puntuales (bienvenida, un consejo y el cierre), al costado y con su lugar propio.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const G = require('../js/guias-escena.js');
const KIT = require('../js/escena-kit.js');
const CSS = read('css/guias.css').replace(/\/\*[\s\S]*?\*\//g, '');
const GUIDES = ['docs/user-guide.html', 'docs/user-guide-avanzado.html'];

// Documento mínimo: theme, head y body.
function fakeDoc(theme) {
  const added = [];
  const doc = {
    documentElement: { getAttribute: (k) => (k === 'data-theme' ? theme : null) },
    head: { appendChild: (n) => added.push(n) },
    body: {},
    createElement: (tag) => ({ tag }),
    getElementById: (id) => added.find((n) => n.id === id) || null,
  };
  return { doc, added };
}

test('con otro theme no baja nada ni pide poses', () => {
  const { doc, added } = fakeDoc('dracula');
  assert.equal(G.iniciar(doc), 'otro-theme');
  assert.equal(added.length, 0);
});

test('con Gato Negro (o sin data-theme) baja el kit de la Bóveda una sola vez, con su versión fija', () => {
  for (const theme of ['gato', null]) {
    const { doc, added } = fakeDoc(theme);
    delete globalThis.ShiruvanaKit;
    assert.equal(G.iniciar(doc), 'bajando');
    assert.equal(G.iniciar(doc), 'sin-kit', 'no lo pide dos veces');
    assert.equal(added.length, 1);
    assert.equal(added[0].src, '../js/escena-kit.js?v=' + KIT.VERSION, 'la misma versión que la copia de la Bóveda');
    assert.equal(added[0].async, false);
  }
  assert.equal(G.KIT.v, KIT.VERSION);
});

test('con el kit listo pide mis poses sin fondo, desde las imágenes de la Bóveda', () => {
  const { doc } = fakeDoc('gato');
  const calls = [];
  globalThis.ShiruvanaKit = { posesSinFondo: (o) => calls.push(o) };
  try {
    assert.equal(G.iniciar(doc), 'listo');
  } finally { delete globalThis.ShiruvanaKit; }
  assert.equal(calls.length, 1);
  assert.equal(calls[0].el, doc.body);
  assert.equal(calls[0].base, '../assets/brand/');
  assert.deepEqual(calls[0].poses, ['saluda', 'pensando', 'sentada']);
  calls[0].poses.forEach((p) => {
    assert.ok(KIT.POSES.includes(p), p + ': el kit sabe recortarla');
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/brand/shiruvana/cuerpo-' + p + '.webp')), p + ': la imagen existe');
  });
});

test('cada pose que pido tiene su lugar en css/guias.css, solo cuando está lista (clase svk-p-<pose>)', () => {
  G.POSES.forEach((p) => {
    const re = new RegExp('body\\.svk-p-' + p + ' [^{]+\\{[^}]*background-image:\\s*var\\(--svk-p-' + p + '\\)');
    assert.match(CSS, re, p + ': falta su regla');
  });
  // ninguna pose sin su clase: si la imagen no está lista, no hay nada (nunca un rectángulo negro)
  [...CSS.matchAll(/var\(--svk-p-(\w+)\)/g)].forEach((m) => {
    const sel = CSS.slice(CSS.lastIndexOf('}', m.index) + 1, CSS.indexOf('{', CSS.lastIndexOf('}', m.index) + 1));
    assert.match(sel, new RegExp('body\\.svk-p-' + m[1] + ' '), 'la pose ' + m[1] + ' solo con su clase');
  });
});

test('las poses van al costado con su lugar propio, también en el celular', () => {
  const reglas = [...CSS.matchAll(/([^{}]*body\.svk-p-\w+[^{]*)\{([^}]*)\}/g)];
  assert.ok(reglas.length >= 4, 'reglas de poses (compu y celular)');
  reglas.forEach((m) => {
    assert.match(m[2], /padding-right:\s*\d+px/, 'lugar propio: ' + m[1].trim());
    assert.match(m[2], /background-position:\s*right/, 'al costado: ' + m[1].trim());
    const pad = +m[2].match(/padding-right:\s*(\d+)px/)[1];
    const size = +m[2].match(/background-size:\s*(\d+)px/)[1];
    assert.ok(pad >= size + 10, 'la pose (' + size + ' px) entra en su lugar (' + pad + ' px)');
  });
  const cel = CSS.slice(CSS.indexOf('@media (max-width: 600px)'));
  assert.match(cel, /body\.svk-p-saluda[\s\S]*padding-right:\s*92px/, 'en el celular, más chicas');
});

test('los lugares de las poses existen en las guías y las dos guías cargan el script con su versión', () => {
  const pg = read('docs/user-guide.html'), av = read('docs/user-guide-avanzado.html');
  ['que-es', 'datos', 'comunidad'].forEach((id) => assert.ok(pg.includes('<section class="sec" style="--x:') && pg.includes('aria-labelledby="' + id + '"'), 'Primeros pasos: ' + id));
  assert.match(av, /<section class="modsec" id="mod-settings">/, 'Guía por módulo: Ajustes');
  assert.match(av, /<main class="wrap">[\s\S]*?\n  <div class="box">/, 'Guía por módulo: la intro');
  GUIDES.forEach((g) => {
    const h = read(g);
    const s = h.match(/<script defer src="\.\.\/js\/guias-escena\.js\?v=([\d.]+)"><\/script>/);
    assert.ok(s, g + ': carga js/guias-escena.js');
    assert.equal(s[1], G.VERSION, g + ': con la versión del archivo (caché)');
    assert.ok(s.index > h.indexOf('id="themeStylesheet"'), g + ': después del theme');
  });
  assert.match(read('js/guias-escena.js'), new RegExp('Versión: ' + G.VERSION.replace(/\./g, '\\.')));
});
