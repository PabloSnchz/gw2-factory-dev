// Cámara del Brujo (BL-064, CAM-2): objetivos agrupados por lo que se puede hacer ya.
// js/wv-objectives-ui.js mantiene el contrato con router.js: renderTab(host, data, kind) y renderZero(kind).
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'wv-objectives-ui.js'), 'utf8');

function node(id) {
  const n = { id, attrs: {}, listeners: {}, _h: '', focused: 0 };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.addEventListener = (t, f, cap) => { (n.listeners[t] = n.listeners[t] || []).push({ f, cap: !!cap }); };
  n.querySelector = (sel) => {
    const m = /data-wvo-mode="(\w+)"/.exec(sel);
    if (!m || n._h.indexOf('data-wvo-mode="' + m[1] + '"') < 0) return null;
    return { focus: () => { n.focused++; } };
  };
  Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
  return n;
}

const o = (title, track, cur, tot, aa, claimed) => ({ title, track, progress_current: cur, progress_complete: tot, acclaim: aa, claimed: !!claimed });
const DAILY = {
  objectives: [
    o('Ganá una partida', 'PvP', 0, 1, 60),
    o('Completá 3 eventos', 'PvE', 3, 3, 80),
    o('Recolectá 50 materiales', 'PvE', 32, 50, 50),
    o('Capturá un campamento', 'WvW', 1, 1, 50),
    o('Matá 10 enemigos', 'PvE', 10, 10, 40, true)
  ],
  meta_progress_current: 3, meta_progress_complete: 4, meta_reward_astral: 150
};

function load() {
  const nodes = { wvTabDaily: node('wvTabDaily'), wvTabWeekly: node('wvTabWeekly'), wvTabSpecial: node('wvTabSpecial') };
  const objState = {};
  const head = { children: [], appendChild(c) { this.children.push(c); nodes[c.id] = c; } };
  const win = {
    console: { info() {}, warn() {} },
    WV: { __setObjState: (k, l) => { objState[k] = l; }, __getObjState: () => objState }
  };
  win.window = win;
  win.document = { head, getElementById: (id) => nodes[id] || null, createElement: () => node('') };
  vm.runInContext(SRC, vm.createContext(win));
  const U = win.WVObjectivesUI;
  const P = {};
  Object.keys(U._pure).forEach((k) => {
    const v = U._pure[k];
    P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? JSON.parse(JSON.stringify(r)) : r; };
  });
  return { win, nodes, U, P, objState, head };
}
const clickMode = (host, mode) => {
  const target = { getAttribute: (k) => (k === 'data-wvo-mode' ? mode : null) };
  host.listeners.click.forEach((l) => l.f({ target }));
};
const order = (h) => (h.match(/<div class="wvo-t">[^<]*/g) || []).map((s) => s.replace('<div class="wvo-t">', ''));

test('versión 2.0.0 y index.html la pide con el mismo ?v', () => {
  assert.match(SRC, /\* Versión: 2\.0\.0 /);
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(idx, /src="js\/wv-objectives-ui\.js\?v=2\.0\.0"/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'dentro del presupuesto de 40 KB');
});

test('normaliza como antes (router y dashboard leen la misma forma) y agrega el modo', () => {
  const { P } = load();
  const l = P.normalizeObjectives({ objectives: [{ id: 7, title: 'X', track: 'WvW', progress_current: 2, progress_complete: 4, acclaim: 30 }, { name: 'Y', progress: 1, total: 0 }] });
  assert.deepEqual(l[0], { id: 7, title: 'X', track: 'wvw', mode: 'wvw', progress: 2, total: 4, acclaim: 30, claimed: false, pct: 50 });
  assert.equal(l[1].title, 'Y');
  assert.equal(l[1].pct, 100, 'sin total y con avance: completo');
  assert.equal(l[1].mode, 'pve');
  assert.deepEqual(P.normalizeObjectives(null), []);
  assert.equal(P.modeOf('Special PvP'), 'pvp');
});

test('grupos: listos para reclamar, en curso (los más avanzados arriba) y reclamados', () => {
  const { P } = load();
  const list = P.normalizeObjectives(DAILY);
  const g = P.groupObjectives(list, 'all');
  assert.deepEqual(g.ready.map((x) => x.title), ['Completá 3 eventos', 'Capturá un campamento']);
  assert.deepEqual(g.run.map((x) => x.title), ['Recolectá 50 materiales', 'Ganá una partida']);
  assert.deepEqual(g.claimed.map((x) => x.title), ['Matá 10 enemigos']);
  assert.equal(g.readyAA, 130);
  assert.deepEqual(P.groupObjectives(list, 'pve').ready.map((x) => x.title), ['Completá 3 eventos']);
  assert.equal(P.statusOf({ claimed: true, pct: 100 }), 'claimed');
  assert.equal(P.statusOf({ claimed: false, pct: 99 }), 'run');
});

test('la recompensa se llama por lo que es (día, semana), no «Meta de la temporada»', () => {
  const { P } = load();
  assert.deepEqual(P.metaInfo(DAILY, 'daily'), { label: 'Recompensa del día', cur: 3, total: 4, reward: 150, pct: 75, done: false });
  assert.equal(P.metaInfo(DAILY, 'weekly').label, 'Recompensa de la semana');
  assert.equal(P.metaInfo({ meta_progress_current: 4, meta_progress_complete: 4 }, 'daily').done, true);
  assert.equal(P.metaInfo({ objectives: [] }, 'daily'), null);
});

test('renderTab: misma API, guarda el estado y pinta grupos, meta, estados con texto y filtro', () => {
  const x = load();
  const host = x.nodes.wvTabDaily;
  x.U.renderTab(host, DAILY, 'daily');
  const h = host.innerHTML;
  assert.equal(x.objState.daily.length, 5, 'WV.__setObjState recibe la lista normalizada');
  assert.ok(x.nodes['wv-objectives-ui-css'], 'inyecta su CSS una vez');
  assert.doesNotMatch(h, /Meta de la temporada|wv-obj-card|✅|✔️/);
  assert.match(h, /<div class="wvo-meta"><b>Recompensa del día<\/b><div class="wvo-bar wvo-bar--gold" aria-hidden="true"><i style="width:75%"><\/i><\/div><small>3 de 4 · al completarla, \+150<span class="wvo-aa">AA<\/span> extra<\/small><\/div>/);
  assert.match(h, /<h3 class="wvo-grp wvo-grp--ready">Listos para reclamar · 2<span>\+130<span class="wvo-aa">AA<\/span> · se cobran dentro del juego<\/span><\/h3>/);
  assert.match(h, /<h3 class="wvo-grp">En curso · 2<\/h3>/);
  assert.match(h, /<details class="wvo-done"><summary class="wvo-grp wvo-grp--claimed">Reclamados · 1<\/summary>/);
  assert.deepEqual(order(h), ['Completá 3 eventos', 'Capturá un campamento', 'Recolectá 50 materiales', 'Ganá una partida', 'Matá 10 enemigos']);
  assert.match(h, /<li class="wvo-row wvo-row--ready" data-mode="pve"><span class="wvo-mode wvo-mode--pve">PvE<\/span><div class="wvo-t">Completá 3 eventos<small>3 \/ 3<\/small><\/div><div class="wvo-bar wvo-bar--gold" aria-hidden="true"><i style="width:100%"><\/i><\/div><span class="wvo-rw">\+80<span class="wvo-aa">AA<\/span><\/span><span class="wvo-st wvo-st--ready">Listo para reclamar<\/span><\/li>/);
  assert.match(h, /<span class="wvo-st wvo-st--run">En curso · 64 %<\/span>/);
  assert.match(h, /<span class="wvo-st wvo-st--claimed">Reclamado<\/span>/);
  assert.match(h, /<div class="wvo-tool" role="group" aria-label="Filtrar por modo"><button type="button" class="wvo-chip" data-wvo-mode="all" aria-pressed="true">Todos<em>5<\/em><\/button><button[^>]*data-wvo-mode="pve" aria-pressed="false">PvE<em>3<\/em><\/button><button[^>]*data-wvo-mode="pvp" aria-pressed="false">PvP<em>1<\/em><\/button><button[^>]*data-wvo-mode="wvw" aria-pressed="false">WvW<em>1<\/em><\/button><\/div>/);
});

test('filtro por modo: vale para las tres pestañas y vuelve a «Todos» donde no hay de ese modo', () => {
  const x = load();
  x.U.renderTab(x.nodes.wvTabDaily, DAILY, 'daily');
  x.U.renderTab(x.nodes.wvTabWeekly, { objectives: [o('A', 'PvE', 0, 2, 10), o('B', 'PvE', 2, 2, 10)] }, 'weekly');
  x.U.renderTab(x.nodes.wvTabSpecial, { objectives: [o('S1', 'PvE', 0, 2, 10), o('S2', 'WvW', 1, 2, 10)] }, 'special');
  x.U.renderTab(x.nodes.wvTabSpecial, null, 'special');
  x.U.renderTab(x.nodes.wvTabSpecial, { objectives: [o('S1', 'PvE', 0, 2, 10), o('S2', 'WvW', 1, 2, 10)] }, 'special');
  clickMode(x.nodes.wvTabDaily, 'wvw');
  assert.deepEqual(order(x.nodes.wvTabSpecial.innerHTML), ['S2'], 'las otras pestañas también filtran');
  x.U.renderTab(x.nodes.wvTabSpecial, null, 'special');
  clickMode(x.nodes.wvTabDaily, 'wvw');
  assert.equal(x.nodes.wvTabSpecial.innerHTML, '<p class="wvo-empty">Sin objetivos para mostrar.</p>', 'una pestaña vacía no revive datos viejos');
  const h = x.nodes.wvTabDaily.innerHTML;
  assert.deepEqual(order(h), ['Capturá un campamento']);
  assert.match(h, /data-wvo-mode="wvw" aria-pressed="true"/);
  assert.match(h, /Listos para reclamar · 1<span>\+50/);
  assert.doesNotMatch(h, /En curso ·|Reclamados/);
  assert.equal(x.nodes.wvTabDaily.focused, 2, 'el foco vuelve al botón en cada clic');
  const w = x.nodes.wvTabWeekly.innerHTML;
  assert.deepEqual(order(w), ['B', 'A'], 'semanal solo PvE: muestra todo');
  assert.doesNotMatch(w, /wvo-tool/, 'con un solo modo no hay filtro');
  clickMode(x.nodes.wvTabDaily, 'all');
  assert.equal(order(x.nodes.wvTabDaily.innerHTML).length, 5);
});

test('«Reclamados» queda plegado y recuerda si lo abriste', () => {
  const x = load();
  const host = x.nodes.wvTabDaily;
  x.U.renderTab(host, DAILY, 'daily');
  const tog = host.listeners.toggle[0];
  assert.equal(tog.cap, true, 'toggle no burbujea: se escucha en captura');
  tog.f({ target: { open: true, classList: { contains: (c) => c === 'wvo-done' } } });
  x.U.renderTab(host, DAILY, 'daily');
  assert.match(host.innerHTML, /<details class="wvo-done" open>/);
});

test('todo reclamado: lo dice; sin datos: mensaje simple', () => {
  const x = load();
  const host = x.nodes.wvTabSpecial;
  x.U.renderTab(host, { objectives: [o('Z', 'PvE', 1, 1, 10, true)] }, 'special');
  assert.match(host.innerHTML, /<p class="wvo-empty">Todo reclamado en esta pestaña\.<\/p><details/);
  x.U.renderTab(host, null, 'special');
  assert.equal(host.innerHTML, '<p class="wvo-empty">Sin objetivos para mostrar.</p>');
  assert.deepEqual(Array.from(x.objState.special), []);
});

test('renderZero: después del reset, los mismos objetivos en cero y en curso', () => {
  const x = load();
  x.U.renderTab(x.nodes.wvTabDaily, DAILY, 'daily');
  x.U.renderZero('daily');
  const h = x.nodes.wvTabDaily.innerHTML;
  assert.match(h, /^<div class="wvo"><p class="wvo-note">Reseteado: esperando el progreso nuevo…<\/p>/);
  assert.match(h, /En curso · 5<\/h3>/);
  assert.doesNotMatch(h, /Listos para reclamar|Reclamados|wvo-meta/);
  assert.equal((h.match(/En curso · 0 %/g) || []).length, 5);
  x.U.renderZero('weekly');
  assert.equal(x.nodes.wvTabWeekly.innerHTML, '<p class="wvo-empty">Reseteado: esperando el progreso nuevo…</p>');
});

test('escapa los títulos y no usa almacenamiento ni red', () => {
  const x = load();
  x.U.renderTab(x.nodes.wvTabDaily, { objectives: [o('<b>x</b>', 'PvE', 0, 1, 1)] }, 'daily');
  assert.match(x.nodes.wvTabDaily.innerHTML, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.doesNotMatch(SRC, /localStorage|fetch\(/);
  assert.match(x.P.CSS, /@media \(max-width:900px\)\{\.wvo-row\{grid-template-columns:36px minmax\(0,1fr\) auto;grid-template-areas:"md t st" "\. bar rw"/);
});
