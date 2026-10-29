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
  for (const [f, m, v] of [['bld-lib.js', L, '1.5.0'], ['bld-mine.js', M, '1.3.0']]) {
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
  assert.equal(P.moreCount({ q: 'x', damage: 'power' }), 2);
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
  globalThis.fetch = async (u) => { urls.push(u); return { ok: true, json: async () => (/catalog/.test(u) ? CAT : WATCH) }; };
  const [a, b] = await Promise.all([L.preload(), L.preload()]);
  assert.equal(a, b);
  assert.equal(st.cat, CAT);
  assert.deepEqual(urls, ['assets/data/builds/catalog.json', 'assets/data/builds/watch.json']);
  await L.preload();
  assert.equal(urls.length, 2, 'ya cargado: nada nuevo');
  st.cat = null; st.pre = null;
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(L.preload(), /503/);
  assert.equal(st.pre, null, 'si falla se puede volver a pedir');
  Object.assign(st, { cat: prev.cat, watch: prev.watch, pre: prev.pre });
  if (prev.f) globalThis.fetch = prev.f; else delete globalThis.fetch;
});
