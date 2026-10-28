// BL-082 BLD-13 (D2): optimizador por reglas y armado del equipo para AE2 (js/bld-gear.js). Sin red.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

globalThis.GNBldCode = require('../js/bld-code.js');
const G = require('../js/bld-gear.js');

test('versión en la cabecera', () => {
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'js', 'bld-gear.js'), 'utf8'), /Versión: 1\.0\.0 /);
  assert.equal(G.version, '1.0.0');
});

test('reglas: cada perfil da estadísticas, runa, reliquia y 2 sigilos conocidos', () => {
  const cases = [
    [{ mode: 'pve', damage: 'power', roles: ['dps'] }, 1077],
    [{ mode: 'pve', damage: 'power', roles: ['dps', 'alacrity'] }, 1538],
    [{ mode: 'pve', damage: 'condition', roles: ['dps'] }, 1130],
    [{ mode: 'pve', damage: 'condition', roles: ['dps', 'quickness'] }, 1686],
    [{ mode: 'pve', damage: 'hybrid', roles: ['dps'] }, 1052],
    [{ mode: 'pve', roles: ['heal', 'quickness'] }, 1345],
    [{ mode: 'wvw', roles: ['support'] }, 1123],
    [{ mode: 'wvw', damage: 'power', roles: ['dps'] }, 1111]
  ];
  cases.forEach(([p, stat]) => {
    const s = G.suggest(p);
    assert.equal(s.stat, stat, JSON.stringify(p));
    assert.ok(G.STATS[s.stat] && G.RUNES[s.rune] && G.RELICS[s.relic], JSON.stringify(p));
    assert.equal(s.sigils.length, 2);
    s.sigils.forEach((x) => assert.ok(G.SIGILS[x]));
    assert.ok(s.why.length > 5);
  });
  assert.equal(G.suggest({ mode: 'pvp' }).pvp, true, 'en PvP el equipo es el amuleto');
});

test('armas → casilleros: dos manos ocupan un juego; una mano llena principal y secundaria', () => {
  const s = (w) => G.weaponSlots(w).map((x) => x.slot + ':' + x.type);
  assert.deepEqual(s(['Greatsword', 'Scepter', 'Focus']), ['WeaponA1:Greatsword', 'WeaponB1:Scepter', 'WeaponB2:Focus']);
  assert.deepEqual(s(['Sword', 'Dagger', 'Staff']), ['WeaponA1:Sword', 'WeaponA2:Dagger', 'WeaponB1:Staff']);
  assert.deepEqual(s(['Dagger']), ['WeaponA1:Dagger']);
  assert.equal(G.weaponSlots(['Staff', 'Hammer', 'Rifle']).length, 2, 'no más de dos juegos');
});

test('equipo de AE2: 12 piezas con la estadística y sigilos en las armas', () => {
  const g = G.fresh();
  const out = G.toAe2Gear(g, ['Greatsword', 'Sword', 'Focus']);
  assert.equal(Object.keys(out).length, 15);
  assert.equal(out.Helm.statId, 1077);
  assert.equal(out.WeaponA1.sigilId, 24615);
  assert.equal(out.WeaponA1.sigil2Id, 24618, 'arma de dos manos: dos sigilos');
  assert.equal(out.WeaponB2.weaponType, 'Focus');
});

test('el panel escapa y sin código no dibuja AE2', () => {
  globalThis.GNBldShow = require('../js/bld-show.js');
  const h = G.panelHTML(G.fresh(), [], '');
  assert.match(h, /Equipo y código AE2/);
  assert.doesNotMatch(h, /Código AE2 \(Alter Ego\)/);
  assert.match(h, /<select id="bldGearstat" data-gear="stat">/);
  delete globalThis.GNBldShow;
});
