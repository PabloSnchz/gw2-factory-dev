// BL-084 EQ-1 sonda (descartable): equipo real de TODAS las builds de Snow Crows del catálogo, de a una con pausa larga
// y reintento si Snow Crows pide frenar (429). Imprime «id<TAB>equipo» por build y los problemas.
const G = require('../.github/scripts/bld-gear-scrape.cjs');
const cat = require('../assets/data/builds/catalog.json');
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, UA);
      if (r.ok) return { st: 200, html: await r.text() };
      if (r.status !== 429 && r.status < 500) return { st: r.status, html: '' };
      const wait = Number(r.headers.get('retry-after')) || 0;
      await sleep(Math.max(wait * 1000, 15000 * (i + 1)));
    } catch (e) { await sleep(5000); }
  }
  return { st: 'agotado', html: '' };
}
(async () => {
  const all = cat.builds.filter((b) => /snowcrows\.com/.test(b.source.url));
  console.log('SC', all.length);
  let bad = 0;
  for (const b of all) {
    await sleep(2500);
    const r = await get(b.source.url);
    const g = r.st === 200 ? G.parseGear(r.html) : null;
    const p = G.gearProblems(g);
    if (p.length) bad++;
    console.log(b.id + '\t' + (g ? JSON.stringify(g) : 'null') + (p.length ? '\t!' + r.st + ' ' + p.join('; ') : ''));
  }
  console.log('PROBLEMAS', bad);
})();
