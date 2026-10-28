// BL-078 UNI-5: candidatos de ícono oficial para los 5 encuentros sin miniatura (voice_claw, fraenir,
// xunlai_jade_junkyard, kaineng_overlook, harvest_temple). Sonda 2: no hay minis (RUN-174); busco logros e
// ítems con el nombre del jefe o del encuentro. No es parte de la suite y se borra al cerrar UNI-5.
'use strict';
const API = 'https://api.guildwars2.com';
const RE = /ankka|minister li|dragonvoid|fraenir|claw of the fallen|voice of the fallen|soo-won|junkyard|kaineng overlook|harvest temple/i;

async function get(path) {
  for (let t = 0; t < 3; t++) {
    try { const r = await fetch(API + path); if (r.ok) return r.json(); } catch (e) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return [];
}
const short = (u) => String(u || '').replace('https://render.guildwars2.com/file/', '');
async function scan(kind, list, each) {
  const pages = [];
  for (let i = 0; i < list.length; i += 200) pages.push(list.slice(i, i + 200));
  for (let i = 0; i < pages.length; i += 8) {
    const got = await Promise.all(pages.slice(i, i + 8).map((p) => get('/v2/' + kind + '?lang=en&ids=' + p.join(','))));
    got.forEach((arr) => (Array.isArray(arr) ? arr : []).forEach(each));
  }
}

(async () => {
  console.log('## categorías de raids y encuentros');
  const cats = await get('/v2/achievements/categories?ids=all&lang=en');
  cats.filter((c) => /raid|encounter|strike/i.test(c.name)).forEach((c) => console.log(['cat', c.id, c.name, short(c.icon)].join('|')));

  console.log('## logros con el nombre');
  let n = 0;
  await scan('achievements', await get('/v2/achievements'), (a) => {
    if (RE.test(a.name) && n++ < 60) console.log(['ach', a.id, a.name, short(a.icon) || '-'].join('|'));
  });

  console.log('## ítems con el nombre (no armas ni armaduras)');
  let k = 0;
  await scan('items', await get('/v2/items'), (it) => {
    if (RE.test(it.name) && !/^(Weapon|Armor)$/.test(it.type) && k++ < 80) console.log(['item', it.id, it.type, it.name, short(it.icon)].join('|'));
  });
  console.log('fin', n, k);
})().catch((e) => { console.log('ERROR', e && e.message); });
