// BL-082 BLD-7/8: ayuda de curación, segunda pasada (solo lectura). Snow Crows publica sus builds por profesión
// (/builds/<modo>/<profesión>): leo esas páginas y la primera build de cada élite, una por vez y con pausa.
// Anoto solo datos factuales (élite, modo, dirección, fecha de actualización y código). Robots: «Allow: /».
globalThis.GNBldCode = require('../js/bld-code.js');
const C = globalThis.GNBldCode;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'https://snowcrows.com';
const PROFS = ['guardian', 'warrior', 'engineer', 'ranger', 'thief', 'elementalist', 'mesmer', 'necromancer', 'revenant'];
const ELITES = { druid: 5, daredevil: 7, berserker: 18, dragonhunter: 27, reaper: 34, chronomancer: 40, scrapper: 43, tempest: 48, herald: 52,
  soulbeast: 55, weaver: 56, holosmith: 57, deadeye: 58, mirage: 59, scourge: 60, spellbreaker: 61, firebrand: 62, renegade: 63, harbinger: 64,
  willbender: 65, virtuoso: 66, catalyst: 67, bladesworn: 68, vindicator: 69, mechanist: 70, specter: 71, untamed: 72, troubadour: 73, paragon: 74,
  amalgam: 75, ritualist: 76, antiquary: 77, galeshot: 78, conduit: 79, evoker: 80, luminary: 81 };
async function text(url) {
  for (let i = 0; i < 2; i++) {
    try { const r = await fetch(url, UA); if (r.ok) return await r.text(); if (r.status === 404) return ''; } catch (e) {}
    await sleep(3000);
  }
  return '';
}
const eliteOf = (slug) => slug.split('/').pop().split('-').find((p) => ELITES[p]) || null;
(async () => {
  // Nombres en castellano de las 36 élites (API oficial, un solo pedido).
  try {
    const r = await fetch('https://api.guildwars2.com/v2/specializations?ids=all&lang=es');
    const all = await r.json();
    console.log('ES ' + all.filter((s) => s.elite).map((s) => s.id + '=' + s.name).join('|'));
  } catch (e) { console.log('ES ERROR ' + e.message); }
  const pick = {};
  for (const [mode, idx] of [['pve', 'raids'], ['pve', 'fractals'], ['wvw', 'wvw'], ['pvp', 'pvp']]) {
    for (const p of PROFS) {
      await sleep(1100);
      const h = await text(BASE + '/builds/' + idx + '/' + p);
      const ls = [...new Set([...h.matchAll(new RegExp('href="(/builds/' + idx + '/' + p + '/[^"#?]+)"', 'g'))].map((m) => m[1]))];
      ls.forEach((u) => { const e = eliteOf(u); if (e && !pick[e + '|' + mode]) pick[e + '|' + mode] = u; });
    }
    console.log('# ' + idx + ' listo: ' + Object.keys(pick).filter((k) => k.endsWith('|' + mode)).length);
  }
  const want = Object.keys(ELITES).flatMap((e) => ['pve', 'wvw'].map((m) => e + '|' + m));
  console.log('# faltan pve/wvw: ' + want.filter((k) => !pick[k]).join(' '));
  for (const k of Object.keys(pick).sort()) {
    await sleep(1100);
    const url = pick[k];
    const h = await text(BASE + url);
    const m = h.match(/writeText\('\[&(?:amp;)?(DQ[A-Za-z0-9+/]+={0,2})\]'\)/) || h.match(/\[&(?:amp;)?(DQ[A-Za-z0-9+/]{40,}={0,2})\]/);
    const up = (h.replace(/<[^>]+>/g, ' ').match(/Updated\s+([A-Z][a-z]{2,8}\.?\s+\d{1,2},\s+\d{4})/) || [])[1] || '';
    let ok = 'SIN_CODIGO', el = 0;
    if (m) { const r = C.parse('[&' + m[1] + ']'); ok = r.ok ? 'ok' : 'MAL:' + r.errorCode; if (r.ok) el = r.build.specs[2].id; }
    const [e, mode] = k.split('|');
    console.log(['R', ELITES[e], mode, el === ELITES[e] ? 'ok' : 'EL' + el, up.replace(/\s+/g, ' ') || '-', url.replace('/builds/', ''), m ? m[1] : '-', ok].join('\t'));
  }
})();
