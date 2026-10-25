// Sonda temporal INV-5 (BL-070): nombres en español de las profesiones y de las especializaciones de élite,
// con sus íconos, y si los íconos locales de profesión existen. Nunca falla; se borra después de leer su salida.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const API = 'https://api.guildwars2.com';
async function j(u) { const r = await fetch(API + u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }

test('sonda inv5', async () => {
  try {
    const pro = await j('/v2/professions?ids=all&lang=es&v=2019-12-19T00:00:00.000Z');
    pro.forEach((p) => console.log('PROF', p.id, '|', p.name, '|', p.icon_big || p.icon, '|', p.code));
    const sp = await j('/v2/specializations?ids=all&lang=es');
    sp.filter((s) => s.elite).sort((a, b) => a.id - b.id).forEach((s) => console.log('ELITE', s.id, '|', s.profession, '|', s.name, '|', s.profession_icon || '', '|', s.icon));
    const dir = path.join(__dirname, '..', 'assets', 'icons', 'professions');
    console.log('LOCAL', fs.existsSync(dir) ? fs.readdirSync(dir).join(',') : 'no existe');
    const races = await j('/v2/races?ids=all&lang=es');
    console.log('RACES', JSON.stringify(races.map((r) => [r.id, r.name])));
  } catch (e) { console.log('ERROR', e.message); }
});
