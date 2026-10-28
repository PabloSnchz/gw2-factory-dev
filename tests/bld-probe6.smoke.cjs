// BL-082 BLD-3/BLD-7: sonda de red (solo lectura). API oficial de GW2 y fuentes de builds (robots.txt y API de MediaWiki).
const UA = 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, asText) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    const t = await r.text();
    if (asText) return { status: r.status, text: t };
    try { return { status: r.status, json: JSON.parse(t) }; } catch (e) { return { status: r.status, text: t.slice(0, 300) }; }
  } catch (e) { return { status: 0, error: String(e && e.message || e) }; }
}
(async () => {
  const A = 'https://api.guildwars2.com';
  let r = await get(A + '/v2/build'); console.log('\n## /v2/build', r.status, JSON.stringify(r.json));
  r = await get(A + '/v2/specializations?ids=all&lang=en');
  const specs = r.json || [];
  const elites = specs.filter((s) => s.elite);
  console.log('\n## specializations', specs.length, 'elites', elites.length);
  console.log(elites.map((s) => s.id + ':' + s.name + ':' + s.profession).join(' | '));
  console.log('core', specs.filter((s) => !s.elite).map((s) => s.id + ':' + s.name).join(' | '));
  r = await get(A + '/v2/professions/Revenant?v=latest&lang=en');
  const p = r.json || {};
  console.log('\n## profession Revenant keys', Object.keys(p).join(','), 'palette', (p.skills_by_palette || []).length, 'code', p.code);
  console.log('weapons', Object.keys(p.weapons || {}).join(','));
  r = await get(A + '/v2/legends?ids=all&v=latest');
  console.log('\n## legends', JSON.stringify(r.json).slice(0, 1500));
  r = await get(A + '/v2/files?ids=all');
  console.log('\n## files', (r.json || []).map((f) => f.id + ' ' + f.icon).join('\n').slice(0, 6000));
  // Fuentes: reglas de robots y API de MediaWiki de MetaBattle.
  for (const u of ['https://metabattle.com/robots.txt', 'https://snowcrows.com/robots.txt', 'https://hardstuck.gg/robots.txt', 'https://guildjen.com/robots.txt']) {
    await sleep(1000);
    const t = await get(u, true);
    console.log('\n## ' + u + ' ' + t.status + '\n' + String(t.text || t.error).slice(0, 900));
  }
  await sleep(1000);
  r = await get('https://metabattle.com/api.php?action=query&meta=siteinfo&siprop=namespaces|general&format=json');
  console.log('\n## metabattle siteinfo', r.status, JSON.stringify(r.json || r.text || r.error).slice(0, 1500));
  await sleep(1000);
  r = await get('https://metabattle.com/api.php?action=query&list=search&srsearch=Paragon&srlimit=10&format=json');
  console.log('\n## metabattle search Paragon', r.status, JSON.stringify(r.json || r.text || r.error).slice(0, 1500));
})();
