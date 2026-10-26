'use strict';
// Sonda BLS-4b (BL-074): el Llavero viejo (accounts:lastFile) y la página de privacidad. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda', () => {
  for (const f of ['js/acc-vault-view.js', 'js/acc-vault-edit.js', 'js/acc-vault.js']) {
    const L = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
    L.forEach((l, i) => { if (/OLD_KEY|NEW_KEY|lastFile|vault2|removeItem|localStorage/.test(l)) console.log(f.slice(3) + ':' + (i + 1) + ': ' + l.trim().slice(0, 190)); });
  }
  const P = fs.readFileSync(path.join(ROOT, 'privacy.html'), 'utf8').split('\n');
  P.forEach((l, i) => { if (/localStorage|IndexedDB|navegador|cach|Vaciar|borrar todo|achmeta|conv/i.test(l)) console.log('privacy:' + (i + 1) + ': ' + l.trim().slice(0, 260)); });
});
