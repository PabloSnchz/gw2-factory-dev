// BL-082 BLD-3: datos del juego para Builds (js/bld-ref.js). Sin red: la API se simula.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

globalThis.GNBldCode = require('../js/bld-code.js');
const R = require('../js/bld-ref.js');
const C = globalThis.GNBldCode;

// Una profesión de mentira con la forma real de la API (v=latest).
const PROF = { id: 'Guardian', name: 'Guardián', code: 1, icon: 'g.png', icon_big: 'G.png', specializations: [16, 42, 27],
  weapons: { Greatsword: { flags: ['TwoHand'] }, Longbow: { specialization: 27, flags: ['TwoHand'] } },
  skills: [{ id: 9083, slot: 'Heal', type: 'Heal' }, { id: 9085, slot: 'Utility', type: 'Utility' }, { id: 9150, slot: 'Utility', type: 'Utility' },
    { id: 9153, slot: 'Utility', type: 'Utility' }, { id: 30039, slot: 'Utility', type: 'Utility', specialization: 27 }, { id: 9175, slot: 'Elite', type: 'Elite' }],
  skills_by_palette: [[127, 9083], [138, 9085], [254, 9150], [255, 9153], [4746, 30039], [262, 9175]] };
const trait = (id, spec, tier, order) => ({ id, name: 'R' + id, icon: id + '.png', description: 'd', tier, order, slot: 'Major', specialization: spec });
const SPECS = [16, 42, 27].map((sid) => ({ id: sid, name: 'S' + sid, elite: sid === 27, icon: sid + '.png', background: 'bg', minor_traits: [sid * 100],
  major_traits: [3, 2, 1, 6, 5, 4, 9, 8, 7].map((o, i) => sid * 100 + 10 + i) }));
const TRAITS = [];
SPECS.forEach((s) => { TRAITS.push({ id: s.id * 100, name: 'm', tier: 0, order: 0, slot: 'Minor', specialization: s.id });
  s.major_traits.forEach((id, i) => TRAITS.push(trait(id, s.id, 1 + Math.floor(i / 3), [2, 1, 0][i % 3]))); });
const SKILLS = [9083, 9085, 9150, 9153, 30039, 9175].map((id) => ({ id, name: 'H' + id, icon: id + '.png', slot: 'x', type: 'y' }));

function fakeFetch(log) {
  return async (url) => {
    log.push(url);
    const u = new URL(url);
    const body = u.pathname === '/v2/build' ? { id: 209026 }
      : u.pathname === '/v2/professions/Guardian' ? PROF
      : u.pathname === '/v2/specializations' ? SPECS
      : u.pathname === '/v2/traits' ? TRAITS
      : u.pathname === '/v2/skills' ? SKILLS : null;
    return { ok: !!body, status: body ? 200 : 404, json: async () => body };
  };
}

test('versión en la cabecera', () => {
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'js', 'bld-ref.js'), 'utf8'), /Versión: 1\.1\.0 /);
  assert.equal(R.version, '1.1.0');
});

test('normalize: paleta, líneas con los 3 rasgos de cada nivel en orden, barra y armas', () => {
  const ref = R.normalize({ prof: PROF, specs: SPECS, traits: TRAITS, skills: SKILLS });
  assert.equal(ref.profession, 1);
  assert.equal(ref.palette[127], 9083);
  assert.equal(ref.bySkill[30039], 4746);
  const s = R.specById(ref, 16);
  assert.deepEqual(s.major.map((l) => l.length), [3, 3, 3]);
  assert.deepEqual(s.major[0], [1612, 1611, 1610], 'ordenados por order de la API (arriba, medio, abajo)');
  assert.equal(R.specById(ref, 27).elite, true);
  assert.equal(ref.weapons.Longbow.spec, 27);
  assert.equal(ref.bar.Utility.length, 4);
});

test('resolve: nombres de líneas, rasgos y habilidades desde un código', () => {
  const ref = R.normalize({ prof: PROF, specs: SPECS, traits: TRAITS, skills: SKILLS });
  const b = C.empty(1);
  b.specs = [{ id: 16, traits: [1, 2, 3] }, { id: 42, traits: [3, 3, 3] }, { id: 27, traits: [2, 1, 1] }];
  b.skills.land = [127, 138, 254, 4746, 262];
  b.weapons = [50, 35];
  const v = R.resolve(b, ref);
  assert.deepEqual(v.specs.map((x) => x.name), ['S16', 'S42', 'S27']);
  assert.equal(v.specs[0].traits[0].id, 1612);
  assert.equal(v.specs[0].traits[2].id, 1616);
  assert.deepEqual(v.land.map((x) => x && x.name), ['H9083', 'H9085', 'H9150', 'H30039', 'H9175']);
  assert.deepEqual(v.weapons.map((w) => w.name), ['Mandoble', 'Arco largo']);
  assert.deepEqual(R.check(b, ref), [], 'build válida: sin avisos');
});

test('check (D3): élite fuera de lugar, habilidad de otra élite, casillero equivocado y arma ajena', () => {
  const ref = R.normalize({ prof: PROF, specs: SPECS, traits: TRAITS, skills: SKILLS });
  const b = C.empty(1);
  b.specs = [{ id: 27, traits: [1, 1, 1] }, { id: 42, traits: [1, 1, 1] }, { id: 16, traits: [1, 0, 1] }];
  b.skills.land = [138, 127, 4746, 0, 262];
  b.weapons = [35, 54];
  const msgs = R.check(b, ref).map((x) => x.level + ':' + x.msg);
  assert.ok(msgs.includes('err:S27 es élite: va en la tercera línea.'));
  assert.ok(msgs.includes('warn:S16: falta elegir el rasgo maestro.'));
  assert.ok(msgs.some((m) => /^err:H9085 no va en ese casillero/.test(m)));
  assert.ok(msgs.some((m) => /^err:H30039 necesita la especialización S27/.test(m)));
  assert.ok(msgs.includes('warn:Falta la habilidad de utilidad 3.'));
  assert.ok(msgs.includes('warn:Arco largo necesita S27.'));
  assert.ok(msgs.includes('err:El arma Pistola no es de Guardián.'));
  b.profession = 2;
  assert.ok(R.check(b, ref).some((x) => x.msg === 'El código es de otra profesión.'));
});

test('load: pide la API una sola vez por versión del juego y guarda en GNIdb', async () => {
  R._test.reset();
  const saved = new Map();
  globalThis.GNIdb = { ready: () => Promise.resolve(true), get: (k) => (saved.has(k) ? JSON.parse(saved.get(k)) : null),
    set: (k, v) => saved.set(k, JSON.stringify(v)), keys: () => [...saved.keys()], del: (k) => saved.delete(k) };
  saved.set('gn:bld:ref:es:Guardian:1', '{"v":1,"profession":1}');
  const log = [];
  const ref = await R.load(1, { fetch: fakeFetch(log) });
  assert.equal(ref.gameBuild, 209026);
  assert.ok(log.some((u) => /\/v2\/professions\/Guardian\?v=latest&lang=es$/.test(u)), 'paletas con v=latest');
  assert.ok(log.every((u) => !/ids=.*ids=/.test(u)));
  assert.ok(saved.has('gn:bld:ref:es:Guardian:209026'));
  assert.ok(!saved.has('gn:bld:ref:es:Guardian:1'), 'lo del parche anterior se borra');
  const n = log.length;
  R._test.reset();
  const again = await R.load('Guardian', { fetch: fakeFetch(log) });
  assert.equal(log.length, n + 1, 'la segunda vez solo pregunta la versión del juego');
  assert.equal(again.specs.length, 3);
  delete globalThis.GNIdb;
});

test('load: profesión desconocida o API caída dan un error claro', async () => {
  R._test.reset();
  await assert.rejects(R.load(10), /Profesión desconocida/);
  await assert.rejects(R.load(2, { fetch: async () => ({ ok: false, status: 503, json: async () => null }) }), /respondió 503/);
});

test('1.1.0: si llega una página web, reintento sin caché y con marca; si sigue, el error dice qué pedido', async () => {
  R._test.reset();
  const log = [], opts = [];
  let html = 1;
  const base = fakeFetch(log);
  const f = async (url, o) => {
    opts.push(o || {});
    if (/\/v2\/professions\//.test(url) && html-- > 0) { log.push(url); return { ok: true, status: 200, text: async () => '<!DOCTYPE html><p>x</p>' }; }
    const r = await base(url);
    const body = await r.json();
    return { ok: r.ok, status: r.status, text: async () => JSON.stringify(body) };
  };
  const ref = await R.load(1, { fetch: f });
  assert.equal(ref.specs.length, 3);
  const prof = log.filter((u) => /\/v2\/professions\//.test(u));
  assert.equal(prof.length, 2, 'un intento normal y uno sin caché');
  assert.match(prof[1], /&_=\d+$/);
  assert.ok(opts.some((o) => o.cache === 'no-store'));
  R._test.reset();
  const always = async (url) => ({ ok: true, status: 200, text: async () => (/\/v2\/build/.test(url) ? '{"id":1}' : '<!DOCTYPE html>') });
  await assert.rejects(R.load(3, { fetch: always }), /página web desde \/v2\/professions\/Engineer, también sin caché/);
});
