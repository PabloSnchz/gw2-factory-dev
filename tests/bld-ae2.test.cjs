// BL-082 BLD-12: código AE2 con el equipo completo (js/bld-ae2.js), según la especificación v3 de Alter Ego.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

globalThis.GNBldCode = require('../js/bld-code.js');
const A = require('../js/bld-ae2.js');
// El ejemplo de la especificación (Guardián) con su equipo completo.
const LINK = '[&DQEeHjElPy5LFwAAhgAAAEgBAACGAAAALRcAAAAAAAAAAAAAAAAAAAAAAAA=]';
const GEAR = { Helm: { statId: 1077 }, Shoulders: { statId: 1077 }, Coat: { statId: 1077 }, Gloves: { statId: 1077 }, Leggings: { statId: 1077 }, Boots: { statId: 1077 },
  WeaponA1: { statId: 1077, sigilId: 24615, weaponType: 'Greatsword', sigil2Id: 24868 }, WeaponB1: { statId: 1077, sigilId: 24618, weaponType: 'Scepter' },
  WeaponB2: { statId: 1077, sigilId: 24615, weaponType: 'Focus' }, Backpack: { statId: 1077 }, Accessory1: { statId: 1077 }, Accessory2: { statId: 1077 },
  Amulet: { statId: 1077 }, Ring1: { statId: 1077 }, Ring2: { statId: 1077 } };

test('versión en la cabecera', () => {
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'js', 'bld-ae2.js'), 'utf8'), /Versión: 1\.0\.0 /);
  assert.equal(A.version, '1.0.0');
});

test('estructura binaria según la especificación v3', () => {
  const code = A.encode({ code: LINK, mode: 'Raid', gear: GEAR, runeId: 24836, relicId: 100916 });
  assert.match(code, /^AE2:[A-Za-z0-9+/]+=*$/);
  const b = Buffer.from(code.slice(4), 'base64');
  assert.equal(b[0], 3, 'versión 3');
  assert.equal(b[1], 3 | 0x08 | 0x10 | 0x20, 'modo Raid + equipo + runa + reliquia');
  assert.equal(b[2], 44, 'largo del código del juego');
  assert.equal(b[3], 0x0D, 'empieza el código del juego');
  const mask = b.readUInt16LE(3 + 44);
  assert.equal(mask, 0xFFFF & ~(1 << 7), '15 casilleros (sin mano secundaria del arma 1: mandoble)');
  assert.ok(code.length < 199, 'entra en el chat del juego: ' + code.length);
});

test('ida y vuelta: código, modo, equipo, runa, reliquia, armas y sigilos', () => {
  const code = A.encode({ code: LINK, mode: 'Raid', gear: GEAR, runeId: 24836, relicId: 100916 });
  const d = A.decode(code);
  assert.equal(d.version, 3);
  assert.equal(d.mode, 'Raid');
  assert.equal(d.code, LINK);
  assert.equal(d.runeId, 24836);
  assert.equal(d.relicId, 100916);
  assert.deepEqual(JSON.parse(JSON.stringify(d.gear.WeaponA1)), { statId: 1077, sigilId: 24615, weaponType: 'Greatsword', sigil2Id: 24868 });
  assert.deepEqual(JSON.parse(JSON.stringify(d.gear.WeaponB1)), { statId: 1077, sigilId: 24618, weaponType: 'Scepter' });
  assert.equal(Object.keys(d.gear).length, 15);
  assert.equal(A.encode({ code: d.code, mode: d.mode, gear: d.gear, runeId: d.runeId, relicId: d.relicId }), code);
});

test('mínimo: solo el código del juego (sin equipo)', () => {
  const code = A.encode({ code: LINK });
  const d = A.decode(code);
  assert.equal(d.mode, 'PvE');
  assert.deepEqual(d.gear, {});
  assert.equal(Buffer.from(code.slice(4), 'base64').length, 3 + 44);
});

test('versión 2 (sin segundo sigilo) también se lee', () => {
  const link = GNBldCode.encodeBytes(GNBldCode.decode(LINK));
  const o = [2, 1 | 0x08, link.length, ...link];
  const mask = (1 << 0) | (1 << 6);
  o.push(mask & 255, mask >> 8, 0x35, 0x04, 0x35, 0x04); // estadísticas 1077 y 1077
  o.push(0x27, 0x60, 0, 0, 50, 0); // sigilo 24615 y mandoble
  const d = A.decode('AE2:' + Buffer.from(o).toString('base64'));
  assert.equal(d.mode, 'WvW');
  assert.equal(d.gear.WeaponA1.weaponType, 'Greatsword');
  assert.equal(d.gear.WeaponA1.sigilId, 24615);
});

test('errores claros y parse que nunca lanza', () => {
  for (const [t, c] of [['hola', 'E_CHARS'], ['AE2:Aw==', 'E_SHORT'], ['AE2:BQAA', 'E_VER'], ['AE2:' + 'A'.repeat(500), 'E_LONG']]) {
    const r = A.parse(t);
    assert.equal(r.ok, false, t.slice(0, 12));
    assert.equal(r.errorCode, c, t.slice(0, 12) + ' → ' + r.error);
  }
  const ok = A.parse(A.encode({ code: LINK, mode: 'WvW' }));
  assert.equal(ok.ok, true);
  assert.equal(ok.ae2.mode, 'WvW');
  assert.equal(ok.build.profession, 1);
});

test('ficha de equipo escapada y en castellano', () => {
  globalThis.GNBldShow = require('../js/bld-show.js');
  const d = A.decode(A.encode({ code: LINK, mode: 'Raid', gear: GEAR, runeId: 24836, relicId: 100916 }));
  const h = A.gearHTML(d, { stats: { 1077: 'Berserker <b>' }, items: { 24836: 'Runa del erudito' } });
  assert.match(h, /Casco<\/small> Berserker &lt;b&gt;/);
  assert.match(h, /Mandoble/);
  assert.match(h, /Runa del erudito/);
  assert.match(h, /#100916/);
  delete globalThis.GNBldShow;
});
