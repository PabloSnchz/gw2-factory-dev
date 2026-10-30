// Sonda (borrar después): líneas completas de status.md y backlog.md que voy a tocar, y las reglas de tests/ai-memory.test.cjs.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');

test('docs peek 2', () => {
  const S = fs.readFileSync(path.join(ROOT, 'ai-memory/status.md'), 'utf8').split('\n');
  [3, 4, 5, 6, 7, 8, 9, 10].forEach((n) => console.log('S' + n + ': ' + JSON.stringify(S[n - 1])));
  S.forEach((l, i) => { if (i > 150) console.log('S' + (i + 1) + ': ' + JSON.stringify(l.slice(0, 260))); });
  const B = fs.readFileSync(path.join(ROOT, 'ai-memory/backlog.md'), 'utf8').split('\n');
  B.forEach((l, i) => { if (/^- \[BL-08[2-4]\]/.test(l)) console.log('B' + (i + 1) + ' (' + l.length + '): ' + JSON.stringify(l)); });
  B.forEach((l, i) => { if (/^## /.test(l)) console.log('B' + (i + 1) + ': ' + l); });
  const T = fs.readFileSync(path.join(ROOT, 'tests/ai-memory.test.cjs'), 'utf8');
  T.split('\n').forEach((l, i) => { if (/status|Próxima|CLASS_RE|Esperando|manifiesto|Archivos/.test(l)) console.log('T' + (i + 1) + ': ' + l.slice(0, 300)); });
});
