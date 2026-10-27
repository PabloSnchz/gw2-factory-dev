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
  assert.match(SRC, /Versión: 1\.2\.0/);
});

// SHV-2b: una foto por día; day = días desde 1970 como en js/shv-memory.js
const H = (rows) => rows.map(([day, gold, extra]) => ({ day, at: AT2 - (100 - day) * 864e5, values: Object.assign({ 1: gold * 10000 }, extra || {}) }));
test('SHV-2b: el oro de los últimos 7 días y la semana anterior, con fundamento y «Ver la evolución»', () => {
  const w = load();
  const hist = H([[86, 1800], [90, 1900], [93, 1963], [100, 2105]]);
  const t = JSON.parse(JSON.stringify(w.ShvWallet.trends(hist, {})));
  assert.deepEqual(t.week, { days: 7, from: 1963, to: 2105, prevDelta: 163 });
  const top = w.ShvCore.pick(w.ShvWallet.observe({ models: [{ id: 1, amount: 5, pinned: false }], perms: ['wallet'], history: hist }));
  assert.equal(top.id, 'trend', 'lo que noto le gana a la sugerencia de fijar');
  assert.deepEqual([...top.text], ['En los últimos 7 días tu oro subió 142 en esta cuenta: de 1.963 a 2.105.', 'La semana anterior había subido 163.']);
  assert.equal(w.ShvCore.basisText(top.basis, AT2), 'tus fotos diarias de la Cartera (4 días guardados en este navegador) · hoy 14:10');
  assert.deepEqual(JSON.parse(JSON.stringify(top.action)), { label: 'Ver la evolución', act: 'mem', href: null });
  const down = w.ShvWallet.observe({ history: H([[99, 300], [100, 250]]) })[0];
  assert.equal(down.text[0], 'En el último día tu oro bajó 50 en esta cuenta: de 300 a 250.');
  assert.equal(down.text.length, 1, 'sin fotos de la semana anterior no la invento');
  assert.equal(w.ShvWallet.observe({ history: H([[99, 300], [100, 300.4]]) })[0].text[0], 'En el último día tu oro no cambió en esta cuenta: 300 de oro.');
  assert.equal(w.ShvWallet.observe({ history: H([[80, 300], [100, 400]]) }).length, 0, 'sin foto en los últimos 7 días no hay semana');
  assert.equal(w.ShvCore.pick(w.ShvWallet.observe({ models: [{ id: 1, amount: 5 }], perms: ['account'], history: hist })).id, 'perm', 'sin permiso, eso primero');
});

test('SHV-2b: la divisa con saldo que más días lleva igual (14 o más); el primer día lo digo', () => {
  const w = load();
  const hist = H([[70, 10, { 3: 212, 63: 50 }], [80, 10, { 3: 212, 63: 60 }], [86, 10, { 3: 212, 63: 60 }], [100, 10, { 3: 212, 63: 60 }]]);
  const t = JSON.parse(JSON.stringify(w.ShvWallet.trends(hist, { 3: 'Monedas de Laurel (API)' })));
  assert.deepEqual(t.stale, { id: 3, name: 'Monedas de Laurel (API)', days: 30, value: 212, sinceStart: true });
  const obs = w.ShvWallet.observe({ models: [{ id: 3, amount: 212, pinned: true }], perms: ['wallet'], history: hist.slice(1) });
  const st = obs.find((o) => o.id === 'stale');
  assert.equal(st.text[0], '«Monedas de Laurel» está igual hace al menos 20 días en esta cuenta (212).');
  assert.equal(w.ShvCore.pick(obs.filter((o) => o.id !== 'trend')).id, 'stale', 'le gana al resumen');
  const moved = H([[70, 10, { 63: 50 }], [90, 10, { 63: 60 }], [100, 10, { 63: 60 }]]);
  assert.equal(w.ShvWallet.trends(moved, {}).stale, null, '10 días no alcanzan');
  assert.equal(w.ShvWallet.trends(H([[70, 10, { 4: 0 }], [100, 10, { 4: 0 }]]), {}).stale, null, 'una divisa en 0 que sigue en 0 no es noticia');
  const two = w.ShvWallet.observe({ models: [{ id: 2, amount: 5, pinned: true }], perms: ['wallet'], history: H([[99, 10], [100, 10]]) });
  assert.equal(two.find((o) => o.id === 'summary').text.length, 1, 'desde el segundo día ya no digo que empiezo');
  const first = w.ShvWallet.observe({ models: [{ id: 2, amount: 5, pinned: true }], perms: ['wallet'], history: H([[100, 10]]) });
  assert.deepEqual([...first[0].text], ['Tenés 1 divisa con saldo en esta cuenta y 1 fijada en Destacadas.', 'Desde hoy recuerdo tu Cartera: en unos días te digo cómo evoluciona.']);
  assert.equal(w.ShvWallet.observe({ models: [{ id: 2, amount: 5, pinned: true }], perms: ['wallet'] })[0].text.length, 1, 'sin memoria no lo digo');
});

test('SHV-2b: la evolución se abre desde mi voz, con aria-expanded y el foco en el mismo botón', () => {
  assert.match(SRC, /data-shv-act="mem"/);
  assert.match(SRC, /setAttribute\('aria-expanded', String\(st\.memOpen\)\)/);
  assert.match(SRC, /setAttribute\('aria-controls', MEM_ID\)/);
  assert.match(SRC, /=== 'mem'\) \{ st\.memOpen = !st\.memOpen; st\.focusMem = true; paint\(\); \}/);
  assert.match(SRC, /if \(!st\.memOpen \|\| !st\.hasMem \|\| \(m && m\.empty\)\) m = null;/);
  assert.ok(SRC.indexOf('paintVoice();\n    paintMemory();') > 0, 'primero mi voz, después la evolución debajo');
});

const AT2 = new Date(2026, 9, 26, 14, 10).getTime();
test('SHV-2: el panel de evolución dice de dónde lo sé, dibuja un punto por día con foto y no inventa', () => {
  const w = load();
  const sum = { days: 21, inWindow: 3, lastAt: AT2, gold: [1820, null, 1900, 2105], rows: [
    { id: 1, name: 'Oro', value: 2105, delta: 285, gold: true }, { id: 2, name: 'Karma', value: 4100000, delta: 300000 },
    { id: 4, name: 'Gemas', value: 400, delta: 0 }, { id: 63, name: 'Aclamación astral', value: 3950, delta: -1200 },
    { id: 3, name: 'Monedas de Laurel', value: 212, delta: null }] };
  const m = JSON.parse(JSON.stringify(w.ShvWallet.memoryModel(sum, AT2)));
  assert.equal(m.empty, false);
  assert.equal(m.basis, 'tus fotos diarias de la Cartera (21 días guardados en este navegador) · hoy 14:10');
  assert.equal(m.points, '0,62 200,47 300,8');
  assert.equal(m.label, 'Oro, últimos 4 días: de 1.820 a 2.105');
  assert.deepEqual(m.rows.map((r) => [r.name, r.value, r.delta, r.sr]), [
    ['Oro', '2.105 de oro', '▲ 285', 'subió 285'], ['Karma', '4,1 M', '▲ 300.000', 'subió 300.000'], ['Gemas', '400', '=', 'sin cambios'],
    ['Aclamación astral', '3.950', '▼ 1.200', 'bajó 1.200'], ['Monedas de Laurel', '212', '', '']]);
  const zero = w.ShvWallet.memoryModel(Object.assign({}, sum, { rows: sum.rows.concat([{ id: 7, name: 'Fractales', value: 0, delta: 0 }]) }), AT2);
  assert.equal(zero.rows.length, 5, 'una divisa que está y sigue en 0 no ocupa lugar');
  const one = w.ShvWallet.memoryModel({ days: 1, inWindow: 1, lastAt: AT2, gold: [], rows: [] }, AT2);
  assert.equal(one.empty, true);
  assert.match(one.text, /^Empecé a recordar tu Cartera/);
  assert.match(one.basis, /\(1 día guardado en este navegador\)/);
  assert.equal(w.ShvWallet.memoryModel({ days: 0 }, AT2), null, 'sin memoria no muestro nada');
  assert.equal(w.ShvWallet.memoryModel(null, AT2), null);
});

test('SHV-2: el panel usa solo colores del theme, no guarda nada y va debajo de mi voz', () => {
  assert.equal(load().ShvWallet.MEM_ID, 'shvWalletMemory');
  const css = (SRC.match(/var MEM_CSS = \[[\s\S]*?\]\.join/) || [''])[0];
  assert.ok(css, 'hay CSS del panel');
  assert.doesNotMatch(css.replace(/'#' \+ MEM_ID/g, ''), /#[0-9a-fA-F]{3,8}\b/, 'sin colores fijos: los 19 themes mandan');
  assert.match(css, /var\(--tx-1\)/);
  assert.match(SRC, /voice\.nextSibling/);
  assert.match(SRC, /addEventListener\('gn:shv-memory', schedule\)/);
});
