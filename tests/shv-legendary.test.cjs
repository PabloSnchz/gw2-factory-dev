// BL-059 SHV-3a: lo que noto de tu legendaria (js/shv-legendary.js), nivel N4, con el formato común de js/shv-core.js.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/shv-legendary.js');

function load() {
  const window = { console: { info() {} } };
  vm.runInNewContext(read('js/shv-core.js'), { window, globalThis: {} });
  vm.runInNewContext(SRC, { window, globalThis: {} });
  return window;
}
const plain = (x) => JSON.parse(JSON.stringify(x));
const ITEM = { id: 30698, name: 'Bifrost' };
// Árbol ya armado (precursores cargados): 3 materiales base, un vendedor y uno sin id.
const TREE = { needsPrecursors: false, status: 'recipe', node: {}, totals: {
  rows: [{ itemId: 19721, name: 'Ectoplasma', need: 250, stock: 0 },
         { itemId: 19976, name: 'Moneda mística', need: 100, stock: 0 },
         { itemId: 20797, name: 'Esquirla de espíritu', need: 200, stock: 0 }],
  vendor: [{ id: 19925, name: 'Obsidiana', count: 10 }, { id: 19925, name: 'Obsidiana', count: 5 }],
  sinId: [{ name: 'Reliquia', count: 1 }], unknown: [] } };
const RECIPE = { status: 'recipe', rows: [
  { itemId: 29185, name: 'El precursor', need: 1 }, { itemId: 19678, name: 'Don de maestría', need: 1 },
  { itemId: 19675, name: 'Trébol místico', need: 77 }] };
const PRICES = { 19721: 3000, 19976: { sells: { unit_price: 15000 } } };   // la esquirla no se vende

test('con el árbol cuento materiales base, oro de lo que se vende y lo que no se vende aparte', () => {
  const w = load();
  const e = plain(w.ShvLegendary.estimate({ item: ITEM, tree: TREE, recipe: RECIPE,
    stock: { 19721: 50, 20797: 999 }, prices: PRICES }));
  assert.equal(e.base, 'tree');
  assert.equal(e.total, 3);
  assert.equal(e.missingKinds, 2);
  assert.equal(e.missingUnits, 300);
  assert.equal(e.gold, 200 * 3000 + 100 * 15000);
  assert.equal(e.buyable, 2);
  assert.equal(e.untradeable, 0, 'la esquirla me sobra: no falta, no cuenta como «no se vende»');
  assert.equal(e.vendor, 1, 'el vendedor se cuenta una vez por id');
  assert.equal(e.unknown, 1);
});

test('lo que falta y no tiene precio no suma oro: va aparte, con su nombre', () => {
  const w = load();
  const e = w.ShvLegendary.estimate({ item: ITEM, tree: TREE, stock: {}, prices: PRICES });
  assert.equal(e.missingKinds, 3);
  assert.equal(e.untradeable, 1);
  assert.deepEqual(plain(e.untradeableNames), ['Esquirla de espíritu']);
  assert.equal(e.gold, 250 * 3000 + 100 * 15000);
});

test('sin precios no invento oro ni digo que algo no se vende', () => {
  const w = load();
  const e = w.ShvLegendary.estimate({ item: ITEM, tree: TREE, stock: {}, prices: null });
  assert.equal(e.priced, false);
  assert.equal(e.gold, 0);
  assert.equal(e.untradeable, 0);
  const o = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: {}, prices: null })[0];
  assert.equal(o.text.length, 1);
  assert.doesNotMatch(o.text.join(' '), /oro|no se vende/);
});

test('sin precursores (D2) cuento la receta directa y lo digo', () => {
  const w = load();
  const pend = { needsPrecursors: true, status: 'pending', node: null, totals: { rows: [] } };
  const e = w.ShvLegendary.estimate({ item: ITEM, tree: pend, recipe: RECIPE, stock: { 19675: 77 }, prices: {} });
  assert.equal(e.base, 'recipe');
  assert.equal(e.total, 3);
  assert.equal(e.missingKinds, 2);
  const o = w.ShvLegendary.observe({ item: ITEM, tree: pend, recipe: RECIPE, stock: { 19675: 77 }, prices: {} })[0];
  assert.match(o.text[0], /^Para Bifrost te faltan 2 de los 3 ingredientes de la receta directa/);
  assert.equal(o.text[1], '2 no se venden: se fabrican o se consiguen jugando.');
  assert.match(o.basis.source, /la receta de la Armería/);
  // Un árbol que avisa que le faltan precursores no se usa aunque traiga filas.
  const half = { needsPrecursors: true, status: 'recipe', totals: TREE.totals };
  assert.equal(w.ShvLegendary.estimate({ item: ITEM, tree: half, recipe: RECIPE, stock: {}, prices: {} }).base, 'recipe');
});

test('la frase completa, con el formato común y su fundamento', () => {
  const w = load();
  const AT = new Date(2026, 9, 27, 4, 10).getTime();
  const list = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: {}, prices: PRICES }, { at: AT });
  const o = w.ShvCore.pick(list);
  assert.equal(o.module, 'legendary');
  assert.equal(o.id, 'falta:30698');
  assert.equal(o.priority, 'media');
  assert.equal(o.kind, 'explica');
  assert.deepEqual(plain(o.text), [
    'Para Bifrost te faltan 3 materiales base (de 3).',
    'Comprando lo que se vende: ~225 oro al precio del Bazar.',
    '1 no se vende: se fabrica o se consigue jugando.']);
  assert.equal(o.action.label, 'Ver qué me falta');
  assert.equal(o.action.act, 'legendary-open:30698');
  assert.equal(w.ShvCore.basisText(o.basis, AT),
    'tu inventario (banco, materiales y personajes) y el árbol de fabricación, con los precios del Bazar · hoy 04:10');
});

test('singular: «te falta 1 material base»', () => {
  const w = load();
  const o = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: { 19721: 250, 19976: 100 }, prices: PRICES })[0];
  assert.equal(o.text[0], 'Para Bifrost te falta 1 material base (de 3).');
});

test('si ya tenés todo te lo digo, sin oro', () => {
  const w = load();
  const o = w.ShvLegendary.observe({ item: ITEM, tree: TREE, stock: { 19721: 250, 19976: 100, 20797: 200 }, prices: PRICES })[0];
  assert.equal(o.kind, 'saluda');
  assert.deepEqual(plain(o.text), ['Para Bifrost ya tenés todos los materiales base: lo que queda es fabricar.']);
});

test('si no sé, no hablo: sin legendaria, sin receta o sin filas', () => {
  const w = load();
  const L = w.ShvLegendary;
  assert.deepEqual(plain(L.observe(null)), []);
  assert.deepEqual(plain(L.observe({ item: ITEM })), []);
  assert.deepEqual(plain(L.observe({ item: ITEM, recipe: { status: 'no_recipe', rows: [] } })), []);
  assert.deepEqual(plain(L.observe({ item: { name: 'x' }, tree: TREE })), []);
  assert.equal(L.estimate({ item: ITEM, tree: { status: 'recipe', totals: { rows: [{ itemId: 0, need: 5 }] } } }).total, 0,
    'un ingrediente sin id no se puede contar contra el inventario');
  assert.deepEqual(plain(L.observe({ item: ITEM, tree: { status: 'recipe', totals: { rows: [{ itemId: 0, need: 5 }] } } })), []);
});

test('el stock de más no resta, las filas repetidas se suman y los precios raros valen 0', () => {
  const w = load();
  const L = w.ShvLegendary;
  const tree = { status: 'recipe', totals: { rows: [{ itemId: 1, name: 'A', need: 10 }, { itemId: 1, name: 'A', need: 15 }, { itemId: 2, name: 'B', need: 0 }] } };
  const e = L.estimate({ item: ITEM, tree, stock: { 1: -4 }, prices: { 1: 'x' } });
  assert.equal(e.total, 1);
  assert.equal(e.missingUnits, 25);
  assert.equal(e.untradeable, 1);
  assert.equal(L.priceOf({ 3: { sells: { unit_price: 0 } }, 4: { sell: 7 }, 5: NaN }, 3), 0);
  assert.equal(L.priceOf({ 4: { sell: 7 } }, 4), 7);
  assert.equal(L.priceOf({ 5: NaN }, 5), 0);
  assert.equal(L.priceOf(null, 5), 0);
});

test('el oro se redondea y lleva punto de miles; menos de 1 oro se dice así', () => {
  const w = load();
  const g = w.ShvLegendary.goldText;
  assert.equal(g(12345678), '~1.235 oro');
  assert.equal(g(1234567890), '~123.457 oro');
  assert.equal(g(15000), '~2 oro');
  assert.equal(g(4999), 'menos de 1 oro');
});

test('la cuenta sigue pura; no guardo nada, no armo HTML y voy en el manifiesto después de mi globo', () => {
  const pure = SRC.slice(0, SRC.indexOf('SHV-3b: hablo en «Mi cola»'));
  assert.doesNotMatch(pure, /document|fetch\(|GW2Api|addEventListener/);
  assert.doesNotMatch(SRC, /localStorage|innerHTML|insertAdjacentHTML|fetch\(|XMLHttpRequest/);
  const mods = JSON.parse(read('js/modules.json')).modules;
  const src = mods.map((m) => m.src);
  const i = src.indexOf('js/shv-legendary.js');
  assert.ok(i > src.indexOf('js/shv-bubble.js') && src.indexOf('js/shv-bubble.js') >= 0, 'después de shv-bubble');
  assert.equal(mods[i].v, '1.1.0');
  assert.ok(Buffer.byteLength(SRC) < 20 * 1024, 'presupuesto de 20 KB');
  assert.match(SRC, /Versión: 1\.1\.0/);
  assert.equal(load().ShvLegendary.version, '1.1.0');
});

// ------------------------------------------------------------------ SHV-3b: «Mi cola», con un DOM falso
function dom() {
  const obs = [];
  let writes = 0;
  const note = (t) => { writes++; obs.forEach((o) => { if (o.root && o.root.contains(t)) o.queue.push({ target: t }); }); };
  class N {
    constructor(doc, tag) { this.ownerDocument = doc; this.tagName = String(tag).toUpperCase(); this.children = []; this.attrs = {}; this.parentNode = null; this._t = ''; this.ls = {}; this.hidden = false; }
    get id() { return this.attrs.id || ''; } set id(v) { this.attrs.id = String(v); }
    get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = String(v); }
    get textContent() { return this._t + this.children.map((c) => c.textContent).join(' '); }
    set textContent(v) { this.children = []; this._t = String(v); note(this); }
    get firstChild() { return this.children[0] || null; }
    get nextSibling() { const p = this.parentNode; return p ? p.children[p.children.indexOf(this) + 1] || null : null; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
    appendChild(c) { return this.insertBefore(c, null); }
    insertBefore(c, ref) {
      if (c.parentNode) c.parentNode.removeChild(c);
      const i = ref ? this.children.indexOf(ref) : -1;
      if (i < 0) this.children.push(c); else this.children.splice(i, 0, c);
      c.parentNode = this; note(this); return c;
    }
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; note(this); return c; }
    contains(n) { for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
    all() { const out = []; const w = (n) => n.children.forEach((c) => { out.push(c); w(c); }); w(this); return out; }
    querySelector(s) {
      return this.all().find((n) => s[0] === '.' ? n.className.split(' ').includes(s.slice(1)) : s[0] === '#' ? n.id === s.slice(1) : false) || null;
    }
    addEventListener(t, f) { (this.ls[t] = this.ls[t] || []).push(f); }
    dispatchEvent(e) { (this.ls[e.type] || []).forEach((f) => f(e)); return true; }
    closest(sel) {
      const id = sel.split(' ')[0].slice(1);
      if (this.getAttribute('data-shv-act') === null) return null;
      for (let x = this; x; x = x.parentNode) if (x.id === id) return this;
      return null;
    }
  }
  class D extends N {
    constructor() { super(null, '#document'); this.ownerDocument = this; this.head = this.appendChild(new N(this, 'head')); this.body = this.appendChild(new N(this, 'body')); this.readyState = 'complete'; }
    createElement(t) { return new N(this, t); }
    getElementById(id) { return this.all().find((n) => n.id === id) || null; }
  }
  const doc = new D();
  class MO { constructor(cb) { this.cb = cb; this.queue = []; obs.push(this); } observe(r) { this.root = r; } }
  return { doc, N, MO, obs, writes: () => writes };
}

const QITEM = { id: 30698, nameEs: 'Bifrost', name: 'The Bifrost' };
function setup(o = {}) {
  const { doc, MO, obs, writes } = dom();
  const body = doc.body.appendChild(doc.createElement('div'));
  body.id = 'legendaryArmoryBody';
  const draw = () => {   // lo que hace render-catologo en cada repintado: «Mi cola» nueva
    body.children.slice().forEach((c) => body.removeChild(c));
    const qv = body.appendChild(doc.createElement('section'));
    qv.className = 'arm-qview';
    const h = qv.appendChild(doc.createElement('h3'));
    h.className = 'arm-sec';
    qv.appendChild(doc.createElement('ol')).className = 'arm-qlist';
    return qv;
  };
  const t = { calls: [], offers: [], opened: [], timers: [], quiet: !!o.quiet };
  const state = Object.assign({ token: 'K', loading: false, error: null, readErrors: [], owned: {},
    bank: [{ id: 19721, count: 30 }], materials: [{ id: 19721, count: 20 }], characterItems: [null] }, o.state || {});
  const window = {
    console: { info() {} }, document: doc, MutationObserver: MO, Promise,
    setTimeout: (f) => { t.timers.push(f); return t.timers.length; }, clearTimeout() {},
    addEventListener: (k, f) => { if (k === 'hashchange') t.hash = f; },
    LegendaryCatalog: { items: [QITEM] },
    LegendaryTracker: {
      getState: () => state, getQueue: () => (o.queue || [30698]).slice(),
      computeMaterials: () => RECIPE, openItemModal: (id) => t.opened.push(id)
    },
    LegendaryTree: { hasPrecursors: () => o.precursors !== false, build: () => TREE },
    GW2Api: { getCommercePrices: (ids) => { t.calls.push(ids.slice()); return Promise.resolve(o.prices || [
      { id: 19721, sells: { unit_price: 3000 } }, { id: 19976, sells: { unit_price: 15000 } }]); } },
    Shiruvana: { voice: (v) => { const e = doc.createElement('aside'); e.className = 'shv-voice'; e._t = [].concat(v.text).join(' ');
      const m = doc.createElement('div'); m.className = 'shv-voice__main'; e.appendChild(m); return e; } },
    ShvBubble: { offer: (x) => { t.offers.push(x); return true; }, quiet: () => t.quiet }
  };
  if (o.noBubble) delete window.ShvBubble;
  vm.runInNewContext(read('js/shv-core.js'), { window, globalThis: {} });
  vm.runInNewContext(SRC, { window, globalThis: {}, Date, Promise });
  const tick = () => { const fs = t.timers.splice(0); fs.forEach((f) => f()); };
  const flush = () => { for (let i = 0; i < 20; i++) { const ob = obs.find((x) => x.queue.length); if (!ob) return; ob.queue = []; ob.cb([]); } };
  return { w: window, doc, body, draw, t, tick, flush, writes, state };
}

test('en «Mi cola» te lo digo en mi globo, una vez por visita, y pido al Bazar solo lo que falta', async () => {
  const s = setup();
  s.draw();
  const first = s.w.ShvLegendary.check();
  assert.equal(await s.w.ShvLegendary.check(), 'none', 'mientras el Bazar responde, no pido otra vez');
  assert.equal(await first, 'bubble');
  assert.deepEqual(plain(s.t.calls), [[19721, 19976, 20797]], 'una consulta, solo por los que faltan');
  const o = s.t.offers[0];
  assert.equal(o.module, 'legendary');
  assert.equal(o.key, '30698|tree|3');
  assert.deepEqual(plain(o.text), ['Para Bifrost te faltan 3 materiales base (de 3).',
    'Comprando lo que se vende: ~210 oro al precio del Bazar.', '1 no se vende: se fabrica o se consigue jugando.']);
  assert.equal(o.action.act, 'legendary-open:30698');
  s.draw();
  assert.equal(await s.w.ShvLegendary.check(), 'none', 'mismo dato, misma visita: no repito');
  assert.equal(s.t.calls.length, 1, 'ni vuelvo a pedir precios');
  assert.equal(s.doc.getElementById('shvLegVoice'), null, 'con el globo no escribo nada en la pantalla');
  s.state.bank = [{ id: 19721, count: 250 }];
  assert.equal(await s.w.ShvLegendary.check(), 'none', 'otra novedad en la misma visita: espera a la próxima');
  s.t.hash();
  assert.equal(await s.w.ShvLegendary.check(), 'bubble', 'en la próxima visita, sí');
  assert.equal(s.t.offers[1].key, '30698|tree|2');
  assert.deepEqual(plain(s.t.calls[1]), [19976, 20797], 'lo que ya tenés completo no lo pido');
});

test('silenciada, lo escribo dentro de «Mi cola» debajo del título, y no lo reescribo si no cambió', async () => {
  const s = setup({ quiet: true });
  const qv = s.draw();
  assert.equal(await s.w.ShvLegendary.check(), 'inline');
  assert.equal(s.t.offers.length, 0);
  const v = s.doc.getElementById('shvLegVoice');
  assert.equal(v.parentNode, qv);
  assert.equal(qv.children.indexOf(v), 1, 'debajo del título: .arm-qview~* está oculto');
  assert.match(v.textContent, /Para Bifrost te faltan 3 materiales base/);
  const n = s.writes();
  assert.equal(await s.w.ShvLegendary.check(), 'inline');
  assert.equal(s.writes(), n, 'sin cambios no toco el DOM (nada de bucles con otros observadores)');
  const qv2 = s.draw();
  await s.w.ShvLegendary.check();
  assert.equal(s.doc.getElementById('shvLegVoice').parentNode, qv2, 'si la Armería repinta, vuelvo a escribirlo');
  s.t.quiet = false;
  await s.w.ShvLegendary.check();
  assert.equal(s.doc.getElementById('shvLegVoice'), null, 'si me volvés a dejar aparecer, me saco de la pantalla');
});

test('«Ver qué me falta» abre la ficha: desde el globo y desde mi voz escrita', async () => {
  const s = setup({ quiet: true });
  s.draw();
  await s.w.ShvLegendary.wire();
  s.tick();
  await new Promise((r) => setImmediate(r));
  s.doc.dispatchEvent({ type: 'gn:shv-act', detail: { module: 'legendary', id: 'falta:30698', act: 'legendary-open:30698' } });
  s.doc.dispatchEvent({ type: 'gn:shv-act', detail: { module: 'wallet', act: 'legendary-open:1' } });
  assert.deepEqual(s.t.opened, [30698]);
  const btn = s.doc.getElementById('shvLegVoice').querySelector('.shv-obs__btn');
  assert.equal(btn.getAttribute('data-shv-act'), 'legendary-open:30698');
  s.body.ls.click[0]({ target: btn });
  assert.deepEqual(s.t.opened, [30698, 30698]);
});

test('el observador no se alimenta a sí mismo: escribir mi voz no dispara otra escritura', async () => {
  const s = setup({ quiet: true });
  s.w.ShvLegendary.wire();
  s.draw();
  for (let i = 0; i < 6; i++) { s.flush(); s.tick(); await new Promise((r) => setImmediate(r)); }
  const n = s.writes();
  for (let i = 0; i < 6; i++) { s.flush(); s.tick(); await new Promise((r) => setImmediate(r)); }
  assert.equal(s.writes(), n);
  assert.equal(s.t.timers.length, 0);
});

test('si no sé, no hablo ni pido nada: sin cola, ya la tenés, leyendo, con error o con «Mi cola» oculta', async () => {
  for (const o of [{ queue: [] }, { state: { owned: { 30698: 1 } } }, { state: { loading: true } }, { state: { token: null } },
    { state: { error: 'x' } }, { state: { readErrors: ['bank'] } }]) {
    const s = setup(o);
    s.draw();
    assert.equal(await s.w.ShvLegendary.check(), 'none', JSON.stringify(o));
    assert.equal(s.t.calls.length + s.t.offers.length, 0);
  }
  const s = setup();
  assert.equal(await s.w.ShvLegendary.check(), 'none', 'en el catálogo no hay «Mi cola»');
  s.draw().hidden = true;
  assert.equal(await s.w.ShvLegendary.check(), 'none', 'oculta');
  assert.equal(s.t.calls.length, 0);
});

test('hablo de la primera de la cola que todavía no tenés (D1)', async () => {
  const s = setup({ queue: [111, 30698], state: { owned: { 111: 1 } } });
  s.draw();
  await s.w.ShvLegendary.check();
  assert.equal(s.t.offers[0].id, 'falta:30698');
});

test('sin precursores cuento la receta directa (D2); sin respuesta del Bazar no hablo de oro', async () => {
  const s = setup({ precursors: false, prices: [] });
  s.draw();
  assert.equal(await s.w.ShvLegendary.check(), 'bubble');
  const o = s.t.offers[0];
  assert.equal(o.key, '30698|recipe|3');
  assert.equal(o.text.length, 1);
  assert.match(o.text[0], /ingredientes de la receta directa/);
  assert.match(o.basis.source, /^tu inventario .* la receta de la Armería$/);
});

test('sin globo (shv-bubble no cargó) lo escribo en «Mi cola»; el inventario suma banco, materiales y personajes', async () => {
  const s = setup({ noBubble: true });
  s.draw();
  assert.equal(await s.w.ShvLegendary.check(), 'inline');
  const st = s.w.ShvLegendary._pure.stockOf({ bank: [{ id: 1, count: 2 }], materials: [{ item_id: 1, count: 3 }],
    characterItems: [{ id: 2, count: 0 }, null, { id: 3, count: '4' }] });
  assert.deepEqual(plain(st), { 1: 5, 3: 4 });
});
