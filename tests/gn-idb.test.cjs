// BL-074 BLS-1: cachés en IndexedDB (js/gn-idb.js). Corre con un IndexedDB y un localStorage falsos.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'gn-idb.js'), 'utf8');
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 0));

function fakeLS(init) {
  const m = new Map(Object.entries(init || {}));
  return {
    get length() { return m.size; },
    key: (i) => Array.from(m.keys())[i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    _m: m,
  };
}

// IndexedDB mínimo: una base, un almacén clave→valor, pedidos y transacciones asíncronos.
function fakeIDB(opts) {
  opts = opts || {};
  const dbs = {};
  const later = (fn) => setTimeout(fn, 1);
  function makeDb(name) {
    const stores = {};
    return {
      stores,
      objectStoreNames: { contains: (n) => n in stores },
      createObjectStore(n) { stores[n] = new Map(); },
      transaction(n, mode) {
        const map = stores[n];
        const tx = { oncomplete: null, onerror: null, onabort: null };
        const req = (fn) => { const r = {}; later(() => { r.result = fn(); if (r.onsuccess) r.onsuccess({ target: r }); }); return r; };
        tx.objectStore = () => ({
          put(v, k) { if (mode !== 'readwrite') throw new Error('readonly'); map.set(k, v); return req(() => k); },
          delete(k) { map.delete(k); return req(() => undefined); },
          clear() { map.clear(); return req(() => undefined); },
          getAll() { return req(() => Array.from(map.values())); },
          getAllKeys() { return req(() => Array.from(map.keys())); },
        });
        setTimeout(() => { if (opts.failWrites && mode === 'readwrite') { if (tx.onerror) tx.onerror(); } else if (tx.oncomplete) tx.oncomplete(); }, 5);
        return tx;
      },
    };
  }
  return {
    dbs,
    open(name) {
      const r = {};
      later(() => {
        if (opts.failOpen) { r.error = new Error('bloqueado'); if (r.onerror) r.onerror(); return; }
        const isNew = !dbs[name];
        if (isNew) dbs[name] = makeDb(name);
        r.result = dbs[name];
        if (isNew && r.onupgradeneeded) r.onupgradeneeded({ target: r });
        if (r.onsuccess) r.onsuccess({ target: r });
      });
      return r;
    },
  };
}

function load() {
  const window = { GN_IDB_MANUAL: true };
  vm.runInNewContext(SRC, { window, globalThis: {}, setTimeout, clearTimeout, Map, Promise, JSON, Array, String });
  return window.GNIdb;
}

test('solo guardo cachés: tus datos (Keys, ajustes, fijados) nunca pasan por acá', async () => {
  const G = load();
  await G.init({ indexedDB: fakeIDB(), localStorage: fakeLS() });
  for (const k of ['items_cache_v1:es', 'items_cache_armory_v1:es', 'ach_meta_v3:es:21', 'ach_acc:abcd', 'commerce_listings', 'commerce_prices:24', 'currencies_all:es']) {
    assert.equal(G.handles(k), true, k);
  }
  for (const k of ['gn:account:keys', 'gn:account:selected', 'gn:wallet:pins', 'gn:theme', 'accounts:vault2', 'accounts:lastFile', 'gn:shv:wallet', 'gn:copia:items_cache_v1']) {
    assert.equal(G.handles(k), false, k);
  }
});

test('sin IndexedDB no tomo nada: quien llama sigue con localStorage', async () => {
  const G = load();
  assert.equal(await G.init({ localStorage: fakeLS() }), false);
  assert.equal(G.handles('items_cache_v1:es'), false);
  const H = load();
  assert.equal(await H.init({ indexedDB: fakeIDB({ failOpen: true }), localStorage: fakeLS() }), false);
  assert.equal(H.handles('items_cache_v1:es'), false, 'si no abre, vuelvo a localStorage');
  assert.match(H.stats().error, /bloqueado/);
});

test('lectura y escritura síncronas, y cada get devuelve un objeto nuevo', async () => {
  const G = load();
  await G.init({ indexedDB: fakeIDB(), localStorage: fakeLS() });
  assert.equal(G.set('commerce_listings', { a: [1, 2] }), true);
  const x = G.get('commerce_listings');
  assert.deepEqual(JSON.parse(JSON.stringify(x)), { a: [1, 2] });
  x.a.push(3);
  assert.deepEqual(JSON.parse(JSON.stringify(G.get('commerce_listings'))), { a: [1, 2] }, 'mutar lo leído no cambia el caché');
  assert.equal(G.has('commerce_listings'), true);
  G.del('commerce_listings');
  assert.equal(G.has('commerce_listings'), false);
  assert.equal(G.get('commerce_listings'), null);
  assert.equal(G.get('nada'), null);
});

test('lo escrito llega a IndexedDB y sobrevive a una recarga', async () => {
  const idb = fakeIDB();
  const G = load();
  await G.init({ indexedDB: idb, localStorage: fakeLS() });
  G.set('ach_acc:x', { n: 1 });
  G.set('items_cache_v1:es', { 5: 'x' });
  await G.flush();
  await tick(60);
  const H = load();
  await H.init({ indexedDB: idb, localStorage: fakeLS() });
  assert.deepEqual(JSON.parse(JSON.stringify(H.get('ach_acc:x'))), { n: 1 });
  assert.equal(H.stats().keys, 2);
  H.del('ach_acc:x');
  await H.flush(); await tick(60);
  const I = load();
  await I.init({ indexedDB: idb, localStorage: fakeLS() });
  assert.equal(I.has('ach_acc:x'), false, 'el borrado también llega');
});

test('mudanza: copio de localStorage, y borro de ahí solo cuando IndexedDB confirma; tus datos quedan', async () => {
  const ls = fakeLS({ 'items_cache_v1:es': '{"1":"a"}', 'ach_acc:k': '{"x":2}', 'gn:account:keys': '[{"value":"K"}]', 'accounts:lastFile': 'cifrado' });
  const G = load();
  await G.init({ indexedDB: fakeIDB(), localStorage: ls });
  assert.deepEqual(JSON.parse(JSON.stringify(G.get('items_cache_v1:es'))), { 1: 'a' });
  assert.equal(ls.getItem('items_cache_v1:es'), null, 'el caché salió de localStorage');
  assert.equal(ls.getItem('ach_acc:k'), null);
  assert.equal(ls.getItem('gn:account:keys'), '[{"value":"K"}]', 'tus Keys no se tocan');
  assert.equal(ls.getItem('accounts:lastFile'), 'cifrado', 'el Llavero viejo no es un caché');
  assert.equal(G.stats().migrated, 2);
});

test('si IndexedDB no confirma la escritura, no borro nada de localStorage', async () => {
  const ls = fakeLS({ 'items_cache_v1:es': '{"1":"a"}' });
  const G = load();
  await G.init({ indexedDB: fakeIDB({ failWrites: true }), localStorage: ls });
  assert.equal(ls.getItem('items_cache_v1:es'), '{"1":"a"}', 'sigue en localStorage');
  assert.equal(G.stats().migrated, 0);
});

test('mientras abre, leo lo viejo de localStorage; lo nuevo le gana a lo guardado', async () => {
  const idb = fakeIDB();
  const G0 = load();
  await G0.init({ indexedDB: idb, localStorage: fakeLS() });
  G0.set('ach_acc:z', { v: 'viejo' }); await G0.flush(); await tick(60);
  const ls = fakeLS({ 'commerce_listings': '{"v":"ls"}' });
  const G = load();
  const ready = G.init({ indexedDB: idb, localStorage: ls });
  assert.deepEqual(JSON.parse(JSON.stringify(G.get('commerce_listings'))), { v: 'ls' }, 'antes de leer IndexedDB, uso localStorage');
  G.set('ach_acc:z', { v: 'nuevo' });
  // Un borrado mientras abre gana aunque localStorage no deje borrar (modo restringido).
  ls.removeItem = () => {};
  G.del('commerce_listings');
  assert.equal(G.get('commerce_listings'), null, 'lo borrado no reaparece desde localStorage');
  await ready;
  assert.deepEqual(JSON.parse(JSON.stringify(G.get('ach_acc:z'))), { v: 'nuevo' });
});

test('clear() vacía todos los cachés (memoria, IndexedDB y restos en localStorage) y nada más', async () => {
  const idb = fakeIDB();
  const ls = fakeLS({ 'gn:theme': 'gato' });
  const G = load();
  await G.init({ indexedDB: idb, localStorage: ls });
  G.set('items_cache_v1:es', { a: 1 }); G.set('ach_acc:k', { b: 2 });
  await G.flush(); await tick(60);
  ls.setItem('commerce_prices:7', '{}');
  const n = await G.clear();
  assert.ok(n >= 3);
  assert.equal(G.stats().keys, 0);
  assert.equal(ls.getItem('commerce_prices:7'), null);
  assert.equal(ls.getItem('gn:theme'), 'gato');
  assert.equal(idb.dbs['gn-cache'].stores.kv.size, 0);
});

test('stats cuenta claves y caracteres; versión y presupuesto de tamaño', async () => {
  const G = load();
  await G.init({ indexedDB: fakeIDB(), localStorage: fakeLS() });
  G.set('ach_acc:k', 'ab');
  const s = G.stats();
  assert.equal(s.keys, 1);
  assert.equal(s.chars, 'ach_acc:k'.length + '"ab"'.length);
  assert.equal(G.version, '1.0.0');
  assert.match(SRC, /Versión: 1\.0\.0/);
  assert.ok(SRC.length < 40 * 1024, 'zona saludable (DEC-035)');
  assert.ok(!/innerHTML|fetch\(/.test(SRC));
});
