// BL-084 EQ-2 sonda 2 (borrar después): mejoras, reliquias, consumibles, núcleo, enriquecimiento e infusiones; y la 1967.
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
    console.log('respuesta ' + r.status + ' ' + url.slice(0, 120));
    await new Promise((ok) => setTimeout(ok, 3000));
  }
  return [];
}
async function many(p, ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 150) out.push(...await get(API + p + '?lang=es&ids=' + ids.slice(i, i + 150).join(',')));
  return out;
}
const cut = (o, n) => JSON.stringify(o).slice(0, n);

test('EQ-2 sonda 2', { timeout: 240000 }, async () => {
  const items = new Set();
  Object.values(G).forEach((g) => {
    (g.armor || []).forEach((a) => { if (a[2]) items.add(a[2]); });
    (g.weapons || []).forEach((w) => (w[4] || []).forEach((s) => items.add(s)));
    ['rune', 'relic', 'food', 'utility', 'jade', 'enrich'].forEach((k) => { if (g[k]) items.add(g[k]); });
    if (g.infusion) items.add(g.infusion[0]);
  });
  const I = await many('/v2/items', [...items]);
  const byType = {};
  I.forEach((x) => { const d = x.details || {}; const k = x.type + '/' + (d.type || '-') + '/' + (d.flags || []).join('+').slice(0, 40); (byType[k] = byType[k] || []).push(x); });
  Object.keys(byType).sort().forEach((k) => {
    console.log('==== ' + k + ' (' + byType[k].length + ')');
    byType[k].slice(0, 2).forEach((x) => {
      const o = Object.assign({}, x); delete o.chat_link; delete o.game_types; delete o.vendor_value; delete o.restrictions;
      console.log(cut(o, 900));
    });
  });
  // La 1967 no está en /v2/itemstats: ¿qué dice el objeto que la usa?
  const odd = Object.entries(G).filter(([, g]) => (g.armor || []).some((a) => a[1] === 1967)).map(([id]) => id);
  console.log('builds con 1967: ' + odd.join(', '));
  const x = await get(API + '/v2/items?lang=es&ids=95626,97161');
  x.forEach((it) => console.log('objeto ' + it.id + ' ' + it.name + ' ' + it.rarity + ' ' + cut(it.details, 600)));
  const s = await get(API + '/v2/itemstats/1967?lang=es');
  console.log('itemstats/1967: ' + cut(s, 300));
  const s2 = await get(API + '/v2/itemstats?lang=es&ids=1966,1967,1968,1969,1697');
  console.log('vecinas: ' + cut(s2, 900));
});
