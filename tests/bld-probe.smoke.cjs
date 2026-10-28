// BL-082 BLD-1: sonda de lectura (no modifica nada). Imprime contexto de integración.
const fs = require('fs');
function grep(file, re, ctx, max) {
  let t; try { t = fs.readFileSync(file, 'utf8'); } catch (e) { console.log('## ' + file + ' NO EXISTE'); return; }
  const L = t.split('\n'); let n = 0;
  console.log('\n## ' + file + ' /' + re.source + '/ (' + L.length + ' líneas, ' + t.length + ' B)');
  let last = -1;
  for (let i = 0; i < L.length && n < max; i++) {
    if (re.test(L[i])) {
      n++;
      const a = Math.max(i - ctx, last + 1), b = Math.min(L.length - 1, i + ctx);
      if (a > last + 1) console.log('--');
      for (let j = a; j <= b; j++) console.log((j + 1) + ': ' + L[j].slice(0, 200));
      last = b;
    }
  }
}
grep('js/router.js', /raids|registerRoute|GNRouter|hashchange|root\.\w+ =/i, 2, 25);
grep('js/sidebar-nav.js', /raids/i, 3, 10);
grep('js/raids-view.js', /hashchange|route|getElementById|createElement\('section|GNKit\.\w+\(|gn:/i, 1, 35);
grep('js/settings-manager.js', /export|backup|respaldo|localStorage\.key|PREFIX/i, 1, 20);
grep('js/gn-kit.js', /^\s*(function \w+|root\.GNKit)/, 0, 50);
grep('js/gn-idb.js', /root\.GNIdb|function \w+\(/i, 0, 30);
grep('tests/index-versions.test.cjs', /./, 0, 50);
grep('tests/size-budget.test.cjs', /./, 0, 50);
grep('package.json', /./, 0, 30);
try { console.log('\n## tests/: ' + fs.readdirSync('tests').join(' ')); } catch (e) {}
try { console.log('\n## .github/scripts: ' + fs.readdirSync('.github/scripts').join(' ')); } catch (e) {}
grep('index.html', /id="(panel|view)|data-route|<section/i, 0, 40);
