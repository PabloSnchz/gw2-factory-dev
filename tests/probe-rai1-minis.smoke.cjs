// Sonda temporal de BL-070 RAI-1 (no la corre app-checks; la pide factory-diagnose).
// Miniaturas oficiales de los jefes de raids y encuentros (/v2/minis), en inglés y español.
// Solo lectura, sin claves. Se borra al terminar RAI-1.
'use strict';
const API = 'https://api.guildwars2.com';
const RE = new RegExp([
  'Vale Guardian', 'Gorseval', 'Sabetha', 'Sloth', 'Slubling', 'Berg', 'Zane', 'Narella', 'Matthias', 'Keep Construct',
  'Xera', 'Cairn', 'Mursaat', 'Samarog', 'Deimos', 'Soulless', 'Desmina', 'Dhuum', 'Amalgamate', 'Nikare', 'Kenut',
  'Qadim', 'Adina', 'Sabir', 'Greer', 'Decima', 'Ura\\b', 'Rot Strider', 'Glenna', 'Broken King', 'Eater of Souls',
  'Eye of', 'Kela', 'Vloxx', 'Icebrood', 'Fraenir', 'Boneskinner', 'Whisper', 'Voice of', 'Claw of', 'Mai Trin',
  'Ankka', 'Minister Li', 'Dragonvoid', 'Void', 'Dagda', 'Cerus', 'Assault Knight', 'Scarlet', 'Kodan', 'Aetherblade',
  'Jade', 'Harvest', 'Febe', 'Kanaxai', 'Sooz', 'Lion', 'Knight', 'Prototype', 'Wraith', 'Gwyllian', 'Seneschal',
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
  const en = await minis('en');
  const es = Object.fromEntries((await minis('es')).map((m) => [m.id, m.name]));
  console.log('total minis: ' + en.length);
  en.filter((m) => RE.test(m.name)).forEach((m) => {
    const icon = String(m.icon || '').replace('https://render.guildwars2.com/file/', '');
    console.log(m.id + '|' + m.item_id + '|' + m.name + '|' + (es[m.id] || '') + '|' + icon);
  });
})();
