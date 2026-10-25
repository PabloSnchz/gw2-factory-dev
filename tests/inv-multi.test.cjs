// Multicuenta como pestaña de Inventario y Personajes (BL-070, INV-3): js/inv-multi.js y el registro de
// pestañas de js/inv-view.js 1.1.0. Corre con: node --test tests/*.test.cjs
// Lógica pura con los sets reales, contraste en los 19 themes y una prueba de humo con un DOM mínimo:
// la pestaña abre primero (D6), cuenta todas las bolsas y las ranuras compartidas (D5), dice lo que no
// pudo leer, respeta las preferencias de siempre (inv_dashboard_*) y nunca guarda la Key.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/inv-multi.js');
const VIEW = read('js/inv-view.js');
const MODEL = read('js/inv-model.js');
const SETS = JSON.parse(read('assets/data/inventory-sets.json')).sets;
const CATS = JSON.parse(read('assets/data/inventory/material-categories.json')).categories;
const J = (x) => JSON.parse(JSON.stringify(x));

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'inv-model.js' });
  vm.runInContext(SRC, sb, { filename: 'inv-multi.js' });
  return sb.InvMulti._pure;
}
const P = pure();
const NOPREFS = () => P.readPrefs(() => null);

// Cuenta A: depósito, banco, ranuras compartidas y dos personajes. B: principal, sin permiso de personajes. C: no se pudo leer.
const ECTO = 19721, MONEDA = 19976, TOMO = 43766;
function accA() {
  const bank = Array(60).fill(null);
  bank[2] = { id: MONEDA, count: 10 }; bank[40] = { id: ECTO, count: 5 };
  return { label: 'Alt Uno', tag: 'alter', loaded: true, bagsPending: false, bank,
    materials: [{ id: ECTO, count: 100 }], shared: [{ id: MONEDA, count: 2 }, null],
    chars: [{ name: 'Lyra', bags: [{ inventory: [{ id: ECTO, count: 3 }, null] }] }, { name: 'Brann', bags: [null, { inventory: [{ id: MONEDA, count: 1 }] }] }] };
}
function accB() {
  return { label: 'Principal', tag: 'main', loaded: true, bagsPending: false, bank: [{ id: MONEDA, count: 50 }],
    materials: [{ id: ECTO, count: 7 }], shared: [], chars: null };
}
function accC() { return { label: 'Rota', tag: 'f2p', loaded: true, bagsPending: false, bank: null, materials: null, shared: null, chars: null }; }
const PRICES = { [ECTO]: { id: ECTO, sells: { unit_price: 2500 } }, [MONEDA]: { id: MONEDA, sells: { unit_price: 10000 } } };

test('el archivo entra en el presupuesto, va por el manifiesto después de inv-view y no tiene emojis', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'inv-multi.js pasa los 40 KB');
  assert.ok(Buffer.byteLength(VIEW) <= 40 * 1024, 'inv-view.js pasa los 40 KB');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u, 'sin emojis');
  const man = JSON.parse(read('js/modules.json')).modules;
  const src = man.map((m) => m.src);
  assert.ok(src.indexOf('js/inv-multi.js') > src.indexOf('js/inv-view.js') && src.indexOf('js/inv-view.js') >= 0, 'después de la vista');
  assert.ok(man.find((m) => m.src === 'js/inv-view.js').v >= '1.1.0', 'la vista con el registro de pestañas');
  assert.doesNotMatch(read('index.html'), /inv-multi\.js/, 'no se carga también desde index.html');
  // Desvío conocido (GW2Api congelado): solo estas dos lecturas van por fetch propio.
  const raw = SRC.match(/readJSON\('([^']+)'/g).map((s) => s.slice(10, -1)).sort();
  assert.deepEqual(raw, ['/v2/account/inventory', '/v2/characters?ids=all']);
  assert.match(SRC, /POOL = 3, TTL = 5 \* 60 \* 1000/, 'de a 3 cuentas y caché de 5 minutos');
});

test('preferencias de siempre: se leen las claves inv_dashboard_* con tolerancia', () => {
  const store = { inv_dashboard_active_set: 'crafting_materials', inv_dashboard_selected_items: [24357, 'x', -1],
    inv_dashboard_active_tiers: ['t5', 't9'], inv_dashboard_sort: { column: '24357', direction: 'asc' },
    inv_dashboard_hide_zero: { hideZeroRows: true, hideZeroColumns: false, hideMainAccounts: true } };
  const p = J(P.readPrefs((k) => store[k]));
  assert.deepEqual(p, { set: 'crafting_materials', items: [24357], tiers: ['t5'], sort: { column: 24357, direction: 'asc' }, hide: { rows: true, cols: false, main: true } });
  assert.deepEqual(J(NOPREFS()), { set: null, items: [], tiers: [], sort: null, hide: { rows: false, cols: false, main: false } });
  assert.equal(P.activeSet(SETS, NOPREFS()).id, 'high_value', 'sin set guardado abre Alto Valor');
});

test('sets: tiers, selección propia y lo que no es del set se ignora', () => {
  const p = NOPREFS();
  assert.equal(P.activeIds(SETS, p).length, 8, 'Alto Valor entero');
  p.set = 'crafting_materials';
  assert.deepEqual(J(P.tiersOf(P.activeSet(SETS, p), p)), ['t6'], 'tier 6 por defecto');
  assert.equal(P.activeIds(SETS, p)[0], 24357);
  p.tiers = ['t5'];
  assert.equal(P.activeIds(SETS, p)[0], 24356, 'con el tier 5 elegido');
  assert.equal(P.allItems(P.activeSet(SETS, p)).length, 32, 'el selector ofrece los 4 tiers');
  p.items = [24289, 24297];
  assert.deepEqual(J(P.activeIds(SETS, p)), [24289], 'el tótem viejo (24297, mal cargado antes) no entra');
  p.items = [99999999];
  assert.equal(P.activeIds(SETS, p)[0], 24356, 'una selección vacía vuelve a los del set');
});

test('tabla: suma depósito, banco, ranuras compartidas y todas las bolsas; lo que no se leyó es «sin datos», nunca 0', () => {
  const T = P.tableModel([accA(), accB(), accC()], [ECTO, MONEDA, TOMO], PRICES, NOPREFS());
  assert.deepEqual(J(T.rows.map((r) => r.cells)), [[108, 13, 0], [7, 50, 0], [null, null, null]]);
  assert.deepEqual(J(T.totals), [115, 63, 0]);
  assert.equal(T.rows[0].value, 108 * 2500 + 13 * 10000);
  assert.equal(T.value, 115 * 2500 + 63 * 10000);
  assert.equal(T.rows[2].value, null);
  assert.equal(P.rowNote(T.rows[0]), '');
  assert.equal(P.rowNote(T.rows[1]), 'sin bolsas de personajes: falta un permiso');
  assert.equal(P.rowNote(T.rows[2]), 'sin datos: revisá la API Key');
  const pend = Object.assign(accA(), { bagsPending: true });
  const T2 = P.tableModel([pend, Object.assign(accB(), { loaded: false })], [ECTO], PRICES, NOPREFS());
  assert.deepEqual(J(T2.rows.map((r) => r.cells)), [[105], [null]], 'mientras se leen las bolsas cuenta lo que ya llegó');
  assert.equal(P.rowNote(T2.rows[0]), 'leyendo bolsas…');
  assert.equal(P.rowNote(T2.rows[1]), 'leyendo…');
});

test('tabla: ocultar principales, filas y columnas en cero, y ordenar (sin datos siempre al final)', () => {
  const p = NOPREFS();
  p.hide = { rows: false, cols: true, main: true };
  let T = P.tableModel([accA(), accB(), accC()], [ECTO, MONEDA, TOMO], PRICES, p);
  assert.deepEqual(J(T.cols), [ECTO, MONEDA], 'el tomo en cero no se muestra');
  assert.deepEqual(T.rows.map((r) => r.a.label), ['Alt Uno', 'Rota'], 'sin la principal');
  assert.deepEqual(J(T.totals), [108, 13], 'el total es de lo que se ve');
  const zero = { label: 'Vacía', tag: 'alter', loaded: true, bagsPending: false, bank: [], materials: [], shared: [], chars: [] };
  p.hide = { rows: true, cols: false, main: false };
  T = P.tableModel([zero, accA(), accC()], [ECTO], PRICES, p);
  assert.deepEqual(T.rows.map((r) => r.a.label), ['Alt Uno', 'Rota'], 'la cuenta en cero se oculta; la que no se leyó, no');
  p.hide = { rows: false, cols: false, main: false };
  p.sort = { column: MONEDA, direction: 'desc' };
  T = P.tableModel([accC(), accA(), accB()], [ECTO, MONEDA], PRICES, p);
  assert.deepEqual(T.rows.map((r) => r.a.label), ['Principal', 'Alt Uno', 'Rota']);
  assert.equal(T.sortCol, MONEDA);
  p.sort.direction = 'asc';
  T = P.tableModel([accC(), accA(), accB()], [ECTO, MONEDA], PRICES, p);
  assert.deepEqual(T.rows.map((r) => r.a.label), ['Alt Uno', 'Principal', 'Rota']);
});

test('dónde está: depósito, banco con su pestaña, ranuras compartidas y cada personaje', () => {
  const idx = P.accIndex(accA());
  assert.equal(P.whereText(idx, ECTO, 'Pegote de ectoplasma', 'Alt Uno'), 'Pegote de ectoplasma en Alt Uno: 108 — Depósito 100 · Banco, pestaña 2 5 · Lyra 3.');
  assert.equal(P.whereText(idx, MONEDA, 'Moneda mística', 'Alt Uno'), 'Moneda mística en Alt Uno: 13 — Banco, pestaña 1 10 · Ranuras compartidas 2 · Brann 1.');
  assert.equal(P.whereText(idx, TOMO, 'Tomo', 'Alt Uno'), 'Tomo en Alt Uno: no tenés.');
  assert.equal(P.coins(1234567), '123 o 45 p');
  assert.equal(P.coins(4512), '45 p 12 c');
  assert.equal(P.coins(0), '0 c');
  assert.equal(P.fmtInt(1234567), '1.234.567');
});

test('vista: sets como botones con estado, encabezados que ordenan con aria-sort, números que abren el detalle', () => {
  const p = NOPREFS();
  p.sort = { column: ECTO, direction: 'desc' };
  const s = { sets: SETS, accounts: [accA(), accB(), accC()], meta: { [ECTO]: { name: 'Pegote de ectoplasma', icon: 'https://render.guildwars2.com/e.png' } },
    prices: PRICES, prefs: p, where: { i: 0, id: ECTO }, at: '01:40', hasKeys: true, loading: false };
  const h = P.html(s);
  assert.match(h, /id="imSet-high_value" data-im-set="high_value" aria-pressed="true"/);
  assert.match(h, /id="imSet-symbols_etc" data-im-set="symbols_etc" aria-pressed="false"/);
  assert.match(h, /<th scope="col" aria-sort="descending"><button type="button" class="im-sort" id="imSort-19721"/);
  assert.match(h, /data-im-cell="0:19721" aria-label="Alt Uno, Pegote de ectoplasma: 108\. Ver dónde está">108<\/button>/);
  assert.match(h, /<span aria-label="sin datos">—<\/span>/);
  assert.match(h, /<tr class="im-tot"><th scope="row">Total<\/th><td>63<\/td><td>115<\/td>/);
  assert.match(h, /role="status">Leí 3 de 3 cuentas a las 01:40\./);
  assert.match(h, /Pegote de ectoplasma en Alt Uno: 108 — Depósito 100/);
  // INV-7b: el nombre abre la ficha (inv-sheet escucha data-inv-item); el número sigue abriendo el detalle
  assert.match(h, /<li><button type="button" class="iv-open" data-inv-item="19721" aria-haspopup="dialog"><img[^>]*><span><small>Pegote de ectoplasma<\/small><b>[\d.]+<\/b>/);
  assert.match(h, /<span class="iv-sr">\. Ver la ficha<\/span><\/span><\/button><\/li>/);
  assert.match(h, /id="imWhereSheet" data-inv-item="19721" aria-haspopup="dialog">Ver la ficha<\/button>/);
  assert.doesNotMatch(h, /class="im-n[^"]*"[^>]*data-inv-item/, 'el número no abre la ficha');
  assert.doesNotMatch(h, /class="im-sort"[^>]*data-inv-item/, 'el encabezado sigue ordenando');
  assert.match(h, /<span class="iv-sr">, cuenta principal<\/span>/);
  assert.match(h, /assets\/icons\/Cuentas\/547827\.png/);
  assert.match(h, /Ocultar cuentas principales/);
  assert.doesNotMatch(h, /data-im-tier/, 'Alto Valor no tiene tiers');
  p.set = 'crafting_materials';
  assert.match(P.html(s), /id="imTier-t6" data-im-tier="t6" checked> Tier 6/);
  assert.match(P.html(Object.assign({}, s, { hasKeys: false })), /Todavía no hay cuentas cargadas/);
  assert.match(P.html(Object.assign({}, s, { sets: null })), /Cargando los sets/);
});

test('CSS: 44 px en el celular, primera columna fija, foco visible y solo el texto del theme', () => {
  assert.match(P.CSS, /@media \(max-width:900px\)\{[^}]*min-height:44px/);
  assert.match(P.CSS, /th\[scope=row\]\{position:sticky;left:0/);
  assert.match(P.CSS, /focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.doesNotMatch(P.CSS, /(^|[;{])\s*color:var\(--(acc-1|iv-mod|gn-mod)\)/m);
});

test('en los 19 themes cada texto del Multicuenta llega a 4.5:1 sobre las superficies donde se pinta', () => {
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
    [...keys].forEach((k) => [['bg-0', bg0], ['bandeja', tray], ['tarjeta', card]].forEach(([n, s]) => {
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

const KEYS = [{ value: 'KEY-A-SECRETA', label: 'Alt Uno', tag: 'alter' }, { value: 'KEY-B-SECRETA', label: 'Principal', tag: 'main' }];

function boot(opts) {
  const D = fakeDom();
  const store = Object.assign({ 'gn:account:keys': JSON.stringify(KEYS) }, opts.store || {});
  const calls = [];
  const a = accA(), b = accB();
  const api = (u) => {
    const tk = decodeURIComponent(u.split('access_token=')[1]);
    if (u.includes('/v2/account/inventory')) return tk === 'KEY-A-SECRETA' ? a.shared : b.shared;
    if (u.includes('/v2/characters?ids=all')) return tk === 'KEY-A-SECRETA' ? a.chars.map((c) => Object.assign({ level: 80, equipment: [] }, c)) : null;
    return null;
  };
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), clearTimeout() {},
    location: { hash: opts.hash || '#/account/characters' }, addEventListener() {},
    fetch: (u) => {
      calls.push(['fetch', u.replace(/access_token=[^&]+/, 'access_token=…')]);
      if (u === 'assets/data/inventory-sets.json') return Promise.resolve({ ok: true, json: () => Promise.resolve({ sets: J(SETS) }) });
      if (u.indexOf('assets/') === 0) return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: J(CATS) }) });
      const v = api(u);
      return Promise.resolve(v ? { ok: true, status: 200, json: () => Promise.resolve(J(v)) } : { ok: false, status: 403, json: () => Promise.resolve({}) });
    },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected', ACCOUNT_KEYS: 'gn:account:keys' },
      get: (k) => (k in store ? JSON.parse(store[k]) : (k === 'gn:account:selected' ? 'KEY-A-SECRETA' : null)),
      set: (k, v) => { store[k] = JSON.stringify(v); } },
    GW2Api: {
      getAccountBank: (t, o) => { calls.push(['bank', t === 'KEY-A-SECRETA' ? 'A' : 'B', o.nocache]); return Promise.resolve(J(t === 'KEY-A-SECRETA' ? a.bank : b.bank)); },
      getAccountMaterials: (t, o) => { calls.push(['materials', t === 'KEY-A-SECRETA' ? 'A' : 'B', o.nocache]); return Promise.resolve(J(t === 'KEY-A-SECRETA' ? a.materials : b.materials)); },
      getAccountLegendaryArmory: () => Promise.resolve([]),
      getCharacterCount: () => Promise.resolve(2),
      getItemsMany: (ids) => Promise.resolve(ids.map((id) => ({ id, name: id === ECTO ? 'Pegote de ectoplasma' : 'Ítem ' + id, icon: 'https://render.guildwars2.com/' + id + '.png' }))),
      getCommercePrices: (ids) => { calls.push(['prices', ids.length]); return Promise.resolve(ids.filter((id) => PRICES[id]).map((id) => J(PRICES[id]))); },
    },
    Shiruvana: { voice: (m) => ({ id: null, text: m.text, children: [] }) },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'inv-model.js' });
  vm.runInContext(VIEW, sb, { filename: 'inv-view.js' });
  vm.runInContext(SRC, sb, { filename: 'inv-multi.js' });
  return { sb, D, store, calls };
}
const flush = () => new Promise((r) => setTimeout(r, 30));
const list = (D) => (D.els.ivList ? D.els.ivList.innerHTML : '');

test('humo: la primera vez abre en Multicuenta, lee todas las cuentas con sus bolsas y nunca guarda la Key', async () => {
  const { sb, D, store, calls } = boot({});
  await flush();
  const host = D.els.ivRoot;
  assert.match(host.innerHTML, /id="ivTab-multi"[^>]*aria-selected="true"/, 'D6: la primera vez, Multicuenta');
  assert.ok(host.innerHTML.indexOf('ivTab-multi') < host.innerHTML.indexOf('ivTab-mat'), 'Multicuenta es la primera pestaña');
  assert.doesNotMatch(host.innerHTML, /data-iv="multi"/, 'sin el botón que llevaba a la pantalla vieja');
  const h = list(D);
  assert.match(h, /data-im-cell="0:19721"[^>]*>108<\/button>/, 'Alt Uno: depósito 100 + banco 5 + Lyra 3');
  assert.match(h, /data-im-cell="1:19976"[^>]*>50<\/button>/);
  assert.match(h, /sin bolsas de personajes: falta un permiso/, 'la principal sin permiso de personajes lo dice');
  assert.match(h, /Leí 2 de 2 cuentas/);
  assert.ok(calls.some((c) => c[0] === 'fetch' && c[1] === 'https://api.guildwars2.com/v2/characters?ids=all&access_token=…'));
  assert.ok(calls.some((c) => c[0] === 'fetch' && c[1] === 'https://api.guildwars2.com/v2/account/inventory?access_token=…'));
  assert.ok(calls.filter((c) => c[0] === 'bank').every((c) => c[2] === false), 'la primera carga usa la caché');
  assert.ok(!Object.keys(store).filter((k) => k !== 'gn:account:keys').some((k) => store[k].includes('SECRETA')), 'la Key nunca se guarda');
  assert.ok(!JSON.stringify(J(sb.InvMulti.getSnapshot().accounts.map((x) => x.label))).includes('SECRETA'));

  const ev = (type, attrs, extra) => {
    const target = Object.assign({ getAttribute: (k) => (k in attrs ? attrs[k] : null), parentNode: null }, extra || {});
    (host.listeners[type] || []).forEach((f) => f({ type, target }));
  };
  ev('click', { 'data-im-cell': '0:19721' });
  assert.match(list(D), /Pegote de ectoplasma en Alt Uno: 108 — Depósito 100 · Banco, pestaña 2 5 · Lyra 3\./);
  ev('click', { 'data-im-sort': '19976' });
  assert.deepEqual(JSON.parse(store.inv_dashboard_sort), { column: 19976, direction: 'desc' });
  ev('change', { 'data-im-hide': 'main' }, { checked: true });
  assert.equal(JSON.parse(store.inv_dashboard_hide_zero).hideMainAccounts, true);
  assert.doesNotMatch(list(D), /data-im-cell="1:/, 'sin la cuenta principal');
  ev('click', { 'data-im-set': 'crafting_materials' });
  assert.equal(JSON.parse(store.inv_dashboard_active_set), 'crafting_materials');
  assert.deepEqual(JSON.parse(store.inv_dashboard_selected_items), [], 'cambiar de set limpia la selección');
  ev('change', { 'data-im-tier': 't6' }, { checked: false });
  assert.deepEqual(JSON.parse(store.inv_dashboard_active_tiers), ['t6'], 'al menos un tier');
  ev('change', { 'data-im-tier': 't4' }, { checked: true });
  assert.deepEqual(JSON.parse(store.inv_dashboard_active_tiers), ['t6', 't4']);
  ev('change', { 'data-im-item': '24357' }, { checked: false });
  assert.equal(JSON.parse(store.inv_dashboard_selected_items).length, 15, 'saca uno de los 16 del tier 6 y 4');

  calls.length = 0;
  ev('click', { 'data-iv': 'refresh' });
  await flush();
  assert.ok(calls.filter((c) => c[0] === 'bank').length === 3 && calls.filter((c) => c[0] === 'bank' && c[1] === 'A').every((c) => c[2] === true),
    'Actualizar relee la cuenta activa y todas las del Multicuenta sin caché');

  ev('click', { 'data-iv-tab': 'bank' });
  assert.equal(JSON.parse(store['gn:inventory:tab']), 'bank', 'después recuerda la última');
  assert.equal(sb.InvView.register({ id: 'otra', label: 'Otra', order: 2, html: () => '' }), true);
  assert.equal(sb.InvView.register({ id: 'otra', label: 'Otra', html: () => '' }), false, 'no se registra dos veces');
  assert.equal(sb.InvView.getSnapshot().ui.tab, 'bank', 'una pestaña que llega tarde no te saca de la que elegiste');
});

test('humo: con una pestaña guardada abre esa; una cuenta que no se lee dice «sin datos»', async () => {
  const a = boot({ store: { 'gn:inventory:tab': JSON.stringify('armory') } });
  await flush();
  assert.match(a.D.els.ivRoot.innerHTML, /id="ivTab-armory"[^>]*aria-selected="true"/);
  const keys = KEYS.concat([{ value: 'KEY-C', label: 'Rota', tag: 'f2p' }]);
  const b = boot({ store: { 'gn:account:keys': JSON.stringify(keys) } });
  b.sb.GW2Api.getAccountBank = (t) => (t === 'KEY-C' ? Promise.reject(new Error('401')) : Promise.resolve([]));
  b.sb.GW2Api.getAccountMaterials = (t) => (t === 'KEY-C' ? Promise.reject(new Error('401')) : Promise.resolve([]));
  b.sb.InvMulti.refresh(true);
  await flush();
  assert.match(list(b.D), /Rota<span class="iv-sr">, cuenta gratuita<\/span><small>sin datos: revisá la API Key<\/small>/);
});
