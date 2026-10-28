// BL-082 BLD-6: sonda 12 (solo lectura): qué fijan de settings-manager.js los tests hb89 e idea50.
const fs = require('fs');
for (const f of ['tests/hb89-premisa-raw-selected.test.js', 'tests/idea50-boton-cache.test.js']) {
  const L = fs.readFileSync(f, 'utf8').split('\n');
  console.log('\n## ' + f + ' (' + L.length + ' líneas)');
  L.forEach((l, i) => { if (/settings-manager|Versi|1\.0\.[45]|global|welcomeSeen|localStorage|exportGlobal|importGlobal|match\(|equal\(|readFileSync/.test(l)) console.log((i + 1) + ': ' + l.slice(0, 220)); });
}
