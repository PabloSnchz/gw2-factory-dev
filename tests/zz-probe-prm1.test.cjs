'use strict';
// Sonda PRM-1c (BL-073): rutas de assets/ y docs/ que usa el sitio de DEV, fuera de icons/ y gifanim/ (árboles idénticos en PRD). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda PRM-1c', () => {
  const files = ['index.html', 'privacy.html', 'docs/user-guide.html', 'docs/user-guide-avanzado.html']
    .concat(fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.(js|json)$/.test(f)).map((f) => 'js/' + f));
  const seen = new Map();
  for (const f of files) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const re = /(?:\.\.\/)?((?:assets|docs)\/[A-Za-z0-9_\-./]+)/g; let m;
    while ((m = re.exec(s))) {
      const p = m[1].replace(/[.\/]+$/, '');
      if (/^assets\/(icons|gifanim)\//.test(p)) continue;
      if (!seen.has(p)) seen.set(p, new Set());
      seen.get(p).add(f.replace(/^js\//, ''));
    }
  }
  for (const [p, by] of [...seen].sort()) {
    const ex = fs.existsSync(path.join(ROOT, p));
    console.log((ex ? 'OK ' : '?? ') + p + ' <- ' + [...by].slice(0, 4).join(','));
  }
});
