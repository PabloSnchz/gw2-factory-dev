// BL-078 UNI-1: el reloj común y el mapa de íconos (js/gn-kit.js), todavía inerte.
// Corre con: node --test tests/*.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/gn-kit.js');
const noop = () => {};

function load(doc) {
  const win = { console: { info: noop }, setInterval: () => 7, clearInterval: noop };
  win.window = win;
  if (doc) win.document = doc;
  vm.runInContext(SRC, vm.createContext(win));
  return win.GNKit;
}
const K = load();
const P = K._pure;
const T = (s) => Date.parse(s);

test('1.0.1: lo carga js/modules.json antes de Raids (no index.html), dentro de 40 KB, sin pedidos ni almacenamiento', () => {
  assert.match(SRC, /\* Versión: 1\.4\.0 /);
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.includes('js/gn-kit.js'), 'está en el manifiesto');
  assert.ok(man.indexOf('js/gn-kit.js') < man.indexOf('js/raids-view.js'), 'antes de quien lo usa');
  assert.doesNotMatch(read('index.html'), /gn-kit\.js/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
});

test('próximos resets: diario 00:00 UTC, PSNA 08:00 UTC y semanal lunes 07:30 UTC', () => {
  assert.equal(P.nextDaily(T('2026-10-27T21:31:00Z')), T('2026-10-28T00:00:00Z'));
  assert.equal(P.nextPsna(T('2026-10-27T07:59:00Z')), T('2026-10-27T08:00:00Z'));
  assert.equal(P.nextPsna(T('2026-10-27T08:00:00Z')), T('2026-10-28T08:00:00Z'));
  assert.equal(P.nextWeekly(T('2026-10-27T21:31:00Z')), T('2026-11-02T07:30:00Z'), 'martes → lunes que viene');
  assert.equal(P.nextWeekly(T('2026-11-02T07:29:00Z')), T('2026-11-02T07:30:00Z'), 'lunes antes de las 07:30 → hoy');
  assert.equal(P.nextWeekly(T('2026-11-02T07:30:00Z')), T('2026-11-09T07:30:00Z'), 'lunes a las 07:30 → el próximo');
  assert.equal(P.nextWeekly(T('2026-11-01T23:00:00Z')), T('2026-11-02T07:30:00Z'), 'domingo → mañana');
});

test('cuenta regresiva como Metas', () => {
  assert.equal(P.left(59 * 1000), 'menos de 1 min');
  assert.equal(P.left(23 * 60000), '23 min');
  assert.equal(P.left(5 * 3600000), '5 h');
  assert.equal(P.left(5 * 3600000 + 7 * 60000), '5 h 7 min');
  assert.equal(P.left(3 * 86400000 + 7 * 3600000 + 5 * 60000), '3 d 7 h');
  assert.equal(P.left(-5), 'menos de 1 min');
});

test('dorado = cerca: menos de 1 h para el diario y el PSNA, menos de 24 h para el semanal', () => {
  assert.equal(P.value('daily', T('2026-10-27T23:00:00Z')).soon, true);
  assert.equal(P.value('daily', T('2026-10-27T22:59:00Z')).soon, false);
  assert.equal(P.value('psna', T('2026-10-27T07:10:00Z')).soon, true);
  assert.equal(P.value('weekly', T('2026-11-01T08:00:00Z')).soon, true);
  assert.equal(P.value('weekly', T('2026-11-01T07:00:00Z')).soon, false);
  assert.equal(P.value('server', T('2026-10-27T21:31:00Z')).text, '21:31 UTC');
  assert.equal(P.value('local', 0).soon, false, 'la hora no tiene «cerca»');
  assert.equal(P.value('nada', 0), null);
});

test('el reloj dibuja ícono, nombre y valor; la hora fija va en el title; grande solo si se pide', () => {
  const h = P.clockHTML('weekly', T('2026-11-01T08:00:00Z'));
  assert.match(h, /^<span class="gk is-soon" data-gk="weekly" title="Los lunes a las 07:30 UTC"><img src="assets\/icons\/155064\.png" width="20" height="20" alt="">/);
  assert.match(h, /<small>Reset semanal<\/small><b>en 23 h 30 min<\/b>/);
  assert.match(P.clockHTML('local', 0, { big: true }), /class="gk gk--big" data-gk="local" data-gk-big="1"[^>]*><img [^>]*width="24"/);
  assert.equal(P.clockHTML('nada', 0), '');
  const row = P.clocksHTML(['daily', 'psna'], T('2026-10-27T21:31:00Z'));
  assert.match(row, /^<span class="gk-row" role="group" aria-label="Relojes">/);
  assert.ok(row.indexOf('data-gk="daily"') < row.indexOf('data-gk="psna"'), 'en el orden pedido');
});

test('los íconos del mapa existen en el repo; los que faltan no dibujan nada y el alt queda vacío', () => {
  Object.entries(P.ICONS).forEach(([k, e]) => {
    if (!e.src || /^https:/.test(e.src)) return;
    assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'icons', e.src)), k + ' → assets/icons/' + e.src);
  });
  Object.values(P.CLOCKS).forEach((c) => assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'icons', c.icon)), c.icon));
  assert.equal(K.icon('tab.raids.encuentros', 18), '<img class="gk-ic" src="assets/icons/784370.png" width="18" height="18" alt="" loading="lazy">', 'elegido por Pablo');
  // UNI-6b (Pablo, 2026-10-28): Ayuda con «Primeros pasos»; Foros y Sitio oficial comparten ícono por su elección.
  assert.equal(K.iconSrc('link.ayuda'), 'assets/icons/Welcome/102367.png');
  assert.equal(K.iconSrc('link.wiki'), 'assets/icons/Welcome/102353.png');
  assert.equal(K.iconSrc('link.foros'), K.iconSrc('link.oficial'));
  assert.equal(K.iconSrc('link.apikey'), 'assets/icons/Welcome/2604909.png');
  // UNI-7b (Pablo, 2026-10-28): las 4 pestañas que faltaban.
  assert.equal(K.iconSrc('tab.acc.mias'), 'assets/icons/578844.png');
  assert.equal(K.iconSrc('tab.acc.llavero'), 'assets/icons/Cuentas/LLave.png');
  assert.equal(K.iconSrc('tab.rs.recompensas'), 'assets/icons/Cuentas/255373.png');
  assert.equal(K.iconSrc('tab.rs.pelea'), 'assets/icons/784370.png');
  // BUI-4b (Pablo, 2026-10-29): las 4 pestañas de Builds.
  assert.equal(K.iconSrc('tab.bld.lib'), 'assets/icons/1228891.png');
  assert.equal(K.iconSrc('tab.bld.editor'), 'assets/icons/63127.png');
  assert.equal(K.iconSrc('tab.bld.mine'), 'assets/icons/Cuentas/255373.png');
  assert.equal(K.iconSrc('tab.bld.import'), 'assets/icons/155033.png');
  assert.equal(K.icon('no.existe'), '');
  assert.equal(K.icon('tab.raids.alas', 18), '<img class="gk-ic" src="assets/icons/raids/raid-icon.png" width="18" height="18" alt="" loading="lazy">');
  const p = P.pending();
  assert.equal(p.missing.length, 0, 'Pablo eligió todas (2026-10-28)');
  assert.ok(p.proposed.includes('clock.psna'));
});

test('solo presentación: sin animaciones, sin ocultar el foco; todo queda dentro de .gk', () => {
  assert.doesNotMatch(P.CSS, /transition|animation|@keyframes|outline:\s*(none|0)/);
  P.CSS.split('\n').forEach((l) => assert.match(l, /^\.gk/, l.slice(0, 40)));
});

test('tick: pone al día valor y dorado sin redibujar; sin relojes a la vista, se apaga', () => {
  const b = { textContent: 'en 1 h' }, cls = new Set();
  const node = { getAttribute: () => 'daily', querySelector: () => b, classList: { add: (c) => cls.add(c), remove: (c) => cls.delete(c) } };
  let nodes = [node];
  const doc = { querySelectorAll: () => nodes, getElementById: () => null, createElement: () => ({}), head: { appendChild: noop } };
  const G = load(doc);
  assert.equal(G.start(), true);
  assert.equal(G.tick(T('2026-10-27T23:30:00Z')), 1);
  assert.equal(b.textContent, 'en 30 min');
  assert.ok(cls.has('is-soon'));
  G.tick(T('2026-10-27T12:00:00Z'));
  assert.ok(!cls.has('is-soon'));
  nodes = [];
  assert.equal(G.tick(), 0);
  assert.equal(G._state().running, false);
});
