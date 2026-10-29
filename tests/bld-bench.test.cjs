// BL-082 BENCH-2: referencia de daño por parecido (js/bld-bench.js) para la Biblioteca y Mis builds. Sin red.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require('../js/bld-code.js');
const B = require('../js/bld-bench.js');
const L = require('../js/bld-lib.js');
const C = globalThis.GNBldCode, P = B._pure, LP = L._pure;
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
const BENCH = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/bench.json'), 'utf8'));
const IDX = LP.benchIndex(BENCH);
const THIEF = '[&DQUAAAAAAAAkDyQPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLwBVAAA=]';

function row(path, prof, elite, damage, boon, max) { return { path, prof, elite, damage, boon, difficulty: 2, max, avg: max - 100, log: '' }; }
const MINI = { top: 40000, n: 4, rows: {} };
[row('revenant/power-herald-staff-sword-sword', 9, 52, 'power', '', 36921),
  row('revenant/power-quickness-herald-staff-sword-sword', 9, 52, 'power', 'quickness', 30311),
  row('revenant/condition-quickness-herald-spear-mace-axe', 9, 52, 'condition', 'quickness', 31339),
  row('revenant/power-renegade-greatsword-sword-sword', 9, 63, 'power', '', 40000)].forEach((r) => { MINI.rows[r.path] = r; });

test('versión en la cabecera', () => {
  assert.match(fs.readFileSync(path.join(ROOT, 'js', 'bld-bench.js'), 'utf8'), /Versión: 1\.0\.0 /);
  assert.equal(B.version, '1.0.0');
});

test('puntaje: élite obligatoria; después daño, rol de bendiciones y armas; a igual puntaje, el de más DPS', () => {
  assert.equal(P.boonOf(['dps']), ''); assert.equal(P.boonOf(['dps', 'quickness']), 'quickness'); assert.equal(P.boonOf(['alacrity']), 'alacrity');
  assert.equal(P.score({ prof: 9, elite: 63 }, MINI.rows['revenant/power-herald-staff-sword-sword']), null, 'otra élite no sirve');
  let r = P.ref({ prof: 9, elite: 52, damage: 'condition', boon: 'quickness', weapons: [] }, MINI);
  assert.equal(r.row.path, 'revenant/condition-quickness-herald-spear-mace-axe');
  assert.deepEqual(r.why, ['misma élite', 'mismo tipo de daño', 'mismo rol de bendiciones']);
  r = P.ref({ prof: 9, elite: 52, damage: 'power', boon: 'quickness', weapons: ['Staff', 'Sword', 'Sword'] }, MINI);
  assert.equal(r.row.path, 'revenant/power-quickness-herald-staff-sword-sword', 'el rol pesa más que el DPS más alto');
  assert.ok(r.why.includes('2 armas en común'), 'armas repetidas cuentan una vez');
  r = P.ref({ prof: 9, elite: 52, damage: '', boon: null, weapons: [] }, MINI);
  assert.equal(r.row.max, 36921, 'sin saber nada más: el techo de la élite');
  assert.deepEqual(r.why, ['misma élite']);
  assert.equal(P.ref({ prof: 9, elite: 69 }, MINI), null, 'élite sin mediciones: nada');
  assert.equal(P.ref(null, MINI), null); assert.equal(P.ref({ prof: 9, elite: 52 }, null), null);
});

test('Biblioteca: toda build de PvE que hace daño y no tiene bench exacto recibe una referencia de su misma élite', () => {
  const pve = CAT.builds.filter((b) => b.mode === 'pve');
  let refs = 0;
  pve.forEach((b) => {
    const r = B.forLib(b, IDX);
    if ((b.roles || []).some((x) => x === 'heal' || x === 'support')) { assert.equal(r, null, b.id + ': curación/tanque no se compara con un DPS'); return; }
    const has = BENCH.rows.some((x) => x[1] === b.prof && x[2] === b.elite);
    if (!has) { assert.equal(r, null, b.id); return; }
    assert.ok(r, b.id + ': tiene referencia');
    assert.equal(r.row.prof, b.prof); assert.equal(r.row.elite, b.elite, b.id + ': misma élite');
    if (!LP.benchOf(b, IDX)) refs++;
  });
  assert.ok(refs >= 5, 'al menos 5 builds de PvE sin bench exacto ganan referencia (' + refs + ')');
  CAT.builds.filter((b) => b.mode !== 'pve').forEach((b) => assert.equal(B.forLib(b, IDX), null, b.id + ': WvW/PvP sin golem'));
});

test('parecido por líneas y rasgos: el mismo código es 100 %, otra profesión 0 %', () => {
  const a = C.parse(CAT.builds[0].code).build;
  assert.equal(P.likeness(a, a), 100);
  const other = CAT.builds.find((b) => b.prof !== CAT.builds[0].prof);
  assert.equal(P.likeness(a, C.parse(other.code).build), 0);
  assert.equal(P.likeness(null, a), 0);
});

test('Mis builds: la de la Biblioteca con bench muestra ese bench; si la cambiaste, lo dice', () => {
  const src = CAT.builds.find((b) => LP.benchOf(b, IDX));
  let r = B.forMine({ code: src.code, source: src.source }, CAT, IDX, LP.benchOf);
  assert.equal(r.kind, 'base');
  assert.equal(r.row, LP.benchOf(src, IDX));
  assert.match(B.html(r, IDX), /la build de la Biblioteca en que se basa<\/span>/);
  const b = C.parse(src.code).build; b.skills.land[1] = 0; const changed = C.encode(b);
  r = B.forMine({ code: changed, source: src.source }, CAT, IDX, LP.benchOf);
  assert.equal(r.kind, 'base');
  assert.match(B.html(r, IDX), /la cambiaste: tu DPS puede ser otro/);
});

test('Mis builds: sin fuente, la más parecida de la Biblioteca decide; WvW y curación lo dicen en vez de un número', () => {
  const w = CAT.builds.find((b) => b.mode === 'wvw' && !CAT.builds.some((x) => x.code === b.code && x.mode === 'pve'));
  let r = B.forMine({ code: w.code }, CAT, IDX, LP.benchOf);
  assert.equal(r.kind, 'mode');
  assert.match(B.html(r, IDX), /\(WvW\) y ahí no hay golem/);
  const h = CAT.builds.find((b) => b.mode === 'pve' && (b.roles || []).includes('heal'));
  if (h) {
    r = B.forMine({ code: h.code }, CAT, IDX, LP.benchOf);
    assert.equal(r.kind, 'heal');
    assert.match(B.html(r, IDX), /eso Snow Crows no lo mide/);
  }
  // Una variante de una build sin bench exacto: referencia con el parecido y por qué.
  const v = CAT.builds.find((b) => b.mode === 'pve' && !LP.benchOf(b, IDX) && B.forLib(b, IDX));
  if (v) {
    r = B.forMine({ code: v.code }, CAT, IDX, LP.benchOf);
    assert.equal(r.kind, 'ref');
    assert.equal(r.like.name, v.name);
    assert.match(B.html(r, IDX), /no tiene medición propia; es la medición más parecida \(misma élite/);
  }
});

test('Mis builds: un código que no se parece a nada usa solo la élite (o el núcleo) y lo dice', () => {
  const r = B.forMine({ code: THIEF }, CAT, IDX, LP.benchOf);
  assert.equal(P.eliteOfBuild(C.parse(THIEF).build, CAT, IDX), 0, 'sin élite en la tercera línea: núcleo');
  assert.ok(r && r.kind === 'ref', 'el ladrón de núcleo tiene mediciones');
  assert.equal(r.row.elite, 0); assert.equal(r.row.prof, 5);
  assert.equal(r.like, undefined);
  assert.equal(B.forMine({ code: 'roto' }, CAT, IDX, LP.benchOf), null);
  assert.equal(B.forMine({ code: THIEF }, CAT, LP.benchIndex(null), LP.benchOf), null, 'sin bench cargado: nada');
});

test('vista: «Referencia», no es el DPS de la build, barra rayada de adorno y todo escapado', () => {
  const r = { kind: 'ref', row: Object.assign({}, MINI.rows['revenant/power-herald-staff-sword-sword'], { log: 'ab-12' }), why: ['misma élite', '<x>'], like: { name: '<b>', pct: 75 } };
  const h = B.html(r, MINI);
  assert.match(h, /class="bld-bench is-ref"/);
  assert.match(h, /<span class="bld-ref-k">Referencia<\/span><b>36\.921 DPS<\/b>/);
  assert.match(h, /Power herald staff sword sword · 92 % de la mejor/);
  assert.match(h, /No es el DPS de esta build: se parece en un 75 % a «&lt;b&gt;» de la Biblioteca; es la medición más parecida \(misma élite, &lt;x&gt;\)/);
  assert.match(h, /href="https:\/\/dps\.report\/ab-12" target="_blank" rel="noopener"/);
  assert.match(h, /<span class="bld-bench-bar" aria-hidden="true"><i style="width:92%"><\/i><\/span>/);
  assert.equal(B.html(null, MINI), '');
  assert.match(P.CSS, /\.bld-bench\.is-ref \.bld-bench-bar>i\{background:repeating-linear-gradient/);
  assert.doesNotMatch(P.CSS, /#[0-9a-fA-F]{3,8}\b/, 'solo colores del tema');
});
