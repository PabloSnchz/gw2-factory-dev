// Modelo de Actividades (BL-070, ACT-1): relojes, fabricación diaria, fractales del día, llave semanal,
// piedras vetustas y marcas a mano, con los datos verificados de assets/data/activities/catalog.json
// (RUN-054 y RUN-055, 2026-10-25). Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/act-model.js');
const CAT = JSON.parse(read('assets/data/activities/catalog.json'));
const win = { console: { info() {} } };
win.window = win;
vm.runInContext(SRC, vm.createContext(win), { filename: 'js/act-model.js' });
const RAW = win.ActModel._pure;
const plain = (x) => (x === undefined ? x : JSON.parse(JSON.stringify(x)));
const M = {};
Object.keys(RAW).forEach((k) => { M[k] = (...a) => plain(RAW[k](...a)); });
const U = (s) => Date.parse(s);

test('el archivo entra en el presupuesto, declara su versión y no pide, no guarda ni toca el DOM', () => {
  assert.ok(Buffer.byteLength(SRC) < 40 * 1024);
  assert.equal(win.ActModel.version, SRC.match(/Versión: (\d+\.\d+\.\d+)/)[1]);
  assert.doesNotMatch(SRC, /\bfetch\(|localStorage|sessionStorage|document\./);
  assert.doesNotMatch(read('index.html'), /act-model\.js/, 'se carga por el manifiesto, no por index.html');
});

test('catálogo: 5 fabricaciones diarias (con el cuarzo), resets, rangos de fractales y fuentes', () => {
  const dc = CAT.dailyCrafting.items;
  assert.deepEqual(dc.map((x) => x.key).sort(), ['charged_quartz_crystal', 'glob_of_elder_spirit_residue', 'lump_of_mithrilium', 'spool_of_silk_weaving_thread', 'spool_of_thick_elonian_cord']);
  assert.equal(dc.find((x) => x.key === 'charged_quartz_crystal').item, 43772);
  assert.deepEqual(CAT.resets.weekly, { day: 'monday', utc: '07:30' });
  assert.equal(CAT.fractals.category, 88);
  assert.deepEqual(CAT.fractals.tierMinScale, { 1: 1, 2: 26, 3: 51, 4: 76 });
  assert.equal(CAT.weeklyKey.anyProfession, true, 'la llave sale con cualquier profesión, no solo ladrón');
  assert.equal(CAT.weeklyKey.apiReportsCompletion, false);
  [CAT.resets, CAT.dailyCrafting, CAT.fractals, CAT.weeklyKey, CAT.leivas].forEach((s) => assert.ok(s.source && s.source.length > 20));
});

test('catálogo: Leivas vende 5 piedras por semana, una por moneda, con los costos de la wiki', () => {
  const L = CAT.leivas;
  assert.equal(L.item, 96978);
  assert.equal(L.perWeek, 5);
  assert.deepEqual(L.offers.map((o) => [o.currency, o.cost]), [[1, 10000], [2, 7000], [68, 100], [66, 10], [28, 10]]);
  assert.equal(new Set(L.offers.map((o) => o.currency)).size, 5, 'una por moneda');
  assert.equal(L.map.waypoint, '[&BGMNAAA=]');
  assert.ok(CAT.removed.some((r) => /Solitary Throne/.test(r.what)), 'el seguimiento de CM sin fuente queda retirado y explicado');
});

test('relojes: diario 00:00, PSNA 08:00 y semanal lunes 07:30 UTC, con los bordes', () => {
  const now = U('2026-10-25T05:35:00Z'); // domingo
  assert.equal(M.nextDaily(now), U('2026-10-26T00:00:00Z'));
  assert.equal(M.nextPsna(now), U('2026-10-25T08:00:00Z'));
  assert.equal(M.nextPsna(U('2026-10-25T08:00:00Z')), U('2026-10-26T08:00:00Z'));
  assert.equal(M.lastWeekly(now), U('2026-10-19T07:30:00Z'));
  assert.equal(M.nextWeekly(now), U('2026-10-26T07:30:00Z'));
  assert.equal(M.lastWeekly(U('2026-10-26T07:29:59Z')), U('2026-10-19T07:30:00Z'), 'el lunes antes de las 07:30 sigue la semana anterior');
  assert.equal(M.lastWeekly(U('2026-10-26T07:30:00Z')), U('2026-10-26T07:30:00Z'));
  assert.equal(M.weekKey(now), '2026-10-19');
  assert.equal(M.dayKey(now), '2026-10-25');
  assert.equal(M.left(2 * 3600000 + 42 * 60000), '2 h 42 min');
  assert.equal(M.left(42 * 60000 + 5000), '42 min');
  assert.equal(M.left(10000), 'menos de 1 min');
});

test('fabricación diaria: hecho y te falta con la cuenta; sin lectura es «sin datos», nunca «te falta»', () => {
  const r = M.dailyCrafting(CAT.dailyCrafting.items, ['lump_of_mithrilium', 'charged_quartz_crystal']);
  assert.equal(r.done, 2); assert.equal(r.missing, 3); assert.equal(r.total, 5);
  assert.equal(r.rows.find((x) => x.key === 'charged_quartz_crystal').done, true);
  assert.equal(r.rows.find((x) => x.key === 'glob_of_elder_spirit_residue').done, false);
  const n = M.dailyCrafting(CAT.dailyCrafting.items, null);
  assert.equal(n.done, null); assert.equal(n.missing, null);
  assert.ok(n.rows.every((x) => x.done === null));
});

// Los 15 de hoy, tal como los devolvió la API el 2026-10-25 (RUN-055), en su orden.
const HOY = [
  [2308, 'Fractal del día recomendado: escala 16'], [2394, 'Fractal del día recomendado: escala 42'],
  [2892, 'Cenagal de rango 4 del día'], [2923, 'Océano Sólido de rango 4 del día'], [2935, 'Cenagal de rango 1 del día'],
  [2954, 'Océano Sólido de rango 1 del día'], [2961, 'Cenagal de rango 2 del día'], [2971, 'Océano Sólido de rango 2 del día'],
  [2972, 'Cenagal de rango 3 del día'], [2986, 'Océano Sólido de rango 3 del día'], [3213, 'Fractal del día recomendado: escala 62'],
  [4210, 'Rocahonda de rango 3 del día'], [4218, 'Rocahonda de rango 2 del día'], [4224, 'Rocahonda de rango 4 del día'],
  [4244, 'Rocahonda de rango 1 del día']
].map(([id, name]) => ({ id, name }));

test('fractales del día: los 3 de la API por rango y las 3 escalas recomendadas, sin perder ninguno', () => {
  const f = M.fractals(HOY, CAT.fractals.patterns, CAT.fractals.tierMinScale);
  assert.deepEqual(f.fractals.map((x) => x.name), ['Cenagal', 'Océano Sólido', 'Rocahonda']);
  f.fractals.forEach((x) => assert.deepEqual(Object.keys(x.tiers), ['1', '2', '3', '4']));
  assert.equal(f.fractals[2].tiers[3].id, 4210);
  assert.equal(f.fractals[2].tiers[3].minScale, 51);
  assert.deepEqual(f.recommended.map((x) => x.scale), [16, 42, 62]);
  assert.deepEqual(f.unknown, []);
  const en = M.fractals([{ id: 1, name: 'Daily Tier 2 Solid Ocean' }, { id: 2, name: 'Daily Recommended Fractal—Scale 5' }, { id: 3, name: 'Otra cosa' }], CAT.fractals.patterns, CAT.fractals.tierMinScale);
  assert.equal(en.fractals[0].name, 'Solid Ocean');
  assert.equal(en.fractals[0].tiers[2].minScale, 26);
  assert.deepEqual(en.recommended, [{ id: 2, scale: 5 }]);
  assert.deepEqual(en.unknown, [3], 'lo que no reconoce se dice, no se inventa');
});

test('fractales: el progreso cuenta solo los logros del día; sin lectura de la cuenta es «sin datos»', () => {
  const f = RAW.fractals(HOY, CAT.fractals.patterns, CAT.fractals.tierMinScale);
  const p = M.fractalProgress(f, [{ id: 4244, done: true }, { id: 2308, done: true }, { id: 9999, done: true }, { id: 2935, done: false }]);
  assert.equal(p.done, 2); assert.equal(p.total, 15);
  assert.deepEqual(Object.keys(p.ids).sort(), ['2308', '4244']);
  assert.equal(M.fractalProgress(f, null).done, null);
});

test('llave semanal: «probable» con un personaje nivel 10+ creado desde el reset, de cualquier profesión', () => {
  const now = U('2026-10-25T05:35:00Z');
  const chars = [
    { name: 'Lyra', level: 12, created: '2026-10-20T10:00:00Z', profession: 'Guardian' },
    { name: 'Vieja', level: 80, created: '2020-01-01T00:00:00Z', profession: 'Thief' },
    { name: 'Bebé', level: 3, created: '2026-10-24T10:00:00Z', profession: 'Thief' },
    { name: 'Justo', level: 10, created: '2026-10-19T07:29:00Z', profession: 'Thief' }
  ];
  const k = M.weeklyKey(chars, now, 10);
  assert.equal(k.state, 'probable');
  assert.deepEqual(k.chars.map((c) => c.name), ['Lyra'], 'no importa la profesión; antes del reset no cuenta');
  assert.equal(M.weeklyKey([chars[1], chars[2]], now, 10).state, 'none');
  assert.equal(M.weeklyKey([{ name: 'Diez', level: 10, created: '2026-10-21T00:00:00Z' }], now, 10).state, 'probable', 'nivel 10 justo alcanza');
  assert.equal(M.weeklyKey(null, now, 10).state, 'unknown', 'sin leer personajes no dice nada');
  assert.equal(M.weeklyKey(chars, now, 10, true).state, 'claimed', 'reclamada solo si lo confirmás');
  assert.equal(M.weeklyKey(chars, now, 10, false).state, 'pending');
  assert.doesNotMatch(SRC, /Thief/, 'ya no filtra por ladrón');
});

test('piedras vetustas: una casilla por moneda, si te alcanza y cuáles faltan; el −/+ viejo se traslada en orden', () => {
  const O = CAT.leivas.offers;
  const r = M.leivas(O, [{ id: 1, value: 250000 }, { id: 2, value: 6999 }, { id: 68, value: 100 }], { 1: true, 68: true });
  assert.equal(r.bought, 2);
  assert.deepEqual(r.missing, ['Karma', 'Moneda antigua', 'Esquirla de magnetita']);
  assert.equal(r.rows.find((x) => x.currency === 2).afford, false);
  assert.equal(r.rows.find((x) => x.currency === 68).afford, true);
  assert.equal(r.rows.find((x) => x.currency === 66).have, 0);
  const n = M.leivas(O, null, {});
  assert.ok(n.rows.every((x) => x.have === null && x.afford === null), 'sin cartera es «sin datos»');
  assert.deepEqual(M.stonesFromCount(O, 3), { 1: true, 2: true, 68: true });
  assert.deepEqual(M.stonesFromCount(O, 9), { 1: true, 2: true, 68: true, 66: true, 28: true });
  assert.deepEqual(M.stonesFromCount(O, -1), {});
});

test('marcas a mano: por cuenta con una huella (nunca la Key) y por semana; las viejas no cuentan', () => {
  const fp = M.fingerprint('ABCD-SECRETA-1234');
  assert.match(fp, /^[0-9a-f]{8}$/);
  assert.notEqual(fp, M.fingerprint('OTRA-KEY'));
  assert.equal(M.fingerprint(''), '');
  const now = U('2026-10-25T05:35:00Z');
  let s = RAW.setMark({}, fp, now, 'key', true);
  s = RAW.setMark(s, fp, now, 'stone', { currency: 2, on: true });
  s = RAW.setMark(s, fp, now, 'stone', { currency: 1, on: true });
  s = RAW.setMark(s, fp, now, 'stone', { currency: 1, on: false });
  const st = plain(s);
  assert.ok(!JSON.stringify(st).includes('SECRETA'), 'la Key nunca se guarda');
  assert.deepEqual(M.marksFor(st, fp, now), { week: '2026-10-19', key: true, stones: { 2: true } });
  const next = U('2026-10-26T08:00:00Z');
  assert.deepEqual(M.marksFor(st, fp, next), { week: '2026-10-26', stones: {} }, 'después del reset no hay marcas');
  const pruned = M.setMark(st, 'otra0000', next, 'key', false);
  assert.deepEqual(Object.keys(pruned), ['otra0000'], 'al marcar se descartan las semanas viejas');
  assert.equal(M.setMark(st, fp, now, 'key', null)[fp].key, undefined, 'se puede deshacer la confirmación');
});
