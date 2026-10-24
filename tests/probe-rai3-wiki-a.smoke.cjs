// Sonda temporal de BL-070 RAI-3 (no la corre app-checks; la pide factory-diagnose).
// Recompensas de cada encuentro de raids desde la wiki oficial (API de MediaWiki):
// sección de recompensas de la página del encuentro y contenido de su cofre.
// Solo lectura, sin claves. Se borra al terminar RAI-3.
'use strict';
const WIKI = 'https://wiki.guildwars2.com/api.php';
const PAGES = [
  ['vale_guardian', 'Vale Guardian'], ['spirit_woods', 'Spirit Woods'], ['gorseval', 'Gorseval the Multifarious'],
  ['sabetha', 'Sabetha the Saboteur'], ['slothasor', 'Slothasor'], ['bandit_trio', 'Bandit Trio'],
  ['matthias', 'Matthias Gabrel'], ['escort', 'Escort'], ['keep_construct', 'Keep Construct'],
  ['twisted_castle', 'Twisted Castle'], ['xera', 'Xera'], ['cairn', 'Cairn the Indomitable'],
  ['mursaat_overseer', 'Mursaat Overseer'], ['samarog', 'Samarog'], ['deimos', 'Deimos'],
  ['soulless_horror', 'Soulless Horror'], ['river_of_souls', 'River of Souls'], ['statues_of_grenth', 'Statues of Grenth'],
  ['voice_in_the_void', 'Dhuum'], ['conjured_amalgamate', 'Conjured Amalgamate'], ['twin_largos', 'Twin Largos'],
  ['qadim', 'Qadim'], ['gate', 'Gate'], ['adina', 'Cardinal Adina'], ['sabir', 'Cardinal Sabir'],
  ['qadim_the_peerless', 'Qadim the Peerless'], ['camp', 'Mount Balrior'], ['greer', 'Greer, the Blightbringer'],
  ['decima', 'Decima, the Stormsinger'], ['ura', 'Ura, the Steamshrieker'], ['old_lions_court', "Old Lion's Court"],
  ['shiverpeaks_pass', 'Shiverpeaks Pass'], ['voice_claw', 'Voice of the Fallen and Claw of the Fallen'],
  ['fraenir', 'Fraenir of Jormag'], ['boneskinner', 'Boneskinner'], ['whisper_of_jormag', 'Whisper of Jormag'],
  ['forging_steel', 'Forging Steel'], ['cold_war', 'Cold War'], ['aetherblade_hideout', 'Aetherblade Hideout'],
  ['xunlai_jade_junkyard', 'Xunlai Jade Junkyard'], ['kaineng_overlook', 'Kaineng Overlook'],
  ['harvest_temple', 'Harvest Temple'], ['cosmic_observatory', 'Cosmic Observatory'], ['temple_of_febe', 'Temple of Febe'],
  ['guardians_glade', "Guardian's Glade"], ['nexus_of_eternity', 'Nexus of Eternity'],
];
const ONLY = (process.env.RAI3_ONLY || '').split(',').filter(Boolean);
// Dos sondas con el mismo código para no pasar el tamaño de salida: -a = alas, -b = encuentros.
const PART = /-b\.smoke/.test(__filename) ? 'b' : 'a';
const SPLIT = 30;

async function wikitext(title) {
  const u = WIKI + '?action=parse&prop=wikitext&format=json&formatversion=2&redirects=1&page=' + encodeURIComponent(title);
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'gw2-factory-dev probe (read only)' }, signal: AbortSignal.timeout(20000) });
      if (r.ok) {
        const j = await r.json();
        if (j.error) return { err: j.error.code };
        return { title: j.parse.title, text: j.parse.wikitext };
      }
      console.log('HTTP', r.status, title);
    } catch (e) { console.log('ERR', e.message, title); }
    await new Promise((s) => setTimeout(s, 1500));
  }
  return { err: 'fetch' };
}

function sections(text, re) {
  const lines = String(text).split('\n');
  const out = []; let cur = null; let lvl = 0;
  for (const l of lines) {
    const m = l.match(/^(=+)\s*(.*?)\s*\1\s*$/);
    if (m) {
      if (cur && m[1].length <= lvl) { out.push(cur); cur = null; }
      if (!cur && re.test(m[2])) { cur = [l]; lvl = m[1].length; continue; }
    }
    if (cur) cur.push(l);
  }
  if (cur) out.push(cur);
  return out.map((s) => s.join('\n'));
}

function compact(s, max) {
  const t = s.replace(/<!--[\s\S]*?-->/g, '').replace(/\n{2,}/g, '\n').trim();
  return t.length > max ? t.slice(0, max) + ' …[+' + (t.length - max) + ']' : t;
}

(async () => {
  const half = PART === 'a' ? PAGES.slice(0, SPLIT) : PAGES.slice(SPLIT);
  const list = ONLY.length ? PAGES.filter((p) => ONLY.includes(p[0])) : half;
  const coffers = new Set();
  for (const [id, title] of list) {
    const p = await wikitext(title);
    console.log('\n### ' + id + ' = ' + title + (p.title && p.title !== title ? ' -> ' + p.title : '') + (p.err ? ' ERROR ' + p.err : ''));
    if (!p.text) continue;
    const rew = sections(p.text, /reward|loot/i);
    if (!rew.length) console.log('(sin sección de recompensas; secciones: ' + (p.text.match(/^==+[^=].*$/gm) || []).join(' | ').slice(0, 400) + ')');
    rew.forEach((s) => console.log(compact(s, 1600)));
    const all = rew.join('\n');
    (all.match(/\[\[([^\]|#]*(?:Coffer|Chest)[^\]|#]*)/g) || []).forEach((m) => coffers.add(m.slice(2).trim()));
  }
  console.log('\n## cofres encontrados: ' + coffers.size);
  for (const c of coffers) {
    const p = await wikitext(c);
    console.log('\n#### ' + c + (p.err ? ' ERROR ' + p.err : ''));
    if (!p.text) continue;
    const box = (p.text.match(/\|\s*id\s*=\s*([\d, ]+)/) || [])[1];
    console.log('item id: ' + (box || '?'));
    const con = sections(p.text, /content|drop/i);
    con.forEach((s) => console.log(compact(s, 1400)));
  }
})();
