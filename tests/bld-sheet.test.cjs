// BL-084 EQ-3: la ficha de una build en su pantalla (js/bld-sheet.js) y su ruta #/builds/ver/<id>. Sin red ni navegador.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require('../js/bld-code.js');
globalThis.GNBldShow = require('../js/bld-show.js');
globalThis.GNBldItems = require('../js/bld-items.js');
globalThis.GNBldGearView = require('../js/bld-gearview.js');
globalThis.GNBldRef = require('../js/bld-ref.js');
globalThis.GNBldTraitView = require('../js/bld-traitview.js');
const SH = require('../js/bld-sheet.js');
const P = SH._pure;
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
const GEAR = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/gear.json'), 'utf8')).gear;

// Biblioteca de mentira: la misma interfaz que GNBldLib 1.8.0 (list, byId, remember, _state, _pure).
function fakeLib(list) {
  const rem = [];
  return {
    rem,
    _state: { cat: CAT, watch: null, bidx: null },
    _pure: { stateOf: () => 'vigente', latestPatch: () => '2026-09-29', ROLES: { dps: 'DPS', quickness: 'Celeridad', alacrity: 'Alacridad' },
      benchHTML: () => '<div class="bld-bench">BENCH</div>', issueUrl: () => 'https://github.com/x/issues/new?t=1' },
    list: () => list,
    byId: (id) => CAT.builds.find((b) => b.id === id) || null,
    remember: (id) => rem.push(id),
    preload: async () => {}
  };
}
function el(attrs, parent) {
  const me = { getAttribute: (k) => (k in attrs ? attrs[k] : null), closest: (sel) => (sel === '[data-sheet]' && 'data-sheet' in attrs ? me : parent ? parent.closest(sel) : null) };
  return me;
}

test('versión en la cabecera, en modules.json después de bld-lib, y la ruta #/builds/ver/<id> en bld-view', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-sheet.js'), 'utf8');
  assert.match(src, /Versión: 1\.4\.0 /);
  assert.equal(SH.version, '1.4.0');
  const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).routes['#/builds'].map((m) => m.src);
  assert.ok(mods.indexOf('js/bld-sheet.js') > mods.indexOf('js/bld-lib.js'), 'se carga después de la Biblioteca');
  assert.ok(mods.indexOf('js/bld-items.js') < mods.indexOf('js/bld-sheet.js'));
  assert.ok(mods.indexOf('js/bld-items.js') < mods.indexOf('js/bld-gearview.js') && mods.indexOf('js/bld-gearview.js') < mods.indexOf('js/bld-sheet.js'), 'EQ-4: el equipo antes que la ficha');
  assert.ok(mods.indexOf('js/bld-ref.js') < mods.indexOf('js/bld-traitview.js') && mods.indexOf('js/bld-traitview.js') < mods.indexOf('js/bld-sheet.js'), 'EQ-5: rasgos antes que la ficha');
  assert.ok(mods.indexOf('js/bld-notes.js') >= 0 && mods.indexOf('js/bld-notes.js') < mods.indexOf('js/bld-sheet.js'), 'EQ-6: notas antes que la ficha');
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  require('node:vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'bld-view.js'), 'utf8'), sb, { filename: 'js/bld-view.js' });
  const V = sb.GNBld._pure;
  assert.deepEqual(JSON.parse(JSON.stringify(V.parseHash('#/builds/ver/sc-raids-x'))), { tab: 'sheet', arg: 'sc-raids-x' });
  assert.equal(V.hashFor('sheet', 'a b'), '#/builds/ver/a%20b');
  assert.equal(V.parseHash(V.hashFor('sheet', 'sc-pvp-y')).arg, 'sc-pvp-y', 'ida y vuelta');
  const h = V.viewHTML({ tab: 'sheet' });
  assert.match(h, /id="bldTab-lib"[^>]*aria-selected="true"/, 'en la ficha queda marcada la Biblioteca');
  assert.equal((h.match(/aria-selected="true"/g) || []).length, 1);
  assert.match(h, /role="tabpanel" aria-labelledby="bldTab-lib"/);
  const hm = V.viewHTML({ tab: 'sheet', arg: 'm:abc' });
  assert.match(hm, /id="bldTab-mine"[^>]*aria-selected="true"/, 'en la ficha de una propia queda marcada Mis builds');
  assert.match(hm, /role="tabpanel" aria-labelledby="bldTab-mine"/);
  assert.equal(V.shown('sheet', 'm:abc'), 'mine');
});

test('cada build de Snow Crows de la Biblioteca tiene su equipo en gear.json (y nada sobra)', () => {
  const sc = CAT.builds.filter((b) => b.source && b.source.name === 'Snow Crows').map((b) => b.id);
  const miss = sc.filter((id) => !GEAR[id]);
  assert.deepEqual(miss, [], 'sin equipo');
  const ids = new Set(CAT.builds.map((b) => b.id));
  assert.deepEqual(Object.keys(GEAR).filter((id) => !ids.has(id)), [], 'equipo de builds que no están');
});

test('navOf y crumb: anterior/siguiente dentro de lo que muestra la Biblioteca; el camino modo · profesión · élite', () => {
  const L = CAT.builds.slice(0, 3);
  assert.deepEqual(JSON.parse(JSON.stringify(P.navOf(L, L[1].id))), { i: 1, n: 3, prev: L[0], next: L[2] });
  assert.equal(P.navOf(L, L[0].id).prev, null);
  assert.equal(P.navOf(L, L[2].id).next, null);
  assert.equal(P.navOf(L, 'nada').i, -1);
  const b = CAT.builds.find((x) => x.mode === 'pve' && x.sub === 'raids');
  const c = P.crumb(b);
  assert.equal(c[0], 'PvE (raids y strikes)');
  assert.equal(c[1], globalThis.GNBldCode.PROF_ES[b.prof]);
  assert.equal(c[2], b.eliteName);
});

test('ficha: navegación, encabezado con franja, acciones, 3 secciones plegables y todo escapado', () => {
  const b = Object.assign({}, CAT.builds.filter((x) => x.source.name === 'Snow Crows')[5], { name: '<img onerror=x>' });
  const L = [CAT.builds[0], b, CAT.builds[2]];
  globalThis.GNBldLib = fakeLib(L);
  const h = P.sheetHTML({ b, nav: P.navOf(L, b.id), latest: '2026-09-29', gear: undefined });
  assert.match(h, /<nav class="bld-sh-nav" aria-label="Navegación de la ficha"><button type="button" class="bld-btn" data-sheet="back">← Biblioteca<\/button>/);
  assert.match(h, /data-sheet="prev" aria-label="Build anterior: /);
  assert.match(h, /<small class="bld-muted">2 de 3<\/small>/);
  assert.match(h, /data-sheet="next"/);
  assert.match(h, /<h3 id="bldSheetTitle" tabindex="-1">&lt;img onerror=x&gt;<\/h3>/);
  assert.doesNotMatch(h, /<img onerror/);
  assert.match(h, /class="bld-card bld-band bld-sheet" aria-labelledby="bldSheetTitle"/);
  assert.match(h, /class="bld-btn is-primary" data-bld-act="copy">Copiar código/);
  for (const a of ['save', 'share']) assert.match(h, new RegExp('data-bld-act="' + a + '"'));
  assert.match(h, /BENCH/, 'el bench de la Biblioteca');
  assert.deepEqual([...h.matchAll(/data-sheet-sec="(\w+)" open><summary><h4>([^<]+)<\/h4>/g)].map((m) => m[2]), ['Equipo', 'Rasgos y habilidades', 'Cómo se juega']);
  assert.match(h, /Buscando el equipo en la API del juego…/);
  assert.match(h, /están en preparación/);
  assert.match(h, /target="_blank" rel="noopener">Snow Crows ↗/);
  const first = P.sheetHTML({ b, nav: P.navOf(L, L[0].id), gear: null });
  assert.match(first, /<button type="button" class="bld-btn" disabled>‹ Anterior<\/button>/, 'en la primera, «Anterior» desactivado');
  assert.match(first, /Todavía no tengo el equipo de esta build/);
  assert.match(P.navHTML(b, { i: -1 }), /data-sheet="back"/);
  assert.doesNotMatch(P.navHTML(b, { i: -1 }), /data-sheet="prev"/, 'si no está en la lista filtrada, sin anterior/siguiente');
  assert.match(P.missingHTML('<x>'), /No encontré esa build[\s\S]*«&lt;x&gt;»/);
  delete globalThis.GNBldLib;
});

test('equipo (EQ-4): la ficha lo delega en bld-gearview (3 tarjetas); sin ese módulo lo dice; PvP con amuleto', async () => {
  const I = globalThis.GNBldItems;
  const id = Object.keys(GEAR).find((k) => GEAR[k].armor && GEAR[k].rune && GEAR[k].infusion);
  const v = I.sheet(GEAR[id], { items: { [GEAR[id].armor[0][0]]: { id: 1, name: 'Visor', icon: 'https://render.guildwars2.com/file/A/1.png', desc: 'x' } },
    stats: { [GEAR[id].armor[0][1]]: { id: GEAR[id].armor[0][1], name: 'Berserker', attrs: [] } }, amulets: {} });
  const h = P.gearHTML(v, CAT.builds[0]);
  assert.equal(h, globalThis.GNBldGearView.html(v, CAT.builds[0]), 'lo pinta bld-gearview');
  assert.match(h, /<h5 id="bldG-armor">Armadura <span>6 piezas<\/span>/);
  assert.match(h, /class="bld-gico[^"]*"[^>]*><img class="bld-gic" src="https:\/\/render\.guildwars2\.com\/file\/A\/1\.png" width="40"/);
  assert.match(h, /<b>Berserker<\/b><small>Casco<\/small>/);
  assert.match(h, /<h5 id="bldG-trinkets">Abalorios y reliquia/);
  assert.match(h, /<h6>Otros<\/h6>[\s\S]*Infusiones ×\d+/);
  assert.match(h, /<li class="bld-gchip"><b>Berserker<\/b> ×\d+/);
  assert.doesNotMatch(h, /<table/);
  const GVsave = globalThis.GNBldGearView;
  delete globalThis.GNBldGearView;
  assert.match(P.gearHTML(v, null), /No pude mostrar el equipo: recargá la página\./);
  globalThis.GNBldGearView = GVsave;
  const pid = Object.keys(GEAR).find((k) => GEAR[k].amulet);
  const pv = I.sheet(GEAR[pid], { items: {}, stats: {}, amulets: { [GEAR[pid].amulet]: { id: 8, name: 'Amuleto de berserker', icon: '', attrs: [['Power', 1200]] } } });
  const ph = P.gearHTML(pv, null);
  assert.match(ph, /<h5 id="bldG-trinkets">Amuleto y reliquia<\/h5>/);
  assert.match(ph, /<b>Amuleto de berserker<\/b><small>Amuleto · Potencia 1200<\/small>/);
  assert.doesNotMatch(ph, /piezas<\/span>/, 'en PvP no hay piezas de armadura');
});

test('clics: «← Biblioteca» recuerda la build y vuelve; anterior/siguiente van a la vecina y ponen el foco en el título', () => {
  const L = CAT.builds.slice(0, 3);
  const lib = fakeLib(L);
  globalThis.GNBldLib = lib;
  SH._state.id = L[1].id;
  const went = [];
  const ctx = { go: (t, a) => went.push(t + (a ? ':' + a : '')) };
  assert.equal(P.onClick(ctx, { target: el({ 'data-sheet': 'next' }) }), 'next');
  assert.equal(P.onClick(ctx, { target: el({ 'data-sheet': 'prev' }) }), 'prev');
  assert.equal(SH._state.focusTitle, true);
  assert.equal(P.onClick(ctx, { target: el({ 'data-sheet': 'back' }) }), 'back');
  assert.deepEqual(went, ['sheet:' + L[2].id, 'sheet:' + L[0].id, 'lib']);
  assert.deepEqual(lib.rem, [L[1].id], 'la Biblioteca sabe a qué build devolver el foco');
  SH._state.id = L[0].id;
  assert.equal(P.onClick(ctx, { target: el({ 'data-sheet': 'prev' }) }), '', 'en la primera no hay anterior');
  assert.equal(P.onClick(ctx, { target: el({}) }), '');
  delete globalThis.GNBldLib;
});

test('render: dibuja, trae equipo y rasgos una sola vez, recuerda las secciones cerradas y no suma oyentes de más', async () => {
  const b = CAT.builds.find((x) => GEAR[x.id] && x.mode === 'pve');
  globalThis.GNBldLib = fakeLib([b]);
  const calls = { items: 0, ref: 0 };
  const saveI = globalThis.GNBldItems;
  globalThis.GNBldItems = Object.assign({}, saveI, { load: async (id) => { calls.items++; return { entry: GEAR[id], view: saveI.sheet(GEAR[id], null) }; } });
  let listeners = 0, focused = 0;
  const host = { innerHTML: '', addEventListener: () => { listeners++; }, querySelector: (s) => (s === '#bldSheetTitle' ? { focus: () => { focused++; } } : null) };
  const ref = { load: async () => { calls.ref++; return {}; }, resolve: () => ({ specs: [], land: [], water: [], profName: 'x' }), check: () => [] };
  const ctx = { arg: b.id, ref, go() {}, toast() {} };
  SH._state.id = ''; SH._state.gear = {}; SH._state.views = {};
  await SH.render(host, ctx);
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  assert.match(host.innerHTML, /<h5 id="bldG-armor">Armadura/, 'el equipo llegó');
  assert.match(host.innerHTML, /class="bld-card bld-detail"/, 'rasgos y habilidades');
  assert.equal(focused, 1, 'al abrir, el foco va al título de la ficha');
  const n = listeners;
  await SH.render(host, ctx);
  assert.equal(listeners, n, 'mismo contenedor: no suma oyentes');
  assert.deepEqual(calls, { items: 1, ref: 1 }, 'lo traído se reusa');
  SH._state.closed.gear = true;
  SH.render(host, ctx);
  assert.match(host.innerHTML, /data-sheet-sec="gear"><summary>/, 'cerrada queda cerrada');
  SH._state.closed = {};
  ctx.arg = 'no-existe';
  SH.render(host, ctx);
  assert.match(host.innerHTML, /No encontré esa build/);
  globalThis.GNBldItems = saveI;
  delete globalThis.GNBldLib;
});

test('CSS: tokens de los temas, sin colores fijos, celular a una columna; controles nativos', () => {
  assert.doesNotMatch(P.CSS, /:\s*#[0-9a-fA-F]{3,8}/, 'sin colores fijos');
  assert.doesNotMatch(P.CSS, /\.bld-gtab|\.bld-gear\{/, 'EQ-4: el CSS del equipo vive en bld-gearview');
  assert.match(P.CSS, /@media \(max-width:720px\)\{[\s\S]*\.bld-sh-pn\{margin-left:0/);
  assert.match(P.CSS, /\.bld-card\.bld-band\.bld-sheet:hover\{transform:none\}/, 'la ficha no salta al pasar el mouse');
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-sheet.js'), 'utf8');
  (src.match(/<button\b[^>]*/g) || []).forEach((x) => assert.match(x, /type="button"/));
  assert.doesNotMatch(src, /localStorage\./, 'nada se guarda fuera de la visita');
});

test('EQ-5: con el ref nuevo, «Rasgos y habilidades» lo pinta bld-traitview (con el equipo); con uno viejo, la vista de siempre', () => {
  const b = CAT.builds.find((x) => GEAR[x.id]);
  globalThis.GNBldLib = fakeLib([b]);
  const TVsave = globalThis.GNBldTraitView, seen = [];
  globalThis.GNBldTraitView = { ready: (r) => !!(r && r.ok), html: (m) => { seen.push(m); return '<div class="bld-tv">TV</div>'; } };
  const st = SH._state;
  st.views[b.id] = { specs: [], land: [], water: [], profName: 'x' }; st.checks[b.id] = []; st.viewErr = {};
  st.refs[b.id] = { ok: 1 }; st.builds[b.id] = { profession: b.prof }; st.gear[b.id] = { sets: [] };
  const h = P.sheetHTML({ b, nav: P.navOf([b], b.id), gear: null });
  assert.match(h, /<div class="bld-tv">TV<\/div>/);
  assert.equal(seen[0].code, b.code);
  assert.deepEqual(seen[0].gear, { sets: [] }, 'las armas salen del equipo');
  assert.deepEqual(seen[0].build, { profession: b.prof });
  assert.deepEqual(seen[0].actions, ['share', 'gw2skills', 'edit']);
  st.refs[b.id] = { v: 2 };
  const old = P.sheetHTML({ b, nav: P.navOf([b], b.id), gear: null });
  assert.match(old, /class="bld-card bld-detail"/, 'ref viejo: la vista anterior');
  assert.doesNotMatch(old, /bld-tv/);
  globalThis.GNBldTraitView = TVsave;
  assert.equal(TVsave.ready({ v: 2 }), false, 'el módulo real tampoco acepta un ref viejo');
  delete st.refs[b.id]; delete st.builds[b.id]; delete st.views[b.id]; delete st.gear[b.id];
  delete globalThis.GNBldLib;
});

test('EQ-6: notas de equipo y reliquia al pie de «Equipo», de habilidades y rasgos al pie de «Rasgos y habilidades»; se piden una vez', async () => {
  const b = CAT.builds.find((x) => GEAR[x.id] && x.mode === 'pve');
  globalThis.GNBldLib = fakeLib([b]);
  const seen = [];
  let loads = 0, done = false;
  globalThis.GNBldNotes = { loaded: () => done, noteSync: (id) => (id === b.id ? { skills: ['x'] } : null), ensureCss() {},
    load: async () => { loads++; done = true; return {}; },
    html: (m) => { seen.push(m); return '<div class="bld-nts">' + m.keys.join('+') + '</div>'; } };
  const h = P.sheetHTML({ b, nav: P.navOf([b], b.id), gear: null });
  assert.match(h, /data-sheet-sec="gear"[\s\S]*<div class="bld-nts">gear\+relic<\/div>[\s\S]*data-sheet-sec="traits"[\s\S]*<div class="bld-nts">skills\+traits<\/div>[\s\S]*data-sheet-sec="play"/);
  assert.deepEqual(seen[0].note, { skills: ['x'] });
  assert.equal(seen[0].loaded, false);
  const saveI = globalThis.GNBldItems;
  globalThis.GNBldItems = Object.assign({}, saveI, { load: async (id) => ({ entry: GEAR[id], view: saveI.sheet(GEAR[id], null) }) });
  const host = { innerHTML: '', addEventListener() {}, querySelector: () => null };
  const ctx = { arg: b.id, ref: { load: async () => ({}), resolve: () => ({ specs: [], land: [], water: [], profName: 'x' }), check: () => [] }, go() {}, toast() {} };
  SH._state.id = ''; SH._state.gear = {}; SH._state.views = {};
  await SH.render(host, ctx);
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  SH.render(host, ctx);
  assert.equal(loads, 1, 'una vez por visita');
  assert.match(host.innerHTML, /gear\+relic/);
  assert.equal(seen[seen.length - 1].loaded, true);
  globalThis.GNBldItems = saveI;
  delete globalThis.GNBldNotes;
  assert.doesNotMatch(P.sheetHTML({ b, nav: P.navOf([b], b.id), gear: null }), /bld-nts/, 'sin el módulo, la ficha sigue igual');
  delete globalThis.GNBldLib;
});

// EQ-3b: la ficha de Mis builds (#/builds/ver/m:<id>).
function fakeStore(items) {
  const xs = items.map((x) => Object.assign({}, x));
  const log = [];
  return {
    log, xs,
    list: () => xs,
    get: (id) => xs.find((x) => x.id === id) || null,
    update: (id, p) => { const x = xs.find((y) => y.id === id); if (!x) return { ok: false, error: 'no' }; log.push('update:' + id); Object.assign(x, { title: p.title || x.title, notes: p.notes == null ? x.notes : p.notes }); return { ok: true }; },
    duplicate: (id) => { log.push('dup:' + id); const c = Object.assign({}, xs.find((y) => y.id === id), { id: id + 'c' }); xs.push(c); return { ok: true, id: c.id }; },
    remove: (id) => { log.push('del:' + id); const i = xs.findIndex((y) => y.id === id); if (i < 0) return { ok: false, error: 'no' }; xs.splice(i, 1); return { ok: true }; }
  };
}

test('Mis builds: la ficha propia (m:<id>) con nombre y notas, acciones propias, equipo de la build en que se basa y sin «Guardar»', () => {
  const src = CAT.builds.find((b) => b.source.name === 'Snow Crows' && GEAR[b.id]);
  globalThis.GNBldLib = fakeLib(CAT.builds);
  globalThis.GNBldMine = { _pure: { baseOf: (x) => CAT.builds.find((b) => b.code === x.code) || null, eliteOf: () => src.elite }, remember() {} };
  globalThis.GNBldStore = fakeStore([{ id: 'a1', code: src.code, title: 'Mi <b>build</b>', profession: src.prof, updated: Date.UTC(2026, 9, 30), notes: 'ojo', source: src.source },
    { id: 'a2', code: '[&x]', title: 'Otra', profession: 1, updated: 0 }]);
  assert.equal(P.isMine('m:a1'), true);
  assert.equal(P.isMine('sc-x'), false);
  const b = P.mineB('a1');
  assert.equal(b.id, 'm:a1');
  assert.equal(b.base.id, src.id, 'se basa en la build de la Biblioteca con su mismo código');
  assert.deepEqual(P.crumb(b).slice(0, 1), ['Mis builds']);
  assert.equal(P.mineB('nada'), null);
  assert.deepEqual(P.listFor('m:a1').map((x) => x.id), ['m:a1', 'm:a2'], 'anterior/siguiente recorre Mis builds');
  const h = P.sheetHTML({ b, nav: P.navOf(P.listFor('m:a1'), 'm:a1'), gear: undefined });
  assert.match(h, /data-sheet="back">← Mis builds<\/button>/);
  assert.match(h, /<h3 id="bldSheetTitle" tabindex="-1">Mi &lt;b&gt;build&lt;\/b&gt;<\/h3>/);
  assert.match(h, / · editada \d{2}\/\d{2}\/\d{4}/);
  for (const a of ['edit', 'dup', 'del']) assert.match(h, new RegExp('data-sheet="' + a + '"'));
  assert.doesNotMatch(h, /data-bld-act="save"/, 'ya está guardada');
  assert.doesNotMatch(h, /Avisar que está vieja/);
  assert.deepEqual([...h.matchAll(/<summary><h4>([^<]+)<\/h4>/g)].map((m) => m[1]), ['Nombre y notas', 'Equipo', 'Rasgos y habilidades']);
  assert.match(h, /<label for="bldShTitle"><small>Nombre<\/small><\/label><input id="bldShTitle" maxlength="80" value="Mi &lt;b&gt;build&lt;\/b&gt;">/);
  assert.match(h, /<textarea id="bldShNotes" rows="3" maxlength="1000">ojo<\/textarea>/);
  assert.match(h, /BENCH/, 'el bench de la build en que se basa');
  const v = globalThis.GNBldItems.sheet(GEAR[src.id], null);
  assert.match(P.gearHTML(v, b), /^<p class="bld-muted bld-gsum">Equipo de la build en que se basa: <b>/);
  const own = P.mineB('a2');
  assert.equal(own.base, null);
  assert.match(P.gearHTML(null, own), /Esta build es tuya: el equipo lo elegís en el Editor/);
  assert.match(P.missingHTML('m:zz'), /No encontré esa build en Mis builds/);
  assert.match(P.missingHTML('m:zz'), /← Mis builds/);
  delete globalThis.GNBldLib; delete globalThis.GNBldMine; delete globalThis.GNBldStore;
});

test('Mis builds: editar, duplicar, borrar con confirmación, guardar nombre y notas; «← Mis builds» vuelve a la fila', () => {
  const src = CAT.builds[0];
  globalThis.GNBldLib = fakeLib(CAT.builds);
  const remembered = [];
  globalThis.GNBldMine = { _pure: { baseOf: () => null, eliteOf: () => 0 }, remember: (id) => remembered.push(id) };
  const store = fakeStore([{ id: 'a1', code: src.code, title: 'Una', profession: src.prof, updated: 0 }, { id: 'a2', code: src.code, title: 'Dos', profession: src.prof, updated: 0 }]);
  globalThis.GNBldStore = store;
  const went = [], toasts = [];
  const inputs = { '#bldShTitle': { value: 'Nueva' }, '#bldShNotes': { value: 'notas mías' } };
  const host = { innerHTML: '', querySelector: (s) => inputs[s] || (s.startsWith('[data-sheet') ? { focus() {} } : null) };
  const ctx = { host, store, go: (t, a) => went.push(t + (a ? ':' + a : '')), toast: (m, k) => toasts.push(k + ':' + m) };
  SH._state.id = 'm:a1';
  const click = (k) => P.onClick(ctx, { target: el({ 'data-sheet': k }) });
  assert.equal(click('next'), 'next');
  assert.equal(went.pop(), 'sheet:m:a2', 'siguiente de Mis builds');
  assert.equal(click('edit'), 'edit');
  assert.equal(went.pop(), 'editor:m:a1');
  assert.equal(click('savemeta'), 'savemeta');
  assert.equal(store.get('a1').title, 'Nueva');
  assert.equal(store.get('a1').notes, 'notas mías');
  assert.match(toasts.pop(), /^ok:Guardado/);
  assert.equal(click('del'), 'del');
  assert.equal(SH._state.confirm, 'm:a1');
  assert.match(host.innerHTML, /role="alert"><span>¿Borro «Nueva»\?[\s\S]*data-sheet="del-yes"/, 'confirmación a la vista');
  assert.equal(click('del-no'), 'del-no');
  assert.equal(SH._state.confirm, '');
  assert.equal(click('dup'), 'dup');
  assert.equal(went.pop(), 'sheet:m:a1c', 'va a la copia');
  click('del'); assert.equal(click('del-yes'), 'del-yes');
  assert.equal(store.get('a1'), null);
  assert.equal(went.pop(), 'mine', 'borrada: vuelve a Mis builds');
  SH._state.id = 'm:a2';
  assert.equal(click('back'), 'back');
  assert.equal(went.pop(), 'mine');
  assert.deepEqual(remembered, ['a2'], 'Mis builds sabe a qué fila devolver el foco');
  delete globalThis.GNBldLib; delete globalThis.GNBldMine; delete globalThis.GNBldStore;
});
