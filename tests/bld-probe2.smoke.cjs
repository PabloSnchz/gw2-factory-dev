// BL-082 BLD-1: sonda 2 de lectura (router y sidebar). No modifica nada.
const fs = require('fs');
function grep(file, re, ctx, max) {
  let t; try { t = fs.readFileSync(file, 'utf8'); } catch (e) { console.log('## ' + file + ' NO EXISTE'); return; }
  const L = t.split('\n'); let n = 0;
  console.log('\n## ' + file + ' /' + re.source + '/');
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
grep('js/router.js', /homestead|function showPanel|PANELS|panelIds|ROUTES\b|else \{|default:|unknown|desconocid|gn:route|dispatchEvent/i, 3, 20);
grep('js/sidebar-nav.js', /homestead|var ITEMS|MOBILE|LINK_ID|function render|NEW_|nuevo:|isNew|badge/i, 2, 18);
