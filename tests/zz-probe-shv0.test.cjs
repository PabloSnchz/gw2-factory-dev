'use strict';
// Sonda SHV-0 (BL-059): dónde hablo hoy y qué datos con historia existen. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda SHV-0', () => {
  const dir = path.join(ROOT, 'js');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    const v = (s.match(/Shiruvana\.voice\(/g) || []).length;
    const p = (s.match(/ShiruvanaPlaces\.\w+/g) || []);
    const kinds = [...new Set((s.match(/kind:\s*'(\w+)'/g) || []).map((k) => k.replace(/kind:\s*'/, '').replace("'", '')))];
    const hist = [...new Set((s.match(/['"`](gn:[\w:.-]*(?:hist|snap|history|log|series|daily)[\w:.-]*)['"`]/gi) || []))];
    if (v || p.length || hist.length) console.log(f + ' voice=' + v + ' places=' + [...new Set(p)].join('|') + ' kinds=' + kinds.join('|') + ' hist=' + hist.join('|'));
  }
  const sp = fs.readFileSync(path.join(dir, 'shiruvana-places.js'), 'utf8');
  const ex = sp.match(/root\.ShiruvanaPlaces\s*=\s*\{[^}]*\}/);
  console.log('PLACES API ' + (ex ? ex[0].replace(/\s+/g, ' ') : 'n/a'));
  const ids = [...new Set((sp.match(/\bid:\s*'([\w-]+)'/g) || []).map((m) => m.slice(5, -1)))];
  console.log('PLACES ids ' + ids.join(','));
  const wd = fs.readFileSync(path.join(dir, 'wallet-dashboard.js'), 'utf8') + fs.readFileSync(path.join(dir, 'wallet-theme.js'), 'utf8');
  const wk = [...new Set((wd.match(/['"`]gn:wallet[\w:.-]*['"`]/g) || []))];
  console.log('WALLET keys ' + wk.join(' '));
  const i = wd.search(/snapshot|historial|history/i);
  console.log('WALLET ctx ' + wd.slice(Math.max(0, i - 200), i + 500).replace(/\s+/g, ' '));
});
