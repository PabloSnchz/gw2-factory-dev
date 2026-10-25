// Sonda temporal BL-070 ACT-0 (se borra después de RUN-054). Lee la API pública, sin Key.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const A = 'https://api.guildwars2.com';
const get = async (u) => { try { const r = await fetch(A + u); return { s: r.status, j: await r.json().catch(() => null) }; } catch (e) { return { s: 'ERR ' + e.message, j: null }; } };
const out = (k, v) => console.log('## ' + k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v)).slice(0, 900));

test('sonda ACT-0', async () => {
  const v2 = await get('/v2.json?v=latest');
  const routes = ((v2.j && v2.j.routes) || []).map((r) => r.path).filter((p) => /home|dailycraft|fractal|mapchest|worldboss|achievements\/daily|categories|wizard/.test(p));
  out('routes', routes);

  const dc = await get('/v2/dailycrafting');
  out('dailycrafting', dc);

  const hn = await get('/v2/home/nodes');
  const apiNodes = (hn.j || []).slice().sort();
  const th = fs.readFileSync(path.join(__dirname, '..', 'js', 'activities-theme.js'), 'utf8');
  const blk = th.slice(th.indexOf('var API_NODES = ['), th.indexOf('];', th.indexOf('var API_NODES = [')));
  const legacy = (blk.match(/'([a-z0-9_]+)'/g) || []).map((x) => x.slice(1, -1));
  const jan = (th.match(/\{ id: '([a-z0-9_]+)', name: '[^']+', type: '\w+', itemId: \d+ \}/g) || []).map((x) => x.match(/id: '([^']+)'/)[1]);
  out('home/nodes count', hn.s + ' ' + apiNodes.length);
  out('nodes en API y no en legado', apiNodes.filter((x) => legacy.indexOf(x) < 0 && jan.indexOf(x) < 0));
  out('nodes en legado y no en API', legacy.concat(jan).filter((x) => apiNodes.indexOf(x) < 0));

  const hc = await get('/v2/home/cats');
  out('home/cats count', hc.s + ' ' + (hc.j || []).length);

  const gl = await get('/v2/homestead/glyphs?ids=all&lang=es');
  out('glyphs', gl.s + ' n=' + (gl.j || []).length + ' slots=' + JSON.stringify([...new Set((gl.j || []).map((g) => g.slot))]) + ' ej=' + JSON.stringify((gl.j || []).slice(0, 2)));

  const dec = await get('/v2/homestead/decorations');
  out('decorations', dec.s + ' n=' + (dec.j || []).length);
  const cat = await get('/v2/homestead/decorations/categories?ids=all&lang=es');
  out('deco categories', cat.s + ' ' + JSON.stringify((cat.j || []).map((c) => c.id + ':' + c.name)));
  const d1 = await get('/v2/homestead/decorations?ids=' + ((dec.j || []).slice(0, 2).join(',')) + '&lang=es');
  out('deco ejemplo', d1);

  const c88 = await get('/v2/achievements/categories/88?lang=es&v=latest');
  out('cat 88', c88.s + ' ' + JSON.stringify(c88.j && { name: c88.j.name, n: (c88.j.achievements || []).length, tomorrow: c88.j.tomorrow && c88.j.tomorrow.length }));
  const ids88 = ((c88.j && c88.j.achievements) || []).map((a) => (typeof a === 'object' ? a.id : a)).slice(0, 30);
  if (ids88.length) { const a = await get('/v2/achievements?ids=' + ids88.join(',') + '&lang=es'); out('cat 88 nombres', (a.j || []).map((x) => x.id + ':' + x.name)); }
  out('cat 88 raw', c88.j && c88.j.achievements && c88.j.achievements.slice(0, 6));

  const items = await get('/v2/items?ids=46744,46742,46740,46745,43772,36708,96978,19980&lang=es');
  out('items ecto/llave/piedra', (items.j || []).map((x) => x.id + ':' + x.name));

  const ids = Object.values(JSON.parse('{' + (th.slice(th.indexOf('var API_NODE_ITEMS = {') + 22, th.indexOf('};', th.indexOf('var API_NODE_ITEMS = {'))).replace(/\/\/.*$/gm, '').replace(/'/g, '"').trim().replace(/,\s*$/, '')) + '}'));
  const all = [...new Set(ids.concat([104400, 104442, 104426, 104278, 104484, 104437, 96952, 101965, 103184, 105913]))];
  const it = await get('/v2/items?ids=' + all.join(',') + '&lang=es');
  const got = new Set((it.j || []).map((x) => x.id));
  out('items de nodos', 'pedidos ' + all.length + ' existen ' + got.size + ' faltan ' + JSON.stringify(all.filter((x) => !got.has(x))));
  out('items nodos tipos', [...new Set((it.j || []).map((x) => x.type))]);

  const mc = await get('/v2/mapchests');
  out('mapchests', mc);
});
