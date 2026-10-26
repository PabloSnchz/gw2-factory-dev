'use strict';
// Sonda SHV-0b (BL-059): quién escribe y lee las fotos del saldo. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const one = (s) => s.replace(/\s+/g, ' ');
test('sonda SHV-0b', () => {
  const st = fs.readFileSync(path.join(ROOT, 'js/storage.js'), 'utf8');
  let i = -1; let n = 0;
  while ((i = st.indexOf('snapshot', i + 1)) >= 0 && n < 6) { console.log('ST ' + one(st.slice(Math.max(0, i - 160), i + 260))); i += 400; n++; }
  const dir = path.join(ROOT, 'js');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
    if (f === 'storage.js') continue;
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    const re = /\w*[Ss]napshot\w*\s*\(/g; let m; const hits = new Set();
    while ((m = re.exec(s))) hits.add(m[0]);
    if (hits.size) {
      console.log('USE ' + f + ' ' + [...hits].join(' '));
      const k = s.search(/[Ss]napshot\w*\s*\(/);
      console.log('  ctx ' + one(s.slice(Math.max(0, k - 200), k + 300)));
    }
  }
});
