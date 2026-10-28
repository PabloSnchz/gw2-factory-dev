// BL-082 BLD-7/8: ayuda de curación (solo lectura, una sola vez). Lee las páginas públicas de Snow Crows
// (robots.txt: «Allow: /»), una por vez con pausa, y anota SOLO datos factuales: élite, modo, dirección,
// fecha de actualización y el código de plantilla. No copia textos ni imágenes. El catálogo lo armo yo.
globalThis.GNBldCode = require('../js/bld-code.js');
const C = globalThis.GNBldCode;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'https://snowcrows.com';
const ELITES = { druid: 5, daredevil: 7, berserker: 18, dragonhunter: 27, reaper: 34, chronomancer: 40, scrapper: 43, tempest: 48, herald: 52,
  soulbeast: 55, weaver: 56, holosmith: 57, deadeye: 58, mirage: 59, scourge: 60, spellbreaker: 61, firebrand: 62, renegade: 63, harbinger: 64,
  willbender: 65, virtuoso: 66, catalyst: 67, bladesworn: 68, vindicator: 69, mechanist: 70, specter: 71, untamed: 72, troubadour: 73, paragon: 74,
  amalgam: 75, ritualist: 76, antiquary: 77, galeshot: 78, conduit: 79, evoker: 80, luminary: 81 };
async function text(url) {
  for (let i = 0; i < 2; i++) {
    try { const r = await fetch(url, UA); if (r.ok) return await r.text(); } catch (e) {}
    await sleep(3000);
  }
  return '';
}
function links(h, mode) {
  const re = new RegExp('href="(/builds/' + mode + '/[a-z]+/[^"#?]+)"', 'g');
  return [...new Set([...h.matchAll(re)].map((m) => m[1]))];
}
function eliteOf(slug) {
  const parts = slug.split('/').pop().split('-');
  for (const p of parts) if (ELITES[p]) return p;
  return null;
}
(async () => {
  const pick = {}; // elite|mode → url (la primera que publica la fuente para esa élite)
  for (const [mode, idx] of [['pve', 'raids'], ['pve', 'fractals'], ['wvw', 'wvw']]) {
    await sleep(1500);
    const h = await text(BASE + '/builds/' + idx);
    const ls = links(h, idx);
    console.log('# índice ' + idx + ': ' + ls.length + ' builds');
    ls.forEach((u) => { const e = eliteOf(u); if (e && !pick[e + '|' + mode]) pick[e + '|' + mode] = u; });
  }
  const keys = Object.keys(pick).sort();
  console.log('# elegidas: ' + keys.length + ' de 72; faltan: ' + Object.keys(ELITES).flatMap((e) => ['pve', 'wvw'].map((m) => e + '|' + m)).filter((k) => !pick[k]).join(' '));
  for (const k of keys) {
    await sleep(1300);
    const url = pick[k];
    const h = await text(BASE + url);
    const m = h.match(/writeText\('\[&(?:amp;)?(DQ[A-Za-z0-9+/]+={0,2})\]'\)/) || h.match(/\[&(?:amp;)?(DQ[A-Za-z0-9+/]{40,}={0,2})\]/);
    const up = (h.match(/Updated ([A-Z][a-z]{2} \d{1,2}, \d{4})/) || [])[1] || '';
    let ok = '', prof = 0, el = 0;
    if (m) { const r = C.parse('[&' + m[1] + ']'); ok = r.ok ? 'ok' : 'MAL:' + r.errorCode; if (r.ok) { prof = r.build.profession; el = r.build.specs[2].id; } }
    const [e, mode] = k.split('|');
    console.log(['R', e, mode, ELITES[e], prof, el === ELITES[e] ? 'elite=ok' : 'elite=' + el, up || '-', url, m ? '[&' + m[1] + ']' : '-', ok || 'SIN_CODIGO'].join('\t'));
  }
})();
