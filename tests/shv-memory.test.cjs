// BL-059 SHV-2: mi memoria de la Cartera (js/shv-memory.js). Corre con un localStorage y un fetch falsos.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'shv-memory.js'), 'utf8');
const J = (x) => JSON.parse(JSON.stringify(x));
const tick = () => new Promise((r) => setImmediate(r));

function fakeLS(init, opts) {
  const m = new Map(Object.entries(init || {}));
  let fails = (opts && opts.fails) || 0;
  const max = (opts && opts.max) || Infinity;
  return {
    get length() { return m.size; }, key: (i) => Array.from(m.keys())[i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => {
      if (fails > 0 || String(v).length > max) { fails--; const e = new Error('lleno'); e.name = 'QuotaExceededError'; throw e; }
      m.set(k, String(v));
    },
    removeItem: (k) => { m.delete(k); }, _m: m,
  };
}
function load(extra) {
  const window = Object.assign({ console: { info() {} } }, extra || {});
  vm.runInNewContext(SRC, { window, globalThis: {}, setTimeout, Promise, JSON, Math, Date, Map, Object, Array, String, Number, decodeURIComponent });
  return window;
}
const D = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h || 12, mi || 0).getTime();
const W = (gold, karma, extra) => [{ id: 1, value: gold }, { id: 2, value: karma }].concat(extra || []);

test('la huella es la misma de Actividades y no guarda ningún carácter de la Key', () => {
  const w = load();
  const M = w.ShvMemory;
  const ctx = { window: {}, globalThis: {}, Math, String };
  try { vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'act-model.js'), 'utf8'), ctx); } catch (_) { /* si no carga solo, comparo con el algoritmo */ }
  const A = ctx.window.ActModel || ctx.globalThis.ActModel;
  assert.match(fs.readFileSync(path.join(ROOT, 'js', 'act-model.js'), 'utf8'), /0x811c9dc5[\s\S]*0x01000193/, 'Actividades usa el mismo FNV-1a');
  const tk = 'ABCDEF12-3456-7890-ABCD-EF1234567890ABCDEF12-3456-7890-ABCD-EF1234567890';
  if (A && A._pure && A._pure.fingerprint) assert.equal(M.fingerprint(tk), A._pure.fingerprint(tk));
  assert.match(M.fingerprint(tk), /^[0-9a-f]{8}$/);
  const ls = fakeLS();
  M._setStorage(ls);
  M.record(tk, W(1234567, 10), D(2026, 10, 26));
  const raw = ls.getItem('gn:shv:wallet');
  assert.ok(raw && !raw.includes(tk.slice(0, 8)) && !raw.includes(tk.slice(-8)), 'nada de la Key');
});

test('una foto por día y por cuenta: la última del día pisa; las divisas que faltan valen 0; las fijadas se suman', () => {
  const w = load({ WalletTheme: { _state: { models: [{ id: 23, pinned: true }, { id: 7, pinned: false }], tmodels: [] } } });
  const M = w.ShvMemory, ls = fakeLS();
  M._setStorage(ls);
  M.record('K1', W(10000, 5), D(2026, 10, 25, 9));
  M.record('K1', W(20000, 6), D(2026, 10, 25, 22));
  M.record('K1', W(50000, 9, [{ id: 23, value: 3 }]), D(2026, 10, 26, 8, 30));
  M.record('K2', W(70000, 1), D(2026, 10, 26));
  const fp = M.fingerprint('K1');
  const h = J(M.history(fp));
  assert.equal(h.length, 2);
  assert.deepEqual(h[0].values, { 1: 20000, 2: 6, 4: 0, 3: 0, 63: 0, 23: 0 });
  assert.deepEqual(h[1].values, { 1: 50000, 2: 9, 4: 0, 3: 0, 63: 0, 23: 3 });
  assert.equal(new Date(h[1].at).getHours(), 8);
  assert.equal(new Date(h[1].at).getMinutes(), 30);
  assert.equal(M.stats().accounts, 2);
  assert.equal(M.stats().snapshots, 3);
});

test('resumen de 30 días: serie del oro con huecos, valor y diferencia por divisa', () => {
  const w = load();
  const M = w.ShvMemory, ls = fakeLS();
  M._setStorage(ls);
  M.record('K', W(18200000, 4000000), D(2026, 10, 1));
  M.record('K', W(21050000, 4300000), D(2026, 10, 26));
  const s = J(M.summary(M.fingerprint('K'), 30, D(2026, 10, 26, 20), { 2: 'Karma (API)' }));
  assert.equal(s.days, 2);
  assert.equal(s.inWindow, 2);
  assert.equal(s.gold.length, 30);
  assert.equal(s.gold[29], 2105);
  assert.equal(s.gold[28], null, 'el día sin foto queda vacío');
  assert.equal(s.gold.filter((x) => x !== null).length, 2);
  const oro = s.rows.find((r) => r.id === 1), k = s.rows.find((r) => r.id === 2);
  assert.deepEqual([oro.name, oro.value, oro.delta, oro.gold], ['Oro', 2105, 285, true]);
  assert.deepEqual([k.name, k.value, k.delta], ['Karma (API)', 4300000, 300000]);
  const one = J(M.summary(M.fingerprint('K'), 30, D(2026, 12, 20)));
  assert.equal(one.inWindow, 0);
  assert.deepEqual(one.rows, []);
});

test('recuerdo 90 días y, si no entra en el tope, se van primero los días más viejos (nunca hoy)', () => {
  const P = load().ShvMemory._pure;
  const s = P.blank(), now = D(2026, 10, 26);
  for (let i = 0; i < 120; i++) P.addSnapshot(s, 'aaaaaaaa', W(i, i), now - i * 864e5, []);
  P.prune(s, now);
  assert.equal(Object.keys(s.a.aaaaaaaa.d).length, 90);
  const big = P.blank();
  for (let a = 0; a < 27; a++) for (let i = 0; i < 90; i++) P.addSnapshot(big, 'acc' + a, W(123456789, 4100000, [{ id: 4, value: 400 }, { id: 3, value: 212 }, { id: 63, value: 3950 }]), now - i * 864e5, []);
  P.prune(big, now);
  assert.ok(JSON.stringify(big).length <= 64 * 1024, 'entra en 64 KB');
  const days = Object.keys(big.a.acc0.d).map(Number);
  assert.equal(Math.max(...days), P.dayOf(now), 'hoy sigue');
  assert.ok(days.length > 20 && days.length < 90, 'se fueron los más viejos: quedan ' + days.length);
  const tiny = P.blank();
  P.addSnapshot(tiny, 'x', W(1, 1), now, []);
  P.prune(tiny, now, 10);
  assert.equal(Object.keys(tiny.a.x.d).length, 1, 'hoy no se borra aunque no entre');
});

test('si el navegador no tiene lugar, achico mi memoria y pruebo de nuevo; nunca toco otras claves', () => {
  const w = load();
  const M = w.ShvMemory, ls = fakeLS({ 'gn:account:keys': '[1]', 'gn:theme': 'gato' }, { fails: 1 });
  M._setStorage(ls);
  assert.equal(M.record('K', W(1, 1), D(2026, 10, 26)), true);
  assert.ok(ls.getItem('gn:shv:wallet'));
  assert.equal(ls.getItem('gn:account:keys'), '[1]');
  assert.equal(ls.getItem('gn:theme'), 'gato');
  // Con 60 días guardados y lugar para la mitad: achico lo mío (los días más viejos) y la foto de hoy entra.
  const P = load().ShvMemory._pure, s = P.blank(), now = D(2026, 10, 26);
  for (let i = 1; i <= 60; i++) P.addSnapshot(s, 'aaaaaaaa', W(i, i), now - i * 864e5, []);
  const size = JSON.stringify(s).length, small = fakeLS({ 'gn:shv:wallet': JSON.stringify(s) }, { max: Math.floor(size * 0.6) });
  const M3 = load().ShvMemory;
  M3._setStorage(small);
  assert.equal(M3.record('K', W(1, 1), now), true);
  const kept = JSON.parse(small.getItem('gn:shv:wallet'));
  assert.ok(Object.keys(kept.a.aaaaaaaa.d).length < 60, 'se fueron días viejos');
  assert.ok(kept.a[M3.fingerprint('K')], 'y la de hoy entró');
  const M2 = load().ShvMemory, full = fakeLS({}, { fails: 9 });
  M2._setStorage(full);
  assert.equal(M2.record('K', W(1, 1), D(2026, 10, 26)), false, 'si no hay forma, lo digo');
});

test('miro las respuestas de /v2/account/wallet sin cambiarlas; el resto de los pedidos ni los toco', async () => {
  const calls = [];
  const resp = (body, ok) => ({ ok: ok !== false, json: () => Promise.resolve(body), clone() { return { json: () => Promise.resolve(J(body)) }; } });
  const window = { console: { info() {} } };
  window.fetch = function (url) {
    calls.push([this, url]);
    if (url.includes('TOKEN-C')) return Promise.resolve(resp(W(1, 1), false));
    return Promise.resolve(url.includes('/wallet') ? resp(W(990000, 7)) : resp({ x: 1 }));
  };
  const orig = window.fetch;
  vm.runInNewContext(SRC, { window, globalThis: {}, setTimeout, Promise, JSON, Math, Date, Map, Object, Array, String, Number, decodeURIComponent });
  const M = window.ShvMemory, ls = fakeLS();
  M._setStorage(ls);
  assert.notEqual(window.fetch, orig);
  assert.equal(M.hookFetch(), false, 'no se engancha dos veces');
  const suelto = window.fetch; // como lo llama app.js: fetch(url), sin objeto delante
  const r = await suelto('https://api.guildwars2.com/v2/account/wallet?access_token=TOKEN-A');
  assert.deepEqual(J(await r.json()), W(990000, 7), 'la respuesta llega igual');
  assert.equal(calls[0][0], window, 'el fetch del navegador se llama con window (si no: Illegal invocation)');
  await window.fetch('https://api.guildwars2.com/v2/account?access_token=TOKEN-A');
  await window.fetch('https://api.guildwars2.com/v2/account/wallet?access_token=TOKEN-B').then(() => {});
  await window.fetch('https://api.guildwars2.com/v2/account/wallet?access_token=TOKEN-C');
  for (let i = 0; i < 6; i++) await tick();
  assert.equal(J(M.history(M.fingerprint('TOKEN-A'))).length, 1);
  assert.equal(M.history(M.fingerprint('TOKEN-A'))[0].values[1], 990000);
  assert.equal(M.history(M.fingerprint('TOKEN-C')).length, 0, 'una respuesta con error no es una foto');
  assert.equal(M.stats().accounts, 2, 'una por Key; /v2/account no cuenta');
});

test('si hoy no tengo foto, la pido una vez por día y por cuenta a GW2Api; si ya la tengo, no pido nada', async () => {
  let asked = 0;
  const w = load({ GW2Api: { getAccountWallet: (tk, o) => { asked++; assert.equal(o.nocache, false); return Promise.resolve(W(5, 5)); } } });
  const M = w.ShvMemory;
  M._setStorage(fakeLS());
  assert.equal(await M.ensureToday('K'), true);
  assert.equal(await M.ensureToday('K'), false);
  assert.equal(asked, 1);
  M._setStorage(fakeLS());
  M.record('J', W(1, 1));
  assert.equal(await M.ensureToday('J'), false, 'ya hay foto de hoy');
  assert.equal(asked, 1);
  assert.equal(await M.ensureToday(''), false);
  let fails = 0;
  const f = load({ GW2Api: { getAccountWallet: () => { fails++; return Promise.reject(new Error('sin red')); } } }).ShvMemory;
  f._setStorage(fakeLS());
  assert.equal(await f.ensureToday('Z'), false);
  assert.equal(await f.ensureToday('Z'), false);
  assert.equal(fails, 1, 'si falló, no insisto en el mismo día');
});

test('archivo: versión, presupuesto, sin HTML ni emojis; la clave nueva está en la privacidad', () => {
  const M = load().ShvMemory;
  assert.equal(M.version, '1.1.0');
  assert.match(SRC, /Versión: 1\.1\.0/);
  assert.equal(M.KEY, 'gn:shv:wallet');
  assert.deepEqual(J(M.TRACK), [1, 2, 4, 3, 63]);
  assert.ok(Buffer.byteLength(SRC) < 40 * 1024);
  assert.ok(!/innerHTML/.test(SRC));
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  assert.match(fs.readFileSync(path.join(ROOT, 'privacy.html'), 'utf8'), /<code>gn:shv:wallet<\/code>/);
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).modules.map((m) => m.src);
  assert.ok(man.indexOf('js/shv-memory.js') >= 0 && man.indexOf('js/shv-memory.js') < man.indexOf('js/shv-wallet.js'), 'la memoria antes que la voz');
});

// ------------------------------------------------------------------ SHV-4a: «Lo que recuerdo de vos»
test('en pausa no saco fotos ni pido nada; lo que ya sé lo sigo usando; volver a recordar', async () => {
  let asked = 0;
  const events = [];
  const doc = { dispatchEvent: (e) => events.push(e.detail) };
  const w = load({ document: doc, CustomEvent: function (t, o) { this.type = t; this.detail = o.detail; },
    GW2Api: { getAccountWallet: () => { asked++; return Promise.resolve(W(9, 9)); } } });
  const M = w.ShvMemory;
  const ls = fakeLS();
  M._setStorage(ls);
  M.record('K', W(100, 1), D(2026, 10, 25));
  assert.equal(M.paused(), false);
  assert.equal(M.paused(true), true);
  assert.equal(ls.getItem('gn:shv:paused'), 'true');
  assert.deepEqual(J(events.pop()), { paused: true });
  assert.equal(M.paused(true), true);
  assert.equal(events.length, 1, 'pausar dos veces avisa una sola');
  assert.equal(M.record('K', W(200, 1), D(2026, 10, 26)), false, 'en pausa no guardo');
  assert.equal(await M.ensureToday('J'), false);
  assert.equal(asked, 0, 'en pausa no pido nada');
  assert.equal(M.history(M.fingerprint('K')).length, 1, 'lo que ya sabía sigue ahí');
  assert.equal(M.stats().paused, true);
  assert.equal(M.paused(false), false);
  assert.equal(ls.getItem('gn:shv:paused'), null, 'volver a recordar borra la marca, no deja «false»');
  assert.deepEqual(J(events.pop()), { paused: false });
  assert.equal(M.record('K', W(200, 1), D(2026, 10, 26)), true);
  assert.equal(M.history(M.fingerprint('K')).length, 2);
  assert.equal(M.paused('si'), false, 'solo true o false cambian algo');
  M._setStorage(fakeLS({ 'gn:shv:paused': 'false' }));
  assert.equal(M.paused(), false, 'solo «true» es pausa');
});

test('borrar: se van todas mis fotos y solo mi clave; la pausa queda como estaba', () => {
  const events = [];
  const doc = { dispatchEvent: (e) => events.push(e.detail) };
  const M = load({ document: doc, CustomEvent: function (t, o) { this.detail = o.detail; } }).ShvMemory;
  const ls = fakeLS({ 'gn:shv:seen': 'x', 'gn:shv:quiet': 'true', 'gn:keys': 'k' });
  M._setStorage(ls);
  M.record('A', W(1, 1), D(2026, 10, 25));
  M.record('A', W(2, 1), D(2026, 10, 26));
  M.record('B', W(3, 1), D(2026, 10, 26));
  M.paused(true);
  assert.deepEqual(J(M.forget()), { ok: true, snapshots: 3 });
  assert.equal(ls.getItem('gn:shv:wallet'), null);
  assert.deepEqual(J(events.pop()), { forgot: true });
  assert.equal(ls.getItem('gn:shv:paused'), 'true', 'la pausa es tuya: no la toco');
  for (const k of ['gn:shv:seen', 'gn:shv:quiet', 'gn:keys']) assert.ok(ls.getItem(k) !== null, k + ' sigue');
  assert.equal(M.stats().accounts, 0);
  assert.deepEqual(J(M.forget()), { ok: true, snapshots: 0 }, 'sin nada, borrar no falla');
  const broken = fakeLS();
  broken.removeItem = () => { throw new Error('bloqueado'); };
  M._setStorage(broken);
  assert.equal(M.forget().ok, false, 'si el navegador no deja, lo digo');
});

test('después de borrar, puedo volver a pedir la foto de hoy (no me quedo con «ya pregunté»)', async () => {
  let asked = 0;
  const M = load({ GW2Api: { getAccountWallet: () => { asked++; return Promise.resolve(W(5, 5)); } } }).ShvMemory;
  M._setStorage(fakeLS());
  await M.ensureToday('K');
  M.forget();
  assert.equal(await M.ensureToday('K'), true);
  assert.equal(asked, 2);
});

test('lo que te llevás: cada cuenta por su huella, nunca la Key, con fecha y valores', () => {
  const tk = 'ABCDEF12-3456-7890-ABCD-EF1234567890ABCDEF12-3456-7890-ABCD-EF1234567890';
  const M = load().ShvMemory;
  M._setStorage(fakeLS());
  M.record(tk, W(1234567, 10), D(2026, 10, 25, 9, 30));
  M.record(tk, W(2234567, 11), D(2026, 10, 26, 20, 5));
  M.record('OTRA', W(5, 1), D(2026, 10, 26));
  const x = J(M.exportData(D(2026, 10, 27, 10)));
  assert.equal(x.app, 'boveda-del-gato-negro');
  assert.equal(x.kind, 'shv-memory');
  assert.equal(x.v, 1);
  assert.equal(x.exportedAt, new Date(D(2026, 10, 27, 10)).toISOString());
  assert.deepEqual(Object.keys(x.accounts), [M.fingerprint(tk), M.fingerprint('OTRA')].sort());
  const a = x.accounts[M.fingerprint(tk)];
  assert.deepEqual(a.map((s) => s.date), ['2026-10-25', '2026-10-26']);
  assert.equal(a[1].at, D(2026, 10, 26, 20, 5));
  assert.equal(a[1].values[1], 2234567);
  assert.equal(a[1].values[2], 11);
  assert.equal(x.names[1], 'Oro');
  const raw = JSON.stringify(x);
  assert.ok(!raw.includes(tk.slice(0, 8)) && !raw.includes(tk.slice(-8)) && !raw.includes('OTRA'), 'nada de la Key');
  assert.deepEqual(J(load().ShvMemory.exportData(1).accounts), {}, 'sin fotos, la lista va vacía');
});

test('qué recuerdo: cuentas, fotos, desde y hasta, días y el tope', () => {
  const M = load().ShvMemory;
  M._setStorage(fakeLS());
  const empty = J(M.stats());
  assert.equal(empty.first, null);
  assert.equal(empty.days, 0);
  assert.equal(empty.cap, 64 * 1024);
  M.record('B', W(1, 1), D(2026, 10, 26));
  M.record('B', W(1, 1), D(2026, 10, 22));
  M.record('A', W(1, 1), D(2026, 10, 20)); // la cuenta con la foto más vieja va última
  const s = J(M.stats());
  assert.equal(s.accounts, 2);
  assert.equal(s.snapshots, 3);
  assert.equal(s.days, 7, 'del 20 al 26');
  assert.equal(s.first, new Date(2026, 9, 20).getTime(), 'el comienzo del primer día');
  assert.equal(s.last, new Date(2026, 9, 26).getTime());
  assert.equal(s.paused, false);
  assert.ok(s.chars > 0);
});
