// Sonda SHV-5a (BL-076): cada llamada a mi voz y qué tests leen cada archivo. Solo lee. Se borra después de RUN-165.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } };

function calls(src, re) {
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    let i = src.indexOf('(', m.index), d = 0, j = i;
    for (; j < src.length; j++) { if (src[j] === '(') d++; else if (src[j] === ')') { d--; if (!d) break; } }
    const pre = src.slice(Math.max(0, m.index - 140), m.index).replace(/\s+/g, ' ');
    out.push('…' + pre.slice(-140) + ' ⟨' + src.slice(m.index, j + 1).replace(/\s+/g, ' ').slice(0, 260) + '⟩');
  }
  return out;
}

const FILES = ['ach-view', 'inv-view', 'act-view', 'act-week', 'home-view', 'acc-view', 'wv-view', 'raids-view', 'raids-sheet', 'meta-theme', 'converter-modal', 'shiruvana', 'shv-bubble', 'shiruvana-places'];

test('sonda SHV-5a', () => {
  const tests = fs.readdirSync(path.join(ROOT, 'tests')).filter((f) => /\.(c?js)$/.test(f));
  const tsrc = Object.fromEntries(tests.map((t) => [t, read('tests/' + t)]));
  for (const f of FILES) {
    const s = read('js/' + f + '.js');
    console.log('\n=== ' + f + '.js bytes=' + Buffer.byteLength(s) + ' ver=' + ((s.match(/VERSION\s*=\s*'([^']+)'/) || s.match(/version:\s*'([^']+)'/) || [])[1] || '?'));
    calls(s, /\.voice\(/g).forEach((c) => console.log('VOICE ' + c));
    calls(s, /\.speak\(/g).forEach((c) => console.log('SPEAK ' + c));
    const users = tests.filter((t) => tsrc[t].includes(f + '.js'));
    users.forEach((t) => {
      const v = (tsrc[t].match(new RegExp('.{0,60}(Versi[oó]n|VERSION|version|1\\.[0-9]+\\.[0-9]+).{0,60}', 'g')) || []).filter((l) => /\d+\.\d+\.\d+/.test(l)).slice(0, 4);
      const b = (tsrc[t].match(/.{0,50}(basis|Lo sé por|voice\().{0,50}/g) || []).slice(0, 3);
      console.log('TEST ' + t + ' | ' + v.join(' || ') + (b.length ? ' | VOZ ' + b.join(' || ') : ''));
    });
  }
  const g = (read('tests/size-budget.test.cjs') || read('tools/size-budget.cjs')).slice(0, 0);
  console.log('\nSIZE', g);
  const idx = read('index.html');
  console.log('INDEX shiruvana', (idx.match(/.{0,40}shiruvana(\.js|-places)[^"]*"/g) || []).join(' | '));
});
