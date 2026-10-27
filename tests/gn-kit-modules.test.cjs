// BL-078 UNI-3: el reloj común (js/gn-kit.js) en Actividades, Cámara del Brujo y Heredad.
// Cada módulo, con GNKit cargado, dibuja sus relojes con el reloj común; sin GNKit, sus píldoras de siempre
// (eso lo siguen probando act-view, wv-view y home-view.test.cjs). Corre con: node --test tests/*.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = Date.parse('2026-10-27T21:31:00Z'); // martes

function sandbox(files, kit) {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  if (kit) vm.runInContext(read('js/gn-kit.js'), sb, { filename: 'gn-kit.js' });
  files.forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  return sb;
}
const gk = (h, k) => new RegExp('<span class="gk[^"]*" data-gk="' + k + '"').test(h);

test('Actividades: reset diario, PSNA y semanal con el reloj común, en ese orden', () => {
  const sb = sandbox(['js/act-model.js', 'js/act-view.js'], true);
  const V = sb.ActView._pure;
  const h = V.viewHTML(V.buildModel({}, {}, {}, T));
  ['daily', 'psna', 'weekly'].forEach((k) => assert.ok(gk(h, k), k));
  assert.ok(h.indexOf('data-gk="daily"') < h.indexOf('data-gk="psna"') && h.indexOf('data-gk="psna"') < h.indexOf('data-gk="weekly"'));
  assert.match(h, /<small>PSNA<\/small><b>en 10 h 29 min<\/b>/);
  assert.doesNotMatch(h, /class="av-pill"/, 'sin las píldoras viejas');
  const old = sandbox(['js/act-model.js', 'js/act-view.js'], false).ActView._pure;
  assert.match(old.viewHTML(old.buildModel({}, {}, {}, T)), /class="av-pill"/, 'sin GNKit, como antes');
});

test('Cámara del Brujo: reset diario y semanal con el reloj común', () => {
  const sb = sandbox(['js/wv-view.js'], true);
  const V = sb.WVView._pure;
  const m = { season: 'Temporada actual', aa: null, aaNote: '', daily: null, weekly: null, spent: null, view: { tab: 'objectives', sub: 'daily' },
    counts: {}, ready: 0, pinned: 0, accounts: 0, whyOpen: false, accountsSub: 'weekly', dailyLeft: '2 h 29 min', weeklyLeft: '5 d 9 h', now: T };
  const h = V.headHTML(m);
  assert.ok(gk(h, 'daily') && gk(h, 'weekly'));
  assert.match(h, /<small>Reset semanal<\/small><b>en 5 d 9 h<\/b>/);
  assert.doesNotMatch(h, /class="wvx-pill[ "]/, 'sin las píldoras viejas');
  assert.match(h, /data-wvx="refresh"/, 'el botón Actualizar sigue');
  assert.match(sandbox(['js/wv-view.js'], false).WVView._pure.headHTML(m), /class="wvx-pill"/, 'sin GNKit, como antes');
});

test('Heredad: el reset diario con el reloj común', () => {
  const sb = sandbox(['js/home-view.js'], true);
  const V = sb.HomeView._pure;
  const h = V.viewHTML(V.buildModel({}, {}, {}, T), null);
  assert.ok(gk(h, 'daily'));
  assert.match(h, /<small>Reset diario<\/small><b>en 2 h 29 min<\/b>/);
  assert.doesNotMatch(h, /hs-pillr/, 'sin la píldora vieja');
  assert.match(h, /data-hs="refresh"/, 'el botón Actualizar sigue');
  const old = sandbox(['js/home-view.js'], false).HomeView._pure;
  assert.match(old.viewHTML(old.buildModel({}, {}, {}, T), null), /hs-pillr/, 'sin GNKit, como antes');
});

test('los tres módulos se cargan después de gn-kit.js en el manifiesto', () => {
  const man = JSON.parse(read('js/modules.json')).modules.map((x) => x.src);
  ['js/act-view.js', 'js/wv-view.js', 'js/home-view.js'].forEach((f) => assert.ok(man.indexOf('js/gn-kit.js') < man.indexOf(f), f));
});
