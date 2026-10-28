// BL-082 BLD-7: dónde está el código de plantilla en las páginas públicas de Snow Crows y MetaBattle (solo lectura).
// robots.txt: Snow Crows «Allow: /»; MetaBattle solo prohíbe /wiki/index.php?. Una página por vez, con pausa.
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RE = /DQ[A-Za-z0-9+/]{40,}={0,2}/g;
async function look(url) {
  await sleep(1500);
  try {
    const r = await fetch(url, UA);
    const h = await r.text();
    const m = [...h.matchAll(RE)];
    console.log('\n## ' + url + ' → ' + r.status + ' ' + h.length + ' B, códigos ' + m.length);
    m.slice(0, 3).forEach((x) => console.log('  ' + x[0].slice(0, 90) + ' … contexto: ' + h.slice(Math.max(0, x.index - 120), x.index).replace(/\s+/g, ' ').slice(-120)));
    const pi = h.search(/patch|Last updated|Updated/i);
    if (pi >= 0) console.log('  parche/fecha: ' + h.slice(pi - 80, pi + 160).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    return h;
  } catch (e) { console.log('## ' + url + ' ERROR ' + e.message); return ''; }
}
(async () => {
  await look('https://snowcrows.com/builds/raids/elementalist/power-alacrity-tempest-hammer');
  const wvw = await look('https://snowcrows.com/builds/wvw');
  console.log('  enlaces wvw: ' + [...new Set([...wvw.matchAll(/href="(\/builds\/wvw\/[a-z-]+\/[^"#?]+)"/g)].map((x) => x[1]))].slice(0, 60).join(' '));
  const mb = await look('https://metabattle.com/wiki/WvW');
  const mbl = [...new Set([...mb.matchAll(/href="(\/wiki\/Build:[^"#?]+)"/g)].map((x) => x[1]))];
  console.log('  MetaBattle WvW builds: ' + mbl.length + '\n  ' + mbl.slice(0, 90).join(' '));
  if (mbl[0]) await look('https://metabattle.com' + mbl[0]);
})();
