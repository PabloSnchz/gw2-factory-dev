// Sonda de lectura (BL-064 CAM-6). Solo lee e imprime; se borra al cerrar CAM-6.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
function slice(file, needle, len) {
  const s = read(file), i = s.indexOf(needle);
  console.log('\n## ' + file + ' :: ' + needle + (i < 0 ? ' (NO ESTÁ)' : ''));
  if (i >= 0) console.log(s.slice(Math.max(0, i - 200), i + len));
}
slice('js/welcome-panel.js', 'function contrastFixes', 2600);
slice('js/render-catologo.js', 'function applyContrast', 1400);
slice('js/render-catologo.js', 'contrastFixes', 900);
slice('js/router.js', 'window.WV = ', 1500);
slice('js/router.js', 'root.WV = ', 1500);
const NAMES = ['ensureShopToolbar', 'setShopHeader', 'computeShopNumbers', 'passSearchAndSort', 'saveManualMark', 'updateCardUI',
  'setupManualInputEvents', 'renderShopArea', 'skShopCards', 'skShopTable', 'setShopLoading', 'shopSyncLine', 'syncShopToggleLabel',
  'renderObjectivesTab', 'renderObjectivesZero', 'normalizeObjectives', 'hydrateWVModePills', 'wvTabBtnObjDashboard', 'wvSyncNote', 'wv-season'];
console.log('\n## quién nombra funciones o elementos viejos (fuera de router.js)');
const dirs = ['js', 'tests', 'css'];
dirs.forEach((d) => fs.readdirSync(path.join(ROOT, d)).forEach((f) => {
  const p = d + '/' + f;
  if (p === 'js/router.js' || f.startsWith('probe-') || !/\.(c?js|css)$/.test(f)) return;
  const s = read(p);
  const hit = NAMES.filter((n) => s.indexOf(n) >= 0);
  if (hit.length) console.log(p + ': ' + hit.join(', '));
}));
const idx = read('index.html');
console.log('\nindex.html: ' + NAMES.filter((n) => idx.indexOf(n) >= 0).join(', '));
const r = read('js/router.js');
console.log('\nrouter.js usos: ' + NAMES.map((n) => n + '=' + (r.split(n).length - 1)).join(' '));
