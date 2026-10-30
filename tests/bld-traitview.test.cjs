// BL-084 EQ-5: rasgos y habilidades como en el juego (js/bld-traitview.js) con el ref de js/bld-ref.js 1.3.0. Sin red.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require('../js/bld-code.js');
globalThis.GNBldShow = require('../js/bld-show.js');
const R = require('../js/bld-ref.js');
globalThis.GNBldRef = R;
const TV = require('../js/bld-traitview.js');
const P = TV._pure;
const C = globalThis.GNBldCode;
const RG = 'https://render.guildwars2.com/file/';

// Un Ladrón de mentira con la forma real de /v2/professions?v=latest (RUN-244): armas con habilidades por casillero,
// la 3 de la daga según la mano secundaria, y la mecánica (Profession_N) base y de una élite.
const PROF = { id: 'Thief', name: 'Ladrón', icon: RG + 't.png', icon_big: RG + 'T.png', specializations: [28, 35, 58],
  weapons: {
    Dagger: { flags: ['Mainhand', 'Offhand'], skills: [{ id: 13004, slot: 'Weapon_1' }, { id: 13097, slot: 'Weapon_2' }, { id: 13006, slot: 'Weapon_3', offhand: 'Dagger' },
      { id: 13040, slot: 'Weapon_3', offhand: 'Pistol' }, { id: 13110, slot: 'Weapon_3', offhand: 'Nothing' }, { id: 13019, slot: 'Weapon_4' }, { id: 16432, slot: 'Weapon_5' }] },
    Pistol: { flags: ['Mainhand', 'Offhand'], skills: [{ id: 13084, slot: 'Weapon_1' }, { id: 13012, slot: 'Weapon_4' }, { id: 13113, slot: 'Weapon_5' }] },
    Rifle: { specialization: 58, flags: ['TwoHand'], skills: [1, 2, 3, 4, 5].map((n) => ({ id: 77000 + n, slot: 'Weapon_' + n })) }
  },
  skills: [{ id: 13021, slot: 'Heal', type: 'Heal' }, { id: 13026, slot: 'Utility', type: 'Utility' }, { id: 13027, slot: 'Utility', type: 'Utility' },
    { id: 13028, slot: 'Utility', type: 'Utility' }, { id: 13132, slot: 'Elite', type: 'Elite' },
    { id: 13014, slot: 'Profession_1', type: 'Profession' }, { id: 77397, slot: 'Profession_1', type: 'Profession' },
    { id: 76702, slot: 'Profession_2', type: 'Profession' }, { id: 76601, slot: 'Profession_2', type: 'Profession' }],
  skills_by_palette: [[1, 13021], [2, 13026], [3, 13027], [4, 13028], [5, 13132]] };
const trait = (id, spec, tier, order, slot) => ({ id, name: 'Rasgo ' + id, icon: RG + id + '.png', description: '<c=@reminder>Hace</c> algo ' + id, tier, order, slot: slot || 'Major', specialization: spec });
const SPECS = [28, 35, 58].map((sid) => ({ id: sid, name: 'Línea ' + sid, elite: sid === 58, icon: RG + 's' + sid + '.png', background: RG + 'bg' + sid + '.png',
  minor_traits: [sid * 100 + 1, sid * 100 + 2, sid * 100 + 3], major_traits: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => sid * 100 + 10 + i) }));
const TRAITS = [];
SPECS.forEach((s) => {
  s.minor_traits.forEach((id, i) => TRAITS.push(trait(id, s.id, i + 1, 0, 'Minor')));
  s.major_traits.forEach((id, i) => TRAITS.push(trait(id, s.id, 1 + Math.floor(i / 3), i % 3)));
});
const sk = (id, name, extra) => Object.assign({ id, name, icon: RG + 'k' + id + '.png', description: 'Descripción de ' + name, slot: 'x', type: 'y' }, extra || {});
const SKILLS = [sk(13021, 'Curación <b>'), sk(13026, 'U1'), sk(13027, 'U2'), sk(13028, 'U3'), sk(13132, 'Veneno de basilisco'),
  sk(13004, 'Daga 1'), sk(13097, 'Daga 2'), sk(13006, 'Daga 3 con daga'), sk(13040, 'Daga 3 con pistola'), sk(13110, 'Daga 3 sola'), sk(13019, 'Daga 4'), sk(16432, 'Daga 5'),
  sk(13084, 'Pistola 1'), sk(13012, 'Pistola 4'), sk(13113, 'Pistola 5')]
  .concat([1, 2, 3, 4, 5].map((n) => sk(77000 + n, 'Rifle ' + n)))
  .concat([sk(13014, 'Robar'), sk(77397, 'Robar del francotirador', { specialization: 58 }), sk(76702, 'Mecánica A', { specialization: 58 }), sk(76601, 'Mecánica B', { specialization: 58 })]);
const REF = R.normalize({ prof: PROF, specs: SPECS, traits: TRAITS, skills: SKILLS });

function build() {
  const b = C.empty(5);
  b.specs = [{ id: 28, traits: [1, 2, 3] }, { id: 35, traits: [3, 0, 1] }, { id: 58, traits: [2, 2, 2] }];
  b.skills.land = [1, 2, 3, 4, 5];
  return b;
}
function gearSets(pairs) { return { sets: pairs.map((p, i) => ({ label: 'Juego de armas ' + (i + 1), hands: p.map((sub, k) => ({ hand: k ? 'o' : 'm', item: { sub } })) })) }; }

test('versión en la cabecera, en modules.json antes de la ficha y bld-ref 1.3.0', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-traitview.js'), 'utf8');
  assert.match(src, /Versión: 1\.0\.0 /);
  assert.equal(TV.version, '1.0.0');
  assert.doesNotMatch(src, /localStorage\.(get|set|remove)Item/);
  const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).routes['#/builds'].map((m) => m.src);
  assert.ok(mods.indexOf('js/bld-ref.js') < mods.indexOf('js/bld-traitview.js') && mods.indexOf('js/bld-traitview.js') < mods.indexOf('js/bld-sheet.js'));
  assert.equal(R.version, '1.3.0');
});

test('bld-ref 1.3.0: guarda las habilidades de cada arma y la mecánica de la profesión; lo de antes se vuelve a pedir', () => {
  assert.equal(REF.v, 3);
  assert.deepEqual(REF.weapons.Dagger.skills[2], [13006, 'Weapon_3', 'Dagger', '']);
  assert.deepEqual(REF.prof.map((x) => x[0]), [13014, 77397, 76702, 76601]);
  assert.equal(REF.skills[77397].spec, 58);
  assert.equal(TV.ready(REF), true);
  assert.equal(TV.ready(Object.assign({}, REF, { prof: undefined })), false, 'un ref viejo no alcanza: la ficha usa la vista anterior');
});

test('armas: juegos desde el equipo (Daga+Pistola, Rifle) y, sin equipo, desde las armas del código', () => {
  const sets = P.weaponSets(REF, gearSets([['Dagger', 'Pistol'], ['Rifle']]), build());
  assert.deepEqual(sets.map((s) => [s.main, s.off, s.from]), [['Dagger', 'Pistol', 'gear'], ['Rifle', '', 'gear']]);
  assert.deepEqual(P.setSkills(REF, sets[0]).ids, [13004, 13097, 13040, 13012, 13113], 'la 3 de la daga con pistola en la otra mano');
  assert.deepEqual(P.setSkills(REF, { main: 'Dagger', off: 'Dagger' }).ids.slice(2, 3), [13006]);
  assert.deepEqual(P.setSkills(REF, { main: 'Dagger', off: '' }).ids, [13004, 13097, 13110, 0, 0], 'sola: «Nothing» y sin 4–5');
  assert.deepEqual(P.setSkills(REF, sets[1]).ids, [77001, 77002, 77003, 77004, 77005], 'a dos manos, las 5 del arma');
  const b = build(); b.weapons = [85, 47, 54];
  assert.deepEqual(P.weaponSets(REF, null, b).map((s) => [s.main, s.off, s.label]), [['Rifle', '', 'Juego de armas 1'], ['Dagger', 'Pistol', 'Juego de armas 2']]);
  assert.equal(P.weaponKey(REF, 'LongBow'), '');
  assert.equal(P.weaponKey(REF, 'dagger'), 'Dagger');
});

test('mecánica: con la élite elegida, su F1; si la élite deja dos opciones en una tecla, no adivino', () => {
  assert.deepEqual(P.profSkills(REF, 58), [{ key: 'F1', id: 77397 }]);
  assert.deepEqual(P.profSkills(REF, 0), [{ key: 'F1', id: 13014 }], 'sin élite, la base');
});

test('HTML: barra con teclas, líneas con fondo oficial, elegidos encendidos, otras opciones para el lector, guía de teclas y acciones', () => {
  const b = build();
  const view = R.resolve(b, REF);
  const h = TV.html({ build: b, ref: REF, view, checks: [], code: C.encode(b), gear: gearSets([['Dagger', 'Pistol'], ['Rifle']]) });
  assert.match(h, /<small>Juego de armas 1 · Daga \+ Pistola<\/small>/);
  assert.match(h, /<small>Juego de armas 2 · Rifle<\/small>/);
  assert.match(h, /aria-label="1: Daga 1"/);
  assert.match(h, /aria-label="3: Daga 3 con pistola"/);
  assert.match(h, /aria-label="6: Curación &lt;b&gt;"/, 'escapado');
  assert.match(h, /aria-label="0: Veneno de basilisco"/);
  assert.match(h, /aria-label="F1: Robar del francotirador"/);
  assert.match(h, /<kbd aria-hidden="true">F1<\/kbd>/);
  const lines = [...h.matchAll(/<section class="bld-tvl( is-elite)?" style="--tv-bg:url\(&quot;([^&]+)&quot;\)" aria-label="([^"]+)">/g)];
  assert.deepEqual(lines.map((m) => m[3]), ['Línea 1: Línea 28', 'Línea 2: Línea 35', 'Línea 3: Línea 58']);
  assert.equal(lines[2][1], ' is-elite');
  assert.equal(lines[0][2], RG + 'bg28.png');
  assert.equal((h.match(/class="bld-tvtr bld-tvt is-on"/g) || []).length, 3 + 2 + 3, 'un elegido por columna (la línea 2 tiene una sin elegir)');
  assert.match(h, /aria-label="Adepto · elegido: Rasgo 2810"/);
  assert.match(h, /aria-label="Maestro · elegido: Rasgo 2814"/);
  assert.match(h, /<span class="bld-tvnone">sin elegir<\/span>/);
  assert.match(h, /<span class="bld-sr">Otras opciones: Rasgo 2811, Rasgo 2812\.<\/span>/);
  assert.match(h, /class="bld-tvtr is-off" aria-hidden="true" title="Rasgo 2811"/);
  assert.match(h, /aria-label="Rasgo menor adepto: Rasgo 2801"/);
  assert.match(h, /<span>Hace algo 2810<\/span>/, 'descripción oficial sin las etiquetas del juego');
  assert.match(h, /<details class="bld-tvk"><summary>Guía de teclas/);
  assert.match(h, /<td><kbd>9<\/kbd><\/td><td>[^]*U3<\/td><td>Utilidad<\/td>/);
  assert.match(h, /✓ Válida/);
  assert.match(h, /<code>\[&amp;DQ/);
  for (const a of ['share', 'gw2skills', 'edit']) assert.match(h, new RegExp('data-bld-act="' + a + '"'));
  const tips = [...h.matchAll(/aria-describedby="(bldTv-\d+)"/g)].map((m) => m[1]);
  const ids = [...h.matchAll(/role="tooltip" id="(bldTv-\d+)"/g)].map((m) => m[1]);
  assert.deepEqual(tips, ids, 'cada uno con su propia descripción');
  assert.equal(new Set(ids).size, ids.length);
  assert.doesNotMatch(h, /<b>(?!Rasgo|Daga|Pistola|Rifle|Curaci|U\d|Veneno|Robar|Línea)/, 'nada sin escapar');
});

test('sin equipo ni armas en el código: lo dice; fondo que no es oficial no se usa', () => {
  const b = build();
  const ref = JSON.parse(JSON.stringify(REF));
  ref.specs[0].background = 'javascript:alert(1)';
  const h = TV.html({ build: b, ref, view: R.resolve(b, ref), checks: null, code: '' });
  assert.match(h, /esta no trae ninguno/);
  assert.doesNotMatch(h, /javascript:/);
  assert.match(h, /<section class="bld-tvl" aria-label="Línea 1: Línea 28">/);
  const empty = build(); empty.specs[1] = { id: 0, traits: [0, 0, 0] };
  assert.match(TV.html({ build: empty, ref: REF, view: R.resolve(empty, REF) }), /Línea 2 vacía\./);
});

test('Escape cierra la descripción y vuelve al salir; wire una sola vez', () => {
  const cls = new Set();
  const row = { classList: { add: (c) => cls.add(c), remove: (c) => cls.delete(c), contains: (c) => cls.has(c) }, contains: () => false };
  const t = { closest: () => row };
  assert.equal(P.onKey({ key: 'Escape', target: t }), true);
  assert.ok(cls.has('is-tipoff'));
  assert.equal(P.onLeave({ target: t, relatedTarget: null }), true);
  assert.equal(cls.size, 0);
  const on = [];
  const host = { addEventListener: (x) => on.push(x) };
  assert.equal(TV.wire(host), true);
  assert.equal(TV.wire(host), false);
  assert.deepEqual(on, ['keydown', 'focusout', 'mouseout']);
});

test('CSS: tokens de los temas, foco visible, una columna en el celular', () => {
  assert.doesNotMatch(P.CSS, /:\s*#[0-9a-fA-F]{3,8}/);
  assert.match(P.CSS, /\.bld-tvt:focus-visible\{outline:2px solid var\(--gn-mod\)/);
  assert.match(P.CSS, /@media \(max-width:720px\)\{[^}]*\.bld-tvl\{grid-template-columns:1fr\}/);
  assert.match(P.CSS, /\.bld-tvt:hover>\.bld-tvtip,#buildsPanel \.bld-tvt:focus>\.bld-tvtip\{display:block\}/);
});
