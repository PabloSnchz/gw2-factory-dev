// Sonda temporal ACT-6 (BL-070): se borra después de leer OUT. Imprime, no comprueba.
'use strict';
const test = require('node:test');
async function get(u) {
  const r = await fetch('https://api.guildwars2.com' + u);
  const h = {}; ['x-page-total', 'x-result-total', 'x-page-size'].forEach((k) => { h[k] = r.headers.get(k); });
  return { status: r.status, h, body: r.ok ? await r.json() : await r.text() };
}
test('sonda: glifos', async () => {
  const g = await get('/v2/homestead/glyphs?ids=all');
  console.log('GLYPHS ' + g.status + ' ' + (Array.isArray(g.body) ? g.body.length : '') + '\n' + JSON.stringify(g.body).slice(0, 600));
  if (Array.isArray(g.body)) {
    const slots = {}; g.body.forEach((x) => { slots[x.slot] = (slots[x.slot] || 0) + 1; });
    console.log('SLOTS ' + JSON.stringify(slots));
    const ids = [...new Set(g.body.map((x) => x.item_id))];
    const it = await get('/v2/items?lang=es&ids=' + ids.join(','));
    console.log('GLYPH-ITEMS ' + (Array.isArray(it.body) ? it.body.length : it.status) + '\n' +
      (Array.isArray(it.body) ? it.body.map((x) => x.id + '|' + x.name + '|' + x.rarity + '|' + String(x.icon).replace('https://render.guildwars2.com/file/', '') + '|' + String(x.description || '').replace(/\n/g, ' ').slice(0, 140)).join('\n') : ''));
    console.log('GLYPH-MAP\n' + g.body.map((x) => x.id + '|' + x.slot + '|' + x.item_id).join('\n'));
  }
});
test('sonda: decoraciones', async () => {
  const c = await get('/v2/homestead/decorations/categories?ids=all&lang=es');
  console.log('CATS ' + c.status + ' ' + JSON.stringify(c.body));
  const d0 = await get('/v2/homestead/decorations');
  console.log('DEC-IDS ' + d0.status + ' n=' + (Array.isArray(d0.body) ? d0.body.length : '?'));
  const p = await get('/v2/homestead/decorations?page=0&page_size=200&lang=es');
  console.log('DEC-PAGE ' + p.status + ' ' + JSON.stringify(p.h) + '\n' + JSON.stringify(p.body).slice(0, 900));
  const all = await get('/v2/homestead/decorations?ids=all&lang=es');
  console.log('DEC-ALL ' + all.status + ' ' + (Array.isArray(all.body) ? all.body.length + ' bytes=' + JSON.stringify(all.body).length : String(all.body).slice(0, 200)));
  if (Array.isArray(all.body)) {
    const keys = {}; all.body.forEach((x) => Object.keys(x).forEach((k) => { keys[k] = (keys[k] || 0) + 1; }));
    console.log('DEC-KEYS ' + JSON.stringify(keys));
    const per = {}; all.body.forEach((x) => (x.categories || []).forEach((k) => { per[k] = (per[k] || 0) + 1; }));
    console.log('DEC-PER-CAT ' + JSON.stringify(per));
    console.log('MAXCOUNT ' + JSON.stringify([...new Set(all.body.map((x) => x.max_count))]));
    console.log('NOCAT ' + all.body.filter((x) => !(x.categories || []).length).length);
  }
  const acct = await get('/v2/account/homestead/decorations');
  console.log('ACCT-DEC ' + acct.status + ' ' + String(JSON.stringify(acct.body)).slice(0, 200));
  const ag = await get('/v2/account/homestead/glyphs');
  console.log('ACCT-GLY ' + ag.status + ' ' + String(JSON.stringify(ag.body)).slice(0, 200));
});
