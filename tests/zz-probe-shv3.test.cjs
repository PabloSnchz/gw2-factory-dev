// Sonda SHV-3 (se borra después): estado del tracker, API del árbol y la cola con mi línea.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const cut = (f, a, b) => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l.slice(0, 190)).join('\n');
test('trozos', () => {
  console.log('## tracker getState y export\n' + cut('legendary-tracker.js', 1360, 1470));
  console.log('## tracker inventario y precios\n' + cut('legendary-tracker.js', 1150, 1200));
  console.log('## tree export\n' + cut('legendary-tree.js', 14, 60) + '\n...\n' + cut('legendary-tree.js', 255, 274));
  console.log('## catalogo cola\n' + cut('render-catologo.js', 530, 640));
});
