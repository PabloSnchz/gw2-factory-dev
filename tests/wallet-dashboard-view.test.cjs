// Todas las cuentas (BL-056, CAR-3): js/wallet-dashboard.js 3.0.0.
// Corre con: node --test tests/*.test.cjs
// Prueba las reglas nuevas (mejor valor, total parcial, buscador de divisas, monedas) y los
// arreglos de la 3.0.0. La lectura de cuentas, la ETA y los errores por columna no cambiaron:
// los cuidan idea47-commit2, idea48b e idea57t2.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'wallet-dashboard.js'), 'utf8');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function load() {
  const win = {};
  const con = { log() {}, warn() {}, error() {}, info() {} };
  new Function('window', 'document', 'console', SRC.replace(/typeof window !== 'undefined' \? window : \(typeof globalThis !== 'undefined' \? globalThis : this\)/, 'window'))(win, {}, con);
  return win.WalletDashboard;
}
const WD = load();
const P = WD._pure;
const acc = (label, wallet, error) => ({ label, wallet: wallet || {}, error: error || null });

test('versión 3.0.0 en el código y en el header; la API pública de la 2.x sigue', () => {
  assert.equal(WD.version, '3.0.0');
  assert.match(SRC, /Versión: 3\.0\.0/);
  for (const k of ['initOnce', 'activate', 'deactivate', 'show', 'refresh', '_debug']) assert.equal(typeof WD[k], 'function', k);
});

test('mejor valor por columna: solo cuentas leídas, y un 0 no es «el mejor»', () => {
  const list = [acc('A', { 1: 500, 2: 10 }), acc('B', { 1: 900, 2: 0 }), acc('C', {}, 'HTTP 503'), acc('D', { 1: 900 })];
  assert.deepEqual(P.bestByCurrency(list, [1, 2, 3]), { 1: 900, 2: 10 });
  assert.deepEqual(P.bestByCurrency([acc('X', { 1: 0 })], [1]), {});
  assert.deepEqual(P.bestByCurrency([acc('E', { 1: 99999 }, 'falló')], [1]), {}, 'una cuenta con error no gana');
});

test('total: «Total» o «Total (n de m)» cuando alguna cuenta no se pudo leer', () => {
  assert.equal(P.totalLabel([acc('A'), acc('B')]), 'Total');
  assert.equal(P.totalLabel([acc('A'), acc('B', {}, 'x'), acc('C')]), 'Total (2 de 3)');
  assert.equal(P.totalLabel([]), 'Total');
});

test('buscador de divisas: sin las elegidas, sin tildes ni mayúsculas, en orden alfabético', () => {
  const cur = [{ id: 1, name: 'Moneda' }, { id: 2, name: 'Karma' }, { id: 30, name: 'Insignia de honor' }, { id: 7, name: 'Reliquia fráctica' }, { id: 9, name: 'Ámbar' }];
  assert.deepEqual(P.pickerOptions(cur, [1], '').map((c) => c.id), [9, 30, 2, 7]);
  assert.deepEqual(P.pickerOptions(cur, [], 'FRACT').map((c) => c.id), [7]);
  assert.deepEqual(P.pickerOptions(cur, [], 'ambar').map((c) => c.id), [9]);
  assert.deepEqual(P.pickerOptions(cur, [2], 'karma'), []);
});

test('monedas: oro y plata como en la Cartera; cobre solo debajo de 1 g; sin colores fijos', () => {
  const t = (h) => h.replace(/<[^>]+>/g, '');
  assert.equal(t(P.formatCoinValue(41020000)), (4102).toLocaleString('es-AR') + 'g00s');
  assert.equal(t(P.formatCoinValue(1400700)), '140g07s');
  assert.equal(t(P.formatCoinValue(8405)), '84s5c');
  assert.equal(t(P.formatCoinValue(31)), '31c');
  assert.equal(P.formatCoinValue(NaN), '—');
  assert.doesNotMatch(P.formatCoinValue(12345678), /style=|#[0-9a-f]{3,6}/i);
  assert.equal(P.initialsOf('Gato Negro.1234'), 'GN');
  assert.equal(P.initialsOf('Farm_Diario.3456'), 'FD');
});

test('arreglos de la 3.0.0: estado sin divisas bien armado, sin borderLeft roto, sin oyentes acumulados', () => {
  const table = CODE.slice(CODE.indexOf('function renderTable('), CODE.indexOf('function updateTimestamp('));
  assert.doesNotMatch(table, /'<td><th>|'<td><td colspan|\.2<\/td>/, 'el HTML viejo del estado vacío volvió');
  assert.match(table, /thead\.innerHTML = '<tr><th class="wd3-acc">Cuenta<\/th><\/tr>'/);
  assert.match(table, /<tr><td class="wd3-empty">/);
  assert.doesNotMatch(CODE, /borderLeft:/, 'borderLeft escrito como CSS dentro de un string');
  const sel = CODE.slice(CODE.indexOf('function renderCurrencySelector('), CODE.indexOf('function renderKPIs('));
  assert.match(sel, /if \(!container\.__wd3\) \{/, 'los oyentes del selector se ponen una sola vez');
  assert.equal((sel.match(/document\.addEventListener\('click'/g) || []).length, 1);
});

test('una cuenta que no se pudo leer no aporta ceros: «— ⚠» con el motivo, y el total lo dice', () => {
  const table = CODE.slice(CODE.indexOf('function renderTable('), CODE.indexOf('function updateTimestamp('));
  assert.match(table, /if \(acc\.error\) \{ cells\.push\(unreadableCell\(walletReason\(acc\)\)\); return; \}/);
  assert.match(table, /'Parcial: ' \+ walletUnreadable \+ ' de ' \+ rowsAcc\.length \+ ' cuentas no se pudieron leer\.'/);
  assert.match(table, /totalLabel\(rowsAcc\)/);
  assert.match(table, /fieldErr \? unreadableCell\(fieldErr\) : renderLuckCell\(s\)/, 'la columna de suerte sigue eligiéndose por columna');
});

test('la vista: columna de cuenta, cabecera y totales fijos; tarjetas en el celular; foco visible', () => {
  const css = SRC.slice(SRC.indexOf('var CSS3 = ['), SRC.indexOf("].join('\\n');", SRC.indexOf('var CSS3 = [')));
  assert.match(css, /#wdTable \.wd3-acc\{position:sticky;left:0/);
  assert.match(css, /#wdTable thead th\{position:sticky;top:0/);
  assert.match(css, /#wdTable tr\.wd3-tot>\*\{position:sticky;bottom:0/);
  assert.match(css, /@media \(max-width:720px\)\{.*\.wd-tablewrap\{display:none\}\.wd3-cards\{display:grid/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /!important/);
  assert.match(CODE, /<div id="wdCards" class="wd3-cards"/);
  assert.match(CODE, /th\.addEventListener\('keydown'/, 'las columnas se ordenan también con el teclado');
});

test('contrato con la Cartera (wallet-theme.js): los ids y la cabecera que oculta siguen ahí', () => {
  for (const id of ['wdLoadErrors', 'wdKPIs', 'wdCurrencySelector', 'wdRefreshBtn', 'wdBackBtn', 'wdStatusMsg', 'wdTimestamp', 'wdTable']) {
    assert.match(CODE, new RegExp('id="' + id + '"'), id);
  }
  assert.match(CODE, /className = 'wd-content'/);
  assert.match(CODE, /<div class="panel__head">/);
  assert.match(CODE, /class="wd-tablewrap"/);
});
