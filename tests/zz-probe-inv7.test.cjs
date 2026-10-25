// Sonda temporal INV-7 (BL-070): qué archivos nombran las tres pantallas viejas de Inventario y Personajes.
// Nunca falla; se borra después de leer su salida.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules', 'tools/legacy', 'ai-memory', 'factory', 'docs']);
const PAT = /inventory-hub|inventory-dashboard|characters\.js|InventoryHub|InventoryDashboard|InvDashboard|window\.Characters|root\.Characters|Characters\.|inventoryPanel|inventoryDashboardPanel|charactersPanel|characterPanel|#\/inventory|inv_dashboard|characters:maps|characters:pois|poi_assign|charAssign/;

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const rel = path.relative(ROOT, path.join(dir, d.name)).split(path.sep).join('/');
    if (SKIP.has(rel) || SKIP.has(d.name)) return;
    if (d.isDirectory()) walk(path.join(dir, d.name), out);
    else if (/\.(js|cjs|mjs|html|json|css|md|yml)$/.test(d.name)) out.push(rel);
  });
  return out;
}

test('sonda inv7', () => {
  try {
    const files = walk(ROOT, []);
    files.forEach((f) => {
      if (f === 'tests/zz-probe-inv7.test.cjs') return;
      const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
      const hits = [];
      lines.forEach((l, i) => { if (PAT.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 220)); });
      if (hits.length) {
        console.log('FILE ' + f + ' (' + hits.length + ')');
        hits.slice(0, f.startsWith('js/inventory') || f === 'js/characters.js' ? 6 : 25).forEach((h) => console.log('  ' + h));
      }
    });
    ['js/inventory-hub.js', 'js/characters.js', 'js/inventory-dashboard.js', 'index.html', 'js/router.js'].forEach((f) => {
      try { console.log('SIZE ' + f + ' ' + fs.statSync(path.join(ROOT, f)).size); } catch (e) { console.log('SIZE ' + f + ' no existe'); }
    });
    const sb = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/size-budget.json'), 'utf8'));
    console.log('BUDGET ' + JSON.stringify(sb).slice(0, 1500));
  } catch (e) { console.log('ERROR', e.message); }
});
