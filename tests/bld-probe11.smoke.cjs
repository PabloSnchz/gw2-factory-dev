// BL-082 BLD-8: sonda 11 (solo lectura): otras fuentes de WvW para las élites que Snow Crows no publica.
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RE = /DQ[A-Za-z0-9+/]{40,}={0,2}/g;
async function look(u, linkRe) {
  await sleep(1200);
  try {
    const r = await fetch(u, UA); const h = await r.text();
    const codes = [...new Set((h.match(RE) || []))];
    console.log('\n## ' + u + ' → ' + r.status + ' ' + h.length + ' B, códigos ' + codes.length + (codes[0] ? ' ej ' + codes[0].slice(0, 40) : ''));
    for (const k of ['gw2skills.net/editor/?', 'template', 'Build code', 'chat link', 'armory-embeds', 'data-armory-ids']) {
      const i = h.indexOf(k); if (i >= 0) console.log('  [' + k + '] ' + h.slice(Math.max(0, i - 120), i + 160).replace(/\s+/g, ' '));
    }
    if (linkRe) console.log('  enlaces: ' + [...new Set([...h.matchAll(linkRe)].map((m) => m[1]))].slice(0, 80).join(' '));
    return h;
  } catch (e) { console.log('## ' + u + ' ERROR ' + e.message); return ''; }
}
(async () => {
  await look('https://metabattle.com/wiki/Build:Spellbreaker_-_Immob_Spellbreaker');
  await look('https://hardstuck.gg/gw2/builds/', /href="(https:\/\/hardstuck\.gg\/gw2\/builds\/[^"#?]+)"/g);
  await look('https://guildjen.com/wvw-builds/', /href="(https:\/\/guildjen\.com\/[^"#?]+)"/g);
  await look('https://gw2mists.com/builds', /href="(\/builds\/[^"#?]+)"/g);
})();
