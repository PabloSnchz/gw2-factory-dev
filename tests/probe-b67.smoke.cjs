// Sonda de la Factory (BL-067, pasos 4 a 8). Solo lee y escribe en la salida: no afirma nada.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const out = [];
const log = (s) => out.push(s);
const FILES = ['js/activities.js', 'js/activities-theme.js', 'js/raid-tracker.js', 'js/strike-tracker.js', 'js/fractal-tracker-theme.js',
  'js/characters.js', 'js/characters-theme.js', 'js/inventory-hub.js', 'js/inventory-dashboard.js', 'js/accounts-panel.js',
  'js/commerce-delivery-theme.js', 'js/progress-eta.js', 'js/luck-curve.js'];
const uniq = (a) => Array.from(new Set(a));
const top = (re, s, n) => { const c = {}; let m; while ((m = re.exec(s))) c[m[1]] = (c[m[1]] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map((x) => x[0] + '×' + x[1]).join(' '); };
for (const f of FILES) {
  const s = read(f);
  if (!s) { log('\n## ' + f + ' — NO ESTÁ'); continue; }
  log('\n## ' + f + ' — ' + Buffer.byteLength(s) + ' B');
  const v = s.match(/(?:Versi[oó]n|v)\s*:?\s*(\d+\.\d+\.\d+)/); log('versión: ' + (v ? v[1] : '?'));
  log('header: ' + s.slice(0, 600).replace(/\s+/g, ' '));
  log('getElementById: ' + uniq((s.match(/getElementById\(['"]([\w-]+)['"]\)/g) || []).map((x) => x.slice(16, -2))).join(' '));
  log('ids creados: ' + uniq((s.match(/id=\\?["']([\w-]+)\\?["']/g) || []).map((x) => x.replace(/id=\\?["']|\\?["']/g, ''))).slice(0, 60).join(' '));
  log('clases top: ' + top(/class=\\?["']([\w-]+)/g, s, 45));
  log('window.X =: ' + uniq((s.match(/(?:window|root|global)\.(\w+)\s*=/g) || [])).join(' '));
  log('eventos: ' + uniq((s.match(/['"](gn:[\w-]+|hashchange|DOMContentLoaded)['"]/g) || [])).join(' '));
  log('hex colores: ' + ((s.match(/#[0-9a-fA-F]{3,6}\b/g) || []).length) + ' · aria-: ' + ((s.match(/aria-[a-z]+/g) || []).length) + ' · role=: ' + ((s.match(/role=/g) || []).length) + ' · outline:none: ' + ((s.match(/outline:\s*(none|0)\b/g) || []).length) + ' · innerHTML: ' + ((s.match(/innerHTML/g) || []).length) + ' · style.: ' + ((s.match(/\.style\.\w+\s*=/g) || []).length) + ' · fetch(: ' + ((s.match(/fetch\(/g) || []).length));
  log('colores de texto: ' + top(/color\s*:\s*([^;'"}]+)/g, s, 20));
}
const idx = read('index.html');
log('\n## index.html secciones');
['raidTrackerPanel', 'strikeTrackerPanel', 'inventoryPanel', 'inventoryDashboardPanel', 'accountsPanel'].forEach((id) => {
  const i = idx.indexOf('id="' + id + '"');
  log('--- ' + id + '\n' + (i < 0 ? 'NO' : idx.slice(idx.lastIndexOf('<section', i), idx.indexOf('</section>', i) + 10).slice(0, 1400)));
});
log('\n## index.html: activities / characters / fractal');
idx.split('\n').forEach((l, n) => { if (/activit|charact|fractal|homestead|psna/i.test(l)) log((n + 1) + ': ' + l.trim().slice(0, 200)); });
const r = read('js/router.js');
log('\n## router.js rutas');
(r.match(/['"]#\/[\w\/-]+['"]/g) || []).filter((x, i, a) => a.indexOf(x) === i).forEach((x) => log(x));
log('\n## router.js: paneles nombrados');
log(uniq((r.match(/['"]\w+Panel['"]/g) || [])).join(' '));
const sb = read('js/sidebar-nav.js');
log('\n## sidebar-nav módulos');
(sb.match(/\{[^{}]*route[^{}]*\}/g) || []).slice(0, 20).forEach((x) => log(x.replace(/\s+/g, ' ').slice(0, 220)));
const wel = read('js/welcome-panel.js');
log('\n## welcome MODULES');
(wel.match(/\{\s*id:\s*'[\w-]+'[^{}]*\}/g) || []).slice(0, 20).forEach((x) => log(x.replace(/\s+/g, ' ').slice(0, 260)));
console.log(out.join('\n'));
