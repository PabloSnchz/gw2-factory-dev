// Sonda temporal ACT-5 (BL-070), parte A: nodos, gatos y nombres en inglés. Se borra después de leer.
'use strict';
const test = require('node:test');
const ITEMS = [81853, 81852, 78468, 68091, 73798, 68495, 67842, 67290, 78019, 66769, 44884, 87324, 79217, 92035, 86297, 48804, 93686, 78549,
  87132, 89786, 68090, 67234, 92361, 78582, 79063, 86786, 91777, 68093, 79085, 79260, 80450, 79646, 87889, 48875, 68096, 90773, 88828, 68098,
  68089, 68094, 81696, 68095, 79898, 68097, 81115, 94286, 43902, 93503, 68092, 49825, 79903, 68367, 91060, 81594, 92427, 88979,
  104400, 104442, 104426, 104278, 104484, 104437, 96952, 101965, 103184, 105913];
async function get(u) { const r = await fetch('https://api.guildwars2.com' + u); return r.ok ? r.json() : 'HTTP ' + r.status; }
test('sonda A', async () => {
  const n = await get('/v2/home/nodes?ids=all');
  console.log('NODES ' + (Array.isArray(n) ? n.length + ' ' + n.map((x) => x.id).join(',') : n));
  const es = await get('/v2/home/cats?ids=all&lang=es'), en = await get('/v2/home/cats?ids=all&lang=en');
  const enBy = {}; (Array.isArray(en) ? en : []).forEach((c) => { enBy[c.id] = c.hint; });
  console.log('CATS ' + (Array.isArray(es) ? es.length + '\n' + es.map((c) => c.id + '|' + c.hint + '|' + enBy[c.id]).join('\n') : es));
  const it = await get('/v2/items?lang=en&ids=' + ITEMS.join(','));
  console.log('EN ' + (Array.isArray(it) ? it.length + '\n' + it.map((x) => x.id + '|' + x.name).join('\n') : it));
});
