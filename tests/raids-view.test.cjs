// Raids renovado (BL-070, RAI-2): js/raids-view.js. Corre con: node --test tests/*.test.cjs
// Lógica pura con el catálogo real (assets/data/raids/catalog.json) y una prueba de humo con un
// DOM mínimo: la ruta #/account/raids, la API simulada, las marcas a mano y #/account/strikes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'js', 'raids-view.js');
const SRC = fs.readFileSync(FILE, 'utf8');
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'raids', 'catalog.json'), 'utf8'));
const MON = Date.UTC(2026, 9, 19, 12, 0); // lunes 19/10/2026 12:00 UTC

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'raids-view.js' });
  return sb.RaidsView._pure;
}
const P = pure();

// Datos de ejemplo: Greer y Ura pendientes en Monte Balrior, Decima hecha; ala 1 completa.
function sample(extra) {
  return Object.assign({
    loaded: true, hasToken: true, fp: 'kx', errors: [],
    raids: ['vale_guardian', 'spirit_woods', 'gorseval', 'sabetha', 'camp', 'decima'],
    achs: [{ id: 9125, bits: [0, 2, 13], current: 3, max: 13, done: false }],
    wallet: [{ id: 70, value: 214 }, { id: 28, value: 900 }],
    marks: [],
  }, extra || {});
}

test('el archivo entra en el presupuesto, no trae videos de relleno ni emojis ni colores fijos del legado', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'raids-view.js pasa los 40 KB');
  assert.doesNotMatch(SRC, /dQw4w9WgXcQ|youtube/i);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u, 'sin emojis');
  assert.doesNotMatch(SRC, /#ffd36b/i);
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).modules.map((m) => m.src);
  assert.ok(man.includes('js/raids-view.js'), 'raids-view.js se carga por el manifiesto');
  assert.ok(man.indexOf('js/raids-view.js') > man.indexOf('js/gn-frame.js'), 'después del marco común');
});

test('reset semanal: lunes 07:30 UTC', () => {
  assert.equal(P.weekStart(Date.UTC(2026, 9, 19, 7, 30)), Date.UTC(2026, 9, 19, 7, 30));
  assert.equal(P.weekStart(Date.UTC(2026, 9, 19, 7, 29)), Date.UTC(2026, 9, 12, 7, 30));
  assert.equal(P.weekStart(Date.UTC(2026, 9, 25, 23, 0)), Date.UTC(2026, 9, 19, 7, 30));
  assert.equal(P.nextReset(MON), Date.UTC(2026, 9, 26, 7, 30));
  assert.equal(P.countdown(2 * 864e5 + 3 * 36e5 + 5 * 6e4), 'en 2 d 3 h');
  assert.equal(P.countdown(3 * 36e5 + 5 * 6e4), 'en 3 h 05 min');
});

test('estado de cada encuentro: alas por /v2/account/raids, encuentros por los objetivos del logro 9125, el resto a mano', () => {
  const byId = Object.fromEntries(CAT.encounters.map((e) => [e.id, e]));
  const d = sample({ marks: ['forging_steel'] });
  assert.equal(P.stateOf(byId.decima, d), 'done');
  assert.equal(P.stateOf(byId.greer, d), 'todo');
  assert.equal(P.stateOf(byId.shiverpeaks_pass, d), 'done');      // bit 0
  assert.equal(P.stateOf(byId.voice_claw, d), 'done');            // bit 2
  assert.equal(P.stateOf(byId.guardians_glade, d), 'done');       // bit 13
  assert.equal(P.stateOf(byId.fraenir, d), 'todo');               // bit 1 no está
  assert.equal(P.stateOf(byId.forging_steel, d), 'hand');
  assert.equal(P.stateOf(byId.nexus_of_eternity, d), 'na');
  assert.equal(P.stateOf(byId.fraenir, sample({ achs: [] })), 'todo', 'sin registro esta semana: pendiente');
  assert.equal(P.stateOf(byId.fraenir, sample({ achs: null })), 'unknown', 'no se pudo leer: sin datos, nunca «Pendiente» falso');
  assert.equal(P.stateOf(byId.greer, sample({ raids: null })), 'unknown');
  assert.equal(P.stateOf(byId.fraenir, sample({ achs: [{ id: 9125, done: true }] })), 'unknown', 'hecho sin objetivos: no invento cuáles');
  assert.equal(P.stateOf(byId.greer, { hasToken: false }), 'nokey');
});

test('modelo: totales, conocimiento legendario y fragmentos por cobrar con el catálogo real', () => {
  const m = P.buildModel(CAT, sample(), {});
  assert.equal(m.stats.wTotal, 30);
  assert.equal(m.stats.wDone, 6);
  assert.equal(m.stats.eTotal, 16);
  assert.equal(m.stats.eDone, 3);
  assert.equal(m.li, 214);
  const pend = CAT.encounters.filter((e) => P.stateOf(e, sample()) === 'todo' || P.stateOf(e, sample()) === 'na');
  assert.equal(m.stats.liPending, pend.reduce((n, e) => n + e.li, 0));
  assert.equal(m.stats.magPending, pend.filter((e) => e.currency === 'magnetite' && typeof e.amount === 'number').reduce((n, e) => n + e.amount, 0));
  assert.equal(m.stats.gaePending, 14, 'Nexo de la Eternidad sin marcar: 14 cristales');
  assert.equal(m.groups.length, 8, 'pestaña Alas: las 8 alas');
  assert.deepEqual([...m.exps], ['hot', 'pof', 'jw']);
});

test('pestaña Encuentros, filtros y expansión', () => {
  const enc = P.buildModel(CAT, sample(), { tab: 'enc' });
  assert.equal(enc.groups.length, 5);
  assert.deepEqual([...enc.exps], ['core', 'ibs', 'eod', 'soto', 'voe']);
  const todo = P.buildModel(CAT, sample(), { tab: 'wings', filter: 'todo' });
  assert.ok(!todo.groups.some((G) => G.g.id === 'spirit_vale'), 'el ala 1 completa no aparece en «Me faltan»');
  assert.ok(todo.groups.every((G) => G.rows.every((r) => r.s === 'todo' || r.s === 'na')));
  const cm = P.buildModel(CAT, sample(), { tab: 'enc', filter: 'cm' });
  assert.ok(cm.groups.every((G) => G.rows.every((r) => r.e.cm)));
  assert.ok(!cm.groups.some((G) => G.g.id === 'ibs'), 'Sangre y Hielo no tiene modo desafío');
  const voe = P.buildModel(CAT, sample(), { tab: 'enc', exp: 'voe' });
  assert.deepEqual([...voe.groups.map((G) => G.g.id)], ['voe']);
  const bad = P.buildModel(CAT, sample(), { tab: 'enc', exp: 'hot' });
  assert.equal(bad.exp, 'all', 'una expansión que no está en la pestaña vuelve a «Todas»');
});

test('mi línea: el ala empezada más cerca de terminarse, con lo que da', () => {
  const m = P.buildModel(CAT, sample(), {});
  assert.ok(m.voice);
  assert.equal(m.voice.text, 'Te quedan 2 jefes de Monte Balrior: Greer y Ura. Son 2 de conocimiento legendario y 30 fragmentos antes del reset del lunes.');
  assert.equal(P.buildModel(CAT, sample({ loaded: false }), {}).voice, null);
  assert.equal(P.buildModel(CAT, { hasToken: false, loaded: true }, {}).voice, null);
  const all = CAT.encounters.filter((e) => e.track.by === 'account_raids').map((e) => e.id);
  assert.match(P.buildModel(CAT, sample({ raids: all }), {}).voice.text, /Hiciste las 8 alas/);
  assert.equal(P.buildModel(CAT, sample({ raids: [] }), {}).voice, null, 'sin ninguna ala empezada no digo nada');
  const onlyEvent = P.buildModel(CAT, sample({ raids: ['vale_guardian', 'gorseval', 'sabetha'] }), {});
  assert.equal(onlyEvent.voice, null, 'si en un ala solo falta un evento, no lo recomiendo como jefe');
});

test('marcas a mano: por cuenta, por semana, sin guardar la Key', () => {
  const fp = P.fingerprint('ABCDEF-1234-SECRET-KEY');
  assert.match(fp, /^k[0-9a-z]+$/);
  assert.ok(!fp.includes('ABCDEF') && !fp.includes('SECRET'));
  assert.notEqual(fp, P.fingerprint('otra-key'));
  const arr = (x) => JSON.parse(JSON.stringify(x));
  let s = P.toggleMark(null, fp, 'forging_steel', MON);
  assert.deepEqual(arr(P.marksFor(s, fp, MON)), ['forging_steel']);
  assert.deepEqual(arr(P.marksFor(s, 'kotra', MON)), [], 'otra cuenta no ve mis marcas');
  assert.deepEqual(arr(P.marksFor(s, fp, MON + 7 * 864e5)), [], 'después del reset la marca no vale');
  s = P.toggleMark(s, fp, 'forging_steel', MON);
  assert.deepEqual(arr(P.marksFor(s, fp, MON)), []);
  assert.equal(Object.keys(s.acc).length, 0);
  const old = P.toggleMark(null, fp, 'nexus_of_eternity', MON - 7 * 864e5);
  assert.deepEqual(arr(P.toggleMark(old, fp, 'forging_steel', MON).acc[fp]), ['forging_steel'], 'la semana vieja se descarta al marcar');
});

test('vista: íconos oficiales, estados honestos, pestañas accesibles y botón solo donde se marca a mano', () => {
  const m = P.buildModel(CAT, sample(), { tab: 'enc' });
  const h = P.viewHTML(m, MON);
  assert.match(h, /role="tablist"/);
  assert.match(h, /id="rvTab-enc"[^>]*aria-selected="true"/);
  assert.match(h, /1A27945E0DFC32FBA7FBD2E3EF2B359EBFCBF4EA/, 'miniatura oficial de Kela');
  assert.match(h, /6D33B7387BAF2E2CC9B5D37D1D1B01246AB6FA22/, 'ícono oficial del conocimiento legendario');
  assert.match(h, /0C05B2E6F012B209C3095CDD6AF5F84B0BA9CC3A/, 'ícono oficial del cristal de Gaets actual');
  assert.match(h, /La API no lo informa/);
  assert.equal((h.match(/data-rv-mark=/g) || []).length, 2, 'solo Forjando acero y Nexo de la Eternidad');
  assert.match(h, /aria-label="Dificultad 5 de 5"/);
  assert.match(h, /Reset semanal <b>lun 07:30 UTC · en 6 d 19 h/);
  assert.doesNotMatch(h, /Pendiente[^<]*<\/span><button/, 'nada pendiente tiene botón');
  const w = P.viewHTML(P.buildModel(CAT, sample(), {}), MON);
  assert.match(w, /Ala 8 · Monte Balrior/);
  assert.match(w, /rv-mini--ev/, 'los eventos sin miniatura propia llevan la marca de evento');
  assert.match(w, /✓ Hecho/);
  const err = P.viewHTML(P.buildModel(CAT, sample({ achs: null, errors: ['No pude leer tus encuentros.'] }), { tab: 'enc' }), MON);
  assert.match(err, /Sin datos/);
  assert.match(err, /role="status">No pude leer tus encuentros\./);
  assert.match(P.subtitle(P.buildModel(CAT, { hasToken: false, loaded: true }, {})), /Cargá tu API Key/);
});

test('el CSS solo oculta lo viejo cuando la vista está activa y respeta movimiento reducido y 44 px', () => {
  assert.match(P.CSS, /#raidTrackerPanel\.rv-on>\.panel__title,#raidTrackerPanel\.rv-on>\.panel__body\{display:none!important\}/);
  assert.match(P.CSS, /prefers-reduced-motion:reduce/);
  assert.match(P.CSS, /min-height:44px/);
  assert.match(P.CSS, /focus-visible/);
});

// ------------------------------------------------------------------ humo con DOM mínimo
function fakeDom() {
  const els = {};
  function el(id, tag) {
    const n = {
      id, tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', textContent: '', hidden: false, listeners: {},
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      style: { setProperty() {}, removeProperty() {} },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') { this.id = v; els[v] = this; } },
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
  const panel = el('raidTrackerPanel', 'section');
  const strikes = el('strikeTrackerPanel', 'section');
  strikes.attrs.hidden = '';
  const docListeners = {};
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null,
    // El DOM mínimo no parsea innerHTML: #rvVoice existe si la vista lo dibujó.
    getElementById: (id) => els[id] || (id === 'rvVoice' && els.rvRoot && els.rvRoot.innerHTML.includes('id="rvVoice"') ? el('rvVoice') : null),
    createElement: (t) => { const n = el(null, t); Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } }); return n; },
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); },
  };
  return { els, panel, strikes, document, docListeners };
}

function boot(opts) {
  const D = fakeDom();
  const store = {};
  const calls = [];
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), setInterval: () => 1,
    location: { hash: opts.hash, href: 'https://dev/#' + opts.hash.slice(1), replace(u) { this.hash = '#' + u.split('#')[1]; this.replaced = u; } },
    addEventListener() {},
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(CAT))) }),
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected' },
      get: (k) => (k in store ? JSON.parse(store[k]) : (k === 'gn:account:selected' ? opts.token || null : null)),
      getRaw: (k) => (k in store ? store[k] : null),
      set: (k, v) => { store[k] = typeof v === 'string' ? v : JSON.stringify(v); } },
    GW2Api: {
      getAccountRaids: (t, o) => { calls.push(['raids', o.nocache]); return opts.raidsFail ? Promise.reject(new Error('401')) : Promise.resolve(sample().raids); },
      getAccountAchievements: (t, o) => { calls.push(['achs', o.nocache]); return Promise.resolve(sample().achs); },
      getAccountWallet: (t, o) => { calls.push(['wallet', o.nocache]); return Promise.resolve(sample().wallet); },
    },
    Shiruvana: { voice: (m) => ({ id: null, text: m.text, basis: m.basis, children: [] }) },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'raids-view.js' });
  return { sb, D, store, calls };
}

const flush = () => new Promise((r) => setTimeout(r, 20));

test('humo: en #/account/raids toma el panel, lee la semana y muestra la vista nueva', async () => {
  const { sb, D, store, calls } = boot({ hash: '#/account/raids', token: 'TOKEN-DE-PRUEBA' });
  await flush();
  const host = D.els.rvRoot;
  assert.ok(host, 'crea #rvRoot dentro del panel');
  assert.ok(D.panel.classList.contains('rv-on'));
  assert.equal(D.panel.getAttribute('aria-labelledby'), 'rvTitle');
  assert.match(host.innerHTML, /Esta semana: 6 de 30 encuentros de alas hechos\./);
  assert.match(host.innerHTML, /Ala 1 · Valle Espiritual/);
  assert.equal(store['gn:raids:strike:view'], 'raids', 'el interruptor viejo queda fijo en Raids');
  assert.deepEqual(calls.map((c) => c[0]).sort(), ['achs', 'raids', 'wallet']);
  assert.ok(calls.every((c) => c[1] === false), 'la primera carga usa la caché');
  assert.ok(D.els.rvVoice.children.length === 1 && /Greer y Ura/.test(D.els.rvVoice.children[0].text), 'mi línea aparece');
  assert.equal(D.els.rvVoice.children[0].basis, 'tus raids de esta semana (API oficial) · en este navegador', 'SHV-5a: sin mi globo también digo de dónde lo sé');
  assert.ok(!Object.keys(store).some((k) => store[k].includes('TOKEN-DE-PRUEBA')), 'la Key nunca se guarda');

  // marcar Forjando acero, en la pestaña Encuentros
  const click = (attrs) => host.listeners.click[0]({ target: { getAttribute: (k) => attrs[k] || null, parentNode: null } });
  click({ 'data-rv-tab': 'enc' });
  assert.match(host.innerHTML, /id="rvTab-enc"[^>]*aria-selected="true"/);
  click({ 'data-rv-mark': 'forging_steel' });
  assert.match(host.innerHTML, /✓ Marcado por vos/);
  assert.ok(store['gn:raids:marks'] && JSON.parse(store['gn:raids:marks']).week);
  click({ 'data-rv-mark': 'forging_steel' });
  assert.doesNotMatch(host.innerHTML, /✓ Marcado por vos/);

  // Actualizar pide sin caché
  calls.length = 0;
  click({ 'data-rv': 'refresh' });
  await flush();
  assert.ok(calls.length === 3 && calls.every((c) => c[1] === true));
  assert.equal(sb.RaidsView.getSnapshot().ui.tab, 'enc');
});

test('humo: si falla una lectura, lo demás se ve y el error se dice', async () => {
  const { D } = boot({ hash: '#/account/raids', token: 'T', raidsFail: true });
  await flush();
  const h = D.els.rvRoot.innerHTML;
  assert.match(h, /No pude leer tus alas\. Revisá que la API Key tenga permiso de progreso\./);
  assert.match(h, /Sin datos/);
  assert.match(h, /Ala 8 · Monte Balrior/);
});

test('humo: sin Key muestra el catálogo y pide la Key; #/account/strikes lleva a Encuentros', async () => {
  const a = boot({ hash: '#/account/raids', token: null });
  await flush();
  assert.match(a.D.els.rvRoot.innerHTML, /Cargá tu API Key/);
  assert.equal(a.calls.length, 0, 'sin Key no hay pedidos');
  const b = boot({ hash: '#/account/strikes', token: 'T' });
  await flush();
  assert.equal(b.sb.location.hash, '#/account/raids');
  assert.match(b.sb.location.replaced, /#\/account\/raids$/);
  assert.equal(b.sb.RaidsView.getSnapshot().ui.tab, 'enc');
  assert.equal(b.D.els.rvRoot, undefined, 'no dibuja hasta que el router muestre Raids');
});
