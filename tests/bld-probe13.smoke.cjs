// BL-082 BLD-8: WvW de MetaBattle para las élites que Snow Crows no publica (solo lectura; robots: solo prohíbe index.php?).
// Por cada élite: su página en MetaBattle, los enlaces a builds cerca de «WvW», y de la primera build: código, fecha y parche.
globalThis.GNBldCode = require('../js/bld-code.js');
const C = globalThis.GNBldCode;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MISSING = { Willbender: 65, Bladesworn: 68, Mechanist: 70, Galeshot: 78, Daredevil: 7, Deadeye: 58, Specter: 71, Antiquary: 77, Scourge: 60, Harbinger: 64 };
async function text(u) { for (let i = 0; i < 2; i++) { try { const r = await fetch(u, UA); if (r.ok) return await r.text(); } catch (e) {} await sleep(2000); } return ''; }
function facts(h) {
  const m = h.match(/build-template-code[^>]*>\[&(?:amp;)?(DQ[A-Za-z0-9+/]+={0,2})\]/);
  const up = (h.match(/last updated on ([A-Z][a-z]+ \d{1,2}, \d{4})/) || [])[1] || '';
  const pa = (h.match(/up to date for the ([A-Z][a-z]+ \d{1,2}, \d{4}) patch/) || [])[1] || '';
  return { code: m ? m[1] : '', up, pa };
}
(async () => {
  for (const [name, id] of Object.entries(MISSING)) {
    await sleep(1200);
    const h = await text('https://metabattle.com/wiki/' + name);
    const links = [...new Set([...h.matchAll(/href="(\/wiki\/Build:[^"#?]+)"/g)].map((m) => m[1]))];
    // Los que la página agrupa bajo WvW: miro el texto entre el título WvW y el siguiente modo.
    const i = h.search(/id="WvW"|>WvW</), j = i >= 0 ? h.slice(i).search(/id="(PvP|PvE|Raids|Fractals|Open_World)"/) : -1;
    const wv = i >= 0 ? [...new Set([...h.slice(i, j > 0 ? i + j : undefined).matchAll(/href="(\/wiki\/Build:[^"#?]+)"/g)].map((m) => m[1]))] : [];
    console.log('\n## ' + name + ' (' + id + '): ' + links.length + ' builds; bajo WvW: ' + wv.join(' '));
    for (const l of (wv.length ? wv : links).slice(0, 3)) {
      await sleep(1200);
      const f = facts(await text('https://metabattle.com' + l));
      let ok = 'SIN_CODIGO', el = 0;
      if (f.code) { const r = C.parse('[&' + f.code + ']'); ok = r.ok ? 'ok' : 'MAL'; if (r.ok) el = r.build.specs[2].id; }
      console.log(['M', id, el === id ? 'ok' : 'EL' + el, f.up || '-', f.pa || '-', l, f.code || '-', ok].join('\t'));
    }
  }
})();
