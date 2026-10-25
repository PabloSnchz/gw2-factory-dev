// Buscar en Inventario y Personajes (BL-070, INV-4): js/inv-search.js y el campo propio de una pestaña
// sumada en js/inv-view.js 1.2.0. Corre con: node --test tests/*.test.cjs
// Lógica pura, contraste en los 19 themes y una prueba de humo con un DOM mínimo: las bolsas se piden
// solo al buscar (D1), suma depósito, banco, ranuras compartidas y cada personaje, dice lo que no pudo
// leer y nunca guarda la Key.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/inv-search.js');
const VIEW = read('js/inv-view.js');
const MULTI = read('js/inv-multi.js');
const MODEL = read('js/inv-model.js');
const SETS = JSON.parse(read('assets/data/inventory-sets.json')).sets;
const CATS = JSON.parse(read('assets/data/inventory/material-categories.json')).categories;
const J = (x) => JSON.parse(JSON.stringify(x));

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'inv-model.js' });
  vm.runInContext(VIEW, sb, { filename: 'inv-view.js' });
  vm.runInContext(SRC, sb, { filename: 'inv-search.js' });
  return sb.InvSearch._pure;
}
const P = pure();

const ECTO = 19721, ECTO_CRIS = 24277, MONEDA = 19976;
const ITEMS = {
  [ECTO]: { name: 'Pegote de ectoplasma', icon: 'https://render.guildwars2.com/ecto.png', rarity: 'Exotic' },
  [MONEDA]: { name: 'Moneda mística', icon: 'https://render.guildwars2.com/moneda.png', rarity: 'Rare' },
};
const SOLO_BOLSA = 46731;
const BAG_ITEMS = { [ECTO_CRIS]: { name: 'Pegote de ectoplasma cristalizado', icon: 'https://render.guildwars2.com/cris.png', rarity: 'Fine' },
  [SOLO_BOLSA]: { name: 'Fragmento de prueba', icon: 'https://render.guildwars2.com/frag.png', rarity: 'Masterwork' } };
function bank() {
  const b = Array(90).fill(null);
  b[70] = { id: ECTO, count: 30 }; b[1] = { id: MONEDA, count: 9 };
  return b;
}
const MATERIALS = [{ id: ECTO, category: 37, count: 1200 }];
const SHARED = [{ id: ECTO_CRIS, count: 250 }, null];
const CHARS = [{ name: 'Lyra', level: 80, bags: [null, { inventory: [{ id: ECTO, count: 4 }, null] }] }, { name: 'Brann', bags: [{ inventory: [{ id: SOLO_BOLSA, count: 2 }] }] }];

function src(extra) {
  return Object.assign({ materials: MATERIALS, bank: bank(), shared: SHARED, chars: CHARS, bags: 'done' }, extra || {});
}

test('el archivo entra en el presupuesto, va por el manifiesto después del Multicuenta y no pide la API por su cuenta', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u, 'sin emojis');
  assert.doesNotMatch(SRC, /fetch\(|api\.guildwars2\.com|localStorage|Storage\.set/, 'lee por InvMulti.read y GW2Api; no guarda nada');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.indexOf('js/inv-search.js') > man.indexOf('js/inv-multi.js') && man.indexOf('js/inv-multi.js') > 0);
  assert.doesNotMatch(read('index.html'), /inv-search\.js/);
  assert.match(MULTI, /read: function \(path, tk, nocache\)/, 'el Multicuenta presta su lector');
});

test('dónde está: depósito, banco con su pestaña, ranuras compartidas y cada personaje', () => {
  const index = P.buildIndex(src());
  const r = P.results({ q: 'ECTOPLASMA', index, items: Object.assign({}, ITEMS, BAG_ITEMS) });
  assert.deepEqual(J(r.map((x) => x.id)), [ECTO, ECTO_CRIS], 'sin mayúsculas; primero lo que empieza igual y lo que más tenés');
  assert.equal(r[0].total, 1234);
  assert.deepEqual(J(r[0].places.map(P.placeText)), [
    { where: 'Depósito de materiales', count: 1200 }, { where: 'Banco, pestaña 3', count: 30 }, { where: 'Lyra', count: 4 }]);
  assert.deepEqual(J(P.placeText(r[1].places[0])), { where: 'Ranuras compartidas', count: 250 });
  assert.deepEqual(J(P.results({ q: 'mistica', index, items: ITEMS }).map((x) => x.id)), [MONEDA], 'sin tildes');
  assert.equal(P.results({ q: '   ', index, items: ITEMS }).length, 0);
});

test('estados honestos: mientras leo las bolsas lo digo; lo que no se pudo leer se nombra y no suma', () => {
  const items = Object.assign({}, ITEMS, BAG_ITEMS);
  let s = { q: 'ecto', index: P.buildIndex(src({ bags: 'loading' })), items, bags: 'loading' };
  let r = P.results(s);
  assert.equal(r[0].total, 1230, 'todavía sin las bolsas');
  assert.equal(P.statusText(s, r), 'Encontré 1 ítem con «ecto». Estoy leyendo las bolsas de tus personajes y las ranuras compartidas…');
  s = { q: 'ecto', index: P.buildIndex(src({ shared: null, chars: null })), items, bags: 'done' };
  r = P.results(s);
  assert.equal(P.statusText(s, r), 'Encontré 1 ítem con «ecto». No pude leer las ranuras compartidas y las bolsas de tus personajes: revisá que la API Key tenga permiso de inventarios y de personajes.');
  s = { q: 'zzz', index: P.buildIndex(src()), items, bags: 'done' };
  assert.equal(P.statusText(s, P.results(s)), 'No encontré nada que se llame «zzz» en tu cuenta.');
  const many = {}, mats = [];
  for (let i = 1; i <= 60; i++) { many[i] = { name: 'Cosa ' + i }; mats.push({ id: i, count: i }); }
  s = { q: 'cosa', index: P.buildIndex({ materials: mats, bank: [], shared: [], chars: [], bags: 'done' }), items: many };
  assert.equal(P.results(s).length, P.LIMIT);
  assert.match(P.statusText(s, P.results(s)), /te muestro los primeros 50/);
});

test('vista: cada resultado dice para el lector cuánto tenés y dónde; la rareza en texto, nunca como color de letra', () => {
  const s = { hasToken: true, loaded: true, q: 'ecto', index: P.buildIndex(src()), items: Object.assign({}, ITEMS, BAG_ITEMS), bags: 'done' };
  const h = P.html(s);
  assert.match(h, /<p class="is-st" role="status">Encontré 2 ítems con «ecto»\.<\/p>/);
  assert.match(h, /Pegote de ectoplasma<span class="iv-sr">, Exótico\. 1\.234 en total: Depósito de materiales 1\.200, Banco, pestaña 3 30, Lyra 4\.<\/span>/);
  assert.match(h, /render\.guildwars2\.com\/cris\.png/);
  assert.match(h, /<ul class="is-pl" aria-hidden="true">/);
  assert.match(P.html(Object.assign({}, s, { q: '' })), /Escribí el nombre de un ítem/);
  assert.match(P.html(Object.assign({}, s, { hasToken: false })), /Sin API Key no puedo buscar/);
  assert.match(P.html(Object.assign({}, s, { loaded: false })), /Leyendo tu cuenta…/);
  assert.match(P.toolsHTML({ q: '<b>' }), /id="isQ"[^>]*value="&lt;b&gt;"/);
  assert.doesNotMatch(P.CSS, /(^|[;{])\s*color:var\(--(acc-1|iv-mod|gn-mod|iv-r)\)/m);
});

test('en los 19 themes cada texto de Buscar llega a 4.5:1 sobre las superficies donde se pinta', () => {
  const TD = path.join(ROOT, 'css', 'themes');
  const themes = fs.readdirSync(TD).filter((f) => f.endsWith('.css'));
  assert.equal(themes.length, 19);
  const sb = { console: { info() {}, warn() {} }, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat, setTimeout: () => 0 };
  sb.window = sb;
  vm.createContext(sb);
  ['js/gn-surface.js', 'js/gn-frame.js'].forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  const G = sb.GNSurface._pure;
  const keys = new Set();
  P.CSS.replace(/(?:^|[;{])\s*color\s*:\s*var\((--[\w-]+)/g, (m, k) => { keys.add(k); return m; });
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2'], 'solo el texto del theme');
  const fails = [];
  themes.forEach((f) => {
    const css = fs.readFileSync(path.join(TD, f), 'utf8'), t = {};
    css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
    const sf = G.surfaces(t), fx = sb.GNFrame._pure.guardFixes(sb.GNSurface.surfaceTokens(t), G);
    const eff = Object.assign({}, t, sf, fx);
    const tray = G.parse(sf['--gn-tray']), card = G.parse(sf['--bg-1']);
    [...keys].forEach((k) => [['bandeja', tray], ['tarjeta', card]].forEach(([n, s]) => {
      const r = G.contrast(G.over(G.parse(eff[k]), s), s);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
  });
  assert.deepEqual(fails, []);
});

// ------------------------------------------------------------------ humo con DOM mínimo
function fakeDom() {
  const els = {};
  function el(id, tag) {
    const n = {
      id, tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', hidden: false, listeners: {},
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      style: { setProperty() {}, removeProperty() {} },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      removeAttribute(k) { delete this.attrs[k]; },
      appendChild(c) { this.children.push(c); if (c.id) els[c.id] = c; return c; },
      insertBefore(c) { this.children.unshift(c); if (c.id) els[c.id] = c; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      contains() { return false; }, querySelector() { return null; },
    };
    if (id) els[id] = n;
    return n;
  }
  const panel = el('inventoryPanel', 'section');
  const drawn = (id) => els.ivRoot && els.ivRoot.innerHTML.includes('id="' + id + '"');
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null,
    getElementById: (id) => els[id] || ((id === 'ivVoice' || id === 'ivList') && drawn(id) ? el(id) : null),
    createElement: (t) => { const n = el(null, t); Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } }); return n; },
    addEventListener() {},
  };
  return { els, panel, document };
}

function boot(opts) {
  const D = fakeDom();
  const store = Object.assign({ 'gn:account:keys': JSON.stringify([{ value: 'KEY-SECRETA', label: 'Gato', tag: 'main' }]),
    'gn:inventory:tab': JSON.stringify('search') }, opts.store || {});
  const calls = [];
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), clearTimeout() {},
    location: { hash: '#/account/characters' }, addEventListener() {},
    fetch: (u) => {
      calls.push(['fetch', u.replace(/access_token=[^&]+/, 'access_token=…')]);
      if (u === 'assets/data/inventory-sets.json') return Promise.resolve({ ok: true, json: () => Promise.resolve({ sets: J(SETS) }) });
      if (u.indexOf('assets/') === 0) return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: J(CATS) }) });
      const v = opts.bagsFail ? null : u.includes('/v2/account/inventory') ? SHARED : u.includes('/v2/characters?ids=all') ? CHARS : null;
      return Promise.resolve(v ? { ok: true, status: 200, json: () => Promise.resolve(J(v)) } : { ok: false, status: 403, json: () => Promise.resolve({}) });
    },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected', ACCOUNT_KEYS: 'gn:account:keys' },
      get: (k) => (k in store ? JSON.parse(store[k]) : (k === 'gn:account:selected' ? 'KEY-SECRETA' : null)),
      set: (k, v) => { store[k] = JSON.stringify(v); } },
    GW2Api: {
      getAccountBank: () => Promise.resolve(bank()),
      getAccountMaterials: () => Promise.resolve(J(MATERIALS)),
      getAccountLegendaryArmory: () => Promise.resolve([]),
      getCharacterCount: () => Promise.resolve(2),
      getItemsMany: (ids) => { calls.push(['items', ids.slice().sort((a, b) => a - b)]); return Promise.resolve(ids.map((id) => Object.assign({ id }, ITEMS[id] || BAG_ITEMS[id] || { name: 'Ítem ' + id }))); },
      getCommercePrices: () => Promise.resolve([]),
    },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'inv-model.js' });
  vm.runInContext(VIEW, sb, { filename: 'inv-view.js' });
  vm.runInContext(MULTI, sb, { filename: 'inv-multi.js' });
  vm.runInContext(SRC, sb, { filename: 'inv-search.js' });
  return { sb, D, store, calls };
}
const flush = () => new Promise((r) => setTimeout(r, 30));
const list = (D) => (D.els.ivList ? D.els.ivList.innerHTML : '');
const bagCalls = (calls) => calls.filter((c) => c[0] === 'fetch' && c[1].indexOf('https://api.guildwars2.com') === 0);

test('humo: la pestaña Buscar va después de Multicuenta, con su campo; las bolsas se piden recién al buscar', async () => {
  const { sb, D, store, calls } = boot({});
  await flush();
  const host = D.els.ivRoot;
  assert.match(host.innerHTML, /id="ivTab-search"[^>]*aria-selected="true"/);
  assert.ok(host.innerHTML.indexOf('ivTab-multi') < host.innerHTML.indexOf('ivTab-search') && host.innerHTML.indexOf('ivTab-search') < host.innerHTML.indexOf('ivTab-mat'));
  assert.match(host.innerHTML, /<div class="iv-tools"><label class="iv-search"><span class="iv-sr">Buscar en tu cuenta<\/span><input type="search" id="isQ"/);
  assert.doesNotMatch(host.innerHTML, /id="ivQ"/, 'sin el filtro de las otras pestañas');
  assert.match(host.innerHTML, /Escribí el nombre de un ítem/);
  assert.equal(bagCalls(calls).length, 0, 'D1: sin buscar no pido bolsas');
  host.listeners.input.forEach((f) => f({ type: 'input', target: { id: 'isQ', value: '   ', getAttribute: () => null } }));
  await flush();
  assert.equal(sb.InvSearch.getSnapshot().bags, 'idle', 'un campo vacío tampoco las pide');
  assert.equal(bagCalls(calls).length, 0);

  host.listeners.input.forEach((f) => f({ type: 'input', target: { id: 'isQ', value: 'ecto', getAttribute: () => null } }));
  await flush();
  assert.deepEqual(bagCalls(calls).map((c) => c[1]).sort(), [
    'https://api.guildwars2.com/v2/account/inventory?access_token=…', 'https://api.guildwars2.com/v2/characters?ids=all&access_token=…']);
  assert.ok(calls.some((c) => c[0] === 'items' && c[1].includes(ECTO_CRIS) && c[1].includes(SOLO_BOLSA)), 'pide el nombre de lo que solo está en las ranuras y las bolsas');
  const h = list(D);
  assert.match(h, /Encontré 2 ítems con «ecto»\./);
  assert.match(h, /1\.234 en total: Depósito de materiales 1\.200, Banco, pestaña 3 30, Lyra 4\./);
  assert.match(h, /Pegote de ectoplasma cristalizado<span class="iv-sr">, Bueno\. 250 en total: Ranuras compartidas 250\./);
  assert.equal(sb.InvSearch.getSnapshot().q, 'ecto');

  host.listeners.input.forEach((f) => f({ type: 'input', target: { id: 'isQ', value: 'mística', getAttribute: () => null } }));
  await flush();
  assert.equal(bagCalls(calls).length, 2, 'una sola vez: la segunda búsqueda no vuelve a pedir');
  assert.match(list(D), /Moneda mística<span class="iv-sr">, Raro\. 9 en total: Banco, pestaña 1 9\./);
  host.listeners.input.forEach((f) => f({ type: 'input', target: { id: 'isQ', value: 'fragmento', getAttribute: () => null } }));
  await flush();
  assert.match(list(D), /Fragmento de prueba<span class="iv-sr">, Obra maestra\. 2 en total: Brann 2\./);
  assert.ok(!Object.keys(store).filter((k) => k !== 'gn:account:keys').some((k) => store[k].includes('SECRETA')), 'la Key nunca se guarda');
});

test('humo: si no puedo leer las bolsas, lo demás se ve y lo digo', async () => {
  const { D } = boot({ bagsFail: true });
  await flush();
  D.els.ivRoot.listeners.input.forEach((f) => f({ type: 'input', target: { id: 'isQ', value: 'ecto', getAttribute: () => null } }));
  await flush();
  const h = list(D);
  assert.match(h, /1\.230 en total: Depósito de materiales 1\.200, Banco, pestaña 3 30\./);
  assert.match(h, /No pude leer las ranuras compartidas y las bolsas de tus personajes/);
});
