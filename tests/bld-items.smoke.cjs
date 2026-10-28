// BL-082 BLD-12/13: sonda de la API oficial (solo lectura): ids de estadísticas, runas superiores, sigilos superiores
// y reliquias exóticas, para las reglas del optimizador de equipo y el formato AE2. Una sola vez.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function j(u) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(u); if (r.ok || r.status === 206) return await r.json(); } catch (e) {}
    await sleep(1500);
  }
  return [];
}
(async () => {
  const st = await j('https://api.guildwars2.com/v2/itemstats?ids=all&lang=en');
  console.log('STATS ' + st.filter((s) => s.name).map((s) => s.id + ':' + s.name + ':' + (s.attributes || []).map((a) => a.attribute).join('+')).join(' | '));
  const ids = await j('https://api.guildwars2.com/v2/items');
  console.log('# items ' + ids.length);
  const out = [];
  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const items = await j('https://api.guildwars2.com/v2/items?lang=en&ids=' + batch.join(','));
    (Array.isArray(items) ? items : []).forEach((it) => {
      const d = it.details || {};
      if (it.type === 'Relic' && it.rarity === 'Exotic') out.push('RELIC\t' + it.id + '\t' + it.name);
      else if (it.type === 'UpgradeComponent' && it.rarity === 'Exotic' && (d.type === 'Rune' || d.type === 'Sigil') && /^Superior /.test(it.name)) out.push(d.type.toUpperCase() + '\t' + it.id + '\t' + it.name);
    });
    if (i % 4000 === 0) await sleep(300);
  }
  const seen = {};
  out.forEach((l) => { const k = l.split('\t')[0] + l.split('\t')[2]; if (!seen[k]) { seen[k] = 1; console.log(l); } });
})();
