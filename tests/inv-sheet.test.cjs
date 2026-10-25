// Ficha del ítem de Inventario y Personajes (BL-070, INV-6): js/inv-sheet.js y los botones data-inv-item
// de inv-view 1.4.0, inv-search 1.0.1 e inv-chars 1.0.1. Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/inv-sheet.js');
const VIEW = read('js/inv-view.js');
const MULTI = read('js/inv-multi.js');
const SEARCH = read('js/inv-search.js');
const CHARS = read('js/inv-chars.js');
const MODEL = read('js/inv-model.js');
const SETS = JSON.parse(read('assets/data/inventory-sets.json')).sets;
const CATS = JSON.parse(read('assets/data/inventory/material-categories.json')).categories;
const PROFS = JSON.parse(read('assets/data/inventory/professions.json'));
const J = (x) => JSON.parse(JSON.stringify(x));

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'inv-model.js' });
  vm.runInContext(VIEW, sb, { filename: 'inv-view.js' });
  vm.runInContext(SRC, sb, { filename: 'inv-sheet.js' });
  return sb.InvSheet._pure;
}
const P = pure();

const ECTO = { id: 19721, name: 'Pegote de ectoplasma', icon: 'https://render.guildwars2.com/ecto.png', rarity: 'Exotic', level: 0, type: 'CraftingMaterial',
  description: 'Material de <c=@flavor>artesanía</c> raro.', vendor_value: 192, flags: [], chat_link: '[&AgHJTQAA]' };
const LEGEND = { id: 30684, name: 'Aurora', rarity: 'Legendary', level: 80, flags: ['AccountBound', 'NoSell'], vendor_value: 100000, chat_link: '[&AgFcdwAA]' };
const PRICE = { id: 19721, buys: { quantity: 41234, unit_price: 2210 }, sells: { quantity: 98765, unit_price: 2345 } };

test('el archivo entra en el presupuesto, va por el manifiesto al final del módulo y no pide la API por su cuenta', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u);
  assert.doesNotMatch(SRC, /api\.guildwars2\.com|localStorage|Storage\.set/);
  const man = JSON.parse(read('js/modules.json')).modules;
  const src = man.map((m) => m.src);
  assert.ok(src.indexOf('js/inv-sheet.js') > src.indexOf('js/inv-chars.js') && src.indexOf('js/inv-chars.js') > 0);
  assert.doesNotMatch(read('index.html'), /inv-sheet\.js/);
  // Cada lugar donde se ve un ítem lo ofrece como botón que abre la ficha.
  [['inv-view', VIEW, 2], ['inv-search', SEARCH, 1], ['inv-chars', CHARS, 1]].forEach(([n, s, k]) =>
    assert.equal((s.match(/class="iv-open" data-inv-item="/g) || []).length, k, n));
});

test('Bazar (D3): venta más barata y pedido más alto con cuántos hay; ligado o sin precio, lo digo', () => {
  assert.equal(P.coins(2345), '23 p 45 c');
  assert.equal(P.coins(1234567), '123 o 45 p 67 c');
  assert.equal(P.coins(10000), '1 o');
  assert.equal(P.coins(0), '0 c');
  assert.deepEqual(J(P.priceLines(ECTO, PRICE, 'done')), { kind: 'ok', lines: ['Venta más barata: 23 p 45 c (98.765 a la venta)', 'Pedido de compra más alto: 22 p 10 c (41.234 pedidos)'] });
  assert.deepEqual(J(P.priceLines(ECTO, { id: 1, buys: { quantity: 0, unit_price: 0 }, sells: { quantity: 3, unit_price: 99 } }, 'done').lines), ['Venta más barata: 99 c (3 a la venta)', 'Nadie lo está pidiendo ahora.']);
  assert.equal(P.priceLines(LEGEND, null, 'done').kind, 'bound');
  assert.equal(P.priceLines(LEGEND, null, 'loading').kind, 'bound', 'si está ligado ni lo consulto');
  assert.equal(P.priceLines(ECTO, null, 'done').lines[0], 'Sin precio en el Bazar ahora.');
  assert.equal(P.priceLines(ECTO, null, 'loading').lines[0], 'Consultando el Bazar…');
  assert.equal(P.clean('a<br>b <c=@flavor>c</c>'), 'a b c');
});

test('vista de la ficha: rareza en texto, descripción limpia, dónde está, Bazar, mercader, código y wiki', () => {
  const where = { index: { unread: [] }, total: 1234, unread: [], bags: 'done', places: [
    { kind: 'materials', count: 1200 }, { kind: 'bank', tab: 3, count: 30 }, { kind: 'char', name: 'Lyra', count: 4 }] };
  const h = P.html({ id: 19721, item: ECTO, itemState: 'done', where, price: PRICE, priceState: 'done' });
  assert.match(h, /<h2 id="ishTitle">Pegote de ectoplasma<\/h2><p>Exótico<\/p>/);
  assert.match(h, /style="--iv-r:#FFA405"/, 'el color de la rareza va en el anillo');
  assert.match(h, /<p class="ish-desc">Material de artesanía raro\.<\/p>/);
  assert.match(h, /<b>1\.234<\/b> en tu cuenta/);
  assert.match(h, /<li>Depósito de materiales 1\.200<\/li><li>Banco, pestaña 3 30<\/li><li>Lyra 4<\/li>/);
  assert.match(h, /Venta más barata: 23 p 45 c/);
  assert.match(h, /Al mercader: 1 p 92 c cada uno\./);
  assert.match(h, /<code>\[&amp;AgHJTQAA\]<\/code><\/span><button type="button" class="iv-btn" id="ishCopy"/);
  assert.match(h, /href="https:\/\/wiki-es\.guildwars2\.com\/index\.php\?search=Pegote%20de%20ectoplasma" target="_blank" rel="noopener"/);
  assert.match(h, /id="ishClose" data-ish-close="1">Cerrar<span class="iv-sr"> la ficha<\/span>/);
  const leg = P.html({ id: 30684, item: LEGEND, itemState: 'done', where: { index: null }, priceState: 'done' });
  assert.match(leg, /<p>Legendario · Nivel 80<\/p>/);
  assert.match(leg, /Está ligado: no se puede vender en el Bazar\./);
  assert.doesNotMatch(leg, /Al mercader/);
  assert.match(leg, /Sin datos de tu cuenta\./);
  const wait = P.html({ id: 19721, meta: { name: 'Pegote de ectoplasma', rarity: 'Exotic' }, itemState: 'loading', where: Object.assign({}, where, { bags: 'loading' }), priceState: 'loading' });
  assert.match(wait, /Leyendo las bolsas de tus personajes/);
  assert.match(wait, /Consultando el Bazar…/);
  assert.match(P.html({ id: 5, itemState: 'error', where: { index: null } }), /No pude leer los datos de este ítem/);
});

test('CSS: diálogo a pantalla completa en el celular, 44 px, foco visible y solo el texto del theme', () => {
  assert.match(P.CSS, /@media \(max-width:520px\)\{\.ish-back\{padding:0\}\.ish\{width:100%;max-height:100vh;height:100%/);
  assert.match(P.CSS, /\.ish \.iv-btn\{min-height:44px\}/);
  assert.match(P.CSS, /focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(P.CSS, /prefers-reduced-motion:reduce/);
  const keys = new Set();
  P.CSS.replace(/(?:^|[;{])\s*color\s*:\s*var\((--[\w-]+)/g, (m, k) => { keys.add(k); return m; });
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2']);
});

test('en los 19 themes cada texto de la ficha llega a 4.5:1 sobre su tarjeta', () => {
  const TD = path.join(ROOT, 'css', 'themes');
  const themes = fs.readdirSync(TD).filter((f) => f.endsWith('.css'));
  assert.equal(themes.length, 19);
  const sb = { console: { info() {}, warn() {} }, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat, setTimeout: () => 0 };
  sb.window = sb;
  vm.createContext(sb);
  ['js/gn-surface.js', 'js/gn-frame.js'].forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  const G = sb.GNSurface._pure;
  const fails = [];
  themes.forEach((f) => {
    const css = fs.readFileSync(path.join(TD, f), 'utf8'), t = {};
    css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
    const sf = G.surfaces(t), fx = sb.GNFrame._pure.guardFixes(sb.GNSurface.surfaceTokens(t), G);
    const eff = Object.assign({}, t, sf, fx);
    const card = G.parse(sf['--bg-1']);
    ['--tx-1', '--tx-2'].forEach((k) => {
      const r = G.contrast(G.over(G.parse(eff[k]), card), card);
      if (r < 4.5) fails.push(f + ' ' + k + ' ' + r.toFixed(2));
    });
  });
  assert.deepEqual(fails, []);
});

// ------------------------------------------------------------------ humo con DOM mínimo
function fakeDom() {
  const els = {}, docL = {};
  function el(id, tag) {
    const n = {
      id, tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', hidden: false, listeners: {}, parentNode: null, focused: 0,
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      style: { setProperty() {}, removeProperty() {} },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      removeAttribute(k) { delete this.attrs[k]; },
      appendChild(c) { this.children.push(c); c.parentNode = this; if (c.id) els[c.id] = c; return c; },
      insertBefore(c) { this.children.unshift(c); c.parentNode = this; if (c.id) els[c.id] = c; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      contains() { return false; }, querySelector() { return null }, querySelectorAll() { return []; }, focus() { this.focused++; },
    };
    if (id) els[id] = n;
    return n;
  }
  const panel = el('inventoryPanel', 'section');
  const drawn = (id) => els.ivRoot && els.ivRoot.innerHTML.includes('id="' + id + '"');
  const document = {
    readyState: 'complete', head: el(null, 'head'), body: el(null, 'body'), activeElement: null,
    getElementById: (id) => els[id] || ((id === 'ivVoice' || id === 'ivList') && drawn(id) ? el(id) : null),
    createElement: (t) => { const n = el(null, t); Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } }); return n; },
    addEventListener: (t, f) => { (docL[t] = docL[t] || []).push(f); },
  };
  return { els, panel, document, docL };
}

function boot(opts) {
  const D = fakeDom();
  const store = { 'gn:account:keys': JSON.stringify([{ value: 'KEY-SECRETA', label: 'Gato', tag: 'main' }]), 'gn:inventory:tab': JSON.stringify('mat') };
  const calls = [];
  const bank = Array(90).fill(null); bank[70] = { id: 19721, count: 30 };
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), clearTimeout() {},
    location: { hash: '#/account/characters' }, addEventListener() {},
    fetch: (u) => {
      calls.push(['fetch', u.replace(/access_token=[^&]+/, 'access_token=…')]);
      if (u === 'assets/data/inventory-sets.json') return Promise.resolve({ ok: true, json: () => Promise.resolve({ sets: J(SETS) }) });
      if (u === 'assets/data/inventory/professions.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(J(PROFS)) });
      if (u.indexOf('assets/') === 0) return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: J(CATS) }) });
      const v = u.includes('/v2/characters?ids=all') ? [{ name: 'Lyra', bags: [{ inventory: [{ id: 19721, count: 4 }] }] }] : u.includes('/v2/account/inventory') ? [] : null;
      return Promise.resolve(v ? { ok: true, status: 200, json: () => Promise.resolve(J(v)) } : { ok: false, status: 403, json: () => Promise.resolve({}) });
    },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected', ACCOUNT_KEYS: 'gn:account:keys' },
      get: (k) => (k in store ? JSON.parse(store[k]) : (k === 'gn:account:selected' ? 'KEY-SECRETA' : null)),
      set: (k, v) => { store[k] = JSON.stringify(v); } },
    GW2Api: {
      getAccountBank: () => Promise.resolve(J(bank)), getAccountMaterials: () => Promise.resolve([{ id: 19721, category: 37, count: 1200 }]),
      getAccountLegendaryArmory: () => Promise.resolve([]), getCharacterCount: () => Promise.resolve(1),
      getItemsMany: (ids) => { calls.push(['items', ids.slice()]); return Promise.resolve(ids.map((id) => (id === 19721 ? J(ECTO) : { id, name: 'Ítem ' + id }))); },
      getCommercePrices: (ids) => { calls.push(['prices', ids.slice()]); return Promise.resolve(opts.noPrice ? [] : [J(PRICE)]); },
    },
  };
  sb.window = sb;
  vm.createContext(sb);
  [['inv-model.js', MODEL], ['inv-view.js', VIEW], ['inv-multi.js', MULTI], ['inv-search.js', SEARCH], ['inv-chars.js', CHARS], ['inv-sheet.js', SRC]]
    .forEach(([f, s]) => vm.runInContext(s, sb, { filename: f }));
  return { sb, D, store, calls };
}
const flush = () => new Promise((r) => setTimeout(r, 30));

test('humo: tocar un ítem del módulo abre su ficha con dónde está y el Bazar; Escape la cierra y el foco vuelve al ítem', async () => {
  const { sb, D, calls } = boot({});
  await flush();
  const root = D.els.ivRoot;
  assert.match(root.innerHTML, /<button type="button" class="iv-open" data-inv-item="19721" aria-haspopup="dialog">/, 'Materiales ofrece el ítem como botón');
  const btn = { getAttribute: (k) => (k === 'data-inv-item' ? '19721' : null), parentNode: root, focused: 0, focus() { this.focused++; } };
  D.docL.click.forEach((f) => f({ target: btn }));
  await flush();
  const back = D.els.ishBack, box = D.els.ishBox;
  assert.ok(back && box, 'crea el diálogo una sola vez, fuera del módulo');
  assert.equal(back.getAttribute('hidden'), null);
  assert.equal(box.getAttribute('role'), 'dialog');
  assert.equal(box.getAttribute('aria-modal'), 'true');
  assert.equal(box.getAttribute('aria-labelledby'), 'ishTitle');
  assert.match(box.innerHTML, /<h2 id="ishTitle">Pegote de ectoplasma<\/h2>/);
  assert.match(box.innerHTML, /<b>1\.234<\/b> en tu cuenta/, 'depósito 1.200 + banco 30 + Lyra 4');
  assert.match(box.innerHTML, /<li>Lyra 4<\/li>/);
  assert.match(box.innerHTML, /Pedido de compra más alto: 22 p 10 c \(41\.234 pedidos\)/);
  assert.ok(calls.some((c) => c[0] === 'prices' && c[1].length === 1 && c[1][0] === 19721), 'pide el precio de ese ítem solo');
  assert.equal(sb.InvSheet.getSnapshot().open, true);

  back.listeners.keydown.forEach((f) => f({ key: 'Escape', preventDefault() {} }));
  assert.equal(back.getAttribute('hidden'), '');
  assert.equal(sb.InvSheet.getSnapshot().open, false);
  assert.equal(btn.focused, 1, 'el foco vuelve al ítem');

  // Fuera del módulo no abre nada.
  D.docL.click.forEach((f) => f({ target: { getAttribute: (k) => (k === 'data-inv-item' ? '19721' : null), parentNode: null } }));
  assert.equal(sb.InvSheet.getSnapshot().open, false);

  // El botón Cerrar y el fondo también cierran.
  D.docL.click.forEach((f) => f({ target: btn }));
  assert.equal(sb.InvSheet.getSnapshot().bags, 'done', 'al volver a abrir no relee las bolsas');
  await flush();
  back.listeners.click.forEach((f) => f({ target: { getAttribute: (k) => (k === 'data-ish-close' ? '1' : null), parentNode: box } }));
  assert.equal(sb.InvSheet.getSnapshot().open, false);
  D.docL.click.forEach((f) => f({ target: btn }));
  await flush();
  back.listeners.click.forEach((f) => f({ target: back }));
  assert.equal(sb.InvSheet.getSnapshot().open, false);
  assert.equal(calls.filter((c) => c[0] === 'fetch' && c[1].includes('characters?ids=all')).length, 1, 'las bolsas se leen una vez');
});

test('humo: sin precio en el Bazar lo digo', async () => {
  const { D } = boot({ noPrice: true });
  await flush();
  D.docL.click.forEach((f) => f({ target: { getAttribute: (k) => (k === 'data-inv-item' ? '19721' : null), parentNode: D.els.ivRoot, focus() {} } }));
  await flush();
  assert.match(D.els.ishBox.innerHTML, /Sin precio en el Bazar ahora\./);
});
