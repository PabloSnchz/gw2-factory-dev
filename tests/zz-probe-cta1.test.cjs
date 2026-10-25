'use strict';
// Sonda temporal CTA-1 (BL-070 paso 4). Se borra después de leer OUT-074.
const test = require('node:test');
const A = 'https://api.guildwars2.com';
const R = 'https://render.guildwars2.com/file/';
async function get(p) {
  const r = await fetch(A + p);
  let j = null; try { j = await r.json(); } catch (_) {}
  return { s: r.status, j };
}
test('sonda: categorías de logros', async () => {
  const c = await get('/v2/achievements/categories?ids=all&lang=es');
  console.log('CATS', c.s, (c.j || []).length);
  (c.j || []).forEach(x => console.log('C|' + x.id + '|' + x.name + '|' + String(x.icon).replace(R, '')));
});
test('sonda: comandante, maestrías, armería', async () => {
  const it = await get('/v2/items?ids=67335,22335,70314&lang=es');
  (it.j || []).forEach(x => console.log('I|' + x.id + '|' + x.name + '|' + String(x.icon).replace(R, '')));
  const m = await get('/v2/masteries?ids=all&lang=es');
  (m.j || []).forEach(x => console.log('M|' + x.id + '|' + x.region + '|' + x.name + '|' + String((x.levels && x.levels[0] && x.levels[0].icon) || '').replace(R, '') + '|' + String(x.background || '').replace(R, '')));
  const la = await get('/v2/legendaryarmory');
  console.log('LEG-ARMORY', la.s, Array.isArray(la.j) ? la.j.length : 0);
  const wr = await get('/v2/wvw/ranks');
  console.log('WVW-RANKS', wr.s, Array.isArray(wr.j) ? wr.j.length : 0);
});
