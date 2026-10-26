'use strict';
// Sonda SHV-2a (BL-059): estado de la Cartera, huella de cuenta y divisas. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
test('sonda', () => {
  const W = rd('js/wallet-theme.js');
  W.forEach((l, i) => { if (/_state|lastAt|S\.models|models\s*=|amount:|pinned:|isMain|function readModels|function collect|gn:tokenchange|setState|S = \{/.test(l)) console.log('wt:' + (i + 1) + ': ' + l.trim().slice(0, 170)); });
  for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter((n) => n.endsWith('.js'))) {
    rd('js/' + f).forEach((l, i) => { if (/0x811c9dc5|function fingerprint|function fp\(|function huella|function keyFp/.test(l)) console.log('FP ' + f + ':' + (i + 1) + ': ' + l.trim().slice(0, 150)); });
  }
  rd('js/api-gw2.js').forEach((l, i) => { if (/AstralAcclaim|=== 63|id === 63|\b63\b.*astral|astral.*\b63\b/i.test(l)) console.log('api:' + (i + 1) + ': ' + l.trim().slice(0, 150)); });
  rd('js/app.js').forEach((l, i) => { if (/WalletTheme|renderWallet|gn:wallet-rendered|dispatchEvent\(new CustomEvent\('gn:wallet/.test(l)) console.log('app:' + (i + 1) + ': ' + l.trim().slice(0, 150)); });
});
