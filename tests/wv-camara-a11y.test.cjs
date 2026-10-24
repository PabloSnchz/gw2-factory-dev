// Cámara del Brujo (BL-064, CAM-6): mi voz en la cabecera, contraste AA en los 19 themes,
// teclado y lector de pantalla. La guarda es la de la Bienvenida (Welcome._pure.contrastFixes),
// aplicada sobre #wvPanel por js/wv-view.js; cubre los colores de todos los módulos de la Cámara.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/wv-view.js');
const MODULES = ['js/wv-view.js', 'js/wv-objectives-ui.js', 'js/wv-shop-ui.js', 'js/wv-shop-manage.js', 'js/wv-objectives-dashboard.js', 'js/wv-purchases-view.js'];
const J = (v) => JSON.parse(JSON.stringify(v));
const H = 3600000, DAY = 24 * H;

const THEMES_DIR = path.join(ROOT, 'css', 'themes');
function readTheme(file) {
  const css = fs.readFileSync(path.join(THEMES_DIR, file), 'utf8');
  const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'));
  const t = {};
  block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return t;
}
const THEMES = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css')).sort()
  .map((f) => ({ id: f.replace(/\.css$/, ''), tokens: readTheme(f) }));

function loadWelcome() {
  const noop = () => {};
  const document = { readyState: 'loading', addEventListener: noop, getElementById: () => null, querySelector: () => null,
    querySelectorAll: () => [], createElement: () => ({ setAttribute: noop, appendChild: noop }) };
  const window = { document, console: { info: noop, warn: noop, log: noop }, location: { hash: '' }, addEventListener: noop,
    Storage: { STORAGE_KEYS: {}, get: () => null, set: noop } };
  vm.runInNewContext(read('js/welcome-panel.js'), { window, Date, JSON, Promise, Math });
  return window.Welcome._pure;
}
const W = loadWelcome();

// wv-view con lo mínimo: panel con style, cabecera, mi voz y el almacén de la temporada.
function load(opts = {}) {
  const nodes = {}, props = {}, calls = [];
  const node = (id, attrs) => {
    const n = { id, attrs: Object.assign({}, attrs || {}), listeners: {}, children: [], _h: '', style: {} };
    n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
    n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
    n.removeAttribute = (k) => { delete n.attrs[k]; };
    n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
    n.appendChild = (c) => { n.children.push(c); };
    n.removeChild = (c) => { n.children.splice(n.children.indexOf(c), 1); };
    Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
    Object.defineProperty(n, 'hidden', { get: () => 'hidden' in n.attrs, set: (v) => { if (v) n.attrs.hidden = ''; else delete n.attrs.hidden; } });
    Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); if (n.id === 'wvxHead') { nodes.wvxVoice = node('wvxVoice'); } } });
    n.querySelectorAll = () => [];
    n.querySelector = () => null;
    nodes[id] = n;
    return n;
  };
  const panel = node('wvPanel');
  panel.style = { setProperty: (k, v) => { props[k] = v; }, removeProperty: (k) => { delete props[k]; } };
  panel.firstChild; panel.insertBefore = (c) => { nodes[c.id] = c; };
  node('wvTabBtnDaily', { 'aria-selected': 'true' }); node('wvTabBtnWeekly'); node('wvTabBtnSpecial'); node('wvTabBtnShop');
  node('wvTabDaily', { role: 'tabpanel' }); node('wvTabShop', { role: 'tabpanel' });
  node('wvObjectivesDashboardPanel', { hidden: '' });
  const key = node('keySelectGlobal'); key.value = 'KEY-1111';
  const ob = (cur, tot, aa, claimed) => ({ progress_current: cur, progress_complete: tot, acclaim: aa, claimed: !!claimed });
  const daily = opts.daily || { objectives: [ob(1, 1, 10, true), ob(1, 3, 10)] };
  const res = (v) => Promise.resolve(v);
  const win = {
    console: { info() {}, warn() {}, log() {} }, setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {}, Promise, Date, Math, JSON, Object,
    location: { hash: '' }, addEventListener() {},
    getComputedStyle: () => ({ getPropertyValue: (k) => (opts.tokens || {})[k] || '' }),
    Storage: { STORAGE_KEYS: { ACCOUNT_KEYS: 'k' }, get: () => [{}] },
    Welcome: opts.noWelcome ? undefined : { _pure: W },
    Shiruvana: { voice: (o) => { calls.push(['voice', o.kind, o.text]); return { voice: o.text }; } },
    WVSeasonStore: {
      listSeasons: () => [{ year: 26, seq: 1 }],
      getPinned: (y, q, fp) => { calls.push(['getPinned', fp]); return opts.pinned || {}; },
      getMarks: () => opts.marks || {}
    },
    GW2Api: {
      getWVSeason: () => res({ title: 'T', end: opts.end || '2099-01-01T00:00:00Z' }),
      getWVAccount: () => res({ astral_acclaim: opts.aa == null ? 100 : opts.aa }),
      getAccountWVListings: () => res(opts.rows || []),
      getWVDaily: () => res(daily), getWVWeekly: () => res({ objectives: [] }), getWVSpecial: () => res({ objectives: [] })
    },
    WV: { __getShopState: () => null }
  };
  win.window = win;
  win.document = { readyState: 'complete', head: { appendChild: (c) => { nodes[c.id] = c; } }, documentElement: {},
    getElementById: (id) => nodes[id] || null, createElement: () => node(''), addEventListener() {} };
  vm.runInContext(SRC, vm.createContext(win));
  const P = {};
  Object.keys(win.WVView._pure).forEach((k) => {
    const v = win.WVView._pure[k];
    P[k] = typeof v !== 'function' ? v : (...a) => { const r = v(...a); return r && typeof r === 'object' ? J(r) : r; };
  });
  return { win, nodes, props, calls, V: win.WVView, P };
}
const P = load().P;
const flush = async () => { for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r)); };

// ------------------------------------------------------------------ mi voz
const NOW = Date.parse('2026-10-21T12:00:00Z'); // miércoles
const c = (total, done, ready, aa, readyAA) => ({ total, done, ready, claimed: done - ready, meta: null, aa: aa || 0, readyAA: readyAA || 0 });

test('voz 1: objetivos listos para reclamar, con la AA que suman (singular y plural)', () => {
  const v = P.pickVoice({ counts: { daily: c(4, 2, 2, 40, 130), weekly: c(3, 1, 1, 50, 0) }, now: NOW });
  assert.deepEqual(v, { key: 'ready', kind: 'advierte', text: 'Tenés 3 objetivos listos para reclamar en el juego (+130 AA).' });
  assert.equal(P.pickVoice({ counts: { daily: c(4, 1, 1, 0, 0) }, now: NOW }).text, 'Tenés 1 objetivo listo para reclamar en el juego.');
});

test('voz 2: reset cercano (60 min o menos) con objetivos sin terminar; diario antes que semanal', () => {
  const late = Date.parse('2026-10-21T23:20:00Z');
  assert.deepEqual(P.pickVoice({ counts: { daily: c(4, 1, 0) }, now: late }),
    { key: 'reset-daily', kind: 'advierte', text: 'El reset diario es en 40 min y te faltan 3 objetivos diarios.' });
  assert.equal(P.pickVoice({ counts: { daily: c(4, 3, 0) }, now: Date.parse('2026-10-21T23:00:00Z') }).text, 'El reset diario es en 1 h 0 min y te falta 1 objetivo diario.');
  assert.equal(P.pickVoice({ counts: { daily: c(4, 1, 0) }, now: Date.parse('2026-10-21T22:59:00Z') }), null, 'a más de una hora no hablo');
  const monday = Date.parse('2026-10-26T07:00:00Z');
  assert.equal(P.pickVoice({ counts: { daily: c(4, 4, 0), weekly: c(5, 3, 0) }, now: monday }).text, 'El reset semanal es en 30 min y te faltan 2 objetivos semanales.');
  assert.equal(P.pickVoice({ counts: { daily: c(4, 4, 0) }, now: late }), null, 'todo hecho: nada');
});

test('voz 3: fijados sin AA suficiente (la marcada ya está gastada) y en cuántas semanas llego', () => {
  const base = { counts: {}, now: NOW, aa: 1000, marked: 200, reserved: 1180, income: 300 };
  assert.deepEqual(P.pickVoice(base), { key: 'short', kind: 'recomienda',
    text: 'Para lo fijado te faltan 380 AA. Si completás lo diario y lo semanal, llegás en unas 2 semanas.' });
  assert.equal(P.pickVoice(Object.assign({}, base, { income: 400 })).text, 'Para lo fijado te faltan 380 AA. Si completás lo diario y lo semanal, llegás en una semana.');
  assert.equal(P.pickVoice(Object.assign({}, base, { income: 0 })).text, 'Para lo fijado te faltan 380 AA.');
  assert.equal(P.pickVoice(Object.assign({}, base, { reserved: 800 })), null, 'me alcanza: no hablo');
  assert.equal(P.pickVoice(Object.assign({}, base, { aa: null })), null, 'sin AA no invento');
});

test('voz 4: temporada terminando (7 días o menos) con fijados sin comprar; todo al día no dice nada', () => {
  const v = { counts: {}, now: NOW, pinnedLeft: 2, seasonEnd: NOW + 5 * DAY + H };
  assert.deepEqual(P.pickVoice(v), { key: 'season', kind: 'advierte', text: 'La temporada termina en 5 días y te quedan 2 fijados sin comprar.' });
  assert.equal(P.pickVoice(Object.assign({}, v, { pinnedLeft: 1, seasonEnd: NOW + 3 * H })).text, 'La temporada termina en 3 h 0 min y te queda 1 fijado sin comprar.');
  assert.equal(P.pickVoice(Object.assign({}, v, { seasonEnd: NOW + 8 * DAY })), null);
  assert.equal(P.pickVoice(Object.assign({}, v, { pinnedLeft: 0 })), null);
  assert.equal(P.pickVoice(Object.assign({}, v, { seasonEnd: NOW - H })), null, 'terminada: nada');
  assert.equal(P.pickVoice({ counts: {}, now: NOW, seasonEnd: NaN }), null);
});

test('números de la voz: AA marcada con tope, fijados pendientes y AA por semana', () => {
  const rows = [{ id: 1, cost: 100, purchased: 1, purchase_limit: 3 }, { id: 2, cost: 10, purchased: 0, purchase_limit: null }, { id: 3, cost: 50, purchased: 2, purchase_limit: 2 }];
  assert.equal(P.markedAA(rows, { 1: 5, 2: 3, 3: 1 }), 230, 'la fila 1 se topa en 2, la ilimitada cuenta, la llena no');
  assert.equal(P.pinnedLeft(rows, { 1: 1, 2: 1, 3: 1 }, { 1: 1 }), 1);
  assert.equal(P.pinnedLeft(rows, { 1: 1 }, { 1: 2 }), 0);
  assert.equal(P.weekIncome({ daily: { aa: 40, meta: { reward: 10 } }, weekly: { aa: 300, meta: null } }), 650);
  assert.equal(P.weekIncome({}), 0);
  assert.deepEqual(P.countObjectives({ objectives: [{ progress_current: 1, progress_complete: 1, acclaim: 20 }, { progress_current: 0, progress_complete: 1, acclaim: 5 }] }),
    { total: 2, done: 1, ready: 1, claimed: 0, meta: null, aa: 25, readyAA: 20 });
});

test('la cabecera pinta mi línea con Shiruvana.voice, una sola vez, y lee fijados del almacén si la Tienda no cargó', async () => {
  const x = load({ daily: { objectives: [{ progress_current: 1, progress_complete: 1, acclaim: 40 }] } });
  await flush();
  assert.match(x.nodes.wvxHead.innerHTML, /<div id="wvxVoice" class="wvx-voice" aria-live="polite"><\/div>/);
  const voices = x.calls.filter((k) => k[0] === 'voice');
  assert.deepEqual(J(voices[voices.length - 1]), ['voice', 'advierte', 'Tenés 1 objetivo listo para reclamar en el juego (+40 AA).']);
  assert.equal(x.nodes.wvxVoice.children.length, 1);
  const n = x.calls.filter((k) => k[0] === 'voice').length;
  x.V._tick(); x.V._tick();
  assert.equal(x.calls.filter((k) => k[0] === 'voice').length, n, 'el reloj no vuelve a anunciar la misma línea (aria-live)');
  assert.ok(x.calls.some((k) => k[0] === 'getPinned' && k[1] === 'KEY-…1111'), 'fp de la cuenta seleccionada');
  const y = load({ daily: { objectives: [{ progress_current: 1, progress_complete: 1, claimed: true }] } });
  await flush();
  assert.equal(y.calls.filter((k) => k[0] === 'voice').length, 0, 'todo al día: no hablo');
  assert.equal(y.nodes.wvxVoice.children.length, 0);
  const z = load({ rows: [{ id: 7, cost: 500, purchased: 0, purchase_limit: 2 }], pinned: { 7: 1 }, aa: 100,
    daily: { objectives: [{ progress_current: 0, progress_complete: 1, acclaim: 10 }] } });
  await flush();
  assert.match(z.calls.filter((k) => k[0] === 'voice').pop()[2], /^Para lo fijado te faltan 900 AA\. Si completás lo diario y lo semanal, llegás en unas 13 semanas\.$/);
});

// ------------------------------------------------------------------ contraste
const over = (col, b) => [0, 1, 2].map((i) => col[i] * col[3] + b[i] * (1 - col[3])).concat(1);
const CAM = [79, 195, 217];
function surfaces(eff) {
  const p = (k) => W.parseColor(eff[k]);
  const bg0 = over(p('--bg-0'), [255, 255, 255, 1]);
  const bg1 = over(p('--bg-1') || p('--bg-0'), bg0);
  return { bg0, bg1, hero: over(CAM.concat(0.10), bg1) };
}
// Colores de texto de todos los módulos: var(--x) o var(--x,#fallback) o hex suelto.
function textColors() {
  const out = new Map();
  MODULES.forEach((f) => read(f).replace(/(?:^|[{;'"])\s*color\s*:\s*([^;}'"!]+)/g, (m, v) => { out.set(v.trim(), f); return m; }));
  return out;
}
const VAR = /^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/;

test('los módulos de la Cámara solo usan colores de texto del theme o los fijos que cubre la guarda', () => {
  const extra = P.EXTRA;
  const bad = [];
  for (const [v, f] of textColors()) {
    const m = v.match(VAR);
    if (m) { if (!['--tx-1', '--tx-2', '--acc-1', '--color-amber', '--color-green'].concat(Object.keys(extra)).includes(m[1])) bad.push(f + ': ' + v); continue; }
    if (!Object.values(extra).includes(v)) bad.push(f + ': ' + v);
  }
  assert.deepEqual(bad, []);
  assert.match(P.CSS, /#wvPanel \.wvo-aa,#wvPanel \.wvd-aa,#wvPanel \.wvp-aa\{color:var\(--wvx-aa,#4FC3D9\)\}/);
  assert.match(P.CSS, /#wvPanel \.wvp-cnt em\{color:var\(--wvx-mark,#9B7BFF\)\}/);
  assert.doesNotMatch(MODULES.map(read).join('\n'), /color:var\((--tx-3|--muted)/, 'el gris tenue no se usa como texto en la Cámara');
});

test('en los 19 themes cada texto de la Cámara llega a 4.5:1 sobre --bg-0 y --bg-1 (y la cabecera), y el foco a 3:1', () => {
  assert.equal(THEMES.length, 19, THEMES.map((t) => t.id).join(', '));
  const fails = [];
  THEMES.forEach(({ id, tokens }) => {
    const eff = Object.assign({}, tokens, P.guardFixes(tokens, W.contrastFixes));
    const S = surfaces(eff);
    for (const [v] of textColors()) {
      const m = v.match(VAR);
      const name = m ? m[1] : Object.keys(P.EXTRA).find((k) => P.EXTRA[k] === v);
      const raw = eff[name] || (m && m[2]) || v;
      const col = W.parseColor(raw);
      assert.ok(col, id + ' ' + v + ' se puede leer: ' + raw);
      const on = name === '--tx-1' || name === '--tx-2' ? ['bg0', 'bg1', 'hero'] : ['bg0', 'bg1'];
      on.forEach((s) => { const r = W.contrast(over(col, S[s]), S[s]); if (r < 4.5) fails.push(id + ' ' + name + '/' + s + ' ' + r.toFixed(2)); });
    }
    ['bg0', 'bg1'].forEach((s) => { const r = W.contrast(over(W.parseColor(eff['--acc-1']), S[s]), S[s]); if (r < 3) fails.push(id + ' foco/' + s + ' ' + r.toFixed(2)); });
  });
  assert.deepEqual(fails, []);
});

test('la guarda se pone en #wvPanel al pintar, saca lo que ya no hace falta y sin la Bienvenida no inventa nada', async () => {
  const notion = THEMES.find((t) => t.id === 'notion').tokens;
  const x = load({ tokens: notion });
  await flush();
  const want = J(P.guardFixes(notion, W.contrastFixes));
  assert.ok(want['--color-green'] && want['--color-red'] && want['--wvx-aa'], 'un theme claro necesita correcciones');
  assert.deepEqual(J(x.props), want);
  const gato = THEMES.find((t) => t.id === 'gato').tokens;
  x.V._guard(gato);
  assert.deepEqual(J(x.props), J(P.guardFixes(gato, W.contrastFixes)), 'lo que ya no hace falta se quita');
  const z = load({ tokens: notion, noWelcome: true });
  await flush();
  assert.deepEqual(J(z.props), {});
});

// ------------------------------------------------------------------ teclado y lector
test('pestañas: cada una dice qué panel controla, y el panel visible dice qué pestaña lo nombra', async () => {
  assert.equal(P.panelFor('objectives', { tab: 'objectives', sub: 'weekly' }), 'wvTabWeekly');
  assert.equal(P.panelFor('objectives', { tab: 'shop', sub: null }), 'wvTabDaily');
  assert.equal(P.panelFor('shop', { tab: 'objectives', sub: 'daily' }), 'wvTabShop');
  assert.equal(P.panelFor('accounts', { tab: 'accounts', sub: 'purchases' }), 'wvPDPanel');
  assert.equal(P.panelFor('accounts', { tab: 'shop', sub: null }, 'purchases'), 'wvPDPanel');
  assert.equal(P.panelFor('accounts', { tab: 'shop', sub: null }, 'weekly'), 'wvObjectivesDashboardPanel');
  const x = load();
  await flush();
  const h = x.nodes.wvxHead.innerHTML;
  assert.match(h, /id="wvxTab-objectives" data-wvx-tab="objectives" aria-selected="true" aria-controls="wvTabDaily" tabindex="0"/);
  assert.match(h, /id="wvxTab-shop" data-wvx-tab="shop" aria-selected="false" aria-controls="wvTabShop" tabindex="-1"/);
  assert.match(h, /aria-controls="wvObjectivesDashboardPanel"/);
  assert.equal(x.nodes.wvTabDaily.attrs['aria-labelledby'], 'wvxTab-objectives');
});

test('teclado: foco visible en pestañas, paneles y controles de todos los módulos; nadie quita el contorno; movimiento reducido', () => {
  assert.match(P.CSS, /#wvPanel \[role=tab\]:focus-visible,#wvPanel \[role=tabpanel\]:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(P.CSS, /prefers-reduced-motion:reduce\)\{#wvPanel \*\{transition-duration:\.001ms!important;animation-duration:\.001ms!important/);
  const all = MODULES.map(read).join('\n');
  assert.doesNotMatch(all, /outline:\s*(none|0)\b/);
  ['wvo', 'wvs', 'wvd', 'wvp'].forEach((p) => assert.match(all, new RegExp('\\.' + p + '[\\w-]* [^{]*:focus-visible|\\.' + p + ' (button|select|input)[^{]*:focus-visible'), p));
  assert.doesNotMatch(SRC, /localStorage|fetch\(/);
  assert.ok(Buffer.byteLength(SRC) <= 40960, 'wv-view.js pesa ' + Buffer.byteLength(SRC));
});
