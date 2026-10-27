// Cuentas renovado (BL-070, CTA-2): js/acc-view.js. Corre con: node --test tests/*.test.cjs
// «Mis cuentas» en vivo con las Keys de la Bóveda: tarjetas con íconos (solo las expansiones que tenés),
// etiquetas con color, estados honestos, caché de 6 horas sin la Key, el Llavero de siempre en su pestaña
// y el contraste en los 19 themes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/acc-view.js');
const MODEL = read('js/acc-model.js');
const CAT = JSON.parse(read('assets/data/accounts/catalog.json'));
const J = (x) => JSON.parse(JSON.stringify(x));

function box(extra) {
  const sb = Object.assign({ console: { info() {}, warn() {} } }, extra || {});
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'acc-model.js' });
  vm.runInContext(SRC, sb, { filename: 'acc-view.js' });
  return sb;
}
const B = box();
const P = B.AccView._pure, M = B.AccModel._pure;
const NOW = Date.UTC(2026, 9, 26, 0, 30);
const R = 'https://render.guildwars2.com/file/';

// Respuestas con la forma de la API (wiki API:2/account y RUN-073/074).
const ACC = { name: 'Gato Negro.1234', created: '2012-08-28T00:00:00Z', access: ['PlayForFree', 'GuildWars2', 'PathOfFire', 'EndOfDragons', 'JanthirWilds'], commander: true, fractal_level: 100, daily_ap: 100, monthly_ap: 50, wvw: { team_id: 1, rank: 2318 }, guilds: ['G1', 'G2'] };
const META = [{ id: 1, flags: [], tiers: [{ count: 1, points: 10 }] }, { id: 2, flags: ['Repeatable'], point_cap: 15, tiers: [{ count: 5, points: 5 }] }];
const FULL = ['account', 'progression', 'pvp', 'inventories', 'unlocks'];
function raw(o) {
  const ex = P.expandMeta(P.compactMeta(META));
  return Object.assign({ fp: 'aaaa1111', label: 'Mi main', tag: 'main', state: 'ok', tokeninfo: { permissions: FULL }, account: ACC,
    ach: [{ id: 1, done: true }, { id: 2, current: 0, repeated: 9 }], mastery: { totals: [{ region: 'Magic', earned: 3 }] },
    armory: [{ id: 5, count: 1 }, { id: 6, count: 2 }], pvp: { pvp_rank: 80, pvp_rank_rollovers: 3 }, guilds: { G1: { tag: 'GN', name: 'Gato Negro' } },
    metaById: ex.byId, caps: ex.caps }, o);
}

test('archivo: presupuesto, versión, manifiesto después de acc-model, fuera de index.html, sin emojis ni localStorage', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, Buffer.byteLength(SRC) + ' bytes');
  assert.match(SRC, /Versión: 1\.3\.0/);
  assert.equal(B.AccView.version, '1.3.0');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  assert.doesNotMatch(SRC, /localStorage|sessionStorage/);
  const man = JSON.parse(read('js/modules.json')).modules;
  const i = man.findIndex((m) => m.src === 'js/acc-view.js'), j = man.findIndex((m) => m.src === 'js/acc-model.js');
  assert.ok(j >= 0 && i > j, 'el modelo antes que la vista');
  assert.equal(man[i].v, '1.3.0');
  assert.doesNotMatch(read('index.html'), /acc-view\.js|acc-model\.js/);
});

test('ruta y panel: los de js/router.js e index.html; las claves nuevas son del espacio accounts:', () => {
  const Rt = read('js/router.js'), I = read('index.html');
  assert.equal(P.ROUTE, '#/account/accounts');
  assert.ok(Rt.includes("'#/account/accounts':'accounts'"));
  assert.ok(Rt.includes("showPanel('accountsPanel')"));
  assert.match(I, /<section id="accountsPanel" class="panel col-main"/);
  assert.match(I, /id="keySelectGlobal"/, '«Usar esta» usa el selector de arriba');
  assert.match(I, /id="keysMenuBtn"/, '«Administrar Keys» abre el de siempre');
  assert.equal(P.CARDS_KEY, 'gn:accounts:cards');
  assert.equal(P.META_KEY, 'gn:accounts:achmeta');
  assert.match(read('js/storage.js'), /'accounts:'/, 'el respaldo las acepta');
  assert.equal(P.CARD_TTL, 6 * 3600000, 'D6: 6 horas');
});

test('definiciones de logros compactas: ida y vuelta sin perder repetible, tope ni tiers', () => {
  const c = J(P.compactMeta(META.concat([{ id: 3, flags: ['Permanent'], tiers: [{ count: 1, points: 1 }, { count: 3, points: 5 }] }])));
  assert.deepEqual(c, { 1: [0, -1, 1, 10], 2: [1, 15, 5, 5], 3: [0, -1, 1, 1, 3, 5] });
  const e = J(P.expandMeta(c));
  assert.deepEqual(e.byId[2], { flags: ['Repeatable'], tiers: [{ count: 5, points: 5 }] });
  assert.deepEqual(e.caps, { 2: 15 });
  assert.equal(M.achievementPoints([{ id: 2, repeated: 9 }, { id: 3, current: 3, done: true }], e.byId, e.caps, {}).total, 15 + 6);
});

test('tarjeta: todos los datos con la Key completa; Visions of Eternity por maestría; nunca la Key', () => {
  const c = J(P.deriveCard(raw(), CAT, M, NOW));
  assert.equal(c.name, 'Gato Negro.1234');
  assert.deepEqual(c.age, { days: 5172, years: 14 });
  assert.equal(c.type, 'main');
  assert.deepEqual(c.exps.map((x) => x.id), ['hot', 'pof', 'eod', 'jw', 'voe']);
  assert.equal(c.exps[4].source, 'mastery');
  assert.deepEqual(c.ap, { state: 'ok', value: 10 + 15 + 150 });
  assert.deepEqual(c.legendaries, { state: 'ok', value: 2 });
  assert.deepEqual(c.fractals, { state: 'ok', value: 100 });
  assert.deepEqual(c.wvw, { state: 'ok', value: 2318 });
  assert.equal(c.pvp.value.icon, R + 'A2ACA72B379FCC4C4D7CE3D59DED073196485B5B/347230.png');
  assert.equal(c.keyComplete, true);
  assert.deepEqual(c.missing, []);
  assert.deepEqual(c.guilds, [{ id: 'G1', tag: 'GN', name: 'Gato Negro' }, { id: 'G2', tag: null, name: '' }]);
  assert.equal(c.commander, true);
});

test('tarjeta: sin permisos dice «Sin permiso»; si la lectura falla, «Sin datos»; una Key muerta es «bad»', () => {
  const c = J(P.deriveCard(raw({ tokeninfo: { permissions: ['account'] }, ach: null, mastery: null, armory: null, pvp: null, account: Object.assign({}, ACC, { fractal_level: undefined, wvw: { team_id: 1 } }) }), CAT, M, NOW));
  ['ap', 'legendaries', 'fractals', 'wvw', 'pvp'].forEach((k) => assert.equal(c[k].state, 'noperm', k));
  assert.deepEqual(c.missing, ['progression', 'inventories', 'unlocks', 'pvp']);
  assert.equal(c.keyComplete, false);
  assert.deepEqual(c.exps.map((x) => x.id), ['hot', 'pof', 'eod', 'jw'], 'sin maestría leída, VoE no se afirma');
  const nd = J(P.deriveCard(raw({ ach: null, armory: null }), CAT, M, NOW));
  assert.deepEqual(nd.ap, { state: 'nodata' });
  assert.deepEqual(nd.legendaries, { state: 'nodata' });
  const bad = J(P.deriveCard({ fp: 'b', label: 'Vieja', tag: '', state: 'bad' }, CAT, M, NOW));
  assert.equal(bad.state, 'bad');
  assert.equal(bad.keyComplete, null);
});

test('orden y filtros: main, alter, f2p y sin tipo; por tipo y búsqueda sin tildes', () => {
  const mk = (name, tag) => J(P.deriveCard(raw({ fp: name, tag, account: Object.assign({}, ACC, { name }) }), CAT, M, NOW));
  const cards = [mk('Zeta.1', ''), mk('Beta.2', 'alter'), mk('Árbol.3', 'main'), mk('Alfa.4', 'alter'), mk('Gratis.5', 'f2p')];
  assert.deepEqual(P.sortCards(cards).map((c) => c.name), ['Árbol.3', 'Alfa.4', 'Beta.2', 'Gratis.5', 'Zeta.1']);
  assert.deepEqual(P.filterCards(cards, { type: 'alter' }).map((c) => c.name), ['Beta.2', 'Alfa.4']);
  assert.deepEqual(P.filterCards(cards, { type: 'none' }).map((c) => c.name), ['Zeta.1']);
  assert.deepEqual(P.filterCards(cards, { q: 'ARBOL' }).map((c) => c.name), ['Árbol.3']);
});

test('mi voz: Key muerta, después permisos que faltan, después Visions of Eternity; nada mientras leo', () => {
  const ok = J(P.deriveCard(raw(), CAT, M, NOW));
  const inc = J(P.deriveCard(raw({ fp: 'x', account: Object.assign({}, ACC, { name: 'Farm Dos.5678' }), tokeninfo: { permissions: ['account', 'progression', 'inventories', 'unlocks'] } }), CAT, M, NOW));
  const bad = J(P.deriveCard({ fp: 'b', label: 'Vieja', tag: '', state: 'bad' }, CAT, M, NOW));
  assert.match(P.pickVoice([ok, inc, bad]).text, /^La Key de «Vieja» no responde: puede estar borrada o vencida/);
  assert.equal(P.pickVoice([ok, inc]).text, 'A la Key de «Farm Dos.5678» le faltan permisos («JcJ»): no puedo leer todo. Si querés verlo, generá la Key de nuevo con esos permisos.');
  assert.match(P.pickVoice([ok]).text, /^Visions of Eternity la marco por tu maestría/);
  assert.equal(P.pickVoice([ok], true), null);
  assert.equal(P.permList(['progression', 'pvp', 'unlocks']), '«progreso», «JcJ» y «desbloqueos»');
});

test('tarjeta en pantalla: solo las expansiones que tenés con su ícono, un ícono por dato, etiqueta con color, sin la Key', () => {
  const c = J(P.deriveCard(raw(), CAT, M, NOW));
  const h = P.cardHTML(c, CAT, M, 'otra');
  assert.equal((h.match(/<div class="cv-exps">.*?<\/div>/)[0].match(/<img /g) || []).length, 5, 'HoT, PoF, EoD, JW y VoE');
  assert.ok(h.includes('src="assets/icons/Cuentas/PoF.png" alt="Path of Fire"'));
  assert.doesNotMatch(h, /SoTO\.png/, 'Secrets of the Obscure no está: no aparece');
  assert.ok(h.includes('alt="Visions of Eternity (por tu maestría: la API todavía no la informa)"'));
  [['achievements', 'Logros', '175'], ['legendaries', 'Legendarias', '2'], ['fractals', 'Fractales', 'nivel 100'], ['wvw', 'McM', 'rango 2.318']].forEach(([k, l, v]) => {
    assert.ok(h.includes('<img src="' + M.icon(CAT.stats[k].icon) + '" alt="" width="24" height="24" loading="lazy" referrerpolicy="no-referrer"><span><small>' + l + '</small><b>' + v + '</b>'), k);
  });
  assert.ok(h.includes('347230.png" alt="" width="24" height="24" loading="lazy" referrerpolicy="no-referrer"><span><small>JcJ</small><b>rango 80 <span>(+3)</span></b>'), 'JcJ con el ícono de su tramo');
  assert.ok(h.includes('<span class="cv-chip cv-tag" style="--cc:#F2B94B"><img src="assets/icons/Cuentas/547827.png" alt="" width="16" height="16">Principal</span>'));
  assert.ok(h.includes('64964.png" alt="" width="16" height="16">Comandante</span>'));
  assert.ok(h.includes('102498.png" alt="" width="16" height="16">[GN] Gato Negro</span>'));
  assert.ok(h.includes('style="--tc:#F2B94B"'), 'el borde de la tarjeta en el color de su tipo');
  assert.ok(h.includes('data-cv-use="aaaa1111">Usar esta<span class="cv-sr"> cuenta, Gato Negro.1234</span>'));
  assert.match(P.cardHTML(c, CAT, M, 'aaaa1111'), /<span class="cv-act">Activa<\/span>/);
  const np = P.cardHTML(J(P.deriveCard(raw({ tokeninfo: { permissions: ['account'] } }), CAT, M, NOW)), CAT, M, '');
  assert.match(np, /<small>Logros<\/small><b class="cv-nd">Sin permiso<\/b>/);
  assert.match(np, /A esta Key le faltan «progreso», «inventarios», «desbloqueos» y «JcJ»\./);
  assert.match(P.cardHTML(J(P.deriveCard(raw({ mastery: null, account: Object.assign({}, ACC, { access: ['PlayForFree'] }) }), CAT, M, NOW)), CAT, M, ''), /<small>Cuenta gratuita<\/small>/);
});

test('vista: cabecera con 4 indicadores, pestañas Mis cuentas y Llavero, filtros y el estado vacío', () => {
  const a = J(P.deriveCard(raw(), CAT, M, NOW)), b = J(P.deriveCard(raw({ fp: 'bbbb', tag: 'alter', tokeninfo: { permissions: ['account'] }, account: Object.assign({}, ACC, { name: 'Alt.9' }) }), CAT, M, NOW));
  const m = { cat: CAT, M, cards: [a, b], active: 'aaaa1111', activeName: 'Gato Negro.1234', ui: { tab: 'mine', type: 'all', q: '' }, loading: false, readAt: NOW - 120000, now: NOW };
  const h = P.viewHTML(m);
  assert.match(h, /<h2 id="cvTitle">Cuentas<\/h2><p>2 cuentas con Key · leído hace 2 min<\/p>/);
  assert.match(h, /<span class="cv-pill">Activa <b>Gato Negro\.1234<\/b><\/span>/);
  assert.match(h, /<small>Cuentas<\/small><b>2<\/b><em>1 main · 1 alter<\/em>/);
  assert.match(h, /<small>Puntos de logro<\/small><b>175<\/b><em>de 1 de 2 cuentas<\/em>/, 'suma solo lo leído y lo dice');
  assert.match(h, /<small>Keys completas<\/small><b>1 <span>\/ 2<\/span><\/b><em>1 con permisos de menos<\/em>/);
  assert.match(h, /role="tablist" aria-label="Secciones de Cuentas"/);
  assert.match(h, /id="cvTab-mine" data-cv-tab="mine" aria-selected="true"/);
  assert.match(h, /data-cv-type="alter" aria-pressed="false">Alternativa/);
  assert.match(h, /<input type="search" id="cvQ"/);
  const v = P.viewHTML(Object.assign({}, m, { ui: { tab: 'vault', type: 'all', q: '' } }));
  assert.match(v, /id="cvPanel-vault"/);
  assert.match(v, /el renovado llega en el próximo paso, sin perder ningún dato/);
  assert.doesNotMatch(v, /cv-card/);
  const e = P.viewHTML(Object.assign({}, m, { cards: [], activeName: '' }));
  assert.match(e, /Todavía no cargaste ninguna API Key/);
  assert.match(e, /data-cv="keys">Agregar API Key/);
  assert.doesNotMatch(e, /data-cv="refresh"/);
});

test('CSS: un solo contenedor, la cabecera vieja escondida, solo el texto del theme, foco visible y 44 px en el celular', () => {
  const keys = new Set();
  P.CSS.replace(/(?:^|[;{])\s*color\s*:\s*var\((--[\w-]+)/g, (m, k) => { keys.add(k); return m; });
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2']);
  assert.match(P.CSS, /#accountsPanel\.cv-on\{padding:0 0 22px;background:linear-gradient\(180deg,color-mix\(in srgb,#8E96A3 12%/);
  assert.ok(P.CSS.includes('#accountsPanel.cv-on>.panel__title,#accountsPanel.cv-mine>.panel__body{display:none}'));
  assert.match(P.CSS, /\.cv-hero\{border-bottom:1px solid var\(--bd-1\)/);
  assert.match(P.CSS, /#cvRoot :is\(button,input\):focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(P.CSS, /@media \(max-width:900px\)[^]*min-height:44px/);
  assert.match(P.CSS, /prefers-reduced-motion/);
  assert.match(read('js/welcome-panel.js'), /id: 'accounts'[^}]*color: '#8E96A3'/, 'el color de su botón de la barra lateral');
});

test('en los 19 themes cada texto de Cuentas llega a 4.5:1 sobre las superficies donde se pinta', () => {
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
    const hero = G.over([0x8E, 0x96, 0xA3, 0.12], tray);
    ['--tx-1', '--tx-2'].forEach((k) => [['bandeja', tray], ['tarjeta', card], ['bg-0', bg0], ['botón apretado', bg2], ['cabecera', hero]].forEach(([n, s]) => {
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
      tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', hidden: false, listeners: {}, parentNode: null, value: '', dispatched: [],
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; },
      removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; },
      appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
      insertBefore(c, ref) { const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); c.parentNode = this; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      dispatchEvent(e) { this.dispatched.push(e.type); }, click() { this.clicked = (this.clicked || 0) + 1; },
      contains() { return false; }, querySelector() { return null; },
    };
    Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } });
    if (id) n.id = id;
    return n;
  }
  const panel = el('accountsPanel', 'section');
  panel.appendChild(el('accountsTitle', 'h2'));
  panel.appendChild(el(null, 'div'));
  el('keySelectGlobal', 'select'); el('keysMenuBtn', 'button');
  const document = {
    readyState: 'complete', head: el(null, 'head'), activeElement: null,
    getElementById: (id) => els[id] || (id === 'cvVoice' && els.cvRoot && els.cvRoot.innerHTML.includes('id="cvVoice"') ? el('cvVoice') : null),
    createElement: (t) => el(null, t), addEventListener() {},
  };
  return { els, panel, document };
}

const KEYS = [{ value: 'KEY-MAIN-SECRETA', label: 'Mi main', tag: 'main' }, { value: 'KEY-ALT-SECRETA', label: 'Alt', tag: 'alter' }];
function boot(opts) {
  const D = fakeDom(), store = Object.assign({}, opts.store || {}), calls = [], voices = [];
  const tok = { 'KEY-MAIN-SECRETA': FULL, 'KEY-ALT-SECRETA': ['account', 'progression'] };
  const sb = box({
    document: D.document, setTimeout: (f) => f(), location: { hash: opts.hash || '#/account/accounts' }, addEventListener() {},
    Event: function (t) { this.type = t; },
    fetch: (u) => {
      calls.push(u);
      const ok = (v) => Promise.resolve({ ok: true, json: () => Promise.resolve(J(v)) });
      if (u === 'assets/data/accounts/catalog.json') return ok(CAT);
      const tk = (u.match(/access_token=([^&]+)/) || [])[1], p = u.replace('https://api.guildwars2.com', '').split('?')[0];
      if (p === '/v2/tokeninfo') return tok[tk] ? ok({ permissions: tok[tk] }) : Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      if (p === '/v2/account') return ok(Object.assign({}, ACC, { name: tk === 'KEY-MAIN-SECRETA' ? 'Gato Negro.1234' : 'Alt.9' }));
      if (p === '/v2/account/achievements') return ok([{ id: 1, done: true }, { id: 2, repeated: 9 }]);
      if (p === '/v2/achievements') return ok(META);
      if (p === '/v2/account/mastery/points') return ok({ totals: [] });
      if (p === '/v2/account/legendaryarmory') return ok([{ id: 5, count: 1 }]);
      if (p === '/v2/pvp/stats') return ok({ pvp_rank: 12 });
      if (p.startsWith('/v2/guild/')) return ok({ tag: 'GN', name: 'Gato Negro' });
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
    },
    Storage: {
      STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys', ACCOUNT_SELECTED: 'gn:account:selected' },
      get: (k) => (k === 'gn:account:keys' ? J(opts.keys || KEYS) : k === 'gn:account:selected' ? 'KEY-MAIN-SECRETA' : k in store ? JSON.parse(store[k]) : null),
      set: (k, v) => { store[k] = JSON.stringify(v); },
    },
    Shiruvana: { voice: (m) => { voices.push(m.text); return { text: m.text }; } },
  });
  return { sb, D, store, calls, voices };
}
const flush = async () => { for (let i = 0; i < 12; i++) await new Promise((r) => setImmediate(r)); };
const api = (calls) => calls.filter((u) => u.startsWith('https://'));

test('humo: toma el panel, lee cada cuenta, dibuja las tarjetas y guarda lo leído sin la Key', async () => {
  const x = boot({});
  await flush();
  const host = x.D.els.cvRoot;
  assert.ok(host, 'crea #cvRoot');
  assert.equal(x.D.panel.children[0], host, 'arriba de todo');
  assert.ok(x.D.panel.classList.contains('cv-on') && x.D.panel.classList.contains('cv-mine'));
  assert.equal(x.D.panel.getAttribute('aria-labelledby'), 'cvTitle');
  assert.match(host.innerHTML, /2 cuentas con Key · leído/);
  assert.match(host.innerHTML, /<b id="cvN-[0-9a-f]{8}">Gato Negro\.1234<\/b>/);
  assert.match(host.innerHTML, /<b id="cvN-[0-9a-f]{8}">Alt\.9<\/b>/);
  assert.match(host.innerHTML, /<small>Logros<\/small><b>175<\/b>/);
  assert.match(host.innerHTML, /<small>JcJ<\/small><b class="cv-nd">Sin permiso<\/b>/);
  assert.doesNotMatch(host.innerHTML, /SECRETA/, 'la Key nunca va al HTML');
  assert.equal(api(x.calls).filter((u) => u.includes('/v2/achievements?')).length, 1, 'las definiciones, una vez para todas');
  assert.ok(!api(x.calls).some((u) => u.includes('/v2/pvp/stats') && u.includes('KEY-ALT')), 'sin el permiso, no lo pido');
  assert.ok(!api(x.calls).some((u) => u.includes('/v2/account/legendaryarmory') && u.includes('KEY-ALT')));
  assert.ok(x.voices.some((v) => /^A la Key de «Alt\.9» le faltan permisos/.test(v)));
  const saved = x.store['gn:accounts:cards'];
  assert.ok(saved && !saved.includes('SECRETA'), 'lo leído se guarda, la Key no');
  assert.equal(Object.keys(JSON.parse(saved)).length, 2);
  assert.ok(!x.store['gn:accounts:achmeta'].includes('SECRETA'));
  const y = boot({ store: x.store });
  await flush();
  assert.equal(api(y.calls).length, 0, 'dentro de las 6 horas no vuelve a pedir');
  assert.match(y.D.els.cvRoot.innerHTML, /Alt\.9/);
});

test('humo: «Usar esta» cambia la cuenta por el selector de arriba; Llavero muestra el panel de siempre; Key muerta', async () => {
  const x = boot({});
  await flush();
  const host = x.D.els.cvRoot;
  const click = (attrs) => host.listeners.click[0]({ target: { getAttribute: (k) => attrs[k] || null, parentNode: null } });
  const fpAlt = host.innerHTML.match(/data-cv-use="([0-9a-f]{8})"/)[1];
  click({ 'data-cv-use': fpAlt });
  assert.equal(x.D.els.keySelectGlobal.value, 'KEY-ALT-SECRETA');
  assert.deepEqual(x.D.els.keySelectGlobal.dispatched, ['change']);
  click({ 'data-cv': 'keys' });
  assert.equal(x.D.els.keysMenuBtn.clicked, 1);
  click({ 'data-cv-tab': 'vault' });
  assert.ok(!x.D.panel.classList.contains('cv-mine'), 'el panel de siempre se ve');
  assert.match(host.innerHTML, /id="cvTab-vault" data-cv-tab="vault" aria-selected="true"/);
  host.listeners.keydown[0]({ target: { getAttribute: () => 'vault' }, key: 'ArrowLeft', preventDefault() {} });
  assert.ok(x.D.panel.classList.contains('cv-mine'));
  click({ 'data-cv-type': 'alter' });
  assert.doesNotMatch(host.innerHTML, /Gato Negro\.1234<\/b><small>/);
  host.listeners.input[0]({ target: { id: 'cvQ', value: 'nada' } });
  assert.match(host.innerHTML, /No hay cuentas con estos filtros/);
  const d = boot({ keys: [{ value: 'KEY-MUERTA', label: 'Vieja', tag: '' }] });
  await flush();
  assert.match(d.D.els.cvRoot.innerHTML, /Esta Key no responde/);
  assert.ok(d.voices.some((v) => /^La Key de «Vieja» no responde/.test(v)));
  const o = boot({ hash: '#/meta' });
  await flush();
  assert.equal(o.calls.length, 0, 'fuera de su ruta no pide nada');
  assert.ok(!o.D.els.cvRoot);
});

test('BL-074: con GNIdb las definiciones de logros van a IndexedDB (no al localStorage) y espero a que abra', async () => {
  const mem = {}, waits = [];
  const G = { handles: (k) => k === 'gn:accounts:achmeta', get: (k) => (k in mem ? JSON.parse(mem[k]) : null),
    set: (k, v) => { mem[k] = JSON.stringify(v); return true; }, ready: () => { waits.push(1); return Promise.resolve(true); } };
  const x = boot({});
  x.sb.GNIdb = G;
  await flush();
  assert.ok(mem['gn:accounts:achmeta'] && !mem['gn:accounts:achmeta'].includes('SECRETA'), 'quedaron en GNIdb, sin la Key');
  assert.ok(!('gn:accounts:achmeta' in x.store), 'y no en el localStorage');
  assert.ok(waits.length >= 1, 'esperé a que GNIdb abra');
  assert.ok(x.store['gn:accounts:cards'], 'lo leído de cada cuenta sigue donde estaba');
  assert.match(x.D.els.cvRoot.innerHTML, /<small>Logros<\/small><b>175<\/b>/);
  const y = boot({});
  y.sb.GNIdb = G;
  await flush();
  assert.equal(api(y.calls).filter((u) => u.includes('/v2/achievements?')).length, 0, 'las definiciones salen de GNIdb');
  assert.match(y.D.els.cvRoot.innerHTML, /<small>Logros<\/small><b>175<\/b>/);
});
