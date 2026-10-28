// BL-082 BLD-5: Editor (js/bld-editor.js). Sin red: la API se simula con la forma real.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

globalThis.GNBldCode = require('../js/bld-code.js');
globalThis.GNBldRef = require('../js/bld-ref.js');
globalThis.GNBldShow = require('../js/bld-show.js');
const E = require('../js/bld-editor.js');
const C = globalThis.GNBldCode, R = globalThis.GNBldRef, P = E._pure;

const SPECS = [16, 42, 27, 62].map((sid) => ({ id: sid, name: 'S' + sid, elite: sid > 20 && sid !== 42, icon: '', minor_traits: [],
  major_traits: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => sid * 100 + i) }));
const TRAITS = [];
SPECS.forEach((s) => s.major_traits.forEach((id, i) => TRAITS.push({ id, name: 'R' + id, tier: 1 + Math.floor(i / 3), order: i % 3, specialization: s.id })));
const PROF = { id: 'Guardian', name: 'Guardián', specializations: [16, 42, 27, 62],
  weapons: { Greatsword: { flags: [] }, Longbow: { specialization: 27, flags: [] }, Axe: { specialization: 62, flags: [] } },
  skills: [{ id: 1, type: 'Heal' }, { id: 2, type: 'Heal', specialization: 27 }, { id: 3, type: 'Utility' }, { id: 4, type: 'Utility' }, { id: 5, type: 'Utility' },
    { id: 6, type: 'Utility', specialization: 62 }, { id: 7, type: 'Elite' }],
  skills_by_palette: [[11, 1], [12, 2], [13, 3], [14, 4], [15, 5], [16, 6], [17, 7]] };
const SKILLS = [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id, name: 'H' + id }));
const REF = R.normalize({ prof: PROF, specs: SPECS, traits: TRAITS, skills: SKILLS });

test('versión en la cabecera', () => {
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'js', 'bld-editor.js'), 'utf8'), /Versión: 1\.0\.0 /);
  assert.equal(E.version, '1.0.0');
});

test('opciones de la barra: por casillero y solo las de la élite elegida', () => {
  const b = P.fresh(1);
  assert.deepEqual(P.options(REF, 0, 0).map((o) => o.pid), [11]);
  assert.deepEqual(P.options(REF, 0, 27).map((o) => o.pid), [11, 12]);
  assert.deepEqual(P.options(REF, 1, 62).map((o) => o.pid), [13, 14, 15, 16]);
  assert.deepEqual(P.options(REF, 4, 0).map((o) => o.pid), [17]);
  assert.equal(P.eliteId(b, REF), 0);
});

test('cambiar la élite vacía lo que ya no corresponde (habilidad y arma)', () => {
  const b = P.fresh(1);
  P.setSpec(b, REF, 2, 27);
  b.skills.land = [12, 13, 14, 15, 17];
  P.toggleWeapon(b, 35); P.toggleWeapon(b, 50);
  assert.deepEqual(b.weapons, [35, 50]);
  P.setSpec(b, REF, 2, 62);
  assert.deepEqual(b.skills.land, [0, 13, 14, 15, 17], 'la curación del Dragonhunter se va');
  assert.deepEqual(b.weapons, [50], 'el arco largo de la otra élite se va');
  assert.deepEqual(b.specs[2].traits, [0, 0, 0]);
});

test('rasgos: elegir y volver a tocar para soltar; armas hasta 8', () => {
  const b = P.fresh(1);
  P.setSpec(b, REF, 0, 16);
  P.setTrait(b, 0, 1, 2);
  assert.deepEqual(b.specs[0].traits, [0, 2, 0]);
  P.setTrait(b, 0, 1, 2);
  assert.deepEqual(b.specs[0].traits, [0, 0, 0]);
  for (let i = 0; i < 10; i++) P.toggleWeapon(b, 100 + i);
  assert.equal(b.weapons.length, 8);
});

test('Retornado: las leyendas ponen la barra y el orden de la leyenda inactiva', () => {
  const ref = { legends: [{ code: 1, heal: 101, elite: 105, utilities: [102, 103, 104] }, { code: 3, heal: 201, elite: 205, utilities: [202, 203, 204] }],
    bySkill: { 101: 1, 102: 2, 103: 3, 104: 4, 105: 5, 202: 22, 203: 23, 204: 24 } };
  const b = P.fresh(9);
  b.legends.land = [1, 3];
  P.legendBar(b, ref);
  assert.deepEqual(b.skills.land, [1, 2, 3, 4, 5]);
  assert.deepEqual(b.legends.inactiveLand, [22, 23, 24]);
  assert.deepEqual(b.skills.water, [0, 0, 0, 0, 0]);
});

test('vista: rasgos con aria-pressed y nombre, barra con etiquetas, ficha con código válido', () => {
  const st = E._state;
  st.build = P.fresh(1); st.ref = REF; st.loading = false; st.error = ''; st.title = '<t>';
  P.setSpec(st.build, REF, 0, 16); P.setSpec(st.build, REF, 1, 42); P.setSpec(st.build, REF, 2, 27);
  [0, 1, 2].forEach((l) => [0, 1, 2].forEach((t) => P.setTrait(st.build, l, t, 1)));
  st.build.skills.land = [12, 13, 14, 15, 17];
  const h = P.viewHTML();
  assert.equal((h.match(/class="bld-ed-tr"/g) || []).length, 27);
  assert.equal((h.match(/aria-pressed="true"/g) || []).filter(Boolean).length >= 9, true);
  assert.match(h, /<label for="bldEdSkland0"><small>Curación<\/small>/);
  assert.match(h, /value="&lt;t&gt;"/, 'el nombre se escapa');
  const code = C.encode(st.build);
  assert.ok(h.includes(GNBldShow.esc(code)), 'el código del juego aparece en la ficha');
  assert.match(h, /✓ Válida/);
  assert.equal(C.decode(code).specs[2].id, 27);
  const t0 = Date.now();
  for (let i = 0; i < 50; i++) P.viewHTML();
  assert.ok((Date.now() - t0) / 50 < 200, 'cada redibujo en menos de 200 ms');
});
