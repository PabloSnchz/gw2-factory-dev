// BL-082 BLD-1: sonda 5 de lectura. No modifica nada.
const fs = require('fs');
function lines(file, a, b) {
  let t; try { t = fs.readFileSync(file, 'utf8'); } catch (e) { console.log('## ' + file + ' NO EXISTE'); return; }
  const L = t.split('\n');
  console.log('\n## ' + file + ' ' + a + '-' + b);
  for (let j = a - 1; j < Math.min(b, L.length); j++) console.log((j + 1) + ': ' + L[j].slice(0, 160));
}
function grep(file, re, max) {
  const L = fs.readFileSync(file, 'utf8').split('\n'); let n = 0;
  console.log('\n## ' + file + ' /' + re.source + '/');
  L.forEach(function (l, i) { if (n < max && re.test(l)) { n++; console.log((i + 1) + ': ' + l.slice(0, 160)); } });
}
lines('js/router.js', 1246, 1292);
grep('js/router.js', /function route\b|setTimeout\(route|route\(\)/, 10);
grep('tests/sidebar-nav.test.cjs', /MODULES|groups\(|length|deepEqual\(.*map/, 25);
grep('tests/welcome-view.test.cjs', /MODULES|length, \d/, 12);
grep('js/welcome-panel.js', /MODULES = |Versión|VERSION =/, 6);
lines('index.html', 486, 503);
grep('js/sidebar-nav.js', /var TABS|var SHORT|DEFAULT_HASH =/, 5);
