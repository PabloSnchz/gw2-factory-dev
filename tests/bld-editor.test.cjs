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
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'js', 'bld-editor.js'), 'utf8'), /Versión: 1\.2\.0 /);
  assert.equal(E.version, '1.2.0');
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
  assert.match(h, /id="bldEdSkland0" data-ed="slot" data-bar="land" data-slot="0" aria-haspopup="true" aria-expanded="false" aria-label="Curación: H2"/);
  assert.match(h, /value="&lt;t&gt;"/, 'el nombre se escapa');
  const code = C.encode(st.build);
  assert.ok(h.includes(GNBldShow.esc(code)), 'el código del juego aparece en la ficha');
  assert.match(h, /✓ Válida/);
  assert.equal(C.decode(code).specs[2].id, 27);
  const t0 = Date.now();
  for (let i = 0; i < 50; i++) P.viewHTML();
  assert.ok((Date.now() - t0) / 50 < 200, 'cada redibujo en menos de 200 ms');
});

test('BLD-12/13: con bld-gear cargado, la ficha suma el panel de equipo y un AE2 válido', () => {
  globalThis.GNBldAe2 = require('../js/bld-ae2.js');
  globalThis.GNBldGear = require('../js/bld-gear.js');
  const st = E._state;
  st.gear = null;
  st.build.weapons = [50];
  const h = P.viewHTML();
  assert.match(h, /Equipo y código AE2/);
  const ae2 = (h.match(/<code>(AE2:[^<]+)<\/code>/) || [])[1];
  assert.ok(ae2, 'hay código AE2');
  const d = GNBldAe2.decode(ae2);
  assert.equal(d.code, C.encode(st.build));
  assert.equal(d.gear.WeaponA1.weaponType, 'Greatsword');
  assert.equal(d.gear.Helm.statId, 1077, 'poder en PvE: Berserker');
  delete globalThis.GNBldGear; delete globalThis.GNBldAe2;
});

// BUI-3: elementos de mentira para simular clics sin navegador.
function btn(attrs) {
  const me = { tagName: 'BUTTON', id: attrs.id || '', getAttribute: (k) => (k in attrs ? attrs[k] : null), closest: (s) => (s === '[data-ed]' ? me : null) };
  return me;
}

test('BUI-3 líneas: fondo oficial (solo render.guildwars2.com), rasgos como íconos con su nombre para el lector, menores y resumen', () => {
  const RG = 'https://render.guildwars2.com/file/AB12/1012.png';
  assert.equal(P.bgStyle(RG), ' style="background-image:url(\'' + RG + '\')"');
  for (const bad of ['javascript:x', 'https://evil.com/a.png', RG + "');x:url('y", '']) assert.equal(P.bgStyle(bad), '', 'no entra: ' + bad);
  const specs = SPECS.map((s) => Object.assign({}, s, { background: s.id === 27 ? RG : 'http://x/y.png', minor_traits: [s.id * 1000, s.id * 1000 + 1, s.id * 1000 + 2] }));
  const traits = TRAITS.concat(specs.flatMap((s) => s.minor_traits.map((id, i) => ({ id, name: 'M' + id, tier: i + 1, slot: 'Minor', specialization: s.id, icon: 'https://render.guildwars2.com/file/m.png' }))));
  const ref = R.normalize({ prof: PROF, specs, traits, skills: SKILLS });
  const st = E._state;
  st.build = P.fresh(1); st.ref = ref; st.loading = false; st.error = ''; st.pick = null;
  P.setSpec(st.build, ref, 0, 16); P.setSpec(st.build, ref, 2, 27); P.setTrait(st.build, 2, 0, 2);
  const h = P.viewHTML();
  assert.match(h, /class="bld-ed-line has-spec is-elite" style="background-image:url\('https:\/\/render\.guildwars2\.com\/file\/AB12\/1012\.png'\)"/);
  assert.doesNotMatch(h, /http:\/\/x\/y\.png/, 'un fondo que no es oficial no se usa');
  const tr = h.match(/<button type="button" class="bld-ed-tr" id="bldEdTr201"[^>]*>/)[0];
  assert.match(tr, /aria-pressed="true"/);
  assert.match(tr, /aria-label="R2701"/, 'el lector dice el nombre del rasgo');
  assert.equal((h.match(/class="bld-ed-mn"/g) || []).length, 6, '3 menores por línea elegida');
  assert.match(h, /<p class="bld-ed-picked">R2701 · <span class="bld-muted">Maestro: sin elegir/);
  assert.match(h, /<span>Línea 2<\/span>|data-line="1"/);
});

test('BUI-3 barra: casilleros con ícono que abren un selector; elegir, vaciar, cerrar y volver al casillero', () => {
  const st = E._state;
  st.build = P.fresh(1); st.ref = REF; st.loading = false; st.error = ''; st.pick = null;
  P.setSpec(st.build, REF, 2, 27);
  const ctx = { host: { innerHTML: '', contains: () => false, querySelector: () => null } };
  P.onClick(ctx, { target: btn({ 'data-ed': 'slot', 'data-bar': 'land', 'data-slot': '0', id: 'bldEdSkland0' }) });
  assert.deepEqual(st.pick, { bar: 'land', slot: 0 });
  let h = ctx.host.innerHTML;
  assert.match(h, /aria-expanded="true" aria-label="Curación: vacío"/);
  assert.match(h, /role="group" aria-label="Elegí curación" data-ed-pick/);
  assert.deepEqual([...h.matchAll(/data-ed="pick" data-v="(\d+)" aria-pressed/g)].map((m) => +m[1]), [11, 12], 'solo las de esa élite');
  P.onClick(ctx, { target: btn({ 'data-ed': 'pick', 'data-v': '12' }) });
  assert.equal(st.build.skills.land[0], 12);
  assert.equal(st.pick, null, 'elegir cierra el selector');
  assert.match(ctx.host.innerHTML, /aria-label="Curación: H2"/);
  P.onClick(ctx, { target: btn({ 'data-ed': 'slot', 'data-bar': 'water', 'data-slot': '4' }) });
  assert.match(ctx.host.innerHTML, /<details class="bld-ed-water" open>/, 'el selector de agua abre su sección');
  P.onClick(ctx, { target: btn({ 'data-ed': 'pick', 'data-v': '17' }) });
  assert.equal(st.build.skills.water[4], 17);
  P.onClick(ctx, { target: btn({ 'data-ed': 'slot', 'data-bar': 'land', 'data-slot': '0' }) });
  P.onClick(ctx, { target: btn({ 'data-ed': 'pick', 'data-v': '0' }) });
  assert.equal(st.build.skills.land[0], 0, '«Dejar vacío»');
  P.onClick(ctx, { target: btn({ 'data-ed': 'slot', 'data-bar': 'land', 'data-slot': '1' }) });
  P.onClick(ctx, { target: btn({ 'data-ed': 'pick-close' }) });
  assert.equal(st.pick, null);
  P.onClick(ctx, { target: btn({ 'data-ed': 'slot', 'data-bar': 'land', 'data-slot': '1' }) });
  P.onClick(ctx, { target: btn({ 'data-ed': 'slot', 'data-bar': 'land', 'data-slot': '1' }) });
  assert.equal(st.pick, null, 'tocar el mismo casillero cierra');
});

test('BUI-3 profesiones con su ícono oficial; Retornado: la barra de la leyenda a la vista, sin selector', () => {
  const RG = 'https://render.guildwars2.com/file/';
  const id = { profs: {}, elites: {} };
  for (let p = 1; p <= 9; p++) id.profs[p] = { name: 'P' + p, icon: RG + 'p' + p + '.png', iconBig: RG + 'P' + p + '.png', elites: [] };
  const prev = R.identitySync;
  R.identitySync = () => id;
  const st = E._state;
  st.build = P.fresh(1); st.ref = REF; st.pick = null;
  let h = P.viewHTML();
  assert.match(h, /class="bld-ed-pf" data-ed="prof" data-v="1" aria-pressed="true" title="P1"><span class="bld-emb"><img class="" src="https:\/\/render\.guildwars2\.com\/file\/p1\.png" width="30"/);
  R.identitySync = prev;
  const ref9 = Object.assign({}, REF, { profession: 9, legends: [{ code: 1, heal: 1, elite: 7, utilities: [3, 4, 5], name: 'L1' }] });
  st.build = P.fresh(9); st.ref = ref9;
  st.build.legends.land = [1, 0];
  P.legendBar(st.build, ref9);
  h = P.viewHTML();
  assert.match(h, /class="bld-ed-bar is-ro" role="group" aria-label="Barra \(la ponen las leyendas\)"/);
  assert.doesNotMatch(h, /data-ed="slot"/, 'sin casilleros para elegir');
  assert.doesNotMatch(h, /bld-ed-water/, 'sin barra de agua vacía');
});
