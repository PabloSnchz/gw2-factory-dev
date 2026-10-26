'use strict';
// Sonda BLS-3a (BL-074): quién nombra los dos cachés propios. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function walk(d, out) {
  for (const n of fs.readdirSync(path.join(ROOT, d || '.'))) {
    if (n === 'node_modules' || n === '.git' || n === 'legacy' || n === 'arte') continue;
    const p = d ? d + '/' + n : n;
    const st = fs.statSync(path.join(ROOT, p));
    if (st.isDirectory()) walk(p, out);
    else if (/\.(js|cjs|html|json)$/.test(n) && st.size < 400000) out.push(p);
  }
  return out;
}
test('sonda', () => {
  const files = walk('', []).filter((f) => !/zz-probe/.test(f) && !/^factory\//.test(f) && !/^ai-memory\//.test(f));
  const RX = /gw2_conv_cache|achmeta|META_KEY|LS_CONV|convGet|convPut|GNIdb|DEFAULT_PREFIXES|converter-modal\.js|acc-view\.js|gn-idb\.js/;
  for (const f of files) {
    if (f === 'js/api-gw2.js') continue;
    const L = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
    L.forEach((l, i) => { if (RX.test(l)) console.log(f + ':' + (i + 1) + ': ' + l.trim().slice(0, 150)); });
  }
});
