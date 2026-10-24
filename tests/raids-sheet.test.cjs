// Ficha de cada encuentro de Raids (BL-070, RAI-3): js/raids-sheet.js y assets/data/raids/rewards.json.
// Corre con: node --test tests/*.test.cjs. Lógica pura con los datos reales y una prueba de humo con
// raids-view.js y raids-sheet.js juntos en un DOM mínimo: abrir desde la fila, Escape, volver.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'raids-sheet.js'), 'utf8');
const VIEW = fs.readFileSync(path.join(ROOT, 'js', 'raids-view.js'), 'utf8');
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'raids', 'catalog.json'), 'utf8'));
const RW = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'raids', 'rewards.json'), 'utf8'));
const byId = Object.fromEntries(CAT.encounters.map((e) => [e.id, e]));
const groupOf = (e) => CAT.groups.find((g) => g.id === e.group);

function pure() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(VIEW, sb, { filename: 'raids-view.js' });
  vm.runInContext(SRC, sb, { filename: 'raids-sheet.js' });
  return { S: sb.RaidsSheet._pure, V: sb.RaidsView._pure };
}
const { S, V } = pure();
const data = (x) => Object.assign({ loaded: true, hasToken: true, raids: ['decima'], achs: [], wallet: [], marks: [] }, x || {});
const model = (id, d) => S.sheetModel(CAT, RW, id, d || data(), V.stateOf);

test('el archivo entra en el presupuesto y se carga por el manifiesto después de raids-view.js', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, 'raids-sheet.js pasa los 40 KB');
  assert.ok(Buffer.byteLength(VIEW) <= 40 * 1024, 'raids-view.js pasa los 40 KB');
  assert.doesNotMatch(SRC, /dQw4w9WgXcQ|youtube/i);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u, 'sin emojis');
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).modules;
  const src = man.map((m) => m.src);
  assert.ok(src.indexOf('js/raids-sheet.js') > src.indexOf('js/raids-view.js'), 'la ficha va después de la vista');
  assert.equal(man.find((m) => m.src === 'js/raids-view.js').v, '1.1.0');
});

test('recompensas: cada encuentro del catálogo tiene su entrada y cada cofre existe', () => {
  assert.equal(RW.verified, '2026-10-24');
  assert.deepEqual(Object.keys(RW.encounters).sort(), CAT.encounters.map((e) => e.id).sort());
  for (const [id, r] of Object.entries(RW.encounters)) {
    const e = byId[id];
    if (r.coffer !== null) assert.ok(RW.coffers[r.coffer], id + ': cofre ' + r.coffer);
    if (r.cm) {
      assert.ok(RW.magnificent[r.cm], id + ': cofre magnífico');
      assert.ok(e.cm, id + ': cofre magnífico solo con modo desafío');
      assert.ok(!['hot', 'pof'].includes(groupOf(e).expansion), id + ': HoT y PoF no dan cofre magnífico');
    }
    // Conocimiento legendario: si el encuentro lo da y tiene cofre, el cofre lo garantiza.
    if (r.coffer && e.li) assert.ok(RW.coffers[r.coffer].guaranteed.some((g) => g.cur === 'li'), id + ': conocimiento en el cofre');
    if (!e.li) assert.equal(r.coffer, null, id + ': sin conocimiento legendario no hay cofre semanal');
  }
  const all = Object.values(RW.coffers).concat(Object.values(RW.magnificent));
  for (const c of all) {
    assert.match(c.page, /^https:\/\/wiki\.guildwars2\.com\/wiki\//, c.name + ': fuente en la wiki oficial');
    assert.ok(Array.isArray(c.ids), c.name);
    if (c.unverified) continue;
    for (const t of c.tiers) {
      assert.ok(RW.rarity[t.r], c.name + ': rareza ' + t.r);
      for (const x of t.items) if (typeof x === 'object') assert.ok(x.count > 0 && x.n, c.name + ': familia con cantidad');
    }
  }
  for (const c of Object.values(RW.magnificent)) {
    if (!c.unverified) assert.ok(!c.guaranteed.some((g) => g.cur === 'li'), c.name + ': desde la unificación no da conocimiento');
  }
  assert.equal(Object.values(RW.encounters).filter((r) => r.coffer === 'ibs').length, 7, 'los 7 encuentros de The Icebrood Saga comparten cofre');
});

test('modelo de la ficha: lugar en el ala, anterior y siguiente, estado y moneda', () => {
  const m = model('greer');
  assert.equal(m.idx, 2);
  assert.equal(m.n, 4);
  assert.equal(m.prev.id, 'camp');
  assert.equal(m.next.id, 'decima');
  assert.equal(m.state, 'todo');
  assert.equal(m.cap, 800);
  assert.equal(m.cof.name, "Greer's Coffer");
  assert.equal(m.mag.name, "Greer's Magnificent Coffer");
  assert.equal(model('decima').state, 'done');
  assert.equal(model('vale_guardian').prev, null);
  const k = model('guardians_glade');
  assert.equal(k.cur, 'gaeting');
  assert.equal(k.cap, 150);
  assert.equal(S.sheetModel(CAT, RW, 'no-existe', data(), V.stateOf), null);
  assert.equal(S.shownId({ ids: [103783, 104306] }), 104306, 'la variante posterior a la unificación');
  assert.equal(S.itemText({ n: 'Sea-Glass Wave', count: 17, kind: 'armas' }), 'Sea-Glass Wave (17 armas)');
});

test('ficha de Greer: lo garantizado, lo que te puede tocar por rareza y el modo desafío', () => {
  const items = { 104306: { name: 'Cofre de Greer', icon: 'https://render.guildwars2.com/file/X/1.png' } };
  const h = S.sheetHTML(model('greer'), items);
  assert.match(h, /← Volver a Raids/);
  assert.match(h, /Ala 8 · Monte Balrior · encuentro 2 de 4/);
  assert.match(h, /lang="en">Greer, the Blightbringer</);
  assert.match(h, /6D33B7387BAF2E2CC9B5D37D1D1B01246AB6FA22/, 'ícono oficial del conocimiento legendario');
  assert.match(h, /tope semanal de 800 para todas las raids/);
  assert.match(h, /Cofre de Greer/, 'nombre en español de la API');
  assert.match(h, /render\.guildwars2\.com\/file\/X\/1\.png/, 'ícono oficial del cofre');
  assert.match(h, /Greer&#39;s Token[\s\S]*1–5/);
  assert.match(h, /Mini Rot Strider \(o 40 fragmentos de magnetita si ya la tenés\) <em>Poco común/);
  assert.match(h, /Sea-Glass Wave \(17 armas\) <em>Raro/);
  assert.match(h, /Chunk of Pulsing Bloodstone <em>Muy raro/);
  assert.match(h, /Modo desafío <small>extra, 1 vez por semana/);
  assert.match(h, /<b class="rs-q">\+10<\/b>/);
  assert.match(h, /Greer&#39;s Magnificent Coffer/, 'sin ícono de la API todavía, el nombre de la wiki');
  assert.match(h, /href="https:\/\/wiki\.guildwars2\.com\/wiki\/Greer,_the_Blightbringer"[^>]*>Abrir en la wiki ↗/);
  assert.match(h, /data-rs-go="decima">Siguiente: Decima/);
  assert.match(h, /Pendiente esta semana/);
  assert.match(h, /consultada el 2026-10-24/);
  assert.doesNotMatch(h, /Legendary Insight/, 'el conocimiento legendario va una sola vez, arriba y con su ícono');
  assert.equal((h.match(/>Conocimiento legendario</g) || []).length, 1);
});

test('fichas que no son iguales: HoT con modo desafío, eventos, el campamento y lo que no pude verificar', () => {
  const kc = S.sheetHTML(model('keep_construct'), {});
  assert.match(kc, /Heart of Thorns y Path of Fire no dan cofre magnífico/);
  assert.match(kc, /Keep Construct Rubble/);
  assert.doesNotMatch(kc, /Magnificent/);
  const sw = S.sheetHTML(model('spirit_woods'), {});
  assert.match(sw, /Evento sin cofre propio/);
  assert.match(sw, /al completarlo/);
  assert.doesNotMatch(sw, /Lo que te puede tocar/);
  assert.match(sw, /rs-mini--ev/);
  const camp = S.sheetHTML(model('camp'), {});
  assert.match(camp, /Janthiri Gear Box/);
  assert.match(camp, /Magi&#39;s Full Moon \(17 armas\)/);
  assert.doesNotMatch(camp, /Conocimiento legendario/, 'el campamento no da conocimiento');
  const ht = S.sheetHTML(model('harvest_temple'), {});
  assert.match(ht, /Todavía no pude verificar qué trae este cofre/);
  assert.match(ht, /Endless Dragonvoid Combat Tonic/);
  const fs_ = S.sheetHTML(model('forging_steel'), {});
  assert.match(fs_, /<b class="rs-q">19–44<\/b>/);
  assert.match(fs_, /Icebrood Saga Raid Encounter Coffer/);
  assert.match(fs_, /Buscar en la wiki ↗/, 'sin página verificada: la búsqueda de la wiki');
  assert.match(S.sheetHTML(model('nexus_of_eternity'), {}), /wiki\.wishingstar\.top/, 'la copia de la wiki se dice');
  assert.match(S.sheetHTML(model('xunlai_jade_junkyard', data({ hasToken: false })), {}), /Endless Aetherblade Mutineer Combat Tonic/);
});

test('mi línea en la ficha: solo hechos del catálogo y de tu semana', () => {
  assert.equal(S.voiceOf(model('greer')).text, 'Esta semana todavía te esperan 1 de conocimiento legendario y 16 fragmentos de magnetita, y 10 más si lo hacés en modo desafío.');
  assert.equal(S.voiceOf(model('decima')).kind, 'success');
  assert.match(S.voiceOf(model('nexus_of_eternity')).text, /14 cristales de Gaets/);
  assert.equal(S.voiceOf(model('gate')), null, 'un evento que no da nada no tiene línea');
  assert.equal(S.voiceOf(model('greer', { hasToken: false })), null, 'sin Key no hablo de tu semana');
  assert.equal(S.voiceOf(model('greer', data({ raids: null }))), null, 'sin datos no invento');
});

test('el CSS respeta movimiento reducido, foco visible y 44 px en el celular', () => {
  assert.match(S.CSS, /prefers-reduced-motion:reduce/);
  assert.match(S.CSS, /focus-visible/);
  assert.match(S.CSS, /max-width:720px[\s\S]*min-height:44px/);
  assert.match(S.CSS, /#rsRoot\[hidden\]\{display:none!important\}/);
});

// ------------------------------------------------------------------ humo con DOM mínimo
function fakeDom() {
  const els = {};
  function el(id, tag) {
    const n = {
      id, tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', textContent: '', listeners: {}, focused: 0,
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      removeAttribute(k) { delete this.attrs[k]; },
      appendChild(c) { this.children.push(c); if (c.id) els[c.id] = c; return c; },
      insertBefore(c) { this.children.unshift(c); if (c.id) els[c.id] = c; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      contains() { return false; }, focus() { this.focused++; doc.activeElement = this; },
      querySelector(sel) { const m = /data-rv-open="([^"]+)"/.exec(sel); return m && this.innerHTML.includes(sel.slice(1, -1)) ? rows[m[1]] || (rows[m[1]] = el(null, 'button')) : null; },
    };
    if (id) els[id] = n;
    return n;
  }
  const rows = {};
  const panel = el('raidTrackerPanel', 'section');
  el('strikeTrackerPanel', 'section').attrs.hidden = '';
  const docListeners = {};
  const lazy = { rvVoice: 'rvRoot', rsVoice: 'rsRoot', rsTitle: 'rsRoot' };
  const doc = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null,
    getElementById: (id) => els[id] || (lazy[id] && els[lazy[id]] && els[lazy[id]].innerHTML.includes('id="' + id + '"') ? el(id) : null),
    createElement: (t) => { const n = el(null, t); Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } }); return n; },
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); },
  };
  return { els, panel, doc, docListeners, rows };
}

function boot() {
  const D = fakeDom();
  const winListeners = {};
  const itemCalls = [];
  const scrolls = [];
  const sb = {
    console: { info() {}, warn() {} }, document: D.doc, setTimeout: (f) => f(), setInterval: () => 1,
    location: { hash: '#/account/raids', href: 'https://dev/#/account/raids', replace() {} },
    addEventListener: (t, f) => { (winListeners[t] = winListeners[t] || []).push(f); },
    scrollY: 640, scrollTo: (x, y) => scrolls.push(y),
    fetch: (u) => Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(/rewards/.test(u) ? RW : CAT))) }),
    Storage: { STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected' }, get: (k) => (k === 'gn:account:selected' ? 'TOKEN' : null), getRaw: () => 'raids', set() {} },
    GW2Api: {
      getAccountRaids: () => Promise.resolve(['decima']),
      getAccountAchievements: () => Promise.resolve([]),
      getAccountWallet: () => Promise.resolve([{ id: 70, value: 3 }]),
      getItemsMany: (ids) => { itemCalls.push(JSON.parse(JSON.stringify(ids))); return Promise.resolve(ids.map((id) => ({ id, name: 'Cofre ' + id, icon: 'https://render.guildwars2.com/file/I/' + id + '.png' }))); },
    },
    Shiruvana: { voice: (m) => ({ text: m.text, kind: m.kind }) },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(VIEW, sb, { filename: 'raids-view.js' });
  vm.runInContext(SRC, sb, { filename: 'raids-sheet.js' });
  return { sb, D, winListeners, itemCalls, scrolls };
}

const flush = () => new Promise((r) => setTimeout(r, 20));

test('humo: la fila abre la ficha, trae el cofre de la API, Escape vuelve a la misma fila y al mismo lugar', async () => {
  const { sb, D, itemCalls, scrolls } = boot();
  await flush();
  const rv = D.els.rvRoot;
  assert.match(rv.innerHTML, /data-rv-open="greer"/, 'cada fila tiene su botón para abrir la ficha');
  rv.listeners.click[0]({ target: { getAttribute: (k) => (k === 'data-rv-open' ? 'greer' : null), parentNode: null } });
  await flush();
  const rs = D.els.rsRoot;
  assert.ok(rs, 'crea #rsRoot en el panel');
  assert.equal(rv.getAttribute('hidden'), '', 'la lista se esconde');
  assert.equal(rs.getAttribute('hidden'), null, 'la ficha se ve');
  assert.equal(rs.getAttribute('aria-labelledby'), 'rsTitle');
  assert.match(rs.innerHTML, /Greer, el Portarruina|Greer/);
  assert.equal(D.els.rsTitle.focused, 1, 'el foco va al título de la ficha');
  assert.deepEqual(itemCalls, [[104306, 107171]], 'pide solo los dos cofres, una vez');
  assert.match(rs.innerHTML, /Cofre 104306/, 'nombre de la API');
  assert.match(D.els.rsVoice.children[0].text, /16 fragmentos/);
  assert.ok(sb.RaidsSheet.isOpen());

  // Siguiente encuentro desde la ficha
  rs.listeners.click[0]({ target: { getAttribute: (k) => (k === 'data-rs-go' ? 'decima' : null), parentNode: null } });
  await flush();
  assert.match(rs.innerHTML, /✓ Hecho esta semana/);
  assert.equal(JSON.stringify(itemCalls), '[[104306,107171],[104410]]', 'Decima: su cofre; el magnífico sin verificar no se pide');
  rs.listeners.click[0]({ target: { getAttribute: (k) => (k === 'data-rs-go' ? 'greer' : null), parentNode: null } });
  await flush();
  assert.equal(itemCalls.length, 2, 'volver a Greer no vuelve a pedir sus cofres');

  // Escape vuelve
  D.docListeners.keydown[0]({ key: 'Escape', preventDefault() {} });
  assert.equal(rs.getAttribute('hidden'), '');
  assert.equal(rv.getAttribute('hidden'), null);
  assert.deepEqual(scrolls, [640], 'vuelve al mismo lugar de la página');
  assert.equal(D.rows.greer && D.rows.greer.focused, 1, 'el foco vuelve a la fila del encuentro');
  assert.ok(!sb.RaidsSheet.isOpen());
  D.docListeners.keydown[0]({ key: 'Escape', preventDefault() { throw new Error('Escape sin ficha abierta no se toca'); } });
});

test('humo: salir de Raids cierra la ficha sin mover la página', async () => {
  const { sb, D, winListeners, scrolls } = boot();
  await flush();
  await sb.RaidsSheet.open('cairn');
  assert.ok(sb.RaidsSheet.isOpen());
  sb.location.hash = '#/account/wallet';
  winListeners.hashchange.forEach((f) => f());
  assert.ok(!sb.RaidsSheet.isOpen());
  assert.equal(D.els.rvRoot.getAttribute('hidden'), null);
  assert.deepEqual(scrolls, []);
});
