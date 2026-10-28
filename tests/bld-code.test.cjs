// BL-082 BLD-2: códec del código de plantilla (js/bld-code.js). Ida y vuelta sobre códigos reales.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/bld-code.js');

// Códigos públicos: el del decodificador de gw2.guildwars.games (Guardián), el de la librería
// gw2-chatlinks-go (Ladrón con Daga y Rifle) y el ejemplo de la wiki oficial (3 Epidemias, Nigromante).
const REAL = {
  guardian: '[&DQEbNxAZKgoDAQMBihKKEv4S/hJ6FnoWtRIAAAAAAAAAAAAAAAAAAAAAAAA=]',
  thief: '[&DQUAAAAAAAAkDyQPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLwBVAAA=]',
  wikiDup: '[&DQg1OSc5AjkAAAAAmQEAAJkBAAAAAJkBAAAAAAAAAAAAAAAAAAAAAAAAAAA=]'
};

test('versión declarada en la cabecera', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'bld-code.js'), 'utf8');
  assert.match(src, /Versión: 1\.0\.0/);
  assert.equal(C.version, '1.0.0');
});

test('códigos reales: ida y vuelta idénticos', () => {
  Object.keys(REAL).forEach((k) => {
    const b = C.decode(REAL[k]);
    assert.equal(C.encode(b), REAL[k], k);
  });
});

test('Guardián: profesión, especializaciones y rasgos', () => {
  const b = C.decode(REAL.guardian);
  assert.equal(b.profession, 1);
  assert.deepEqual(b.specs.map((s) => s.id), [27, 16, 42]);
  assert.deepEqual(b.specs[0].traits, [3, 1, 3]);
  assert.equal(b.legacy, true, 'código viejo de 44 bytes, sin armas');
  assert.equal(b.skills.land.length, 5);
});

test('Ladrón: armas Daga y Rifle (formato 2023)', () => {
  const b = C.decode(REAL.thief);
  assert.equal(b.profession, 5);
  assert.deepEqual(b.weapons, [47, 85]);
  assert.deepEqual(b.weapons.map((w) => C.WEAPONS[w]), ['Dagger', 'Rifle']);
  assert.deepEqual(b.overrides, []);
  assert.equal(b.legacy, false);
});

test('regla del juego: la misma habilidad dos veces en la barra de tierra', () => {
  const b = C.decode(REAL.wikiDup);
  const p = C.problems(b);
  assert.equal(p.length, 1);
  assert.equal(p[0].code, 'DUP_SKILL');
  assert.equal(p[0].bar, 'land');
});

test('Guardabosques: mascotas de tierra y agua', () => {
  const b = C.empty(4);
  b.specs = [{ id: 30, traits: [1, 2, 3] }, { id: 32, traits: [2, 2, 2] }, { id: 55, traits: [3, 1, 1] }];
  b.skills.land = [121, 210, 211, 212, 213];
  b.pets = { land: [59, 46], water: [21, 40] };
  b.weapons = [90, 5, 35];
  const code = C.encode(b);
  const back = C.decode(code);
  assert.deepEqual(back.pets, b.pets);
  assert.deepEqual(back.weapons, [90, 5, 35]);
  assert.equal(C.encode(back), code);
});

test('Retornado: leyendas y orden de las habilidades de la leyenda inactiva', () => {
  const b = C.empty(9);
  b.specs = [{ id: 15, traits: [1, 1, 1] }, { id: 3, traits: [2, 2, 2] }, { id: 52, traits: [3, 3, 3] }];
  b.legends = { land: [2, 5], water: [3, 1], inactiveLand: [4614, 4651, 4564], inactiveWater: [0, 0, 0] };
  b.overrides = [41820, 45686];
  const back = C.decode(C.encode(b));
  assert.deepEqual(back.legends, b.legends);
  assert.deepEqual(back.overrides, [41820, 45686]);
});

test('acepta el código con texto alrededor o sin corchetes', () => {
  assert.equal(C.decode('mirá esta: ' + REAL.thief + ' 👍').profession, 5);
  assert.equal(C.decode(REAL.thief.slice(2, -1)).profession, 5);
});

test('errores claros, sin lanzar desde parse', () => {
  const cases = [
    ['', 'E_EMPTY'], ['hola mundo', 'E_CHARS'], ['[&AgEAWgAA]', 'E_TYPE'],
    ['[&DQE=]', 'E_SHORT'], ['[&DQoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=]', 'E_PROF'],
    ['x'.repeat(700), 'E_LONG'], ['<script>alert(1)</script>', 'E_CHARS']
  ];
  cases.forEach(([txt, code]) => {
    const r = C.parse(txt);
    assert.equal(r.ok, false, txt.slice(0, 20));
    assert.equal(r.errorCode, code, txt.slice(0, 20) + ' → ' + r.error);
    assert.ok(r.error.length > 10);
  });
});

test('datos de más al final o demasiadas armas: se rechaza, no se adivina', () => {
  const b = C.decode(REAL.thief);
  const bytes = C.encodeBytes(b).concat([1, 2]);
  assert.throws(() => C.decodeBytes(bytes), { code: 'E_TAIL' });
  const w = C.encodeBytes(b); w[44] = 9;
  assert.throws(() => C.decodeBytes(w), { code: /E_WEAPONS|E_SHORT/ });
});

test('encode valida rangos', () => {
  const b = C.empty(1);
  b.skills.land[0] = 70000;
  assert.throws(() => C.encode(b), { code: 'E_RANGE' });
  assert.throws(() => C.encode({ profession: 0 }), { code: 'E_PROF' });
});

test('rendimiento: 1000 idas y vueltas en menos de 200 ms', () => {
  const t0 = Date.now();
  for (let i = 0; i < 1000; i++) C.encode(C.decode(REAL.thief));
  assert.ok(Date.now() - t0 < 200);
});
