'use strict';
// Sonda temporal CTA-5: lista cada línea del repo que nombra al panel viejo de Cuentas. Se borra después de leer el OUT.
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const RE = /accounts-panel|AccountsPanel|accountsPanel|accounts:lastFile|accountsWizard|openWizard|accountsTitle/;
function walk(d, out) {
  for (const n of fs.readdirSync(d)) {
    if (n === '.git' || n === 'node_modules' || n === 'assets' || n === 'factory' || n === 'docs' || n === 'ai-memory') continue;
    const p = path.join(d, n), s = fs.statSync(p);
    if (s.isDirectory()) walk(p, out); else if (/\.(js|cjs|html|json|css|yml)$/.test(n)) out.push(p);
  }
  return out;
}
test('sonda: referencias al panel viejo', () => {
  for (const f of walk(ROOT, [])) {
    const rel = path.relative(ROOT, f);
    if (rel === 'tests/zz-probe-cta5.test.cjs') continue;
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    const hits = [];
    lines.forEach((l, i) => { if (RE.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 220)); });
    if (hits.length) console.log('FILE ' + rel + ' (' + fs.statSync(f).size + ' B, ' + hits.length + ')\n  ' + hits.slice(0, 40).join('\n  '));
  }
});
