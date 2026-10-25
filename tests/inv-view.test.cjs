// Inventario y Personajes renovado (BL-070, INV-2): js/inv-view.js. Corre con: node --test tests/*.test.cjs
// Lógica pura con las categorías reales y una prueba de humo con un DOM mínimo: la ruta #/account/characters,
// la API simulada, las pestañas, el filtro, lo que no se pudo leer y la pestaña recordada.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/inv-view.js');
const MODEL = read('js/inv-model.js');
const CATS = JSON.parse(read('assets/data/inventory/material-categories.json')).categories;

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'inv-model.js' });
  vm.runInContext(SRC, sb, { filename: 'inv-view.js' });
  return sb.InvView._pure;
}
const P = pure();

const ITEMS = {
  19721: { name: 'Pegote de ectoplasma', icon: 'https://render.guildwars2.com/file/ecto.png', rarity: 'Exotic', type: 'CraftingMaterial' },
  19697: { name: 'Mineral de cobre', icon: 'https://render.guildwars2.com/file/cobre.png', rarity: 'Basic', type: 'CraftingMaterial' },
  19976: { name: 'Moneda mística', icon: 'https://render.guildwars2.com/file/moneda.png', rarity: 'Rare', type: 'Trophy' },
  30684: { name: 'Aurora', icon: 'https://render.guildwars2.com/file/aurora.png', rarity: 'Legendary', type: 'Trinket' },
  30704: { name: 'Crepúsculo', icon: 'https://render.guildwars2.com/file/crep.png', rarity: 'Legendary', type: 'Weapon' },
};
function sample(extra) {
  const bank = Array(60).fill(null);
  bank[0] = { id: 19976, count: 77 }; bank[31] = { id: 19721, count: 250 };
  return Object.assign({
    loaded: true, hasToken: true, items: ITEMS, unread: [], chars: 12,
    bank,
    materials: [{ id: 19697, category: 6, count: 1250 }, { id: 19721, category: 37, count: 1200 }, { id: 19698, category: 6, count: 0 }],
    armory: [{ id: 30704, count: 1 }, { id: 30684, count: 2 }],
  }, extra || {});
}

test('el archivo entra en el presupuesto, va por el manifiesto después del modelo y del marco común, sin emojis ni colores de rareza como texto', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'inv-view.js pasa los 40 KB');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u, 'sin emojis');
  assert.doesNotMatch(SRC, /\bfetch\(['"]https:\/\/api\.guildwars2/, 'datos por GW2Api, nunca fetch crudo a la API');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.includes('js/inv-view.js') && man.includes('js/inv-model.js'));
  assert.ok(man.indexOf('js/inv-view.js') > man.indexOf('js/inv-model.js'), 'después del modelo');
  assert.ok(man.indexOf('js/inv-view.js') > man.indexOf('js/gn-frame.js'), 'después del marco común');
  assert.doesNotMatch(read('index.html'), /inv-view\.js|inv-model\.js/, 'no se cargan también desde index.html');
  const css = P.CSS;
  Object.values(P.RARITY).forEach((r) => assert.ok(!new RegExp('color:' + r[1]).test(css), 'la rareza no es color de letra: ' + r[0]));
});

test('modelo: banco, materiales por categoría real, armería y personajes leídos de la cuenta', () => {
  const m = P.buildModel(sample(), CATS, {});
  assert.equal(m.tab, 'mat', 'sin pestaña guardada abre Materiales');
  assert.deepEqual(JSON.parse(JSON.stringify(m.bank)), { used: 2, total: 60, free: 58, tabs: 2 });
  assert.equal(m.matHeld, 2, 'el cobre (básicos) y el ectoplasma (avanzados); lo que está en 0 no cuenta');
  assert.equal(m.matGroups[0].name, 'Materiales de artesanía básicos');
  assert.equal(m.armory.length, 2);
  assert.equal(m.chars, 12);
  assert.equal(m.voice, null, 'con el banco holgado no digo nada');
  assert.equal(P.buildModel(sample(), CATS, { tab: 'bank' }).tab, 'bank');
  assert.equal(P.buildModel(sample(), CATS, { tab: 'cualquiera' }).tab, 'mat');
  assert.equal(P.buildModel(sample(), CATS, { cat: '999' }).cat, 'all', 'una categoría que no está vuelve a «Todas»');
});

test('mi línea: solo cuando el banco está por llenarse, con los números reales', () => {
  const full = Array(30).fill({ id: 19976, count: 1 });
  assert.equal(P.buildModel(sample({ bank: full }), CATS, {}).voice.text, 'Tu banco está lleno: 30 de 30 espacios ocupados.');
  const tight = full.slice(); tight[3] = null; tight[7] = null;
  assert.equal(P.buildModel(sample({ bank: tight }), CATS, {}).voice.text, 'Te quedan 2 espacios libres en el banco, de 30.');
  const one = full.slice(); one[0] = null;
  assert.equal(P.buildModel(sample({ bank: one }), CATS, {}).voice.text, 'Te queda 1 espacio libre en el banco, de 30.');
  assert.equal(P.buildModel(sample({ bank: full, loaded: false }), CATS, {}).voice, null);
  assert.equal(P.buildModel(sample({ bank: null }), CATS, {}).voice, null);
});

test('estados honestos: lo que no se leyó dice «Sin datos» y se nombra, nunca 0', () => {
  const d = sample({ bank: null, chars: null, unread: ['bank', 'chars'] });
  const m = P.buildModel(d, CATS, { tab: 'bank' });
  const h = P.viewHTML(m);
  assert.match(h, /role="status">No pude leer el banco y tus personajes\. Revisá que la API Key tenga permiso de inventarios\./);
  assert.match(h, /Sin datos de tu banco\./);
  assert.ok((h.match(/sin datos<\/em>/g) || []).length === 2, 'banco y personajes sin datos');
  assert.doesNotMatch(h, /<b>0 <span>de/);
  assert.match(P.subtitle(P.buildModel({ hasToken: false, loaded: true }, CATS, {})), /Cargá tu API Key/);
  assert.equal(P.errorText(P.buildModel(sample(), CATS, {})), '');
});

test('vista: pestañas accesibles, íconos oficiales con la rareza en texto, banco por pestaña de 30', () => {
  const mat = P.viewHTML(P.buildModel(sample(), CATS, {}));
  assert.match(mat, /role="tablist" aria-label="Secciones del inventario"/);
  assert.match(mat, /id="ivTab-mat"[^>]*aria-selected="true"[^>]*aria-controls="ivPanel" tabindex="0"/);
  assert.match(mat, /id="ivTab-bank"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(mat, /id="ivPanel" role="tabpanel" aria-labelledby="ivTab-mat"/);
  assert.match(mat, /<h3 id="ivC-6">Materiales de artesanía básicos<\/h3><small>1 de 2 con algo guardado/);
  assert.match(mat, /render\.guildwars2\.com\/file\/ecto\.png/);
  assert.match(mat, /Pegote de ectoplasma<span class="iv-sr">, Exótico<\/span>/);
  assert.match(mat, /<option value="37">Materiales de artesanía avanzados<\/option>/);
  assert.match(mat, /data-iv="multi"/);
  assert.match(mat, /data-iv="chars"/);
  const bank = P.viewHTML(P.buildModel(sample(), CATS, { tab: 'bank' }));
  assert.match(bank, /<h3 id="ivB-1">Pestaña 1<\/h3><small>1 de 30 ocupados/);
  assert.match(bank, /<h3 id="ivB-2">Pestaña 2<\/h3><small>1 de 30 ocupados/);
  assert.equal((bank.match(/iv-slot--empty/g) || []).length, 58);
  assert.match(bank, /<span class="iv-sr">Moneda mística, 77, Raro<\/span>/);
  const arm = P.viewHTML(P.buildModel(sample(), CATS, { tab: 'armory' }));
  assert.ok(arm.indexOf('>Armas<') < arm.indexOf('>Abalorios<'), 'armas antes que abalorios');
  assert.match(arm, /Aurora<span class="iv-sr">, Legendario/);
});

test('filtro por nombre: sin tildes ni mayúsculas; en el banco dice en qué pestaña está', () => {
  const m = P.buildModel(sample(), CATS, { q: 'ECTO' });
  const h = P.listHTML(m);
  assert.match(h, /Pegote de ectoplasma/);
  assert.doesNotMatch(h, /Mineral de cobre/);
  assert.match(P.listHTML(P.buildModel(sample(), CATS, { q: 'mistica', tab: 'bank' })), /Moneda mística<span class="iv-sr">, Raro<\/span><small>Pestaña 1<\/small>/);
  assert.match(P.listHTML(P.buildModel(sample(), CATS, { q: 'nada', tab: 'armory' })), /Ninguna legendaria coincide con «nada»/);
  assert.match(P.listHTML(P.buildModel(sample(), CATS, { cat: '37' })), /Pegote/);
  assert.doesNotMatch(P.listHTML(P.buildModel(sample(), CATS, { cat: '37' })), /Mineral de cobre/);
});

test('CSS: solo oculta lo viejo con la vista activa; foco visible, movimiento reducido y 44 px en el celular', () => {
  assert.match(P.CSS, /#inventoryPanel\.iv-on>\.panel__title,#inventoryPanel\.iv-on>\.panel__body\{display:none!important\}/);
  assert.match(P.CSS, /prefers-reduced-motion:reduce/);
  assert.match(P.CSS, /@media \(max-width:900px\)[\s\S]*min-height:44px/);
  assert.match(P.CSS, /focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.doesNotMatch(P.CSS, /(^|[;{])\s*color:var\(--(acc-1|iv-mod|gn-mod)\)/m, 'ni el acento ni el color del módulo como texto');
});

// ------------------------------------------------------------------ contraste en los 19 themes
test('en los 19 themes cada texto de la vista llega a 4.5:1 sobre las superficies donde se pinta', () => {
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
    const bg0 = G.over(G.parse(t['--bg-0']), [255, 255, 255, 1]);
    const hero = G.over([0x7E, 0xC3, 0xFF, 0.12], tray);
    [...keys].forEach((k) => [['bg-0', bg0], ['bandeja', tray], ['tarjeta', card], ['cabecera', hero]].forEach(([n, s]) => {
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
  const docListeners = {};
  // El DOM mínimo no parsea innerHTML: #ivVoice e #ivList existen si la vista los dibujó.
  const drawn = (id) => els.ivRoot && els.ivRoot.innerHTML.includes('id="' + id + '"');
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null,
    getElementById: (id) => els[id] || ((id === 'ivVoice' || id === 'ivList') && drawn(id) ? el(id) : null),
    createElement: (t) => { const n = el(null, t); Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } }); return n; },
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); },
  };
  return { els, panel, document, docListeners };
}

function boot(opts) {
  const D = fakeDom();
  const store = Object.assign({}, opts.store || {});
  const calls = [];
  const s = sample();
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(),
    location: { hash: opts.hash },
    addEventListener() {},
    fetch: (u) => { calls.push(['fetch', u]); return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: JSON.parse(JSON.stringify(CATS)) }) }); },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected' },
      get: (k) => (k in store ? JSON.parse(store[k]) : (k === 'gn:account:selected' ? opts.token || null : null)),
      set: (k, v) => { store[k] = typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v); } },
    GW2Api: {
      getAccountBank: (t, o) => { calls.push(['bank', o.nocache]); return opts.bankFail ? Promise.reject(new Error('403')) : Promise.resolve(s.bank); },
      getAccountMaterials: (t, o) => { calls.push(['materials', o.nocache]); return Promise.resolve(s.materials); },
      getAccountLegendaryArmory: (t, o) => { calls.push(['armory', o.nocache]); return Promise.resolve(s.armory); },
      getCharacterCount: (t, o) => { calls.push(['chars', o.nocache]); return Promise.resolve(12); },
      getItemsMany: (ids) => { calls.push(['items', ids.slice().sort()]); return Promise.resolve(ids.map((id) => Object.assign({ id }, ITEMS[id] || { name: 'Ítem raro' }))); },
    },
    Characters: { activate() { calls.push(['charsScreen']); } },
    Shiruvana: { voice: (m) => ({ id: null, text: m.text, children: [] }) },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'inv-model.js' });
  vm.runInContext(SRC, sb, { filename: 'inv-view.js' });
  return { sb, D, store, calls };
}

const flush = () => new Promise((r) => setTimeout(r, 20));

test('humo: en #/account/characters toma el panel, lee la cuenta y muestra la vista nueva', async () => {
  const { sb, D, store, calls } = boot({ hash: '#/account/characters', token: 'TOKEN-DE-PRUEBA' });
  await flush();
  const host = D.els.ivRoot;
  assert.ok(host, 'crea #ivRoot dentro del panel');
  assert.ok(D.panel.classList.contains('iv-on'));
  assert.equal(D.panel.getAttribute('aria-labelledby'), 'ivTitle');
  assert.match(host.innerHTML, /Tu banco, tu depósito de materiales y tu armería legendaria\./);
  assert.match(host.innerHTML, /<b>12<\/b><em>en tu cuenta<\/em>/, 'los personajes se leen de la cuenta, no de otra pantalla');
  assert.match(host.innerHTML, /Pegote de ectoplasma/, 'con los nombres de /v2/items');
  assert.deepEqual(calls.filter((c) => ['bank', 'materials', 'armory', 'chars'].includes(c[0])).map((c) => c[0]).sort(), ['armory', 'bank', 'chars', 'materials']);
  assert.ok(calls.filter((c) => c[0] !== 'fetch' && c[0] !== 'items').every((c) => c[1] === false), 'la primera carga usa la caché');
  assert.deepEqual(JSON.parse(JSON.stringify(calls.find((c) => c[0] === 'items')[1])), [19697, 19721, 19976, 30684, 30704], 'solo los ítems que tenés; lo que está en 0 no se pide');
  assert.ok(calls.some((c) => c[0] === 'fetch' && c[1] === 'assets/data/inventory/material-categories.json'));

  const click = (attrs) => host.listeners.click[0]({ target: { getAttribute: (k) => attrs[k] || null, parentNode: null } });
  click({ 'data-iv-tab': 'bank' });
  assert.match(host.innerHTML, /id="ivTab-bank"[^>]*aria-selected="true"/);
  assert.equal(store['gn:inventory:tab'], '"bank"', 'recuerda la pestaña');
  assert.ok(!Object.keys(store).some((k) => store[k].includes('TOKEN-DE-PRUEBA')), 'la Key nunca se guarda');

  // flechas entre pestañas
  host.listeners.keydown[0]({ key: 'ArrowRight', target: { getAttribute: (k) => (k === 'data-iv-tab' ? 'bank' : null), parentNode: null }, preventDefault() {} });
  assert.equal(sb.InvView.getSnapshot().ui.tab, 'armory');
  host.listeners.keydown[0]({ key: 'Home', target: { getAttribute: (k) => (k === 'data-iv-tab' ? 'armory' : null), parentNode: null }, preventDefault() {} });
  assert.equal(sb.InvView.getSnapshot().ui.tab, 'mat');

  // filtrar solo redibuja la lista
  host.listeners.input[0]({ target: { id: 'ivQ', value: 'cobre' } });
  assert.equal(sb.InvView.getSnapshot().ui.q, 'cobre');

  // Personajes y Multicuenta abren su pantalla de siempre
  click({ 'data-iv': 'chars' });
  assert.ok(calls.some((c) => c[0] === 'charsScreen'));
  assert.equal(D.panel.getAttribute('hidden'), '');
  click({ 'data-iv': 'multi' });
  assert.equal(sb.location.hash, '#/inventory/dashboard');

  // Actualizar pide sin caché
  calls.length = 0;
  click({ 'data-iv': 'refresh' });
  await flush();
  assert.ok(calls.filter((c) => ['bank', 'materials', 'armory', 'chars'].includes(c[0])).every((c) => c[1] === true));
});

test('humo: la pestaña guardada se respeta; si el banco falla, lo demás se ve y el error se dice', async () => {
  const { D } = boot({ hash: '#/account/characters', token: 'T', bankFail: true, store: { 'gn:inventory:tab': '"armory"' } });
  await flush();
  const h = D.els.ivRoot.innerHTML;
  assert.match(h, /id="ivTab-armory"[^>]*aria-selected="true"/);
  assert.match(h, /No pude leer el banco\. Revisá que la API Key tenga permiso de inventarios\./);
  assert.match(h, /Aurora/);
});

test('humo: sin Key no pide nada y lo dice; fuera de su ruta no dibuja', async () => {
  const a = boot({ hash: '#/account/characters', token: null });
  await flush();
  assert.match(a.D.els.ivRoot.innerHTML, /Cargá tu API Key/);
  assert.equal(a.calls.filter((c) => c[0] !== 'fetch').length, 0, 'sin Key no hay pedidos a la API');
  const b = boot({ hash: '#/account/raids', token: 'T' });
  await flush();
  assert.equal(b.D.els.ivRoot, undefined);
});
