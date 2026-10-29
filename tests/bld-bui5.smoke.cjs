// BUI-5 sonda 2 (borrar después): tokens de color de los 19 temas, en una línea cada uno.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const DIR = path.join(__dirname, '..', 'css', 'themes');
test('BUI-5 tokens', () => {
  const K = ['--bg-0', '--bg-1', '--bg-2', '--bd-1', '--tx-1', '--tx-2', '--tx-3', '--acc-1', '--color-green', '--color-red', '--color-amber', '--gn-gold'];
  const out = {};
  fs.readdirSync(DIR).filter((f) => f.endsWith('.css')).sort().forEach((f) => {
    const css = fs.readFileSync(path.join(DIR, f), 'utf8');
    const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'));
    const t = {};
    block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { if (K.indexOf(k) >= 0) t[k] = v.trim(); return ''; });
    out[f.replace('.css', '')] = t;
  });
  console.log('TOKENS ' + JSON.stringify(out));
});
