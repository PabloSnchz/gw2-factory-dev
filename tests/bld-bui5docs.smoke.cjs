// BUI-5 sonda de documentos (borrar después): los pedazos de la memoria oficial que voy a tocar.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.join(__dirname, '..');
const M = path.join(ROOT, 'ai-memory');
const sha = (b) => crypto.createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
test('BUI-5 docs', () => {
  ['status.md', 'backlog.md', 'roadmap.md'].forEach((f) => {
    const b = fs.readFileSync(path.join(M, f));
    const s = b.toString('utf8');
    console.log('==== ' + f + ' sha=' + sha(b) + ' bytes=' + b.length);
    console.log(s.slice(0, f === 'status.md' ? 2600 : 600));
    console.log('---- líneas con BL-082 / FEAT-025 / BUI- (número: primeros 260 caracteres)');
    s.split('\n').forEach((l, i) => { if (/BL-082|FEAT-025|BUI-/.test(l)) console.log((i + 1) + ': ' + l.slice(0, 260)); });
  });
  ['features', 'decisions', 'lessons'].forEach((d) => {
    const all = fs.readdirSync(path.join(M, d)).sort();
    console.log('==== ' + d + ' (' + all.length + ') últimos: ' + all.slice(-6).join(', '));
    all.filter((f) => /FEAT-025|BL-082|builds/i.test(f)).forEach((f) => {
      const b = fs.readFileSync(path.join(M, d, f));
      console.log('---- ' + d + '/' + f + ' sha=' + sha(b) + ' bytes=' + b.length);
      console.log(b.toString('utf8'));
    });
  });
  ['features', 'decisions', 'lessons'].forEach((d) => {
    const all = fs.readdirSync(path.join(M, d)).sort();
    const last = all.filter((f) => f.endsWith('.md')).slice(-1)[0];
    if (last) console.log('==== ejemplo ' + d + '/' + last + '\n' + fs.readFileSync(path.join(M, d, last), 'utf8').slice(0, 1500));
  });
});
