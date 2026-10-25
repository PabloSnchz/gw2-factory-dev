// Sonda temporal BL-070 ACT-1 (se borra después de RUN-055). API pública, sin Key.
'use strict';
const test = require('node:test');
const A = 'https://api.guildwars2.com';
const get = async (u) => { try { const r = await fetch(A + u); return { s: r.status, j: await r.json().catch(() => null) }; } catch (e) { return { s: 'ERR', j: null }; } };
const out = (k, v) => console.log('## ' + k + ': ' + String(typeof v === 'string' ? v : JSON.stringify(v)).slice(0, 1400));

test('sonda ACT-1', async () => {
  const c = await get('/v2/achievements/categories/88?v=latest');
  const today = (c.j && c.j.achievements) || [], tom = (c.j && c.j.tomorrow) || [];
  out('cat88 today raw', today.slice(0, 3));
  const ids = [...new Set(today.concat(tom).map((a) => a.id))];
  const es = await get('/v2/achievements?ids=' + ids.join(',') + '&lang=es');
  const en = await get('/v2/achievements?ids=' + ids.join(',') + '&lang=en');
  const mapEn = {}; (en.j || []).forEach((a) => { mapEn[a.id] = a.name; });
  out('today', today.map((a) => a.id + '|' + ((es.j || []).find((x) => x.id === a.id) || {}).name + '|' + mapEn[a.id]));
  out('tomorrow', tom.map((a) => a.id + '|' + ((es.j || []).find((x) => x.id === a.id) || {}).name));
  const one = (en.j || [])[0];
  out('ach sample', one && { id: one.id, type: one.type, flags: one.flags, tiers: one.tiers, bits: one.bits, req: one.requirement, rewards: one.rewards });

  const cur = await get('/v2/currencies?ids=all&lang=en');
  const ces = await get('/v2/currencies?ids=all&lang=es');
  const esN = {}; (ces.j || []).forEach((x) => { esN[x.id] = x.name; });
  out('currencies', (cur.j || []).filter((x) => /coin|shard|favor|karma|gold|magnetite|prophet/i.test(x.name)).map((x) => x.id + ':' + x.name + '=' + esN[x.id]));

  const cm = await get('/v2/achievements?ids=9423,9412,9373,9388&lang=en');
  out('cm', (cm.j || []).map((a) => a.id + '|' + a.name + '|' + (a.requirement || '').slice(0, 80) + '|' + JSON.stringify(a.flags)));
  const cats = await get('/v2/achievements/categories?ids=all');
  const has = (cats.j || []).filter((k) => (k.achievements || []).some((x) => [9423, 9412, 9373, 9388].includes(typeof x === 'object' ? x.id : x))).map((k) => k.id + ':' + k.name);
  out('cm en categorías', has);

  const dc = await get('/v2/dailycrafting');
  const it = await get('/v2/items?ids=46744,46742,46740,46745,43772&lang=es');
  out('dailycrafting', { ids: dc.j, items: (it.j || []).map((x) => x.id + ':' + x.name + ':' + x.rarity + ':' + x.icon) });
  const cats2 = await get('/v2/home/cats?ids=all');
  out('cats sample', (cats2.j || []).slice(0, 3));
  const hs = await get('/v2/homestead');
  out('homestead root', hs);
});
