'use strict';
// Sonda GUI-3 (BL-071), lote c. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const one = (s) => s.replace(/\r?\n/g, ' / ').replace(/\s+/g, ' ').replace(/ \/ \* ?/g, ' / ');
test('sonda GUI-3 c', () => {
  for (const f of ['js/act-view.js', 'js/act-week.js', 'js/act-psna.js', 'js/act-model.js', 'js/home-view.js', 'js/home-extra.js']) {
    let s; try { s = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { console.log('HEAD ' + f + ' (no está)'); continue; }
    const m = s.match(/^[\s\S]*?\*\//);
    console.log('HEAD ' + f + ': ' + one(m ? m[0] : s.slice(0, 1500)).slice(0, 1500));
    const keys = new Set();
    for (const k of s.matchAll(/['"`]((?:gn:|accounts:|gw2_)[\w:.-]*)['"`]/g)) keys.add(k[1]);
    console.log('KEYS ' + [...keys].join(' '));
    const ui = new Set();
    for (const k of s.matchAll(/(?:textContent\s*=|title\s*=|aria-label=|>)\s*['"]?([A-ZÁÉÍÓÚ¿«][^<>'"\n]{3,60})['"<]/g)) ui.add(k[1].trim());
    console.log('UI ' + [...ui].slice(0, 45).join(' | '));
  }
});
