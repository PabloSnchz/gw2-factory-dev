// Modelo de «Mis cuentas» (BL-070, CTA-1): expansiones solo las que tenés, puntos de logro reales,
// rangos con su ícono, permisos de la Key y etiquetas con color, con los datos verificados de
// assets/data/accounts/catalog.json (RUN-073 y RUN-074, 2026-10-25). Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/acc-model.js');
const CAT = JSON.parse(read('assets/data/accounts/catalog.json'));
const win = { console: { info() {} } };
win.window = win;
vm.runInContext(SRC, vm.createContext(win), { filename: 'js/acc-model.js' });
const RAW = win.AccModel._pure;
const plain = (x) => (x === undefined ? x : JSON.parse(JSON.stringify(x)));
const M = {};
Object.keys(RAW).forEach((k) => { M[k] = (...a) => plain(RAW[k](...a)); });
const U = (s) => Date.parse(s);
const R = 'https://render.guildwars2.com/file/';

test('el archivo entra en el presupuesto, declara su versión y no pide, no guarda ni toca el DOM', () => {
  assert.ok(Buffer.byteLength(SRC) < 40 * 1024);
  assert.equal(win.AccModel.version, SRC.match(/Versión: (\d+\.\d+\.\d+)/)[1]);
  assert.doesNotMatch(SRC, /\bfetch\(|localStorage|sessionStorage|document\./);
  assert.doesNotMatch(read('index.html'), /acc-model\.js/, 'se carga por el manifiesto, no por index.html');
});

test('catálogo: 6 expansiones con su ícono local que existe, VoE marcada como ausente en la API', () => {
  assert.deepEqual(CAT.expansions.map((e) => e.access), ['HeartOfThorns', 'PathOfFire', 'EndOfDragons', 'SecretsOfTheObscure', 'JanthirWilds', 'VisionsOfEternity']);
  CAT.expansions.forEach((e) => assert.ok(fs.existsSync(path.join(ROOT, e.icon)), e.icon));
  assert.deepEqual(CAT.expansions.filter((e) => e.apiMissing).map((e) => e.id), ['voe']);
  assert.equal(CAT.expansions.find((e) => e.id === 'voe').mastery, 'Magic');
  assert.deepEqual(CAT.expansions.find((e) => e.id === 'hot').impliedBy, ['PathOfFire']);
  assert.ok(CAT.source.length > 40);
});

test('catálogo: cada dato de la tarjeta tiene ícono (local que existe u oficial) y sus permisos', () => {
  const keys = ['achievements', 'legendaries', 'fractals', 'wvw', 'pvp', 'commander', 'guild'];
  assert.deepEqual(Object.keys(CAT.stats), keys);
  keys.forEach((k) => {
    const s = CAT.stats[k];
    if (s.icon.startsWith('assets/')) assert.ok(fs.existsSync(path.join(ROOT, s.icon)), s.icon);
    else assert.match(s.icon, /^[0-9A-F]{40}\/\d+\.png$/, k);
    assert.ok(Array.isArray(s.perm));
  });
  assert.equal(CAT.stats.legendaries.total, 206, 'RUN-074: /v2/legendaryarmory tiene 206');
  assert.equal(CAT.pvpRanks.length, 9);
  assert.equal(new Set(CAT.pvpRanks.map((r) => r.icon)).size, 9);
});

test('catálogo: las 7 etiquetas de siempre, cada una con su color propio y su ícono', () => {
  assert.deepEqual(CAT.tags.map((t) => t.id), ['main', 'alter', 'f2p', 'farming', 'keys', 'weekly', 'taxi']);
  assert.equal(new Set(CAT.tags.map((t) => t.color.toLowerCase())).size, 7, 'colores distintos');
  CAT.tags.forEach((t) => {
    assert.match(t.color, /^#[0-9A-Fa-f]{6}$/);
    assert.ok(fs.existsSync(path.join(ROOT, t.icon)), t.icon);
  });
  assert.deepEqual(CAT.tags.filter((t) => t.type).map((t) => t.id), ['main', 'alter', 'f2p']);
});

test('expansiones: solo las que tenés, en orden; PoF da HoT; nada de las que no', () => {
  const e = M.expansions(CAT.expansions, ['PlayForFree', 'GuildWars2', 'PathOfFire', 'EndOfDragons'], null, null);
  assert.deepEqual(e.map((x) => x.id), ['hot', 'pof', 'eod']);
  assert.ok(e.every((x) => x.source === 'api'));
  assert.equal(e[0].icon, 'assets/icons/Cuentas/HoT.png');
  assert.deepEqual(M.expansions(CAT.expansions, ['PlayForFree'], null, null), []);
  assert.deepEqual(M.expansions(CAT.expansions, null, null, null), []);
});

test('Visions of Eternity: por la API si algún día aparece, por maestría ganada o por tu marca, con la fuente', () => {
  const acc = ['GuildWars2', 'JanthirWilds'];
  assert.deepEqual(M.expansions(CAT.expansions, acc.concat('VisionsOfEternity'), null, null).map((x) => [x.id, x.source]), [['jw', 'api'], ['voe', 'api']]);
  const mp = { totals: [{ region: 'Magic', spent: 2, earned: 5 }, { region: 'Wild', spent: 0, earned: 0 }] };
  assert.deepEqual(M.expansions(CAT.expansions, acc, mp, null).map((x) => [x.id, x.source]), [['jw', 'api'], ['voe', 'mastery']]);
  assert.deepEqual(M.expansions(CAT.expansions, acc, { totals: [{ region: 'Magic', earned: 0 }] }, { voe: true }).map((x) => [x.id, x.source]), [['jw', 'api'], ['voe', 'manual']]);
  assert.deepEqual(M.expansions(CAT.expansions, acc, null, { voe: false }).map((x) => x.id), ['jw']);
  assert.deepEqual(M.expansions(CAT.expansions, [], null, { hot: true }).map((x) => x.id), [], 'la marca a mano solo vale para la que la API no informa');
});

test('cuenta gratuita: solo PlayForFree; con el juego base deja de serlo; sin lectura no se afirma', () => {
  assert.equal(M.isFree(['PlayForFree']), true);
  assert.equal(M.isFree(['PlayForFree', 'GuildWars2']), false);
  assert.equal(M.isFree(['PlayForFree', 'HeartOfThorns']), false, 'una expansión también la saca de gratuita');
  assert.equal(M.isFree(null), null);
});

// definiciones con la forma de /v2/achievements (RUN-073: 3812 y 910 tal cual)
const META = {
  3812: { id: 3812, flags: ['Permanent'], tiers: [{ count: 1, points: 1 }, { count: 3, points: 5 }] },
  910: { id: 910, flags: ['CategoryDisplay', 'Permanent'], tiers: [{ count: 10, points: 50 }] },
  202: { id: 202, flags: [], tiers: [{ count: 1, points: 10 }] },
  77: { id: 77, flags: ['Repeatable'], tiers: [{ count: 5, points: 2 }, { count: 10, points: 3 }] }
};

test('puntos de logro: tiers alcanzados, completos suman todo, sin `current` no rompe (idea78)', () => {
  assert.equal(RAW.pointsOf({ id: 3812, current: 2, done: false }, META[3812]), 1);
  assert.equal(RAW.pointsOf({ id: 3812, current: 3, done: true }, META[3812]), 6);
  assert.equal(RAW.pointsOf({ id: 202, done: true }, META[202]), 10, 'completado sin current');
  assert.equal(RAW.pointsOf({ id: 910, current: 4, done: false }, META[910]), 0);
  assert.equal(RAW.pointsOf({ id: 1 }, null), 0);
});

test('puntos de logro: los repetibles cuentan cada vez hasta su tope', () => {
  assert.equal(RAW.pointsOf({ id: 77, current: 6, repeated: 3 }, META[77]), 3 * 5 + 2);
  assert.equal(RAW.pointsOf({ id: 77, current: 6, repeated: 3 }, META[77], 10), 10);
  assert.equal(RAW.pointsOf({ id: 77, current: 0, repeated: 3 }, META[77], -1), 15, 'tope negativo = sin tope');
  assert.equal(RAW.pointsOf({ id: 77, repeated: 2 }, META[77]), 10, 'sin `current` no suma el tier en curso');
  assert.deepEqual(M.repeatableIds([{ id: 77 }, { id: 202 }, { id: 9 }], META), [77]);
});

test('puntos de logro: total con los diarios y mensuales; lo que no tiene definición se cuenta aparte, no se inventa', () => {
  const prog = [{ id: 3812, current: 3, done: true }, { id: 202, done: true }, { id: 77, current: 10, repeated: 1 }, { id: 5555, done: true }];
  const r = M.achievementPoints(prog, META, { 77: 8 }, { daily_ap: '7659', monthly_ap: 1129 });
  assert.deepEqual(r, { total: 6 + 10 + 8 + 7659 + 1129, missing: 1 });
  assert.equal(M.achievementPoints(null, META, {}, {}), null, 'sin lectura es «sin datos»');
  assert.deepEqual(M.achievementPoints([], {}, {}, null), { total: 0, missing: 0 });
});

test('JcJ: rango con el ícono oficial de su tramo y las vueltas; McM por esquema nuevo o viejo', () => {
  const p = M.pvpRank({ pvp_rank: 45, pvp_rank_rollovers: 0 }, CAT.pvpRanks);
  assert.equal(p.rank, 45);
  assert.equal(p.icon, R + 'F6CB4002B278077FA5BA434D49776D69CA042EA0/347226.png');
  assert.equal(M.pvpRank({ pvp_rank: 80, pvp_rank_rollovers: 12 }, CAT.pvpRanks).rollovers, 12);
  assert.equal(M.pvpRank({ pvp_rank: 80 }, CAT.pvpRanks).icon, R + 'A2ACA72B379FCC4C4D7CE3D59DED073196485B5B/347230.png');
  assert.equal(M.pvpRank(null, CAT.pvpRanks), null);
  assert.equal(M.wvwRank({ wvw: { team_id: 1, rank: 2318 } }), 2318);
  assert.equal(M.wvwRank({ wvw_rank: 514 }), 514);
  assert.equal(M.wvwRank({ wvw: { team_id: 1 } }), null, 'sin progression no hay rango: nunca 0');
});

test('legendarias: distintas con al menos una; sin lectura es null', () => {
  assert.equal(M.legendaryCount([{ id: 1, count: 2 }, { id: 2, count: 1 }, { id: 2, count: 1 }, { id: 3, count: 0 }]), 2);
  assert.equal(M.legendaryCount(null), null);
});

test('permisos y estados: «sin permiso» le gana a «sin datos»; nunca un 0 falso', () => {
  const have = M.perms({ permissions: ['account', 'progression'] });
  assert.deepEqual(have, ['account', 'progression']);
  assert.deepEqual(M.stat(41870, ['progression'], have), { state: 'ok', value: 41870 });
  assert.deepEqual(M.stat(null, ['pvp'], have), { state: 'noperm', missing: ['pvp'] });
  assert.deepEqual(M.stat(null, ['progression'], have), { state: 'nodata' });
  assert.deepEqual(M.stat(0, [], have), { state: 'ok', value: 0 }, 'un 0 leído sí se muestra');
  assert.equal(M.perms(null), null);
  assert.equal(M.keyComplete(CAT.stats, ['account', 'progression', 'pvp', 'inventories', 'unlocks']), true);
  assert.equal(M.keyComplete(CAT.stats, have), false);
  assert.equal(M.keyComplete(CAT.stats, null), null);
});

test('etiquetas: las conocidas con su color e ícono en el orden del catálogo; las tuyas en gris, sin perderse', () => {
  const t = M.tags(['Taxi', 'mis-alts', 'main', 'keys', 'main', ' '], CAT.tags, CAT.otherTagColor);
  assert.deepEqual(t.map((x) => x.id), ['main', 'keys', 'taxi', 'mis-alts']);
  assert.equal(t[0].color, '#F2B94B');
  assert.equal(t[0].type, true);
  assert.equal(t[3].color, '#8E96A3');
  assert.equal(t[3].name, 'mis-alts');
  assert.equal(M.accountType(t), 'main');
  assert.equal(M.accountType(M.tags(['farming'], CAT.tags)), null);
  assert.deepEqual(M.tags(null, CAT.tags), []);
});

test('clanes, antigüedad y resumen de cabecera (suma solo lo leído)', () => {
  assert.deepEqual(M.guilds(['A', 'B'], { A: { tag: 'GN', name: 'Gato Negro' } }), [{ id: 'A', tag: 'GN', name: 'Gato Negro' }, { id: 'B', tag: null, name: '' }]);
  assert.deepEqual(M.age('2012-08-28T00:00:00Z', U('2026-10-25T00:00:00Z')), { days: 5171, years: 14 });
  assert.deepEqual(M.age('2019-10-26T00:00:00Z', U('2026-10-25T00:00:00Z')).years, 6, 'el aniversario todavía no llegó');
  assert.equal(M.age('nada', 0), null);
  const s = M.summary([
    { ap: { state: 'ok', value: 100 }, legendaries: { state: 'ok', value: 3 }, keyComplete: true, type: 'main' },
    { ap: { state: 'noperm' }, legendaries: { state: 'nodata' }, keyComplete: false, type: 'alter' },
    { ap: { state: 'ok', value: 50 }, legendaries: { state: 'ok', value: 1 }, keyComplete: null, type: 'alter' }
  ]);
  assert.deepEqual(s, { accounts: 3, ap: 150, apFrom: 2, legendaries: 4, legFrom: 2, keysComplete: 1, keysKnown: 2, types: { main: 1, alter: 2 } });
});

test('íconos: los locales quedan, los oficiales llevan el servicio de imágenes', () => {
  assert.equal(M.icon('assets/icons/155059.png'), 'assets/icons/155059.png');
  assert.equal(M.icon('2BBA251A24A2C1A0A305D561580449AF5B55F54F/338457.png'), R + '2BBA251A24A2C1A0A305D561580449AF5B55F54F/338457.png');
  assert.equal(M.icon(''), '');
});
