// BL-084 EQ-3b: la Biblioteca en filas agrupadas por profesión y élite (js/bld-rows.js) y su uso en js/bld-lib.js 1.9.0.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require('../js/bld-code.js');
globalThis.GNBldShow = require('../js/bld-show.js');
const R = require('../js/bld-rows.js');
const RP = R._pure;
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
const BENCH = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/bench.json'), 'utf8'));

function libPure() { return require('../js/bld-lib.js')._pure; }
// El marco de Builds (js/bld-view.js) da los colores de las profesiones.
const SB = { console: { info() {}, warn() {} } };
SB.window = SB;
require('node:vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'bld-view.js'), 'utf8'), SB);
globalThis.GNBld = SB.GNBld;

test('versión en la cabecera y en modules.json, antes de la Biblioteca', () => {
  assert.match(fs.readFileSync(path.join(ROOT, 'js', 'bld-rows.js'), 'utf8'), /Versión: 1\.0\.0 /);
  assert.equal(R.version, '1.0.0');
  const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).routes['#/builds'];
  const src = mods.map((m) => m.src);
  assert.ok(src.includes('js/bld-rows.js'));
  assert.ok(src.indexOf('js/bld-rows.js') < src.indexOf('js/bld-lib.js'));
  assert.equal(mods.find((m) => m.src === 'js/bld-lib.js').v, '1.9.0');
});

test('group: respeta el orden de la lista; una entrada por profesión y por élite', () => {
  const g = RP.group(CAT.builds, null);
  assert.deepEqual(g.map((x) => x.prof), [...new Set(CAT.builds.map((b) => b.prof))]);
  assert.equal(g.reduce((n, x) => n + x.builds.length, 0), CAT.builds.length);
  g.forEach((x) => {
    assert.equal(x.elites.reduce((n, e) => n + e.builds.length, 0), x.builds.length);
    x.elites.forEach((e) => e.builds.forEach((b) => { assert.equal(b.prof, x.prof); assert.equal(b.elite, e.elite); }));
    assert.equal(new Set(x.elites.map((e) => e.elite)).size, x.elites.length, 'sin élites repetidas');
  });
  assert.deepEqual(RP.group([], null), []);
});

test('fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado', () => {
  const P = libPure(), idx = P.benchIndex(BENCH);
  const withB = CAT.builds.find((b) => P.benchOf(b, idx));
  const o = { lib: P, latest: P.latestPatch(CAT, null), idx };
  const h = RP.rowHTML(withB, o);
  assert.match(h, new RegExp('^<a class="bld-row" href="#/builds/ver/' + encodeURIComponent(withB.id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '" data-id="'));
  assert.match(h, /<span class="bld-rt"><b>[^<]+<\/b><small>[^<]* · dificultad \d\/5<\/small><\/span>/);
  assert.match(h, /<span class="bld-tag is-ok">vigente<\/span>/);
  const m = P.benchOf(withB, idx);
  assert.match(h, new RegExp('<b>' + P.fmtN(m.max).replace('.', '\\.') + '</b> DPS · ' + Math.round(m.max / idx.top * 100) + ' %'));
  assert.match(h, /<span class="bld-rbar" aria-hidden="true"><i style="width:\d+%"><\/i><\/span>/);
  assert.match(h, /<span class="bld-rgo" aria-hidden="true">›<\/span><\/a>$/);
  const w = CAT.builds.find((b) => b.mode === 'wvw');
  assert.match(RP.rowHTML(w, o), /Sin golem en WvW/);
  const pveNo = CAT.builds.find((b) => b.mode === 'pve' && !P.benchOf(b, idx));
  if (pveNo) assert.match(RP.rowHTML(pveNo, o), /Sin bench propio · referencia en la ficha/);
  const boon = CAT.builds.find((b) => (b.roles || []).includes('alacrity'));
  assert.match(RP.rowHTML(boon, o), /<span class="bld-tag is-boon">Alacridad<\/span>/);
  const evil = Object.assign({}, withB, { id: 'x"><script>', name: '<img onerror=1>' });
  const e = RP.rowHTML(evil, o);
  assert.doesNotMatch(e, /<script>|<img onerror/);
  assert.match(e, /href="#\/builds\/ver\/x%22%3E%3Cscript%3E"/);
  assert.match(RP.rowHTML(withB, Object.assign({ flat: true }, o)), /^<a class="bld-row is-flat"[^>]*style="--bld-prof:#[0-9A-F]{6}"[^>]*><span class="bld-emb"/, 'plana: emblema y color de su profesión');
});

test('lista agrupada: un grupo por profesión con su color y conteo, columnas por élite, una fila por build', () => {
  const P = libPure();
  const list = CAT.builds.filter((b) => b.mode === 'pve');
  const h = R.listHTML(list, { lib: P, latest: '2026-09-29', idx: P.benchIndex(BENCH) });
  const groups = h.match(/<section class="bld-grp" aria-label="[^"]+" style="--bld-prof:#[0-9A-F]{6}">/g) || [];
  assert.equal(groups.length, new Set(list.map((b) => b.prof)).size);
  assert.equal((h.match(/<a class="bld-row"/g) || []).length, list.length);
  assert.match(h, /<h3 class="bld-grp-h">[\s\S]*?<span>Guardián<\/span><small>\d+ élites? · \d+ builds?<\/small><\/h3>/);
  assert.equal((h.match(/class="bld-eg"/g) || []).length, new Set(list.map((b) => b.elite)).size);
  const flat = R.listHTML(list, { lib: P, flat: true });
  assert.match(flat, /^<div class="bld-rlist is-flat">/);
  assert.doesNotMatch(flat, /bld-grp/);
});

test('Biblioteca 1.9.0: filtros en una barra (con búsqueda), filas agrupadas, «Más DPS primero» plano; tocar una fila la recuerda para volver', () => {
  globalThis.GNBldRows = R;
  const L = require('../js/bld-lib.js'), P = L._pure;
  assert.equal(L.version, '1.9.0');
  const idx = P.benchIndex(BENCH);
  Object.assign(L._state, { cat: CAT, watch: null, bench: BENCH, bidx: idx, loading: false, error: '', open: '' });
  L._state.f = { prof: 0, elite: 0, mode: 'pve', role: '', weapon: '', damage: '', state: '', q: '', sort: '' };
  let h = P.viewHTML();
  const bar = h.slice(h.indexOf('<div class="bld-bar1">'), h.indexOf('</div>', h.indexOf('id="bldLibQ"')));
  assert.match(bar, /aria-label="Profesión"/);
  assert.match(bar, /aria-label="Modo"/);
  assert.match(bar, /aria-label="Rol"/);
  assert.match(bar, /<input id="bldLibQ" class="bld-q" type="search" data-lib-f="q" value="" placeholder="Buscar build o élite" aria-label="Buscar build o élite">/);
  assert.match(h, /aria-label="Orden"><small class="bld-muted">Orden:<\/small>[\s\S]*?data-v="" aria-pressed="true">Por profesión/);
  assert.match(h, /<section class="bld-grp"/);
  assert.equal((h.match(/<a class="bld-row"/g) || []).length, L.list().length);
  assert.doesNotMatch(h, /<ul class="bld-lib">/, 'ya no son tarjetas');
  L._state.f.sort = 'dps';
  h = P.viewHTML();
  assert.match(h, /<div class="bld-rlist is-flat">/);
  assert.equal(/data-id="([^"]+)"/.exec(h)[1], L.list()[0].id, 'la primera fila es la de más DPS');
  L._state.f.sort = '';
  const id = L.list()[2].id;
  const row = { getAttribute: (k) => (k === 'data-id' ? id : null), closest: (s) => (s === 'a.bld-row' ? row : null) };
  assert.equal(P.onClick({ host: {} }, { target: row }), 'row', 'el enlace navega solo; la Biblioteca se acuerda');
  let focused = 0;
  const host = { querySelector: (s) => (s === 'a.bld-row[data-id="' + id + '"]' ? { focus: () => { focused++; } } : null) };
  assert.equal(P.focusBack({ host }), true);
  assert.equal(focused, 1, 'al volver, el foco va a esa fila');
  assert.equal(P.moreCount({ q: 'x', weapon: 'Spear', damage: 'power' }), 2, 'la búsqueda está en la barra');
  L._state.f = { prof: 0, elite: 0, mode: '', role: '', weapon: '', damage: '', state: '', q: '', sort: '' };
  delete globalThis.GNBldRows;
});

test('Mis builds 1.5.0: las mismas filas en lista plana; cada una abre su ficha (m:<id>); bench de la build en que se basa; foco de vuelta', () => {
  globalThis.GNBldRows = R;
  const L = require('../js/bld-lib.js'), M = require('../js/bld-mine.js'), MP = M._pure;
  assert.equal(M.version, '1.5.0');
  const idx = L._pure.benchIndex(BENCH);
  Object.assign(L._state, { cat: CAT, bidx: idx });
  const src = CAT.builds.find((b) => L._pure.benchOf(b, idx));
  const mine = [{ id: 'a1', code: src.code, title: 'Mi <i>', profession: src.prof, updated: Date.UTC(2026, 9, 30), notes: 'x' },
    { id: 'a2', code: CAT.builds[1].code + 'x', title: 'Propia', profession: CAT.builds[1].prof, updated: 0 }];
  assert.equal(MP.baseOf(mine[0]).id, src.id, 'mismo código: se basa en esa build');
  assert.equal(MP.baseOf(mine[1]), null);
  const h = MP.viewHTML(mine);
  assert.match(h, /^<p class="bld-muted">2 builds guardadas/);
  assert.match(h, /<div class="bld-rlist is-flat">/);
  assert.doesNotMatch(h, /<ul class="bld-mine">/, 'ya no son tarjetas');
  assert.match(h, /<a class="bld-row is-flat is-mine" href="#\/builds\/ver\/m%3Aa1" data-id="a1" style="--bld-prof:#[0-9A-F]{6}">/);
  assert.match(h, /<b>Mi &lt;i&gt;<\/b><small>[^<]*editada \d{2}\/\d{2}\/\d{4}<\/small>/);
  assert.match(h, /basada en la Biblioteca<\/span><span class="bld-tag is-boon">con notas/);
  assert.match(h, new RegExp('<b>' + L._pure.fmtN(L._pure.benchOf(src, idx).max).replace('.', '\\.') + '</b> DPS'), 'DPS de la build en que se basa');
  assert.match(h, /Tuya · sin bench propio[\s\S]*<span class="bld-tag">propia<\/span>|<span class="bld-tag">propia<\/span>[\s\S]*Tuya · sin bench propio/);
  const row = { getAttribute: (k) => (k === 'data-id' ? 'a2' : null), closest: (s) => (s === 'a.bld-row' ? row : null) };
  assert.equal(MP.onClick({}, { target: row }), 'row');
  let f = 0;
  const host = { querySelector: (s) => (s === 'a.bld-row[data-id="a2"]' ? { focus: () => { f++; } } : null) };
  assert.equal(MP.focusBack({ host }), true);
  assert.equal(f, 1);
  M.remember('a1');
  assert.equal(MP.focusBack({ host }), false, 'si la fila no está, no rompe');
  delete globalThis.GNBldRows;
  assert.match(MP.viewHTML(mine), /<ul class="bld-mine">/, 'sin bld-rows: las tarjetas de antes');
});

test('CSS: tokens de los temas, tinte de la profesión al 8 % (como las tarjetas medidas en bld-ui), celular a una columna', () => {
  const css = RP.CSS;
  assert.doesNotMatch(css.replace(/var\(--[\w-]+,#[0-9a-fA-F]{3,8}\)/g, ''), /#[0-9a-fA-F]{3,8}\b/, 'sin colores fijos');
  assert.ok((css.match(/var\(--bld-prof,var\(--gn-mod\)\) (\d+)%/g) || []).every((x) => /\) 8%$/.test(x)), 'detrás del texto, el color de la profesión solo al 8 %');
  assert.match(css, /@media \(max-width:820px\)\{[\s\S]*\.bld-row,#buildsPanel \.bld-row\.is-flat\{grid-template-columns:minmax\(0,1fr\) 20px/);
  assert.match(css, /\.bld-row:focus-visible/, 'el teclado ve dónde está');
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-rows.js'), 'utf8');
  assert.doesNotMatch(src, /<button\b|onclick|localStorage\./);
});

test('rendimiento: las 104 builds en filas, muy por debajo de 200 ms', () => {
  const P = libPure(), idx = P.benchIndex(BENCH);
  const t0 = process.hrtime.bigint();
  let h = '';
  for (let i = 0; i < 5; i++) h = R.listHTML(CAT.builds, { lib: P, latest: '2026-09-29', idx });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 5;
  assert.equal((h.match(/<a class="bld-row"/g) || []).length, CAT.builds.length);
  assert.ok(ms < 200, ms.toFixed(1) + ' ms');
});
