// Sonda SHE-3 (se borra después): dónde hablo hoy y con qué tipo.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
test('censo de mi voz', () => {
  const dir = path.join(ROOT, 'js');
  const out = [];
  fs.readdirSync(dir).filter((f) => f.endsWith('.js')).forEach((f) => {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    const lines = s.split('\n');
    const hits = [];
    lines.forEach((l, i) => {
      if (/Shiruvana\.voice\(|ShvCore\.(render|pick)\(|C\.render\(|S\.voice\(|\.voice\(\{/.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 150));
    });
    const kinds = (s.match(/kind:\s*'(\w+)'/g) || []).reduce((a, k) => { a[k] = (a[k] || 0) + 1; return a; }, {});
    if (hits.length) out.push('## ' + f + ' (' + s.length + ' B) kinds=' + JSON.stringify(kinds) + '\n' + hits.slice(0, 8).join('\n'));
  });
  console.log(out.join('\n\n'));
});
