// Actividades renovado (BL-070, ACT-2): js/act-view.js. Corre con: node --test tests/*.test.cjs
// Lógica pura con el catálogo real y una prueba de humo con un DOM mínimo: la ruta #/account/activities,
// la API simulada, los relojes, los 4 indicadores, las pestañas, el PSNA reubicado y lo que no se pudo leer.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/act-view.js');
const MODEL = read('js/act-model.js');
const CAT = JSON.parse(read('assets/data/activities/catalog.json'));
const J = (x) => JSON.parse(JSON.stringify(x));

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'act-model.js' });
  vm.runInContext(SRC, sb, { filename: 'act-view.js' });
  return { V: sb.ActView._pure, M: sb.ActModel._pure };
}
const { V: P, M } = pure();

// Miércoles 2026-10-21 05:18 UTC: el PSNA cambia en 2 h 42 min; el reset semanal fue el lunes 19 a las 07:30.
const NOW = Date.UTC(2026, 9, 21, 5, 18);
const FRACS = [
  { id: 4210, name: 'Rocahonda de rango 1 del día' }, { id: 4211, name: 'Rocahonda de rango 2 del día' },
  { id: 4220, name: 'Océano Sólido de rango 1 del día' }, { id: 4230, name: 'Cenagal de rango 1 del día' },
  { id: 4300, name: 'Fractal recomendado: escala 16' }, { id: 4301, name: 'Fractal recomendado: escala 42' },
];
function sample(extra) {
  return Object.assign({
    loaded: true, hasToken: true, unread: [], items: {},
    crafting: ['lump_of_mithrilium', 'glob_of_elder_spirit_residue'],
    chars: [{ name: 'Lyra', level: 12, created: '2026-10-20T10:00:00Z' }, { name: 'Vieja', level: 80, created: '2019-01-01T00:00:00Z' }],
    fractals: FRACS, progress: [{ id: 4210, done: true }, { id: 4211, done: true }, { id: 4300, done: false }], stones: 3,
  }, extra || {});
}

test('el archivo entra en el presupuesto, va por el manifiesto después del modelo y del marco común, sin emojis', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'act-view.js pasa los 40 KB');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'sin emojis');
  assert.doesNotMatch(SRC, /localStorage|sessionStorage/, 'no guarda nada por su cuenta');
  assert.doesNotMatch(SRC, /Storage\.set|S\.set\(/, 'D6: no recuerda la pestaña, abre siempre en Hoy');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.includes('js/act-view.js') && man.includes('js/act-model.js'));
  assert.ok(man.indexOf('js/act-view.js') > man.indexOf('js/act-model.js'), 'después del modelo');
  assert.ok(man.indexOf('js/act-view.js') > man.indexOf('js/gn-frame.js'), 'después del marco común');
  assert.doesNotMatch(read('index.html'), /act-view\.js|act-model\.js/, 'no se cargan también desde index.html');
  Object.values(P.RARITY).forEach((r) => assert.ok(!new RegExp('color:' + r[1]).test(P.CSS), 'la rareza no es color de letra: ' + r[0]));
});

test('relojes: reset diario, cambio del PSNA y semanal, con los bordes', () => {
  const c = P.clocks(NOW);
  assert.equal(c.daily, '18 h 42 min');
  assert.equal(c.psna, '2 h 42 min');
  assert.equal(c.psnaMs, (2 * 60 + 42) * 60000);
  assert.equal(c.day, '2026-10-21');
  // CI corre en UTC: el próximo reset semanal es el lunes 26 a las 07:30.
  if (new Date(0).getTimezoneOffset() === 0) assert.equal(c.weekly, 'lunes 07:30');
  assert.equal(P.clocks(Date.UTC(2026, 9, 21, 8, 0)).psna, '24 h 0 min', 'justo en el cambio, el siguiente es mañana');
});

test('modelo: las 5 fabricaciones (con el cuarzo), fractales con progreso, llave de cualquier profesión y piedras', () => {
  const m = P.buildModel(sample(), CAT, {}, NOW);
  assert.equal(m.tab, 'hoy', 'D6: abre en Hoy');
  assert.equal(P.buildModel(sample(), CAT, { tab: 'semana' }, NOW).tab, 'semana');
  assert.equal(P.buildModel(sample(), CAT, { tab: 'otra' }, NOW).tab, 'hoy');
  assert.equal(m.crafting.total, 5);
  assert.ok(m.crafting.rows.some((r) => r.key === 'charged_quartz_crystal' && r.done === false), 'el cristal de cuarzo cargado que faltaba');
  assert.equal(m.crafting.done, 2);
  assert.equal(m.crafting.missing, 3);
  assert.deepEqual(J(m.fr.fractals.map((f) => f.name)), ['Rocahonda', 'Océano Sólido', 'Cenagal']);
  assert.equal(m.frProg.done, 2, 'solo los logros del día que están hechos');
  assert.equal(m.frProg.total, 6);
  assert.equal(m.key.state, 'probable');
  assert.deepEqual(J(m.key.chars.map((c) => c.name)), ['Lyra'], 'la vieja no cuenta: se creó antes del reset');
  assert.equal(m.stones, 3);
  assert.equal(P.buildModel(sample({ stones: 9 }), CAT, {}, NOW).stones, 5, 'nunca más de 5');
  assert.equal(P.buildModel(sample({ chars: [{ name: 'X', level: 9, created: '2026-10-20T10:00:00Z' }] }), CAT, {}, NOW).key.state, 'none');
});

test('mi línea: solo si hoy te falta algo; el PSNA solo si cambia pronto', () => {
  assert.equal(P.buildModel(sample(), CAT, {}, NOW).voice.text, 'Hoy te faltan 3 fabricaciones diarias. El PSNA cambia en 2 h 42 min: si vas a comprar, es ahora.');
  const later = Date.UTC(2026, 9, 21, 12, 0);
  assert.equal(P.buildModel(sample(), CAT, {}, later).voice.text, 'Hoy te faltan 3 fabricaciones diarias.');
  const four = sample({ crafting: CAT.dailyCrafting.items.slice(1).map((i) => i.key) });
  assert.equal(P.buildModel(four, CAT, {}, later).voice.text, 'Hoy te falta 1 fabricación diaria.');
  assert.equal(P.buildModel(sample({ crafting: CAT.dailyCrafting.items.map((i) => i.key) }), CAT, {}, NOW).voice, null, 'todo hecho: nada que decir');
  assert.equal(P.buildModel(sample({ crafting: null }), CAT, {}, NOW).voice, null, 'sin datos no digo nada');
  assert.equal(P.buildModel(sample({ loaded: false }), CAT, {}, NOW).voice, null);
});

test('estados honestos: lo que no se leyó dice «sin datos» y se nombra; nunca «te falta» ni 0', () => {
  const d = sample({ crafting: null, chars: null, progress: null, stones: null, unread: ['crafting', 'chars', 'progress'] });
  const m = P.buildModel(d, CAT, {}, NOW);
  const h = P.viewHTML(m);
  assert.match(h, /role="status">No pude leer la fabricación diaria, tus personajes y tu progreso de fractales\. Revisá que la API Key tenga los permisos de progreso y de personajes\./);
  assert.equal((h.match(/av-badge--pend">Te falta/g) || []).length, 0, 'sin lectura nunca «Te falta»');
  assert.equal((h.match(/av-badge--nd">Sin datos/g) || []).length, 5 + 1, 'las 5 fabricaciones y la llave');
  assert.equal((P.statsHTML(m).match(/<em>sin datos<\/em>/g) || []).length, 3, 'fabricación, llave y piedras');
  assert.match(P.statsHTML(m), /<b>—<\/b><em>Rocahonda, Océano Sólido, Cenagal<\/em>/, 'los fractales de hoy se ven aunque falte tu progreso');
  assert.doesNotMatch(P.statsHTML(m), /<b>0 <span>/);
  assert.equal(P.errorText(P.buildModel(sample({ unread: ['fractals'], fractals: null }), CAT, {}, NOW)), 'No pude leer los fractales del día de la API del juego.');
  assert.match(P.subtitle(P.buildModel({ hasToken: false, loaded: true }, CAT, {}, NOW)), /Cargá tu API Key/);
  const loading = P.statsHTML(P.buildModel({ hasToken: true, loaded: false }, CAT, {}, NOW));
  assert.equal((loading.match(/<em>leyendo…<\/em>/g) || []).length, 4);
});

test('vista: cabecera con los 3 relojes, 4 indicadores y pestañas accesibles con sus dos paneles', () => {
  const h = P.viewHTML(P.buildModel(sample(), CAT, { old: { psna: true, stones: true, nodes: true } }, NOW));
  assert.match(h, /<h2 id="avTitle">Actividades<\/h2>/);
  assert.match(h, /Reset diario <b id="avClkD">en 18 h 42 min<\/b>/);
  assert.match(h, /PSNA cambia <b id="avClkP">en 2 h 42 min<\/b>/);
  assert.match(h, /Semanal <b id="avClkW">/);
  assert.match(h, /<small>Fabricación diaria<\/small><b>2 <span>\/ 5<\/span><\/b>.*<em>te faltan 3<\/em>/);
  assert.match(h, /<small>Fractales del día<\/small><b>2 <span>\/ 6<\/span><\/b>.*<em>Rocahonda, Océano Sólido, Cenagal<\/em>/);
  assert.match(h, /<small>Llave semanal<\/small><b>Probable<\/b><em>Lyra, nivel 12, creado el /);
  assert.match(h, /<small>Piedras vetustas<\/small><b>3 <span>\/ 5<\/span><\/b>/);
  assert.match(h, /role="tablist" aria-label="Secciones de Actividades"/);
  assert.match(h, /id="avTab-hoy"[^>]*aria-selected="true"[^>]*aria-controls="avPanel-hoy" tabindex="0"/);
  assert.match(h, /id="avTab-semana"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(h, /id="avPanel-hoy" role="tabpanel" aria-labelledby="avTab-hoy">/);
  assert.match(h, /id="avPanel-semana" role="tabpanel" aria-labelledby="avTab-semana" hidden>/);
  assert.match(h, /Cristal de cuarzo cargado<span class="av-sr">, Raro<\/span><\/span><span class="av-badge av-badge--pend">Te falta/);
  assert.match(h, /Trozo de mithrilio<span class="av-sr">, Ascendido<\/span><\/span><span class="av-badge av-badge--ok">Hecho/);
  assert.match(h, /id="avPsnaSlot"/, 'el PSNA de siempre va en Hoy');
  assert.match(h, /id="avStonesSlot"/);
  assert.match(h, /id="avNodesSlot"/);
  assert.match(h, /con cualquier profesión/);
  assert.doesNotMatch(h, /Thief|Ladr[oó]n|Reclamada/, 'la llave ya no depende de la profesión ni se afirma sola');
  assert.doesNotMatch(h, /Solitary Throne|Refinamiento de Ecto|no disponible/i);
  const bare = P.viewHTML(P.buildModel(sample(), CAT, {}, NOW));
  assert.doesNotMatch(bare, /avPsnaSlot|avStonesSlot|avNodesSlot/, 'sin la pantalla de siempre no quedan huecos');
});

test('CSS: solo oculta lo viejo con la vista activa; foco visible, movimiento reducido y 44 px', () => {
  assert.match(P.CSS, /#activitiesPanel\.av-on>\.panel__title,#activitiesPanel\.av-on>\.panel__body\{display:none!important\}/);
  assert.match(P.CSS, /prefers-reduced-motion:reduce/);
  assert.match(P.CSS, /@media \(max-width:900px\)[\s\S]*min-height:44px/);
  assert.match(P.CSS, /\.av-chk li\{[^}]*min-height:44px/);
  assert.match(P.CSS, /focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.doesNotMatch(P.CSS, /(^|[;{])\s*color:var\(--(acc-1|av-mod|gn-mod|color-[\w-]+)\)/m, 'ni el acento, ni el color del módulo, ni el de estado como texto');
  // RUN-057: un tinte verde detrás de «Hecho» dejaba el texto en 4.10:1 en one-dark; el estado va en el texto y el borde.
  assert.doesNotMatch(P.CSS, /\.av-badge[^{]*\{[^}]*background/, 'las marcas de estado no tiñen el fondo del texto');
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
    const hero = G.over([0x3C, 0xC4, 0x8A, 0.12], tray);
    [...keys].forEach((k) => [['bg-0', bg0], ['bandeja', tray], ['tarjeta', card], ['cabecera', hero]].forEach(([n, s]) => {
      const r = G.contrast(G.over(G.parse(eff[k]), s), s);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
  });
  assert.deepEqual(fails, []);
});

// ------------------------------------------------------------------ humo con DOM mínimo
const DRAWN = ['avVoice', 'avStats', 'avPsnaSlot', 'avStonesSlot', 'avNodesSlot', 'avClkD', 'avClkP', 'avClkW'];
function fakeDom(withOld) {
  const els = {};
  function el(id, tag) {
    const n = {
      id, tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', textContent: '', hidden: false, listeners: {}, parentNode: null, clicks: 0,
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      removeAttribute(k) { delete this.attrs[k]; },
      appendChild(c) { this.children.push(c); c.parentNode = this; if (c.id) els[c.id] = c; return c; },
      insertBefore(c) { this.children.unshift(c); c.parentNode = this; if (c.id) els[c.id] = c; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      click() { this.clicks++; },
      contains() { return false; }, querySelector() { return null; },
    };
    if (id) els[id] = n;
    return n;
  }
  const panel = el('activitiesPanel', 'section');
  if (withOld) {
    const body = panel.appendChild(el(null, 'div'));
    body.appendChild(el('psnaPanel', 'section'));
    const stones = body.appendChild(el(null, 'SECTION'));
    stones.appendChild(el('pillLeivas', 'span'));
    body.appendChild(el('homeNodesContainer', 'div'));
    body.appendChild(el('actTabWeekly', 'button'));
  }
  const drawn = (id) => els.avRoot && els.avRoot.innerHTML.includes('id="' + id + '"');
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null,
    getElementById: (id) => els[id] || (DRAWN.includes(id) && drawn(id) ? el(id) : null),
    createElement: (t) => { const n = el(null, t); Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } }); return n; },
    addEventListener() {},
  };
  return { els, panel, document };
}

function boot(opts) {
  const D = fakeDom(opts.withOld);
  const store = {};
  const calls = [];
  const winL = {};
  const created = new Date(M.lastWeekly(Date.now()) + 1000).toISOString();
  const api = {
    '/v2/account/dailycrafting': ['lump_of_mithrilium'],
    '/v2/characters': [{ name: 'Lyra', level: 14, created, profession: 'Guardian', bags: [] }],
    '/v2/achievements/categories/88': { id: 88, achievements: FRACS.map((f) => ({ id: f.id, flags: [] })), tomorrow: [] },
    '/v2/achievements': FRACS,
    '/v2/account/achievements': [{ id: 4210, done: true }],
  };
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), setInterval: () => 1, clearInterval() {},
    location: { hash: opts.hash }, addEventListener: (t, f) => { (winL[t] = winL[t] || []).push(f); },
    fetch: (u) => {
      calls.push(u);
      if (u === 'assets/data/activities/catalog.json') return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(J(CAT)) });
      const p = u.replace('https://api.guildwars2.com', '').split('?')[0];
      if ((opts.fail || []).includes(p)) return Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({}) });
      if (opts.none404 && p === '/v2/account/achievements') return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(J(api[p])) });
    },
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected' }, get: (k) => (k === 'gn:account:selected' ? opts.token || null : null), set: (k, v) => { store[k] = JSON.stringify(v); } },
    GW2Api: { getItemsMany: (ids) => { calls.push('items:' + ids.join(',')); return Promise.resolve(ids.map((id) => ({ id, icon: 'https://render.guildwars2.com/file/' + id + '.png', rarity: 'Ascended' }))); } },
    Activities: { _debug: () => ({ token: opts.token ? 'x' : null, weeklyStones: 2 }) },
    Shiruvana: { voice: (m) => ({ text: m.text, children: [] }) },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'act-model.js' });
  vm.runInContext(SRC, sb, { filename: 'act-view.js' });
  return { sb, D, store, calls, winL };
}
const flush = () => new Promise((r) => setTimeout(r, 30));

test('humo: en #/account/activities toma el panel, lee la cuenta una vez por fuente y reubica el PSNA de siempre', async () => {
  const { sb, D, store, calls, winL } = boot({ hash: '#/account/activities', token: 'TOKEN-DE-PRUEBA', withOld: true });
  await flush();
  const host = D.els.avRoot;
  assert.ok(host, 'crea #avRoot dentro del panel');
  assert.ok(D.panel.classList.contains('av-on'));
  assert.equal(D.panel.getAttribute('aria-labelledby'), 'avTitle');
  const h = host.innerHTML;
  assert.match(h, /Lo que te falta hoy y esta semana\./);
  assert.match(h, /<small>Fabricación diaria<\/small><b>1 <span>\/ 5<\/span>/);
  assert.match(h, /<small>Fractales del día<\/small><b>1 <span>\/ 6<\/span>/);
  assert.match(h, /<b>Probable<\/b><em>Lyra, nivel 14/);
  assert.match(h, /<small>Piedras vetustas<\/small><b>2 <span>\/ 5<\/span>/, 'lo que marcaste con el −/+ de siempre');
  assert.match(h, /render\.guildwars2\.com\/file\/43772\.png/, 'íconos oficiales de /v2/items');
  const api = calls.filter((u) => u.startsWith('https://'));
  assert.equal(api.filter((u) => u.includes('/v2/characters')).length, 1, 'los personajes en un solo pedido');
  assert.ok(api.some((u) => u.includes('/v2/characters?ids=all&access_token=')));
  assert.ok(api.some((u) => u.includes('/v2/achievements?ids=4210,4211,4220,4230,4300,4301&lang=es') && !u.includes('access_token')), 'lo público sin la Key');
  assert.ok(api.some((u) => u.includes('/v2/account/achievements?ids=4210,')));
  assert.equal(D.els.avPsnaSlot.children[0], D.els.psnaPanel, 'el PSNA de siempre, en Hoy');
  assert.equal(D.els.avNodesSlot.children[0], D.els.homeNodesContainer);
  assert.equal(D.els.avStonesSlot.children[0].tagName, 'SECTION', 'la tarjeta de las piedras, entera');

  const click = (attrs) => host.listeners.click[0]({ target: { getAttribute: (k) => attrs[k] || null, parentNode: null } });
  click({ 'data-av-tab': 'semana' });
  assert.match(host.innerHTML, /id="avTab-semana"[^>]*aria-selected="true"/);
  assert.match(host.innerHTML, /id="avPanel-hoy" role="tabpanel" aria-labelledby="avTab-hoy" hidden>/);
  assert.equal(D.els.actTabWeekly.clicks, 1, 'Semana pide los nodos de casa a la pantalla de siempre');
  host.listeners.keydown[0]({ key: 'ArrowLeft', target: { getAttribute: (k) => (k === 'data-av-tab' ? 'semana' : null), parentNode: null }, preventDefault() {} });
  assert.equal(sb.ActView.getSnapshot().ui.tab, 'hoy');
  host.listeners.keydown[0]({ key: 'End', target: { getAttribute: (k) => (k === 'data-av-tab' ? 'hoy' : null), parentNode: null }, preventDefault() {} });
  assert.equal(sb.ActView.getSnapshot().ui.tab, 'semana');
  assert.deepEqual(Object.keys(store), [], 'D6: no guarda la pestaña ni nada');
  // D6: al salir y volver, abre otra vez en Hoy
  sb.location.hash = '#/account/raids'; winL.hashchange.forEach((f) => f());
  sb.location.hash = '#/account/activities'; winL.hashchange.forEach((f) => f());
  await flush();
  assert.equal(sb.ActView.getSnapshot().ui.tab, 'hoy');

  calls.length = 0;
  click({ 'data-av': 'refresh' });
  await flush();
  assert.equal(calls.filter((u) => u.includes('/v2/characters')).length, 1, 'Actualizar vuelve a pedir, sin recargar la página');
});

test('humo: si una lectura falla, lo demás se ve y el error se dice; sin progreso de fractales no es un error', async () => {
  const a = boot({ hash: '#/account/activities', token: 'T', fail: ['/v2/characters'], none404: true });
  await flush();
  const h = a.D.els.avRoot.innerHTML;
  assert.match(h, /No pude leer tus personajes\. Revisá que la API Key tenga los permisos de progreso y de personajes\./);
  assert.match(h, /<small>Fractales del día<\/small><b>0 <span>\/ 6<\/span>/, 'un 404 de la API es «nada hecho hoy»');
  assert.match(h, /<small>Fabricación diaria<\/small><b>1 <span>\/ 5<\/span>/);
});

test('humo: sin Key no pide nada a la cuenta y lo dice; fuera de su ruta no dibuja', async () => {
  const a = boot({ hash: '#/account/activities', token: null });
  await flush();
  assert.match(a.D.els.avRoot.innerHTML, /Cargá tu API Key/);
  assert.equal(a.calls.filter((u) => u.includes('access_token')).length, 0, 'sin Key no hay pedidos a la cuenta');
  const b = boot({ hash: '#/account/raids', token: 'T' });
  await flush();
  assert.equal(b.D.els.avRoot, undefined);
});
