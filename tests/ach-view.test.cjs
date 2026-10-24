// Logros (BL-067, LOG-1): cabecera, tres pestañas y mi línea sobre achievements.js.
// js/ach-view.js se carga por js/modules.json (DEC-035) y lee Achievements.getSnapshot().
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'ach-view.js'), 'utf8');

// Nodo mínimo: atributos, hidden, clases, foco y eventos.
function node(id, attrs) {
  const n = { id, attrs: Object.assign({}, attrs || {}), listeners: {}, style: {}, children: [], _h: '', classes: new Set() };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.removeAttribute = (k) => { delete n.attrs[k]; };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  n.classList = { add: (c) => n.classes.add(c), remove: (c) => n.classes.delete(c), contains: (c) => n.classes.has(c) };
  Object.defineProperty(n, 'hidden', { get: () => 'hidden' in n.attrs, set: (v) => { if (v) n.attrs.hidden = ''; else delete n.attrs.hidden; } });
  Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
  n.querySelector = () => null;
  n.querySelectorAll = () => [];
  n.contains = () => false;
  return n;
}

// Cálculo de progreso de prueba, con la misma forma que el de achievements.js (_calc).
const CALC = {
  computeProgress: (r, m) => {
    const max = Number(r.max) || 1, cur = r.done ? max : Number(r.current) || 0;
    return { cur, max, pct: Math.min(1, cur / max) };
  },
  totalAP: (m) => (m.tiers || []).reduce((s, t) => s + (t.points || 0), 0),
  earnedAP: (r, m) => (m.tiers || []).reduce((s, t) => s + ((r.done || (r.current || 0) >= t.count) ? t.points || 0 : 0), 0)
};
const META = (id, name, tiers, rewards) => ({ id, name, tiers: tiers || [{ count: 10, points: 10 }], rewards: rewards || [] });

// Cuenta de ejemplo: 5 logros, 3 categorías (2 = legendarias).
function sample() {
  const metas = [
    META(1, 'Explorador de Janthir', [{ count: 24, points: 15 }]),
    META(2, 'Maestro de los fractales', [{ count: 50, points: 20 }], [{ type: 'Title', id: 9 }]),
    META(3, 'Cazador del Cielo', [{ count: 30, points: 10 }], [{ type: 'Item', id: 5 }, { type: 'Mastery', id: 3 }]),
    META(4, 'Colección: Aurora', [{ count: 18, points: 10 }], [{ type: 'Item', id: 7 }]),
    META(5, 'Terminado', [{ count: 1, points: 5 }])
  ];
  const acc = [
    { id: 1, current: 23, max: 24 }, { id: 2, current: 48, max: 50 }, { id: 3, current: 27, max: 30 },
    { id: 4, current: 14, max: 18 }, { id: 5, done: true, current: 1, max: 1 }
  ];
  return {
    metas, acc,
    cats: [{ id: 10, name: 'Janthir Wilds', icon: 'https://x/j.png' }, { id: 11, name: 'Fractales', icon: '' }, { id: 2, name: 'Armas legendarias', icon: 'https://x/l.png' }],
    achToCat: { 1: '10', 2: '11', 3: '10', 4: '2', 5: '10' }
  };
}

function load(opts = {}) {
  const s = sample();
  const nodes = {};
  const add = (n) => { nodes[n.id] = n; return n; };
  const panel = add(node('achievementsPanel', opts.hidden ? { hidden: '' } : {}));
  panel.firstChild = null;
  panel.insertBefore = (c) => { panel.children.unshift(c); nodes[c.id] = c; };
  add(node('achievementsMain'));
  const head = { children: [], appendChild(c) { this.children.push(c); nodes[c.id] = c; } };
  const calls = [];
  // Estado de achievements.js: setFilter cambia cat y pct y vuelve a armar la lista.
  const st = { cat: opts.cat || '', pct: opts.pct == null ? 0.8 : opts.pct, loaded: opts.loaded !== false, hasToken: opts.token !== false };
  const metaById = new Map(s.metas.map((m) => [m.id, m]));
  const rowsFor = () => s.acc.map((r) => ({ r, meta: metaById.get(r.id), pr: CALC.computeProgress(r, metaById.get(r.id)) }))
    .filter((x) => x.pr.pct < 1 && x.pr.pct >= st.pct && (!st.cat || s.achToCat[x.r.id] === st.cat))
    .sort((a, b) => b.pr.pct - a.pr.pct);
  const A = {
    getSnapshot: () => ({
      loaded: st.loaded, loading: false, hasToken: st.hasToken, acc: st.loaded ? s.acc : [], rows: st.loaded ? rowsFor() : [],
      metaById, catById: new Map(s.cats.map((c) => [String(c.id), c])), achIdToCat: new Map(Object.entries(s.achToCat)),
      pct: st.pct, cat: st.cat, reward: '', legendaryCatId: '2', ap: { perm: 28910, daily: 2572 }
    }),
    setFilter: (f) => { calls.push(['setFilter', JSON.stringify(f)]); if ('cat' in f) st.cat = f.cat || ''; if (typeof f.pct === 'number') st.pct = f.pct; },
    render: (o) => { calls.push(['render', JSON.stringify(o)]); },
    _calc: CALC
  };
  const docListeners = {};
  const win = {
    console: { info() {}, log() {}, warn() {} },
    setTimeout, clearTimeout, Promise, Date, Math, JSON, Map,
    toast: (k, m) => calls.push(['toast', k, m]),
    Achievements: opts.old ? { render() {} } : A,
    Shiruvana: { voice: (m) => { calls.push(['voice', m.kind, m.text]); return { id: '', voice: m }; } }
  };
  win.window = win;
  win.document = {
    readyState: 'complete', head, activeElement: null,
    getElementById: (id) => nodes[id] || null,
    createElement: () => node(''),
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); }
  };
  win.addEventListener = () => {};
  const voiceBox = () => nodes.achxVoice;
  // achxVoice vive dentro del HTML de la cabecera: se registra a mano para renderVoice.
  const realGet = win.document.getElementById;
  win.document.getElementById = (id) => {
    if (id === 'achxVoice' && nodes.achxHead) {
      if (!nodes.achxVoice) { const b = node('achxVoice'); b.firstChild = null; b.removeChild = () => { b.firstChild = null; }; b.appendChild = (c) => { b.firstChild = c; }; nodes.achxVoice = b; }
      return nodes.achxVoice;
    }
    return realGet(id);
  };
  vm.runInContext(SRC, vm.createContext(win));
  const P = {};
  Object.keys(win.AchView._pure).forEach((k) => {
    const v = win.AchView._pure[k];
    P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? JSON.parse(JSON.stringify(r)) : r; };
  });
  return { win, nodes, calls, V: win.AchView, P, A, st, voiceBox, docListeners, host: () => nodes.achxHead, panel };
}
const fire = (x, type, attrs, ev) => {
  const target = node('t', attrs); target.parentNode = x.host();
  (x.host().listeners[type] || []).forEach((f) => f(Object.assign({ target, preventDefault() {} }, ev || {})));
};
const voices = (x) => x.calls.filter((c) => c[0] === 'voice').map((c) => c[2]);

test('versión 1.0.0, la misma que pide js/modules.json, y por manifiesto', () => {
  assert.match(SRC, /\* Versión: 1\.0\.0 /);
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8'));
  assert.deepEqual(m.modules.filter((x) => x.src === 'js/ach-view.js'), [{ src: 'js/ach-view.js', v: '1.0.0' }]);
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /ach-view\.js/, 'se carga por el manifiesto, no por index.html');
  assert.match(SRC, /readyState === 'loading'[^\n]*DOMContentLoaded', init\);\s*else if \(doc\) init\(\);/, 'arranca aunque cargue tarde');
});

test('con un achievements.js sin getSnapshot no toca nada', () => {
  const x = load({ old: true });
  assert.equal(x.host(), undefined, 'no crea la cabecera');
  assert.equal(x.panel.classes.has('achx-on'), false, 'no oculta la cabecera vieja');
  assert.equal(x.V.render(), null);
});

test('números de la lista: al alcance, a un paso, con recompensa y la más cercana', () => {
  const { P } = load();
  const s = sample(), metaById = new Map(s.metas.map((m) => [m.id, m]));
  const rows = [1, 2, 3].map((id) => { const r = s.acc[id - 1]; return { r, meta: metaById.get(id), pr: CALC.computeProgress(r, metaById.get(id)) }; });
  const sum = P.summarize(rows, CALC);
  assert.equal(sum.count, 3);
  assert.equal(sum.apLeft, 15 + 20 + 10);
  assert.deepEqual(sum.step.map((x) => x.x.r.id), [1, 2], '≥ 95 %: 23/24 y 48/50');
  assert.equal(sum.withReward, 2);
  assert.deepEqual(sum.rewards, { Item: 1, Title: 1, Mastery: 1 });
  assert.equal(sum.prize.kind, 'Title');
  assert.equal(P.missing({ cur: 48, max: 50 }), 2);
  assert.equal(P.missing({ cur: 9, max: 5 }), 0, 'nunca negativo');
});

test('toda la cuenta: cerca (≥ 80 %), legendarias y categorías ordenadas por lo más cerca', () => {
  const x = load();
  const t = x.P.tally(x.A.getSnapshot(), CALC);
  assert.equal(t.near, 3, 'los terminados no cuentan');
  assert.equal(t.legendary, 1);
  assert.deepEqual(t.cats.map((c) => [c.id, c.near, c.pending]), [['10', 2, 2], ['11', 1, 1], ['2', 0, 1]]);
  assert.equal(t.cats[0].icon, 'https://x/j.png', 'trae el ícono oficial de la categoría');
});

test('mi línea: lo más barato primero, una recompensa después, y nada si no hay nada cerca', () => {
  const { P } = load();
  const mk = (id, cur, max, extra) => ({ r: { id }, meta: Object.assign({ name: 'L' + id, tiers: [{ count: max, points: 10 }] }, extra || {}), pr: { cur, max, pct: cur / max } });
  const two = P.summarize([mk(1, 23, 24), mk(2, 48, 50)], CALC);
  assert.equal(P.pickVoice(two, 'near').text, 'Con 2 logros sumás 20 AP: el más cercano es «L1» y te falta 1.');
  const one = P.summarize([mk(2, 48, 50)], CALC);
  assert.equal(P.pickVoice(one, 'near').text, 'Con «L2» sumás 10 AP: te faltan 2.');
  const prize = P.summarize([mk(3, 27, 30, { rewards: [{ type: 'Mastery' }] })], CALC);
  assert.equal(P.pickVoice(prize, 'near').text, 'Para terminar «L3» te faltan 3, y te da una maestría.');
  assert.equal(P.pickVoice(P.summarize([mk(4, 8, 10)], CALC), 'near'), null);
  assert.equal(P.pickVoice(two, 'cats'), null, 'en «Por categoría» no hablo');
});

test('cabecera: ícono oficial, dato en el subtítulo, al alcance y los 4 indicadores', () => {
  const x = load();
  const h = x.host().innerHTML;
  assert.ok(x.panel.classes.has('achx-on'), 'oculta la cabecera vieja solo cuando la nueva está');
  assert.match(x.P.CSS, /#achievementsPanel\.achx-on>\.panel__title,#achievementsPanel\.achx-on>\.panel__body>\.panel-head/);
  assert.match(h, /<img src="assets\/icons\/155059\.png" alt="" width="56" height="56">/, 'ícono oficial de Logros');
  assert.match(h, /<h2 id="achxTitle">Logros<\/h2><p>Tenés 3 logros al 80 % o más\.<\/p>/);
  assert.match(h, /Al alcance <b>\+45 AP<\/b>/);
  assert.match(h, /<small>Puntos de logro<\/small><b>31\.482<\/b><em>28\.910 permanentes · 2\.572 de diarios y mensuales<\/em>/);
  assert.match(h, /<small>Al alcance<\/small><b>\+45 <span>AP<\/span><\/b><em>en 3 logros de la lista<\/em>/);
  assert.match(h, /<small>A un paso \(≥ 95 %\)<\/small><b>2<\/b><em>te falta muy poco en cada uno<\/em>/);
  assert.match(h, /<small>Con recompensa<\/small><b>2<\/b><em>1 ítem · 1 título · 1 maestría<\/em>/);
  assert.match(h, /data-achx="refresh">↻ Actualizar<\/button>/);
  assert.deepEqual(voices(x), ['Con 2 logros sumás 35 AP: el más cercano es «Maestro de los fractales» y te faltan 2.'], 'el primero de la grilla (96 %)');
});

test('sin API Key o cargando: lo dice, sin números inventados', () => {
  let h = load({ token: false, loaded: false }).host().innerHTML;
  assert.match(h, /<p>Cargá tu API Key para ver tus logros\.<\/p>/);
  assert.match(h, /<small>Puntos de logro<\/small><b>—<\/b><em>sin datos todavía<\/em>/);
  assert.doesNotMatch(h, /Al alcance <b>/);
  h = load({ loaded: false }).host().innerHTML;
  assert.match(h, /<p>Cargando tus logros…<\/p>/);
  assert.doesNotMatch(h, /NaN|undefined/);
});

test('tres pestañas con contadores y aria; la grilla es el panel de «Casi listos»', () => {
  const x = load();
  const h = x.host().innerHTML;
  assert.match(h, /<div class="achx-tabs" role="tablist" aria-label="Secciones de Logros">/);
  assert.match(h, /id="achxTab-near" data-achx-tab="near" aria-selected="true" aria-controls="achievementsMain" tabindex="0">Casi listos<span class="achx-badge">3<\/span>/);
  assert.match(h, /id="achxTab-cats" data-achx-tab="cats" aria-selected="false" aria-controls="achxCats" tabindex="-1">Por categoría<span class="achx-badge">3<\/span>/);
  assert.match(h, /id="achxTab-legendary" data-achx-tab="legendary" aria-selected="false" aria-controls="achievementsMain" tabindex="-1">Colecciones legendarias<span class="achx-badge">1<\/span>/);
  assert.equal(x.nodes.achievementsMain.attrs.role, 'tabpanel');
  assert.equal(x.nodes.achievementsMain.attrs['aria-labelledby'], 'achxTab-near');
});

test('«Por categoría»: lista con íconos oficiales; al tocar una, sus pendientes en «Casi listos»', () => {
  const x = load();
  fire(x, 'click', { 'data-achx-tab': 'cats' });
  let h = x.host().innerHTML;
  assert.ok(x.panel.classes.has('achx-cats-on'), 'oculta la grilla y los filtros');
  assert.match(h, /aria-selected="true" aria-controls="achxCats"/);
  assert.match(h, /<div id="achxCats" class="achx-cats" role="tabpanel" aria-labelledby="achxTab-cats">/);
  assert.match(h, /data-achx-cat="10"><img src="https:\/\/x\/j\.png" alt="" width="32" height="32"[^>]*><span class="achx-cn">Janthir Wilds<\/span><span class="achx-cc"><b>2 cerca<\/b> · 2 pendientes<\/span>/);
  assert.match(h, /data-achx-cat="2">.*Armas legendarias<\/span><span class="achx-cc">1 pendiente<\/span>/);
  assert.match(h, /<p>Tenés logros pendientes en 3 categorías\.<\/p>/);
  assert.equal(x.calls.filter((c) => c[0] === 'setFilter').length, 0, 'mirar categorías no cambia el filtro');
  fire(x, 'click', { 'data-achx-cat': '11' });
  assert.deepEqual(x.calls.filter((c) => c[0] === 'setFilter').map((c) => c[1]), ['{"cat":"11","pct":0}'], 'todos los pendientes de la categoría');
  h = x.host().innerHTML;
  assert.ok(!x.panel.classes.has('achx-cats-on'));
  assert.match(h, /<p>Tenés 1 logro pendiente en «Fractales»\.<\/p>/);
});

test('«Colecciones legendarias» usa el filtro de legendarias y «Casi listos» vuelve al que tenías', () => {
  const x = load({ cat: '10', pct: 0.9 });
  fire(x, 'click', { 'data-achx-tab': 'legendary' });
  assert.deepEqual(x.calls.filter((c) => c[0] === 'setFilter').map((c) => c[1]), ['{"cat":"2","pct":0}']);
  assert.match(x.host().innerHTML, /<p>Tenés 1 colección legendaria en curso\.<\/p>/);
  assert.match(x.host().innerHTML, /id="achxTab-legendary" data-achx-tab="legendary" aria-selected="true"/);
  fire(x, 'click', { 'data-achx-tab': 'near' });
  assert.deepEqual(x.calls.filter((c) => c[0] === 'setFilter').map((c) => c[1]).slice(-1), ['{"cat":"10","pct":0.9}'], 'recupera categoría y umbral');
  fire(x, 'click', { 'data-achx-tab': 'near' });
  assert.equal(x.calls.filter((c) => c[0] === 'setFilter').length, 2, 'tocar la pestaña activa no refiltra');
});

test('teclado: flechas, Inicio y Fin recorren las tres pestañas', () => {
  const x = load();
  fire(x, 'keydown', { 'data-achx-tab': 'near' }, { key: 'ArrowRight' });
  assert.ok(x.panel.classes.has('achx-cats-on'));
  fire(x, 'keydown', { 'data-achx-tab': 'cats' }, { key: 'End' });
  assert.deepEqual(x.calls.filter((c) => c[0] === 'setFilter').map((c) => c[1]).slice(-1), ['{"cat":"2","pct":0}']);
  fire(x, 'keydown', { 'data-achx-tab': 'legendary' }, { key: 'Home' });
  assert.match(x.host().innerHTML, /id="achxTab-near" data-achx-tab="near" aria-selected="true"/);
  const n = x.calls.length;
  fire(x, 'keydown', { 'data-achx-tab': 'near' }, { key: 'Enter' });
  assert.equal(x.calls.length, n, 'otras teclas no navegan');
});

test('«Actualizar» vuelve a pedir sin caché; un aviso gn:achievements redibuja', () => {
  const x = load();
  fire(x, 'click', { 'data-achx': 'refresh' });
  assert.deepEqual(x.calls.filter((c) => c[0] === 'render'), [['render', '{"nocache":true}']]);
  x.st.pct = 0.95;
  x.docListeners['gn:achievements'].forEach((f) => f({}));
  assert.match(x.host().innerHTML, /<p>Tenés 2 logros al 95 % o más\.<\/p>/);
});

test('reglas de la Bóveda: sin claves crudas, sin pedidos propios y dentro de 40 KB', () => {
  assert.doesNotMatch(SRC, /localStorage|sessionStorage/);
  assert.doesNotMatch(SRC, /fetch\(|api\.guildwars2\.com/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'archivo nuevo dentro del presupuesto de 40 KB');
});

// ---------------------------------------------------------------- achievements.js 3.4.0 (LOG-1 y LOG-2)
// El archivo real publica su estado; la cabecera (ach-view.js) y las tarjetas (ach-cards.js) lo leen.
const ACH = fs.readFileSync(path.join(ROOT, 'js', 'achievements.js'), 'utf8');
const CARDS = fs.readFileSync(path.join(ROOT, 'js', 'ach-cards.js'), 'utf8');

test('achievements.js 3.4.0: publica su estado y ya no pinta cabecera, filtros ni tarjetas', () => {
  assert.match(ACH, /\* Versión: 3\.4\.0 /);
  assert.match(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /js\/achievements\.js\?v=3\.4\.0"/);
  ['renderKpi', 'ach-potential', 'ensureRefreshButton', 'kpiWrap', 'cardMainHTML', 'cardLegendaryTrackerHTML', 'ensureToolbar', 'ach-select-btn', 'loadRewardTitleDetail']
    .forEach((w) => assert.ok(!ACH.includes(w), 'sin ' + w));
  assert.match(ACH, /getSnapshot: function\(\)/);
  assert.match(ACH, /setFilter: function\(f\)/);
  assert.match(ACH, /cardsByModule: true/);
  assert.match(ACH, /_calc: \{ computeProgress: computeProgress, totalAP: totalAP, earnedAP: earnedAP \}/);
  assert.match(ACH, /new CustomEvent\('gn:achievements'/);
  assert.ok(Buffer.byteLength(ACH) <= 40 * 1024, 'en el presupuesto de 40 KB (DEC-035)');
});

// Entorno mínimo para correr achievements.js, ach-view.js y ach-cards.js reales juntos.
function loadBoth(opts = {}) {
  const nodes = {}, docListeners = {}, calls = [];
  const add = (n) => { nodes[n.id] = n; return n; };
  const panel = add(node('achievementsPanel'));
  panel.firstChild = null;
  panel.insertBefore = (c) => { panel.children.unshift(c); if (c.id) nodes[c.id] = c; };
  const main = add(node('achievementsMain'));
  main.parentNode = panel;
  const s = sample();
  const tiers = (m) => m.tiers.map((t) => ({ count: t.count, points: t.points }));
  const win = {
    console: { info() {}, log() {}, warn() {} }, setTimeout, clearTimeout, Promise, Date, Math, JSON, Map, Set, Array, Number, String, Object,
    URL, URLSearchParams,
    location: { hash: '#/account/achievements', href: 'https://dev/#/account/achievements' },
    history: { replaceState: (a, b, u) => calls.push(['url', String(u)]) },
    CustomEvent: function (t, o) { this.type = t; this.detail = o && o.detail; },
    __GN__: { getSelectedToken: () => (opts.token === false ? null : 'KEY-1') },
    GW2Api: {
      getAccountAchievements: () => Promise.resolve(s.acc.map((r) => r.done ? { id: r.id, done: true, current: r.current, max: r.max } : { id: r.id, current: r.current, max: r.max })),
      getAccountInfo: () => Promise.resolve({ daily_ap: 2000, monthly_ap: 572 }),
      getAchievementsMeta: () => Promise.resolve(s.metas.map((m) => ({ id: m.id, name: m.name, icon: 'https://render/' + m.id + '.png', tiers: tiers(m), rewards: m.rewards.map((r) => ({ type: r.type, id: r.id })), flags: [] }))),
      getItemsMany: (ids) => { calls.push(['items', ids.join(',')]); return Promise.resolve([]); }
    },
    fetch: (u) => {
      calls.push(['fetch', String(u)]);
      const cats = s.cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, achievements: Object.keys(s.achToCat).filter((k) => s.achToCat[k] === String(c.id)).map(Number) }));
      return Promise.resolve({ ok: true, json: () => Promise.resolve(String(u).includes('/categories') ? cats : []) });
    }
  };
  win.window = win;
  win.document = {
    readyState: 'complete', head: { appendChild() {} }, activeElement: null,
    getElementById: (id) => nodes[id] || null,
    querySelector: () => null, querySelectorAll: () => [],
    createElement: () => node(''),
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); },
    dispatchEvent: (e) => { calls.push(['event', e.type]); (docListeners[e.type] || []).forEach((f) => f(e)); }
  };
  win.addEventListener = () => {};
  const ctx = vm.createContext(win);
  vm.runInContext(ACH, ctx);
  vm.runInContext(SRC, ctx);
  vm.runInContext(CARDS, ctx);
  return { win, nodes, calls, panel, main, host: () => nodes.achxHead };
}

test('juntos: carga, avisa, la cabecera muestra la cuenta real y las tarjetas su ícono oficial', async () => {
  const x = loadBoth();
  await x.win.Achievements.render();
  const snap = x.win.Achievements.getSnapshot();
  assert.equal(snap.loaded, true);
  assert.deepEqual(Array.from(snap.rows, (r) => r.r.id), [2, 1, 3], 'la lista de la grilla, ordenada');
  assert.deepEqual(JSON.parse(JSON.stringify(snap.ap)), { perm: 5, daily: 2572 }, 'permanentes del único terminado; diarios y mensuales de /v2/account');
  assert.ok(x.calls.some((c) => c[0] === 'event' && c[1] === 'gn:achievements'), 'avisa al pintar');
  const h = x.host().innerHTML;
  assert.match(h, /<p>Tenés 3 logros al 80 % o más\.<\/p>/);
  assert.match(h, /Al alcance <b>\+45 AP<\/b>/);
  assert.match(h, /<small>Puntos de logro<\/small><b>2\.577<\/b><em>5 permanentes · 2\.572 de diarios y mensuales<\/em>/);
  assert.match(x.main.innerHTML, /<article class="achc-card achc-card--step" data-id="2"><div class="achc-top"><img class="achc-ico" src="https:\/\/render\/2\.png" alt="" width="48" height="48"/, 'el ícono oficial del logro, destacado');
  assert.match(x.main.innerHTML, /Te faltan <b>2<\/b> de 50/);
  assert.equal(x.calls.filter((c) => c[0] === 'fetch' && /\/v2\/achievements\/categories/.test(c[1])).length, 1, 'categorías: el pedido de siempre');
  assert.equal(x.calls.filter((c) => c[0] === 'fetch' && /\/v2\/titles\?ids=/.test(c[1])).length, 1, 'títulos: un solo pedido');
});

test('juntos: «Colecciones legendarias», «Por categoría» y los filtros nuevos usan el estado real', async () => {
  const x = loadBoth();
  await x.win.Achievements.render();
  x.win.AchView.go('legendary');
  let snap = x.win.Achievements.getSnapshot();
  assert.equal(snap.cat, '2');
  assert.equal(snap.pct, 0);
  assert.deepEqual(Array.from(snap.rows, (r) => r.r.id), [4]);
  assert.match(x.main.innerHTML, /<article class="achc-card" data-id="4"><div class="achc-top"><img class="achc-ico"/);
  assert.match(x.host().innerHTML, /<p>Tenés 1 colección legendaria en curso\.<\/p>/);
  assert.ok(x.calls.some((c) => c[0] === 'url' && /pct=0&cat=2/.test(c[1])), 'el enlace guarda el filtro');
  x.win.AchView.go('near');
  snap = x.win.Achievements.getSnapshot();
  assert.equal(snap.cat, '');
  assert.equal(snap.pct, 0.8);
  x.win.AchView.openCat('10');
  assert.deepEqual(Array.from(x.win.Achievements.getSnapshot().rows, (r) => r.r.id), [1, 3], 'todos los pendientes de Janthir');
  x.win.Achievements.setFilter({ cat: '', pct: 0, q: 'cielo' });
  assert.deepEqual(Array.from(x.win.Achievements.getSnapshot().rows, (r) => r.r.id), [3], 'búsqueda sin acentos ni mayúsculas');
  x.win.Achievements.setFilter({ q: '', reward: 'Title' });
  assert.deepEqual(Array.from(x.win.Achievements.getSnapshot().rows, (r) => r.r.id), [2], 'solo con título');
  x.win.Achievements.setFilter({ reward: 'cualquiera' });
  assert.equal(x.win.Achievements.getSnapshot().reward, '', 'una recompensa desconocida no filtra');
});

test('juntos: sin API Key la cabecera y la grilla lo dicen, sin números', async () => {
  const x = loadBoth({ token: false });
  await x.win.Achievements.render();
  assert.match(x.host().innerHTML, /<p>Cargá tu API Key para ver tus logros\.<\/p>/);
  assert.match(x.main.innerHTML, /Cargá tu API Key para ver tus logros\./);
  assert.doesNotMatch(x.host().innerHTML + x.main.innerHTML, /NaN|undefined/);
});
