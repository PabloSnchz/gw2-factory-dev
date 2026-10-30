// BLD-ICON sonda (se borra al cerrar): ícono oficial de la pestaña de plantillas/almacén de builds del Panel del héroe.
// Pasada 2: la wiki por wiki-en.guildwars2.com (la otra dirección devolvió HTML) y la búsqueda de archivos.
'use strict';
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; sonda de icono)', Accept: 'application/json' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(u) { try { const r = await fetch(u, UA); const t = await r.text(); try { return { st: r.status, j: JSON.parse(t) }; } catch (_) { return { st: r.status, j: null, t: t.replace(/\s+/g, ' ').slice(0, 160) }; } } catch (e) { return { st: 'ERR ' + e.message }; } }
(async () => {
  for (const host of ['https://wiki-en.guildwars2.com', 'https://wiki.guildwars2.com']) {
    const W = host + '/api.php?format=json&formatversion=2&action=query';
    const seen = new Set();
    for (const q of ['build storage', 'build template', 'hero panel', 'template']) {
      await sleep(900);
      const r = await json(W + '&list=search&srnamespace=6&srlimit=30&srwhat=title&srsearch=' + encodeURIComponent(q));
      const hits = (r.j && r.j.query && r.j.query.search || []).map((s) => s.title);
      console.log('WIKI', host, q, r.st, r.t || '', hits.join(' | '));
      hits.forEach((h) => seen.add(h));
    }
    for (const pg of ['Hero panel', 'Template', 'Build Storage Expansion', 'Build Template Expansion', 'Build template']) {
      await sleep(900);
      const r = await json(W + '&prop=images&imlimit=200&titles=' + encodeURIComponent(pg));
      const ims = (r.j && r.j.query && r.j.query.pages || []).flatMap((p) => (p.images || []).map((x) => x.title));
      console.log('PAGEIMG', pg, r.st, r.t || '', ims.join(' | '));
      ims.filter((t) => /build|template|storage|hero/i.test(t)).forEach((t) => seen.add(t));
    }
    const titles = [...seen].filter((t) => /\.(png|webp|gif|jpg)$/i.test(t)).slice(0, 60);
    for (let i = 0; i < titles.length; i += 25) {
      await sleep(900);
      const r = await json(W + '&prop=imageinfo&iiprop=url|size&titles=' + encodeURIComponent(titles.slice(i, i + 25).join('|')));
      (r.j && r.j.query && r.j.query.pages || []).forEach((p) => { const ii = (p.imageinfo || [])[0] || {}; console.log('IMG', p.title, ii.width + 'x' + ii.height, ii.url); });
    }
    if (seen.size) break;
  }
})();
