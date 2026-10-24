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
const MDIR = path.join(ROOT, 'assets', 'data', 'raids', 'mechanics');
const MIDX = JSON.parse(fs.readFileSync(path.join(MDIR, 'index.json'), 'utf8'));
const JW = JSON.parse(fs.readFileSync(path.join(MDIR, 'jw.json'), 'utf8'));
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
  // index-versions lee «Versión: X» de la cabecera: tiene que coincidir con el manifiesto y con VERSION.
  const head = /Versi[oó]n:\s*(\d+\.\d+\.\d+)/.exec(SRC.slice(0, 3000));
  assert.ok(head, 'raids-sheet.js declara «Versión:» en la cabecera');
  assert.equal(head[1], man.find((m) => m.src === 'js/raids-sheet.js').v);
  assert.equal(head[1], /var VERSION = '([\d.]+)'/.exec(SRC)[1]);
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

// ------------------------------------------------------------------ RAI-4: cómo se pelea
const mech = (id) => ({ e: JW.encounters[id], roles: JW.roles, sources: JW.sources, verified: JW.verified });

test('mecánicas, tanda Janthir: cada archivo del índice existe y cada dato tiene su fuente', () => {
  for (const [exp, f] of Object.entries(MIDX.files)) {
    assert.match(f, /^[\w-]+\.json$/);
    const d = JSON.parse(fs.readFileSync(path.join(MDIR, f), 'utf8'));
    assert.equal(d.expansion, exp);
    assert.match(d.verified, /^\d{4}-\d{2}-\d{2}$/);
    const ids = CAT.encounters.filter((e) => groupOf(e).expansion === exp).map((e) => e.id).sort();
    assert.deepEqual(Object.keys(d.encounters).sort(), ids, exp + ': todos los encuentros de la tanda y solo esos');
    for (const s of Object.values(d.sources)) assert.match(s.url, /^https:\/\/(wiki\.guildwars2\.com|metabattle\.com)\//);
    for (const [id, E] of Object.entries(d.encounters)) {
      assert.ok(E.summary && E.mechanics.length >= 1 && E.mechanics.length <= 7, id + ': de 1 a 7 mecánicas');
      if (byId[id].type !== 'event') assert.ok(E.mechanics.length >= 3 && E.phases.length >= 3, id + ': jefe con fases y al menos 3 mecánicas');
      for (const x of E.mechanics) {
        assert.ok(x.roles.length && x.roles.every((r) => d.roles[r]), id + ' ' + x.name + ': roles conocidos');
        assert.ok(d.sources[x.src], id + ' ' + x.name + ': fuente');
      }
      if (E.tip) assert.ok(d.sources[E.tip.src], id + ': consejo con fuente');
      if (E.cm) assert.ok(byId[id].cm, id + ': cambios de modo desafío solo si tiene modo desafío');
      assert.ok(E.links.every((k) => d.sources[k]));
    }
  }
  const raw = fs.readFileSync(path.join(MDIR, 'jw.json'), 'utf8');
  assert.doesNotMatch(raw, /youtube|dQw4w9WgXcQ/i, 'sin videos inventados');
  // Lo que es solo de modo desafío no aparece en la pelea normal (corrige la maqueta de RAI-0).
  const g = JW.encounters.greer;
  assert.doesNotMatch(JSON.stringify([g.phases, g.mechanics, g.tip]), /Proto|Ereg/);
  assert.match(g.cm.join(' '), /Proto-Greerlings/);
  assert.match(g.cm.join(' '), /Ereg/);
});

test('ficha de Greer: fases en orden, mecánicas con su rol, modo desafío, consejo y fuentes', () => {
  const h = S.sheetHTML(model('greer'), {}, mech('greer'), 'rew');
  assert.match(h, /<h3 id="rsFight">Cómo se pelea<\/h3>/);
  assert.equal((h.match(/<ol class="rs-phases">[\s\S]*?<\/ol>/)[0].match(/<li>/g) || []).length, 5);
  assert.ok(h.indexOf('100→66 %') < h.indexOf('33→0 %'), 'fases en orden');
  assert.match(h, /<b>Verdes de podredumbre<\/b> <small lang="en">Eruption of Rot<\/small><span class="rs-role">Todos<\/span>/);
  assert.match(h, /<span class="rs-role">Proyectiles<\/span>/);
  assert.match(h, /Antes del jefe: Bestia plagada legendaria\./);
  assert.match(h, /<b>Shiruvana recomienda<\/b> Llevá defensa contra proyectiles/);
  assert.match(h, /En modo desafío cambia[\s\S]*Proto-Greerlings/);
  assert.match(h, /href="https:\/\/wiki\.guildwars2\.com\/wiki\/Mount_Balrior"/);
  assert.match(h, /href="https:\/\/metabattle\.com\/wiki\/Guide:Raid_Wing_8_-_Mount_Balrior"/);
  assert.match(h, /Fuentes: wiki oficial, «Mount Balrior» y MetaBattle, guía del ala 8, consultadas el 2026-10-24/);
  assert.match(h, /role="tablist" aria-label="Secciones de la ficha"/);
  assert.match(h, /data-rs-tab="rew" aria-selected="true"/);
  assert.match(h, /data-rs-tab="fight" aria-selected="false"/);
  assert.match(h, /class="rs-card" data-rs-pane="rew"/);
  assert.match(h, /class="rs-card rs-fight" data-rs-pane="fight"/);
  assert.match(S.sheetHTML(model('greer'), {}, mech('greer'), 'fight'), /data-rs-tab="fight" aria-selected="true"/);
});

test('cómo se pelea: sin tanda todavía lo dice; el campamento no muestra modo desafío', () => {
  const kc = S.sheetHTML(model('keep_construct'), {}, null, 'rew');
  assert.match(kc, /llegan en una próxima tanda, verificadas/);
  assert.match(kc, /href="https:\/\/wiki\.guildwars2\.com\/wiki\/Keep_Construct"[^>]*>wiki oficial ↗/);
  assert.doesNotMatch(kc, /rs-phases/);
  const camp = S.fightHTML(model('camp'), mech('camp'));
  assert.match(camp, /Titanspawn del campamento/);
  assert.doesNotMatch(camp, /En modo desafío cambia/);
  assert.doesNotMatch(camp, /rs-phases/, 'un evento sin fases no muestra la línea de tiempo');
  const forced = Object.assign({}, mech('camp'), { e: Object.assign({}, JW.encounters.camp, { cm: ['solo de prueba'] }) });
  assert.doesNotMatch(S.fightHTML(model('camp'), forced), /solo de prueba/, 'sin modo desafío en el catálogo, no hay cambios de modo desafío');
  assert.match(S.fightHTML(model('greer'), { roles: JW.roles, sources: JW.sources }), /llegan en una próxima tanda/, 'archivo sin este encuentro: igual que sin tanda');
});

test('el CSS respeta movimiento reducido, foco visible y 44 px en el celular', () => {
  assert.match(S.CSS, /max-width:720px[\s\S]*\.rs-tabs\{display:flex\}/, 'las pestañas solo en el celular');
  assert.match(S.CSS, /#rsRoot\[data-pane=rew\] \[data-rs-pane=fight\],#rsRoot\[data-pane=fight\] \[data-rs-pane=rew\]\{display:none\}/);
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

function boot(o) {
  o = o || {};
  const D = fakeDom();
  const winListeners = {};
  const itemCalls = [];
  const scrolls = [];
  const fetches = [];
  const sb = {
    console: { info() {}, warn() {} }, document: D.doc, setTimeout: (f) => f(), setInterval: () => 1,
    location: { hash: '#/account/raids', href: 'https://dev/#/account/raids', replace() {} },
    addEventListener: (t, f) => { (winListeners[t] = winListeners[t] || []).push(f); },
    scrollY: 640, scrollTo: (x, y) => scrolls.push(y),
    fetch: (u) => {
      fetches.push(u);
      const body = /rewards/.test(u) ? RW : /mechanics\/index/.test(u) ? (o.idx || MIDX) : /mechanics\/jw/.test(u) ? JW : /catalog/.test(u) ? CAT : null;
      return Promise.resolve(body ? { ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(body))) } : { ok: false, status: 404 });
    },
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
  return { sb, D, winListeners, itemCalls, scrolls, fetches };
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

test('humo: la ficha trae las mecánicas de su tanda una sola vez y las pestañas cambian de sección', async () => {
  const { sb, D, fetches } = boot();
  await flush();
  await sb.RaidsSheet.open('greer');
  const rs = D.els.rsRoot;
  assert.match(rs.innerHTML, /Verdes de podredumbre/);
  assert.equal(rs.getAttribute('data-pane'), 'rew');
  const mf = () => fetches.filter((u) => /mechanics/.test(u));
  assert.deepEqual(mf(), ['assets/data/raids/mechanics/index.json', 'assets/data/raids/mechanics/jw.json']);
  rs.listeners.click[0]({ target: { getAttribute: (k) => (k === 'data-rs-tab' ? 'fight' : null), parentNode: null } });
  assert.equal(rs.getAttribute('data-pane'), 'fight');
  assert.match(rs.innerHTML, /data-rs-tab="fight" aria-selected="true"/);
  await sb.RaidsSheet.open('ura');
  assert.equal(rs.getAttribute('data-pane'), 'fight', 'anterior y siguiente mantienen la sección');
  assert.match(rs.innerHTML, /Fragmentos de piedra de sangre/);
  await sb.RaidsSheet.open('cairn');
  assert.match(rs.innerHTML, /llegan en una próxima tanda/);
  assert.equal(mf().length, 2, 'ni el índice ni Janthir se vuelven a pedir; sin tanda, no se pide nada');
  sb.RaidsSheet.close();
  await sb.RaidsSheet.open('decima');
  assert.equal(rs.getAttribute('data-pane'), 'rew', 'abrir desde la lista vuelve a Recompensas');
});

test('humo: el índice solo puede nombrar archivos de la misma carpeta', async () => {
  const { sb, D, fetches } = boot({ idx: { version: 1, files: { jw: '../rewards.json' } } });
  await flush();
  await sb.RaidsSheet.open('greer');
  assert.ok(!fetches.some((u) => /mechanics\/\.\./.test(u)), 'no sale de assets/data/raids/mechanics/');
  assert.match(D.els.rsRoot.innerHTML, /llegan en una próxima tanda/);
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
