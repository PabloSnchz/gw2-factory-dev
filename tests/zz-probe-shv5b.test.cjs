// Sonda SHV-5b..5d (BL-076): versiones fijadas en tests, línea de voz y cabecera de los 9 pendientes. Solo lee.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } };
const FILES = ['ach-view', 'inv-view', 'home-view', 'act-view', 'act-week', 'acc-view', 'wv-view', 'meta-theme', 'converter-modal'];

test('sonda SHV-5b', () => {
  const tests = fs.readdirSync(path.join(ROOT, 'tests')).filter((f) => /\.(c?js)$/.test(f) && !/zz-probe/.test(f));
  const man = JSON.parse(read('js/modules.json')).modules;
  const idx = read('index.html');
  for (const f of FILES) {
    const s = read('js/' + f + '.js');
    const ver = ((s.match(/VERSION\s*=\s*'([^']+)'/) || s.match(/version:\s*'([^']+)'/) || [])[1]) || '?';
    const mv = (man.find((m) => m.src === 'js/' + f + '.js') || {}).v || '-';
    const iv = (idx.match(new RegExp(f + '\\.js\\?v=([\\d.]+)')) || [])[1] || '-';
    console.log('\n=== ' + f + ' bytes=' + Buffer.byteLength(s) + ' VERSION=' + ver + ' manifest=' + mv + ' index=' + iv);
    s.split('\n').forEach((l, i) => {
      if (/Versi[oó]n:/.test(l) && i < 12) console.log('HEAD ' + (i + 1) + ': ' + l.slice(0, 200));
      if (/\.voice\(|\.speak\(/.test(l)) console.log('VOZ ' + (i + 1) + ': ' + l.trim().slice(0, 600));
      if (/VERSION\s*=/.test(l)) console.log('VAR ' + (i + 1) + ': ' + l.trim());
    });
    const esc = ver.replace(/\./g, '\\.');
    for (const t of tests) {
      const src = read('tests/' + t);
      if (!src.includes(f + '.js') && !src.includes(f)) continue;
      src.split('\n').forEach((l, i) => {
        if ((l.includes(ver) || l.includes(esc)) && /Versi|VERSION|version|\.v\b|v: '|modules/.test(l)) console.log('TEST ' + t + ':' + (i + 1) + ': ' + l.trim().slice(0, 260));
      });
    }
  }
});
