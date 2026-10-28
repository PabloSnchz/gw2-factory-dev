// BL-082 BLD-1: sonda 4 de lectura (rangos de líneas). No modifica nada.
const fs = require('fs');
function lines(file, a, b) {
  let t; try { t = fs.readFileSync(file, 'utf8'); } catch (e) { console.log('## ' + file + ' NO EXISTE'); return; }
  const L = t.split('\n');
  console.log('\n## ' + file + ' ' + a + '-' + b + ' (' + L.length + ' líneas)');
  for (let j = a - 1; j < Math.min(b, L.length); j++) console.log((j + 1) + ': ' + L[j].slice(0, 190));
}
lines('js/router.js', 1, 4);
lines('js/router.js', 104, 116);
lines('js/router.js', 137, 160);
lines('js/router.js', 1040, 1072);
lines('js/router.js', 1207, 1260);
lines('js/router.js', 1290, 1300);
lines('js/router.js', 1355, 1372);
lines('js/sidebar-nav.js', 1, 6);
lines('js/sidebar-nav.js', 46, 54);
lines('js/sidebar-nav.js', 60, 63);
lines('js/sidebar-nav.js', 160, 200);
const idx = fs.readFileSync('index.html', 'utf8');
const m = idx.match(/<script[^>]+(router|sidebar-nav|boot)\.js[^>]*>/g); console.log('\n## index.html scripts: ' + JSON.stringify(m));
try { console.log('\n## tools/: ' + fs.readdirSync('tools').join(' ')); } catch (e) {}
['tools/size-budget.json', 'size-budget.json', 'tools/size-budget.config.json'].forEach(function (f) { try { console.log('\n## ' + f + '\n' + fs.readFileSync(f, 'utf8').slice(0, 2500)); } catch (e) {} });
