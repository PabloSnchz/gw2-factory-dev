// BL-092 BV-3 (D2): con el theme Gato Negro hablo desde mi globo con el gato (js/shv-bubble.js 1.5.0 +
// la copia fija del kit de escena). Con otro theme, o si el kit no carga, todo sigue como en 1.4.0.
// DOM, reloj y localStorage falsos; el kit se reemplaza por uno de mentira con la misma forma
// (el de verdad arma el globo con marcado y este DOM no lo interpreta): lo que se prueba es la Bóveda.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/shv-bubble.js');

// ------------------------------------------------------------------ DOM mínimo
class CL {
  constructor(n) { this.n = n; }
  list() { return this.n.className.split(/\s+/).filter(Boolean); }
  contains(c) { return this.list().includes(c); }
  add(c) { if (!this.contains(c)) this.n.className = this.list().concat(c).join(' '); }
  remove(c) { this.n.className = this.list().filter((x) => x !== c).join(' '); }
  toggle(c, f) { const on = f === undefined ? !this.contains(c) : !!f; if (on) this.add(c); else this.remove(c); return on; }
}
class El {
  constructor(doc, tag) { this.ownerDocument = doc; this.tagName = String(tag).toUpperCase(); this.children = []; this.attrs = {}; this.parentNode = null; this.ls = {}; this.style = {}; this.hidden = false; this.textContent = ''; this.classList = new CL(this); }
  get id() { return this.attrs.id || ''; } set id(v) { this.attrs.id = String(v); }
  get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = String(v); }
  get type() { return this.attrs.type || ''; } set type(v) { this.attrs.type = String(v); }
  get src() { return this.attrs.src || ''; } set src(v) { this.attrs.src = String(v); }
  setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; } removeAttribute(k) { delete this.attrs[k]; }
  appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; const d = this.ownerDocument; if (d.activeElement && !d.body.contains(d.activeElement)) d.activeElement = d.body; return c; }
  contains(n) { for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
  all() { const out = []; const walk = (n) => n.children.forEach((c) => { out.push(c); walk(c); }); walk(this); return out; }
  matches(sel) { return sel.split(',').some((s) => desc(this, s.trim().split(/\s+/))); }
  closest(sel) { for (let x = this; x && x.matches; x = x.parentNode) if (x.matches(sel)) return x; return null; }
  querySelector(sel) { return this.all().find((n) => n.matches(sel)) || null; }
  querySelectorAll(sel) { return this.all().filter((n) => n.matches(sel)); }
  addEventListener(t, f) { (this.ls[t] = this.ls[t] || []).push(f); }
  dispatchEvent(e) { e.target = e.target || this; for (let x = this; x; x = x.parentNode) (x.ls[e.type] || []).forEach((f) => f(e)); return true; }
  click() { this.dispatchEvent({ type: 'click', target: this }); }
  focus() { this.ownerDocument.activeElement = this; }
  getBoundingClientRect() { return { right: 200, bottom: 700 }; }
}
function desc(n, parts) {
  if (!one(n, parts[parts.length - 1])) return false;
  let rest = parts.slice(0, -1);
  for (let x = n.parentNode; x && rest.length; x = x.parentNode) if (x.attrs && one(x, rest[rest.length - 1])) rest = rest.slice(0, -1);
  return !rest.length;
}
function one(n, s) {
  if (!n.attrs) return false;
  const m = s.match(/^([a-z]*)((?:[.#][\w-]+)*)((?:\[[^\]]+\])*)$/i);
  if (!m) throw new Error('selector ' + s);
  if (m[1] && n.tagName !== m[1].toUpperCase()) return false;
  for (const p of m[2].match(/[.#][\w-]+/g) || []) {
    if (p[0] === '.' && !n.className.split(/\s+/).includes(p.slice(1))) return false;
    if (p[0] === '#' && n.id !== p.slice(1)) return false;
  }
  for (const a of m[3].match(/\[[^\]]+\]/g) || []) {
    const [, k, v] = a.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
    if (!(k in n.attrs) || (v !== undefined && n.attrs[k] !== v)) return false;
  }
  return true;
}
class Doc extends El {
  constructor() { super(null, '#document'); this.ownerDocument = this; this.classList = new CL(this); this.head = this.appendChild(new El(this, 'head')); this.body = this.appendChild(new El(this, 'body')); this.activeElement = this.body; }
  createElement(t) { return new El(this, t); }
  getElementById(id) { return this.querySelector('#' + id); }
  get documentElement() { return this; }
}
function fakeLS() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m };
}

// Kit de mentira con la forma del de verdad (js/escena-kit.js 1.0.0): globo(), plegar(), plegado(), gato(), destruir().
function fakeKit(win, calls) {
  return {
    VERSION: '1.0.0',
    posesSinFondo(o) { calls.poses.push(o); },
    globo(o) {
      const doc = win.document;
      calls.globo.push(o);
      const el = doc.createElement('aside'); el.className = 'svk-globo';
      const gato = el.appendChild(doc.createElement('button')); gato.className = 'svk-gato';
      const cara = el.appendChild(doc.createElement('img')); cara.className = 'svk-cara'; cara.src = o.base + 'shiruvana/shiruvana-' + o.cara + '-cara-128.webp';
      const dice = el.appendChild(doc.createElement('div')); dice.className = 'svk-dice';
      dice.appendChild(doc.createElement('p')).className = 'svk-nombre';
      const texto = dice.appendChild(doc.createElement('p')); texto.className = 'svk-texto'; texto.textContent = o.texto;
      const pl = el.appendChild(doc.createElement('button')); pl.className = 'svk-plegar';
      const plegar = (si) => { el.classList.toggle('is-plegado', !!si); pl.setAttribute('aria-expanded', si ? 'false' : 'true'); };
      pl.addEventListener('click', () => plegar(!el.classList.contains('is-plegado')));
      (o.parent || doc.body).appendChild(el);
      plegar(false);
      return { el, plegar, plegado: () => el.classList.contains('is-plegado'), gato: (p, f) => calls.gato.push([p, f]), destruir: () => { if (el.parentNode) el.parentNode.removeChild(el); } };
    }
  };
}

function load(opts) {
  opts = opts || {};
  const doc = new Doc();
  if (opts.theme !== undefined) doc.setAttribute('data-theme', opts.theme);
  let clock = 1_800_000_000_000, seq = 0;
  const timers = new Map();
  class FD extends Date { static now() { return clock; } }
  class CE { constructor(type, init) { this.type = type; this.detail = init && init.detail; } }
  const mos = [];
  class MO { constructor(f) { this.f = f; mos.push(this); } observe(t, o) { this.t = t; this.o = o; } }
  const ls = fakeLS();
  const calls = { globo: [], gato: [], poses: [] };
  if (opts.dom) opts.dom(doc);
  const window = { console: { info() {} }, document: doc, localStorage: ls, innerWidth: opts.width || 1280, innerHeight: 800, CustomEvent: CE, MutationObserver: MO,
    addEventListener() {}, setTimeout: (f, ms) => { const id = ++seq; timers.set(id, { at: clock + ms, f }); return id; }, clearTimeout: (id) => { timers.delete(id); } };
  const ctx = { window, globalThis: {}, Date: FD, Math, JSON, Object, String, Array };
  vm.runInNewContext(read('js/shiruvana.js'), ctx);
  vm.runInNewContext(read('js/shv-core.js'), ctx);
  vm.runInNewContext(SRC, ctx);
  const advance = (ms) => {
    const end = clock + ms;
    for (;;) {
      let next = null;
      for (const [id, t] of timers) if (t.at <= end && (!next || t.at < next[1].at)) next = [id, t];
      if (!next) break;
      timers.delete(next[0]); clock = next[1].at; next[1].f();
    }
    clock = end;
  };
  const B = window.ShvBubble;
  const link = () => doc.getElementById('shvKitCss'), script = () => doc.getElementById('shvKitJs');
  // El navegador terminó de bajar el kit (o no pudo).
  const kitLoads = (ok) => {
    if (ok !== false) window.ShiruvanaKit = fakeKit(window, calls);
    const f = ok === false ? 'onerror' : 'onload';
    link()[f](); script()[f]();
  };
  const globo = () => doc.querySelector('.svk-globo');
  const box = () => doc.getElementById('shvBubble');
  const setTheme = (t) => { if (t == null) doc.removeAttribute('data-theme'); else doc.setAttribute('data-theme', t); mos.forEach((m) => m.t === doc && m.f()); };
  return { window, doc, B, advance, kitLoads, link, script, globo, box, calls, setTheme, mos };
}
const OBS = (n, extra) => Object.assign({ module: 'wallet', id: 'o' + n, priority: 'media', kind: 'recomienda', text: ['Mensaje ' + n], basis: { source: 'tu Cartera', at: 1_800_000_000_000 } }, extra || {});
function cornerDom(doc) {
  const side = doc.body.appendChild(doc.createElement('aside'));
  side.id = 'appSidebar';
  const c = side.appendChild(doc.createElement('aside'));
  c.setAttribute('data-shv-place', 'corner');
  const b = c.appendChild(doc.createElement('div'));
  b.className = 'shv-voice__body';
  b.appendChild(doc.createElement('p')).textContent = 'Elegí un módulo.';
  b.appendChild(doc.createElement('p')).textContent = 'Te acompaño.';
}

test('con el theme Gato Negro bajo la copia fija del kit y armo mi globo plegado, con mi cara de la Bóveda', () => {
  for (const theme of [undefined, 'gato']) {
    const t = load({ theme });
    assert.equal(t.link().getAttribute('rel') || t.link().rel, 'stylesheet');
    assert.equal(t.link().href, 'css/escena-kit.css?v=1.0.0');
    assert.equal(t.script().src, 'js/escena-kit.js?v=1.0.0');
    assert.equal(t.globo(), null, 'todavía no: falta que cargue');
    t.kitLoads();
    const g = t.globo();
    assert.ok(g, 'el globo está');
    assert.equal(t.calls.globo.length, 1);
    const o = t.calls.globo[0];
    assert.equal(o.base, 'assets/brand/', 'el gato sale de la Bóveda, no de otro sitio');
    assert.equal(o.storageKey, null, 'no guardo nada nuevo');
    assert.ok(g.classList.contains('is-plegado'), 'arranca plegado');
    assert.equal(g.querySelector('.svk-cara').src, t.window.Shiruvana.FACES.saluda, 'mi cara de js/shiruvana.js, sin pedirla a la red');
    assert.ok(t.doc.body.classList.contains('shv-escena'));
    assert.ok(t.B.escena(), 'escena() devuelve el globo');
    assert.equal(t.mos.filter((m) => m.t === t.doc && m.o.attributeFilter[0] === 'data-theme').length, 1, 'miro si cambiás de theme');
  }
});

test('con otro theme no bajo nada y hablo como siempre (1.4.0)', () => {
  const t = load({ theme: 'dracula' });
  assert.equal(t.link(), null);
  assert.equal(t.script(), null);
  t.B.offer(OBS(1)); t.advance(2000);
  assert.equal(t.box().parentNode, t.doc.body, 'el globo de antes, suelto en la página');
  assert.ok(t.box().querySelector('.shv-voice__avatar'), 'con mi avatar');
  assert.equal(t.doc.body.classList.contains('shv-escena'), false);
});

test('si el kit no carga, sigo como siempre y no lo vuelvo a pedir', () => {
  const t = load();
  t.kitLoads(false);
  assert.equal(t.globo(), null);
  t.B.offer(OBS(1)); t.advance(2000);
  assert.equal(t.box().parentNode, t.doc.body);
  t.setTheme('gato');
  assert.equal(t.doc.querySelectorAll('#shvKitJs').length, 1, 'no insisto');
  // Si bajó el código pero no los estilos, tampoco: un globo sin estilos sería peor que mi rincón.
  const u = load();
  u.window.ShiruvanaKit = fakeKit(u.window, u.calls);
  u.link().onerror(); u.script().onload();
  assert.equal(u.globo(), null, 'sin css/escena-kit.css no armo el globo');
  assert.equal(u.doc.body.classList.contains('shv-escena'), false);
});

test('un mensaje nuevo sale de mi globo: se abre, cambio de cara, el gato reacciona y el mensaje va adentro', () => {
  const t = load();
  t.kitLoads();
  t.B.offer(OBS(1, { kind: 'explica' })); t.advance(2000);
  const g = t.globo(), b = t.box();
  assert.ok(g.contains(b), 'adentro de mi globo');
  assert.ok(g.querySelector('.svk-dice').contains(b));
  assert.ok(b.classList.contains('shv-bub--escena'));
  assert.equal(b.style.left, undefined, 'no me pego al rincón');
  assert.equal(g.classList.contains('is-plegado'), false, 'abierto');
  assert.ok(g.classList.contains('shv-hablando'));
  assert.equal(g.querySelector('.svk-cara').src, t.window.Shiruvana.FACES.explica, 'la cara del tipo de mensaje');
  assert.equal(b.querySelector('.shv-voice__avatar'), null, 'sin una segunda cara adentro');
  assert.deepEqual(t.calls.gato, [['camina', '']]);
  assert.ok(b.querySelector('.shv-voice__basis').textContent.startsWith('Lo sé por: tu Cartera'), 'con su fundamento');
  assert.ok(b.querySelector('[data-shv-bub="later"]'), 'con «Después»');
  t.B.offer(OBS(2)); t.advance(12000);
  assert.ok(g.classList.contains('is-plegado'), 'a los 12 s me pliego');
  assert.equal(g.classList.contains('shv-hablando'), false);
  assert.equal(g.querySelector('.svk-cara').src, t.window.Shiruvana.FACES.saluda, 'vuelvo a mi cara de siempre');
  assert.equal(t.B.unread(), 1);
  assert.equal(g.querySelector('.svk-plegar').getAttribute('data-shv-unread'), '1', 'el punto va en el botón de mi globo');
  t.advance(2000);
  assert.equal(t.B.current().id, 'o2');
  assert.deepEqual(t.calls.gato[1], ['festeja', '']);
});

test('el botón de mi globo: abrirlo con algo sin leer te lo muestra; plegarlo con un mensaje lo da por leído', () => {
  const t = load({ dom: cornerDom });
  t.kitLoads();
  const g = t.globo(), pl = g.querySelector('.svk-plegar');
  pl.click();
  assert.equal(g.classList.contains('is-plegado'), false);
  assert.equal(g.querySelector('.svk-texto').textContent, 'Elegí un módulo. Te acompaño.', 'sin novedades, lo que decía mi rincón');
  pl.click();
  t.B.offer(OBS(1)); t.advance(2000); t.advance(12000);
  assert.equal(t.B.unread(), 1);
  pl.click();
  assert.equal(t.B.current().id, 'o1', 'te muestro lo que no leíste');
  assert.ok(g.contains(t.box()));
  assert.equal(t.B.unread(), 0);
  pl.focus();
  pl.click();
  assert.equal(t.box(), null);
  assert.ok(g.classList.contains('is-plegado'));
  assert.equal(t.B.unread(), 0, 'leído: no queda el punto');
  assert.equal(t.B.seen(OBS(1)), true);
});

test('Escape, «Después», silenciarme y cambiar de pantalla funcionan igual adentro del globo', () => {
  const t = load();
  t.kitLoads();
  const g = t.globo();
  t.B.offer(OBS(1)); t.advance(2000);
  t.doc.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert.equal(t.box(), null);
  assert.ok(g.classList.contains('is-plegado'));
  t.B.offer(OBS(2)); t.advance(2000);
  t.box().dispatchEvent({ type: 'click', target: t.box().querySelector('[data-shv-bub="later"]') });
  assert.equal(t.B.unread(), 1);
  assert.ok(g.classList.contains('is-plegado'));
  t.B.quiet(true);
  assert.equal(t.B.offer(OBS(3)), false, 'silenciada no aparezco');
  assert.ok(t.globo(), 'el globo queda, plegado: sigo acá');
  t.B.quiet(false);
  const dlg = t.doc.body.appendChild(t.doc.createElement('div'));
  dlg.setAttribute('aria-modal', 'true');
  t.B.offer(OBS(4)); t.advance(10000);
  assert.equal(t.box(), null, 'nunca con una ventana abierta');
});

test('si cambiás a otro theme vuelvo al rincón (lo que estaba a la vista queda sin leer); al volver, otra vez el globo', () => {
  const t = load();
  t.kitLoads();
  t.B.offer(OBS(1)); t.advance(2000);
  t.setTheme('nord');
  assert.equal(t.globo(), null);
  assert.equal(t.doc.body.classList.contains('shv-escena'), false);
  assert.equal(t.B.unread(), 1);
  assert.equal(t.B.escena(), null);
  t.B.offer(OBS(2)); t.advance(2000);
  assert.equal(t.box().parentNode, t.doc.body, 'como siempre');
  t.B.close();
  t.setTheme('gato');
  assert.ok(t.globo(), 'el kit ya estaba: el globo vuelve al instante');
  assert.equal(t.calls.globo.length, 2);
  assert.equal(t.doc.querySelectorAll('#shvKitJs').length, 1, 'el kit se baja una sola vez');
});

test('BV-4: con el globo preparo mis poses sin fondo una sola vez (saluda y pensando, desde la Bóveda); sin globo, no', () => {
  const t = load();
  t.kitLoads();
  assert.equal(t.calls.poses.length, 1);
  const o = t.calls.poses[0];
  assert.equal(o.el, t.doc.body, 'quedan en body: css/universo.css las usa donde corresponde');
  assert.equal(o.base, 'assets/brand/');
  assert.deepEqual([...o.poses], ['saluda', 'pensando']);
  t.setTheme('nord'); t.setTheme('gato');
  assert.equal(t.calls.poses.length, 1, 'el recorte no se repite al volver al theme');
  const u = load({ theme: 'dracula' });
  assert.equal(u.calls.poses.length, 0);
  const v = load();
  v.kitLoads(false);
  assert.equal(v.calls.poses.length, 0, 'sin kit no hay poses (ni rectángulos)');
});

// ------------------------------------------------------------------ la copia del kit y el CSS
function blob(file) {
  const b = fs.readFileSync(path.join(ROOT, file));
  return crypto.createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
}

test('la copia del kit es la 1.0.0 del repo shiruvana, byte a byte (versión fija)', () => {
  // kit/escena-kit.js y kit/escena-kit.css de PabloSnchz/shiruvana en su 1.0.0. Para subir de versión:
  // copiar los dos archivos, cambiar estos blobs y KIT_V en js/shv-bubble.js, en el mismo micro-ciclo.
  assert.equal(blob('js/escena-kit.js'), '1b317c7e67980c75eefc8f0da66bb5e6731821ce');
  assert.equal(blob('css/escena-kit.css'), 'fbbf4e76dd7b70294c10381e74feff5a3a431b97');
  const K = require(path.join(ROOT, 'js', 'escena-kit.js'));
  assert.equal(K.VERSION, '1.0.0');
  assert.match(SRC, /var KIT_V = '1\.0\.0', KIT_JS = 'js\/escena-kit\.js', KIT_CSS = 'css\/escena-kit\.css', BRAND = 'assets\/brand\/';/);
  for (const g of K.GATOS) assert.ok(fs.existsSync(path.join(ROOT, K.gatoURL(g, 'assets/brand/'))), 'existe ' + K.gatoURL(g, 'assets/brand/'));
  assert.ok(!JSON.parse(read('js/modules.json')).modules.some((m) => /escena-kit/.test(m.src)), 'no va en el manifiesto: lo bajo yo, solo con el theme oficial');
});

test('universo.css: el rincón se oculta solo con el globo puesto, me aparto de las ventanas y los avisos suben', () => {
  const css = read('css/universo.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const S = ':root:is([data-theme="gato"],:not([data-theme]))';
  const has = (sel, re) => {
    const i = css.indexOf(sel + ' {');
    assert.ok(i >= 0, 'falta ' + sel);
    assert.match(css.slice(i, css.indexOf('}', i)), re, sel);
  };
  has(S + ' body.shv-escena :is(#appSidebar,#sbrSheet) [data-shv-place="corner"]', /display:\s*none/);
  has(S + ':is(.gn-mod-open,.gn-dlg-open) .svk-globo', /visibility:\s*hidden/);
  has(S + ' body.shv-escena #toasts.gn-ui', /bottom:\s*150px/);
  has(S + ' .svk-globo #shvBubble', /position:\s*static/);
  has(S + ' .svk-globo #shvBubble .shv-bub__x', /display:\s*none/);
  has(S + ' .svk-globo.shv-hablando :is(.svk-nombre,.svk-texto)', /display:\s*none/);
  const m = css.slice(css.indexOf('@media (max-width: 900px)'));
  assert.match(m, /\.svk-globo \{[^}]*bottom: calc\(76px/, 'en el celular, sobre la barra de abajo');
  assert.ok(!/\[data-shv-place="corner"\]\s*\{[^}]*display:\s*none/.test(css.replace(S + ' body.shv-escena :is(#appSidebar,#sbrSheet) [data-shv-place="corner"] {', '')), 'el rincón no se oculta por otro lado');
  assert.match(read('css/universo.css'), /Versión: 1\.5\.0/);
  // BV-4: mis poses solo cuando están listas (la clase la pone el recorte), al costado y con su lugar propio.
  has(S + ' body.svk-p-saluda #welcomePanel [data-shv-place="welcome"]', /background-image:\s*var\(--svk-p-saluda\)[\s\S]*/);
  has(S + ' body.svk-p-saluda #welcomePanel [data-shv-place="welcome"] > .shv-voice__avatar', /display:\s*none/);
  has(S + ' body.svk-p-pensando :is(.arm-qview > .arm-empty, .cv-empty, div.wvp-empty)', /background-image:\s*var\(--svk-p-pensando\)/);
  assert.ok(!/--svk-p-[\w-]+\)/.test(css.replace(/body\.svk-p-(saluda|pensando)[^{]*\{[^}]*\}/g, '')), 'ninguna pose sin su clase de «lista»');
  for (const c of ['class="arm-qview"', 'class="arm-empty"', 'class="cv-empty"', 'class="wvp-empty"']) {
    assert.ok(fs.readdirSync(path.join(ROOT, 'js')).some((f) => read('js/' + f).includes(c)), 'existe ' + c);
  }
  for (const p of ['saluda', 'pensando']) assert.ok(fs.existsSync(path.join(ROOT, 'assets/brand/shiruvana/cuerpo-' + p + '.webp')), 'existe la pose ' + p);
});

test('BV-5 celular: lugar para mi globo, botón de 44 px, mensajes largos, me corro al escribir y no salgo impreso', () => {
  const css = read('css/universo.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const S = ':root:is([data-theme="gato"],:not([data-theme]))';
  const block = (head) => {
    const i = css.indexOf(head + ' {');
    assert.ok(i >= 0, 'falta ' + head);
    let d = 0, j = css.indexOf('{', i);
    for (; j < css.length; j++) { if (css[j] === '{') d++; else if (css[j] === '}' && !--d) break; }
    return css.slice(i, j + 1);
  };
  const rule = (src, sel) => {
    const i = src.indexOf(sel + ' {');
    assert.ok(i >= 0, 'falta ' + sel);
    return src.slice(i, src.indexOf('}', i));
  };
  const px = (s) => Number((s.match(/padding-bottom:\s*(?:calc\()?(\d+)px/) || [])[1]);
  // compu: el globo plegado (abajo 20 px + 60 px + el gato) no tapa lo último
  const top = css.slice(0, css.indexOf('@media (max-width: 900px)'));
  assert.ok(px(rule(top, S + ' body.shv-escena')) >= 140, 'lugar abajo en la compu');
  assert.match(rule(top, S + ' .svk-globo .svk-dice'), /max-height:\s*calc\(100vh - \d+px\)[\s\S]*overflow-y:\s*auto/);
  // celular: le gana al padding de la barra de abajo (68 px de sidebar-nav.js) y suma el globo
  const m = block('@media (max-width: 900px)');
  assert.ok(px(rule(m, S + ' body.shv-escena')) >= 68 + 130, 'barra de abajo + globo plegado');
  assert.match(rule(m, S + ' body.shv-escena'), /env\(safe-area-inset-bottom/);
  assert.match(rule(m, S + ' .svk-globo .svk-dice'), /100dvh/);
  const b = rule(m, S + ' .svk-globo .svk-plegar');
  assert.match(b, /width:\s*44px/); assert.match(b, /height:\s*44px/);
  const typing = m.match(/:has\(:is\(([^{]*)\):focus\) \.svk-globo \{([^}]*)\}/);
  assert.ok(typing, 'me corro mientras escribís');
  assert.match(typing[2], /visibility:\s*hidden/);
  for (const t of ['input:not(', 'textarea']) assert.ok(typing[1].includes(t), t);
  for (const t of ['checkbox', 'radio', 'button']) assert.ok(typing[1].includes('[type="' + t + '"]'), 'no con ' + t);
  // en la hoja «Más» (z-index 1001, velo 1000) y la barra (900) mi globo (900 del kit) queda debajo del velo
  assert.ok(!/\.svk-globo[^{]*\{[^}]*z-index/.test(css), 'no me subo arriba de la hoja ni de las ventanas');
  // impreso: ni fondo, ni chispas, ni globo
  assert.match(block('@media print'), /\.svk-globo \{\s*display:\s*none/);
  assert.match(read('index.html'), /css\/universo\.css\?v=1\.5\.0/);
});

test('reglas de la casa: texto, nunca marcado; nada a la API; el kit se pide con su versión', () => {
  assert.match(SRC, /Versión: 1\.6\.0/);
  assert.ok(!/innerHTML|insertAdjacentHTML/.test(SRC));
  assert.ok(!/fetch\(|GW2Api/.test(SRC));
  assert.ok(!/localStorage\.setItem\('gn:shv:globo|storageKey: '/.test(SRC), 'el globo no guarda nada');
});
