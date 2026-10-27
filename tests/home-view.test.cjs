// La Heredad (BL-070 ACT-5, BL-055): js/home-view.js. Corre con: node --test tests/*.test.cjs
// Módulo propio con su ruta, nodos de casa de la API con tus marcas de siempre, los de Janthir y los contratos
// marcados a mano (D5), los gatos, estados honestos y el contraste en los 19 themes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/home-view.js');
const CAT = JSON.parse(read('assets/data/homestead/nodes.json'));
const J = (x) => JSON.parse(JSON.stringify(x));

function box() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'home-view.js' });
  return sb;
}
const P = box().HomeView._pure;
const NOW = Date.UTC(2026, 9, 25, 18, 30); // 25/10 18:30 UTC: el reset diario es en 5 h 30 min

test('archivo: presupuesto, versión, manifiesto después de act-week, fuera de index.html y sin emojis ni localStorage', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.match(SRC, /Versión: 1\.3\.0/);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  assert.doesNotMatch(SRC, /localStorage|sessionStorage/);
  const man = JSON.parse(read('js/modules.json')).modules;
  const i = man.findIndex((m) => m.src === 'js/home-view.js');
  assert.ok(i > man.findIndex((m) => m.src === 'js/act-week.js'));
  assert.equal(man[i].v, '1.3.0');
  assert.doesNotMatch(read('index.html'), /home-view\.js/);
});

test('ruta y panel: los mismos que js/router.js, la barra lateral y la Bienvenida', () => {
  const R = read('js/router.js'), I = read('index.html');
  assert.equal(P.ROUTE, '#/account/homestead');
  assert.ok(R.includes("'#/account/homestead':'homestead'"), 'el router marca la barra lateral');
  assert.ok(R.includes("if (h === '#/account/homestead')") && R.includes("showPanel('homesteadPanel')"), 'el router muestra el panel');
  assert.match(R, /'activitiesPanel','homesteadPanel'/, 'y lo esconde al ir a otro módulo');
  assert.match(I, /<section id="homesteadPanel" class="panel col-main" aria-labelledby="hsTitle" hidden><\/section>/);
  assert.ok(I.includes('class="side-nav__link" href="#/account/homestead"'));
  assert.match(read('js/welcome-panel.js'), /\{ id: 'homestead', name: 'Heredad', [^}]*href: '#\/account\/homestead'/);
  assert.match(read('js/sidebar-nav.js'), /homestead: 'navHS'/);
  assert.match(read('js/act-view.js'), /href="#\/account\/homestead">la Heredad<\/a>/, 'Actividades dice adónde se mudaron los nodos');
});

test('datos: los 57 nodos de la API, 10 a mano (Janthir y contratos), 35 gatos, íconos oficiales y sin repetidos', () => {
  const api = CAT.nodes.filter((n) => n.api), man = CAT.nodes.filter((n) => !n.api);
  assert.equal(api.length, 57);
  assert.equal(man.length, 10);
  assert.equal(new Set(CAT.nodes.map((n) => n.id)).size, 67);
  assert.ok(api.some((n) => n.id === 'black_lion_expedition_board'), 'el tablero de expediciones que le faltaba al módulo viejo');
  ['garden_plot_04', 'expedition_board_s3'].forEach((id) => assert.ok(!CAT.nodes.some((n) => n.id === id), id + ' no existe en la API'));
  assert.equal(CAT.aliases.expedition_board_s3, 'black_lion_expedition_board');
  const groups = CAT.groups.map((g) => g[0]);
  CAT.nodes.forEach((n) => {
    assert.ok(groups.includes(n.group), n.id + ' grupo');
    assert.match(n.icon, /^https:\/\/render\.guildwars2\.com\/file\/[0-9A-F]{40}\/\d+\.png$/, n.id + ' ícono');
    assert.ok(n.name && n.itemName && n.item > 0, n.id);
  });
  assert.deepEqual(man.map((n) => n.id).slice(0, 6), ['honey_flower_node', 'rotted_titan_amber', 'mursaat_obsidian_node', 'charged_titan_ore_node', 'titan_heatstone_node', 'lowland_pine_sapling_node'], 'los ids de siempre: las marcas viejas siguen valiendo');
  assert.equal(CAT.cats.length, 35);
  assert.equal(new Set(CAT.cats.map((c) => c.id)).size, 35);
  CAT.cats.forEach((c) => assert.ok(c.hint && c.es, 'gato ' + c.id));
});

test('marcas de hoy: el formato de siempre por día UTC, ids viejos traducidos y solo queda hoy', () => {
  assert.equal(P.dayKey(NOW), '2026-10-25');
  assert.equal(P.dayKey(Date.UTC(2026, 9, 25, 23, 59)), '2026-10-25');
  assert.equal(P.untilReset(NOW), '5 h 30 min');
  const store = { '2026-10-24': { quartz_node: true }, '2026-10-25': { quartz_node: true, expedition_board_s3: true, iron_ore_node: false } };
  assert.deepEqual(J(P.doneToday(store, NOW, CAT.aliases)), { quartz_node: true, black_lion_expedition_board: true });
  assert.deepEqual(J(P.doneToday(store, Date.UTC(2026, 9, 26, 0, 1), CAT.aliases)), {}, 'pasado el reset, nada');
  assert.deepEqual(J(P.doneToday(null, NOW)), {});
  assert.deepEqual(J(P.setDone(store, NOW, 'lotus_node', true)), { '2026-10-25': { quartz_node: true, expedition_board_s3: true, iron_ore_node: false, lotus_node: true } });
  assert.deepEqual(J(P.setDone(store, NOW, 'quartz_node', false)), { '2026-10-25': { expedition_board_s3: true, iron_ore_node: false } });
});

test('lo que tenés de Janthir y contratos: por cuenta con una huella, nunca la Key', () => {
  const f = P.fingerprint('MI-KEY');
  assert.match(f, /^[0-9a-f]{8}$/);
  assert.notEqual(f, P.fingerprint('OTRA'));
  let s = P.setOwned({}, f, 'honey_flower_node', true);
  s = P.setOwned(s, P.fingerprint('OTRA'), 'expedition_board_eod', true);
  assert.deepEqual(J(P.ownedFor(s, f)), { honey_flower_node: true });
  assert.ok(!JSON.stringify(s).includes('MI-KEY'));
  assert.deepEqual(J(P.ownedFor(P.setOwned(s, f, 'honey_flower_node', false), f)), {});
});

const DATA = (o) => Object.assign({ loaded: true, hasToken: true, unlocked: ['quartz_node', 'iron_ore_node', 'black_lion_hunters_board', 'garden_plot_01'], cats: [{ id: 1, hint: 'chicken' }, 3], unread: [], done: { quartz_node: true }, owned: { honey_flower_node: true } }, o);

test('modelo: tenés o no según la API; los de a mano según tu marca; los contratos no se «recolectan»', () => {
  const m = P.buildModel(DATA(), CAT, {}, NOW);
  const by = (id) => m.nodes.find((n) => n.id === id);
  assert.deepEqual(J(m.stats), { api: 4, apiTotal: 57, mine: 4, done: 1, cats: 2, catsTotal: 35, manual: 1, manualTotal: 10 });
  assert.equal(by('quartz_node').done, true);
  assert.equal(by('mithril_ore_node').have, false);
  assert.equal(by('black_lion_hunters_board').gather, false, 'llega por correo');
  assert.equal(by('honey_flower_node').have, true);
  assert.equal(by('mursaat_obsidian_node').have, false);
  const nd = P.buildModel(DATA({ unlocked: null, cats: null, unread: ['nodes', 'cats'] }), CAT, {}, NOW);
  assert.equal(nd.stats.api, null);
  assert.equal(nd.nodes.find((n) => n.id === 'quartz_node').have, null, 'sin lectura es «sin datos», nunca «no lo tenés»');
  assert.equal(nd.stats.cats, null);
  assert.equal(P.errorText(nd), 'No pude leer tus nodos de casa ni tus gatos. Revisá que la API Key tenga los permisos de cuenta, progreso y desbloqueos.');
  const nok = P.buildModel({ loaded: true, hasToken: false }, CAT, {}, NOW);
  assert.equal(nok.stats.manual, null);
  assert.ok(nok.nodes.every((n) => n.have === null));
});

test('filtros: herramienta, «Me faltan», «Sin recolectar hoy» y búsqueda sin tildes', () => {
  const ids = (ui) => P.buildModel(DATA(), CAT, ui, NOW).shown.map((n) => n.id);
  assert.equal(ids({}).length, 67);
  assert.ok(ids({ group: 'mining' }).every((id) => CAT.nodes.find((n) => n.id === id).group === 'mining'));
  assert.deepEqual(ids({ only: 'pending' }), ['garden_plot_01', 'iron_ore_node', 'honey_flower_node']);
  assert.ok(!ids({ only: 'missing' }).includes('quartz_node'));
  assert.ok(ids({ only: 'missing' }).includes('mursaat_obsidian_node'));
  assert.deepEqual(ids({ q: 'OBSIDIANA' }), ['mursaat_obsidian_node']);
  assert.deepEqual(ids({ q: 'quematerita' }), ['titan_heatstone_node']);
  assert.deepEqual(ids({ q: 'arbol del dia' }), ['wintersday_tree'], 'sin tildes');
});

test('mi voz: lo que te queda hoy; todo hecho; o que marques los de Janthir', () => {
  assert.equal(P.pickVoice(P.buildModel(DATA(), CAT, {}, NOW)).text, 'Te quedan 3 nodos por recolectar hoy en tu casa. Se reinician a las 00:00 UTC, en 5 h 30 min.');
  const all = P.buildModel(DATA({ done: { quartz_node: true, iron_ore_node: true, garden_plot_01: true, honey_flower_node: true } }), CAT, {}, NOW);
  assert.match(P.pickVoice(all).text, /^Recolectaste todo lo de tu casa hoy/);
  const none = P.buildModel(DATA({ unlocked: [], owned: {} }), CAT, {}, NOW);
  assert.match(P.pickVoice(none).text, /^La API no informa los nodos de Janthir ni los contratos de las expansiones/);
  assert.equal(P.pickVoice(P.buildModel({ loaded: true, hasToken: false }, CAT, {}, NOW)), null);
});

test('vista: cabecera con 4 indicadores, nodos con ícono y estado en texto, botones con nombre y los gatos', () => {
  const m = P.buildModel(DATA(), CAT, {}, NOW);
  const h = P.viewHTML(m);
  assert.match(h, /<h2 id="hsTitle">Heredad<\/h2>/);
  assert.match(h, /<small>Nodos<\/small><b>4 <span>\/ 57<\/span>/);
  assert.match(h, /<small>Recolectados hoy<\/small><b>1 <span>\/ 4<\/span>/);
  assert.match(h, /<small>Gatos<\/small><b>2 <span>\/ 35<\/span>/);
  assert.match(h, /<small>Janthir y contratos<\/small><b>1 <span>\/ 10<\/span><\/b><em>los marcás vos<\/em>/);
  assert.match(h, /<b>Nodo de cuarzo<\/b><small>con «Regalo de cuarzo»<\/small><\/span><span class="hs-badge hs-badge--ok">Recolectado hoy/);
  assert.match(h, /data-hs-done="quartz_node" aria-pressed="true">.*?<span class="hs-sr"> Nodo de cuarzo<\/span>/);
  assert.match(h, /<b>Nodo de mithril<\/b>.*?hs-badge--nd">No lo tenés<\/span><span class="hs-acts"><\/span>/);
  assert.match(h, /<b>Tablero de caza del León Negro<\/b>.*?Llega por correo<\/span><span class="hs-acts"><\/span>/);
  assert.match(h, /<b>Nodo de flor mielera<\/b><small>la API no lo informa · con «Nodo del hogar de flor mielera»<\/small>.*?data-hs-own="honey_flower_node" aria-pressed="true">Lo tengo/);
  assert.match(h, /data-hs-own="mursaat_obsidian_node" aria-pressed="false">Lo tengo/);
  assert.doesNotMatch(h, /data-hs-done="mursaat_obsidian_node"/);
  assert.equal((h.match(/class="hs-cat( hs-cat--on)?"/g) || []).length, 35);
  assert.match(h, /<li class="hs-cat hs-cat--on"><b>Gato 1<\/b><small>pista: pollo<\/small><span class="hs-sr">, lo tenés<\/span>/);
  assert.match(h, /data-hs-group="mining" aria-pressed="false">Minería<\/button>/);
  assert.match(h, /<input type="search" id="hsQ"/);
  assert.match(h, /role="tablist" aria-label="Secciones de la Heredad"/);
  const nd = P.viewHTML(P.buildModel({ loaded: true, hasToken: false }, CAT, {}, NOW));
  assert.doesNotMatch(nd, /data-hs-own|data-hs-done/, 'sin Key no se marca nada');
  assert.match(nd, /Con tu API Key/);
});

test('CSS: un solo contenedor, solo el texto del theme, foco visible y 44 px en el celular', () => {
  const keys = new Set();
  P.CSS.replace(/(?:^|[;{])\s*color\s*:\s*var\((--[\w-]+)/g, (m, k) => { keys.add(k); return m; });
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2']);
  assert.match(P.CSS, /#homesteadPanel\.hs-on\{padding:0 0 22px;background:linear-gradient/);
  assert.match(P.CSS, /\.hs-hero\{border-bottom:1px solid var\(--bd-1\)/);
  assert.doesNotMatch(P.CSS, /\.hs-hero\{[^}]*border-radius/, 'la cabecera no es una caja');
  assert.match(P.CSS, /#hsRoot :is\(button,input\):focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(P.CSS, /@media \(max-width:900px\)[^]*min-height:44px/);
  assert.match(P.CSS, /prefers-reduced-motion/);
  assert.doesNotMatch(P.CSS, /\.hs-badge[^{]*\{[^}]*background/);
});

test('en los 19 themes cada texto de la Heredad llega a 4.5:1 sobre las superficies donde se pinta', () => {
  const TD = path.join(ROOT, 'css', 'themes');
  const themes = fs.readdirSync(TD).filter((f) => f.endsWith('.css'));
  assert.equal(themes.length, 19);
  const sb = { console: { info() {}, warn() {} }, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat, setTimeout: () => 0 };
  sb.window = sb;
  vm.createContext(sb);
  ['js/gn-surface.js', 'js/gn-frame.js'].forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  const G = sb.GNSurface._pure, fails = [];
  themes.forEach((f) => {
    const css = fs.readFileSync(path.join(TD, f), 'utf8'), t = {};
    css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
    const sf = G.surfaces(t), fx = sb.GNFrame._pure.guardFixes(sb.GNSurface.surfaceTokens(t), G), eff = Object.assign({}, t, sf, fx);
    const tray = G.parse(sf['--gn-tray']), card = G.parse(sf['--bg-1']), bg0 = G.over(G.parse(t['--bg-0']), [255, 255, 255, 1]), bg2 = G.parse(sf['--bg-2']);
    const hero = G.over([0xD9, 0xA5, 0x5B, 0.12], tray);
    ['--tx-1', '--tx-2'].forEach((k) => [['bandeja', tray], ['tarjeta', card], ['bg-0', bg0], ['botón apretado', bg2], ['cabecera', hero]].forEach(([n, s]) => {
      const r = G.contrast(G.over(G.parse(eff[k]), s), s);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
  });
  assert.deepEqual(fails, []);
});

// ------------------------------------------------------------------ humo con DOM mínimo
function fakeDom(withPanel) {
  const els = {};
  function el(id, tag) {
    const n = {
      tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', hidden: false, listeners: {}, parentNode: null, className: '',
      classList: { s: new Set(), add(c) { this.s.add(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; },
      removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; },
      appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
      insertBefore(c, ref) { const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); c.parentNode = this; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      get nextSibling() { const p = this.parentNode; return p ? p.children[p.children.indexOf(this) + 1] || null : null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      contains() { return false; }, querySelector() { return null; },
    };
    Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } });
    if (id) n.id = id;
    return n;
  }
  const main = el('main', 'main');
  main.appendChild(el('activitiesPanel', 'section'));
  if (withPanel) main.appendChild(el('homesteadPanel', 'section'));
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null,
    getElementById: (id) => els[id] || (id === 'hsVoice' && els.hsRoot && els.hsRoot.innerHTML.includes('id="hsVoice"') ? el('hsVoice') : null),
    createElement: (t) => el(null, t), addEventListener() {},
  };
  return { els, main, document };
}

function boot(opts) {
  const D = fakeDom(opts.withPanel !== false);
  const store = Object.assign({}, opts.store || {}), calls = [], winL = {}, voices = [];
  const api = { '/v2/account/home/nodes': ['quartz_node', 'iron_ore_node'], '/v2/account/home/cats': [{ id: 1, hint: 'chicken' }] };
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), setInterval: () => 1, clearInterval() {},
    location: { hash: opts.hash }, addEventListener: (t, f) => { (winL[t] = winL[t] || []).push(f); },
    fetch: (u) => {
      calls.push(u);
      if (u === 'assets/data/homestead/nodes.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(J(CAT)) });
      const p = u.replace('https://api.guildwars2.com', '').split('?')[0];
      if ((opts.fail || []).includes(p)) return Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({}) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(J(api[p])) });
    },
    Storage: {
      STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected', ACTIVITIES_HOME_NODES: 'gn:activities:home:nodes' },
      get: (k) => (k === 'gn:account:selected' ? opts.token || null : k in store ? JSON.parse(store[k]) : null),
      set: (k, v) => { store[k] = JSON.stringify(v); },
    },
    Shiruvana: { voice: (m) => { voices.push(m.text); return { text: m.text }; } },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'home-view.js' }); // el panel de index.html llega visible: como si el router ya lo mostró
  return { sb, D, store, calls, winL, voices };
}
const flush = () => new Promise((r) => setImmediate(r)).then(() => new Promise((r) => setImmediate(r)));
const today = () => new Date().toISOString().slice(0, 10);

test('humo: en su ruta toma el panel, lee la cuenta una vez por fuente y conserva las marcas de siempre', async () => {
  const old = {}; old[today()] = { quartz_node: true };
  const x = boot({ hash: '#/account/homestead', token: 'TOKEN-DE-PRUEBA', store: { 'gn:activities:home:nodes': JSON.stringify(old) } });
  await flush();
  const host = x.D.els.hsRoot;
  assert.ok(host, 'crea #hsRoot');
  assert.ok(x.D.els.homesteadPanel.classList.contains('hs-on'));
  assert.equal(x.D.els.homesteadPanel.getAttribute('aria-labelledby'), 'hsTitle');
  const api = x.calls.filter((u) => u.startsWith('https://'));
  assert.equal(api.length, 2, 'nodos y gatos, un pedido cada uno');
  assert.ok(api.every((u) => u.includes('access_token=TOKEN-DE-PRUEBA')));
  assert.match(host.innerHTML, /<small>Nodos<\/small><b>2 <span>\/ 57/);
  assert.match(host.innerHTML, /data-hs-done="quartz_node" aria-pressed="true"/, 'la marca de siempre sigue');
  assert.ok(x.voices.some((v) => /Te queda 1 nodo/.test(v)));
  const click = (attrs) => host.listeners.click[0]({ target: { getAttribute: (k) => attrs[k] || null, parentNode: null } });
  click({ 'data-hs-done': 'iron_ore_node' });
  assert.deepEqual(Object.keys(JSON.parse(x.store['gn:activities:home:nodes'])[today()]).sort(), ['iron_ore_node', 'quartz_node']);
  click({ 'data-hs-own': 'honey_flower_node' });
  const owned = JSON.parse(x.store['gn:homestead:owned']);
  assert.deepEqual(Object.values(owned).map((o) => Object.keys(o)), [['honey_flower_node']]);
  assert.ok(!x.store['gn:homestead:owned'].includes('TOKEN-DE-PRUEBA'), 'la Key nunca se guarda');
  assert.match(host.innerHTML, /data-hs-done="honey_flower_node" aria-pressed="false"/, 'ahora se puede marcar recolectado');
  click({ 'data-hs-group': 'logging' });
  assert.match(host.innerHTML, /data-hs-group="logging" aria-pressed="true"/);
  assert.doesNotMatch(host.innerHTML, /<b>Nodo de cuarzo<\/b>/);
  host.listeners.input[0]({ target: { id: 'hsQ', value: 'pino' } });
  assert.match(host.innerHTML, /<b>Nodo de pimpollo de pino de las tierras bajas<\/b>/);
  assert.equal(x.calls.filter((u) => u.startsWith('https://')).length, 2, 'filtrar y marcar no vuelve a pedir');
});

test('humo: sin panel en index.html lo creo al lado de Actividades; sin Key no pido nada; un 403 se dice', async () => {
  const a = boot({ hash: '#/welcome', token: 'K', withPanel: false });
  assert.ok(a.D.els.homesteadPanel, 'creado');
  assert.equal(a.D.els.activitiesPanel.nextSibling, a.D.els.homesteadPanel);
  assert.equal(a.D.els.homesteadPanel.hidden, true, 'escondido hasta que el router lo muestre');
  await flush();
  assert.equal(a.calls.length, 0, 'fuera de su ruta no dibuja ni pide');
  const b = boot({ hash: '#/account/homestead', token: null });
  await flush();
  assert.equal(b.calls.filter((u) => u.startsWith('https://')).length, 0);
  assert.match(b.D.els.hsRoot.innerHTML, /Con tu API Key/);
  const c = boot({ hash: '#/account/homestead', token: 'K', fail: ['/v2/account/home/nodes'] });
  await flush();
  assert.match(c.D.els.hsRoot.innerHTML, /No pude leer tus nodos de casa\. Revisá que la API Key tenga los permisos/);
  assert.match(c.D.els.hsRoot.innerHTML, /<small>Nodos<\/small><b>—<\/b><em>sin datos<\/em>/);
  assert.match(c.D.els.hsRoot.innerHTML, /<small>Gatos<\/small><b>1 <span>\/ 35/, 'lo que sí se leyó, se ve');
});
