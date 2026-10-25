// Sonda temporal INV-1 (BL-070): nombres en español e inglés de los materiales T1 a T6 de los sets del Multicuenta,
// para corregir los 4 cruces que encontró RUN-041. Nunca falla; se borra después de leer su salida.
'use strict';
const test = require('node:test');
const API = 'https://api.guildwars2.com';
async function j(u) { const r = await fetch(API + u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }

test('sonda inv1', async () => {
  try {
    const ids = [];
    for (let i = 24272; i <= 24301; i++) ids.push(i);
    for (let i = 24340; i <= 24365; i++) ids.push(i);
    const es = await j('/v2/items?lang=es&ids=' + ids.join(','));
    const en = await j('/v2/items?lang=en&ids=' + ids.join(','));
    const enBy = new Map(en.map((x) => [x.id, x]));
    es.sort((a, b) => a.id - b.id).forEach((x) => {
      const e = enBy.get(x.id) || {};
      console.log('ITEM', x.id, '|', x.name, '|', e.name, '|', x.rarity, '|', x.type, '|', (x.details && x.details.type) || '');
    });
    const mats = await j('/v2/materials?ids=all&lang=es');
    const fine = mats.find((c) => c.id === 6);
    const t = ids.filter((id) => !fine.items.includes(id) && !mats.some((c) => c.items.includes(id)));
    console.log('NOT-IN-STORAGE', t.join(','));
  } catch (e) { console.log('ERROR', e.message); }
});
