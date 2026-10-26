'use strict';
// Sonda BLS-4d (BL-074): fotos viejas de la Cartera, fijados viejos y claves de GitHub. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda', () => {
  const files = fs.readdirSync(path.join(ROOT, 'js')).filter((n) => n.endsWith('.js')).map((n) => 'js/' + n).concat(['index.html', 'privacy.html']);
  const C = ['snapshot', 'Snapshot', 'wallet:pins', 'walletPins', 'github', 'GITHUB', 'GIST', 'inv_dashboard_', 'CHARACTERS_', 'PSNA_CACHE', 'ACHIEVEMENTS_CACHE'];
  for (const f of files) {
    const L = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
    L.forEach((l, i) => { if (C.some((c) => l.includes(c)) && !/^\s*(\*|\/\/)/.test(l)) console.log(f + ':' + (i + 1) + ': ' + l.trim().slice(0, 150)); });
  }
  const T = fs.readdirSync(path.join(ROOT, 'tests')).filter((n) => /\.(c?js)$/.test(n) && !/zz-probe/.test(n));
  for (const n of T) {
    const s = fs.readFileSync(path.join(ROOT, 'tests', n), 'utf8');
    if (/DEFAULT_PREFIXES|prefixes\(\)|items_cache_v1'|lastFile/.test(s)) console.log('TEST ' + n + ': ' + (s.match(/.{0,60}(DEFAULT_PREFIXES|prefixes\(\)|items_cache_v1'|lastFile).{0,80}/g) || []).slice(0, 4).join(' | '));
  }
});
