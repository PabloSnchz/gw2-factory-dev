// BLD-ICON sonda (se borra al cerrar): ¿dónde está el ícono oficial de la pestaña de plantillas/almacén de builds del
// Panel del héroe? 1) /v2/files (íconos de interfaz que publica la API); 2) archivos de la wiki oficial que lo nombran.
'use strict';
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; sonda de icono)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(u) { try { const r = await fetch(u, UA); const t = await r.text(); try { return { st: r.status, j: JSON.parse(t) }; } catch (_) { return { st: r.status, j: null, t: t.slice(0, 200) }; } } catch (e) { return { st: 'ERR ' + e.message }; } }
(async () => {
  const f = await json('https://api.guildwars2.com/v2/files?ids=all');
  const all = Array.isArray(f.j) ? f.j : [];
  console.log('FILES', f.st, all.length, 'ids:', all.map((x) => x.id).filter((id) => !/^(map_|wvw_)/.test(id)).join(' '));
  const W = 'https://wiki.guildwars2.com/api.php?format=json&formatversion=2&action=query';
  const seen = new Set();
  for (const q of ['build storage', 'build template', 'hero panel build', 'build tab', 'template icon', 'Build Storage tab']) {
    await sleep(800);
    const r = await json(W + '&list=search&srnamespace=6&srlimit=25&srsearch=' + encodeURIComponent(q));
    const hits = (r.j && r.j.query && r.j.query.search || []).map((s) => s.title);
    console.log('WIKI', q, r.st, r.t || '', hits.join(' | '));
    hits.forEach((h) => seen.add(h));
  }
  const titles = [...seen].filter((t) => /\.(png|webp|gif)$/i.test(t)).slice(0, 40);
  for (let i = 0; i < titles.length; i += 20) {
    await sleep(800);
    const r = await json(W + '&prop=imageinfo&iiprop=url|size|sha1&titles=' + encodeURIComponent(titles.slice(i, i + 20).join('|')));
    (r.j && r.j.query && r.j.query.pages || []).forEach((p) => { const ii = (p.imageinfo || [])[0] || {}; console.log('IMG', p.title, ii.width + 'x' + ii.height, ii.size, ii.url); });
  }
  for (const pg of ['Hero panel', 'Template', 'Build Storage Expansion']) {
    await sleep(800);
    const r = await json(W + '&prop=images&imlimit=100&titles=' + encodeURIComponent(pg));
    const ims = (r.j && r.j.query && r.j.query.pages || []).flatMap((p) => (p.images || []).map((x) => x.title));
    console.log('PAGEIMG', pg, r.st, ims.join(' | '));
  }
})();
