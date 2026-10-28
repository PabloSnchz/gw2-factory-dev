// BL-082 BLD-6/8: sonda 10 (solo lectura): respaldo (settings-manager y sus tests) y dónde publica MetaBattle el código.
const fs = require('fs');
function lines(file, a, b) {
  const L = fs.readFileSync(file, 'utf8').split('\n');
  console.log('\n## ' + file + ' ' + a + '-' + b);
  for (let j = a - 1; j < Math.min(b, L.length); j++) console.log((j + 1) + ': ' + L[j].slice(0, 200));
}
lines('js/settings-manager.js', 1, 40);
lines('js/settings-manager.js', 168, 256);
lines('js/settings-manager.js', 565, 580);
fs.readdirSync('tests').forEach((f) => {
  const t = fs.readFileSync('tests/' + f, 'utf8');
  if (/settings-manager|exportGlobalData|importGlobalData|SettingsManager/.test(t)) {
    const L = t.split('\n');
    L.forEach((l, i) => { if (/global|exportAll|exportData|keys\(|deepEqual\(Object\.keys/.test(l)) console.log(f + ':' + (i + 1) + ': ' + l.slice(0, 200)); });
  }
});
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
(async () => {
  for (const u of ['https://metabattle.com/wiki/Build:Firebrand_-_Support_Firebrand', 'https://hardstuck.gg/gw2/builds/']) {
    try {
      const r = await fetch(u, UA); const h = await r.text();
      console.log('\n## ' + u + ' ' + r.status + ' ' + h.length);
      ['DQ', 'gw2skills', 'template', 'chat code', 'Copy', 'clipboard', 'data-armory'].forEach((k) => {
        const i = h.indexOf(k);
        console.log('  ' + k + ': ' + (i < 0 ? 'no' : h.slice(Math.max(0, i - 150), i + 200).replace(/\s+/g, ' ')));
      });
      if (/hardstuck/.test(u)) console.log('  enlaces: ' + [...new Set([...h.matchAll(/href="(https:\/\/hardstuck\.gg\/gw2\/builds\/[^"#?]+)"/g)].map((m) => m[1]))].slice(0, 60).join(' '));
    } catch (e) { console.log(u + ' ERROR ' + e.message); }
    await new Promise((r) => setTimeout(r, 1500));
  }
})();
