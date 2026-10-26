'use strict';
// Sonda GUI-4 (BL-071), lote e. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const one = (s) => s.replace(/\r?\n/g, ' / ').replace(/\s+/g, ' ').replace(/ \/ \* ?/g, ' / ');
test('sonda GUI-4 e', () => {
  for (const f of ['js/settings-manager.js', 'js/theme-selector.js', 'js/gn-topbar.js', 'js/app.js', 'index.html']) {
    let s; try { s = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { console.log('HEAD ' + f + ' (no está)'); continue; }
    if (f === 'index.html') {
      const i = s.indexOf('id="keysModal"');
      console.log('KEYSMODAL ' + one(s.slice(i, i + 2600).replace(/<[^>]+>/g, ' ')));
      const j = s.indexOf('id="settingsMenu"') > 0 ? s.indexOf('id="settingsMenu"') : s.indexOf('Ajustes');
      console.log('AJUSTES ' + one(s.slice(j, j + 1800).replace(/<[^>]+>/g, ' ')));
      continue;
    }
    if (f === 'js/app.js') {
      const i = s.indexOf('REQUIRED_PERMISSIONS');
      console.log('APPPERM ' + one(s.slice(i, i + 500)));
      const keys = new Set();
      for (const k of s.matchAll(/['"`]((?:gn:|accounts:|gw2_)[\w:.-]*)['"`]/g)) keys.add(k[1]);
      console.log('KEYS ' + [...keys].join(' '));
      continue;
    }
    const m = s.match(/^[\s\S]*?\*\//);
    console.log('HEAD ' + f + ': ' + one(m ? m[0] : s.slice(0, 1500)).slice(0, 1300));
    const keys = new Set();
    for (const k of s.matchAll(/['"`]((?:gn:|accounts:|gw2_)[\w:.-]*)['"`]/g)) keys.add(k[1]);
    console.log('KEYS ' + [...keys].join(' '));
    const ui = new Set();
    for (const k of s.matchAll(/(?:textContent\s*=|title\s*=|aria-label=|>)\s*['"]?([A-ZÁÉÍÓÚ¿«][^<>'"\n]{3,60})['"<]/g)) ui.add(k[1].trim());
    console.log('UI ' + [...ui].slice(0, 35).join(' | '));
  }
});
