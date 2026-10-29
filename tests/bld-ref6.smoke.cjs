// BUI-6b sonda (borrar después): cómo arman cabecera, fondo y pestañas los módulos renovados.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
test('BUI-6b referencia', () => {
  const RE = /hero|tabs|\[role=tab\]|panel__title|\.panel\b|rvRoot|Root\{|-on>|gn-mod|::before|::after/;
  ['js/acc-view.js', 'js/act-view.js', 'js/home-view.js', 'js/wv-view.js', 'js/raids-view.js'].forEach((f) => {
    const s = rd(f);
    console.log('==== ' + f);
    s.split('\n').forEach((l, i) => { if (/^\s*('|P \+|S \+|F \+|"|\w+ \+ ')/.test(l) && RE.test(l)) console.log((i + 1) + ': ' + l.trim().slice(0, 330)); });
    const vh = /function (viewHTML|headHTML)\([^)]*\)\s*\{[\s\S]{0,900}/.exec(s);
    if (vh) console.log('-- ' + vh[0].replace(/\s+/g, ' ').slice(0, 900));
    const host = /(insertBefore|appendChild)\([^;]*;[^\n]*/g;
    let m; while ((m = host.exec(s))) console.log('-- host: ' + m[0].slice(0, 200));
  });
  ['css/main.css', 'css/theme-polish.css'].forEach((f) => {
    const s = rd(f);
    console.log('==== ' + f);
    const re = /[^{}]*(\.panel(?![\w-])|\.panel__title|\.panel__body)[^{}]*\{[^}]*\}/g;
    let m, n = 0;
    while ((m = re.exec(s)) && n < 25) { console.log(m[0].replace(/\s+/g, ' ').trim().slice(0, 400)); n++; }
  });
  const ix = rd('index.html');
  const p = /<section[^>]*id="raidTrackerPanel"[\s\S]{0,700}/.exec(ix);
  console.log('==== index raidTrackerPanel\n' + (p ? p[0] : 'no'));
  const a = /<section[^>]*id="accountsPanel"[\s\S]{0,500}/.exec(ix);
  console.log('==== index accountsPanel\n' + (a ? a[0] : 'no'));
});
