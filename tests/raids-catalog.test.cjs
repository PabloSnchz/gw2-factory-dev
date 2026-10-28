// Catálogo verificado de Raids (BL-070 RAI-1). Corre con: node --test tests/*.test.cjs
// Fija lo medido en la API oficial el 2026-10-24 (RUN-022, RUN-023) y en la wiki oficial,
// para que ningún cambio del catálogo vuelva a publicar datos inventados (LES-029, LES-030).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'assets', 'data', 'raids', 'catalog.json');
const RAW = fs.readFileSync(FILE, 'utf8');
const CAT = JSON.parse(RAW);
const ENC = CAT.encounters;
const byId = Object.fromEntries(ENC.map((e) => [e.id, e]));

// /v2/raids?ids=all (RUN-022): eventos de cada ala, en orden.
const API_WINGS = {
  spirit_vale: ['vale_guardian', 'spirit_woods', 'gorseval', 'sabetha'],
  salvation_pass: ['slothasor', 'bandit_trio', 'matthias'],
  stronghold_of_the_faithful: ['escort', 'keep_construct', 'twisted_castle', 'xera'],
  bastion_of_the_penitent: ['cairn', 'mursaat_overseer', 'samarog', 'deimos'],
  hall_of_chains: ['soulless_horror', 'river_of_souls', 'statues_of_grenth', 'voice_in_the_void'],
  mythwright_gambit: ['conjured_amalgamate', 'twin_largos', 'qadim'],
  the_key_of_ahdashim: ['gate', 'adina', 'sabir', 'qadim_the_peerless'],
  mount_balrior: ['camp', 'greer', 'decima', 'ura'],
};
// /v2/achievements 9125 «Weekly Raid Encounters» (RUN-022): un objetivo por encuentro.
const WEEKLY_BITS = ['shiverpeaks_pass', 'fraenir', 'voice_claw', 'whisper_of_jormag', 'boneskinner', 'cold_war',
  'aetherblade_hideout', 'xunlai_jade_junkyard', 'kaineng_overlook', 'harvest_temple', 'cosmic_observatory',
  'temple_of_febe', 'old_lions_court', 'guardians_glade'];
// Wiki «Magnetite Shard», «Old Lion's Court» y «Gaeting Crystal»: encuentros con +10 en modo desafío.
const WITH_CM = ['keep_construct', 'cairn', 'mursaat_overseer', 'samarog', 'deimos', 'soulless_horror',
  'voice_in_the_void', 'conjured_amalgamate', 'twin_largos', 'qadim', 'adina', 'sabir', 'qadim_the_peerless',
  'greer', 'decima', 'ura', 'old_lions_court', 'aetherblade_hideout', 'xunlai_jade_junkyard', 'kaineng_overlook',
  'harvest_temple', 'cosmic_observatory', 'temple_of_febe', 'guardians_glade', 'nexus_of_eternity'];
const ODD_AMOUNTS = { voice_claw: 9, forging_steel: '19-44', cold_war: '2-4' };

test('el catálogo entra en el presupuesto de 40 KB y no trae videos de relleno', () => {
  assert.ok(Buffer.byteLength(RAW) <= 40 * 1024, 'catalog.json pasa los 40 KB');
  assert.doesNotMatch(RAW, /dQw4w9WgXcQ|youtube|youtu\.be/i);
});

test('46 encuentros con id único y grupo conocido', () => {
  assert.equal(ENC.length, 46);
  assert.equal(new Set(ENC.map((e) => e.id)).size, 46);
  const groups = new Set(CAT.groups.map((g) => g.id));
  ENC.forEach((e) => assert.ok(groups.has(e.group), e.id + ': grupo desconocido ' + e.group));
});

test('las 8 alas coinciden con /v2/raids, en orden y con su id de evento', () => {
  const wings = CAT.groups.filter((g) => g.kind === 'wing');
  assert.deepEqual(wings.map((w) => w.id), Object.keys(API_WINGS));
  wings.forEach((w, i) => {
    assert.equal(w.wing, i + 1);
    const got = ENC.filter((e) => e.group === w.id);
    assert.deepEqual(got.map((e) => e.id), API_WINGS[w.id], w.id);
    got.forEach((e) => assert.deepEqual(e.track, { by: 'account_raids', event: e.id }));
  });
});

test('los encuentros se marcan con el logro semanal 9125, un objetivo cada uno; solo dos quedan a mano', () => {
  WEEKLY_BITS.forEach((id, bit) => assert.deepEqual(byId[id].track, { by: 'weekly_achievement', achievement: 9125, bit }, id));
  const manual = ENC.filter((e) => e.track.by === 'manual').map((e) => e.id).sort();
  assert.deepEqual(manual, ['forging_steel', 'nexus_of_eternity']);
});

test('conocimiento legendario: 44 por semana (HoT 15, PoF 10, JW 3, encuentros 16)', () => {
  const sum = (exp) => ENC.filter((e) => CAT.groups.find((g) => g.id === e.group).expansion === exp).reduce((n, e) => n + e.li, 0);
  assert.equal(sum('hot'), 15);
  assert.equal(sum('pof'), 10);
  assert.equal(sum('jw'), 3);
  assert.equal(['core', 'ibs', 'eod', 'soto', 'voe'].reduce((n, x) => n + sum(x), 0), 16);
  assert.equal(byId.gate.li, 0);
  assert.equal(byId.camp.li, 0);
});

test('fragmentos y cristales: valores del juego y dificultad coherente', () => {
  const DIFF = { 8: 1, 10: 2, 12: 3, 14: 4, 16: 5 };
  ENC.forEach((e) => {
    if (e.id in ODD_AMOUNTS) { assert.equal(e.amount, ODD_AMOUNTS[e.id], e.id); assert.equal(e.difficulty, null, e.id); return; }
    if (e.amount === null) { assert.equal(e.type, e.id === 'escort' ? 'boss' : 'event', e.id); assert.equal(e.difficulty, null); return; }
    assert.ok(e.amount in DIFF, e.id + ': ' + e.amount);
    assert.equal(e.difficulty, DIFF[e.amount], e.id);
  });
  assert.equal(byId.greer.amount, 16);
  assert.equal(byId.guardians_glade.amount, 12);
  assert.equal(byId.nexus_of_eternity.amount, 14);
  ENC.forEach((e) => {
    const voe = e.group === 'voe';
    if (e.amount !== null) assert.equal(e.currency, voe ? 'gaeting' : 'magnetite', e.id);
  });
});

test('modo desafío solo donde el juego da +10', () => {
  assert.deepEqual(ENC.filter((e) => e.cm).map((e) => e.id).sort(), WITH_CM.slice().sort());
  assert.equal(CAT.rules.cmBonus, 10);
  assert.equal(CAT.rules.magnetiteCap, 800);
  assert.equal(CAT.rules.gaetingCap, 150);
});

test('monedas con los ids de la API: conocimiento 70, magnetita 28, Gaeting actual 77', () => {
  assert.equal(CAT.currencies.li.id, 70);
  assert.equal(CAT.currencies.magnetite.id, 28);
  assert.equal(CAT.currencies.gaeting.id, 77);
  Object.values(CAT.currencies).forEach((c) => assert.match(c.icon, /^https:\/\/render\.guildwars2\.com\/file\/[0-9A-F]{40}\/\d+\.png$/));
});

test('íconos: los locales existen, las miniaturas son oficiales y los genéricos están contados', () => {
  const KINDS = ['local', 'mini', 'next-boss', 'emblem', 'generic'];
  ENC.forEach((e) => {
    assert.ok(KINDS.includes(e.icon.kind), e.id);
    if (e.icon.kind === 'mini' || e.icon.kind === 'emblem') {
      if (e.icon.kind === 'mini') assert.ok(Number.isInteger(e.icon.mini), e.id);
      assert.match(e.icon.src, /^https:\/\/render\.guildwars2\.com\/file\/[0-9A-F]{40}\/\d+\.png$/, e.id);
    } else {
      assert.ok(fs.existsSync(path.join(ROOT, e.icon.src)), e.id + ': no existe ' + e.icon.src);
    }
  });
  // BL-078 UNI-5: la API no tiene miniatura de estos 5 jefes (RUN-174, RUN-175): llevan el emblema oficial de su expansión.
  assert.deepEqual(ENC.filter((e) => e.icon.kind === 'generic').map((e) => e.id), [], 'ningún encuentro con el ícono genérico');
  const emblem = ENC.filter((e) => e.icon.kind === 'emblem');
  assert.deepEqual(emblem.map((e) => e.id).sort(), ['fraenir', 'harvest_temple', 'kaineng_overlook', 'voice_claw', 'xunlai_jade_junkyard']);
  emblem.forEach((e) => assert.match(e.icon.src, e.group === 'ibs' ? /\/2352419\.png$/ : /\/2700772\.png$/, e.id + ': emblema de su expansión'));
  assert.ok(ENC.filter((e) => e.icon.kind === 'next-boss').every((e) => e.type === 'event'));
});

test('nombres en español e inglés, con su fuente', () => {
  ENC.forEach((e) => {
    assert.ok(e.name && e.nameEn, e.id);
    assert.ok(['api', 'propia'].includes(e.nameSource), e.id);
  });
  assert.equal(byId.slothasor.name, 'Perezón');
  assert.equal(byId.old_lions_court.name, 'Vieja Corte del León');
  assert.equal(CAT.groups.find((g) => g.id === 'hall_of_chains').name, 'Sala de las Cadenas');
  assert.equal(CAT.groups.find((g) => g.id === 'mythwright_gambit').name, 'Táctica del Forjador de Mitos');
});
