// Sonda temporal INV-7 (BL-070): qué archivos de js/ y tests/ nombran las tres pantallas viejas.
// Nunca falla; se borra después de leer su salida.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const OLD = new Set(['js/inventory-hub.js', 'js/characters.js', 'js/inventory-dashboard.js', 'tests/zz-probe-inv7.test.cjs']);
const PAT = /inventory-hub|inventory-dashboard|characters\.js|InventoryHub|InventoryDashboard|Characters\b|inventoryDashboardPanel|charactersPanel|#\/inventory|charBack|getCharacterList/;

test('sonda inv7b', () => {
  try {
    ['js', 'tests'].forEach((dir) => {
      fs.readdirSync(path.join(ROOT, dir)).sort().forEach((n) => {
        const f = dir + '/' + n;
        if (OLD.has(f) || !/\.(js|cjs|json)$/.test(n) || /^inv-/.test(n)) return;
        const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
        const hits = [];
        lines.forEach((l, i) => { if (PAT.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 160)); });
        if (!hits.length) return;
        console.log('FILE ' + f + ' (' + hits.length + ')');
        hits.slice(0, dir === 'js' ? 10 : 4).forEach((h) => console.log('  ' + h));
      });
    });
  } catch (e) { console.log('ERROR', e.message); }
});
