// BL-084 EQ-1 sonda (descartable): equipo real de las fichas de Snow Crows que faltaron por 429, de a una con pausa
// y reintento. Imprime «id<TAB>equipo» por build y los problemas.
const G = require('../.github/scripts/bld-gear-scrape.cjs');
const cat = require('../assets/data/builds/catalog.json');
const ONLY = ['wvw/ranger/power-soulbeast', 'pvp/ranger/condition-soulbeast-shortbow-dagger-dagger', 'raids/ranger/condition-quickness-untamed-axe-dagger-dagger-torch',
  'wvw/ranger/power-untamed', 'pvp/ranger/power-untamed-hammer-mace-mace', 'raids/ranger/power-galeshot-longbow-axe-axe',
  'raids/elementalist/celestial-alacrity-tempest-scepter-warhorn', 'raids/elementalist/condition-weaver-pistol-warhorn', 'wvw/elementalist/power-catalyst', 'wvw/elementalist/power-evoker'];
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, UA);
      if (r.ok) return { st: 200, html: await r.text() };
      if (r.status !== 429 && r.status < 500) return { st: r.status, html: '' };
      await sleep(10000);
    } catch (e) { await sleep(3000); }
  }
  return { st: 'agotado', html: '' };
}
(async () => {
  const all = cat.builds.filter((b) => ONLY.some((p) => b.source.url.endsWith('/builds/' + p)));
  console.log('FALTAN', all.length);
  let bad = 0;
  for (const b of all) {
    await sleep(2000);
    const r = await get(b.source.url);
    const g = r.st === 200 ? G.parseGear(r.html) : null;
    const p = G.gearProblems(g);
    if (p.length) bad++;
    console.log(b.id + '\t' + (g ? JSON.stringify(g) : 'null') + (p.length ? '\t!' + r.st + ' ' + p.join('; ') : ''));
  }
  console.log('PROBLEMAS', bad);
})();
