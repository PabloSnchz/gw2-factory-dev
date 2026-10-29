// BUI-5 sonda de documentos 2 (borrar después): líneas completas a reemplazar.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const M = path.join(__dirname, '..', 'ai-memory');
test('BUI-5 docs 2', () => {
  const st = fs.readFileSync(path.join(M, 'status.md'), 'utf8').split('\n');
  [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((n) => console.log('S' + n + ': ' + (n === 4 ? st[n - 1].slice(0, 120) + ' …[' + st[n - 1].length + ' chars]' : st[n - 1])));
  for (let n = 180; n <= 195; n++) console.log('S' + n + ': ' + st[n - 1]);
  const bl = fs.readFileSync(path.join(M, 'backlog.md'), 'utf8').split('\n');
  for (let n = 18; n <= 26; n++) console.log('B' + n + ': ' + bl[n - 1]);
  console.log('FEAT ' + fs.readFileSync(path.join(M, 'features', 'FEAT-025-modulo-builds.md'), 'utf8'));
});
