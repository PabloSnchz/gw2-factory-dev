// BL-082 BENCH-1 sonda (solo lectura, descartable): estructura de snowcrows.com/en/benchmarks.
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
(async () => {
  const r = await fetch('https://snowcrows.com/en/benchmarks', UA);
  const h = await r.text();
  console.log('status', r.status, 'len', h.length);
  const rb = await (await fetch('https://snowcrows.com/robots.txt', UA)).text();
  console.log('ROBOTS', rb.slice(0, 400));
  const i = h.indexOf('46,309');
  console.log('IDX', i);
  if (i > 0) console.log('AROUND', h.slice(Math.max(0, i - 3000), i + 800));
  const links = [...new Set([...h.matchAll(/href="([^"]*\/builds\/[^"]+)"/g)].map((m) => m[1]))];
  console.log('BUILDLINKS', links.length, links.slice(0, 15).join('\n'));
  const js = [...h.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  console.log('SCRIPTS', js.join('\n'));
  const nd = h.indexOf('__NEXT_DATA__'); console.log('NEXT', nd);
  const nuxt = h.indexOf('__NUXT'); console.log('NUXT', nuxt);
  const jsonish = h.match(/"benchmark[^"]*"\s*:/gi); console.log('JSONKEYS', jsonish ? jsonish.slice(0, 10) : null);
})();
