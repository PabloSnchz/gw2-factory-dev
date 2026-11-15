// Sonda temporal EQ-9b: quién prueba bld-import y cómo se reconocen los códigos de la Biblioteca. Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const T = path.join(ROOT, 'tests');
for (const f of fs.readdirSync(T)) {
  if (!/\.(cjs|js)$/.test(f) || f === 'eq9-probe.smoke.cjs') continue;
  const s = fs.readFileSync(path.join(T, f), 'utf8').split('\n');
  s.forEach((l, i) => { if (/bld-import|GNBldImport|bld-editor\.js'|GNBldEditor\b/.test(l)) console.log(f + ':' + (i + 1) + ': ' + l.slice(0, 220)); });
}
globalThis.GNBldCode = require('../js/bld-code.js');
const C = globalThis.GNBldCode;
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
const norm = (c) => { const r = C.parse(c); return r.ok ? r.code : ''; };
const seen = {};
let bad = 0;
CAT.builds.forEach((b) => { const k = norm(b.code); if (!k) bad++; (seen[k] = seen[k] || []).push(b.id); });
const dup = Object.entries(seen).filter(([, v]) => v.length > 1);
console.log('builds', CAT.builds.length, 'sin parsear', bad, 'códigos repetidos', dup.length);
dup.slice(0, 8).forEach(([k, v]) => console.log('  dup', v.join(', ')));
const b0 = CAT.builds[0];
console.log('parse keys', Object.keys(C.parse(b0.code)), 'same?', C.parse(b0.code).code === b0.code);
const lib = fs.readFileSync(path.join(ROOT, 'js/bld-lib.js'), 'utf8');
(lib.match(/function (preload|byId|byCode|list)\b[^\n]*/g) || []).forEach((l) => console.log('lib:', l.slice(0, 200)));
const mine = fs.readFileSync(path.join(ROOT, 'js/bld-mine.js'), 'utf8');
const i = mine.indexOf('function baseOf');
console.log('mine.baseOf:', mine.slice(i, i + 600));
const ed = fs.readFileSync(path.join(ROOT, 'js/bld-editor.js'), 'utf8');
console.log('editor bytes', ed.length);
