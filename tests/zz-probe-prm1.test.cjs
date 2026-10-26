'use strict';
// Sonda PRM-1b (BL-073): bloque GA de DEV completo. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda PRM-1b', () => {
  const dev = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n');
  for (let i = 19; i < 50; i++) console.log('D' + (i + 1) + ': ' + JSON.stringify(dev[i]));
  const a = fs.readFileSync(path.join(ROOT, 'js/analytics.js'));
  console.log('analytics first bytes ' + a.slice(0, 4).toString('hex'));
});
