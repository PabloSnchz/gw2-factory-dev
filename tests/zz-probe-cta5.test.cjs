'use strict';
// Sonda temporal CTA-5 (3): el bloque de idea64 que lee js/accounts-panel.js. Se borra después de leer el OUT.
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
test('sonda: idea64', () => {
  const L = fs.readFileSync(path.join(__dirname, 'idea64-dos-pestanas.test.js'), 'utf8').split('\n');
  for (let i = 470; i <= Math.min(575, L.length); i++) console.log(String(i).padStart(4) + '|' + L[i - 1]);
  console.log('TOTAL ' + L.length);
});
