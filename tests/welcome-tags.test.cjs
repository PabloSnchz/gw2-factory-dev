// tests/welcome-tags.test.cjs — BL-096 OJ-1 (EYE-001/EYE-002): en la compu, las etiquetas
// «Con Key / Sin Key» de «¿Qué puedo hacer aquí?» no se montan sobre el título del módulo.
// La etiqueta sigue arriba a la derecha, pero la tarjeta le reserva su renglón (padding-top);
// en el celular (≤720 px) la etiqueta ya va en el flujo y no hace falta reservar nada.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'welcome-panel.js'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function el() {
  const n = { children: [], attrs: {}, hidden: false, _html: '', className: '', style: { setProperty() {}, removeProperty() {} } };
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.removeAttribute = () => {};
  n.appendChild = (c) => { n.children.push(c); return c; };
  n.insertBefore = (c) => { n.children.unshift(c); return c; };
  n.addEventListener = () => {};
  n.querySelector = () => null;
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  Object.defineProperty(n, 'innerHTML', { get: () => n._html, set: (v) => { n._html = v; } });
  return n;
}
function load() {
  const panel = el(), head = el();
  const window = {
    console: { info() {}, warn() {}, log() {} },
    Storage: { STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys', THEME: 'gn:theme' }, get: () => null, set() {} },
    location: { hash: '' }, addEventListener() {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    MutationObserver: function () { this.observe = () => {}; },
  };
  window.document = {
    readyState: 'complete', head, documentElement: { setAttribute() {} },
    getElementById: (id) => (id === 'welcomePanel' ? panel : null),
    createElement: () => el(), addEventListener() {},
  };
  vm.runInNewContext(SRC, { window, Date, JSON, Promise, Math });
  return window.Welcome;
}
const W = load();
const CSS = W._pure.CSS;
const MQ = (() => { const i = CSS.indexOf('@media (max-width:720px)'); return CSS.slice(i, CSS.indexOf('\n', i)); })();
const DESK = CSS.split('\n').filter((l) => l.indexOf('@media') < 0).join('\n');

test('la etiqueta sigue arriba a la derecha (posición absoluta) en la compu', () => {
  assert.match(DESK, /#welcomePanel \.wl-tag\{position:absolute;top:8px;right:10px;/);
});

test('en la compu la tarjeta con etiqueta reserva su renglón: el título queda debajo', () => {
  const m = DESK.match(/#welcomePanel \.wl-mod:has\(\.wl-tag\)\{padding-top:(\d+)px\}/);
  assert.ok(m, 'existe la regla de reserva');
  // etiqueta: top 8px + ~16px de alto (0.66rem + 2px de padding + bordes) → hace falta >= 26px
  assert.ok(Number(m[1]) >= 26, 'reserva al menos 26px, reserva ' + m[1]);
});

test('en el celular la etiqueta va en el flujo y la tarjeta vuelve a su relleno de siempre', () => {
  assert.match(MQ, /#welcomePanel \.wl-tag\{position:static\}/);
  assert.match(MQ, /#welcomePanel \.wl-mod:has\(\.wl-tag\)\{padding-top:12px\}/);
});

test('las tarjetas sin Key y con Key llevan la etiqueta que activa la reserva', () => {
  const html = W._pure.bodyHTML(W._pure.buildModel({ keys: [], selected: null }), []);
  assert.match(html, /<a class="wl-mod"[^>]*>[\s\S]*?<i class="wl-tag wl-tag--free">Sin Key<\/i><\/a>/);
  assert.match(html, /<i class="wl-tag wl-tag--key">Con Key<\/i><\/a>/);
});

test('versión 2.4.1 en el archivo y en index.html (sin caché vieja)', () => {
  assert.match(SRC, /Versión: 2\.4\.1 \(2026-11-18\)/);
  assert.equal(W.version, '2.4.1');
  assert.match(INDEX, /js\/welcome-panel\.js\?v=2\.4\.1"/);
});
