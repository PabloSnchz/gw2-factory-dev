// Personajes en Inventario y Personajes (BL-070, INV-5): js/inv-chars.js, los datos verificados de
// assets/data/inventory/professions.json y las pestañas de después de js/inv-view.js 1.3.0.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/inv-chars.js');
const VIEW = read('js/inv-view.js');
const MULTI = read('js/inv-multi.js');
const SEARCH = read('js/inv-search.js');
const MODEL = read('js/inv-model.js');
const DATA = JSON.parse(read('assets/data/inventory/professions.json'));
const SETS = JSON.parse(read('assets/data/inventory-sets.json')).sets;
const CATS = JSON.parse(read('assets/data/inventory/material-categories.json')).categories;
const J = (x) => JSON.parse(JSON.stringify(x));

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'inv-chars.js' });
  return sb.InvChars._pure;
}
const P = pure();
const NOW = new Date(Date.UTC(2026, 9, 25, 12, 0, 0));

const LYRA = { name: 'Lyra', race: 'Human', gender: 'Female', profession: 'Guardian', level: 80, age: 3600 * 1234 + 59, deaths: 12,
  created: '2014-10-25T08:00:00Z', crafting: [{ discipline: 'Weaponsmith', rating: 500, active: false }, { discipline: 'Jeweler', rating: 400, active: true }],
  specializations: { pve: [{ id: 42 }, { id: 16 }, { id: 27 }], pvp: [], wvw: [] },
  bags: [{ inventory: [{ id: 19721, count: 4 }, null, { id: 19721, count: 2 }, { id: 46731, count: 1 }] }, null] };
const BRANN = { name: 'Brann', race: 'Norn', gender: 'Male', profession: 'Warrior', level: 42, age: 1800, created: '2026-03-01T00:00:00Z',
  crafting: [], build_tabs: [{ is_active: false, build: { specializations: [{ id: 4 }, { id: 11 }, { id: 18 }] } }, { is_active: true, build: { specializations: [{ id: 4 }, { id: 11 }, { id: 22 }] } }],
  bags: [] };
const ZOE = { name: 'Zoé', race: 'Asura', gender: 'Female', profession: 'Mesmer', level: 80, age: 3600 * 10, created: '2020-11-03T00:00:00Z',
  crafting: [{ discipline: 'Tailor', rating: 500, active: true }], specializations: { pve: [{ id: 1 }, { id: 2 }, { id: 40 }] }, bags: [] };

test('datos verificados: las 9 profesiones y las 36 élites en español con su ícono oficial, razas y los 9 oficios', () => {
  assert.equal(Object.keys(DATA.professions).length, 9);
  assert.equal(DATA.professions.Revenant.name, 'Retornado');
  assert.equal(DATA.professions.Mesmer.name, 'Hipnotizador');
  assert.equal(Object.keys(DATA.elites).length, 36);
  assert.deepEqual(J(DATA.elites['27']), { name: 'Cazadragones', profession: 'Guardian', icon: 'https://render.guildwars2.com/file/4161C630AA50667FDCBF01042D07021CE44451C9/1128573.png' });
  assert.equal(DATA.elites['81'].name, 'Luminaria');
  Object.values(DATA.elites).concat(Object.values(DATA.professions)).forEach((x) => assert.match(x.icon, /^https:\/\/render\.guildwars2\.com\/file\/[0-9A-F]{40}\/\d+\.png$/));
  Object.values(DATA.elites).forEach((x) => assert.ok(DATA.professions[x.profession], x.name));
  assert.equal(Object.keys(DATA.crafting).length, 9);
  assert.equal(DATA.crafting.Weaponsmith, 'Armero');
  assert.equal(DATA.crafting.Armorsmith, 'Forjador de armaduras');
  assert.deepEqual(Object.keys(DATA.races).sort(), ['Asura', 'Charr', 'Human', 'Norn', 'Sylvari']);
  assert.match(DATA.source, /RUN-047/);
});

test('el archivo entra en el presupuesto, va por el manifiesto después de Buscar y no pide la API por su cuenta', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u);
  assert.doesNotMatch(SRC, /api\.guildwars2\.com|localStorage|Storage\.set|map_id|poi/i, 'sin mapa ni punto de interés (D2) y sin guardar nada');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.indexOf('js/inv-chars.js') > man.indexOf('js/inv-search.js') && man.indexOf('js/inv-search.js') > 0);
  assert.doesNotMatch(read('index.html'), /inv-chars\.js/);
});

test('élite: la de la build de JcE (formato viejo) o la de la pestaña de build activa; nunca una de otra profesión', () => {
  assert.deepEqual(J(P.eliteOf(LYRA, DATA)), { id: 27, name: 'Cazadragones', icon: DATA.elites['27'].icon });
  assert.equal(P.eliteOf(BRANN, DATA), null, 'la pestaña activa no lleva élite (22 no es élite)');
  assert.equal(P.eliteOf(Object.assign({}, BRANN, { build_tabs: [{ is_active: true, build: { specializations: [{ id: 18 }] } }] }), DATA).name, 'Berserker');
  assert.equal(P.eliteOf(Object.assign({}, LYRA, { profession: 'Warrior' }), DATA), null);
  assert.equal(P.eliteOf({ profession: 'Guardian' }, DATA), null);
});

test('tiempo jugado, cumpleaños, oficios, raza y lo que lleva', () => {
  assert.equal(P.played(LYRA.age), '1.234 horas');
  assert.equal(P.played(3600), '1 hora');
  assert.equal(P.played(1800), 'menos de 1 hora');
  assert.equal(P.birthdayText(P.birthday(LYRA.created, NOW)), 'Hoy cumple 12 años.');
  assert.equal(P.birthdayText(P.birthday(ZOE.created, NOW)), 'Cumple 6 años el 03/11/2026 (en 9 días).');
  assert.equal(P.birthdayText(P.birthday('2025-10-26T10:00:00Z', NOW)), 'Cumple 1 año el 26/10/2026 (mañana).');
  assert.equal(P.birthdayText(P.birthday(BRANN.created, NOW)), 'Cumple 1 año el 01/03/2027 (en 127 días).', 'el primer cumpleaños todavía no llegó');
  assert.equal(P.birthday('no', NOW), null);
  assert.deepEqual(J(P.crafting(LYRA, DATA)), [{ name: 'Joyero', rating: 400, active: true }, { name: 'Armero', rating: 500, active: false }], 'los activos primero');
  assert.equal(P.raceText(LYRA, DATA), 'Humana');
  assert.equal(P.raceText(BRANN, DATA), 'Norn');
  assert.deepEqual(J(P.carried(LYRA)), [{ id: 19721, count: 6 }, { id: 46731, count: 1 }]);
});

test('modelo: resumen, filtro por profesión y por nombre sin tildes', () => {
  let m = P.model([LYRA, BRANN, ZOE], DATA, {}, NOW);
  assert.equal(P.summaryText(m), '3 personajes, 2 en nivel 80 y 1.244 horas jugadas entre todos. Hoy cumple años Lyra.');
  assert.deepEqual(J(m.profs), ['Guardian', 'Warrior', 'Mesmer'], 'por su nombre en español: Guardián, Guerrero, Hipnotizador');
  m = P.model([LYRA, BRANN, ZOE], DATA, { prof: 'Mesmer' }, NOW);
  assert.deepEqual(m.shown.map((c) => c.name), ['Zoé']);
  m = P.model([LYRA, BRANN, ZOE], DATA, { q: 'ZOE' }, NOW);
  assert.deepEqual(m.shown.map((c) => c.name), ['Zoé']);
  assert.equal(P.model([LYRA], DATA, { prof: 'Thief' }, NOW).prof, '', 'una profesión que no está vuelve a «Todas»');
});

test('vista: tarjeta con élite y profesión, oficios, cumpleaños, bolsas con aria-expanded; estados honestos', () => {
  const m = P.model([LYRA, BRANN], DATA, {}, NOW);
  const items = { 19721: { name: 'Pegote de ectoplasma', icon: 'https://render.guildwars2.com/e.png' } };
  let h = P.html({ hasToken: true, state: 'done', m, items, open: 'Lyra' });
  assert.match(h, /<h3>Lyra<\/h3><p>Nivel 80 · Cazadragones <span class="ic-prof">\(Guardián\)<\/span> · Humana<\/p>/);
  assert.match(h, /<h3>Brann<\/h3><p>Nivel 42 · Guerrero · Norn<\/p>/);
  assert.match(h, /<dd>1\.234 horas<\/dd>/);
  assert.match(h, /Hoy cumple 12 años\. <small>Creado el 25\/10\/2014\.<\/small>/);
  assert.match(h, /Joyero 400 · Armero 500 <small>\(inactivo\)<\/small>/);
  assert.match(h, /data-ic-bags="Lyra" aria-expanded="true">Qué lleva \(2 ítems\)<\/button><ul class="ic-items"><li><button type="button" class="iv-open" data-inv-item="19721" aria-haspopup="dialog"><img src="https:\/\/render\.guildwars2\.com\/e\.png"[^>]*><span>Pegote de ectoplasma<\/span><b>6<\/b>/);
  assert.match(h, /data-ic-bags="Brann" aria-expanded="false">Sus bolsas están vacías/);
  assert.match(h, /ya no muestro mapa ni punto de interés/);
  assert.match(P.html({ hasToken: true, state: 'loading' }), /Leyendo tus personajes…/);
  assert.match(P.html({ hasToken: true, state: 'error' }), /role="status">No pude leer tus personajes/);
  assert.match(P.html({ hasToken: false }), /Sin API Key/);
  assert.match(P.html({ hasToken: true, state: 'done', m: P.model([], DATA, {}, NOW) }), /todavía no tiene personajes/);
  h = P.toolsHTML(m, DATA, 'ly');
  assert.match(h, /id="icQ"[^>]*value="ly"/);
  assert.match(h, /<option value="Guardian">Guardián<\/option><option value="Warrior">Guerrero<\/option>/);
  assert.doesNotMatch(P.CSS, /(^|[;{])\s*color:var\(--(acc-1|iv-mod|gn-mod)\)/m);
  assert.match(P.CSS, /@media \(max-width:900px\)\{\.ic-bags\{min-height:44px\}/);
});

test('en los 19 themes cada texto de Personajes llega a 4.5:1 sobre las superficies donde se pinta', () => {
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
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2']);
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
    'gn:inventory:tab': JSON.stringify('chars') }, opts.store || {});
  const calls = [];
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), clearTimeout() {},
    location: { hash: '#/account/characters' }, addEventListener() {},
    fetch: (u) => {
      calls.push(['fetch', u.replace(/access_token=[^&]+/, 'access_token=…')]);
      if (u === 'assets/data/inventory-sets.json') return Promise.resolve({ ok: true, json: () => Promise.resolve({ sets: J(SETS) }) });
      if (u === 'assets/data/inventory/professions.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(J(DATA)) });
      if (u.indexOf('assets/') === 0) return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: J(CATS) }) });
      const v = opts.fail ? null : u.includes('/v2/characters?ids=all') ? [LYRA, BRANN, ZOE] : u.includes('/v2/account/inventory') ? [] : null;
      return Promise.resolve(v ? { ok: true, status: 200, json: () => Promise.resolve(J(v)) } : { ok: false, status: 403, json: () => Promise.resolve({}) });
    },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected', ACCOUNT_KEYS: 'gn:account:keys' },
      get: (k) => (k in store ? JSON.parse(store[k]) : (k === 'gn:account:selected' ? 'KEY-SECRETA' : null)),
      set: (k, v) => { store[k] = JSON.stringify(v); } },
    GW2Api: {
      getAccountBank: () => Promise.resolve([]), getAccountMaterials: () => Promise.resolve([]),
      getAccountLegendaryArmory: () => Promise.resolve([]), getCharacterCount: () => Promise.resolve(3),
      getItemsMany: (ids) => { calls.push(['items', ids.slice().sort((a, b) => a - b)]); return Promise.resolve(ids.map((id) => ({ id, name: id === 19721 ? 'Pegote de ectoplasma' : 'Ítem ' + id, icon: 'https://render.guildwars2.com/' + id + '.png' }))); },
      getCommercePrices: () => Promise.resolve([]),
    },
    Characters: { activate() { calls.push(['oldScreen']); } },
  };
  sb.window = sb;
  vm.createContext(sb);
  [['inv-model.js', MODEL], ['inv-view.js', VIEW], ['inv-multi.js', MULTI], ['inv-search.js', SEARCH], ['inv-chars.js', SRC]]
    .forEach(([f, s]) => vm.runInContext(s, sb, { filename: f }));
  return { sb, D, store, calls };
}
const flush = () => new Promise((r) => setTimeout(r, 30));
const list = (D) => (D.els.ivList ? D.els.ivList.innerHTML : D.els.ivRoot.innerHTML);
const apiCalls = (calls) => calls.filter((c) => c[0] === 'fetch' && c[1].indexOf('https://api.guildwars2.com') === 0).map((c) => c[1]);

test('humo: Personajes es la última pestaña, sin el botón a la pantalla vieja; lee los personajes una vez y abre sus bolsas', async () => {
  const { sb, D, store, calls } = boot({});
  await flush();
  const host = D.els.ivRoot;
  const tabs = (host.innerHTML.match(/id="ivTab-([a-z]+)"/g) || []).map((s) => s.slice(10, -1));
  assert.deepEqual(tabs, ['multi', 'search', 'mat', 'bank', 'armory', 'chars']);
  assert.match(host.innerHTML, /id="ivTab-chars"[^>]*aria-selected="true"/);
  assert.doesNotMatch(host.innerHTML, /data-iv="chars"/, 'sin el botón que abría la pantalla vieja');
  assert.doesNotMatch(host.innerHTML, /pantalla de siempre/);
  assert.deepEqual(apiCalls(calls), ['https://api.guildwars2.com/v2/characters?ids=all&access_token=…'], 'solo los personajes, sin ranuras compartidas');
  const h = list(D);
  assert.match(h, /3 personajes, 2 en nivel 80/);
  assert.match(h, /Cazadragones/);

  host.listeners.click.forEach((f) => f({ type: 'click', target: { getAttribute: (k) => (k === 'data-ic-bags' ? 'Lyra' : null), parentNode: null } }));
  await flush();
  assert.equal(sb.InvChars.getSnapshot().open, 'Lyra');
  assert.ok(calls.some((c) => c[0] === 'items' && c[1].includes(19721) && c[1].includes(46731)));
  assert.match(list(D), /<span>Pegote de ectoplasma<\/span><b>6<\/b>/);

  host.listeners.input.forEach((f) => f({ type: 'input', target: { id: 'icQ', value: 'zoe', getAttribute: () => null } }));
  await flush();
  assert.match(list(D), /<h3>Zoé<\/h3>/);
  assert.doesNotMatch(list(D), /<h3>Lyra<\/h3>/);

  host.listeners.click.forEach((f) => f({ type: 'click', target: { getAttribute: (k) => (k === 'data-iv-tab' ? 'search' : null), parentNode: null } }));
  host.listeners.input.forEach((f) => f({ type: 'input', target: { id: 'isQ', value: 'ecto', getAttribute: () => null } }));
  await flush();
  assert.equal(apiCalls(calls).filter((u) => u.includes('characters')).length, 1, 'Buscar reusa los personajes que ya leí');
  host.listeners.click.forEach((f) => f({ type: 'click', target: { getAttribute: (k) => (k === 'data-iv-tab' ? 'chars' : null), parentNode: null } }));
  assert.equal(sb.InvChars.getSnapshot().state, 'done', 'volver a la pestaña no vuelve a leer');
  assert.ok(!calls.some((c) => c[0] === 'oldScreen'));
  assert.ok(!Object.keys(store).filter((k) => k !== 'gn:account:keys').some((k) => store[k].includes('SECRETA')));
});

test('humo: si no puedo leer los personajes, lo digo', async () => {
  const { D } = boot({ fail: true });
  await flush();
  assert.match(list(D), /No pude leer tus personajes/);
});
