'use strict';
// Sonda temporal CTA-1 (BL-070 paso 4). Se borra después de leer OUT-073.
const test = require('node:test');
const A = 'https://api.guildwars2.com';
async function get(p) {
  const r = await fetch(A + p);
  let j = null; try { j = await r.json(); } catch (_) {}
  return { s: r.status, j };
}
test('sonda: files', async () => {
  const r = await get('/v2/files?ids=all');
  console.log('FILES', r.s, Array.isArray(r.j) ? r.j.length : 0);
  (r.j || []).forEach(f => console.log('F|' + f.id + '|' + String(f.icon).replace('https://render.guildwars2.com/file/', '')));
});
test('sonda: rangos y maestrías', async () => {
  const p = await get('/v2/pvp/ranks?ids=all');
  console.log('PVP', p.s, (p.j || []).length);
  (p.j || []).forEach(x => console.log('P|' + x.id + '|' + x.name + '|' + x.min_rank + '|' + x.max_rank + '|' + String(x.icon).replace('https://render.guildwars2.com/file/', '')));
  const w = await get('/v2/wvw/ranks?page=0&page_size=5&lang=es');
  console.log('WVW', w.s, JSON.stringify(w.j).slice(0, 600));
  const m = await get('/v2/masteries?ids=all&lang=es');
  const regions = {};
  (m.j || []).forEach(x => { regions[x.region] = (regions[x.region] || 0) + 1; });
  console.log('MASTERY-REGIONS', m.s, JSON.stringify(regions));
  const g = await get('/v2/guild/116E0C0E-0035-44A9-BB22-4AE3E23127E5');
  console.log('GUILD-PUBLIC', g.s, JSON.stringify(g.j).slice(0, 300));
  const t = await get('/v2/tokeninfo');
  console.log('TOKENINFO-NOKEY', t.s);
  const ach = await get('/v2/achievements?ids=1840,910,2258,3812&lang=es');
  console.log('ACH', ach.s, JSON.stringify((ach.j || []).map(a => ({ id: a.id, flags: a.flags, tiers: a.tiers, point_cap: a.point_cap }))));
});
