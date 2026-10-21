// Selector de themes 1.2.0 (DEC-025): "Gato Negro" es el oficial y el de por defecto,
// la migración desde "Bóveda" ocurre una sola vez y después se respeta lo que elija el jugador.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'theme-selector.js'), 'utf8');
const GATO_CSS = path.join(__dirname, '..', 'css', 'themes', 'gato.css');

// Carga el selector con un navegador mínimo y un almacenamiento en memoria.
function boot(initial) {
  const store = new Map(Object.entries(initial || {}));
  const link = { id: 'themeStylesheet', href: '' };
  const attrs = {};
  const Storage = {
    get: (k) => (store.has(k) ? store.get(k) : null),
    set: (k, v) => { store.set(k, v); },
  };
  const document = {
    readyState: 'complete',
    documentElement: { setAttribute: (k, v) => { attrs[k] = v; } },
    getElementById: (id) => (id === 'themeStylesheet' ? link : null),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    head: { appendChild: () => {} },
  };
  const window = {};
  vm.runInNewContext(SRC, { window, document, Storage, console: { info() {}, log() {}, warn() {} }, Math });
  return { api: window.ThemeSelector, store, link, attrs };
}

test('un jugador nuevo ve el theme oficial Gato Negro', () => {
  const { api, store, link, attrs } = boot();
  assert.equal(api.getCurrentTheme(), 'gato');
  assert.equal(attrs['data-theme'], 'gato');
  assert.match(link.href, /^css\/themes\/gato\.css\?v=/);
  assert.equal(store.get('gn:theme'), 'gato');
});

test('quien tenía Bóveda guardado (el default anterior) pasa una sola vez a Gato Negro', () => {
  const { api, store } = boot({ 'gn:theme': 'boveda' });
  assert.equal(api.getCurrentTheme(), 'gato');
  assert.equal(store.get('gn:theme:official'), 'gato-v1');
});

test('si después elige Bóveda, se respeta en las próximas visitas', () => {
  const first = boot({ 'gn:theme': 'boveda' });
  first.api.applyTheme('boveda');
  const again = boot(Object.fromEntries(first.store));
  assert.equal(again.api.getCurrentTheme(), 'boveda');
});

test('quien eligió otro theme lo conserva', () => {
  const { api, store } = boot({ 'gn:theme': 'dracula' });
  assert.equal(api.getCurrentTheme(), 'dracula');
  assert.equal(store.get('gn:theme:official'), 'gato-v1');
});

test('Gato Negro va primero en la lista, Bóveda sigue disponible y cada theme tiene su CSS', () => {
  const { api } = boot();
  const themes = api.getThemes();
  assert.equal(themes[0].id, 'gato');
  assert.equal(themes[0].name, 'Gato Negro');
  assert.ok(themes.some((t) => t.id === 'boveda'), 'Bóveda sigue como opción');
  assert.ok(fs.existsSync(GATO_CSS));
  const ids = themes.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'sin ids repetidos');
  for (const id of ids) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'css', 'themes', id + '.css')), 'falta css/themes/' + id + '.css');
  }
});

test('la etiqueta "Activo" usa el texto más legible sobre el acento', () => {
  const { api } = boot();
  assert.equal(api._readableOn('#A896FF'), '#0F1117');
  assert.equal(api._readableOn('#ffd966'), '#0F1117');
  assert.equal(api._readableOn('#0078d4'), '#ffffff');
});
