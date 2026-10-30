// BL-084 EQ-1 sonda (descartable): parte 3 de 3 (ver bld-eq1a).
const G = require('../.github/scripts/bld-gear-scrape.cjs');
const cat = require('../assets/data/builds/catalog.json');
const PART = 3;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const all = cat.builds.filter((b) => /snowcrows\.com/.test(b.source.url));
  const n = Math.ceil(all.length / 3), list = all.slice((PART - 1) * n, PART * n);
  console.log('SC', all.length, 'PARTE', PART, list.length);
  let bad = 0;
  for (const b of list) {
    await sleep(700);
    let g = null, st = 0;
    try { const r = await fetch(b.source.url, UA); st = r.status; if (r.ok) g = G.parseGear(await r.text()); } catch (e) { st = 'err'; }
    const p = G.gearProblems(g);
    if (p.length) bad++;
    console.log(b.source.url + '\t' + (g ? JSON.stringify(g) : 'null') + (p.length ? '\t!' + st + ' ' + p.join('; ') : ''));
  }
  console.log('PROBLEMAS', bad);
})();
