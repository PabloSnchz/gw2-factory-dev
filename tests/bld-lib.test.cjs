// BL-082 BLD-6/7/8/10/15: Biblioteca (js/bld-lib.js), su catálogo curado y Mis builds (js/bld-mine.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require('../js/bld-code.js');
globalThis.GNBldShow = require('../js/bld-show.js');
const L = require('../js/bld-lib.js');
const M = require('../js/bld-mine.js');
const C = globalThis.GNBldCode, P = L._pure;
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
const WATCH = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/watch.json'), 'utf8'));
// Las 36 élites (API oficial /v2/specializations, 2026-10-28) y su profesión.
const ELITES = { 1: [27, 62, 65, 81], 2: [18, 61, 68, 74], 3: [43, 57, 70, 75], 4: [5, 55, 72, 78], 5: [7, 58, 71, 77],
  6: [48, 56, 67, 80], 7: [40, 59, 66, 73], 8: [34, 60, 64, 76], 9: [52, 63, 69, 79] };
const SOURCES = /^https:\/\/(snowcrows\.com|metabattle\.com|hardstuck\.gg|guildjen\.com)\//;

test('versiones en la cabecera', () => {
  for (const [f, m] of [['bld-lib.js', L], ['bld-mine.js', M]]) {
    assert.match(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), /Versión: 1\.0\.0 /, f);
    assert.equal(m.version, '1.0.0');
  }
});

test('catálogo: cada build se lee, su profesión y élite coinciden y la fuente está permitida', () => {
  const ids = new Set();
  assert.ok(CAT.builds.length >= 72);
  CAT.builds.forEach((b) => {
    assert.ok(!ids.has(b.id), 'id repetido ' + b.id); ids.add(b.id);
    const r = C.parse(b.code);
    assert.ok(r.ok, b.id + ': ' + r.error);
    assert.equal(r.code, b.code, b.id + ': el código está normalizado');
    assert.equal(r.build.profession, b.prof, b.id + ': profesión');
    assert.equal(r.build.specs[2].id, b.elite, b.id + ': la élite está en la tercera línea');
    assert.ok(ELITES[b.prof].includes(b.elite), b.id + ': élite de su profesión');
    assert.deepEqual(r.problems, [], b.id + ': el juego lo acepta (sin habilidades repetidas)');
    assert.ok(['pve', 'wvw', 'pvp'].includes(b.mode), b.id);
    assert.match(b.source.url, SOURCES, b.id + ': fuente');
    assert.ok(b.source.name && b.name && b.eliteName, b.id);
    assert.match(b.patch, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(b.reviewed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(b.difficulty >= 1 && b.difficulty <= 5);
    assert.ok(Array.isArray(b.roles) && b.roles.length && b.roles.every((x) => P.ROLES[x]), b.id + ': roles');
    (b.weapons || []).forEach((w) => assert.ok(Object.values(C.WEAPONS).includes(w), b.id + ': arma ' + w));
  });
});

test('criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar»', () => {
  const latest = P.latestPatch(CAT, WATCH);
  const all = P.coverage(CAT.builds, latest, true), ok = P.coverage(CAT.builds, latest);
  assert.equal(all.pve, 36, 'PvE');
  assert.equal(all.wvw, 36, 'WvW');
  assert.equal(ok.pve, 36, 'PvE vigentes');
  assert.ok(ok.wvw >= 29, 'WvW vigentes');
  CAT.builds.filter((b) => P.stateOf(b, latest) === 'revisar').forEach((b) => assert.equal(b.source.name, 'MetaBattle', b.id + ': solo MetaBattle con parche declarado anterior'));
});

test('vigencia (D4): un parche más nuevo en la vigía pasa las builds a «revisar»', () => {
  const b = { patch: '2026-09-29' };
  assert.equal(P.stateOf(b, '2026-09-29'), 'vigente');
  assert.equal(P.stateOf(b, '2026-11-10'), 'revisar');
  assert.equal(P.latestPatch({ patch: { latest: '2026-09-29' } }, { latestPatch: '2026-11-10' }), '2026-11-10');
  assert.equal(P.latestPatch({ patch: { latest: '2026-09-29' } }, null), '2026-09-29');
});

test('filtros (A5): profesión, élite, modo, rol, arma, daño, vigencia y texto', () => {
  const B = CAT.builds, latest = P.latestPatch(CAT, WATCH);
  const f = (x) => P.filter(B, Object.assign({ prof: 0, elite: 0, mode: '', role: '', weapon: '', damage: '', state: '', q: '' }, x), latest);
  assert.equal(f({}).length, B.length);
  assert.ok(f({ prof: 1 }).every((b) => b.prof === 1));
  assert.ok(f({ prof: 1, mode: 'wvw', role: 'support' }).length >= 1, 'profesión, modo y rol en 3 toques');
  assert.ok(f({ mode: 'pve', role: 'alacrity' }).length >= 3);
  assert.ok(f({ damage: 'condition' }).every((b) => b.damage === 'condition'));
  assert.ok(f({ weapon: 'Spear' }).every((b) => b.weapons.includes('Spear')));
  assert.ok(f({ state: 'revisar' }).every((b) => b.patch < latest), 'para revisar = parche anterior al último');
  assert.ok(f({ q: 'luminaria' }).length >= 2);
});

test('tarjeta: datos escapados, fuente con crédito y aviso de build vieja prellenado', () => {
  const b = Object.assign({}, CAT.builds[0], { name: '<b>x</b>' });
  L._state.open = '';
  const h = P.cardHTML(b, '2026-12-01');
  assert.match(h, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(h, /revisar · era del parche/);
  assert.match(h, /data-bld-act="copy"/);
  assert.match(h, /target="_blank" rel="noopener"/);
  const u = P.issueUrl(CAT.builds[0], '2026-12-01');
  assert.match(u, /^https:\/\/github\.com\/PabloSnchz\/gw2-factory-dev\/issues\/new\?labels=build-vieja&title=/);
  assert.match(decodeURIComponent(u), /Último parche conocido: 2026-12-01/);
});

test('vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s)', () => {
  Object.assign(L._state, { cat: CAT, watch: WATCH, loading: false, error: '', open: '' });
  const t0 = Date.now();
  const h = P.viewHTML();
  assert.ok(Date.now() - t0 < 2000);
  assert.match(h, /<label class="bld-f" for="bldLibProf">/);
  assert.match(h, /élites cubiertas: PvE 36\/36, WvW 36\/36/);
  assert.match(h, /parche anterior al último de balance/, 'sin vigía nueva no habla de «salió un parche»');
  L._state.watch = Object.assign({}, WATCH, { latestPatch: '2026-11-10' });
  assert.match(P.viewHTML(), /salió un parche de balance \(10\/11\/2026\)/);
  L._state.watch = WATCH;
  assert.match(h, /role="group" aria-label="Modo"/);
});

test('Mis builds: lista vacía con caminos, filas con acciones y confirmación al borrar', () => {
  assert.match(M._pure.viewHTML([]), /Todavía no guardaste builds/);
  const b = { id: 'b1', code: CAT.builds[0].code, title: '<t>', profession: CAT.builds[0].prof, updated: Date.UTC(2026, 9, 28), source: { name: 'Snow Crows', url: 'https://snowcrows.com/x' } };
  let h = M._pure.viewHTML([b]);
  assert.match(h, /1 build guardada/);
  assert.match(h, /&lt;t&gt;/);
  for (const a of ['copy', 'toggle', 'edit', 'dup', 'del']) assert.match(h, new RegExp('data-mine="' + a + '"'));
  M._state.confirm = 'b1';
  h = M._pure.viewHTML([b]);
  assert.match(h, /data-mine="del-yes"/);
  M._state.confirm = '';
});
