// BL-101 (2026-11-24): los DATOS VIVOS de Builds (assets/data/builds), los que la vigía builds-watch cambia cada semana.
// Acá va solo lo que tiene que valer con cualquier parche de balance: forma, códigos que el juego acepta, fuentes
// permitidas, las 36 élites cubiertas en PvE y WvW, fechas coherentes y el cruce con el bench. Cuántas builds están
// «vigentes» o «para revisar» depende del parche y NO es un error: la lógica se prueba con la foto fija
// (tests/fixtures/builds-mundo.cjs).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require('../js/bld-code.js');
globalThis.GNBldShow = require('../js/bld-show.js');
const L = require('../js/bld-lib.js');
const C = globalThis.GNBldCode, P = L._pure;
const leer = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds', f), 'utf8'));
const CAT = leer('catalog.json'), WATCH = leer('watch.json'), BENCH = leer('bench.json');
// Las 36 élites (API oficial /v2/specializations, 2026-10-28) y su profesión.
const ELITES = { 1: [27, 62, 65, 81], 2: [18, 61, 68, 74], 3: [43, 57, 70, 75], 4: [5, 55, 72, 78], 5: [7, 58, 71, 77],
  6: [48, 56, 67, 80], 7: [40, 59, 66, 73], 8: [34, 60, 64, 76], 9: [52, 63, 69, 79] };
const SOURCES = /^https:\/\/(snowcrows\.com|metabattle\.com|hardstuck\.gg|guildjen\.com)\//;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

test('catálogo vivo: cada build se lee, su profesión y élite coinciden y la fuente está permitida', () => {
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
    assert.match(b.patch, FECHA, b.id);
    assert.match(b.reviewed, FECHA, b.id);
    assert.ok(b.difficulty >= 1 && b.difficulty <= 5, b.id);
    assert.ok(Array.isArray(b.roles) && b.roles.length && b.roles.every((x) => P.ROLES[x]), b.id + ': roles');
    (b.weapons || []).forEach((w) => assert.ok(Object.values(C.WEAPONS).includes(w), b.id + ': arma ' + w));
  });
});

test('catálogo vivo: las 36 élites tienen build en PvE y en WvW, estén vigentes o «para revisar»', () => {
  const latest = P.latestPatch(CAT, WATCH);
  const all = P.coverage(CAT.builds, latest, true);
  assert.equal(all.pve, 36, 'PvE');
  assert.equal(all.wvw, 36, 'WvW');
});

test('fechas vivas coherentes: ninguna build es de un parche posterior al último conocido, y la vigía tiene fecha', () => {
  assert.match(WATCH.latestPatch, FECHA);
  assert.match(CAT.patch.latest, FECHA);
  const latest = P.latestPatch(CAT, WATCH);
  assert.ok(CAT.patch.latest <= latest);
  CAT.builds.forEach((b) => assert.ok(b.patch <= latest, b.id + ': parche ' + b.patch + ' posterior a ' + latest));
  CAT.builds.forEach((b) => assert.ok(['vigente', 'revisar'].includes(P.stateOf(b, latest)), b.id));
});

test('bench vivo: benchmarks de Snow Crows con forma fija, élite de su profesión y números sanos', () => {
  assert.equal(BENCH.source.name, 'Snow Crows');
  assert.match(BENCH.source.url, /^https:\/\/snowcrows\.com\//);
  assert.match(BENCH.fetched, FECHA);
  assert.deepEqual(BENCH.fields, ['path', 'prof', 'elite', 'damage', 'boon', 'difficulty', 'max', 'avg', 'log']);
  assert.ok(BENCH.rows.length >= 100, 'al menos 100 benchmarks');
  const seen = new Set();
  BENCH.rows.forEach((r) => {
    const [p, prof, elite, dmg, boon, diff, max, avg, log] = r;
    assert.match(p, /^[a-z]+\/[a-z0-9-]+$/, p); assert.ok(!seen.has(p), 'repetido ' + p); seen.add(p);
    assert.ok(prof >= 1 && prof <= 9, p);
    assert.ok(elite === 0 || ELITES[prof].includes(elite), p + ': élite de su profesión');
    assert.ok(['power', 'condition', 'hybrid'].includes(dmg) && ['', 'quickness', 'alacrity', 'boon'].includes(boon), p);
    assert.ok(diff >= 0 && diff <= 5, p);
    assert.ok(max > 10000 && max < 80000 && avg > 10000 && Math.abs(max - avg) < 0.1 * max, p + ': DPS sano');
    assert.match(log, /^[A-Za-z0-9_-]*$/, p);
  });
});

test('cruce vivo catálogo ↔ bench: cada build que encuentra bench es de PvE, de Snow Crows y de su misma élite', () => {
  const idx = P.benchIndex(BENCH);
  const hits = CAT.builds.filter((b) => P.benchOf(b, idx));
  // El 28/10 eran 20 o más; el 24/11, después de la curación del 23/11, son 16. Lo investiga BL-101 paso 2.
  // Este piso no es la meta: solo avisa si el cruce se cae del todo (por ejemplo, si cambian las direcciones).
  assert.ok(hits.length >= 10, 'al menos 10 builds con bench (' + hits.length + ')');
  hits.forEach((b) => {
    const m = P.benchOf(b, idx);
    assert.equal(b.mode, 'pve', b.id);
    assert.equal(b.source.name, 'Snow Crows', b.id);
    assert.equal(m.elite, b.elite, b.id + ': el bench es de su misma élite');
    assert.equal(m.prof, b.prof, b.id);
  });
  CAT.builds.filter((b) => b.mode !== 'pve').forEach((b) => assert.equal(P.benchOf(b, idx), null, b.id));
});
