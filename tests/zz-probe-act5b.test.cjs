// Sonda temporal ACT-5 (BL-070), parte B: nombres en español e íconos. Se borra después de leer.
'use strict';
const test = require('node:test');
const ITEMS = [81853, 81852, 78468, 68091, 73798, 68495, 67842, 67290, 78019, 66769, 44884, 87324, 79217, 92035, 86297, 48804, 93686, 78549,
  87132, 89786, 68090, 67234, 92361, 78582, 79063, 86786, 91777, 68093, 79085, 79260, 80450, 79646, 87889, 48875, 68096, 90773, 88828, 68098,
  68089, 68094, 81696, 68095, 79898, 68097, 81115, 94286, 43902, 93503, 68092, 49825, 79903, 68367, 91060, 81594, 92427, 88979,
  104400, 104442, 104426, 104278, 104484, 104437, 96952, 101965, 103184, 105913];
test('sonda B', async () => {
  const r = await fetch('https://api.guildwars2.com/v2/items?lang=es&ids=' + ITEMS.join(','));
  const it = r.ok ? await r.json() : [];
  console.log('ES ' + it.length + '\n' + it.map((x) => x.id + '|' + x.name + '|' + String(x.icon || '').replace('https://render.guildwars2.com/file/', '')).join('\n'));
});
