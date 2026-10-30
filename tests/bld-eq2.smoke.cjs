// BL-084 EQ-2 sonda 3 (borrar después): js/bld-items.js contra la API real, con el gear.json del repo.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const X = require('../js/bld-items.js');
const ROOT = path.join(__dirname, '..');
const GEAR = fs.readFileSync(path.join(ROOT, 'assets', 'data', 'builds', 'gear.json'), 'utf8');

const f = (url, o) => (url === X.GEAR ? Promise.resolve({ ok: true, status: 200, json: async () => JSON.parse(GEAR) }) : fetch(url, o));
const calls = [];
const counted = (url, o) => { calls.push(url); return f(url, o); };

function show(id, v) {
  const L = [];
  L.push('#### ' + id + (v.pvp ? ' (PvP)' : ''));
  v.armor.forEach((r) => L.push('  ' + r.slot + ': ' + r.item.name + ' · ' + (r.stat && r.stat.name) + (r.rune ? ' · ' + r.rune.name : '')));
  if (v.rune) L.push('  Runa: ' + v.rune.name + ' | ' + (v.rune.bonuses || []).join(' / '));
  v.trinkets.forEach((r) => L.push('  ' + r.slot + ': ' + r.item.name + ' · ' + (r.stat && r.stat.name)));
  if (v.amulet) L.push('  Amuleto: ' + v.amulet.name + ' | ' + v.amulet.attrs.map((a) => X.attrName(a[0]) + ' ' + a[1]).join(', '));
  if (v.relic) L.push('  Reliquia: ' + v.relic.name + ' | ' + (v.relic.desc || '').slice(0, 120));
  v.sets.forEach((s) => s.hands.forEach((h) => L.push('  ' + s.label + ' · ' + h.handLabel + ': ' + h.type + ' — ' + h.item.name + ' · ' + (h.stat ? h.stat.name : '-') +
    ' · ' + h.sigils.map((x) => x.name + ' [' + (x.buff || '').replace(/\n/g, ' / ').slice(0, 60) + ']').join(' + '))));
  v.extras.forEach((x) => L.push('  ' + x.label + ': ' + x.item.name + (x.count ? ' ×' + x.count : '') + ' | ' + (x.item.effect || x.item.buff || x.item.desc || '').replace(/\n/g, ' / ').slice(0, 100)));
  L.push('  Resumen: ' + v.stats.map((s) => s.stat.name + ' ×' + s.pieces).join(', '));
  return L.join('\n');
}

test('EQ-2 sonda 3: las 96 fichas con la API real', { timeout: 240000 }, async () => {
  const all = Object.keys(JSON.parse(GEAR).gear);
  const missing = [];
  for (const id of all) {
    const { view: v } = await X.load(id, { fetch: counted });
    const bad = [];
    const chk = (x, w) => { if (x && x.missing) bad.push(w + ' #' + x.id); };
    v.armor.forEach((r) => { chk(r.item, r.slot); chk(r.stat, r.slot + ' stat'); });
    v.trinkets.forEach((r) => { chk(r.item, r.slot); chk(r.stat, r.slot + ' stat'); });
    v.sets.forEach((s) => s.hands.forEach((h) => { chk(h.item, 'arma'); chk(h.stat, 'arma stat'); h.sigils.forEach((x) => chk(x, 'sigilo')); }));
    chk(v.relic, 'reliquia'); chk(v.rune, 'runa'); chk(v.amulet, 'amuleto');
    v.extras.forEach((x) => chk(x.item, x.label));
    if (bad.length) missing.push(id + ': ' + bad.join(', '));
  }
  console.log('builds: ' + all.length + ' · pedidos a la API: ' + calls.filter((u) => u.startsWith('https://')).length);
  console.log('SIN RESOLVER: ' + (missing.length ? '\n' + missing.join('\n') : 'ninguna'));
  for (const id of ['sc-raids-guardian-power-dragonhunter-radiance-spear-greatsword', 'sc-pvp-guardian-power-dragonhunter-longbow-sword-shield',
    'sc-wvw-elementalist-power-catalyst', 'sc-raids-mesmer-heal-quickness-troubadour-rifle-only']) {
    const { view } = await X.load(id, { fetch: counted });
    console.log(show(id, view));
  }
  const S = JSON.stringify(X._test ? {} : {});
  assert.equal(missing.length, 0);
  void S;
});
