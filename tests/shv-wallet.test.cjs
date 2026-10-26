// BL-059 SHV-1: mi voz en la Cartera (js/shv-wallet.js), nivel N2, con el formato común de js/shv-core.js.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/shv-wallet.js');

// Sin document: el módulo no se monta y solo expone su lógica pura.
function load() {
  const window = { console: { info() {} } };
  vm.runInNewContext(read('js/shv-core.js'), { window, globalThis: {} });
  vm.runInNewContext(SRC, { window, globalThis: {} });
  return window;
}
const ALL = ['account', 'wallet', 'inventories', 'characters', 'progression', 'unlocks', 'tradingpost'];
const m = (amount, pinned) => ({ id: 1, name: 'x', amount, pinned: !!pinned });
const AT = new Date(2026, 9, 26, 14, 5).getTime();

test('sin el permiso «billetera» lo digo primero, con su fundamento y el botón de Keys', () => {
  const w = load();
  const list = w.ShvWallet.observe({ models: [m(5)], lastAt: AT, perms: ['account'], label: 'Main' });
  const top = w.ShvCore.pick(list);
  assert.equal(top.id, 'perm');
  assert.equal(top.kind, 'advierte');
  assert.equal(top.priority, 'alta');
  assert.match(top.text[0], /La Key activa, Main, no tiene el permiso «billetera»/);
  assert.equal(top.action.act, 'keys');
  assert.equal(top.basis.source, 'los permisos guardados de la Key activa');
});

test('sin divisas fijadas te sugiero fijarlas; con fijadas, el resumen', () => {
  const w = load();
  const pin = w.ShvCore.pick(w.ShvWallet.observe({ models: [m(5), m(0), m(2)], lastAt: AT, perms: ALL }));
  assert.equal(pin.id, 'pin');
  assert.equal(pin.kind, 'recomienda');
  assert.match(pin.text[0], /^Tenés 2 divisas con saldo en esta cuenta\. Fijá con ★/);
  assert.equal(w.ShvCore.basisText(pin.basis, AT), 'tu Cartera, leída de la API oficial · hoy 14:05');
  const sum = w.ShvCore.pick(w.ShvWallet.observe({ models: [m(5, true), m(0)], lastAt: AT, perms: ALL }));
  assert.equal(sum.id, 'summary');
  assert.equal(sum.text[0], 'Tenés 1 divisa con saldo en esta cuenta y 1 fijada en Destacadas.');
});

test('si no sé, no hablo: sin divisas leídas y sin datos de permisos no hay mensaje', () => {
  const w = load();
  assert.deepEqual(JSON.parse(JSON.stringify(w.ShvWallet.observe({ models: [], perms: null }))), []);
  assert.equal(w.ShvCore.pick(w.ShvWallet.observe({})), null);
  // Una Key vieja sin permisos anotados no es una Key sin permisos.
  assert.equal(w.ShvWallet.observe({ models: [], perms: null, label: 'Vieja' }).length, 0);
});

test('toda observación de la Cartera cumple el formato común (con fundamento)', () => {
  const w = load();
  const list = w.ShvWallet.observe({ models: [m(1)], lastAt: AT, perms: ['account'], label: '' });
  assert.equal(list.length, 2);
  list.forEach((o) => assert.ok(w.ShvCore.observation(o), o.id + ' cumple el formato'));
  assert.match(list[0].text[0], /^La Key activa no tiene/, 'sin nombre no deja comas sueltas');
});

test('no guarda nada, no pide nada a la API y no arma HTML a mano', () => {
  assert.ok(!/localStorage|Storage\.set\(|fetch\(|GW2Api/.test(SRC));
  assert.ok(!/innerHTML/.test(SRC));
  assert.match(SRC, /Versión: 1\.0\.0/);
});
