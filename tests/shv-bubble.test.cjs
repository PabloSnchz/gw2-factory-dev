// BL-075 SHE-1: mi globo (js/shv-bubble.js). Corre con un DOM, un reloj y un localStorage falsos.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/shv-bubble.js');

// ------------------------------------------------------------------ DOM mínimo
class El {
  constructor(doc, tag) { this.ownerDocument = doc; this.tagName = String(tag).toUpperCase(); this.children = []; this.attrs = {}; this.parentNode = null; this.ls = {}; this.style = {}; this.hidden = false; this.textContent = ''; }
  get id() { return this.attrs.id || ''; } set id(v) { this.attrs.id = String(v); }
  get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = String(v); }
  get type() { return this.attrs.type || ''; } set type(v) { this.attrs.type = String(v); }
  setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; } removeAttribute(k) { delete this.attrs[k]; }
  appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; if (this.ownerDocument.activeElement && !this.ownerDocument.body.contains(this.ownerDocument.activeElement)) this.ownerDocument.activeElement = this.ownerDocument.body; return c; }
  contains(n) { for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
  all() { const out = []; const walk = (n) => n.children.forEach((c) => { out.push(c); walk(c); }); walk(this); return out; }
  matches(sel) { return sel.split(',').some((s) => desc(this, s.trim().split(/\s+/))); }
  closest(sel) { for (let x = this; x && x.matches; x = x.parentNode) if (x.matches(sel)) return x; return null; }
  querySelector(sel) { return this.all().find((n) => n.matches(sel)) || null; }
  querySelectorAll(sel) { return this.all().filter((n) => n.matches(sel)); }
  addEventListener(t, f) { (this.ls[t] = this.ls[t] || []).push(f); }
  dispatchEvent(e) { e.target = e.target || this; for (let x = this; x; x = x.parentNode) (x.ls[e.type] || []).forEach((f) => f(e)); return true; }
  focus() { this.ownerDocument.activeElement = this; }
  getBoundingClientRect() { return { right: 200, bottom: 700 }; }
}
// «a b»: n cumple b y algún antecesor cumple a.
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
  constructor() { super(null, '#document'); this.ownerDocument = this; this.head = this.appendChild(new El(this, 'head')); this.body = this.appendChild(new El(this, 'body')); this.activeElement = this.body; }
  createElement(t) { return new El(this, t); }
  getElementById(id) { return this.querySelector('#' + id); }
  get documentElement() { return this; }
}
function fakeLS() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m };
}

function load(opts) {
  opts = opts || {};
  const doc = new Doc();
  let clock = 1_800_000_000_000, seq = 0;
  const timers = new Map();
  class FD extends Date { static now() { return clock; } }
  class CE { constructor(type, init) { this.type = type; this.detail = init && init.detail; } }
  const ls = fakeLS();
  const wls = {};
  if (opts.dom) opts.dom(doc);
  const window = { console: { info() {} }, document: doc, localStorage: ls, innerWidth: opts.width || 1280, innerHeight: 800, CustomEvent: CE,
    addEventListener: (t, f) => { (wls[t] = wls[t] || []).push(f); }, _fire: (t) => (wls[t] || []).forEach((f) => f({ type: t })),
    setTimeout: (f, ms) => { const id = ++seq; timers.set(id, { at: clock + ms, f }); return id; },
    clearTimeout: (id) => { timers.delete(id); } };
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
  const box = () => doc.getElementById('shvBubble');
  const click = (sel) => { const t = box().querySelector(sel); box().dispatchEvent({ type: 'click', target: t }); };
  const key = (k) => doc.dispatchEvent({ type: 'keydown', key: k });
  return { window, doc, ls, B, advance, box, click, key, now: () => clock };
}
const OBS = (n, extra) => Object.assign({ module: 'wallet', id: 'o' + n, priority: 'media', kind: 'recomienda', text: ['Mensaje ' + n], basis: { source: 'tu Cartera', at: 1_800_000_000_000 } }, extra || {});

test('aparece a los 2 segundos, con mi voz, sin sacarte el foco y anunciado sin interrumpir', () => {
  const t = load();
  const before = t.doc.activeElement;
  assert.equal(t.B.offer(OBS(1)), true);
  t.advance(1999);
  assert.equal(t.box(), null, 'todavía no');
  t.advance(1);
  const b = t.box();
  assert.ok(b, 'apareció');
  assert.equal(b.getAttribute('aria-label'), 'Mensaje de Shiruvana');
  assert.ok(b.querySelector('.shv-voice'), 'con mi voz');
  assert.ok(b.querySelector('[data-shv-bub="close"]').getAttribute('aria-label').includes('Cerrar'));
  assert.ok(b.querySelector('[data-shv-bub="later"]'), 'con «Después»');
  assert.equal(t.doc.activeElement, before, 'no robo el foco');
  const live = t.doc.getElementById('shvBubbleLive');
  assert.equal(live.getAttribute('aria-live'), 'polite');
  assert.equal(live.textContent, 'Shiruvana te recomienda: Mensaje 1');
  assert.ok(t.doc.getElementById('shv-bubble-css'));
});

test('una vez por cosa nueva: lo que ya viste no vuelve y no guardo el texto', () => {
  const t = load();
  t.B.offer(OBS(1)); t.advance(2000);
  t.click('[data-shv-bub="close"]');
  assert.equal(t.box(), null);
  assert.equal(t.B.offer(OBS(1)), false, 'ya lo viste');
  const raw = t.ls.getItem('gn:shv:seen');
  assert.ok(raw && !raw.includes('Mensaje'), 'solo huellas');
  assert.equal(JSON.parse(raw).v, 1);
  assert.equal(t.B.offer(OBS(1, { text: ['Mensaje 1, ahora distinto'] })), true, 'si cambia lo que digo, es nuevo');
  t.advance(2000); t.click('[data-shv-bub="close"]');
  t.B.offer(OBS(9, { key: 'k1', text: ['hace 20 días'] })); t.advance(2000); t.click('[data-shv-bub="close"]');
  assert.equal(t.B.seen(OBS(9, { key: 'k1', text: ['hace 21 días'] })), true, 'con key, la misma novedad aunque cambie el texto');
  assert.equal(t.B.offer(OBS(9, { key: 'k1', text: ['hace 21 días'] })), false);
  assert.equal(t.B.offer(OBS(9, { key: 'k2', text: ['hace 21 días'] })), true, 'otra key, otra novedad');
  assert.ok(!t.ls.getItem('gn:shv:seen').includes('k1'), 'tampoco guardo la key');
});

test('no repito lo que ya está esperando ni lo que está a la vista; las observaciones sin fundamento no salen', () => {
  const t = load();
  assert.equal(t.B.offer(OBS(1)), true);
  assert.equal(t.B.offer(OBS(1)), false);
  t.advance(2000);
  assert.equal(t.B.offer(OBS(1)), false);
  assert.equal(t.B.offer({ module: 'wallet', text: ['sin base'] }), false);
});

test('uno por vez: el segundo espera a que se vaya el primero y 2 segundos más', () => {
  const t = load();
  t.B.offer(OBS(1)); t.B.offer(OBS(2));
  t.advance(2000);
  assert.equal(t.B.current().id, 'o1');
  t.click('[data-shv-bub="close"]');
  assert.equal(t.box(), null);
  t.advance(1999);
  assert.equal(t.box(), null);
  t.advance(1);
  assert.equal(t.B.current().id, 'o2');
});

test('nunca con un diálogo abierto ni mientras escribís', () => {
  const t = load();
  const dlg = t.doc.body.appendChild(t.doc.createElement('div'));
  dlg.setAttribute('aria-modal', 'true');
  t.B.offer(OBS(1));
  t.advance(10000);
  assert.equal(t.box(), null, 'espero al diálogo');
  dlg.hidden = true;
  t.advance(3000);
  assert.ok(t.box(), 'un diálogo oculto no cuenta');
  t.click('[data-shv-bub="close"]');
  const input = t.doc.body.appendChild(t.doc.createElement('input'));
  input.focus();
  t.B.offer(OBS(2));
  t.advance(10000);
  assert.equal(t.box(), null, 'espero a que termines de escribir');
  t.doc.body.focus();
  t.advance(3000);
  assert.equal(t.B.current().id, 'o2');
});

test('me voy sola a los 12 segundos y quedo como un punto en mi avatar; tocarlo me vuelve a abrir con el foco adentro', () => {
  const t = load();
  const corner = t.doc.body.appendChild(t.doc.createElement('button'));
  t.B.setAnchor(corner);
  t.B.offer(OBS(1)); t.advance(2000);
  assert.equal(t.box().style.left, '212px', 'sale de mi rincón');
  assert.equal(t.box().style.bottom, '100px');
  t.advance(11999);
  assert.ok(t.box());
  t.advance(1);
  assert.equal(t.box(), null);
  assert.equal(t.B.unread(), 1);
  assert.equal(corner.getAttribute('data-shv-unread'), '1');
  assert.equal(t.B.offer(OBS(1)), false, 'no vuelve a aparecer solo');
  assert.equal(t.B.reopen(), true);
  assert.equal(t.B.current().id, 'o1');
  assert.equal(t.doc.activeElement, t.box().querySelector('[data-shv-bub="close"]'), 'lo pediste vos: el foco va al globo');
  assert.equal(t.B.unread(), 0);
  assert.equal(corner.hasAttribute('data-shv-unread'), false);
  t.click('[data-shv-bub="close"]');
  assert.equal(t.doc.activeElement, corner, 'al cerrar, el foco vuelve a mi avatar');
  assert.equal(t.B.reopen(), false, 'no queda nada sin leer');
});

test('me quedo mientras me mirás o tenés el foco adentro', () => {
  const t = load();
  t.B.offer(OBS(1)); t.advance(2000);
  t.advance(11000);
  t.box().dispatchEvent({ type: 'mouseenter' });
  t.advance(60000);
  assert.ok(t.box(), 'sigo mientras me mirás');
  t.box().dispatchEvent({ type: 'mouseleave' });
  t.advance(2999);
  assert.ok(t.box(), 'al irte te dejo al menos 3 segundos');
  t.advance(1);
  assert.equal(t.box(), null);
  t.B.offer(OBS(2)); t.advance(4000);
  t.box().dispatchEvent({ type: 'focusin' });
  t.advance(60000);
  assert.ok(t.box(), 'sigo mientras tenés el foco adentro');
  t.box().dispatchEvent({ type: 'focusout', relatedTarget: null });
  t.advance(12000);
  assert.equal(t.box(), null);
});

test('Escape me cierra (sin punto); si hay un diálogo abierto, Escape es del diálogo', () => {
  const t = load();
  t.B.offer(OBS(1)); t.advance(2000);
  const dlg = t.doc.body.appendChild(t.doc.createElement('dialog'));
  dlg.setAttribute('open', '');
  t.key('Escape');
  assert.ok(t.box(), 'Escape era del diálogo');
  dlg.removeAttribute('open');
  t.key('Enter');
  assert.ok(t.box());
  t.key('Escape');
  assert.equal(t.box(), null);
  assert.equal(t.B.unread(), 0);
});

test('«Después» me guarda en el punto; el botón de la observación avisa al módulo dueño', () => {
  const t = load();
  t.B.offer(OBS(1)); t.advance(2000);
  t.click('[data-shv-bub="later"]');
  assert.equal(t.box(), null);
  assert.equal(t.B.unread(), 1);
  const got = [];
  t.doc.addEventListener('gn:shv-act', (e) => got.push(e.detail));
  t.B.offer(OBS(2, { action: { label: 'Ver la evolución', act: 'mem' } })); t.advance(2000);
  const row = t.box().querySelector('.shv-obs__acts');
  assert.equal(row.querySelectorAll('button').length, 2, 'su botón y «Después» en la misma fila');
  t.click('[data-shv-act]');
  assert.equal(t.box(), null);
  assert.deepEqual(JSON.parse(JSON.stringify(got)), [{ module: 'wallet', id: 'o2', act: 'mem' }]);
  assert.equal(t.B.unread(), 1, 'la acción cuenta como leída');
});

test('silenciada: no aparezco y se borra lo que esperaba; al volver a hablar se borra la clave', () => {
  const t = load();
  const corner = t.doc.body.appendChild(t.doc.createElement('button'));
  t.B.setAnchor(corner);
  t.B.offer(OBS(0)); t.advance(2000); t.click('[data-shv-bub="later"]');
  assert.equal(corner.getAttribute('data-shv-unread'), '1');
  t.B.offer(OBS(1));
  assert.equal(t.B.quiet(true), true);
  assert.equal(corner.hasAttribute('data-shv-unread'), false, 'silenciada no queda el punto');
  assert.equal(t.B.unread(), 0);
  assert.equal(t.ls.getItem('gn:shv:quiet'), 'true');
  t.advance(10000);
  assert.equal(t.box(), null);
  assert.equal(t.B.offer(OBS(2)), false);
  assert.equal(t.B.quiet(false), false);
  assert.equal(t.ls.getItem('gn:shv:quiet'), null);
  assert.equal(t.B.offer(OBS(2)), true);
  t.advance(2000);
  assert.ok(t.box());
  t.B.quiet(true);
  assert.equal(t.box(), null, 'silenciarme me cierra al instante');
  t.B.quiet(false);
  t.B.offer(OBS(3));
  t.ls.setItem('gn:shv:quiet', 'true'); // me silenciaron en otra pestaña mientras esperaba
  t.advance(10000);
  assert.equal(t.box(), null);
});

test('en el celular no me pego al rincón: el CSS me pone sobre la barra de abajo', () => {
  const t = load({ width: 600 });
  t.B.setAnchor(t.doc.body.appendChild(t.doc.createElement('button')));
  t.B.offer(OBS(1)); t.advance(2000);
  assert.equal(t.box().style.left, undefined);
  assert.match(t.B.CSS, /@media \(max-width:900px\)\{#shvBubble\{[^}]*bottom:72px/);
});

test('las huellas vistas: 60 días y como mucho 200, las más nuevas', () => {
  const t = load();
  const { prune, sig } = t.B._pure;
  const now = 1_800_000_000_000, map = {};
  for (let i = 0; i < 250; i++) map['k' + i] = now - i * 1000;
  map.viejo = now - 61 * 864e5;
  const out = prune(map, now);
  assert.equal(Object.keys(out).length, 200);
  assert.ok(out.k0 && out.k199 && !out.k200 && !out.viejo);
  assert.deepEqual(Object.keys(prune({ nuevo: now - 59 * 864e5, viejo: now - 61 * 864e5 }, now)), ['nuevo'], 'lo de más de 60 días se va');
  assert.match(sig({ module: 'm', id: 'i', text: ['a'] }), /^[0-9a-f]{8}$/);
  assert.notEqual(sig({ module: 'm', id: 'i', text: ['a'] }), sig({ module: 'm', id: 'i', text: ['b'] }));
});

// ------------------------------------------------------------------ SHE-2: conectada a la Bóveda
function bovedaDom(doc) {
  const side = doc.body.appendChild(doc.createElement('aside'));
  side.id = 'appSidebar';
  const c = side.appendChild(doc.createElement('aside'));
  c.setAttribute('data-shv-place', 'corner');
  c.className = 'shv-voice shv-corner';
  const main = c.appendChild(doc.createElement('div'));
  main.className = 'shv-voice__main';
  const sheet = doc.body.appendChild(doc.createElement('div'));
  sheet.id = 'sbrSheet';
  const c2 = sheet.appendChild(doc.createElement('aside'));
  c2.setAttribute('data-shv-place', 'corner');
  c2.appendChild(doc.createElement('div')).className = 'shv-voice__main';
  const more = doc.body.appendChild(doc.createElement('button'));
  more.id = 'sbrMore';
  const menu = doc.body.appendChild(doc.createElement('ul'));
  menu.id = 'gnTbSet';
}

test('SHE-2: salgo de mi rincón; lo que no leíste deja el punto y «Te dejé un mensaje» en los dos rincones', () => {
  const t = load({ dom: bovedaDom });
  const corner = t.doc.querySelector('#appSidebar [data-shv-place="corner"]');
  const more = t.doc.getElementById('sbrMore');
  t.B.offer(OBS(1)); t.advance(2000);
  assert.equal(t.box().style.left, '212px', 'al lado de mi rincón');
  t.advance(12000);
  assert.equal(corner.getAttribute('data-shv-unread'), '1');
  assert.equal(more.getAttribute('data-shv-unread'), '1', 'en el celular, el punto va en «Más»');
  const btns = t.doc.querySelectorAll('.shv-bub-open');
  assert.equal(btns.length, 2, 'uno en la Sidebar y otro en la hoja «Más»');
  assert.equal(btns[0].textContent, 'Te dejé un mensaje');
  let closed = 0;
  t.window.SidebarNav = { closeSheet() { closed++; } };
  btns[1].dispatchEvent({ type: 'click' });
  assert.equal(closed, 1, 'desde la hoja, primero la cierro');
  assert.equal(t.B.current().id, 'o1');
  assert.equal(t.doc.querySelectorAll('.shv-bub-open').length, 0);
  assert.equal(corner.hasAttribute('data-shv-unread'), false);
  t.click('[data-shv-bub="close"]');
  assert.equal(t.doc.activeElement, corner, 'el foco vuelve a mi rincón');
  assert.equal(corner.getAttribute('tabindex'), '-1');
});

test('SHE-2: en el celular, al cerrar, el foco vuelve a «Más»', () => {
  const t = load({ dom: bovedaDom, width: 600 });
  t.B.offer(OBS(1)); t.advance(2000); t.advance(12000);
  t.B.reopen();
  t.click('[data-shv-bub="close"]');
  assert.equal(t.doc.activeElement, t.doc.getElementById('sbrMore'));
});

test('SHE-2: cambiar de pantalla me guarda en el punto y borra lo que esperaba (uno por pantalla)', () => {
  const t = load({ dom: bovedaDom });
  t.B.offer(OBS(1)); t.B.offer(OBS(2)); t.advance(2000);
  t.window._fire('hashchange');
  assert.equal(t.box(), null);
  assert.equal(t.B.unread(), 1);
  t.advance(3000);
  assert.equal(t.box(), null, 'lo de la otra pantalla no aparece');
  t.advance(17000);
  t.B.offer(OBS(3));
  t.window._fire('hashchange');
  t.advance(20000);
  assert.equal(t.box(), null, 'tampoco lo que todavía no había salido');
  assert.equal(t.B.seen(OBS(1)), true);
  assert.equal(t.B.seen(OBS(3)), false, 'lo que no llegó a salir sigue sin ver');
  assert.equal(t.B.seen({ module: 'x' }), false);
});

test('SHE-2: «Silenciar a Shiruvana» en Ajustes, y «Que Shiruvana vuelva a aparecer»', () => {
  const t = load({ dom: bovedaDom });
  const got = [];
  t.doc.addEventListener('gn:shv-quiet', (e) => got.push(e.detail.quiet));
  const b = t.doc.getElementById('shvQuietBtn');
  assert.ok(b, 'está en el menú Ajustes');
  assert.equal(b.parentNode.parentNode.id, 'gnTbSet');
  assert.equal(b.getAttribute('role'), 'menuitem', 'el menú lo maneja con el teclado como a los demás');
  assert.equal(b.parentNode.getAttribute('role'), 'none');
  assert.equal(b.querySelector('.shv-quiet__t').textContent, 'Silenciar a Shiruvana');
  b.dispatchEvent({ type: 'click' });
  assert.equal(t.ls.getItem('gn:shv:quiet'), 'true');
  assert.equal(b.querySelector('.shv-quiet__t').textContent, 'Que Shiruvana vuelva a aparecer');
  assert.match(t.doc.getElementById('shvBubbleLive').textContent, /^Listo: ya no aparezco sola/);
  b.dispatchEvent({ type: 'click' });
  assert.equal(t.ls.getItem('gn:shv:quiet'), null);
  assert.equal(b.querySelector('.shv-quiet__t').textContent, 'Silenciar a Shiruvana');
  assert.match(t.doc.getElementById('shvBubbleLive').textContent, /^Listo: vuelvo a aparecer/);
  assert.deepEqual(got, [true, false], 'los módulos se enteran y vuelven a hablar adentro');
  t.B.wire();
  assert.equal(t.doc.querySelectorAll('#shvQuietBtn').length, 1, 'una sola vez');
});

// ------------------------------------------------------------------ SHE-3: los módulos me hablan por speak()
const MSG = (key, text, kind) => ({ key, kind: kind || 'recomienda', text });
function moduleBox(t, hidden) {
  const sec = t.doc.body.appendChild(t.doc.createElement('section'));
  if (hidden) sec.setAttribute('hidden', '');
  return { sec, box: sec.appendChild(t.doc.createElement('div')) };
}

test('SHE-3: lo que recomienda un módulo va a mi globo, con su fundamento, y el módulo queda sin bloque', () => {
  const t = load({ dom: bovedaDom });
  const { box } = moduleBox(t);
  assert.equal(t.B.speak(box, MSG('leg', 'Tu colección más avanzada es X.'), { module: 'logros', source: 'tus logros (API oficial)', key: 'leg|X' }), 'bubble');
  assert.equal(box.children.length, 0, 'nada escrito en el módulo');
  t.advance(2000);
  assert.equal(t.B.current().module, 'logros');
  assert.deepEqual([...t.B.current().text], ['Tu colección más avanzada es X.']);
  assert.equal(t.box().querySelector('.shv-voice__basis').textContent, 'Lo sé por: tus logros (API oficial) · en este navegador');
  t.click('[data-shv-bub="close"]');
  assert.equal(t.B.speak(box, MSG('leg', 'Tu colección más avanzada es X.'), { module: 'logros', source: 's', key: 'leg|X' }), 'none', 'misma novedad: no la repito');
  t.window._fire('hashchange');
  assert.equal(t.B.speak(box, MSG('leg', 'Tu colección más avanzada es X.'), { module: 'logros', source: 's', key: 'leg|X' }), 'none', 'ni en otra visita');
  assert.equal(t.B.speak(box, MSG('leg', 'Tu colección más avanzada es Y.'), { module: 'logros', source: 's', key: 'leg|Y' }), 'bubble', 'otra novedad, otra visita: sí');
});

test('SHE-3: uno por visita a cada pantalla; los avisos, lo que el módulo pide y silenciada, quedan escritos como siempre', () => {
  const t = load({ dom: bovedaDom });
  const { box } = moduleBox(t);
  assert.equal(t.B.speak(box, MSG('a', 'uno'), { module: 'heredad', source: 's' }), 'bubble');
  assert.equal(t.B.speak(box, MSG('b', 'dos'), { module: 'heredad', source: 's' }), 'none', 'marcar un nodo no me hace aparecer de nuevo');
  assert.equal(t.B.speak(box, MSG('c', 'tres'), { module: 'raids', source: 's' }), 'bubble', 'cada pantalla tiene su turno');
  const w = t.B.speak(box, MSG('ready', 'Tenés 2 objetivos listos.', 'advierte'), { module: 'camara', source: 's' });
  assert.equal(w, 'inline');
  assert.equal(box.children.length, 1);
  assert.equal(box.children[0].className.includes('shv-voice--advierte'), true);
  const box2 = moduleBox(t).box;
  assert.equal(t.B.speak(box2, MSG('perm:1', 'A la Key le faltan permisos'), { module: 'cuentas', source: 's', keep: (m) => /^perm:/.test(m.key) }), 'inline');
  assert.equal(box2.children.length, 1);
  t.B.quiet(true);
  const box3 = moduleBox(t).box;
  assert.equal(t.B.speak(box3, MSG('z', 'zeta'), { module: 'inventario', source: 's' }), 'inline', 'silenciada te hablo adentro');
  assert.equal(box3.children[0].querySelector('.shv-voice__body').children[0].textContent, 'zeta');
  assert.equal(t.B.speak(null, MSG('z', 'z'), {}), 'none');
  assert.equal(t.B.speak(box3, null, {}), 'none');
});

test('SHE-3: si el módulo se dibujó oculto, salgo cuando abrís esa pantalla (y solo la última versión)', () => {
  const t = load({ dom: bovedaDom });
  const { sec, box } = moduleBox(t, true);
  assert.equal(t.B.speak(box, MSG('a', 'vieja'), { module: 'logros', source: 's' }), 'later');
  assert.equal(t.B.speak(box, MSG('b', 'nueva'), { module: 'logros', source: 's' }), 'later');
  t.advance(5000);
  assert.equal(t.box(), null, 'oculto no aparezco');
  t.window._fire('hashchange');
  t.advance(5000);
  assert.equal(t.box(), null, 'cambiaste a otra pantalla, no a esta: sigo esperando');
  sec.removeAttribute('hidden');
  t.window._fire('hashchange');
  t.advance(2399);
  assert.equal(t.B.current(), null, 'espero a que la pantalla se arme y 2 segundos');
  t.advance(1);
  assert.deepEqual([...t.B.current().text], ['nueva']);
  t.window._fire('hashchange');
  t.advance(5000);
  assert.equal(t.box(), null, 'lo que esperaba ya salió: no vuelve');
  const lost = t.doc.createElement('div');
  assert.equal(t.B.speak(lost, MSG('c', 'suelta'), { module: 'raids', source: 's' }), 'later', 'fuera de la página tampoco');
});

test('SHE-3: lo que esperaba sale una sola vez, y si la pantalla ya habló con lo nuevo, lo viejo se olvida', () => {
  const t = load({ dom: bovedaDom });
  const a = moduleBox(t, true);
  t.B.speak(a.box, MSG('a', 'pendiente'), { module: 'logros', source: 's' });
  a.sec.removeAttribute('hidden');
  t.window._fire('hashchange');
  t.advance(400);
  t.window._fire('hashchange'); // te fuiste antes de que saliera
  t.advance(5000);
  assert.equal(t.box(), null, 'no la vuelvo a ofrecer en la pantalla siguiente');
  const b = moduleBox(t, true);
  t.B.speak(b.box, MSG('v', 'vieja'), { module: 'raids', source: 's' });
  b.sec.removeAttribute('hidden');
  assert.equal(t.B.speak(b.box, MSG('n', 'nueva'), { module: 'raids', source: 's' }), 'bubble');
  t.advance(2000);
  t.click('[data-shv-bub="close"]');
  t.window._fire('hashchange');
  t.advance(5000);
  assert.equal(t.box(), null, 'la vieja no aparece después');
});

test('versión, reglas de la casa y el orden de carga', () => {
  assert.match(SRC, /Versión: 1\.2\.0/);
  assert.ok(!/innerHTML|insertAdjacentHTML/.test(SRC), 'texto, nunca HTML');
  assert.ok(!/fetch\(|GW2Api/.test(SRC), 'no pido nada a la API');
  const css = SRC.match(/var CSS = \[([\s\S]*?)\]\.join/)[1];
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(css.replace(/'#' \+ ID/g, '')), 'colores del theme, sin hex');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.ok(!/aria-modal/.test(css), 'no soy un modal');
  const src = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  const i = src.indexOf('js/shv-bubble.js');
  assert.ok(i > src.indexOf('js/shv-core.js') && src.indexOf('js/shv-core.js') >= 0, 'después de shv-core');
  assert.ok(i < src.indexOf('js/shv-wallet.js'), 'antes de la Cartera, que me habla');
});
