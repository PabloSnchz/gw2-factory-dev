// BL-082 BLD-8: las 8 builds de WvW (roaming) de MetaBattle para las élites que Snow Crows no publica (solo lectura).
globalThis.GNBldCode = require('../js/bld-code.js');
const C = globalThis.GNBldCode;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PAGES = [[65, 'Willbender_-_Radiant_Swordbender_Roamer'], [68, 'Bladesworn_-_Defense_Bladesworn_Roamer'], [70, 'Mechanist_-_Condition_Mecha_Roamer'],
  [78, 'Galeshot_-_Galeburst_Roamer'], [7, 'Daredevil_-_Power_S/D_Roamer'], [58, 'Deadeye_-_SA_Rifle_Roamer'], [71, 'Specter_-_Support_Specter'], [77, 'Antiquary_-_Lucky_Shot_Roamer']];
(async () => {
  for (const [id, page] of PAGES) {
    await sleep(1200);
    let h = '';
    try { const r = await fetch('https://metabattle.com/wiki/Build:' + page, UA); h = r.ok ? await r.text() : ''; } catch (e) {}
    const m = h.match(/build-template-code[^>]*>\[&(?:amp;)?(DQ[A-Za-z0-9+/]+={0,2})\]/);
    const t = h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const up = (t.match(/last updated on ([A-Z][a-z]+ \d{1,2}, \d{4})/) || [])[1] || '';
    const pa = (t.match(/up to date for the ([A-Z][a-z]+ \d{1,2}, \d{4}) patch/) || [])[1] || '';
    let ok = 'SIN_CODIGO', el = 0;
    if (m) { const r = C.parse('[&' + m[1] + ']'); ok = r.ok ? 'ok' : 'MAL'; if (r.ok) el = r.build.specs[2].id; }
    console.log(['M', id, el === id ? 'ok' : 'EL' + el, up || '-', pa || '-', '/wiki/Build:' + page, m ? m[1] : '-', ok].join('\t'));
  }
})();
