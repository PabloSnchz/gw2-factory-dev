// La Heredad, pestañas Glifos y Decoraciones (BL-070 ACT-6, BL-055): js/home-extra.js con js/home-view.js 1.1.0.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/home-extra.js');
const HV = read('js/home-view.js');
const GLY = JSON.parse(read('assets/data/homestead/glyphs.json'));
const NODES = JSON.parse(read('assets/data/homestead/nodes.json'));
const J = (x) => JSON.parse(JSON.stringify(x));

function box() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'home-extra.js' });
  return sb;
}
const P = box().HomeExtra._pure;

const CATS = [{ id: 1, name: 'Arquitectura' }, { id: 5, name: 'Iluminación' }, { id: 21, name: 'Año\u00a0nuevo lunar' }];
const DECOS = [
  { id: 10, name: 'Farol de piedra', categories: [5], max_count: 250, icon: 'https://render.guildwars2.com/file/A/1.png' },
  { id: 11, name: 'Pared de madera', categories: [1], max_count: 250, icon: 'https://render.guildwars2.com/file/A/2.png' },
  { id: 12, name: 'Linterna del Año Nuevo Lunar', categories: [5, 21], max_count: 250, icon: 'https://render.guildwars2.com/file/A/3.png' },
  { id: 13, name: 'Columna\u00a0élfica', categories: [1], max_count: 250, icon: 'https://render.guildwars2.com/file/A/4.png' },
];
const OWN = [{ id: 10, count: 250 }, { id: 12, count: 3 }];

test('archivo: presupuesto, versión, manifiesto después de home-view, fuera de index.html, sin emojis ni almacenamiento', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.ok(Buffer.byteLength(HV) <= 40 * 1024);
  assert.match(SRC, /Versión: 1\.0\.0/);
  assert.match(HV, /Versión: 1\.3\.0/);
  [SRC, HV].forEach((s) => {
    assert.doesNotMatch(s, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    assert.doesNotMatch(s, /localStorage|sessionStorage/);
  });
  assert.doesNotMatch(SRC, /Storage\.set|S\.set\(/, 'ACT-6 no guarda nada en el navegador');
  const man = JSON.parse(read('js/modules.json')).modules;
  const i = man.findIndex((m) => m.src === 'js/home-extra.js'), h = man.findIndex((m) => m.src === 'js/home-view.js');
  assert.ok(h >= 0 && i > h);
  assert.equal(man[i].v, '1.0.0');
  assert.equal(man[h].v, '1.3.0');
  assert.doesNotMatch(read('index.html'), /home-extra\.js/);
});

test('datos de glifos: 12 tipos x 3 cajas = los 36 de la API, ítems e íconos oficiales, efecto de la wiki', () => {
  assert.equal(GLY.glyphs.length, 12);
  assert.deepEqual(GLY.slots.map((s) => s.id), ['harvesting', 'logging', 'mining']);
  assert.equal(new Set(GLY.glyphs.map((g) => g.id)).size, 12);
  assert.equal(new Set(GLY.glyphs.map((g) => g.item)).size, 12);
  GLY.glyphs.forEach((g) => {
    assert.match(g.icon, /^https:\/\/render\.guildwars2\.com\/file\/[0-9A-F]{40}\/\d+\.png$/, g.id);
    assert.ok(/^Glifo /.test(g.name) && g.effect && GLY.kinds[g.kind], g.id);
  });
  assert.equal(GLY.glyphs.find((g) => g.id === 'alchemy').item, 90805, 'el ejemplo de la API: alchemy_harvesting → 90805');
  assert.match(GLY.glyphs.find((g) => g.id === 'forester').effect, /^33 %/);
  assert.match(GLY.source.effects, /wiki\.guildwars2\.com\/wiki\/Glyph_\(upgrade\)/);
});

test('modelo de glifos: por caja, cuántos tenés y «sin datos» si no se pudo leer', () => {
  const m = P.glyphModel(GLY, ['alchemy_harvesting', 'alchemy_mining', 'volatility_logging']);
  assert.equal(m.total, 36);
  assert.equal(m.have, 3);
  const al = m.rows.find((r) => r.id === 'alchemy');
  assert.deepEqual(J(al.slots.map((s) => [s.label, s.have])), [['Cosecha', true], ['Tala', false], ['Minería', true]]);
  assert.equal(al.have, 2);
  const nd = P.glyphModel(GLY, null);
  assert.equal(nd.have, null);
  assert.ok(nd.rows.every((r) => r.have === null && r.slots.every((s) => s.have === null)), 'nunca «te falta» sin lectura');
});

test('modelo de decoraciones: cuenta, tope 250, categorías, filtros y búsqueda sin tildes ni espacios duros', () => {
  const m = P.decorModel(DECOS, CATS, OWN, {});
  assert.deepEqual([m.total, m.haveTypes, m.pieces, m.full], [4, 2, 253, 1]);
  assert.deepEqual(J(m.shown[0]), { id: 10, name: 'Farol de piedra', icon: 'https://render.guildwars2.com/file/A/1.png', count: 250, max: 250, cats: ['Iluminación'] });
  assert.deepEqual(J(m.shown.map((d) => d.id)), [10, 12, 13, 11], 'primero las que tenés, después por nombre');
  assert.deepEqual(J(m.cats.map((c) => [c.name, c.have, c.total])), [['Arquitectura', 0, 2], ['Iluminación', 2, 2], ['Año nuevo lunar', 1, 1]]);
  const ids = (ui) => J(P.decorModel(DECOS, CATS, OWN, ui).shown.map((d) => d.id));
  assert.deepEqual(ids({ cat: 1 }), [13, 11]);
  assert.deepEqual(ids({ only: 'have' }), [10, 12]);
  assert.deepEqual(ids({ only: 'missing' }), [13, 11]);
  assert.deepEqual(ids({ q: 'ELFICA' }), [13]);
  assert.deepEqual(ids({ q: 'ano nuevo' }), [12]);
  assert.deepEqual(ids({ limit: 1 }), [10]);
  assert.equal(P.decorModel(DECOS, CATS, OWN, { limit: 1 }).more, 3);
  const nd = P.decorModel(DECOS, CATS, null, { only: 'have' });
  assert.equal(nd.haveTypes, null);
  assert.equal(nd.shown.length, 4, 'sin lectura no se filtra por lo que tenés');
  assert.ok(nd.shown.every((d) => d.count === null));
  assert.deepEqual(J(P.chunks([1, 2, 3, 4, 5], 2)), [[1, 2], [3, 4], [5]]);
});

test('vista: ícono y efecto por glifo, estado en texto por caja, decoraciones con su cuenta y el permiso nombrado', () => {
  const g = P.glyphsHTML(P.glyphModel(GLY, ['alchemy_harvesting']), 'ok');
  assert.match(g, /Tenés 1 de 36/);
  assert.match(g, /<img src="https:\/\/render\.guildwars2\.com\/file\/E2047B083C4AC30C296203CF01FFB347479C1402\/2155917\.png" alt="" width="40" height="40" loading="lazy"><div class="hx-gt"><b>Glifo de alquimia<\/b>/);
  assert.match(g, /<li><span>Cosecha<\/span><span class="hx-b hx-b--ok">La tenés<\/span><\/li><li><span>Tala<\/span><span class="hx-b hx-b--no">Te falta<\/span>/);
  const gp = P.glyphsHTML(P.glyphModel(GLY, null), 'perm');
  assert.match(gp, /permisos «account» y «unlocks»/);
  assert.doesNotMatch(gp, /Te falta|La tenés/);
  assert.match(P.glyphsHTML(P.glyphModel(GLY, null), 'nokey'), /Cargá tu API Key/);
  const d = P.decorHTML(P.decorModel(DECOS, CATS, OWN, {}), { acct: 'ok', cat: 'ok' });
  assert.match(d, /Tenés 2 de 4 · 253 piezas · 1 al tope/);
  assert.match(d, /<b>Farol de piedra<\/b><small>Iluminación<\/small><\/div><span class="hx-b hx-b--ok">250 \/ 250<\/span>/);
  assert.match(d, /<b>Pared de madera<\/b>.*?hx-b--no">Te falta/);
  assert.match(d, /<select id="hxCat"><option value="all">Todas las categorías<\/option><option value="1">Arquitectura \(0\/2\)<\/option>/);
  assert.match(d, /data-hx-only="missing" aria-pressed="false">Me faltan/);
  assert.match(d, /<input id="hxQ" type="search"/);
  const dn = P.decorHTML(P.decorModel(DECOS, CATS, null, {}), { acct: 'perm', cat: 'ok' });
  assert.doesNotMatch(dn, /data-hx-only|Te falta/, 'sin lectura no hay «Me faltan»');
  assert.match(dn, /sin datos/);
  assert.match(P.decorHTML(P.decorModel([], [], [], {}), { acct: 'ok', cat: 'ok' }), /Si todavía no desbloqueaste la heredad/);
  assert.match(P.decorHTML(P.decorModel([], [], null, {}), { acct: 'ok', cat: 'error' }), /no pude leer el catálogo/);
  assert.match(P.esc('<b>"x"</b>'), /^&lt;b&gt;&quot;x&quot;/);
});

test('CSS: solo el texto del theme, sin fondo en las etiquetas, foco del selector y 44 px en el celular', () => {
  const keys = new Set();
  P.CSS.replace(/(?:^|[;{])\s*color\s*:\s*var\((--[\w-]+)/g, (m, k) => { keys.add(k); return m; });
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2']);
  assert.doesNotMatch(P.CSS, /\.hx-b[^{]*\{[^}]*background/);
  assert.match(P.CSS, /#hsRoot select:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(P.CSS, /@media \(max-width:900px\)[^]*min-height:44px/);
});

test('en los 19 themes los textos de Glifos y Decoraciones llegan a 4.5:1', () => {
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
    ['--tx-1', '--tx-2'].forEach((k) => [['tarjeta', card], ['fila', bg0]].forEach(([n, s]) => {
      const r = G.contrast(G.over(G.parse(eff[k]), s), s);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
  });
  assert.deepEqual(fails, []);
});

// ------------------------------------------------------------------ humo: home-view 1.1.0 + home-extra
function fakeDom() {
  const els = {};
  function el(id, tag) {
    const n = {
      tagName: tag || 'div', attrs: {}, children: [], innerHTML: '', hidden: false, listeners: {}, parentNode: null,
      classList: { s: new Set(), add(c) { this.s.add(c); }, contains(c) { return this.s.has(c); } },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; },
      removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; },
      appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
      insertBefore(c) { this.children.unshift(c); c.parentNode = this; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); },
      get firstChild() { return this.children[0] || null; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      contains() { return false; }, querySelector() { return null; },
    };
    Object.defineProperty(n, 'id', { get() { return this._id; }, set(v) { this._id = v; if (v) els[v] = n; } });
    if (id) n.id = id;
    return n;
  }
  const main = el('main', 'main');
  main.appendChild(el('activitiesPanel', 'section'));
  main.appendChild(el('homesteadPanel', 'section'));
  const head = el(null, 'head');
  const document = { readyState: 'complete', head, activeElement: null, getElementById: (id) => els[id] || null, createElement: (t) => el(null, t), addEventListener() {} };
  return { els, document, head };
}

function boot(opts) {
  const D = fakeDom(), calls = [], store = {};
  const api = {
    '/v2/account/home/nodes': [], '/v2/account/home/cats': [],
    '/v2/account/homestead/glyphs': ['forester_logging', 'alchemy_mining'],
    '/v2/account/homestead/decorations': OWN,
    '/v2/homestead/decorations': DECOS.map((d) => d.id),
    '/v2/homestead/decorations/categories': CATS,
  };
  const sb = {
    console: { info() {}, warn() {} }, document: D.document, setTimeout: (f) => f(), setInterval: () => 1, clearInterval() {},
    location: { hash: '#/account/homestead' }, addEventListener() {},
    fetch: (u) => {
      calls.push(u);
      if (u === 'assets/data/homestead/nodes.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(J(NODES)) });
      if (u === 'assets/data/homestead/glyphs.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(J(GLY)) });
      const [p, q] = u.replace('https://api.guildwars2.com', '').split('?');
      if ((opts.fail || []).includes(p)) return Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({}) });
      if (p === '/v2/homestead/decorations' && /ids=/.test(q || '')) {
        const ids = /ids=([\d,]+)/.exec(q)[1].split(',').map(Number);
        return Promise.resolve({ ok: true, json: () => Promise.resolve(J(DECOS.filter((d) => ids.includes(d.id)))) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(J(api[p])) });
    },
    Storage: {
      STORAGE_KEYS: { ACCOUNT_SELECTED: 'gn:account:selected', ACTIVITIES_HOME_NODES: 'gn:activities:home:nodes' },
      get: (k) => (k === 'gn:account:selected' ? 'TOKEN-DE-PRUEBA' : k in store ? JSON.parse(store[k]) : null),
      set: (k, v) => { store[k] = JSON.stringify(v); },
    },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'home-extra.js' });
  vm.runInContext(HV, sb, { filename: 'home-view.js' });
  return { sb, D, calls, store };
}
const flush = async () => { for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r)); };
const tgt = (attrs) => ({ getAttribute: (k) => (k in attrs ? attrs[k] : null), parentNode: null });

test('humo: las pestañas aparecen, se recorren con flechas y Glifos lee tu cuenta una sola vez', async () => {
  const x = boot({});
  await flush();
  const host = x.D.els.hsRoot;
  assert.match(host.innerHTML, /id="hsTab-nodes" data-hs-tab="nodes" aria-selected="true" aria-controls="hsPanel-nodes" tabindex="0">Nodos y gatos/);
  assert.match(host.innerHTML, /id="hsTab-glyphs" data-hs-tab="glyphs" aria-selected="false" aria-controls="hsPanel-glyphs" tabindex="-1">Glifos/);
  assert.match(host.innerHTML, /data-hs-tab="decor"[^>]*>Decoraciones/);
  assert.ok(!x.calls.some((u) => /homestead\/(glyphs|decorations)|glyphs\.json/.test(u)), 'nada de ACT-6 hasta abrir la pestaña');
  host.listeners.click[0]({ target: tgt({ 'data-hs-tab': 'glyphs' }) });
  await flush();
  assert.match(host.innerHTML, /<div id="hsPanel-glyphs" role="tabpanel" aria-labelledby="hsTab-glyphs">/);
  assert.match(host.innerHTML, /Tenés 2 de 36/);
  assert.match(host.innerHTML, /<b>Glifo del forestal<\/b>.*?<li><span>Tala<\/span><span class="hx-b hx-b--ok">La tenés/);
  assert.ok(x.calls.some((u) => u.includes('/v2/account/homestead/glyphs?access_token=TOKEN-DE-PRUEBA')));
  host.listeners.keydown[0]({ key: 'ArrowRight', target: tgt({ 'data-hs-tab': 'glyphs' }), preventDefault() {} });
  await flush();
  assert.match(host.innerHTML, /data-hs-tab="decor" aria-selected="true"/);
  host.listeners.keydown[0]({ key: 'ArrowRight', target: tgt({ 'data-hs-tab': 'decor' }), preventDefault() {} });
  assert.match(host.innerHTML, /data-hs-tab="nodes" aria-selected="true"/, 'da la vuelta');
  host.listeners.keydown[0]({ key: 'End', target: tgt({ 'data-hs-tab': 'nodes' }), preventDefault() {} });
  await flush();
  assert.equal(x.calls.filter((u) => u.includes('/v2/account/homestead/glyphs')).length, 1, 'volver a la pestaña no repite pedidos');
  assert.deepEqual(Object.keys(x.store), [], 'ACT-6 no guarda nada');
});

test('humo: Decoraciones carga el catálogo en tandas, filtra por categoría y búsqueda, y un 403 nombra el permiso', async () => {
  const x = boot({});
  await flush();
  const host = x.D.els.hsRoot;
  host.listeners.click[0]({ target: tgt({ 'data-hs-tab': 'decor' }) });
  await flush();
  assert.match(host.innerHTML, /Tenés 2 de 4 · 253 piezas · 1 al tope/);
  assert.ok(x.calls.some((u) => /\/v2\/homestead\/decorations\?lang=es&ids=10,11,12,13$/.test(u)));
  assert.ok(x.calls.some((u) => u.endsWith('/v2/homestead/decorations/categories?ids=all&lang=es')));
  host.listeners.change[0]({ target: { id: 'hxCat', value: '1' } });
  assert.match(host.innerHTML, /<b>Columna élfica<\/b>/);
  assert.doesNotMatch(host.innerHTML, /<b>Farol de piedra<\/b>/);
  host.listeners.change[0]({ target: { id: 'hxCat', value: 'all' } });
  host.listeners.click[0]({ target: tgt({ 'data-hx-only': 'have' }) });
  assert.match(host.innerHTML, /data-hx-only="have" aria-pressed="true"/);
  assert.doesNotMatch(host.innerHTML, /<b>Pared de madera<\/b>/);
  host.listeners.input[0]({ target: { id: 'hxQ', value: 'linterna' } });
  assert.match(host.innerHTML, /<b>Linterna del Año Nuevo Lunar<\/b>/);
  assert.doesNotMatch(host.innerHTML, /<b>Farol de piedra<\/b>/);
  assert.match(host.innerHTML, /<input id="hxQ" type="search" placeholder="Buscar decoración" value="linterna"/);
  const y = boot({ fail: ['/v2/account/homestead/decorations'] });
  await flush();
  y.D.els.hsRoot.listeners.click[0]({ target: tgt({ 'data-hs-tab': 'decor' }) });
  await flush();
  assert.match(y.D.els.hsRoot.innerHTML, /permisos «account» y «unlocks»/);
  assert.doesNotMatch(y.D.els.hsRoot.innerHTML, /Te falta/);
});
