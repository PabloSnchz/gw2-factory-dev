// Sonda (borrar después): cabecera de status.md y las líneas de BL-084 / BL-083 en status, backlog y features.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.join(__dirname, '..');
const blob = (b) => crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + b.length + '\0'), b])).digest('hex');

test('docs peek', () => {
  for (const f of ['ai-memory/status.md', 'ai-memory/backlog.md']) {
    const b = fs.readFileSync(path.join(ROOT, f));
    const L = b.toString('utf8').split('\n');
    console.log('==== ' + f + ' blob ' + blob(b) + ' líneas ' + L.length);
    const head = f.endsWith('status.md') ? 45 : 12;
    L.slice(0, head).forEach((l, i) => console.log((i + 1) + ': ' + l.slice(0, 400)));
    L.forEach((l, i) => { if (i >= head && /BL-084|BL-083/.test(l)) console.log((i + 1) + ': ' + l.slice(0, 600)); });
  }
  const fd = path.join(ROOT, 'ai-memory', 'features');
  const fs2 = fs.readdirSync(fd).sort();
  console.log('features: ' + fs2.slice(-4).join(', '));
  const last = fs.readFileSync(path.join(fd, fs2[fs2.length - 1]), 'utf8');
  console.log(last.slice(0, 1500));
  const ld = path.join(ROOT, 'ai-memory', 'lessons');
  console.log('lessons: ' + fs.readdirSync(ld).sort().slice(-3).join(', '));
});
