'use strict';
// Sonda PRM-1 (BL-073): bloque de Google Analytics del index de producción contra DEV. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
function get(u) {
  return new Promise((ok, ko) => https.get(u, (r) => { const c = []; r.on('data', (d) => c.push(d)); r.on('end', () => ok(Buffer.concat(c))); }).on('error', ko));
}
const blob = (b) => crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + b.length + '\0'), b])).digest('hex');
test('sonda PRM-1', async () => {
  const prdB = await get('https://raw.githubusercontent.com/PabloSnchz/gw2-wallet-ligero/main/index.html');
  const devB = fs.readFileSync(path.join(ROOT, 'index.html'));
  console.log('PRD blob ' + blob(prdB) + ' ' + prdB.length + ' | DEV blob ' + blob(devB) + ' ' + devB.length);
  const prd = prdB.toString('utf8'), dev = devB.toString('utf8');
  console.log('CRLF prd=' + prd.includes('\r\n') + ' dev=' + dev.includes('\r\n') + ' BOM prd=' + (prd.charCodeAt(0) === 0xFEFF) + ' dev=' + (dev.charCodeAt(0) === 0xFEFF));
  const re = /gtag|googletagmanager|G-[A-Z0-9]{6,}|analytics|dataLayer/i;
  for (const [n, s] of [['PRD', prd], ['DEV', dev]]) {
    s.split('\n').forEach((l, i) => { if (re.test(l)) console.log(n + ' ' + (i + 1) + ': ' + JSON.stringify(l.slice(0, 220))); });
  }
  const pl = prd.split('\n'), dl = dev.split('\n');
  const ds = new Set(dl);
  const only = pl.map((l, i) => [i + 1, l]).filter(([, l]) => !ds.has(l));
  console.log('PRD-only lines: ' + only.length);
  only.slice(0, 40).forEach(([i, l]) => console.log('P' + i + ': ' + JSON.stringify(l.slice(0, 200))));
  const bi = prd.indexOf('<head>'); const be = prd.indexOf('</head>');
  console.log('PRD head len ' + (be - bi));
});
