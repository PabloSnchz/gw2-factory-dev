// BL-082 BLD-12/13: ids de runas superiores, sigilos superiores y reliquias exóticas (solo lectura, API oficial).
// Recorre solo los rangos de ids donde viven (la vuelta completa por 74.000 objetos no entra en 10 minutos).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function j(u) {
  for (let i = 0; i < 3; i++) {
    try { const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000); const r = await fetch(u, { signal: ctl.signal }); clearTimeout(t); if (r.ok || r.status === 206) return await r.json(); } catch (e) {}
    await sleep(1000);
  }
  return [];
}
const RANGES = [[24500, 24900], [36000, 36100], [38000, 38200], [44900, 45100], [47900, 50200], [67000, 68800], [69900, 76600], [81000, 84600], [85900, 87200], [91000, 92000], [99900, 106500]];
(async () => {
  const all = [];
  RANGES.forEach(([a, b]) => { for (let i = a; i < b; i += 200) { const ids = []; for (let k = i; k < Math.min(b, i + 200); k++) ids.push(k); all.push(ids); } });
  const seen = {};
  let n = 0;
  for (let i = 0; i < all.length; i += 4) {
    const res = await Promise.all(all.slice(i, i + 4).map((ids) => j('https://api.guildwars2.com/v2/items?lang=en&ids=' + ids.join(','))));
    res.forEach((items) => (Array.isArray(items) ? items : []).forEach((it) => {
      const d = it.details || {};
      let k = '';
      if (it.type === 'Relic' && it.rarity === 'Exotic') k = 'RELIC';
      else if (it.type === 'UpgradeComponent' && it.rarity === 'Exotic' && (d.type === 'Rune' || d.type === 'Sigil') && /^Superior /.test(it.name)) k = d.type.toUpperCase();
      if (k && !seen[k + it.name]) { seen[k + it.name] = 1; n++; console.log(k + '\t' + it.id + '\t' + it.name); }
    }));
  }
  console.log('# ' + n + ' encontrados en ' + all.length + ' pedidos');
})();
