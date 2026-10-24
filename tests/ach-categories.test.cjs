// Logros (BL-067, LOG-3): «Por categoría» agrupada por expansión o modo.
// js/ach-categories.js se carga por js/modules.json (DEC-035) y ach-view.js le pide el contenido de la pestaña.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'ach-categories.js'), 'utf8');

function node(id, attrs) {
  const n = { id, attrs: Object.assign({}, attrs || {}), listeners: {}, children: [], _h: '', value: '' };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
  n.querySelectorAll = () => [];
  return n;
}

const CALC = { computeProgress: (r) => { const max = Number(r.max) || 1, cur = r.done ? max : Number(r.current) || 0; return { cur, max, pct: Math.min(1, cur / max) }; } };

// Cuenta de ejemplo: 4 categorías en 2 grupos oficiales + 1 sin grupo.
function snapshot() {
  const cats = [
    { id: 10, name: 'Exploración de Janthir', icon: 'https://render/c10.png', order: 1, achievements: [1, 2, 3, 4] },
    { id: 11, name: 'Fractales diarios', icon: 'https://render/c11.png', order: 2, achievements: [5, { id: 6 }] },
    { id: 12, name: 'Historia de Janthir', icon: '', order: 3, achievements: [7, 8] },
    { id: 13, name: 'Rangos de Mundo contra Mundo', icon: 'https://render/c13.png', order: 4, achievements: [9] },
    { id: 14, name: 'Sin grupo', icon: '', order: 5, achievements: [10] }
  ];
  const acc = [
    { id: 1, done: true, current: 5, max: 5 }, { id: 2, current: 23, max: 24 }, { id: 3, current: 1, max: 10 },
    { id: 5, current: 48, max: 50 }, { id: 6, done: true },
    { id: 7, done: true }, { id: 8, done: true },
    { id: 10, current: 1, max: 4 }
  ];
  const achToCat = {};
  cats.forEach((c) => c.achievements.forEach((a) => { achToCat[String(typeof a === 'number' ? a : a.id)] = String(c.id); }));
  return {
    loaded: true, acc, metaById: new Map(acc.map((r) => [r.id, { id: r.id }])),
    catById: new Map(cats.map((c) => [String(c.id), c])), achIdToCat: new Map(Object.entries(achToCat))
  };
}
const GROUPS = [
  { id: 'B-WVW', name: 'Mundo contra Mundo', order: 30, categories: [13] },
  { id: 'A-JW', name: 'Janthir Wilds', order: 10, categories: [12, 10] },
  { id: 'C-FR', name: 'Fractales de la Niebla', order: 20, categories: [11] }
];

function load(opts = {}) {
  const nodes = {}, calls = [], docListeners = {};
  const snap = snapshot();
  const win = {
    console: { info() {}, warn() {} }, setTimeout, clearTimeout, Promise, Map, JSON, Math, Date, Array, String, Number, Object,
    Achievements: { getSnapshot: () => snap, _calc: CALC },
    AchView: { render: () => calls.push(['render']) },
    fetch: (u) => {
      calls.push(['fetch', u]);
      if (opts.fail) return Promise.resolve({ ok: false, status: 503 });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(opts.groups || GROUPS) });
    }
  };
  win.window = win;
  win.document = {
    readyState: 'complete', head: { appendChild(c) { nodes[c.id] = c; } }, activeElement: null,
    getElementById: (id) => nodes[id] || null,
    createElement: () => node(''),
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); }
  };
  vm.runInContext(SRC, vm.createContext(win));
  const C = win.AchCategories;
  const P = {};
  Object.keys(C._pure).forEach((k) => { const v = C._pure[k]; P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? JSON.parse(JSON.stringify(r)) : r; }; });
  // Simula lo que hace ach-view.js: pinta la pestaña con html() y registra los nodos que usa la búsqueda.
  const paintTab = () => {
    const h = C.html(snap, CALC);
    ['achxCats', 'achgBody', 'achgCount', 'achgSearch'].forEach((id) => { if (!nodes[id]) nodes[id] = node(id); });
    nodes.achgBody.innerHTML = h.slice(h.indexOf('<div id="achgBody">') + 19, -6);
    return h;
  };
  return { win, C, P, snap, nodes, calls, docListeners, paintTab, fire: (t, target) => (docListeners[t] || []).forEach((f) => f({ target })) };
}
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 5));

test('versión 1.0.0, por js/modules.json después de ach-view.js, dentro de 40 KB', () => {
  assert.match(SRC, /\* Versión: 1\.0\.0 /);
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).modules.map((x) => x.src);
  assert.ok(m.indexOf('js/ach-categories.js') > m.indexOf('js/ach-view.js'));
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /ach-categories\.js/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
});

test('por categoría: total del juego, terminados, pendientes y cerca', () => {
  const x = load();
  const s = x.P.catStats(x.snap, CALC);
  assert.deepEqual([s['10'].total, s['10'].done, s['10'].pending, s['10'].near], [4, 1, 2, 1]);
  assert.deepEqual([s['11'].total, s['11'].done, s['11'].pending, s['11'].near], [2, 1, 1, 1], 'acepta ids sueltos y { id }');
  assert.deepEqual([s['12'].done, s['12'].pending], [2, 0]);
  assert.equal(s['13'].pending, 0, 'sin progreso: no está en la cuenta');
});

test('grupos oficiales en el orden del juego; adentro, el orden del grupo; lo que no tiene grupo, al final', () => {
  const x = load();
  const s = x.P.catStats(x.snap, CALC);
  let g = x.P.buildGroups(s, GROUPS, { mode: 'pending' });
  assert.deepEqual(g.map((v) => v.name), ['Janthir Wilds', 'Fractales de la Niebla', 'Otras categorías']);
  assert.deepEqual(g[0].cats.map((c) => c.id), ['10'], 'con pendientes: Historia (completa) no aparece');
  g = x.P.buildGroups(s, GROUPS, { mode: 'all' });
  assert.deepEqual(g.map((v) => v.name), ['Janthir Wilds', 'Fractales de la Niebla', 'Mundo contra Mundo', 'Otras categorías']);
  assert.deepEqual(g[0].cats.map((c) => c.id), ['12', '10'], 'el orden del grupo');
  assert.deepEqual([g[0].done, g[0].total, g[0].near], [3, 6, 1]);
  assert.deepEqual(x.P.buildGroups(s, null, { mode: 'pending' }).map((v) => v.name), ['Todas las categorías'], 'sin grupos, juntas');
});

test('buscador: por categoría o por grupo, sin acentos ni mayúsculas', () => {
  const x = load();
  const s = x.P.catStats(x.snap, CALC);
  assert.deepEqual(x.P.buildGroups(s, GROUPS, { mode: 'all', q: 'EXPLORACION' }).map((g) => g.cats.map((c) => c.id)), [['10']]);
  assert.deepEqual(x.P.buildGroups(s, GROUPS, { mode: 'all', q: 'janthir wilds' }).map((g) => g.cats.map((c) => c.id)), [['12', '10']], 'el grupo trae todas sus categorías');
  assert.deepEqual(x.P.buildGroups(s, GROUPS, { mode: 'pending', q: 'zzz' }), []);
  assert.match(x.P.bodyHTML([], { q: 'zzz' }), /Ninguna categoría coincide con «zzz»\. <button type="button" class="achg-link" data-achg-act="clear">Limpiar búsqueda<\/button>/);
});

test('fila: ícono oficial de la categoría, «N de M», barra verde → dorada al 95 % y cuántos tenés cerca', () => {
  const x = load();
  const s = x.P.catStats(x.snap, CALC);
  const h = x.P.groupHTML(x.P.buildGroups(s, GROUPS, { mode: 'all' })[0]);
  assert.match(h, /^<section class="achg-grp" aria-labelledby="achgH-A-JW"><h3 id="achgH-A-JW"><span>Janthir Wilds<\/span><small>2 categorías · 50 % · <b>1 cerca<\/b><\/small><\/h3>/);
  assert.match(h, /<li><button type="button" class="achg-row" data-achx-cat="10"><img src="https:\/\/render\/c10\.png" alt="" width="32" height="32"[^>]*><span class="achg-cn">Exploración de Janthir<\/span><span class="achg-cc">1 de 4<\/span><span class="achg-pb" aria-hidden="true"><i style="width:25%"><\/i><\/span><span class="achg-cm"><b>1 cerca<\/b> · 2 pendientes<\/span><\/button><\/li>/);
  assert.match(h, /<li><div class="achg-row achg-row--off"><span class="achg-noicon" aria-hidden="true"><\/span><span class="achg-cn">Historia de Janthir<\/span><span class="achg-cc">2 de 2<\/span><span class="achg-pb achg-pb--step"[^>]*><i style="width:100%"><\/i><\/span><span class="achg-cm">Sin pendientes<\/span><\/div><\/li>/, 'completa: sin botón');
  assert.doesNotMatch(x.P.CSS, /#f81313|#ff4000|\bred\b/i, 'sin rojo');
});

test('un solo pedido de grupos, público y en español; al llegar redibuja la pestaña', async () => {
  const x = load();
  const h = x.paintTab();
  assert.match(h, /Agrupando por expansión y modo…/);
  assert.match(h, /Todas las categorías/, 'mientras tanto, juntas');
  await tick();
  assert.deepEqual(x.calls.filter((c) => c[0] === 'fetch').map((c) => c[1]), ['https://api.guildwars2.com/v2/achievements/groups?ids=all&lang=es']);
  assert.equal(x.calls.filter((c) => c[0] === 'render').length, 1, 'avisa a ach-view.js');
  const h2 = x.paintTab();
  assert.match(h2, /<span>Janthir Wilds<\/span>/);
  assert.doesNotMatch(h2, /Agrupando/);
  x.paintTab();
  await tick();
  assert.equal(x.calls.filter((c) => c[0] === 'fetch').length, 1, 'no se vuelve a pedir');
});

test('si los grupos no llegan, las categorías juntas y lo digo; no reintento en cada dibujo', async () => {
  const x = load({ fail: true });
  x.paintTab();
  await tick();
  const h = x.paintTab();
  assert.match(h, /No pude traer los grupos de Guild Wars 2: te muestro las categorías juntas\./);
  assert.match(h, /<span>Todas las categorías<\/span>/);
  assert.equal(x.calls.filter((c) => c[0] === 'fetch').length, 1);
});

test('controles: buscador con etiqueta y «Con pendientes» / «Todas» con aria-pressed; conteo para el lector', async () => {
  const x = load();
  x.paintTab();
  await tick();
  const h = x.paintTab();
  assert.match(h, /^<div class="achg-ctrl"><label class="achg-search"><span class="achg-sr">Buscar categoría<\/span><input type="search" id="achgSearch"/);
  assert.match(h, /<div class="achg-seg" role="group" aria-label="Qué categorías"><button type="button" data-achg-mode="pending" aria-pressed="true">Con pendientes<\/button><button type="button" data-achg-mode="all" aria-pressed="false">Todas<\/button><\/div>/);
  assert.match(h, /<p class="achg-count achx-note" id="achgCount" aria-live="polite">3 categorías en 3 grupos\.<\/p>/);
});

test('«Todas» y la búsqueda cambian solo la lista (el buscador no se redibuja)', async () => {
  const x = load();
  x.paintTab();
  await tick();
  x.paintTab();
  const before = x.nodes.achgBody.innerHTML;
  x.fire('click', node('b', { 'data-achg-mode': 'all' }));
  assert.equal(x.C._state.mode, 'all');
  assert.notEqual(x.nodes.achgBody.innerHTML, before);
  assert.match(x.nodes.achgBody.innerHTML, /Mundo contra Mundo/);
  assert.equal(x.nodes.achgCount.textContent, '5 categorías en 4 grupos.');
  const input = x.nodes.achgSearch;
  input.value = 'fractal';
  x.fire('input', input);
  await tick(200);
  assert.equal(x.C._state.q, 'fractal');
  assert.match(x.nodes.achgBody.innerHTML, /Fractales diarios/);
  assert.doesNotMatch(x.nodes.achgBody.innerHTML, /Janthir/);
  x.fire('click', node('c', { 'data-achg-act': 'clear' }));
  assert.equal(x.C._state.q, '');
  assert.equal(input.value, '');
  assert.equal(x.docListeners.click.length, 1, 'un solo oyente aunque se dibuje muchas veces');
});

test('celular: una columna, botones de 44 px', () => {
  const css = load().P.CSS;
  assert.match(css, /@media \(max-width:900px\)\{\.achg-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /\.achg-seg button\{flex:1;min-height:44px\}/);
  assert.match(css, /\.achg-row\{[^}]*min-height:48px\}/);
});

test('reglas de la Bóveda: sin claves ni API Key; el único pedido es el público de grupos', () => {
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|access_token|getSelectedToken/);
  assert.equal((SRC.match(/root\.fetch\(/g) || []).length, 1);
  assert.doesNotMatch(SRC, /achAsidePanel|col-side/, 'nada en la Sidebar');
});
