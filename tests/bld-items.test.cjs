// BL-084 EQ-2: equipo de cada build en castellano (js/bld-items.js). Sin red: la API se simula con la forma real (RUN-234/235).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const X = require('../js/bld-items.js');

const RG = 'https://render.guildwars2.com/file/A/';
const armor = (id, sub, name, infix) => ({ id, name, type: 'Armor', rarity: 'Ascended', icon: RG + id + '.png',
  description: '<c=@flavor>Fabricada siguiendo el estilo de Zojja.</c>',
  details: { type: sub, weight_class: 'Heavy', infix_upgrade: { id: infix || 161, attributes: [{ attribute: 'Power', modifier: 47 }] } } });
const ITEMS = [
  armor(48075, 'Helm', 'Visor de Zojja'), armor(48077, 'Shoulders', 'Hombreras de Zojja'), armor(95626, 'Coat', 'Jubón de Suun', 1681),
  armor(48074, 'Gloves', 'Puños de guerra de Zojja'), armor(48076, 'Leggings', 'Musleras de Zojja'), armor(48072, 'Boots', 'Grebas de Zojja'),
  { id: 79837, name: 'Espalda', type: 'Back', details: { infix_upgrade: { id: 161, attributes: [] } } },
  { id: 79745, name: 'Acc', type: 'Trinket', details: { type: 'Accessory' } },
  { id: 81169, name: 'Amu', type: 'Trinket', details: { type: 'Amulet' } },
  { id: 79710, name: 'Anillo', type: 'Trinket', details: { type: 'Ring' } },
  { id: 46764, name: 'Mandoble de Zojja', type: 'Weapon', details: { type: 'Greatsword', infix_upgrade: { id: 161, attributes: [] } } },
  { id: 46774, name: 'Espada de Zojja', type: 'Weapon', details: { type: 'Sword' } },
  { id: 46759, name: 'Hacha de Zojja', type: 'Weapon', details: { type: 'Axe' } },
  { id: 74978, name: 'Runa superior del cazadragones', type: 'UpgradeComponent', description: '<c=@abilitytype>Elemento: </c>Potencia<br>Haz doble clic para aplicar a una armadura.',
    details: { type: 'Rune', bonuses: ['+25 de ferocidad', '+35 de potencia'], infix_upgrade: { id: 112, attributes: [] } } },
  { id: 24615, name: 'Sello superior de fuerza', type: 'UpgradeComponent', details: { type: 'Sigil', infix_upgrade: { id: 261, buff: { skill_id: 9322, description: '+5\u00a0% de daño' }, attributes: [] } } },
  { id: 24868, name: 'Sello superior de impacto', type: 'UpgradeComponent', details: { type: 'Sigil', infix_upgrade: { id: 558, buff: { description: '+7 % contra aturdidos\n+3 % de daño de golpe' } } } },
  { id: 100090, name: 'Reliquia del cazadragones', type: 'Relic', description: 'Los enemigos alcanzados por tus trampas quedan cazados.' },
  { id: 39620, name: 'Infusión potente +9 de agonía', type: 'UpgradeComponent', details: { type: 'Default', infix_upgrade: { id: 1, buff: { description: '+9 de potencia' }, attributes: [{ attribute: 'Power', modifier: 9 }] } } },
  { id: 91805, name: 'Filete sous vide', type: 'Consumable', description: 'Banquete para gourmets.', details: { type: 'Food' } },
  { id: 9443, name: 'Piedra de afilar superior', type: 'Consumable', details: { type: 'Utility', duration_ms: 1800000, description: 'Ganas potencia igual al 3 % de tu precisión\n+10 % de experiencia al matar' } },
  { id: 96613, name: 'Núcleo de robot de jade: Rango 10', type: 'PowerCore', description: 'Aumenta la vitalidad en 235.' },
  { id: 21210, name: 'Runa del guerrero', type: 'UpgradeComponent', details: { type: 'Default', bonuses: ['+25 de vitalidad'] } },
  { id: 31283, name: 'Arco largo de PvP', type: 'Weapon', details: { type: 'LongBow' } },
  { id: 21152, name: 'Sello de energía', type: 'UpgradeComponent', details: { type: 'Default', infix_upgrade: { buff: { description: 'Gana aguante. <c=@reminder>(Recarga: 9 segundos)</c>' } } } }
];
const STATS = [
  { id: 1077, name: 'de berserker', attributes: [{ attribute: 'CritDamage' }, { attribute: 'Power' }, { attribute: 'Precision' }] },
  { id: 1697, name: 'de dragón', attributes: [{ attribute: 'Power' }] },
  { id: 1681, name: 'de dragón', attributes: [{ attribute: 'Power' }, { attribute: 'Vitality' }] },
  { id: 161, name: 'de berserker', attributes: [{ attribute: 'Power' }] }
];
const AMULETS = [{ id: 8, name: 'Amuleto de berserker', icon: RG + '8.png', attributes: { CritDamage: 900, Power: 1200, Precision: 900 } }];

const PVE = { armor: [[48075, 1077], [48077, 1077], [95626, 1967], [48074, 1077], [48076, 1077], [48072, 1077]], rune: 74978,
  trinkets: [[79837, 1697], [79745, 1077], [79745, 1077], [81169, 1077], [79710, 1077], [79710, 1077]], relic: 100090,
  weapons: [[1, 'm', 46764, 1077, [24615, 24868]], [2, 'm', 46774, 1077, [24615]], [2, 'o', 46759, 1077, [24868]]],
  infusion: [39620, 18], food: 91805, utility: 9443, jade: 96613 };
const PVP = { rune: 21210, relic: 100090, amulet: 8, weapons: [[1, 'm', 31283, 0, [21152, 24615]]] };

function fakeFetch(log, opts) {
  opts = opts || {};
  return async (url) => {
    log.push(url);
    if (url === X.GEAR) return { ok: true, status: 200, json: async () => ({ version: 1, fetched: '2026-10-30', source: { name: 'Snow Crows' }, gear: { a: PVE, b: PVP } }) };
    const u = new URL(url);
    const want = (u.searchParams.get('ids') || '').split(',').map(Number);
    assert.equal(u.searchParams.get('lang'), 'es');
    const src = u.pathname === '/v2/items' ? ITEMS : u.pathname === '/v2/itemstats' ? STATS : u.pathname === '/v2/pvp/amulets' ? AMULETS : [];
    const body = src.filter((x) => want.includes(x.id));
    if (opts.fail) return { ok: false, status: 503, json: async () => ({}) };
    if (!body.length) return { ok: false, status: 404, json: async () => ({ text: 'all ids provided are invalid' }) };
    return { ok: body.length === want.length, status: body.length === want.length ? 200 : 206, json: async () => body };
  };
}

test('versión en la cabecera y en modules.json, después de bld-code y antes de las vistas', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-items.js'), 'utf8');
  assert.match(src, /Versión: 1\.0\.0 /);
  assert.equal(X.version, '1.0.0');
  const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).routes['#/builds'].map((m) => m.src);
  assert.ok(mods.includes('js/bld-items.js'), 'se carga con la ruta #/builds');
  assert.ok(mods.indexOf('js/bld-items.js') < mods.indexOf('js/bld-view.js'));
});

test('gear.json real: todas las builds tienen la forma que lee el módulo', () => {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'builds', 'gear.json'), 'utf8'));
  const ids = Object.keys(j.gear);
  assert.ok(ids.length >= 90, 'las builds de Snow Crows');
  ids.forEach((id) => {
    const e = j.gear[id], v = X.sheet(e, null);
    assert.ok(v.relic, id + ': reliquia');
    assert.ok(v.sets.length >= 1, id + ': armas');
    if (v.pvp) assert.ok(e.amulet && e.rune, id + ': PvP con amuleto y runa');
    else { assert.equal(v.armor.length, 6, id); assert.equal(v.trinkets.length, 6, id); assert.ok(v.rune || v.runeMixed, id + ': runa'); }
    const n = X.ids(e);
    assert.ok(n.items.length > 3 && n.items.every(Number.isInteger), id);
  });
});

test('clean: saca etiquetas del juego, «doble clic» y «Elemento»', () => {
  assert.equal(X.clean('<c=@abilitytype>Elemento: </c>Potencia<br>Haz doble clic para aplicar a una armadura.'), '');
  assert.equal(X.clean('Gana aguante. <c=@reminder>(Recarga: 9 segundos)</c>'), 'Gana aguante. (Recarga: 9 segundos)');
  assert.equal(X.clean('a\nb'), 'a\nb');
  assert.equal(X.statLabel('de berserker'), 'Berserker');
  assert.equal(X.statLabel('celestial'), 'Celestial');
  assert.equal(X.attrName('CritDamage'), 'Ferocidad');
  assert.equal(X.attrName('ConditionDuration'), 'Pericia');
});

test('normItem: compacto, sin el texto de ambientación, con bonos, efecto y atributos', () => {
  const h = X.normItem(ITEMS[0]);
  assert.equal(h.desc, undefined, 'la frase de ambientación no se guarda');
  assert.equal(h.sub, 'Helm');
  assert.deepEqual(h.attrs, [['Power', 47]]);
  const r = X.normItem(ITEMS.find((x) => x.id === 74978));
  assert.deepEqual(r.bonuses, ['+25 de ferocidad', '+35 de potencia']);
  assert.equal(r.desc, undefined);
  assert.equal(X.normItem(ITEMS.find((x) => x.id === 24615)).buff, '+5\u00a0% de daño');
  const u = X.normItem(ITEMS.find((x) => x.id === 9443));
  assert.equal(u.dur, 1800000);
  assert.match(u.effect, /3 % de tu precisión\n\+10 %/);
  assert.equal(X.normItem(ITEMS.find((x) => x.id === 100090)).desc, 'Los enemigos alcanzados por tus trampas quedan cazados.');
  const s = X.normStat(STATS[0]);
  assert.equal(s.name, 'Berserker');
  assert.deepEqual(s.attrs, ['Power', 'Precision', 'CritDamage'], 'en el orden del panel del héroe');
  assert.deepEqual(X.normAmulet(AMULETS[0]).attrs, [['Power', 1200], ['Precision', 900], ['CritDamage', 900]]);
});

test('load: ficha PvE completa en castellano; pide por tandas y solo lo que falta', async () => {
  X._test.reset();
  const log = [];
  const f = fakeFetch(log);
  const { entry, view: v } = await X.load('a', { fetch: f });
  assert.ok(entry);
  assert.equal(v.pvp, false);
  assert.deepEqual(v.armor.map((r) => r.slot), ['Casco', 'Hombreras', 'Pecho', 'Guantes', 'Perneras', 'Botas']);
  assert.equal(v.armor[0].item.name, 'Visor de Zojja');
  assert.equal(v.armor[0].stat.name, 'Berserker');
  assert.equal(v.armor[2].stat.name, 'Dragón', 'la 1967 no existe: uso la estadística propia de la pieza');
  assert.equal(v.rune.name, 'Runa superior del cazadragones');
  assert.deepEqual(v.trinkets.map((r) => r.slot), ['Espalda', 'Accesorio', 'Accesorio', 'Amuleto', 'Anillo', 'Anillo']);
  assert.equal(v.relic.desc, 'Los enemigos alcanzados por tus trampas quedan cazados.');
  assert.equal(v.sets.length, 2);
  assert.equal(v.sets[0].hands[0].two, true);
  assert.equal(v.sets[0].hands[0].handLabel, 'Dos manos');
  assert.equal(v.sets[0].hands[0].type, 'Mandoble');
  assert.deepEqual(v.sets[0].hands[0].sigils.map((s) => s.name), ['Sello superior de fuerza', 'Sello superior de impacto']);
  assert.deepEqual(v.sets[1].hands.map((h) => h.handLabel), ['Mano principal', 'Mano secundaria']);
  assert.deepEqual(v.extras.map((x) => x.label), ['Infusiones', 'Comida', 'Mejora', 'Núcleo del robot de jade']);
  assert.equal(v.extras[0].count, 18);
  assert.equal(v.stats[0].stat.name, 'Berserker');
  assert.equal(v.stats[0].pieces, 5 + 5 + 3, '5 de armadura, 5 abalorios y 3 armas');
  const calls = log.filter((u) => u.startsWith('https://')).length;
  assert.ok(calls <= 3, 'items, estadísticas (y amuletos solo si hace falta): ' + calls);
  log.length = 0;
  await X.load('a', { fetch: f });
  assert.equal(log.length, 0, 'la segunda vez no pide nada');
});

test('load: PvP con amuleto y runa; el arco largo es a dos manos', async () => {
  X._test.reset();
  const { view: v } = await X.load('b', { fetch: fakeFetch([]) });
  assert.equal(v.pvp, true);
  assert.equal(v.armor.length, 0);
  assert.equal(v.amulet.name, 'Amuleto de berserker');
  assert.equal(X.attrName(v.amulet.attrs[0][0]), 'Potencia');
  assert.equal(v.rune.name, 'Runa del guerrero');
  assert.equal(v.sets[0].hands[0].type, 'Arco largo');
  assert.equal(v.sets[0].hands[0].two, true);
  assert.equal(v.sets[0].hands[0].stat, null, 'en PvP las armas no tienen estadística');
});

test('load: build sin equipo → view null; la API caída da un error que se puede reintentar', async () => {
  X._test.reset();
  assert.deepEqual(await X.load('nada', { fetch: fakeFetch([]) }), { entry: null, view: null });
  X._test.reset();
  await assert.rejects(X.load('a', { fetch: fakeFetch([], { fail: true }) }), /respondió 503/);
  const { view } = await X.load('a', { fetch: fakeFetch([]) });
  assert.equal(view.armor.length, 6, 'después de un error se vuelve a pedir');
});

test('caché en GNIdb: guarda compacto y lo reusa; si venció, lo descarta', async () => {
  X._test.reset();
  const mem = new Map();
  globalThis.GNIdb = { ready: async () => {}, get: (k) => mem.get(k), set: (k, v) => mem.set(k, JSON.parse(JSON.stringify(v))) };
  await X.load('a', { fetch: fakeFetch([]) });
  const saved = mem.get('gn:bld:items:es');
  assert.ok(saved && saved.items[48075] && saved.stats[1077] && saved.noStat[1967]);
  assert.ok(JSON.stringify(saved).length < 12000, 'compacto: ' + JSON.stringify(saved).length);
  X._test.reset();
  const log = [];
  await X.load('a', { fetch: fakeFetch(log) });
  assert.deepEqual(log.filter((u) => u.startsWith('https://')), [], 'la caché alcanza');
  assert.equal(mem.get('gn:bld:items:es'), saved, 'si no trajo nada nuevo, no vuelve a escribir');
  saved.at = Date.now() - 8 * 864e5;
  X._test.reset();
  log.length = 0;
  await X.load('a', { fetch: fakeFetch(log) });
  assert.ok(log.some((u) => u.includes('/v2/items')), 'una semana después se renueva');
  delete globalThis.GNIdb;
});

test('ficha sin datos de la API: muestra ids, nunca rompe', () => {
  const v = X.sheet(PVE, null);
  assert.equal(v.armor[0].item.name, '#48075');
  assert.equal(v.armor[0].stat.name, '#1077');
  assert.equal(X.sheet(null), null);
});
