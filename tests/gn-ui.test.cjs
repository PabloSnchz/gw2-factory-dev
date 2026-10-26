// Ventana común y avisos (BL-070 paso 5, TOP-1): js/gn-ui.js. Corre con: node --test tests/*.test.cjs
// Avisos con la misma forma de window.toast de app.js (ttl, close, legacy), sin emojis, errores que duran
// y se anuncian enseguida, como mucho 3 a la vez; ventana con el foco adentro, Escape, Tab que no se escapa
// y el foco de vuelta; contraste de sus textos en los 19 themes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/gn-ui.js');

// ------------------------------------------------------------------ DOM mínimo
function fakeDom() {
  const D = { activeElement: null };
  function node(tag) {
    const n = {
      tagName: String(tag).toUpperCase(), attrs: {}, children: [], parentNode: null, listeners: {}, textContent: '', innerHTML: '', value: '', hidden: false,
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') String(v).split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c)); },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      removeAttribute(k) { delete this.attrs[k]; },
      appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); this.children.push(c); c.parentNode = this; return c; },
      removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      focus() { D.activeElement = this; },
    };
    return n;
  }
  const all = (n, out) => { out.push(n); n.children.forEach((c) => all(c, out)); return out; };
  const documentElement = node('html'), head = node('head'), body = node('body');
  documentElement.appendChild(head); documentElement.appendChild(body);
  const doc = {
    readyState: 'complete', documentElement, head, body,
    get activeElement() { return D.activeElement; },
    createElement: (t) => node(t),
    getElementById: (id) => all(documentElement, []).find((n) => n.attrs.id === id) || null,
    addEventListener() {},
  };
  D.doc = doc; D.node = node; D.all = () => all(documentElement, []);
  return D;
}
// Dispara un evento que sube por los padres, como en el navegador.
function fire(target, type, extra) {
  const e = Object.assign({ type, target, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; } }, extra || {});
  for (let n = target; n && !e.stopped; n = n.parentNode) (n.listeners[type] || []).forEach((f) => f(e));
  return e;
}
const byClass = (D, c) => D.all().filter((n) => n.classList.contains(c));
const text = (n) => [n.textContent].concat(n.children.map(text)).join(' ').replace(/\s+/g, ' ').trim();

function box(withHost) {
  const D = fakeDom();
  let T = 1000;
  const timers = [];
  if (withHost !== false) {
    const host = D.node('div');
    host.setAttribute('id', 'toasts'); host.setAttribute('class', 'toasts'); host.setAttribute('aria-live', 'polite'); host.setAttribute('aria-atomic', 'true');
    D.doc.body.appendChild(host);
  }
  const sb = {
    console: { info() {}, warn() {} }, document: D.doc, Promise, Math, Date: { now: () => T },
    setTimeout: (f, ms) => { timers.push({ f, at: T + (ms || 0), on: true }); return timers.length; },
    clearTimeout: (i) => { if (timers[i - 1]) timers[i - 1].on = false; },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'gn-ui.js' });
  const advance = (ms) => { T += ms; timers.filter((t) => t.on && t.at <= T).forEach((t) => { t.on = false; t.f(); }); };
  return { sb, D, advance, timers };
}
const tick = () => new Promise((r) => setImmediate(r));

// ------------------------------------------------------------------ archivo
test('archivo: presupuesto, versión, manifiesto con los gn-*, fuera de index.html, sin emojis ni almacenamiento', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024, Buffer.byteLength(SRC) + ' bytes');
  assert.match(SRC, /\* Versión: 1\.0\.1\n/);
  const { sb } = box();
  assert.equal(sb.GNUI.version, '1.0.1');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u, 'sin emojis');
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|Storage\.|fetch\(/);
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(code, /(^|[^\w.])(window\.)?(alert|confirm|prompt)\s*\(\s*['"]/, 'no usa los diálogos del navegador');
  const man = JSON.parse(read('js/modules.json')).modules;
  const i = man.findIndex((m) => m.src === 'js/gn-ui.js');
  assert.ok(i >= 0 && man[i].v === '1.0.1', 'en el manifiesto con su versión');
  assert.ok(i === man.findIndex((m) => m.src === 'js/gn-shell.js') + 1, 'junto a los gn-*, antes de los módulos');
  assert.doesNotMatch(read('index.html'), /gn-ui\.js/);
  const MAX = Number((read('js/boot.js').match(/var MAX = (\d+);/) || [])[1]);
  assert.equal(MAX, 40, 'el cargador admite 40 módulos (D5)');
  assert.ok(man.length <= MAX);
});

// ------------------------------------------------------------------ puro
test('tipos y tiempos: los de app.js (3,5 s, 0 o negativo = queda) y un error dura al menos 6 s', () => {
  const P = box().sb.GNUI._pure;
  assert.deepEqual(['ok', 'success', 'warn', 'warning', 'error', 'err', 'info', '', undefined, 'otro'].map(P.kindOf),
    ['success', 'success', 'warn', 'warn', 'error', 'error', 'info', 'info', 'info', 'info']);
  assert.equal(P.ttlOf('info', {}), 3500);
  assert.equal(P.ttlOf('info', undefined), 3500);
  assert.equal(P.ttlOf('success', { ttl: 1400 }), 1400);
  assert.equal(P.ttlOf('info', { ttl: 0 }), 0, '0 = persistente');
  assert.equal(P.ttlOf('info', { ttl: -1 }), 0);
  assert.equal(P.ttlOf('info', { ttl: 'x' }), 0, 'como app.js: lo que no es número no programa reloj');
  assert.equal(P.ttlOf('error', { ttl: 2500 }), 6000);
  assert.equal(P.ttlOf('error', {}), 6000);
  assert.equal(P.ttlOf('error', { ttl: 9000 }), 9000);
  assert.equal(P.ttlOf('error', { ttl: 0 }), 0, 'un error persistente sigue persistente');
  assert.deepEqual(JSON.parse(JSON.stringify(P.LABEL)), { info: 'Aviso', success: 'Listo', warn: 'Ojo', error: 'No se pudo' });
  Object.keys(P.SVG).forEach((k) => assert.match(P.SVG[k], /^<svg [^>]*aria-hidden="true"/, k));
  assert.deepEqual(JSON.parse(JSON.stringify(P.paragraphs('uno\n\ndos'))), ['uno', 'dos']);
  assert.deepEqual(JSON.parse(JSON.stringify(P.paragraphs(['a', ' ', 'b']))), ['a', 'b']);
});

test('CSS: solo los textos del theme, 44 px en el celular, foco visible, movimiento reducido y avisos por encima de la ventana', () => {
  const C = box().sb.GNUI._pure.CSS;
  const colors = [...C.matchAll(/(?:^|[;{])color:([^;}]+)/g)].map((m) => m[1].trim());
  assert.ok(colors.length >= 8);
  colors.forEach((c) => assert.ok(/^var\(--(tx-1|tx-2|gn-tc)\)$/.test(c), 'color de texto del theme: ' + c));
  assert.match(C, /\.gn-toast__ico\{[^}]*color:var\(--gn-tc\)/, 'el color del tipo va solo en el ícono');
  assert.match(C, /\.gn-dlg__btn\{min-height:44px/);
  assert.match(C, /\.gn-dlg__x\{flex:0 0 44px;width:44px;height:44px/);
  assert.match(C, /@media \(max-width:640px\)\{[^]*\.gn-toast__x\{flex-basis:44px;width:44px;height:44px\}/);
  assert.match(C, /:focus-visible\{outline:2px solid var\(--acc-1/);
  assert.match(C, /@media \(prefers-reduced-motion:reduce\)\{\.gn-toast,\.gn-dlg__box\{animation:none\}/);
  const z = (sel) => Number((C.match(new RegExp(sel.replace(/[.#]/g, '\\$&') + '\\{[^}]*z-index:(\\d+)')) || [])[1]);
  assert.ok(z('.gn-dlg') > 10000, 'la ventana sobre los modales de hoy (10000)');
  assert.ok(z('#toasts.gn-ui') > z('.gn-dlg'), 'los avisos se ven aunque haya una ventana abierta');
  assert.match(C, /env\(safe-area-inset-bottom/);
});

test('en los 19 themes los textos de avisos y ventana llegan a 4.5:1 sobre sus superficies', () => {
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
    const card = G.parse(sf['--bg-1']), bg0 = G.over(G.parse(t['--bg-0']), [255, 255, 255, 1]), bg2 = G.parse(sf['--bg-2']);
    ['--tx-1', '--tx-2'].forEach((k) => [['aviso y ventana', card], ['campo de texto', bg0], ['botón', bg2]].forEach(([n, s]) => {
      const r = G.contrast(G.over(G.parse(eff[k]), s), s);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
  });
  assert.deepEqual(fails, []);
});

// ------------------------------------------------------------------ humo: avisos
test('avisos: toman #toasts, error a la región de alerta y el resto a la amable, sin emojis, con su palabra', () => {
  const { sb, D } = box();
  assert.ok(D.doc.getElementById('gnUiCss'), 'el estilo entra una sola vez');
  assert.equal(sb.toast, sb.GNUI.toast, 'window.toast es el nuevo');
  assert.equal(typeof sb.toast.legacy, 'function');
  const a = sb.toast('success', 'Key guardada', { ttl: 1400 });
  const host = D.doc.getElementById('toasts');
  assert.ok(host.classList.contains('gn-ui'));
  assert.equal(host.getAttribute('aria-live'), null, 'el anfitrión ya no relee todo');
  assert.equal(host.getAttribute('aria-atomic'), null);
  const [alertQ, politeQ] = host.children;
  assert.equal(alertQ.getAttribute('role'), 'alert');
  assert.equal(alertQ.getAttribute('aria-live'), 'assertive');
  assert.equal(politeQ.getAttribute('aria-live'), 'polite');
  assert.equal(a.el.parentNode, politeQ);
  assert.ok(a.el.classList.contains('gn-toast--success'));
  assert.equal(text(a.el), 'Listo Key guardada ×');
  assert.match(a.el.children[0].innerHTML, /^<svg/);
  const e = sb.toast('error', 'La API no respondió.');
  assert.equal(e.el.parentNode, alertQ);
  assert.match(text(e.el), /^No se pudo La API no respondió\./);
  assert.equal(e.el.children[2].getAttribute('aria-label'), 'Cerrar aviso');
  const l = sb.toast.legacy('ok viejo', 'ok');
  assert.ok(l.el.classList.contains('gn-toast--success'));
  const t = sb.toast('warn', 'x', { title: 'Permiso' });
  assert.match(text(t.el), /^Permiso x/);
  assert.ok(D.all().every((n) => !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(n.textContent + n.innerHTML)), 'sin emojis en pantalla');
});

test('avisos: el reloj de cada uno, el error dura 6 s, el persistente queda, el mouse lo frena, la X lo cierra y hay 3 como mucho', () => {
  const { sb, D, advance } = box(false);
  const host = D.doc.getElementById('toasts');
  assert.equal(host, null);
  const a = sb.toast('info', 'uno');
  assert.ok(D.doc.getElementById('toasts'), 'sin #toasts lo crea');
  const e = sb.toast('error', 'dos', { ttl: 2500 });
  const p = sb.toast('info', 'tres', { ttl: 0 });
  advance(3500);
  assert.ok(a.el.classList.contains('gn-toast--out'));
  advance(200);
  assert.equal(a.el.parentNode, null, 'se fue');
  assert.ok(e.el.parentNode, 'el error sigue a los 3,7 s');
  fire(e.el, 'mouseenter');
  advance(10000);
  assert.ok(!e.el.classList.contains('gn-toast--out'), 'con el mouse encima no se cierra');
  fire(e.el, 'mouseleave');
  advance(2299);
  assert.ok(!e.el.classList.contains('gn-toast--out'));
  advance(2);
  assert.ok(e.el.classList.contains('gn-toast--out'), 'a los 6 s de reloj corrido');
  advance(60000);
  assert.ok(p.el.parentNode && !p.el.classList.contains('gn-toast--out'), 'ttl 0 queda');
  fire(p.el.children[2], 'click');
  advance(200);
  assert.equal(p.el.parentNode, null, 'la X lo cierra');
  const many = [1, 2, 3, 4].map((i) => sb.toast('info', 'n' + i, { ttl: 0 }));
  assert.ok(many[0].el.classList.contains('gn-toast--out'), 'el cuarto cierra al más viejo');
  assert.ok(many.slice(1).every((m) => !m.el.classList.contains('gn-toast--out')));
  many[1].close(); many[1].close();
  assert.ok(many[1].el.classList.contains('gn-toast--out'), 'cerrar dos veces no rompe');
});

// ------------------------------------------------------------------ humo: ventana
test('ventana: confirmar peligroso arranca en Cancelar, Tab no se escapa, Escape cancela y el foco vuelve', async () => {
  const { sb, D } = box();
  const opener = D.node('button'); D.doc.body.appendChild(opener); opener.focus();
  const pr = sb.GNUI.confirm({ title: '¿Borrar la Key «alter 2»?', text: 'Se borra solo de este navegador.', okLabel: 'Borrar', danger: true, icon: 'assets/icons/Welcome/156107.png' });
  const wrap = byClass(D, 'gn-dlg')[0];
  assert.ok(wrap.classList.contains('gn-dlg--danger'));
  assert.ok(D.doc.documentElement.classList.contains('gn-dlg-open'));
  const boxEl = byClass(D, 'gn-dlg__box')[0];
  assert.equal(boxEl.getAttribute('role'), 'alertdialog');
  assert.equal(boxEl.getAttribute('aria-modal'), 'true');
  const title = D.doc.getElementById(boxEl.getAttribute('aria-labelledby'));
  assert.equal(title.textContent, '¿Borrar la Key «alter 2»?');
  assert.equal(text(D.doc.getElementById(boxEl.getAttribute('aria-describedby'))), 'Se borra solo de este navegador.');
  assert.equal(byClass(D, 'gn-dlg__plate')[0].children[0].getAttribute('alt'), '');
  const btns = byClass(D, 'gn-dlg__btn');
  assert.deepEqual(btns.map((b) => b.textContent), ['Cancelar', 'Borrar']);
  assert.ok(btns[1].classList.contains('gn-dlg__btn--danger'));
  assert.equal(D.activeElement, btns[0], 'en una pregunta peligrosa el foco arranca en Cancelar');
  btns[1].focus();
  const tab = fire(btns[1], 'keydown', { key: 'Tab' });
  assert.ok(tab.defaultPrevented);
  assert.ok(tab.stopped, 'la trampa de foco de otra ventana (Keys escucha en document) no se lleva el Tab');
  assert.equal(D.activeElement, byClass(D, 'gn-dlg__x')[0], 'Tab desde el último vuelve al primero');
  assert.ok(fire(D.activeElement, 'keydown', { key: 'Tab' }).stopped, 'tampoco en el medio');
  fire(D.activeElement, 'keydown', { key: 'Tab', shiftKey: true });
  assert.equal(D.activeElement, btns[1], 'Mayús+Tab desde el primero va al último');
  fire(btns[1], 'keydown', { key: 'Escape' });
  assert.equal(await pr, false);
  assert.equal(byClass(D, 'gn-dlg').length, 0, 'se fue de la página');
  assert.ok(!D.doc.documentElement.classList.contains('gn-dlg-open'));
  assert.equal(D.activeElement, opener, 'el foco vuelve al que la abrió');
});

test('ventana: confirmar con el botón, el fondo cancela, la X cancela', async () => {
  const { sb, D } = box();
  let pr = sb.GNUI.confirm({ title: '¿Restaurar?', okLabel: 'Restaurar' });
  assert.equal(D.activeElement.textContent, 'Restaurar', 'sin peligro el foco va a la acción');
  fire(byClass(D, 'gn-dlg__btn')[1], 'click');
  assert.equal(await pr, true);
  pr = sb.GNUI.confirm({ title: '¿Seguro?' });
  fire(byClass(D, 'gn-dlg__bg')[0], 'click');
  assert.equal(await pr, false);
  pr = sb.GNUI.confirm({ title: '¿Seguro?' });
  fire(byClass(D, 'gn-dlg__x')[0], 'click');
  assert.equal(await pr, false);
  const al = sb.GNUI.alert({ title: 'No se pudo restaurar', text: 'El archivo no es una copia de la Bóveda.' });
  const b = byClass(D, 'gn-dlg__btn');
  assert.deepEqual(b.map((x) => x.textContent), ['Entendido']);
  fire(b[0], 'keydown', { key: 'Escape' });
  assert.equal(await al, undefined);
  assert.equal(byClass(D, 'gn-dlg').length, 0);
});

test('ventana: pedir un texto trae el valor, Enter guarda, vacío no sigue y cancelar devuelve null', async () => {
  const { sb, D } = box();
  let pr = sb.GNUI.prompt({ title: 'Renombrar la Key', label: 'Nombre nuevo', value: 'alter 2', maxLength: 40 });
  const input = byClass(D, 'gn-dlg__in')[0];
  assert.equal(D.activeElement, input, 'el foco entra al campo');
  assert.equal(input.value, 'alter 2');
  assert.equal(input.getAttribute('maxlength'), '40');
  const lbl = D.all().find((n) => n.classList.contains('gn-dlg__lbl'));
  assert.equal(lbl.getAttribute('for'), input.getAttribute('id'));
  assert.equal(lbl.textContent, 'Nombre nuevo');
  input.value = '  farm  ';
  fire(input, 'keydown', { key: 'Enter' });
  assert.equal(await pr, 'farm');
  pr = sb.GNUI.prompt({ title: 'Renombrar', label: 'Nombre' });
  const in2 = byClass(D, 'gn-dlg__in')[0];
  in2.value = '   ';
  fire(byClass(D, 'gn-dlg__btn')[1], 'click');
  await tick();
  assert.equal(byClass(D, 'gn-dlg').length, 1, 'vacío no cierra');
  assert.equal(in2.getAttribute('aria-invalid'), 'true');
  const err = byClass(D, 'gn-dlg__err')[0];
  assert.equal(err.hidden, false);
  assert.equal(err.textContent, 'Escribí algo para seguir.');
  fire(in2, 'keydown', { key: 'Escape' });
  assert.equal(await pr, null);
});

test('TOP-2: renombrar, eliminar, restaurar y liberar la caché preguntan con esta ventana; el navegador queda solo de respaldo', () => {
  const strip = (s) => s.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l));
  const nat = /(^|[^\w.])(alert|confirm|prompt)\s*\(/;
  const app = strip(read('js/app.js')).filter((l) => nat.test(l));
  assert.equal(app.length, 2, app.join('\n'));
  app.forEach((l) => assert.match(l, /window\.GNUI \? await GNUI\.(prompt|confirm)\(/, l.trim()));
  const SM = read('js/settings-manager.js');
  assert.deepEqual(strip(SM).filter((l) => nat.test(l)).map((l) => l.trim()), ['var yes = confirm(msg);'], 'en settings-manager, el navegador solo como respaldo de ask()');
  assert.equal((SM.match(/(await|return) ask\(/g) || []).length, 3, 'las 3 preguntas van por ask()');
  assert.match(SM, /window\.GNUI\.alert\(\{ title: 'No se pudo restaurar'/);
});

test('ventanas una sobre otra: Escape cierra solo la de arriba', async () => {
  const { sb, D } = box();
  const a = sb.GNUI.confirm({ title: 'A' });
  const b = sb.GNUI.confirm({ title: 'B' });
  const boxes = byClass(D, 'gn-dlg__box');
  assert.equal(boxes.length, 2);
  fire(boxes[0], 'keydown', { key: 'Escape' });
  assert.equal(byClass(D, 'gn-dlg').length, 2, 'la de abajo no responde mientras hay otra arriba');
  fire(boxes[1], 'keydown', { key: 'Escape' });
  assert.equal(await b, false);
  assert.ok(D.doc.documentElement.classList.contains('gn-dlg-open'), 'queda una abierta');
  fire(boxes[0], 'keydown', { key: 'Escape' });
  assert.equal(await a, false);
  assert.ok(!D.doc.documentElement.classList.contains('gn-dlg-open'));
});
