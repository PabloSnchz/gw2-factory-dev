// BL-082 BENCH-1 sonda 2 (solo lectura, descartable): extrae TODOS los benchmarks de Snow Crows (dirección, máx, prom, log)
// y cuenta cuántas builds del catálogo tienen benchmark.
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const cat = require('../assets/data/builds/catalog.json');
const num = (s) => Number(String(s).replace(/[^0-9]/g, '')) || 0;
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
(async () => {
  const h = await (await fetch('https://snowcrows.com/en/benchmarks', UA)).text();
  const parts = h.split('class="font-medium line-clamp-1"');
  const rows = [];
  for (let i = 1; i < parts.length; i++) {
    const before = parts[i - 1].slice(-1500), p = parts[i].slice(0, 6000);
    const href = (before.match(/href="([^"]+)"\s*$/) || [])[1] || '';
    const sp = [...before.matchAll(/<div class="uppercase text-xs font-bold[^"]*">([\s\S]*?)<\/div>/g)];
    const spec = sp.length ? clean(sp[sp.length - 1][1]) : '';
    const name = clean((p.match(/^>([\s\S]*?)<\/a>/) || [])[1] || '');
    const weapons = clean((p.match(/<span class="mr-1">([\s\S]*?)<\/span>/) || [])[1] || '');
    const dots = (p.split('data-tippy-content="Build Difficulty"')[1] || '').split('</span>')[0];
    const diff = (dots.match(/text-orange-400/g) || []).length;
    const max = num((p.match(/fa-angle-double-up[^>]*><\/i>\s*([\d,]+)/) || [])[1]);
    const avg = num((p.match(/fa-tilde[^>]*><\/i>\s*([\d,]+)/) || [])[1]);
    const log = (p.match(/href="(https:\/\/dps\.report\/[^"]+)"/) || [])[1] || '';
    rows.push([href.replace(/^https?:\/\/[^/]+/, '').replace(/^\/(en\/)?builds\//, ''), spec, name, weapons, diff, max, avg, log.replace('https://dps.report/', '')]);
  }
  console.log('ROWS', rows.length);
  console.log('JSON' + JSON.stringify(rows));
  const key = (u) => String(u).replace(/^https?:\/\/[^/]+/, '').replace(/^\/(en\/)?builds\//, '').split('/').slice(-2).join('/');
  const idx = {}; rows.forEach((r) => { idx[r[0].split('/').slice(-2).join('/')] = r; });
  let hit = 0; const miss = [];
  cat.builds.forEach((b) => {
    if (b.source.name !== 'Snow Crows' || b.mode !== 'pve') return;
    if (idx[key(b.source.url)]) hit++; else miss.push(b.sub + ':' + key(b.source.url) + ':' + b.roles.join('+'));
  });
  console.log('CATALOG pve SC hit', hit, 'miss', miss.length);
  console.log(miss.join('\n'));
})();
