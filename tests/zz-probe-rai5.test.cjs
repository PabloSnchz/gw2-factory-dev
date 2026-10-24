// Sonda temporal de RAI-5 (BL-070): lista quién nombra strike-tracker y «Raids y Strikes». Se borra después de RUN-036.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const RX = /strike-tracker|StrikeTracker|strikeTracker|Raids y Strikes|strikes?Li|navStrikes|account\/strikes/;
function walk(dir, out) {
  for (const n of fs.readdirSync(dir)) {
    if (n === '.git' || n === 'node_modules' || n === 'assets') continue;
    const p = path.join(dir, n);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(js|cjs|mjs|json|html|css|md|yml)$/.test(n) && s.size < 400000) out.push(p);
  }
  return out;
}
test('sonda', () => {
  const lines = [];
  for (const f of walk(ROOT, [])) {
    const rel = path.relative(ROOT, f);
    if (rel === 'tests/zz-probe-rai5.test.cjs' || rel.startsWith('ai-memory/') || rel.startsWith('docs/') || rel.startsWith('factory/')) continue;
    fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
      if (RX.test(l)) lines.push(rel + ':' + (i + 1) + ': ' + l.trim().slice(0, 220));
    });
  }
  console.log('PROBE-BEGIN\n' + lines.join('\n') + '\nPROBE-END ' + lines.length);
});
