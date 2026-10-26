'use strict';
// Sonda temporal TOP-2 (BL-070 paso 5). Solo lee el repo. Se borra después de leer OUT-094.
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rd = (p) => { try { return fs.readFileSync(path.join(R, p), 'utf8'); } catch (_) { return ''; } };
const show = (f, a, b) => { const L = rd(f).split('\n'); for (let i = a; i <= Math.min(b, L.length); i++) console.log(f.replace('js/', '') + ':' + i + '|' + L[i - 1]); };

test('sonda TOP-2: código alrededor de cada diálogo nativo', () => {
  console.log('BYTES app', Buffer.byteLength(rd('js/app.js')), 'settings', Buffer.byteLength(rd('js/settings-manager.js')));
  show('js/app.js', 1100, 1130);
  show('js/settings-manager.js', 270, 300);
  show('js/settings-manager.js', 655, 690);
  show('js/settings-manager.js', 740, 812);
});
