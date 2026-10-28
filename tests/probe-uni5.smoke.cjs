// BL-078 UNI-5: candidatos de ícono oficial para los 5 encuentros sin miniatura (voice_claw, fraenir,
// xunlai_jade_junkyard, kaineng_overlook, harvest_temple). Sonda de una sola vez por el canal de diagnóstico;
// no es parte de la suite (no termina en .test.cjs) y se borra al cerrar UNI-5.
'use strict';
const API = 'https://api.guildwars2.com';
const RE = /ankka|junkyard|xunlai|kaineng|minister li|harvest temple|dragonvoid|the void|fraenir|voice of the fallen|claw of the fallen|strike|soo-won|mai trin|icebrood|end of dragons/i;

async function get(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error(path + ' ' + r.status);
  return r.json();
}
const short = (u) => String(u || '').replace('https://render.guildwars2.com/file/', '');

(async () => {
  console.log('## categorías de logros');
  const cats = await get('/v2/achievements/categories?ids=all&lang=en');
  const hit = cats.filter((c) => RE.test(c.name));
  hit.forEach((c) => console.log(['cat', c.id, c.name, short(c.icon), (c.achievements || []).length].join('|')));

  console.log('## logros de esas categorías con ícono propio');
  const ids = [].concat(...hit.map((c) => c.achievements || [])).slice(0, 600);
  for (let i = 0; i < ids.length; i += 200) {
    const part = await get('/v2/achievements?lang=en&ids=' + ids.slice(i, i + 200).join(','));
    part.filter((a) => a.icon).forEach((a) => console.log(['ach', a.id, a.name, short(a.icon)].join('|')));
  }

  console.log('## minis por nombre');
  const mids = await get('/v2/minis');
  for (let i = 0; i < mids.length; i += 200) {
    const part = await get('/v2/minis?lang=en&ids=' + mids.slice(i, i + 200).join(','));
    part.filter((m) => RE.test(m.name)).forEach((m) => console.log(['mini', m.id, m.item_id, m.name, short(m.icon)].join('|')));
  }

  console.log('## cofres de los encuentros');
  const items = await get('/v2/items?lang=en&ids=95982,96638,97451,96419,97132,106909,95638');
  items.forEach((it) => console.log(['item', it.id, it.name, short(it.icon)].join('|')));
})().catch((e) => { console.log('ERROR', e && e.message); });
