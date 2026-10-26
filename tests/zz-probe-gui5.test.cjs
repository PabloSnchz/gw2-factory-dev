'use strict';
// Sonda GUI-5c (BL-071): con qué huella guarda la Cámara cada cuenta. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
test('sonda GUI-5c', () => {
  for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter((x) => /^wv-|^wizards|^router/.test(x))) {
    fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').split('\n').forEach((l, i) => {
      if (/fpToken|function fp|slice\(0, ?4\)|slice\(-4\)|setPinned\(|setMarks\(|WVSeasonStore\.\w+\(/.test(l)) console.log('FP ' + f + ':' + (i + 1) + ' ' + l.trim().slice(0, 170));
    });
  }
  const a = fs.readFileSync(path.join(ROOT, 'js', 'act-model.js'), 'utf8');
  a.split('\n').forEach((l, i) => { if (/huella|fingerprint|function fp|hash/i.test(l)) console.log('ACT act-model.js:' + (i + 1) + ' ' + l.trim().slice(0, 170)); });
});
