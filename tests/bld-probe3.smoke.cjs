// BL-082 BLD-1: sonda 3 de lectura (respaldo, kit, idb, reglas de tests). No modifica nada.
const fs = require('fs');
function grep(file, re, ctx, max) {
  let t; try { t = fs.readFileSync(file, 'utf8'); } catch (e) { console.log('## ' + file + ' NO EXISTE'); return; }
  const L = t.split('\n'); let n = 0;
  console.log('\n## ' + file + ' /' + re.source + '/ (' + t.length + ' B)');
  let last = -1;
  for (let i = 0; i < L.length && n < max; i++) {
    if (re.test(L[i])) {
      n++;
      const a = Math.max(i - ctx, last + 1), b = Math.min(L.length - 1, i + ctx);
      if (a > last + 1) console.log('--');
      for (let j = a; j <= b; j++) console.log((j + 1) + ': ' + L[j].slice(0, 170));
      last = b;
    }
  }
}
grep('js/settings-manager.js', /exportAll|importAll|function export|function import|KEYS|prefix|startsWith\(|gn:/i, 1, 14);
grep('js/gn-kit.js', /^\s*root\.GNKit|^  function \w+|^\s+\w+: \w+,?$/, 0, 40);
grep('js/gn-idb.js', /^\s*root\.GNIdb|^  function \w+/, 0, 20);
grep('tests/size-budget.test.cjs', /budget|LIMIT|MAX|warn|js\/|index\.html|\d{4,}/i, 0, 30);
grep('tests/index-versions.test.cjs', /modules\.json|Versi|expect|assert/i, 0, 20);
grep('tests/boot.test.cjs', /MAX|40|version/i, 0, 12);
grep('js/act-view.js', /homestead|hashchange|panel|function (activate|init|mount)|root\.\w+ =/i, 1, 20);
