// Sonda (se borra después): CSS y armado de la caja de mi voz en los 7 módulos.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const F = { 'ach-view.js': 'achxVoice', 'act-view.js': 'avVoice', 'act-week.js': 'awKeyVoice', 'home-view.js': 'hsVoice', 'inv-view.js': 'ivVoice', 'raids-view.js': 'rvVoice', 'wv-view.js': 'wvxVoice' };
test('cajas de mi voz', () => {
  const out = [];
  Object.keys(F).forEach((f) => {
    const id = F[f], lines = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').split('\n');
    const hits = [];
    lines.forEach((l, i) => { if (l.indexOf(id) >= 0 || /Voice\b.*(:empty|display)|voice.*:empty/i.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 260)); });
    lines.forEach((l, i) => { if (/function (renderVoice|paintVoice|voice)\b|renderVoice\(|paintVoice\(/.test(l)) hits.push('  call ' + (i + 1) + ': ' + l.trim().slice(0, 160)); });
    out.push('## ' + f + '\n' + hits.slice(0, 14).join('\n'));
  });
  console.log(out.join('\n\n'));
});
