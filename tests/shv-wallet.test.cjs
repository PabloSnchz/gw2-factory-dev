// BL-059 SHV-1: mi voz en la Cartera (js/shv-wallet.js), nivel N2, con el formato común de js/shv-core.js.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/shv-wallet.js');

// Sin document: el módulo no se monta y solo expone su lógica pura.
function load() {
  const window = { console: { info() {} } };
  vm.runInNewContext(read('js/shv-core.js'), { window, globalThis: {} });
  vm.runInNewContext(SRC, { window, globalThis: {} });
  return window;
}
const ALL = ['account', 'wallet', 'inventories', 'characters', 'progression', 'unlocks', 'tradingpost'];
const m = (amount, pinned) => ({ id: 1, name: 'x', amount, pinned: !!pinned });
const AT = new Date(2026, 9, 26, 14, 5).getTime();

test('sin el permiso «billetera» lo digo primero, con su fundamento y el botón de Keys', () => {
  const w = load();
  const list = w.ShvWallet.observe({ models: [m(5)], lastAt: AT, perms: ['account'], label: 'Main' });
  const top = w.ShvCore.pick(list);
  assert.equal(top.id, 'perm');
  assert.equal(top.kind, 'advierte');
  assert.equal(top.priority, 'alta');
  assert.match(top.text[0], /La Key activa, Main, no tiene el permiso «billetera»/);
  assert.equal(top.action.act, 'keys');
  assert.equal(top.basis.source, 'los permisos guardados de la Key activa');
});

test('sin divisas fijadas te sugiero fijarlas; con fijadas, el resumen', () => {
  const w = load();
  const pin = w.ShvCore.pick(w.ShvWallet.observe({ models: [m(5), m(0), m(2)], lastAt: AT, perms: ALL }));
  assert.equal(pin.id, 'pin');
  assert.equal(pin.kind, 'recomienda');
  assert.match(pin.text[0], /^Tenés 2 divisas con saldo en esta cuenta\. Fijá con ★/);
  assert.equal(w.ShvCore.basisText(pin.basis, AT), 'tu Cartera, leída de la API oficial · hoy 14:05');
  const sum = w.ShvCore.pick(w.ShvWallet.observe({ models: [m(5, true), m(0)], lastAt: AT, perms: ALL }));
  assert.equal(sum.id, 'summary');
  assert.equal(sum.text[0], 'Tenés 1 divisa con saldo en esta cuenta y 1 fijada en Destacadas.');
});

test('si no sé, no hablo: sin divisas leídas y sin datos de permisos no hay mensaje', () => {
  const w = load();
  assert.deepEqual(JSON.parse(JSON.stringify(w.ShvWallet.observe({ models: [], perms: null }))), []);
  assert.equal(w.ShvCore.pick(w.ShvWallet.observe({})), null);
  // Una Key vieja sin permisos anotados no es una Key sin permisos.
  assert.equal(w.ShvWallet.observe({ models: [], perms: null, label: 'Vieja' }).length, 0);
});

test('toda observación de la Cartera cumple el formato común (con fundamento)', () => {
  const w = load();
  const list = w.ShvWallet.observe({ models: [m(1)], lastAt: AT, perms: ['account'], label: '' });
  assert.equal(list.length, 2);
  list.forEach((o) => assert.ok(w.ShvCore.observation(o), o.id + ' cumple el formato'));
  assert.match(list[0].text[0], /^La Key activa no tiene/, 'sin nombre no deja comas sueltas');
});

test('no guarda nada, no pide nada a la API y no arma HTML a mano', () => {
  assert.ok(!/localStorage|Storage\.set\(|fetch\(|GW2Api/.test(SRC));
  assert.ok(!/innerHTML/.test(SRC));
  assert.match(SRC, /Versión: 1\.3\.1/);
});

// SHV-2b: una foto por día; day = días desde 1970 como en js/shv-memory.js
const H = (rows) => rows.map(([day, gold, extra]) => ({ day, at: AT2 - (100 - day) * 864e5, values: Object.assign({ 1: gold * 10000 }, extra || {}) }));
test('SHV-2b: el oro de los últimos 7 días y la semana anterior, con fundamento y «Ver la evolución»', () => {
  const w = load();
  const hist = H([[86, 1800], [90, 1900], [93, 1963], [100, 2105]]);
  const t = JSON.parse(JSON.stringify(w.ShvWallet.trends(hist, {})));
  assert.deepEqual(t.week, { days: 7, from: 1963, to: 2105, prevDelta: 163 });
  const top = w.ShvCore.pick(w.ShvWallet.observe({ models: [{ id: 1, amount: 5, pinned: false }], perms: ['wallet'], history: hist }));
  assert.equal(top.id, 'trend', 'lo que noto le gana a la sugerencia de fijar');
  assert.deepEqual([...top.text], ['En los últimos 7 días tu oro subió 142 en esta cuenta: de 1.963 a 2.105.', 'La semana anterior había subido 163.']);
  assert.equal(w.ShvCore.basisText(top.basis, AT2), 'tus fotos diarias de la Cartera (4 días guardados en este navegador) · hoy 14:10');
  assert.deepEqual(JSON.parse(JSON.stringify(top.action)), { label: 'Ver la evolución', act: 'mem', href: null });
  const down = w.ShvWallet.observe({ history: H([[99, 300], [100, 250]]) })[0];
  assert.equal(down.text[0], 'En el último día tu oro bajó 50 en esta cuenta: de 300 a 250.');
  assert.equal(down.text.length, 1, 'sin fotos de la semana anterior no la invento');
  assert.equal(w.ShvWallet.observe({ history: H([[99, 300], [100, 300.4]]) })[0].text[0], 'En el último día tu oro no cambió en esta cuenta: 300 de oro.');
  assert.equal(w.ShvWallet.observe({ history: H([[80, 300], [100, 400]]) }).length, 0, 'sin foto en los últimos 7 días no hay semana');
  assert.equal(w.ShvCore.pick(w.ShvWallet.observe({ models: [{ id: 1, amount: 5 }], perms: ['account'], history: hist })).id, 'perm', 'sin permiso, eso primero');
});

test('SHV-2b: la divisa con saldo que más días lleva igual (14 o más); el primer día lo digo', () => {
  const w = load();
  const hist = H([[70, 10, { 3: 212, 63: 50 }], [80, 10, { 3: 212, 63: 60 }], [86, 10, { 3: 212, 63: 60 }], [100, 10, { 3: 212, 63: 60 }]]);
  const t = JSON.parse(JSON.stringify(w.ShvWallet.trends(hist, { 3: 'Monedas de Laurel (API)' })));
  assert.deepEqual(t.stale, { id: 3, name: 'Monedas de Laurel (API)', days: 30, value: 212, sinceStart: true });
  const obs = w.ShvWallet.observe({ models: [{ id: 3, amount: 212, pinned: true }], perms: ['wallet'], history: hist.slice(1) });
  const st = obs.find((o) => o.id === 'stale');
  assert.equal(st.text[0], '«Monedas de Laurel» está igual hace al menos 20 días en esta cuenta (212).');
  assert.equal(w.ShvCore.pick(obs.filter((o) => o.id !== 'trend')).id, 'stale', 'le gana al resumen');
  const moved = H([[70, 10, { 63: 50 }], [90, 10, { 63: 60 }], [100, 10, { 63: 60 }]]);
  assert.equal(w.ShvWallet.trends(moved, {}).stale, null, '10 días no alcanzan');
  assert.equal(w.ShvWallet.trends(H([[70, 10, { 4: 0 }], [100, 10, { 4: 0 }]]), {}).stale, null, 'una divisa en 0 que sigue en 0 no es noticia');
  const two = w.ShvWallet.observe({ models: [{ id: 2, amount: 5, pinned: true }], perms: ['wallet'], history: H([[99, 10], [100, 10]]) });
  assert.equal(two.find((o) => o.id === 'summary').text.length, 1, 'desde el segundo día ya no digo que empiezo');
  const first = w.ShvWallet.observe({ models: [{ id: 2, amount: 5, pinned: true }], perms: ['wallet'], history: H([[100, 10]]) });
  assert.deepEqual([...first[0].text], ['Tenés 1 divisa con saldo en esta cuenta y 1 fijada en Destacadas.', 'Desde hoy recuerdo tu Cartera: en unos días te digo cómo evoluciona.']);
  assert.equal(w.ShvWallet.observe({ models: [{ id: 2, amount: 5, pinned: true }], perms: ['wallet'] })[0].text.length, 1, 'sin memoria no lo digo');
});

test('SHV-2b: la evolución se abre desde mi voz, con aria-expanded y el foco en el mismo botón', () => {
  assert.match(SRC, /data-shv-act="mem"/);
  assert.match(SRC, /setAttribute\('aria-expanded', String\(st\.memOpen\)\)/);
  assert.match(SRC, /setAttribute\('aria-controls', MEM_ID\)/);
  assert.match(SRC, /=== 'mem'\) \{ st\.memOpen = !st\.memOpen; st\.focusMem = true; paint\(\); \}/);
  assert.match(SRC, /if \(!st\.memOpen \|\| !st\.hasMem \|\| \(m && m\.empty\)\) m = null;/);
  assert.ok(SRC.indexOf('paintVoice();\n    paintMemory();') > 0, 'primero mi voz, después la evolución debajo');
});

const AT2 = new Date(2026, 9, 26, 14, 10).getTime();
test('SHV-2: el panel de evolución dice de dónde lo sé, dibuja un punto por día con foto y no inventa', () => {
  const w = load();
  const sum = { days: 21, inWindow: 3, lastAt: AT2, gold: [1820, null, 1900, 2105], rows: [
    { id: 1, name: 'Oro', value: 2105, delta: 285, gold: true }, { id: 2, name: 'Karma', value: 4100000, delta: 300000 },
    { id: 4, name: 'Gemas', value: 400, delta: 0 }, { id: 63, name: 'Aclamación astral', value: 3950, delta: -1200 },
    { id: 3, name: 'Monedas de Laurel', value: 212, delta: null }] };
  const m = JSON.parse(JSON.stringify(w.ShvWallet.memoryModel(sum, AT2)));
  assert.equal(m.empty, false);
  assert.equal(m.basis, 'tus fotos diarias de la Cartera (21 días guardados en este navegador) · hoy 14:10');
  assert.equal(m.points, '0,62 200,47 300,8');
  assert.equal(m.label, 'Oro, últimos 4 días: de 1.820 a 2.105');
  assert.deepEqual(m.rows.map((r) => [r.name, r.value, r.delta, r.sr]), [
    ['Oro', '2.105 de oro', '▲ 285', 'subió 285'], ['Karma', '4,1 M', '▲ 300.000', 'subió 300.000'], ['Gemas', '400', '=', 'sin cambios'],
    ['Aclamación astral', '3.950', '▼ 1.200', 'bajó 1.200'], ['Monedas de Laurel', '212', '', '']]);
  const zero = w.ShvWallet.memoryModel(Object.assign({}, sum, { rows: sum.rows.concat([{ id: 7, name: 'Fractales', value: 0, delta: 0 }]) }), AT2);
  assert.equal(zero.rows.length, 5, 'una divisa que está y sigue en 0 no ocupa lugar');
  const one = w.ShvWallet.memoryModel({ days: 1, inWindow: 1, lastAt: AT2, gold: [], rows: [] }, AT2);
  assert.equal(one.empty, true);
  assert.match(one.text, /^Empecé a recordar tu Cartera/);
  assert.match(one.basis, /\(1 día guardado en este navegador\)/);
  assert.equal(w.ShvWallet.memoryModel({ days: 0 }, AT2), null, 'sin memoria no muestro nada');
  assert.equal(w.ShvWallet.memoryModel(null, AT2), null);
});

test('SHV-2: el panel usa solo colores del theme, no guarda nada y va debajo de mi voz', () => {
  assert.equal(load().ShvWallet.MEM_ID, 'shvWalletMemory');
  const css = (SRC.match(/var MEM_CSS = \[[\s\S]*?\]\.join/) || [''])[0];
  assert.ok(css, 'hay CSS del panel');
  assert.doesNotMatch(css.replace(/'#' \+ MEM_ID/g, ''), /#[0-9a-fA-F]{3,8}\b/, 'sin colores fijos: los 19 themes mandan');
  assert.match(css, /var\(--tx-1\)/);
  assert.match(SRC, /voice\.nextSibling/);
  assert.match(SRC, /addEventListener\('gn:shv-memory', schedule\)/);
});

// ------------------------------------------------------------------ SHE-2 (DEC-038): mi globo
test('SHE-2: con globo, en la Cartera queda solo lo crítico; al globo, lo que noto y recomiendo, en orden', () => {
  const w = load();
  const ids = (l) => [...l].map((o) => o.id); // arrays del módulo: son de otro realm
  const hist = H([[86, 1800], [90, 1900], [93, 1963], [100, 2105, { 3: 5 }]]);
  const list = w.ShvWallet.observe({ models: [{ id: 1, amount: 5 }], lastAt: AT, perms: ['account'], label: 'Main', history: hist });
  assert.deepEqual(ids(list), ['perm', 'trend', 'pin']);
  const off = w.ShvWallet.split(list, 4, false);
  assert.equal(off.voice.id, 'perm', 'silenciada: hablo acá como siempre, una sola voz');
  assert.equal(off.offers.length, 0);
  const on = w.ShvWallet.split(list, 4, true);
  assert.equal(on.voice.id, 'perm', 'lo crítico queda escrito en la Cartera');
  assert.deepEqual(ids(on.offers), ['trend', 'pin'], 'lo que noto antes que lo que te recomiendo');
  const noPerm = w.ShvWallet.split(w.ShvWallet.observe({ models: [{ id: 1, amount: 5, pinned: true }], perms: ['wallet'], history: hist }), 4, true);
  assert.equal(noPerm.voice, null, 'sin nada crítico, en la Cartera no hablo');
  assert.deepEqual(ids(noPerm.offers), ['trend'], 'el resumen (baja) no es novedad');
  const day1 = w.ShvWallet.observe({ models: [{ id: 1, amount: 5, pinned: true }], perms: ['wallet'], history: H([[100, 10]]) });
  assert.deepEqual(ids(w.ShvWallet.split(day1, 1, true).offers), ['summary'], 'el primer día sí: «Desde hoy recuerdo tu Cartera»');
  // Qué es «la misma novedad» para mi globo: el oro, una vez por día y cuenta; la divisa quieta, mientras siga igual; fijar, una vez.
  assert.equal(on.offers[0].key, 'dia:100:2105');
  assert.equal(on.offers[1].key, 'fijar');
  const quiet = (d) => w.ShvWallet.observe({ history: H([[70, 10, { 3: 212 }], [d, 10, { 3: 212 }]]) }).find((o) => o.id === 'stale');
  assert.equal(quiet(90).key, quiet(91).key, 'pasa un día y sigue igual: no es nuevo');
  assert.equal(quiet(90).key, '3:212');
  const order = w.ShvWallet.split([{ id: 'a', priority: 'baja' }, { id: 'b', priority: 'media' }, { id: 'c', priority: 'media' }], 1, true);
  assert.deepEqual(ids(order.offers), ['b', 'c', 'a'], 'media antes que baja; a igual prioridad, el orden de llegada');
});

test('SHE-2: uno por visita a la Cartera, el primero que no viste; «Ver la evolución» del globo abre el panel', () => {
  assert.match(SRC, /if \(st\.offered \|\| !offers\.length \|\| !onCartera\(\)\) return;/);
  assert.match(SRC, /if \(B\.seen\(offers\[i\]\)\) continue;\n\s+if \(B\.offer\(offers\[i\]\)\) st\.offered = true;\n\s+return;/);
  assert.match(SRC, /function onRoute\(\) \{ st\.offered = false; schedule\(\); \}/);
  assert.match(SRC, /addEventListener\('gn:shv-act', onAct\)/);
  assert.match(SRC, /addEventListener\('gn:shv-quiet', schedule\)/);
  assert.match(SRC, /if \(!d \|\| d\.module !== 'cartera'\) return;/);
  assert.match(SRC, /st\.memOpen = true;\n\s+st\.focusMem = true;\n\s+if \(!onCartera\(\) && root\.location\) root\.location\.hash = '#\/cards';/);
  assert.match(SRC, /return \(h === '' \|\| h === '#' \|\| h === '#\/cards'\) && !!p && !hiddenUp\(p\);/);
  assert.match(SRC, /'Ver la evolución de tu Cartera'/);
  assert.match(SRC, /B && typeof B\.offer === 'function' && !B\.quiet\(\)/);
  assert.equal(load().ShvWallet.BAR_ID, 'shvWalletMemBar');
});

// ------------------------------------------------------------------ 1.3.1: sin bucle con wallet-theme.js
// Antes, cada pasada reescribía «Ver la evolución de tu Cartera», wallet-theme.js redibujaba Destacadas por ese
// cambio (sus íconos parpadeaban) y eso me volvía a llamar.
// DOM mínimo que avisa cada cambio a los MutationObserver, como el navegador.
function mini() {
  const obs = [];
  const note = (target) => obs.forEach((o) => { if (o.root && o.root.contains(target)) o.queue.push({ target }); });
  class N {
    constructor(doc, tag) { this.ownerDocument = doc; this.tagName = String(tag).toUpperCase(); this.children = []; this.attrs = {}; this.parentNode = null; this._t = ''; this.ls = {}; this.hidden = false; }
    get id() { return this.attrs.id || ''; } set id(v) { this.attrs.id = String(v); }
    get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = String(v); }
    get type() { return this.attrs.type || ''; } set type(v) { this.attrs.type = String(v); }
    get textContent() { return this._t + this.children.map((c) => c.textContent).join(''); }
    set textContent(v) { this.children = []; this._t = String(v); note(this); }
    get firstChild() { return this.children[0] || null; }
    get nextSibling() { const p = this.parentNode; return p ? p.children[p.children.indexOf(this) + 1] || null : null; }
    setAttribute(k, v) { this.attrs[k] = String(v); note(this); }
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
    removeAttribute(k) { delete this.attrs[k]; note(this); }
    appendChild(c) { return this.insertBefore(c, null); }
    insertBefore(c, ref) {
      if (c.parentNode) c.parentNode.removeChild(c);
      const i = ref ? this.children.indexOf(ref) : -1;
      if (i < 0) this.children.push(c); else this.children.splice(i, 0, c);
      c.parentNode = this; note(this); return c;
    }
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; note(this); return c; }
    contains(n) { for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
    all() { const out = []; const w = (n) => n.children.forEach((c) => { out.push(c); w(c); }); w(this); return out; }
    querySelector(s) {
      return this.all().find((n) => {
        if (s[0] === '.') return n.className.split(' ').includes(s.slice(1));
        if (s[0] === '#') return n.id === s.slice(1);
        const m = s.match(/^\[data-shv-act="(\w+)"\]$/);
        return m ? n.getAttribute('data-shv-act') === m[1] : false;
      }) || null;
    }
    querySelectorAll() { return []; }
    addEventListener(t, f) { (this.ls[t] = this.ls[t] || []).push(f); }
    closest() { return null; }
    focus() {}
  }
  class D extends N {
    constructor() { super(null, '#document'); this.ownerDocument = this; this.head = this.appendChild(new N(this, 'head')); this.body = this.appendChild(new N(this, 'body')); this.readyState = 'complete'; }
    createElement(t) { return new N(this, t); }
    createElementNS(_, t) { return new N(this, t); }
    getElementById(id) { return this.all().find((n) => n.id === id) || null; }
    get documentElement() { return this; }
  }
  const doc = new D();
  class MO {
    constructor(cb) { this.cb = cb; this.queue = []; obs.push(this); }
    observe(r) { this.root = r; }
    takeRecords() { const q = this.queue; this.queue = []; return q; }
  }
  const flush = () => { for (let i = 0; i < 50; i++) { const o = obs.find((x) => x.queue.length); if (!o) return; o.cb(o.takeRecords()); } };
  return { doc, MO, flush };
}

function setup(withMemory) {
  const { doc, MO, flush } = mini();
  const panel = doc.body.appendChild(doc.createElement('section'));
  panel.id = 'walletPanel';
  const body = panel.appendChild(doc.createElement('div'));
  body.className = 'panel__body';
  const stars = body.appendChild(doc.createElement('section'));
  stars.className = 'wn-stars';
  let clock = 1_800_000_000_000, seq = 0;
  const st = { redraws: 0 };
  const timers = new Map();
  const hist = [{ day: 1, at: clock, values: { 1: 10000 } }, { day: 2, at: clock, values: { 1: 20000 } }];
  const window = {
    document: doc, MutationObserver: MO, console: { info() {} }, location: { hash: '#/cards' },
    setTimeout: (f, ms) => { timers.set(++seq, { at: clock + ms, f }); return seq; },
    clearTimeout: (id) => timers.delete(id),
    addEventListener() {},
    Storage: { get: (k) => (k === 'gn:account:keys' ? [{ value: 'K1', perms: ['wallet', 'account'] }] : k === 'gn:account:selected' ? 'K1' : null) },
    WalletTheme: { _state: { models: [{ id: 1, name: 'Oro', amount: 5, pinned: true }], tmodels: [], lastAt: clock } },
    ShvBubble: { offer: () => true, quiet: () => false, seen: () => false },
    ShvMemory: {
      fingerprint: () => 'fp', ensureToday() {}, history: () => hist,
      summary: () => (withMemory ? { days: 2, inWindow: 2, lastAt: clock, gold: [1, 2], rows: [{ id: 1, name: 'Oro', value: 2, delta: 1, gold: true }] } : { days: 0 })
    }
  };
  // wallet-theme.js: ante cualquier cambio en la Cartera redibuja Destacadas y descarta sus propios registros.
  const wt = new MO(() => { st.redraws++; stars.textContent = 'íconos ' + st.redraws; wt.takeRecords(); });
  wt.observe(panel);
  class FD extends Date { static now() { return clock; } }
  vm.runInNewContext(read('js/shiruvana.js'), { window, globalThis: {} });
  vm.runInNewContext(read('js/shv-core.js'), { window, globalThis: {} });
  vm.runInNewContext(read('js/shv-wallet.js'), { window, globalThis: {}, Date: FD });
  const advance = (ms) => {
    const end = clock + ms;
    for (;;) {
      let nx = null;
      for (const [id, t] of timers) if (t.at <= end && (!nx || t.at < nx[1].at)) nx = [id, t];
      if (!nx) break;
      timers.delete(nx[0]); clock = nx[1].at; nx[1].f(); flush();
    }
    clock = end;
  };
  flush();
  return { doc, st, advance };
}

test('con mi globo y «Ver la evolución de tu Cartera», Destacadas no se redibuja en bucle', () => {
  const t = setup(true);
  t.advance(1000);
  assert.ok(t.doc.getElementById('shvWalletMemBar'), 'está «Ver la evolución de tu Cartera»');
  const after = t.st.redraws;
  t.advance(5000);
  assert.equal(t.st.redraws, after, 'en 5 segundos sin cambios, Destacadas no se vuelve a dibujar');
});

test('sin memoria tampoco hay bucle', () => {
  const t = setup(false);
  t.advance(1000);
  const after = t.st.redraws;
  t.advance(5000);
  assert.equal(t.st.redraws, after);
});
