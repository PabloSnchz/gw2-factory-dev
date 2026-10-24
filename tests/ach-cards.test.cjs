// Logros (BL-067, LOG-2): filtros accesibles y tarjetas «te falta» con el ícono oficial.
// js/ach-cards.js se carga por js/modules.json (DEC-035) y pinta con Achievements.getSnapshot().
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'ach-cards.js'), 'utf8');

function node(id, attrs) {
  const n = { id, attrs: Object.assign({}, attrs || {}), listeners: {}, style: {}, children: [], _h: '', classes: new Set() };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  n.classList = { add: (c) => n.classes.add(c), remove: (c) => n.classes.delete(c) };
  Object.defineProperty(n, 'hidden', { get: () => 'hidden' in n.attrs, set: (v) => { if (v) n.attrs.hidden = ''; else delete n.attrs.hidden; } });
  Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
  n.querySelector = () => null;
  n.querySelectorAll = () => [];
  return n;
}

const CALC = {
  computeProgress: (r) => { const max = Number(r.max) || 1, cur = r.done ? max : Number(r.current) || 0; return { cur, max, pct: Math.min(1, cur / max) }; },
  totalAP: (m) => (m.tiers || []).reduce((s, t) => s + (t.points || 0), 0),
  earnedAP: (r, m) => (m.tiers || []).reduce((s, t) => s + ((r.done || (r.current || 0) >= t.count) ? t.points || 0 : 0), 0)
};

function sample() {
  const metas = [
    { id: 1, name: 'Explorador de Janthir', icon: 'https://render/1.png', tiers: [{ count: 24, points: 15 }], rewards: [] },
    { id: 2, name: 'Maestro de los fractales', icon: 'https://render/2.png', tiers: [{ count: 50, points: 20 }], rewards: [{ type: 'Title', id: 9 }, { type: 'Coins', count: 12345 }] },
    { id: 3, name: 'Cazador del Cielo', tiers: [{ count: 30, points: 10 }], rewards: [{ type: 'Item', id: 5, count: 2 }, { type: 'Mastery', id: 3 }] },
    { id: 4, name: 'Colección: Aurora', icon: 'https://render/4.png', tiers: [{ count: 18, points: 10 }], rewards: [{ type: 'Item', id: 7 }] }
  ];
  const acc = [{ id: 1, current: 23, max: 24 }, { id: 2, current: 48, max: 50 }, { id: 3, current: 27, max: 30 }, { id: 4, current: 14, max: 18 }];
  return { metas, acc, cats: [{ id: 10, name: 'Janthir Wilds', icon: 'https://x/j.png' }, { id: 11, name: 'Fractales' }, { id: 2, name: 'Armas legendarias' }],
    achToCat: { 1: '10', 2: '11', 3: '10', 4: '2' } };
}

function load(opts = {}) {
  const s = sample(), nodes = {}, calls = [], docListeners = {};
  const add = (n) => { nodes[n.id] = n; return n; };
  const panel = add(node('achievementsPanel'));
  const main = add(node('achievementsMain'));
  main.parentNode = panel;
  panel.insertBefore = (c) => { panel.children.unshift(c); if (c.id) nodes[c.id] = c; };
  const st = { cat: opts.cat || '', pct: opts.pct == null ? 0.8 : opts.pct, q: '', reward: '', loaded: opts.loaded !== false, hasToken: opts.token !== false };
  const metaById = new Map(s.metas.map((m) => [m.id, m]));
  const rowsFor = () => s.acc.map((r) => ({ r, meta: metaById.get(r.id), pr: CALC.computeProgress(r) }))
    .filter((x) => x.pr.pct < 1 && x.pr.pct >= st.pct && (!st.cat || s.achToCat[x.r.id] === st.cat)).sort((a, b) => b.pr.pct - a.pr.pct);
  const A = {
    cardsByModule: opts.old ? undefined : true,
    getSnapshot: () => ({ loaded: st.loaded, hasToken: st.hasToken, acc: s.acc, rows: st.loaded ? rowsFor() : [], metaById,
      catById: new Map(s.cats.map((c) => [String(c.id), c])), achIdToCat: new Map(Object.entries(s.achToCat)),
      pct: st.pct, cat: st.cat, q: st.q, reward: st.reward, legendaryCatId: '2' }),
    setFilter: (f) => { calls.push(['setFilter', JSON.stringify(f)]); Object.assign(st, f); },
    _calc: CALC
  };
  const win = {
    console: { info() {}, log() {}, warn() {} }, setTimeout, clearTimeout, Promise, Map, JSON, Math,
    Achievements: A,
    AchArmory: opts.armory,
    GW2Api: { getItemsMany: (ids, o) => { calls.push(['items', ids.join(','), JSON.stringify(o)]); return Promise.resolve(ids.map((id) => ({ id, name: 'Cofre ' + id, icon: 'https://render/i' + id + '.png' }))); } },
    fetch: (u) => { calls.push(['fetch', u]); const ids = /ids=([\d,]+)/.exec(u)[1].split(',').map(Number);
      return Promise.resolve({ ok: true, json: () => Promise.resolve(ids.map((id) => ({ id, name: /titles/.test(u) ? 'Fractalero' : 'Leyendas de Amnytas', icon: /titles/.test(u) ? undefined : 'https://render/m.png' }))) }); }
  };
  win.window = win;
  win.document = {
    readyState: 'complete', head: { appendChild(c) { nodes[c.id] = c; } }, activeElement: null,
    getElementById: (id) => nodes[id] || null,
    createElement: () => node(''),
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); }
  };
  vm.runInContext(SRC, vm.createContext(win));
  const P = {};
  Object.keys(win.AchCards._pure).forEach((k) => { const v = win.AchCards._pure[k]; P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? JSON.parse(JSON.stringify(r)) : r; }; });
  return { win, nodes, calls, st, P, main, panel, docListeners, bar: () => panel.children.find((c) => c.id === 'achcBar') };
}
const tick = () => new Promise((r) => setTimeout(r, 5));
const fire = (host, type, attrs, extra) => { const t = node('t', attrs); t.parentNode = host; Object.assign(t, extra || {}); (host.listeners[type] || []).forEach((f) => f({ target: t })); };

test('versión 1.1.0, por js/modules.json y después de ach-view.js', () => {
  assert.match(SRC, /\* Versión: 1\.1\.0 /);
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).modules.map((x) => x.src);
  assert.ok(m.includes('js/ach-cards.js'));
  assert.ok(m.indexOf('js/ach-cards.js') > m.indexOf('js/ach-view.js'));
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /ach-cards\.js/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'archivo nuevo dentro del presupuesto de 40 KB');
});

test('con un achievements.js que todavía pinta sus tarjetas no toca nada', () => {
  const x = load({ old: true });
  assert.equal(x.bar(), undefined);
  assert.equal(x.main.innerHTML, '');
});

test('regla de Pablo: el ícono oficial del logro va arriba de la tarjeta, a 48 px', () => {
  const x = load();
  const h = x.main.innerHTML;
  assert.match(h, /<article class="achc-card achc-card--step" data-id="2"><div class="achc-top"><img class="achc-ico" src="https:\/\/render\/2\.png" alt="" width="48" height="48"/);
  assert.match(h, /data-id="3"><div class="achc-top"><img class="achc-ico" src="assets\/icons\/155059\.png" alt="" width="48" height="48"/, 'sin ícono, el de Logros');
  assert.equal((h.match(/class="achc-ico"/g) || []).length, (h.match(/<article /g) || []).length, 'cada tarjeta tiene su ícono');
  assert.match(x.P.CSS, /\.achc-ico\{width:48px;height:48px;flex-shrink:0/);
  assert.doesNotMatch(x.P.CSS, /\.achc-ico\{[^}]*display:none/);
});

test('tarjeta «te falta»: lo que falta en grande, barra verde → dorada al 95 %, nunca roja', () => {
  const x = load();
  const h = x.main.innerHTML;
  assert.match(h, /<h3 class="achc-title">Maestro de los fractales<\/h3><span class="achc-cat">Fractales<\/span>/);
  assert.match(h, /<p class="achc-miss">Te faltan <b>2<\/b> de 50<\/p>/);
  assert.match(h, /<p class="achc-miss">Te falta <b>1<\/b> de 24<\/p>/);
  assert.match(h, /<span class="achc-cat"><img src="https:\/\/x\/j\.png" alt="" width="16" height="16"[^>]*>Janthir Wilds<\/span>/, 'ícono oficial de la categoría');
  assert.match(h, /class="achc-prog achc-prog--step" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="96" aria-label="Progreso de «Maestro de los fractales»: 96 %"><i style="width:96%">/);
  assert.match(h, /data-id="3">[\s\S]*?class="achc-prog" role="progressbar"[^>]*aria-valuenow="90"/);
  assert.match(h, /\+20 AP al terminar/);
  assert.doesNotMatch(x.P.CSS, /#f81313|#ff4000|red/i, 'sin rojo');
  assert.equal(x.P.shownPct({ pct: 0.996 }), 99, 'nunca dice 100 si falta algo');
});

test('recompensas con ícono; un pedido por tipo, en español, y solo se actualizan las etiquetas', async () => {
  const x = load();
  let h = x.main.innerHTML;
  assert.match(h, /<ul class="achc-rw" aria-label="Recompensas"><li data-achc-rw="Title:9"><img src="assets\/icons\/Welcome\/605001\.png"[^>]*><span>Título<\/span><\/li><li data-achc-rw="Coins:12345">[^]*?<span>1 oro 23 plata 45 cobre<\/span>/);
  assert.match(h, /<li data-achc-rw="Item:5" data-achc-n="2">/);
  await tick();
  const items = x.calls.filter((c) => c[0] === 'items'), fetches = x.calls.filter((c) => c[0] === 'fetch').map((c) => c[1]);
  assert.deepEqual(items.map((c) => c[1]), ['5'], 'ítems: un pedido por la capa GW2Api (el 7 es legendario y no está en la lista ≥ 80 %)');
  assert.deepEqual(fetches.sort(), ['https://api.guildwars2.com/v2/masteries?ids=3&lang=es', 'https://api.guildwars2.com/v2/titles?ids=9&lang=es']);
  assert.equal(x.main.innerHTML, h, 'la grilla no se repintó');
  x.win.AchCards.render();
  h = x.main.innerHTML;
  assert.match(h, /<span>Título «Fractalero»<\/span>/);
  assert.match(h, /<img src="https:\/\/render\/i5\.png"[^>]*><span>Cofre 5 ×2<\/span>/);
  assert.match(h, /<span>Maestría: Leyendas de Amnytas<\/span>/);
  x.win.AchCards.render();
  await tick();
  assert.equal(x.calls.filter((c) => c[0] === 'items' || c[0] === 'fetch').length, 3, 'lo que ya está no se vuelve a pedir');
});

test('wiki: búsqueda en la wiki oficial en español, en otra pestaña y con nombre accesible', () => {
  const h = load().main.innerHTML;
  assert.match(h, /<a class="achc-wiki" href="https:\/\/wiki-es\.guildwars2\.com\/index\.php\?search=Maestro%20de%20los%20fractales" target="_blank" rel="noopener" aria-label="Buscar «Maestro de los fractales» en la wiki \(se abre en otra pestaña\)">Wiki ↗<\/a>/);
});

test('filtros: búsqueda, umbral y recompensa con aria-pressed, categoría con <select>', () => {
  const x = load();
  const P = x.P, snap = x.win.Achievements.getSnapshot();
  const cats = P.pendingCats(snap, CALC);
  assert.deepEqual(cats.map((c) => c.name), ['Armas legendarias', 'Fractales', 'Janthir Wilds']);
  const h = P.controlsHTML({ pct: 0.9, reward: 'Title', cat: '11' }, cats);
  assert.match(h, /<div class="achc-seg" role="group" aria-label="Qué tan cerca"><button type="button" data-achc-pct="0.8" aria-pressed="false">≥ 80 %<\/button><button type="button" data-achc-pct="0.9" aria-pressed="true">≥ 90 %<\/button>/);
  assert.match(h, /data-achc-pct="0" aria-pressed="false">Todos<\/button>/);
  assert.match(h, /data-achc-reward="Title" aria-pressed="true">Título<\/button>/);
  assert.match(h, /<label class="achc-sel"><span>Categoría<\/span><select id="achcCat"><option value="">Todas<\/option>/);
  assert.match(h, /<option value="11" selected>Fractales<\/option>/);
  const bar = x.bar();
  assert.equal(bar.attrs.role, 'search');
  assert.match(bar.innerHTML, /<label class="achc-search"><span class="achc-sr">Buscar logro<\/span><input type="search" id="achcSearch"/);
  assert.match(bar.innerHTML, /data-achc-act="more" aria-expanded="false" aria-controls="achcCtrl">Filtros<\/button>/);
  assert.match(bar.className, /ach-toolbar/, 'ach-view la oculta en «Por categoría»');
});

test('cada filtro llama a setFilter; la búsqueda espera a que termines de escribir', async () => {
  const x = load();
  const bar = x.bar();
  fire(bar, 'click', { 'data-achc-pct': '0.95' });
  fire(bar, 'click', { 'data-achc-reward': 'Item' });
  fire(bar, 'change', {}, { id: 'achcCat', value: '10' });
  fire(bar, 'input', {}, { id: 'achcSearch', value: 'ja' });
  fire(bar, 'input', {}, { id: 'achcSearch', value: 'janthir' });
  await new Promise((r) => setTimeout(r, 260));
  assert.deepEqual(x.calls.filter((c) => c[0] === 'setFilter').map((c) => c[1]),
    ['{"pct":0.95}', '{"reward":"Item"}', '{"cat":"10"}', '{"q":"janthir"}']);
});

test('sin resultados ofrece ver todo; sin API Key lo dice; cargando no pisa la grilla', () => {
  let x = load({ pct: 0.99 });
  assert.equal(x.P.activeCount(x.win.Achievements.getSnapshot()), 1);
  assert.match(x.main.innerHTML, /No hay logros con estos filtros\. <button type="button" class="achc-link" data-achc-act="reset">Ver todos los pendientes<\/button>/);
  fire(x.main, 'click', { 'data-achc-act': 'reset' });
  assert.deepEqual(x.calls.filter((c) => c[0] === 'setFilter').map((c) => c[1]), ['{"pct":0,"reward":"","q":"","cat":""}']);
  x = load({ cat: '2', pct: 0.99 });
  assert.match(x.main.innerHTML, /No tenés colecciones legendarias en curso\./);
  x = load({ token: false, loaded: false });
  assert.match(x.main.innerHTML, /Cargá tu API Key para ver tus logros\./);
  assert.equal(x.bar().hidden, true);
  x = load({ loaded: false });
  assert.equal(x.main.innerHTML, '', 'deja el «Cargando logros…» de achievements.js');
});

test('colecciones legendarias: misma tarjeta, sin «⚠», y lo que dan como «Te da»', () => {
  const x = load({ cat: '2', pct: 0 });
  const h = x.main.innerHTML;
  assert.match(h, /data-id="4"><div class="achc-top"><img class="achc-ico" src="https:\/\/render\/4\.png"/);
  assert.match(h, /<ul class="achc-rw" aria-label="Te da">/);
  assert.doesNotMatch(h + x.P.CSS, /⚠/);
});

test('celular: los filtros van en un bloque «Filtros · N» que se abre y se cierra', () => {
  const x = load({ pct: 0.9 });
  assert.match(x.P.CSS, /@media \(max-width:900px\)\{\.achc-more\{display:inline-flex/);
  assert.match(x.P.CSS, /\.achc-ctrl\{display:none;width:100%/);
  assert.match(x.P.CSS, /\.achc-ctrl\.achc-open\{display:flex\}/);
  fire(x.bar(), 'click', { 'data-achc-act': 'more' });
  assert.equal(x.win.AchCards._state.open, true);
});

test('un aviso gn:achievements vuelve a pintar con los filtros nuevos', () => {
  const x = load();
  x.st.pct = 0.95;
  x.docListeners['gn:achievements'].forEach((f) => f({}));
  assert.equal((x.main.innerHTML.match(/<article /g) || []).length, 2);
});

test('LOG-4: con ach-armory.js, «Ver en la Armería →» junto a la Wiki; en legendarias pide los precursores', () => {
  const seen = [], deep = [];
  const armory = {
    linkHTML: (x) => { seen.push(x.r.id); return x.r.id === 4 ? '<a class="achc-armory" href="#/account/legendary-armory" data-ach-armory="99">Ver en la Armería →</a>' : ''; },
    wantDeep: () => deep.push(1)
  };
  let x = load({ cat: '2', pct: 0, armory });
  assert.match(x.main.innerHTML, /<span class="achc-links"><a class="achc-armory" href="#\/account\/legendary-armory" data-ach-armory="99">Ver en la Armería →<\/a><a class="achc-wiki"/);
  assert.deepEqual(seen, [4]);
  assert.equal(deep.length, 1, 'en «Colecciones legendarias» pide los precursores');
  deep.length = 0;
  x = load({ armory });
  assert.equal(deep.length, 0, 'en «Casi listos» no los pide');
  assert.doesNotMatch(x.main.innerHTML, /achc-armory/, 'sin legendaria, sin enlace');
  x = load({ cat: '2', pct: 0, armory: { linkHTML: () => { throw new Error('x'); } } });
  assert.match(x.main.innerHTML, /<span class="achc-links"><a class="achc-wiki"/, 'si falla, la tarjeta igual se pinta');
  x = load({ cat: '2', pct: 0 });
  assert.match(x.main.innerHTML, /<span class="achc-links"><a class="achc-wiki"/, 'sin ach-armory.js, como antes');
  assert.match(x.P.CSS, /\.achc-armory\{[^}]*border:1px solid var\(--color-amber/);
});

test('reglas de la Bóveda: sin claves crudas ni endpoints con API Key', () => {
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|access_token|getSelectedToken/);
  assert.match(SRC, /G\.getItemsMany\(ids, \{ nocache: false \}\)/, 'los ítems por la capa GW2Api');
  assert.match(SRC, /'\?ids=' \+ ids\.join\(','\) \+ '&lang=es'/, 'títulos y maestrías en un pedido, en español');
});
