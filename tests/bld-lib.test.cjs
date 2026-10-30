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
const BENCH = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/bench.json'), 'utf8'));
// Las 36 élites (API oficial /v2/specializations, 2026-10-28) y su profesión.
const ELITES = { 1: [27, 62, 65, 81], 2: [18, 61, 68, 74], 3: [43, 57, 70, 75], 4: [5, 55, 72, 78], 5: [7, 58, 71, 77],
  6: [48, 56, 67, 80], 7: [40, 59, 66, 73], 8: [34, 60, 64, 76], 9: [52, 63, 69, 79] };
const SOURCES = /^https:\/\/(snowcrows\.com|metabattle\.com|hardstuck\.gg|guildjen\.com)\//;

test('versiones en la cabecera', () => {
  for (const [f, m, v] of [['bld-lib.js', L, '1.9.0'], ['bld-mine.js', M, '1.4.0']]) {
    assert.match(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), new RegExp('Versión: ' + v.replace(/\./g, '\\.') + ' '), f);
    assert.equal(m.version, v, f);
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
  assert.match(h, /role="group" aria-label="Profesión"/);
  assert.match(h, /<label class="bld-f" for="bldLibWeapon">/);
  assert.match(h, /élites cubiertas: PvE 36\/36, WvW 36\/36/);
  assert.match(h, /parche anterior al último de balance/, 'sin vigía nueva no habla de «salió un parche»');
  L._state.watch = Object.assign({}, WATCH, { latestPatch: '2026-11-10' });
  assert.match(P.viewHTML(), /salió un parche de balance \(10\/11\/2026\)/);
  L._state.watch = WATCH;
  assert.match(h, /role="group" aria-label="Modo"/);
});

// BUI-2: identidad oficial simulada (la daría GNBldRef.identity()).
const RG = 'https://render.guildwars2.com/file/';
function fakeIdent() {
  const id = { profs: {}, elites: {} };
  for (const [p, els] of Object.entries(ELITES)) {
    id.profs[p] = { name: C.PROF_ES[p], icon: RG + 'p' + p + '.png', iconBig: RG + 'P' + p + '.png', elites: els.slice().reverse() };
    els.forEach((e) => { id.elites[e] = { name: 'E' + e, icon: RG + 'e' + e + '.png', iconBig: RG + 'E' + e + '.png' }; });
  }
  return id;
}
function el(attrs, opts) {
  opts = opts || {};
  const me = {
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    classList: { contains: (c) => (opts.classes || []).includes(c) },
    closest: (sel) => (opts.match || []).some((m) => sel.split(',').includes(m)) ? me : (opts.parent ? opts.parent.closest(sel) : null),
  };
  return me;
}

test('BUI-2 filtros: profesiones con su ícono oficial (o su nombre mientras cargan), élites al elegir una, chips y «Más filtros»', () => {
  const B = CAT.builds;
  const f0 = { prof: 0, elite: 0, mode: '', role: '', weapon: '', damage: '', state: '', q: '' };
  globalThis.GNBldRef = { identitySync: () => null };
  let h = P.filtersHTML(CAT, f0);
  assert.match(h, /data-lib-prof="1"[^>]*aria-label="Guardián"[^>]*><span>Guardián<\/span>/, 'sin íconos todavía: el nombre');
  assert.doesNotMatch(h, /data-lib-elite/, 'sin profesión elegida no hay élites');
  assert.doesNotMatch(h, /<details class="bld-more" data-lib-more open/, '«Más filtros» cerrado si no hay nada puesto');
  const id = fakeIdent();
  globalThis.GNBldRef = { identitySync: () => id };
  h = P.filtersHTML(CAT, Object.assign({}, f0, { prof: 1, mode: 'pve', role: 'dps' }));
  assert.match(h, /data-lib-prof="1" aria-pressed="true"[^>]*>.*p1\.png/, 'ícono oficial de la profesión');
  const els = [...h.matchAll(/data-lib-elite="(\d+)"/g)].map((m) => Number(m[1])).filter(Boolean);
  assert.deepEqual(els, ELITES[1].slice().reverse(), 'las 4 élites del Guardián en el orden de la API');
  assert.match(h, /data-lib-elite="27"[^>]*>.*e27\.png/, 'emblema de la élite');
  assert.match(h, /data-lib-p="mode" data-v="pve" aria-pressed="true"/);
  assert.match(h, /data-lib-p="role" data-v="dps" aria-pressed="true"/);
  h = P.filtersHTML(CAT, Object.assign({}, f0, { weapon: 'Spear', state: 'revisar' }));
  assert.match(h, /data-lib-more open><summary>Más filtros \(2\)/, 'se abre solo y cuenta lo que hay puesto');
  assert.match(h, /data-lib="clear"/);
  assert.equal(P.moreCount({ q: 'x', damage: 'power', weapon: 'Spear' }), 2, 'EQ-3b: la búsqueda va en la barra, no cuenta en «Más filtros»');
  delete globalThis.GNBldRef;
  assert.ok(B.length > 0);
});

test('BUI-2 tarjeta: emblema de la élite, «Copiar código» principal, «Ver ficha» y el resto en el menú ⋯', () => {
  globalThis.GNBldRef = { identitySync: () => fakeIdent() };
  L._state.open = '';
  const b = CAT.builds.find((x) => x.elite === 74);
  const h = P.cardHTML(b, P.latestPatch(CAT, WATCH));
  assert.match(h, /bld-emb bld-lib-emb" title="E74"><img class="" src="https:\/\/render\.guildwars2\.com\/file\/E74\.png" width="56"/);
  assert.match(h, /class="bld-btn is-primary" data-bld-act="copy">Copiar código/);
  assert.match(h, /data-lib="toggle" aria-expanded="false">Ver ficha/);
  const menu = h.slice(h.indexOf('<details class="bld-menu">'));
  assert.match(menu, /aria-label="Más acciones: /);
  for (const re of [/data-bld-act="save"/, /Abrir en Snow Crows ↗/, /Avisar que está vieja ↗/]) assert.match(menu, re);
  assert.doesNotMatch(h.slice(0, h.indexOf('<details class="bld-menu">')), /data-bld-act="save"/, 'guardar va en el menú');
  delete globalThis.GNBldRef;
});

test('BUI-2 clics: profesión limpia la élite, chips, «Sacar filtros» y tocar la tarjeta abre la ficha (no en botones ni en el menú)', () => {
  const host = { innerHTML: '', contains: () => false, querySelector: () => null };
  const ctx = { host, ref: { load: () => new Promise(() => {}) } };
  Object.assign(L._state, { cat: CAT, watch: WATCH, loading: false, error: '', open: '' });
  L._state.f = { prof: 2, elite: 74, mode: '', role: '', weapon: '', damage: '', state: '', q: '' };
  assert.equal(P.onClick(ctx, { target: el({ 'data-lib-prof': '1' }, { match: ['[data-lib-prof]'] }) }), 'prof');
  assert.equal(L._state.f.prof, 1);
  assert.equal(L._state.f.elite, 0, 'cambiar de profesión saca la élite');
  P.onClick(ctx, { target: el({ 'data-lib-elite': '27' }, { match: ['[data-lib-elite]'] }) });
  assert.equal(L._state.f.elite, 27);
  P.onClick(ctx, { target: el({ 'data-lib-p': 'mode', 'data-v': 'wvw' }, { match: ['[data-lib-p]'] }) });
  assert.equal(L._state.f.mode, 'wvw');
  assert.match(host.innerHTML, /data-lib-p="mode" data-v="wvw" aria-pressed="true"/);
  assert.equal(P.onClick(ctx, { target: el({ 'data-lib': 'clear' }, { match: ['[data-lib]'] }) }), 'clear');
  assert.deepEqual([L._state.f.prof, L._state.f.elite, L._state.f.mode], [0, 0, '']);
  const id = CAT.builds[0].id;
  const card = el({ 'data-id': id }, { match: ['.bld-lib-card', '[data-id]'] });
  assert.equal(P.onClick(ctx, { target: el({}, { parent: card }) }), 'card');
  assert.equal(L._state.open, id);
  assert.equal(P.onClick(ctx, { target: el({}, { match: ['summary'], parent: card }) }), '', 'el menú ⋯ no abre ni cierra la ficha');
  assert.equal(L._state.open, id);
  L._state.open = '';
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

test('BUI-4 Mis builds con la tarjeta de la Biblioteca: emblema de su élite, «Copiar código» principal y el resto en ⋯', () => {
  const src = CAT.builds.find((x) => x.elite === 74);
  const b = { id: 'b2', code: src.code, title: 'Mi Paragón', profession: src.prof, updated: Date.UTC(2026, 9, 29) };
  assert.equal(M._pure.eliteOf(b), 74, 'la élite sale del código');
  assert.equal(M._pure.eliteOf({ code: 'roto' }), 0);
  globalThis.GNBldRef = { identitySync: () => ({ profs: { 2: { name: 'Guerrero', icon: RG + 'p2.png', iconBig: RG + 'P2.png' } }, elites: { 74: { name: 'Paragón', icon: RG + 'e74.png', iconBig: RG + 'E74.png' } } }) };
  M._state.confirm = ''; M._state.open = '';
  let h = M._pure.rowHTML(b);
  assert.match(h, /class="bld-emb bld-mine-emb" title="Paragón"><img class="" src="https:\/\/render\.guildwars2\.com\/file\/E74\.png" width="56"/);
  assert.match(h, /class="bld-btn is-primary" data-mine="copy">Copiar código/);
  assert.match(h, /data-mine="toggle" aria-expanded="false">Ver ficha/);
  const menu = h.slice(h.indexOf('<details class="bld-menu">'));
  for (const a of ['edit', 'dup', 'del']) assert.match(menu, new RegExp('data-mine="' + a + '"'), a + ' va en el menú');
  M._state.confirm = 'b2';
  h = M._pure.rowHTML(b);
  assert.match(h, /class="bld-mine-ask" role="alert"><span>¿Borro «Mi Paragón»\?/, 'la confirmación queda a la vista, fuera del menú');
  M._state.confirm = '';
  delete globalThis.GNBldRef;
});

test('BUI-4 preload: un solo pedido del catálogo y de la vigía, aunque lo pidan la cabecera y la Biblioteca a la vez', async () => {
  const st = L._state, prev = { cat: st.cat, watch: st.watch, pre: st.pre, f: globalThis.fetch };
  st.cat = null; st.watch = null; st.pre = null;
  const urls = [];
  globalThis.fetch = async (u) => { urls.push(u); return { ok: true, json: async () => (/catalog/.test(u) ? CAT : /bench/.test(u) ? BENCH : WATCH) }; };
  const [a, b] = await Promise.all([L.preload(), L.preload()]);
  assert.equal(a, b);
  assert.equal(st.cat, CAT);
  assert.deepEqual(urls, ['assets/data/builds/catalog.json', 'assets/data/builds/watch.json', 'assets/data/builds/bench.json']);
  assert.ok(st.bidx.n > 100, 'bench indexado');
  await L.preload();
  assert.equal(urls.length, 3, 'ya cargado: nada nuevo');
  st.cat = null; st.pre = null;
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(L.preload(), /503/);
  assert.equal(st.pre, null, 'si falla se puede volver a pedir');
  Object.assign(st, { cat: prev.cat, watch: prev.watch, pre: prev.pre });
  if (prev.f) globalThis.fetch = prev.f; else delete globalThis.fetch;
});

// BENCH-1: el bench de Snow Crows en la Biblioteca.
test('BENCH-1 bench.json: benchmarks de Snow Crows con forma fija, élite de su profesión y números sanos', () => {
  assert.equal(BENCH.source.name, 'Snow Crows');
  assert.match(BENCH.source.url, /^https:\/\/snowcrows\.com\//);
  assert.match(BENCH.fetched, /^\d{4}-\d{2}-\d{2}$/);
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

test('BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no', () => {
  const idx = P.benchIndex(BENCH);
  assert.equal(idx.n, BENCH.rows.length);
  assert.equal(idx.top, Math.max(...BENCH.rows.map((r) => r[6])));
  assert.equal(P.benchKey('https://snowcrows.com/builds/raids/guardian/power-dragonhunter-radiance-spear-greatsword'), 'guardian/power-dragonhunter-radiance-spear-greatsword');
  assert.equal(P.benchKey('https://snowcrows.com/en/builds/guardian/x-y'), 'guardian/x-y');
  assert.equal(P.benchKey('https://metabattle.com/wiki/Build:x'), '');
  const hits = CAT.builds.filter((b) => P.benchOf(b, idx));
  assert.ok(hits.length >= 20, 'al menos 20 builds con bench (' + hits.length + ')');
  hits.forEach((b) => {
    const m = P.benchOf(b, idx);
    assert.equal(b.mode, 'pve'); assert.equal(b.source.name, 'Snow Crows');
    assert.equal(m.elite, b.elite, b.id + ': el bench es de su misma élite');
    assert.equal(m.prof, b.prof, b.id);
  });
  CAT.builds.filter((b) => b.mode !== 'pve').forEach((b) => assert.equal(P.benchOf(b, idx), null, b.id));
  assert.equal(P.benchIndex(null).n, 0); assert.equal(P.benchIndex({ fields: 'x' }).n, 0);
  const evil = P.benchIndex({ fields: ['path', 'max', 'log'], rows: [['a/b', 40000, '"><x'], ['c/d', 0, ''], [7, 1, '']] });
  assert.equal(evil.n, 1); assert.equal(evil.rows['a/b'].log, '', 'un registro raro no se enlaza');
});

test('BENCH-1 tarjeta: DPS máximo y promedio, % de la mejor, barra y registro; sin bench dice por qué', () => {
  const idx = P.benchIndex(BENCH), b = CAT.builds.find((x) => P.benchOf(x, idx)), m = P.benchOf(b, idx);
  assert.equal(P.fmtN(46309), '46.309'); assert.equal(P.fmtN(950), '950');
  const h = P.benchHTML(b, idx), pct = Math.round(m.max / idx.top * 100);
  assert.match(h, new RegExp('<b>' + P.fmtN(m.max).replace('.', '\\.') + ' DPS</b>'));
  assert.match(h, new RegExp('promedio ' + P.fmtN(m.avg).replace('.', '\\.') + ' · ' + pct + ' % de la mejor'));
  assert.match(h, new RegExp('<i style="width:' + pct + '%"></i>'));
  assert.match(h, /aria-hidden="true"/, 'la barra es adorno: el número está en texto');
  assert.match(h, /techo ideal/);
  if (m.log) assert.match(h, /href="https:\/\/dps\.report\/[A-Za-z0-9_-]+" target="_blank" rel="noopener">registro ↗/);
  const boon = CAT.builds.find((x) => P.benchOf(x, idx) && x.roles.some((r) => r !== 'dps'));
  if (boon) assert.match(P.benchHTML(boon, idx), /además da bendiciones/);
  const w = CAT.builds.find((x) => x.mode === 'wvw');
  assert.match(P.benchHTML(w, idx), /Sin bench de daño: en WvW no hay golem/);
  const isHeal = (x) => x.roles.some((r) => r === 'heal' || r === 'support');
  const heal = CAT.builds.find((x) => x.mode === 'pve' && !P.benchOf(x, idx) && isHeal(x)) || CAT.builds.find((x) => x.mode === 'pve' && !P.benchOf(x, idx));
  const saveB = globalThis.GNBldBench; delete globalThis.GNBldBench;
  assert.match(P.benchHTML(heal, idx), /Sin bench de daño: Snow Crows no publica bench de esta variante/, 'sin bld-bench: el porqué de siempre');
  globalThis.GNBldBench = require('../js/bld-bench.js');
  const dps = CAT.builds.find((x) => x.mode === 'pve' && !P.benchOf(x, idx) && globalThis.GNBldBench.forLib(x, idx));
  if (dps) assert.match(P.benchHTML(dps, idx), /class="bld-bench is-ref"[\s\S]*No es el DPS de esta build/, 'BENCH-2: la referencia en la tarjeta');
  if (isHeal(heal)) assert.match(P.benchHTML(heal, idx), /Sin bench de daño: Snow Crows no publica/, 'BENCH-2: curación y tanque siguen sin número');
  if (saveB) globalThis.GNBldBench = saveB; else delete globalThis.GNBldBench;
  L._state.bidx = idx; L._state.open = '';
  assert.match(P.cardHTML(b, '2026-01-01'), /class="bld-bench"/, 'la tarjeta lo muestra');
});

test('BENCH-1 «Más DPS primero»: de mayor a menor, las sin bench al final y en su orden; el chip aparece si hay bench', () => {
  const idx = P.benchIndex(BENCH);
  const s = P.sortBuilds(CAT.builds, 'dps', idx);
  assert.equal(s.length, CAT.builds.length);
  const v = s.map((b) => (P.benchOf(b, idx) || { max: -1 }).max);
  for (let i = 1; i < v.length; i++) assert.ok(v[i - 1] >= v[i], 'ordenado en ' + i);
  const rest = s.filter((b) => !P.benchOf(b, idx)), orig = CAT.builds.filter((b) => !P.benchOf(b, idx));
  assert.deepEqual(rest.map((b) => b.id), orig.map((b) => b.id), 'las sin bench quedan en el orden de la biblioteca');
  assert.equal(P.sortBuilds(CAT.builds, '', idx), CAT.builds, 'sin orden pedido no toca la lista');
  Object.assign(L._state, { cat: CAT, watch: WATCH, bench: BENCH, bidx: idx, loading: false, error: '', open: '' });
  L._state.f = Object.assign({}, L._state.f, { prof: 0, elite: 0, mode: '', role: '', sort: 'dps' });
  const h = P.viewHTML();
  assert.match(h, /role="group" aria-label="Orden"/);
  assert.match(h, /data-lib-p="sort" data-v="dps" aria-pressed="true">Más DPS primero/);
  assert.match(h, / con bench de daño<\/p>/);
  assert.match(h, /benchmarks de Snow Crows<\/a> \(DPS contra el golem/);
  const first = /data-id="([^"]+)"/.exec(h)[1];
  assert.equal(first, s[0].id, 'la primera tarjeta es la de más DPS');
  L._state.f.sort = '';
  L._state.bidx = P.benchIndex(null);
  assert.doesNotMatch(P.viewHTML(), /aria-label="Orden"/, 'sin bench no hay chip de orden');
  L._state.bidx = idx;
});

// BENCH-2: Mis builds muestra el bench de la build en que se basa (o la referencia, ver tests/bld-bench.test.cjs).
test('BENCH-2 Mis builds: la tarjeta lleva el bench de la build de la Biblioteca en que se basa, antes de los botones', () => {
  globalThis.GNBldBench = require('../js/bld-bench.js');
  const idx = P.benchIndex(BENCH);
  Object.assign(L._state, { cat: CAT, bidx: idx });
  M._state.open = ''; M._state.confirm = '';
  const src = CAT.builds.find((b) => P.benchOf(b, idx));
  const item = { id: 'b9', code: src.code, title: 'x', profession: src.prof, updated: 0, source: src.source };
  const h = M._pure.rowHTML(item);
  assert.match(h, /la build de la Biblioteca en que se basa/);
  assert.ok(h.indexOf('class="bld-bench"') > 0 && h.indexOf('class="bld-bench"') < h.indexOf('class="bld-acts"'), 'va antes de los botones');
  L._state.cat = null;
  assert.doesNotMatch(M._pure.rowHTML(item), /bld-bench/, 'sin la Biblioteca cargada: nada, sin error');
  L._state.cat = CAT;
  delete globalThis.GNBldBench;
  assert.doesNotMatch(M._pure.rowHTML(item), /bld-bench/, 'sin bld-bench: nada');
});

// EQ-3: la ficha vive en su pantalla (js/bld-sheet.js, tests/bld-sheet.test.cjs).
test('EQ-3 «Ver ficha» y tocar la tarjeta van a #/builds/ver/<id>; list() da lo que se ve y al volver el foco vuelve a esa build', () => {
  Object.assign(L._state, { cat: CAT, watch: WATCH, loading: false, error: '', open: '' });
  L._state.f = { prof: 1, elite: 0, mode: 'pve', role: '', weapon: '', damage: '', state: '', q: '', sort: '' };
  const list = L.list();
  assert.ok(list.length >= 4 && list.every((b) => b.prof === 1 && b.mode === 'pve'), 'lo filtrado, en orden');
  assert.equal(L.byId(list[0].id), list[0]);
  const went = [];
  let focused = 0, scrolled = 0;
  const target = { focus: () => { focused++; }, scrollIntoView: () => { scrolled++; } };
  const want = '[data-id="' + list[1].id + '"] [data-lib="toggle"]';
  const host = { innerHTML: '', contains: () => false, querySelector: (sel) => (sel === want ? target : null) };
  const ctx = { host, go: (t, a) => went.push(t + ':' + a), ref: {} };
  const card = el({ 'data-id': list[1].id }, { match: ['.bld-lib-card', '[data-id]'] });
  assert.equal(P.onClick(ctx, { target: el({}, { parent: card }) }), 'card');
  assert.deepEqual(went, ['sheet:' + list[1].id]);
  assert.equal(L._state.open, '', 'ya no se abre adentro de la tarjeta');
  assert.equal(P.focusBack(ctx), true);
  assert.deepEqual([focused, scrolled], [1, 1], 'al volver, foco en «Ver ficha» de esa build y a la vista');
  assert.equal(P.focusBack(ctx), false, 'una sola vez');
  L.remember(list[1].id);
  assert.equal(P.focusBack(ctx), true, 'la ficha también puede pedirlo');
  L._state.f = { prof: 0, elite: 0, mode: '', role: '', weapon: '', damage: '', state: '', q: '', sort: '' };
  L._state.cat = null;
  assert.deepEqual(L.list(), [], 'sin catálogo, lista vacía');
  L._state.cat = CAT;
});
