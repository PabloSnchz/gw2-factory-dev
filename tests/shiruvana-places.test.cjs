// Dónde le hablo al jugador (DEC-025): bienvenida, modal de API Keys y modal de guías. Una vez por lugar.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'shiruvana-places.js'), 'utf8');

// Contenedor mínimo: hijos, atributos y las dos búsquedas que usa el módulo.
function node(extra) {
  const n = Object.assign({ children: [], attrs: {}, textContent: '', parentNode: null }, extra || {});
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.insertBefore = (c, ref) => { c.parentNode = n; const i = ref ? n.children.indexOf(ref) : -1; if (i < 0) n.children.push(c); else n.children.splice(i, 0, c); };
  n.removeChild = (c) => { n.children.splice(n.children.indexOf(c), 1); c.parentNode = null; };
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  n.querySelector = (sel) => {
    const m = sel.match(/^\[data-shv-place="(.+)"\]$/);
    if (m) return n.children.find((c) => c.attrs['data-shv-place'] === m[1]) || null;
    if (sel === 'p.muted') return n.children.find((c) => c.muted) || null;
    return null;
  };
  return n;
}

function setup({ keys = null, welcomeDrawn = true } = {}) {
  const welcomeBody = node();
  if (welcomeDrawn) welcomeBody.insertBefore(node({ textContent: 'contenido' }), null);
  const keysBody = node();
  keysBody.insertBefore(node({ textContent: 'Agregá, renombrá…' }), null);
  const guideBody = node();
  guideBody.insertBefore(node({ muted: true, textContent: 'Elegí la guía que mejor se adapte a lo que necesitás:' }), null);
  const map = { '#welcomePanel .panel__body': welcomeBody, '#keysModal .modal__body': keysBody, '#guideModal .modal__body': guideBody };
  const calls = [];
  const window = {
    Shiruvana: { voice: (o) => { calls.push(o); return node({ voice: o }); } },
    Storage: { get: (k) => (k === 'gn:account:keys' ? keys : null) },
  };
  window.document = {
    readyState: 'complete',
    querySelector: (s) => map[s] || null,
    getElementById: () => null,
    addEventListener() {},
  };
  vm.runInNewContext(SRC, { window, globalThis: {} });
  return { P: window.ShiruvanaPlaces, welcomeBody, keysBody, guideBody, calls };
}

test('al cargar aparezco primero en la bienvenida, el modal de API Keys y el de guías', () => {
  const { welcomeBody, keysBody, guideBody } = setup();
  assert.equal(welcomeBody.children[0].attrs['data-shv-place'], 'welcome');
  assert.equal(keysBody.children[0].attrs['data-shv-place'], 'keys');
  assert.equal(guideBody.children[0].attrs['data-shv-place'], 'guide');
});

test('sin API Key te digo cómo empezar; con API Key, te saludo de nuevo', () => {
  const nuevo = setup({ keys: null });
  assert.deepEqual(nuevo.welcomeBody.children[0].voice.text, nuevo.P.TEXTS.welcomeNew);
  assert.equal(nuevo.welcomeBody.children[0].voice.size, 'lg');
  const vuelve = setup({ keys: [{ label: 'main', key: 'x' }] });
  assert.deepEqual(vuelve.welcomeBody.children[0].voice.text, vuelve.P.TEXTS.welcomeBack);
});

test('una sola vez por lugar, aunque me llamen de nuevo', () => {
  const { P, welcomeBody, keysBody } = setup();
  P.init(); P.welcome(); P.keys();
  assert.equal(welcomeBody.children.filter((c) => c.attrs['data-shv-place']).length, 1);
  assert.equal(keysBody.children.filter((c) => c.attrs['data-shv-place']).length, 1);
});

test('si la bienvenida se vuelve a dibujar, reaparezco', () => {
  const { P, welcomeBody } = setup();
  welcomeBody.children.length = 0; // el módulo de bienvenida reemplaza su contenido
  welcomeBody.insertBefore(node({ textContent: 'contenido nuevo' }), null);
  P.welcome();
  assert.equal(welcomeBody.children[0].attrs['data-shv-place'], 'welcome');
});

test('no aparezco en una bienvenida vacía (todavía sin dibujar)', () => {
  const { welcomeBody } = setup({ welcomeDrawn: false });
  assert.equal(welcomeBody.children.length, 0);
});

test('en el modal de guías mi recomendación reemplaza la frase genérica', () => {
  const { guideBody } = setup();
  assert.equal(guideBody.children.some((c) => c.muted), false);
});

test('hablo en primera persona, con voseo, y digo la verdad sobre dónde viaja la clave', () => {
  const { P } = setup();
  const all = Object.values(P.TEXTS).flat().join(' ');
  assert.doesNotMatch(all, /Shiruvana (hace|te ayuda|está)/, 'nunca en tercera persona');
  assert.match(P.TEXTS.keys.join(' '), /Gist privado/, 'si se sincroniza, la clave también va al Gist');
  assert.match(P.TEXTS.welcomeNew.join(' '), /tocá/);
});

test('sin el componente de voz no rompo nada', () => {
  const window = { Storage: { get: () => null } };
  window.document = { readyState: 'complete', querySelector: () => node(), getElementById: () => null, addEventListener() {} };
  assert.doesNotThrow(() => vm.runInNewContext(SRC, { window, globalThis: {} }));
});
