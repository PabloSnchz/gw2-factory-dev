// BL-082: sonda 7 de lectura (Sidebar, kit, respaldo). No modifica nada.
const fs = require('fs');
function lines(file, a, b) {
  let t; try { t = fs.readFileSync(file, 'utf8'); } catch (e) { console.log('## ' + file + ' NO EXISTE'); return; }
  const L = t.split('\n');
  console.log('\n## ' + file + ' ' + a + '-' + b + ' de ' + L.length);
  for (let j = a - 1; j < Math.min(b, L.length); j++) console.log((j + 1) + ': ' + L[j].slice(0, 200));
}
function grep(file, re, max) {
  const L = fs.readFileSync(file, 'utf8').split('\n'); let n = 0;
  console.log('\n## ' + file + ' /' + re.source + '/');
  L.forEach(function (l, i) { if (n < max && re.test(l)) { n++; console.log((i + 1) + ': ' + l.slice(0, 200)); } });
}
lines('tests/sidebar-nav.test.cjs', 205, 245);
lines('js/gn-kit.js', 96, 146);
lines('js/gn-kit.js', 199, 215);
grep('js/settings-manager.js', /^\s*function \w+|version:|exportAll|data\.\w+ =|payload\.\w+|\w+: export\w+\(\)/, 40);
grep('js/storage.js', /^\s*function \w+|STORAGE_KEYS = |root\.Storage|window\.Storage/, 30);
