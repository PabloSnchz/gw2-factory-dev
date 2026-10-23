// Dónde le hablo al jugador (DEC-025): Bienvenida, modal de API Keys y modal de guías.
// En la Bienvenida con API Key soy «Shiruvana te guía» (BL-058, WEL-3): un mensaje por vez,
// por prioridad, y solo sobre la Bóveda (DEC-032). Se prueba con el componente de voz real.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'shiruvana-places.js'), 'utf8');
const VOICE = fs.readFileSync(path.join(ROOT, 'js', 'shiruvana.js'), 'utf8');
const ALL = ['account', 'wallet', 'progression', 'unlocks', 'inventories', 'tradingpost', 'characters'];
const NOW = Date.parse('2026-10-23T12:00:00Z');

// DOM mínimo: árbol, atributos, textContent, querySelector simple y closest.
function matches(n, sel) {
  return sel.split(',').some((s) => {
    s = s.trim();
    let m = s.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
    if (m) return m[1] in n.attrs && (m[2] === undefined || n.attrs[m[1]] === m[2]);
    m = s.match(/^(\w*)\.([\w-]+)$/);
    if (m) return (!m[1] || n.tag === m[1]) && (' ' + n.className + ' ').includes(' ' + m[2] + ' ');
    return n.tag === s;
  });
}
function el(tag, extra) {
  const n = Object.assign({ tag, children: [], attrs: {}, className: '', parentNode: null, listeners: {}, _text: '' }, extra || {});
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.appendChild = (c) => { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = n; n.children.push(c); return c; };
  n.insertBefore = (c, ref) => { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = n; const i = ref ? n.children.indexOf(ref) : -1; if (i < 0) n.children.push(c); else n.children.splice(i, 0, c); return c; };
  n.removeChild = (c) => { n.children.splice(n.children.indexOf(c), 1); c.parentNode = null; return c; };
  n.replaceChild = (nw, old) => { const i = n.children.indexOf(old); n.children[i] = nw; nw.parentNode = n; old.parentNode = null; return old; };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  n.focus = () => { focused.el = n; };
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  Object.defineProperty(n, 'textContent', {
    get: () => n._text + n.children.map((c) => c.textContent).join(''),
    set: (v) => { n._text = String(v); n.children = []; },
  });
  const all = () => n.children.flatMap((c) => [c, ...c.all()]);
  n.all = all;
  n.querySelector = (sel) => all().find((c) => matches(c, sel)) || null;
  n.querySelectorAll = (sel) => all().filter((c) => matches(c, sel));
  n.closest = (sel) => { let x = n; while (x) { if (x.attrs && matches(x, sel)) return x; x = x.parentNode; } return null; };
  return n;
}
const focused = { el: null };

function setup({ keys = null, selected = null, orient, welcomeDrawn = true, noWelcome = false } = {}) {
  const head = el('head');
  const welcomeBody = el('div', { className: 'panel__body' });
  if (welcomeDrawn) welcomeBody.appendChild(el('div', { _text: 'contenido' }));
  const keysBody = el('div');
  keysBody.appendChild(el('p', { _text: 'Agregá, renombrá…' }));
  const guideBody = el('div');
  guideBody.appendChild(el('p', { className: 'muted', _text: 'Elegí la guía que mejor se adapte a lo que necesitás:' }));
  const map = { '#welcomePanel .panel__body': welcomeBody, '#keysModal .modal__body': keysBody, '#guideModal .modal__body': guideBody };
  const window = {
    Storage: { get: (k) => (k === 'gn:account:keys' ? keys : k === 'gn:account:selected' ? selected : null) },
  };
  if (!noWelcome) window.Welcome = { orientation: () => (typeof orient === 'function' ? orient() : orient || []) };
  window.document = {
    readyState: 'complete', head,
    querySelector: (s) => map[s] || null,
    getElementById: (id) => head.children.find((c) => c.id === id) || null,
    createElement: (t) => el(t),
    addEventListener() {},
  };
  const ctx = { window, globalThis: {}, Date, Math, JSON };
  vm.runInNewContext(VOICE, ctx);
  vm.runInNewContext(SRC, ctx);
  return { P: window.ShiruvanaPlaces, welcomeBody, keysBody, guideBody, head };
}

const voiceOf = (body) => body.children[0];
const textOf = (v) => v.querySelectorAll('p').filter((p) => p.parentNode.className === 'shv-voice__body').map((p) => p.textContent);
const k = (label, value, perms) => (perms ? { label, value, perms } : { label, value });
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, msg);

// Lo que devuelve Welcome.orientation() (welcome-panel.js 2.1.0) en cada caso.
const O = {
  keys: { id: 'keys', level: 'warn', act: 'manage-keys', title: 'A la Key de Alt le faltan permisos' },
  backupNever: { id: 'backup', level: 'warn', act: 'backup', title: 'Todavía no registré ninguna copia en este navegador' },
  backupOld: { id: 'backup', level: 'warn', act: 'backup', title: 'Tu última copia es de hace 19 días' },
  verify: { id: 'verify', level: 'info', act: 'manage-keys', title: 'La Key de Mula no tiene sus permisos anotados' },
  cont: { id: 'continue', level: 'ok', href: '#/account/legendary-armory', title: 'Seguir en Armería Legendaria' },
};

test('al cargar aparezco primero en la Bienvenida, el modal de API Keys y el de guías', () => {
  const { welcomeBody, keysBody, guideBody } = setup();
  assert.equal(voiceOf(welcomeBody).attrs['data-shv-place'], 'welcome');
  assert.equal(voiceOf(keysBody).attrs['data-shv-place'], 'keys');
  assert.equal(voiceOf(guideBody).attrs['data-shv-place'], 'guide');
  assert.equal(guideBody.children.some((c) => c.className === 'muted'), false, 'mi recomendación reemplaza la frase genérica');
});

test('sin API Key: me presento y te llevo a los tres pasos (texto aprobado), sin guía ni Preguntame', () => {
  const { P, welcomeBody } = setup({ keys: null });
  const v = voiceOf(welcomeBody);
  same(textOf(v), [...P.TEXTS.welcomeNew]);
  assert.equal(v.attrs['data-shv-guide'], 'start');
  assert.equal(v.querySelector('.shv-guide__ask'), null);
  assert.match(v.querySelector('.shv-voice__label').textContent, /^Shiruvana$/);
});

test('prioridades: 1 lo que impide funcionar, 2 permisos, 3 copia, 4 configuración, 5 seguir, 6 orientación', () => {
  const { P } = setup();
  // Welcome.orientation() puede llegar en cualquier orden: el mío manda.
  const items = P.guideItems([O.cont, O.verify, O.backupOld, O.keys], k('Main', 'A', ['wallet']), NOW);
  same(items.map((x) => x.id), ['blocked', 'keys', 'backup', 'verify', 'continue', 'general']);
  same(items.map((x) => x.kind), ['advierte', 'advierte', 'advierte', 'explica', 'recomienda', 'explica']);
  assert.match(items[0].text[0], /La Key activa, Main, no tiene el permiso «cuenta»/);
  same(items[0].actions.map((a) => a.act || a.href), ['manage-keys', 'https://account.arena.net/applications']);
  same(items[1].text[0], 'A la Key de Alt le faltan permisos.');
  same(items[2].actions, [{ label: 'Guardar copia', act: 'backup' }]);
  assert.match(items[3].text[1], /No es un problema/);
  assert.match(items[4].text[0], /^Lo demás está en orden\. La última vez estuviste en Armería Legendaria\. ¿Seguimos\?$/);
  same(items[4].actions, [{ label: 'Continuar en Armería Legendaria →', href: '#/account/legendary-armory' }]);
  assert.equal(items[5].text[0], 'Eso es todo lo que tenía para revisar.');
});

test('la Key activa bloqueada no se repite como «permisos faltantes»', () => {
  const { P } = setup();
  const solo = P.guideItems([{ id: 'keys', title: 'A la Key de Alt le faltan permisos' }], k('Alt', 'B', ['wallet']), NOW);
  same(solo.map((x) => x.id), ['blocked', 'general']);
  const otra = P.guideItems([{ id: 'keys', title: '2 Keys con permisos incompletos' }], k('Alt', 'B', ['wallet']), NOW);
  same(otra.map((x) => x.id), ['blocked', 'keys', 'general']);
  const sinPerms = P.guideItems([], k('Vieja', 'C'), NOW);
  same(sinPerms.map((x) => x.id), ['general'], 'una Key sin permisos anotados no se trata como bloqueada');
});

test('todo en orden: lo digo y sumo un truco de la Bóveda que cambia cada día', () => {
  const { P } = setup();
  const a = P.guideItems([], k('Main', 'A', ALL), NOW);
  same(a.map((x) => x.id), ['general']);
  assert.equal(a[0].text[0], 'Todo en orden en tu Bóveda.');
  assert.ok(P.TIPS.some((t) => a[0].text[1] === 'Un truco: ' + t));
  const b = P.guideItems([], k('Main', 'A', ALL), NOW + 864e5);
  assert.notEqual(a[0].text[1], b[0].text[1]);
  const c = P.guideItems([O.cont], k('Main', 'A', ALL), NOW);
  assert.match(c[0].text[0], /^Todo en orden en tu Bóveda\. La última vez estuviste en Armería Legendaria/);
  assert.equal(P.guideItems(null, null, NOW), null, 'sin Welcome.orientation() no invento nada');
});

test('Shiruvana te guía en pantalla: rótulo, «1 de N», acciones de la Bienvenida y Preguntame', () => {
  const { welcomeBody } = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: [O.backupNever, O.cont] });
  const v = voiceOf(welcomeBody);
  assert.equal(v.attrs['aria-label'], 'Shiruvana te guía');
  assert.match(v.querySelector('.shv-voice__label').textContent, /^Shiruvana te guía1 de 3 · lo más importante primero$/);
  same(textOf(v), ['Todavía no registré ninguna copia en este navegador.', 'Tus Keys, cuentas y ajustes viven solo en este navegador: guardá una copia, se descarga en un segundo.']);
  const btn = v.querySelector('[data-act="backup"]');
  assert.ok(btn, 'el botón lleva data-act: lo atiende la Bienvenida (Guardar copia)');
  assert.equal(btn.tag, 'button');
  assert.ok(v.querySelector('[data-guide="next"]'));
  same(v.querySelectorAll('[data-ask]').map((b) => b.getAttribute('data-ask')), ['review', 'safe', 'perm', 'switch', 'tip']);
});

test('«Siguiente» avanza en el mismo lugar y deja el foco en el botón; el último no tiene «Siguiente»', () => {
  const { welcomeBody } = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: [O.backupNever, O.cont] });
  const click = (sel) => { const v = voiceOf(welcomeBody); v.listeners.click[0]({ target: v.querySelector(sel), preventDefault() {} }); };
  click('[data-guide="next"]');
  assert.equal(welcomeBody.children.filter((c) => c.attrs['data-shv-place']).length, 1, 'sigo siendo uno solo');
  let v = voiceOf(welcomeBody);
  assert.equal(v.attrs['data-shv-guide'], 'continue');
  assert.equal(v.querySelector('a.shv-guide__btn').getAttribute('href'), '#/account/legendary-armory');
  assert.equal(focused.el, v.querySelector('[data-guide="next"]'));
  click('[data-guide="next"]');
  v = voiceOf(welcomeBody);
  assert.equal(v.attrs['data-shv-guide'], 'general');
  assert.equal(v.querySelector('[data-guide="next"]'), null);
  assert.match(v.querySelector('.shv-voice__label').textContent, /3 de 3$/);
});

test('Preguntame responde sobre la Bóveda y «Volver» regresa a lo importante', () => {
  const { welcomeBody } = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: [O.backupNever] });
  const click = (sel) => { const v = voiceOf(welcomeBody); v.listeners.click[0]({ target: v.querySelector(sel), preventDefault() {} }); };
  click('[data-ask="safe"]');
  let v = voiceOf(welcomeBody);
  assert.equal(v.attrs['data-shv-guide'], 'ask-safe');
  assert.match(textOf(v)[0], /solo en este navegador/);
  assert.equal(v.querySelector('[data-ask="safe"]').getAttribute('aria-pressed'), 'true');
  assert.match(v.querySelector('.shv-voice__label').textContent, /Preguntame$/);
  click('[data-guide="back"]');
  v = voiceOf(welcomeBody);
  assert.equal(v.attrs['data-shv-guide'], 'backup');
  click('[data-ask="tip"]');
  assert.equal(voiceOf(welcomeBody).attrs['data-shv-guide'], 'ask-tip');
  click('[data-ask="review"]');
  assert.equal(voiceOf(welcomeBody).attrs['data-shv-guide'], 'backup');
});

test('cuando cambia lo que hay que mirar (por ejemplo, guardaste la copia), vuelvo al primero', () => {
  let orient = [O.backupNever, O.cont];
  const { P, welcomeBody } = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: () => orient });
  const v = voiceOf(welcomeBody);
  v.listeners.click[0]({ target: v.querySelector('[data-guide="next"]'), preventDefault() {} });
  assert.equal(voiceOf(welcomeBody).attrs['data-shv-guide'], 'continue');
  orient = [O.cont];
  welcomeBody.children.length = 0; // la Bienvenida se redibuja
  welcomeBody.appendChild(el('div', { _text: 'contenido nuevo' }));
  P.welcome();
  assert.equal(voiceOf(welcomeBody).attrs['data-shv-guide'], 'continue');
  assert.match(voiceOf(welcomeBody).querySelector('.shv-voice__label').textContent, /1 de 2/);
});

test('Frontera (DEC-032): ningún texto mío habla de horarios, eventos activos, metas en curso ni world bosses', () => {
  const { P } = setup();
  const items = P.guideItems([O.keys, O.backupOld, O.verify, O.cont], k('Main', 'A', ['wallet']), NOW);
  const all = [].concat(
    ...items.map((x) => x.text.concat(x.actions.map((a) => a.label))),
    ...P.ASK.map((a) => [a.q].concat(a.text || [], (a.actions || []).map((x) => x.label))),
    P.TIPS, P.TEXTS.welcomeNew, P.TEXTS.welcomeBack, P.TEXTS.keys, P.TEXTS.guide).join(' \n ');
  assert.doesNotMatch(all, /\b\d{1,2}:\d{2}\b|reset|timer|agenda|en curso|world boss|jefe|empieza|termina|waypoint/i);
  assert.doesNotMatch(SRC, /meta-events|gn:meta|Meta\._pure|MetaTheme|api\.guildwars2\.com|fetch\(/);
});

test('el modal de Keys dice la verdad: sin Gist (DEC-030) y la clave solo viaja a ArenaNet', () => {
  const { P } = setup();
  const keysText = P.TEXTS.keys.join(' ');
  assert.doesNotMatch(SRC, /Gist/);
  assert.match(keysText, /solo en este navegador/);
  assert.match(keysText, /únicamente a la API oficial de ArenaNet/);
  assert.doesNotMatch(P.TEXTS.welcomeBack.join(' '), /barra lateral/);
});

test('hablo en primera persona, con voseo', () => {
  const { P } = setup();
  const all = Object.values(P.TEXTS).flat().concat(P.TIPS).join(' ');
  assert.doesNotMatch(all, /Shiruvana (hace|te ayuda|está)/, 'nunca en tercera persona');
  assert.match(P.TEXTS.welcomeNew.join(' '), /Te llevo paso a paso/);
});

test('una sola vez por lugar; no aparezco en una Bienvenida vacía; sin Welcome.orientation uso el saludo', () => {
  const a = setup({ keys: [k('Main', 'A', ALL)] });
  a.P.init(); a.P.welcome(); a.P.keys();
  assert.equal(a.welcomeBody.children.filter((c) => c.attrs['data-shv-place']).length, 1);
  assert.equal(a.keysBody.children.filter((c) => c.attrs['data-shv-place']).length, 1);
  const b = setup({ welcomeDrawn: false });
  assert.equal(b.welcomeBody.children.length, 0);
  const c = setup({ keys: [k('Main', 'A', ALL)], noWelcome: true });
  same(textOf(voiceOf(c.welcomeBody)), [...c.P.TEXTS.welcomeBack]);
});

test('sin el componente de voz no rompo nada', () => {
  const window = { Storage: { get: () => null } };
  window.document = { readyState: 'complete', querySelector: () => el('div'), getElementById: () => null, addEventListener() {} };
  assert.doesNotThrow(() => vm.runInNewContext(SRC, { window, globalThis: {} }));
});

test('versión 1.1.0 en el encabezado y en la API', () => {
  const { P } = setup();
  assert.match(SRC, /Versión: 1\.1\.0/);
  assert.equal(P.version, '1.1.0');
});
