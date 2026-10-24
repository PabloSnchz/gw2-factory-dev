// Sonda RUN-020 (cierre de BL-067): muestra la cabeza del CHANGELOG y las líneas del backlog que nombran BL-067. Se borra después.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
test('sonda', () => {
  const ch = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  console.log('=== CHANGELOG (primeros 1800) ===\n' + ch.slice(0, 1800));
  const bl = fs.readFileSync(path.join(ROOT, 'ai-memory/backlog.md'), 'utf8').split('\n');
  console.log('=== backlog: cabecera de tabla ===');
  bl.forEach((l, i) => { if (/^\|\s*(ID|-)/.test(l) && i < 60) console.log(i + ': ' + l.slice(0, 300)); });
  console.log('=== backlog: BL-067 ===');
  bl.forEach((l, i) => { if (/BL-067/.test(l)) console.log(i + ': ' + l); });
});
