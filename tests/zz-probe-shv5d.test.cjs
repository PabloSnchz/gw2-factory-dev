'use strict';
// RUN-168: sonda de solo lectura para SHV-5d. Se borra después.
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const R = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(R, f), 'utf8');
const out = [];
const log = (s) => { out.push(s); console.log(s); };
function lines(f, a, b) { const L = rd(f).split('\n'); for (let i = a; i <= Math.min(b, L.length); i++) log(f + ':' + i + ': ' + L[i - 1]); }
function grep(f, re, ctx) {
  const L = rd(f).split('\n');
  L.forEach((l, i) => { if (re.test(l)) { for (let j = Math.max(0, i - (ctx || 0)); j <= Math.min(L.length - 1, i + (ctx || 0)); j++) log(f + ':' + (j + 1) + ': ' + L[j]); log('--'); } });
}
test('sonda SHV-5d', (t) => {
  log('SIZE converter-modal ' + Buffer.byteLength(rd('js/converter-modal.js')) + ' index.html ' + Buffer.byteLength(rd('index.html')) + ' wv-view ' + Buffer.byteLength(rd('js/wv-view.js')) + ' meta-theme ' + Buffer.byteLength(rd('js/meta-theme.js')));
  lines('js/converter-modal.js', 1, 8);
  grep('js/converter-modal.js', /VERSION\s*=|function adviceFor|Shiruvana\.voice\(/, 0);
  const C = rd('js/converter-modal.js'), i = C.indexOf('function adviceFor');
  if (i >= 0) log('ADVICE>>' + C.slice(i, i + 1600) + '<<');
  grep('index.html', /meta-theme\.js|converter-modal\.js/, 0);
  grep('js/wv-view.js', /Versión:|VERSION\s*=|Shiruvana\.voice\(/, 0);
  lines('tests/wv-view.test.cjs', 100, 106);
  fs.readdirSync(path.join(R, 'tests')).filter((f) => /\.(c?js)$/.test(f) && !f.startsWith('zz-')).forEach((f) => {
    grep('tests/' + f, /meta-theme|converter-modal|MetaTheme|ConverterModal/, 0);
  });
  ['size-budget.test.cjs', 'size-budget.smoke.cjs'].forEach((f) => grep('tests/' + f, /converter|49152|48|index\.html/i, 0));
  t.diagnostic(out.join('\n'));
});
