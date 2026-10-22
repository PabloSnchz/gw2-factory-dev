// Cartera renovada (BL-056): js/wallet-theme.js 2.0.0 es una capa de vista sobre lo que dibuja app.js.
// Corre con: node --test tests/*.test.cjs
// Prueba las reglas puras (categorías, oro, grupos, Destacadas) y el contrato con app.js e
// index.html: si cambia una clase o un id del que depende la capa, este test lo dice.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const SRC = read('js/wallet-theme.js');
const APP = read('js/app.js');
const HTML = read('index.html');

function load() {
  const win = { document: { readyState: 'loading', addEventListener() {} }, localStorage: { getItem: () => null } };
  new Function('window', SRC)(win);
  return win.WalletTheme;
}
const WT = load();
const P = WT._pure;
const M = (id, amount, cats, extra) => Object.assign({ id, name: 'D' + id, amount, cats, pinned: false, isMain: false }, extra || {});

test('versión y nombres públicos de la 1.x siguen existiendo', () => {
  assert.equal(WT.version, '2.0.0');
  for (const k of ['process', 'themeWalletNow', 'applyCurrencyTheme', 'migrateCategoriesToBadges', 'migrateWalletToCardClass']) {
    assert.equal(typeof WT[k], 'function', k);
  }
});

test('categorías en español: todas las que arma app.js tienen nombre para el jugador', () => {
  const block = APP.slice(APP.indexOf('function categorize('), APP.indexOf('function isMainCurrency('));
  const keys = new Set([...block.matchAll(/cats\.add\('([^']+)'\)/g)].map((m) => m[1]));
  for (const m of block.matchAll(/\[\s*'([^']+)'(?:\s*,\s*'([^']+)')?\s*\]/g)) { keys.add(m[1]); if (m[2]) keys.add(m[2]); }
  assert.ok(keys.size >= 5, 'leí las categorías de app.js');
  for (const k of keys) assert.doesNotMatch(P.catLabel(k), /^[a-z]/, k + ' -> ' + P.catLabel(k));
  assert.equal(P.catLabel('blacklion'), 'León Negro');
  assert.equal(P.catLabel('histórica'), 'Históricas');
});

test('oro: cantidades de app.js a cobre y desglose g/s/c', () => {
  assert.equal(P.parseAmount('1.284.371'), 1284371);
  assert.equal(P.parseAmount(''), 0);
  assert.equal(P.parseCoinText('1.284 g 37 s 12 c'), 12843712);
  assert.equal(P.parseCoinText('5 s 0 c'), 500);
  assert.deepEqual(P.coinParts(12843712), { g: 1284, s: 37, c: 12 });
  assert.match(P.coinHTML(12843712), /1\.284<\/span><small>g<\/small> <span class="wn-s">37<\/span><small>s<\/small> <span class="wn-c">12/);
  assert.doesNotMatch(P.coinHTML(12), /<small>g/, 'sin oro no muestra «0 g»');
});

test('grupos: orden de la Cartera, una divisa en su primera categoría, chip y Destacadas en la tabla', () => {
  const rows = [M(1, 5, ['mapa']), M(2, 3, ['blacklion', 'general']), M(3, 0, ['general']), M(4, 9, ['rara']), M(5, 1, ['general'], { pinned: true })];
  const vis = P.filterRows(rows, { hideZero: true, cat: '' });
  assert.deepEqual(vis.map((m) => m.id), [1, 2, 4, 5], 'ocultar en 0');
  assert.deepEqual(P.groupRows(vis, '', false).map((g) => [g.label, g.rows.map((m) => m.id)]),
    [['Generales', [2, 5]], ['De mapa', [1]], ['Rara', [4]]]);
  assert.deepEqual(P.groupRows(P.filterRows(rows, { hideZero: false, cat: 'general' }), 'general', false).map((g) => g.label), ['Generales']);
  assert.deepEqual(P.groupRows(vis, '', true).map((g) => g.label), ['★ Destacadas', 'Generales', 'De mapa', 'Rara']);
  assert.deepEqual(P.catCounts(rows, true), { _all: 4, mapa: 1, blacklion: 1, general: 2, rara: 1 });
});

test('Destacadas: las fijadas; si no hay, las principales (hasta 6)', () => {
  const rows = [M(1, 1, [], { isMain: true }), M(2, 1, [], { pinned: true }), M(3, 1, [], { isMain: true })];
  assert.deepEqual(P.pickStars(rows), { pinned: true, list: [rows[1]] });
  rows[1].pinned = false;
  assert.deepEqual(P.pickStars(rows).list.map((m) => m.id), [1, 3]);
  const many = Array.from({ length: 9 }, (_, i) => M(i, 1, [], { isMain: true }));
  assert.equal(P.pickStars(many).list.length, 6);
  assert.equal(P.initials('Fragmento de espíritu'), 'FE');
});

test('contrato con app.js: la tarjeta y la fila tienen lo que la capa lee', () => {
  const card = APP.slice(APP.indexOf('function walletCardHTML('), APP.indexOf('function renderCards('));
  for (const s of ['wallet-card"', 'data-id=', 'data-cur=', 'wallet-card__iconWrap', 'wallet-card__name', 'wallet-amount', 'wallet-sub', 'wallet-card__body', 'wallet-pill"', 'data-wallet-pin=', 'aria-pressed=']) {
    assert.ok(card.includes(s), 'walletCardHTML ya no tiene ' + s);
  }
  // La descripción es el primer div del cuerpo, antes del oro y las categorías.
  assert.match(card, /wallet-card__body">\s*\$\{r\.desc \? `<div>/);
  const row = APP.slice(APP.indexOf('function rowHTML('), APP.indexOf('function renderTable('));
  const ret = row.slice(row.indexOf("return '<tr"));
  const order = ["+ icon +", 'esc(r.name)', '+ amount +', '+ catBadges +', '+ pinBtn +'].map((s) => ret.indexOf(s));
  assert.ok(order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])), 'columnas de la fila: ícono, nombre, cantidad, categorías, fijar');
  assert.match(row, /badge badge--info/);
  assert.match(APP, /const LS_CURR = 'gw2_currencies_cache_v1';/);
});

test('contrato con index.html: los ids que la capa muda o lee siguen ahí', () => {
  for (const id of ['walletPanel', 'walletTitle', 'ownerLabel', 'searchBox', 'sortSelect', 'toggleViewBtn', 'status', 'favBlock', 'favCards', 'walletCards', 'walletTableWrap', 'walletTable', 'walletDashboardPanel']) {
    assert.match(HTML, new RegExp('id="' + id + '"'), id);
  }
  assert.match(HTML, /<script src="js\/wallet-theme\.js[^"]*"><\/script>/, 'la capa se carga');
});

test('la capa no pide datos ni escribe datos del jugador; solo su preferencia', () => {
  assert.doesNotMatch(SRC, /fetch\(|GW2Api|XMLHttpRequest/);
  assert.deepEqual([...SRC.matchAll(/localStorage\.setItem\(([^,]+),/g)].map((m) => m[1]), ['LS_HIDEZERO']);
  // Los controles de app.js se mudan (mismos nodos, mismos listeners), no se clonan.
  assert.doesNotMatch(SRC, /cloneNode/);
  assert.match(SRC, /\$\('\.wn-search', tools\)\.appendChild\(search\)/);
  assert.match(SRC, /if \(want !== isTable\(\) && tg\) tg\.click\(\);/);
  // La cabecera de la tabla se arregla con su fila.
  assert.match(SRC, /thead\.innerHTML = '<tr class="wn-thr">/);
  // Nunca se reprocesa un dibujo propio.
  assert.match(SRC, /finally \{ if \(S\.mo\) S\.mo\.takeRecords\(\); S\.busy = false; \}/);
});
