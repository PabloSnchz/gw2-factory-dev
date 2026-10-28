// BL-082 BLD-8: sonda 14 (solo lectura): en qué páginas de MetaBattle están las builds de WvW de las élites que faltan.
globalThis.GNBldCode = require('../js/bld-code.js');
const C = globalThis.GNBldCode;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const WANT = { Willbender: 65, Bladesworn: 68, Mechanist: 70, Galeshot: 78, Daredevil: 7, Deadeye: 58, Specter: 71, Antiquary: 77 };
async function text(u) { for (let i = 0; i < 2; i++) { try { const r = await fetch(u, UA); if (r.ok) return await r.text(); console.log('  ' + u + ' → ' + r.status); return ''; } catch (e) {} await sleep(2000); } return ''; }
function facts(h) {
  const m = h.match(/build-template-code[^>]*>\[&(?:amp;)?(DQ[A-Za-z0-9+/]+={0,2})\]/);
  const up = (h.match(/last updated on ([A-Z][a-z]+ \d{1,2}, \d{4})/) || [])[1] || '';
  const pa = (h.match(/up to date for the ([A-Z][a-z]+ \d{1,2}, \d{4}) patch/) || [])[1] || '';
  return { code: m ? m[1] : '', up, pa };
}
(async () => {
  const found = {};
  for (const page of ['WvW', 'WvW_Roaming', 'Roaming', 'Guardian', 'Warrior', 'Engineer', 'Ranger', 'Thief']) {
    await sleep(1200);
    const h = await text('https://metabattle.com/wiki/' + page);
    const ls = [...new Set([...h.matchAll(/href="(\/wiki\/Build:[^"#?]+)"/g)].map((m) => m[1]))];
    const mine = ls.filter((l) => Object.keys(WANT).some((e) => l.indexOf('Build:' + e + '_') === 0 || l.indexOf('/wiki/Build:' + e) === 0));
    console.log('## ' + page + ': ' + h.length + ' B, ' + ls.length + ' builds; de las que faltan: ' + mine.join(' '));
    // Contexto de modo: en las páginas de profesión, ¿la build está bajo WvW?
    mine.forEach((l) => { const i = h.indexOf(l); const before = h.slice(Math.max(0, i - 4000), i); const mode = (before.match(/id="(WvW|PvP|PvE|Raids|Fractals|Open_World|Strikes|Raid|Fractal)[^"]*"/g) || []).pop() || '?'; (found[l] = found[l] || []).push(page + ':' + mode); });
  }
  for (const l of Object.keys(found)) {
    await sleep(1200);
    const f = facts(await text('https://metabattle.com' + l));
    let ok = 'SIN_CODIGO', el = 0;
    if (f.code) { const r = C.parse('[&' + f.code + ']'); ok = r.ok ? 'ok' : 'MAL'; if (r.ok) el = r.build.specs[2].id; }
    const want = Object.entries(WANT).find(([e]) => l.indexOf('/wiki/Build:' + e) === 0);
    console.log(['M', want ? want[1] : 0, want && el === want[1] ? 'ok' : 'EL' + el, f.up || '-', f.pa || '-', l, f.code || '-', ok, found[l].join(',')].join('\t'));
  }
})();
