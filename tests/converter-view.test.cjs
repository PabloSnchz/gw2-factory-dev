// Cambio de divisas (BL-056, CAR-2A): js/converter-modal.js 2.0.0 es una vista montable.
// Corre con: node --test tests/*.test.cjs
// Prueba mi recomendación, el formato de monedas, los filtros del Trading Post y de
// Populares, y los arreglos de la 2.0.0 (Escape, ícono inexistente, función sin definir).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SRC = read('js/converter-modal.js');
const APP = read('js/app.js');

function load() {
  const doc = { readyState: 'loading', addEventListener() {}, getElementById: () => null };
  const win = {};
  new Function('window', 'document', SRC.replace(/typeof window !== 'undefined' \? window : this/, 'window'))(win, doc);
  return win.ConverterModal;
}
const CM = load();
const P = CM._pure;

test('versión 2.0.0, el header la declara y la API pública está completa', () => {
  assert.equal(CM.version, '2.0.0');
  assert.match(SRC, /Versión: 2\.0\.0/);
  for (const k of ['initOnce', 'mount', 'open', 'close']) assert.equal(typeof CM[k], 'function', k);
});

test('mi recomendación sigue la referencia de 120–130 g por 400 gemas', () => {
  assert.equal(P.adviceFor(0), null);
  assert.equal(P.adviceFor(NaN), null);
  const cases = [[110, 'recomienda', /por debajo/], [125, 'recomienda', /dentro/], [142, 'recomienda', /Si no te urge, esperá/],
    [150, 'recomienda', /bastante por encima/], [175, 'advierte', /No es momento/]];
  for (const [g, kind, re] of cases) {
    const a = P.adviceFor(g);
    assert.equal(a.kind, kind, String(g));
    assert.match(a.text, re, String(g));
    assert.match(a.text, new RegExp('cuestan ' + Math.round(g) + ' g'), 'dice el precio real');
    assert.match(a.text, /120–130 g/);
  }
  // los dos tipos existen en mi voz (shiruvana.js)
  assert.match(read('js/shiruvana.js'), /recomienda:/);
  assert.match(read('js/shiruvana.js'), /advierte:/);
});

test('conveniencia: el puntaje y el rótulo no cambiaron con la 2.0.0', () => {
  assert.equal(P.scoreFromPrice400(100).score, 1);
  assert.equal(P.scoreFromPrice400(125).score, 0.85);
  assert.equal(P.labelForScore(P.scoreFromPrice400(125).score), 'Muy conveniente');
  assert.equal(P.labelForScore(P.scoreFromPrice400(200).score), 'Muy bajo');
  assert.equal(P.classForScore(0.85), 'is-good');
  assert.equal(P.classForScore(0.5), 'is-mid');
  assert.equal(P.classForScore(0.05), 'is-bad');
});

test('monedas: oro y plata como en la Cartera, cobre solo debajo de 1 g', () => {
  const txt = (h) => h.replace(/<[^>]+>/g, '');
  assert.equal(P.coinHTML(0), '—');
  assert.equal(P.coinHTML(-5), '—');
  assert.equal(txt(P.coinHTML(1423700)), '142g37s');
  assert.equal(txt(P.coinHTML(1400700)), '140g07s');
  assert.equal(txt(P.coinHTML(12345678)), (1234).toLocaleString('es-AR') + 'g56s');
  assert.equal(txt(P.coinHTML(8405)), '84s5c');
  assert.equal(txt(P.coinHTML(31)), '31c');
  assert.match(P.coinHTML(1400000), /class="cx-g"/);
});

test('tiempo relativo de las órdenes', () => {
  const now = Date.parse('2026-10-22T12:00:00Z');
  const at = (min) => new Date(now - min * 60000).toISOString();
  assert.equal(P.relTime(at(0), now), 'recién');
  assert.equal(P.relTime(at(5), now), 'hace 5 min');
  assert.equal(P.relTime(at(120), now), 'hace 2 h');
  assert.equal(P.relTime(at(60 * 26), now), 'hace 1 día');
  assert.equal(P.relTime(at(60 * 24 * 3), now), 'hace 3 días');
  assert.equal(P.relTime('no es fecha', now), '');
});

test('órdenes del Trading Post: filtro, orden por fecha y cantidades', () => {
  const st = {
    buys: [{ id: 1, item_id: 10, price: 100, quantity: 2, created: '2026-10-20T00:00:00Z' }],
    sells: [{ id: 2, item_id: 11, price: 50, quantity: 4, created: '2026-10-21T00:00:00Z' }, { id: 3, item_id: 12, price: 7, quantity: 1, created: '2026-10-19T00:00:00Z' }],
    itemsById: { 10: { name: 'A' } }, filters: { type: 'all' }
  };
  assert.deepEqual(P.countOrders(st), { all: 3, buys: 1, sells: 2 });
  assert.deepEqual(P.getFilteredTransacciones(st).map((t) => t.id), [2, 1, 3]);
  assert.equal(P.getFilteredTransacciones(st)[1].total, 200);
  assert.equal(P.getFilteredTransacciones(st)[1].item.name, 'A');
  st.filters.type = 'buys';
  assert.deepEqual(P.getFilteredTransacciones(st).map((t) => t.type), ['buy']);
  st.filters.type = 'sells';
  assert.deepEqual(P.getFilteredTransacciones(st).map((t) => t.id), [2, 3]);
});

test('Populares: sin volumen no aparece, legendarias por vendedores, tope de 15', () => {
  const prices = [{ id: 1, buys: { quantity: 0 }, sells: { quantity: 0 } }, { id: 2, buys: { quantity: 10 }, sells: { quantity: 5 } },
    { id: 3, buys: { quantity: 1 }, sells: { quantity: 90 } }, { id: 4, buys: { quantity: 100 }, sells: { quantity: 1 } }];
  const itemsById = { 2: { rarity: 'Fine' }, 3: { rarity: 'Legendary' }, 4: { rarity: 'Legendary' } };
  const st = (f) => ({ prices, itemsById, filters: Object.assign({ rarity: '', minVolume: 0 }, f) });
  assert.deepEqual(P.getFilteredOfertas(st()).map((p) => p.id), [4, 3, 2]);
  assert.deepEqual(P.getFilteredOfertas(st({ rarity: 'Legendary' })).map((p) => p.id), [3, 4]);
  assert.deepEqual(P.getFilteredOfertas(st({ rarity: 'non_legendary' })).map((p) => p.id), [2]);
  assert.deepEqual(P.getFilteredOfertas(st({ minVolume: 50 })).map((p) => p.id), [4, 3]);
  const many = Array.from({ length: 30 }, (_, i) => ({ id: i, buys: { quantity: i + 1 }, sells: { quantity: 1 } }));
  assert.equal(P.getFilteredOfertas({ prices: many, itemsById: {}, filters: { rarity: '', minVolume: 0 } }).length, 15);
});

test('arreglos de la 2.0.0: sin Historial, íconos que existen, toda función llamada está definida', () => {
  // el código, sin los comentarios (el changelog del header nombra lo que se sacó)
  const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(CODE, /Próximamente|Historial|data-tab="historial"/);
  const icons = [...new Set([...SRC.matchAll(/ICON \+ '([^']+\.png)'/g)].map((m) => m[1]))];
  assert.ok(icons.length >= 3, 'leí los íconos');
  for (const f of icons) assert.ok(fs.existsSync(path.join(ROOT, 'assets/icons', f)), 'falta assets/icons/' + f);
  assert.doesNotMatch(CODE, /155048/);
  const called = new Set([...CODE.matchAll(/\b(render\w+|load\w+|ensure\w+|refresh\w+)\(/g)].map((m) => m[1]));
  for (const fn of called) assert.match(SRC, new RegExp('function ' + fn + '\\('), fn + ' se llama pero no está definida');
});

test('Escape: un solo oyente que nunca se borra', () => {
  const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(CODE, /removeEventListener\('keydown'/);
  assert.equal((CODE.match(/addEventListener\('keydown'/g) || []).length, 1);
});

test('contrato con la Cartera: el botón de app.js llama a open() y open() pide la pestaña', () => {
  assert.match(APP, /getElementById\('walletConverterBtn'\)/);
  assert.match(APP, /ConverterModal\.open\(\)/);
  const open = SRC.slice(SRC.indexOf('function openModal('), SRC.indexOf('// ESTILOS'));
  assert.match(open, /showTab\('cambio'\)/);
  assert.ok(open.indexOf("showTab('cambio')") < open.indexOf('ensureModal()'), 'primero la pestaña, después el modal');
  assert.match(SRC, /function mount\(host\)/);
});

test('la vista usa las variables del theme y respeta el foco y el movimiento reducido', () => {
  const css = SRC.slice(SRC.indexOf('var CSS = ['), SRC.indexOf("].join('\\n');"));
  assert.match(css, /var\(--bg-1\)/);
  assert.match(css, /var\(--acc-1\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /!important/);
});
