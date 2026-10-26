'use strict';
// Sonda SHV-0c (BL-059): cómo se maneja hoy la cuota de localStorage. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const one = (s) => s.replace(/\s+/g, ' ');
test('sonda SHV-0c', () => {
  const dir = path.join(ROOT, 'js');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    const re = /QuotaExceeded|quota|storage\.estimate|getUsage|usage\(|bytesUsed|_size\(|LRU|evict|purge/gi;
    let m; const seen = []; let n = 0;
    while ((m = re.exec(s)) && n < 3) {
      const at = m.index;
      if (seen.some((x) => Math.abs(x - at) < 300)) continue;
      seen.push(at); n++;
      console.log(f + ' @' + at + ' ' + one(s.slice(Math.max(0, at - 140), at + 220)));
    }
  }
});
