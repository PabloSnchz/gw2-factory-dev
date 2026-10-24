// Sonda temporal de BL-070 RAI-1 (no la corre app-checks; la pide factory-diagnose).
// Segunda pasada: miniaturas candidatas para los encuentros que hoy no tienen ícono
// y cuál de las dos monedas «Gaeting Crystal» es la actual. Solo lectura, sin claves.
'use strict';
const API = 'https://api.guildwars2.com';
const RE = new RegExp([
  'McLeod', 'Zommoros', 'Djinn', 'Key of Ahdashim', 'White Mantle', 'Ankka', 'Minister', '\\bLi\\b', 'Soo-Won',
  'Dragonvoid', 'Raven', 'Fraenir', 'Claw', 'Voice', 'Ryland', 'Steel', 'Varinia', 'Kernan', 'Karde', 'Knuckles',
  'Red Guardian', 'Blue Guardian', 'Green Guardian', 'Titan', 'Decima', '\\bUra\\b', 'Greerling', 'Ereg', '\\bGree\\b',
  'Reeg', 'Jormag', 'Aspect', 'Glenna', 'Spirit', 'Bandit', 'Prisoner', 'Statue', 'Largos', 'Amalgam', 'Saul',
  'Deimos', 'Horror', 'Gate', 'Conduit', 'Kryptis', 'Seer', 'Inquest',
].join('|'), 'i');

async function get(p) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(API + p, { signal: AbortSignal.timeout(20000) });
      if (r.ok) return r.json();
      console.log('HTTP', r.status, p);
    } catch (e) { console.log('ERR', e.message, p); }
    await new Promise((s) => setTimeout(s, 1500));
  }
  return null;
}

async function minis(lang) {
  const ids = (await get('/v2/minis')) || [];
  const out = [];
  for (let i = 0; i < ids.length; i += 200) {
    const part = await get('/v2/minis?lang=' + lang + '&ids=' + ids.slice(i, i + 200).join(','));
    if (Array.isArray(part)) out.push(...part);
  }
  return out;
}

(async () => {
  console.log('## monedas 39 y 77');
  for (const lang of ['en', 'es']) {
    const c = (await get('/v2/currencies?lang=' + lang + '&ids=39,77')) || [];
    c.forEach((x) => console.log(lang + ' ' + x.id + ' | order ' + x.order + ' | ' + x.name + ' | ' + String(x.description || '').slice(0, 160)));
  }
  console.log('\n## minis');
  const en = await minis('en');
  const es = Object.fromEntries((await minis('es')).map((m) => [m.id, m.name]));
  en.filter((m) => RE.test(m.name)).forEach((m) => {
    const icon = String(m.icon || '').replace('https://render.guildwars2.com/file/', '');
    console.log(m.id + '|' + m.item_id + '|' + m.name + '|' + (es[m.id] || '') + '|' + icon);
  });
})();
