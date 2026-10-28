// Actividades, el PSNA en la vista nueva (BL-070, ACT-7): js/act-psna.js. Corre con: node --test tests/*.test.cjs
// Las funciones puras de siempre (BL-013, BL-044, BL-048) contra los datos publicados, la tarjeta, copiar, estados
// honestos, el contraste en los 19 themes y una prueba de humo con act-model, act-view y act-psna juntos.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/act-psna.js');
const VIEW = read('js/act-view.js');
const MODEL = read('js/act-model.js');
const CAT = JSON.parse(read('assets/data/activities/catalog.json'));
const DATA = JSON.parse(read('assets/data/psna-schedule.json'));
const J = (x) => JSON.parse(JSON.stringify(x));
const at = (iso) => new Date(iso);

function box(extra) {
  const sb = Object.assign({ console: { info() {}, warn() {} } }, extra || {});
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'act-psna.js' });
  return sb;
}
const P = box().ActPsna._pure;
const pick = (d, n) => P.psnaPickDay(d, n);
const first = (r) => r && r.waypoints[0].name;

test('archivo: presupuesto, versión, manifiesto antes de act-view, fuera de index.html, sin emojis ni almacenamiento', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.match(SRC, /Versión: 1\.0\.0/);
  assert.match(VIEW, /Versión: 1\.7\.0/);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|Storage\.set/);
  assert.doesNotMatch(SRC, /gw2-wallet-ligero/, 'lee solo el archivo propio, nunca el repo de producción');
  assert.equal(P.DATA_URL, 'assets/data/psna-schedule.json');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.indexOf('js/act-psna.js') > man.indexOf('js/act-model.js') && man.indexOf('js/act-psna.js') < man.indexOf('js/act-view.js'));
  assert.doesNotMatch(read('index.html'), /act-psna\.js/);
  assert.ok(fs.existsSync(path.join(ROOT, P.WP_ICON)), 'el ícono del punto de ruta está en el repo');
});

test('act-view ya no depende de lo viejo: no reubica el PSNA, las piedras ni los nodos, ni lee Activities', () => {
  assert.doesNotMatch(VIEW, /psnaPanel|pillLeivas|homeNodesContainer|avPsnaSlot|avStonesSlot|root\.Activities|assMinus/);
  assert.match(VIEW, /root\.ActPsna/);
});

test('el día cambia a las 08:00 UTC y depende solo del día de la semana (BL-013)', () => {
  assert.equal(first(pick(DATA, at('2026-10-21T07:59:59Z'))), 'Camp Resolve Waypoint');
  assert.equal(pick(DATA, at('2026-10-21T07:59:59Z')).weekday, 'tuesday');
  assert.equal(first(pick(DATA, at('2026-10-21T08:00:00Z'))), 'Town of Prosperity');
  assert.equal(pick(DATA, at('2026-10-21T08:00:00Z')).date, '2026-10-21');
  const wiki = { '2026-10-18': "Azarr's Arbor", '2026-10-19': 'Restoration Refuge', '2026-10-22': 'Blue Oasis', '2026-10-23': 'Repair Station', '2026-10-24': 'Camp Resolve Waypoint', '2026-01-27': 'Camp Resolve Waypoint' };
  Object.entries(wiki).forEach(([d, n]) => assert.equal(first(pick(DATA, at(d + 'T12:00:00Z'))), n, d));
  assert.deepEqual(J(pick(DATA, at('2027-03-18T12:00:00Z')).waypoints), J(pick(DATA, at('2026-10-22T12:00:00Z')).waypoints));
  assert.equal(pick({ rotation: DATA.rotation }, at('2026-10-22T07:59:00Z')).weekday, 'wednesday', 'sin resetUtcHour, 08:00');
});

test('sin rotación usa la fecha exacta y después el mismo día; sin datos, null, nunca un día equivocado', () => {
  assert.equal(pick({ schedule: DATA.schedule }, at('2026-10-22T12:00:00Z')).source, 'date');
  const r = pick({ schedule: DATA.schedule }, at('2027-01-07T12:00:00Z'));
  assert.equal(r.source, 'weekday');
  assert.equal(first(r), 'Blue Oasis');
  assert.equal(pick(null, at('2026-10-22T12:00:00Z')), null);
  assert.equal(pick({ schedule: [] }, at('2026-10-22T12:00:00Z')), null);
  assert.equal(pick(DATA, new Date('x')), null);
  assert.equal(pick({ schedule: [{ date: '2026-10-19', waypoints: DATA.rotation.monday }] }, at('2026-10-22T12:00:00Z')), null);
  assert.equal(pick({ rotation: { thursday: DATA.rotation.thursday.slice(0, 5) } }, at('2026-10-22T12:00:00Z')), null, 'un día incompleto no se muestra');
});

test('cuándo cambian y cuánto falta (BL-044, BL-048)', () => {
  const nx = P.psnaNextChange;
  assert.equal(nx(DATA, at('2026-10-21T07:59:00Z')).toISOString(), '2026-10-21T08:00:00.000Z');
  assert.equal(nx(DATA, at('2026-10-21T08:00:00Z')).toISOString(), '2026-10-22T08:00:00.000Z');
  assert.equal(nx(null, at('2026-10-21T03:00:00Z')).toISOString(), '2026-10-21T08:00:00.000Z');
  assert.equal(nx(DATA, new Date('x')), null);
  assert.equal(P.psnaFalta(at('2026-10-22T08:00:00Z'), at('2026-10-21T22:38:00Z')), '9 h 22 min');
  assert.equal(P.psnaFalta(at('2026-10-22T08:00:00Z'), at('2026-10-22T06:55:00Z')), '1 h 05 min');
  assert.equal(P.psnaFalta(at('2026-10-22T08:00:00Z'), at('2026-10-22T07:15:00Z')), '45 min');
  const now = at('2026-10-21T22:14:00Z');
  assert.equal(P.psnaDayText(pick(DATA, now), nx(DATA, now), now), 'Lugares del miércoles 21/10 · cambian en 9 h 46 min (08:00 UTC)');
  assert.equal(P.psnaDayText(null, null, now), '');
});

test('la tarjeta: día y cuenta regresiva, 6 botones con el ícono local, el agente y la región; copiar los 6', () => {
  const m = P.buildModel(DATA, at('2026-10-21T22:38:00Z'));
  assert.equal(m.state, 'ok');
  assert.equal(m.valid, 6);
  assert.deepEqual(J(m.rows[0]), { name: 'Town of Prosperity', code: '[&BH4HAAA=]', npc: 'Mehem the Traveled', region: 'Maguuma Wastes' });
  const h = P.cardHTML(m, null);
  assert.match(h, /<h3 id="apT">PSNA · Agentes de la Red de Suministros del Pacto<\/h3>/);
  assert.match(h, /aria-label="Lugares del miércoles 21\/10 · cambian en 9 h 22 min \(08:00 UTC\)"/);
  assert.match(h, /<small>Lugares del día<\/small><b>Miércoles 21\/10<\/b>/);
  assert.match(h, /<small>Cambian en<\/small><b id="apFalta">9 h 22 min<\/b><em>08:00 UTC · /);
  assert.equal((h.match(/<button type="button" class="ap-wp" data-ap-copy="\d"/g) || []).length, 6);
  assert.equal((h.match(/src="assets\/icons\/733330\.png"/g) || []).length, 6);
  assert.match(h, /aria-label="Copiar el punto de ruta de Town of Prosperity"/);
  assert.match(h, /<b>Town of Prosperity<\/b><small>Mehem the Traveled · Maguuma Wastes<\/small>/);
  assert.match(h, /data-ap-all="1">Copiar los 6<\/button>/);
  assert.match(P.cardHTML(m, 0), /av-badge av-badge--ok">Copiado<\/span>.*Copié el código: pegalo en el chat del juego\./);
  assert.match(P.cardHTML(m, 'all'), /data-ap-all="1">Copiados<\/button>.*Copié los 6 códigos/);
});

test('estados honestos: leyendo, sin datos del archivo, sin el día y un lugar sin código', () => {
  assert.match(P.cardHTML(P.buildModel(null, new Date(), 'loading')), /Leyendo los lugares de hoy/);
  const err = P.cardHTML(P.buildModel(null, new Date(), 'error'));
  assert.match(err, /Sin datos: no pude leer los lugares del PSNA/);
  assert.doesNotMatch(err, /data-ap-copy/);
  assert.match(P.cardHTML(P.buildModel({ schedule: [] }, at('2026-10-22T12:00:00Z'))), /no muestro un día equivocado/);
  const d2 = J(DATA); d2.rotation.wednesday[1].code = '';
  const m = P.buildModel(d2, at('2026-10-21T22:38:00Z')), h = P.cardHTML(m);
  assert.equal(m.valid, 5);
  assert.equal((h.match(/ disabled aria-label="Sin código: /g) || []).length, 1);
  assert.match(h, /av-badge av-badge--nd">Sin código/);
  assert.match(h, /Copiar los 5/);
});

test('CSS: solo el texto del theme, foco visible, 44 px en el celular y sin fondo en las marcas', () => {
  const keys = new Set();
  P.CSS.replace(/(?:^|[;{])\s*color\s*:\s*var\((--[\w-]+)/g, (m, k) => { keys.add(k); return m; });
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2']);
  assert.match(P.CSS, /\.ap-wp:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(P.CSS, /@media \(max-width:900px\)[^]*min-height:44px/);
  assert.match(P.CSS, /\.ap-wp\{[^}]*min-height:52px/);
});

test('en los 19 themes los textos del PSNA llegan a 4.5:1', () => {
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
    const card = G.parse(sf['--bg-1']), bg0 = G.over(G.parse(t['--bg-0']), [255, 255, 255, 1]);
    ['--tx-1', '--tx-2'].forEach((k) => [['tarjeta', card], ['botón', bg0]].forEach(([n, s]) => {
      const r = G.contrast(G.over(G.parse(eff[k]), s), s);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
  });
  assert.deepEqual(fails, []);
});

// ------------------------------------------------------------------ humo: act-model + act-psna + act-view
function boot(opts) {
  const els = {}, copies = [], calls = [];
  function el(id, tag) {
    const n = {
      id, tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', textContent: '', hidden: false, listeners: {}, parentNode: null,
      classList: { s: new Set(), add(c) { this.s.add(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }, setAttribute(k, v) { this.attrs[k] = String(v); },
      appendChild(c) { this.children.push(c); c.parentNode = this; if (c.id) els[c.id] = c; return c; },
      insertBefore(c) { this.children.unshift(c); c.parentNode = this; if (c.id) els[c.id] = c; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); }, get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }, contains() { return false; }, querySelector() { return null; },
    };
    if (id) els[id] = n;
    return n;
  }
  const panel = el('activitiesPanel', 'section');
  const old = panel.appendChild(el('psnaPanel', 'section'));
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null, addEventListener() {},
    getElementById: (id) => els[id] || (id === 'apFalta' && els.avRoot && els.avRoot.innerHTML.includes('id="apFalta"') ? (els.apFalta = el('apFalta')) : null),
    createElement: (t) => { const n = el(null, t); Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } }); return n; },
  };
  const sb = {
    console: { info() {}, warn() {} }, document, setTimeout: (f) => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
    location: { hash: '#/activities' }, addEventListener() {},
    navigator: { clipboard: { writeText: (t) => { copies.push(t); return Promise.resolve(); } } },
    fetch: (u) => {
      calls.push(u);
      if (u === 'assets/data/activities/catalog.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(J(CAT)) });
      if (u === 'assets/data/psna-schedule.json') return opts.failData ? Promise.resolve({ ok: false, status: 404 }) : Promise.resolve({ ok: true, json: () => Promise.resolve(J(DATA)) });
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) });
    },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected' }, get: () => null, set() {} },
    Activities: { _debug: () => ({ token: 'x', weeklyStones: 4 }) },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'act-model.js' });
  vm.runInContext(SRC, sb, { filename: 'act-psna.js' });
  vm.runInContext(VIEW, sb, { filename: 'act-view.js' });
  return { sb, els, old, panel, copies, calls };
}
const flush = async () => { for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r)); };

test('humo: en Hoy la tarjeta nueva reemplaza al PSNA de siempre, copia y no toca lo viejo', async () => {
  const x = boot({});
  await flush();
  const host = x.els.avRoot, h = host.innerHTML;
  assert.match(h, /<h3 id="apT">PSNA · Agentes de la Red de Suministros del Pacto<\/h3>/);
  assert.ok(h.indexOf('id="apT"') > h.indexOf('id="avFrT"') && h.indexOf('id="apT"') < h.indexOf('id="avPanel-semana"'), 'en Hoy, después de los fractales');
  assert.equal((h.match(/data-ap-copy="/g) || []).length, 6);
  assert.equal(x.old.parentNode, x.panel, 'el PSNA viejo queda donde estaba (oculto por la vista)');
  assert.match(h, /<small>Piedras vetustas<\/small><b>—<\/b>/, 'ya no leo el −/+ de activities.js');
  assert.equal(x.calls.filter((u) => u === 'assets/data/psna-schedule.json').length, 1, 'el archivo, una vez');
  const tgt = (attrs) => ({ target: { getAttribute: (k) => (k in attrs ? attrs[k] : null), parentNode: null } });
  host.listeners.click[0](tgt({ 'data-ap-copy': '0' }));
  await flush();
  assert.equal(x.copies.length, 1);
  assert.match(x.copies[0], /^\[&[A-Za-z0-9+/=]+\]$/);
  assert.match(host.innerHTML, /Copié el código: pegalo en el chat del juego\./);
  host.listeners.click[0](tgt({ 'data-ap-all': '1' }));
  await flush();
  assert.equal(x.copies[1].split(' ').length, 6, 'los 6 códigos juntos');
  assert.ok(x.els['act-psna-css'], 'pone su hoja una vez');
  assert.equal(x.sb.ActPsna.tick(Date.now()), false, 'mismo día: no hace falta redibujar');
});

test('humo: si el archivo no se lee lo digo, y «Actualizar» lo vuelve a pedir', async () => {
  const x = boot({ failData: true });
  await flush();
  assert.match(x.els.avRoot.innerHTML, /Sin datos: no pude leer los lugares del PSNA/);
  x.els.avRoot.listeners.click[0]({ target: { getAttribute: (k) => (k === 'data-av' ? 'refresh' : null), parentNode: null } });
  await flush();
  assert.equal(x.calls.filter((u) => u === 'assets/data/psna-schedule.json').length, 2);
});
