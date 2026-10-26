'use strict';
// Sonda GUI-5b (BL-071): quién usa de verdad cada clave que nombran la privacidad y la guía. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
test('sonda GUI-5b', () => {
  const st = rd('js/storage.js');
  const NAME = {}; // clave -> nombre de constante
  for (const m of st.matchAll(/^\s*([A-Z_]+):\s*'((?:gn:|accounts:)[^']+)'/gm)) NAME[m[2]] = m[1];
  const LEG = {}; // clave -> nombres viejos
  for (const m of st.matchAll(/\{ from: '([^']+)',\s*to: '([^']+)' \}/g)) (LEG[m[2]] = LEG[m[2]] || []).push(m[1]);
  for (const m of st.matchAll(/^\s*'((?:gn:)[^']+)':\s*(\[[^\]]*\]|'[^']*')/gm)) for (const x of m[2].match(/'([^']+)'/g) || []) (LEG[m[1]] = LEG[m[1]] || []).push(x.slice(1, -1));
  const keys = new Set();
  for (const f of ['privacy.html', 'docs/user-guide-avanzado.html']) for (const m of rd(f).matchAll(/<code>((?:gn:|accounts:|gw2_)[a-zA-Z0-9:_.-]*)<\/code>/g)) keys.add(m[1]);
  const JS = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f) && f !== 'storage.js');
  for (const k of [...keys].sort()) {
    const pats = [k].concat(NAME[k] ? ['STORAGE_KEYS.' + NAME[k], '.' + NAME[k] + ')', "'" + NAME[k] + "'"] : [], (LEG[k] || []).map((x) => "'" + x));
    const users = [];
    for (const f of JS) {
      const s = rd('js/' + f);
      const hit = pats.filter((p) => s.includes(p));
      if (hit.length) {
        const ln = s.split('\n').findIndex((l) => hit.some((p) => l.includes(p)));
        users.push(f + ':' + (ln + 1) + '[' + hit.map((h) => h.slice(0, 28)).join('|') + ']');
      }
    }
    console.log('K ' + k + ' const=' + (NAME[k] || '-') + ' leg=' + (LEG[k] || []).join(',') + ' => ' + (users.join(' ') || 'NADIE'));
  }
});
