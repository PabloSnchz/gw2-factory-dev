// Armería (BL-064, ARM-4): armaduras por set.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const JS = path.join(__dirname, '..', 'js');

function cargar(opts = {}) {
  const registro = {};
  const win = {
    console: { info() {}, log() {}, warn() {} },
    LegendaryTracker: {
      QUEUE_MAX: 5,
      registerRender(map) { registro.r = map; return true; },
      registerItemModal() { return true; },
      getOwnershipCounts() { return { tengo: 0, faltan: 206 }; },
      getQueue() { return (opts.queue || []).slice(); },
      getState() {
        return { mode: 'catalog', token: opts.token === undefined ? 'KEY' : opts.token, loading: false, error: opts.error || null, owned: {} };
      }
    }
  };
  win.window = win;
  win.document = { getElementById: () => null, createElement: () => ({}), head: { appendChild() {} } };
  win.setTimeout = setTimeout;
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(JS, 'legendary-data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(JS, 'render-catologo.js'), 'utf8'), ctx);
  const items = win.LegendaryCatalog.items;
  return { r: registro.r, items, A: win.LegendaryCatalogUI._arm, armor: items.filter((x) => x.type === 'armor') };
}
const sets = (h) => [...h.matchAll(/<details class="arm-set" data-set="([\w-]+)"[^>]*>([\s\S]*?)<\/details>/g)];
const ids = (h) => [...h.matchAll(/class="card lt-item-card" data-id="(\d+)"/g)].map((m) => Number(m[1]));
const ENV_HEAVY = [80205, 80254, 80277, 80384, 80435, 80557];

test('las 132 piezas quedan en 23 sets: 7 × 3 pesos de 6 piezas, más Eikasia y Selachimorpha', () => {
  const { A, armor } = cargar();
  assert.equal(armor.length, 132);
  const by = {};
  for (const it of armor) {
    const s = A.setOf(it);
    assert.ok(s, 'sin set: ' + it.name);
    (by[s.key] = by[s.key] || { s, n: 0 }).n++;
  }
  const keys = Object.keys(by);
  assert.equal(keys.length, 23);
  assert.equal(keys.filter((k) => by[k].n === 6).length, 21);
  assert.equal(by.eik.n, 3);
  assert.equal(by.sel.n, 3);
  assert.equal(by['env-heavy'].s.name, 'Enviado perfeccionado · Pesada');
  assert.equal(by['mtri-light'].s.name, 'Héroe triunfal forjado en la Niebla · Ligera');
  assert.equal(by.eik.s.name, 'Eikasia, aferranieblas');
  assert.equal(by.eik.s.piece, 'Guantes');
  assert.equal(by.sel.s.piece, 'Casco acuático');
  // «Sublime Mistforged» es la pechera del set forjado en la Niebla, no un set aparte.
  assert.equal(A.setOf(armor.find((x) => x.id === 84481)).key, 'mtri-heavy');
  assert.equal(A.setOf(armor.find((x) => x.id === 82098)).key, 'glo-medium');
  // Lo que no reconozco va suelto, y lo que no es armadura nunca tiene set.
  assert.equal(A.setOf({ id: 1, type: 'armor', name: 'Set nuevo', subtype: 'heavy helm' }), null);
  assert.equal(A.setOf({ id: 2, type: 'weapon', name: 'Perfected Envoy Sword' }), null);
});

test('catálogo: 23 tarjetas de set y las 206 tarjetas de siempre, cada pieza dentro de su set', () => {
  const x = cargar();
  const g = x.r.catalogGrid(x.items, {});
  const ss = sets(g);
  assert.equal(ss.length, 23);
  assert.equal(ids(g).length, 206, 'las piezas siguen siendo tarjetas que abren la ficha');
  const dentro = new Set(ss.flatMap((m) => ids(m[2])));
  assert.equal(dentro.size, 132);
  for (const a of x.armor) assert.ok(dentro.has(a.id), a.name);
  for (const m of g.matchAll(/<summary>([\s\S]*?)<\/summary>/g)) assert.doesNotMatch(m[1], /lt-item-card|<button/, 'el resumen no es una tarjeta ni lleva botones');
  assert.equal((g.match(/<summary>/g) || []).length, 23);
  assert.doesNotMatch(g, / open>/, 'cerradas al entrar');
});

test('tarjeta de set: nombre, avance sobre las 6 piezas, completo y la cola', () => {
  const x = cargar({ queue: [80557] });
  const owned = { 80205: 1, 80254: 1, 80277: 1, 80384: 1 };
  const env = sets(x.r.catalogGrid(x.items, owned)).find((m) => m[1] === 'env-heavy');
  assert.match(env[0], /^<details class="arm-set" data-set="env-heavy" data-q="1">/);
  assert.match(env[0], /<b class="arm-sname">Enviado perfeccionado · Pesada<\/b>/);
  assert.match(env[0], /Armadura · Gen 1 · tenés 4 de 6 piezas · 1 en tu cola<\/p>/);
  assert.match(env[0], /<div class="arm-bar" aria-hidden="true"><i style="width:66\.7%"><\/i><\/div>/);
  assert.match(env[0], /<span class="arm-chev" aria-hidden="true">›<\/span><\/summary>/);
  assert.deepEqual(ids(env[2]).sort(), ENV_HEAVY.slice().sort());
  const all = {}; ENV_HEAVY.forEach((i) => { all[i] = 1; });
  const full = sets(cargar().r.catalogGrid(x.items, all)).find((m) => m[1] === 'env-heavy');
  assert.match(full[0], /data-set="env-heavy" data-full="1">/);
  assert.match(full[0], /✓ Completo · 6 de 6 piezas/);
  const eik = sets(x.r.catalogGrid(x.items, {})).find((m) => m[1] === 'eik');
  assert.match(eik[0], /Guantes · los 3 pesos · Gen 3 · tenés 0 de 3 piezas/);
  const sin = cargar({ token: null });
  const e2 = sets(sin.r.catalogGrid(sin.items, {})).find((m) => m[1] === 'env-heavy');
  assert.match(e2[0], /Armadura · Gen 1 · 6 piezas<\/p>/);
  assert.doesNotMatch(e2[0], /arm-bar|tenés/, 'sin Key no digo cuántas tenés');
  // Si la API falló, lo que quedó guardado puede estar viejo: no festejo un set completo.
  const err = cargar({ error: 'HTTP 500' });
  const e3 = sets(err.r.catalogGrid(err.items, all)).find((m) => m[1] === 'env-heavy');
  assert.doesNotMatch(e3[0], /data-full|Completo/);
});

test('con filtros adentro van solo las piezas que pasan; el avance sigue siendo sobre las 6', () => {
  const x = cargar();
  const owned = { 80205: 1, 80254: 1, 80277: 1, 80384: 1 };
  const faltan = x.items.filter((it) => !(owned[it.id] > 0));
  const env = sets(x.r.catalogGrid(faltan, owned)).find((m) => m[1] === 'env-heavy');
  assert.deepEqual(ids(env[2]).sort(), [80435, 80557]);
  assert.match(env[0], /tenés 4 de 6 piezas/);
  assert.equal(sets(x.r.catalogGrid(x.items.filter((it) => it.type === 'weapon'), {})).length, 0);
});

test('con una búsqueda, los sets que encuentran algo se abren solos', () => {
  const x = cargar();
  x.r.catalogGrid(x.items, {});
  const h = x.A.search('casco del enviado');
  const ss = sets(h);
  assert.equal(ss.length, 1);
  assert.match(ss[0][0], /^<details class="arm-set" data-set="env-heavy" open>/);
  assert.deepEqual(ids(h), [80384]);
  assert.doesNotMatch(x.A.search(''), / open>/);
});

test('estilos: abierta ocupa la fila, sin el triángulo del navegador, foco visible y 44 px en el celular', () => {
  const { A } = cargar();
  const css = A.CSS;
  assert.match(css, /\.arm-set\[open\]\{grid-column:1 \/ -1\}/);
  assert.match(css, /\.arm-set>summary::-webkit-details-marker\{display:none\}/);
  assert.match(css, /\.arm-set>summary:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(css, /@media \(max-width:900px\)\{\.arm-set>summary\{min-height:44px\}\}/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.arm-chev\{transition:none\}\}/);
  assert.match(css, /\.arm-set\[data-full\]\{border-left-color:var\(--color-green/);
  assert.doesNotMatch(css, /(?:^|[;{])color:#/);
});
