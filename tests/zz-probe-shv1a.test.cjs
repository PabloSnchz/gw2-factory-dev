'use strict';
// Sonda SHV-1a (BL-059). Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = (f, a, b) => rd(f).split('\n').slice(a - 1, b).map((l, i) => (a + i) + ': ' + l).join('\n');
const grepf = (f, re, ctx) => { const L = rd(f).split('\n'); const out = []; L.forEach((l, i) => { if (re.test(l)) out.push((i + 1) + ': ' + l.slice(0, 200)); }); return out.join('\n'); };
test('sonda', () => {
  console.log('--- app.js emitRefreshEvents');
  const L = rd('js/app.js').split('\n'); const i = L.findIndex((l) => /function emitRefreshEvents|emitRefreshEvents\s*=/.test(l));
  console.log(lines('js/app.js', i + 1, i + 14));
  console.log('--- app.js console token');
  console.log(grepf('js/app.js', /console\.(log|info|debug)\([^)]*(token|tk|key)/i));
  console.log('--- wallet files grep voice/state');
  for (const f of ['js/wallet-theme.js', 'js/wallet-dashboard.js']) {
    console.log('## ' + f); console.log(grepf(f, /root\.\w+\s*=|window\.\w+\s*=|dispatchEvent|addEventListener\('gn:|CustomEvent\(|getAccountWallet|function render\w*\(|VERSION|getElementById\('(wallet\w*)'/));
  }

});
