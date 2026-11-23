// Sonda FLU-2 (2026-11-23): qué le pesa al scroll de La Bóveda DEV. Solo lee; se borra después.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const files = [];
(function walk(d) {
  for (const n of fs.readdirSync(d)) {
    if (/^(node_modules|\.git|tests|factory|ai-memory|tools|docs|data)$/.test(n)) continue;
    const p = path.join(d, n);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(css|js|html)$/.test(n)) files.push(p);
  }
})(ROOT);
const PATS = [
  ['BACKDROP', /backdrop-filter\s*:\s*(?!none)[^;"'`}]+/g],
  ['ATTACH', /background-attachment\s*:\s*fixed/g],
  ['INTERVAL', /setInterval\s*\(/g],
  ['SCROLL', /addEventListener\(\s*['"](?:scroll|wheel|touchmove)['"]/g],
  ['INFINITE', /animation[^;{}]*infinite/g],
  ['FILTERBLUR', /(?<!backdrop-)filter\s*:\s*[^;"'`}]*blur\([^)]*\)/g],
  ['WILLCHANGE', /will-change\s*:[^;"'`}]+/g],
  ['FIXEDPOS', /position\s*:\s*fixed/g],
];
test('sonda FLU-2', () => {
  const tot = {};
  for (const f of files) {
    const rel = path.relative(ROOT, f);
    const txt = fs.readFileSync(f, 'utf8');
    const lines = txt.split('\n');
    for (const [k, re] of PATS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(txt))) {
        tot[k] = (tot[k] || 0) + 1;
        const ln = txt.slice(0, m.index).split('\n').length;
        const ctx = lines[ln - 1].trim().slice(0, 200);
        console.log(k + ' ' + rel + ':' + ln + ' :: ' + ctx);
      }
    }
  }
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  console.log('CSSLINKS ' + (html.match(/<link[^>]+stylesheet[^>]*>/g) || []).map((l) => (l.match(/href="([^"]+)"/) || [])[1]).join(' | '));
  console.log('TOTALES ' + JSON.stringify(tot) + ' archivos=' + files.length);
});
