// BL-084 EQ-2 sonda (borrar después): forma real de /v2/items, /v2/itemstats y /v2/pvp/amulets en castellano
// para los ids de assets/data/builds/gear.json, y si todos existen.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const API = 'https://api.guildwars2.com';
const G = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'assets', 'data', 'builds', 'gear.json'), 'utf8')).gear;

async function get(url) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url);
    if (r.ok || r.status === 206) return r.json();
    await new Promise((ok) => setTimeout(ok, 3000));
  }
  return [];
}
async function many(p, ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 150) out.push(...await get(API + p + '?lang=es&ids=' + ids.slice(i, i + 150).join(',')));
  return out;
}
const short = (o) => JSON.stringify(o).slice(0, 1400);

test('EQ-2 forma de la API', { timeout: 240000 }, async () => {
  const items = new Set(), stats = new Set(), amus = new Set();
  Object.values(G).forEach((g) => {
    (g.armor || []).forEach((a) => { items.add(a[0]); if (a[1]) stats.add(a[1]); if (a[2]) items.add(a[2]); });
    (g.trinkets || []).forEach((a) => { items.add(a[0]); if (a[1]) stats.add(a[1]); });
    (g.weapons || []).forEach((w) => { items.add(w[2]); if (w[3]) stats.add(w[3]); (w[4] || []).forEach((s) => items.add(s)); });
    ['rune', 'relic', 'food', 'utility', 'jade', 'enrich'].forEach((k) => { if (g[k]) items.add(g[k]); });
    if (g.infusion) items.add(g.infusion[0]);
    if (g.amulet) amus.add(g.amulet);
  });
  console.log('ids: items', items.size, 'stats', stats.size, 'amuletos', amus.size);
  const I = await many('/v2/items', [...items]);
  const S = await many('/v2/itemstats', [...stats]);
  const A = await many('/v2/pvp/amulets', [...amus]);
  const got = new Set(I.map((x) => x.id)), gs = new Set(S.map((x) => x.id)), ga = new Set(A.map((x) => x.id));
  console.log('FALTAN items:', [...items].filter((x) => !got.has(x)).join(',') || 'ninguno');
  console.log('FALTAN stats:', [...stats].filter((x) => !gs.has(x)).join(',') || 'ninguno');
  console.log('FALTAN amuletos:', [...amus].filter((x) => !ga.has(x)).join(',') || 'ninguno');
  const byType = {};
  I.forEach((x) => { const k = x.type + '/' + ((x.details && x.details.type) || '-'); (byType[k] = byType[k] || []).push(x); });
  Object.keys(byType).sort().forEach((k) => {
    console.log('==== ' + k + ' (' + byType[k].length + ')');
    byType[k].slice(0, 2).forEach((x) => console.log(short(x)));
  });
  console.log('==== itemstats');
  S.slice(0, 3).forEach((x) => console.log(short(x)));
  console.log('nombres stats: ' + S.map((x) => x.id + '=' + x.name).join(' | '));
  console.log('==== amuletos');
  A.slice(0, 3).forEach((x) => console.log(short(x)));
  console.log('nombres amuletos: ' + A.map((x) => x.id + '=' + x.name).join(' | '));
  const attrs = new Set();
  S.forEach((s) => (s.attributes || []).forEach((a) => attrs.add(a.attribute)));
  A.forEach((a) => Object.keys(a.attributes || {}).forEach((k) => attrs.add(k)));
  console.log('atributos: ' + [...attrs].join(','));
  const sizes = { items: JSON.stringify(I).length, stats: JSON.stringify(S).length, amus: JSON.stringify(A).length };
  console.log('tamaños JSON: ' + JSON.stringify(sizes));
});
