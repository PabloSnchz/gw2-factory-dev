// Dónde le hablo al jugador (DEC-025): Bienvenida, modal de API Keys y modal de guías.
// En la Bienvenida con API Key soy «Shiruvana te guía» (BL-058, WEL-3): un mensaje por vez,
// por prioridad, y solo sobre la Bóveda (DEC-032). Mi rincón al pie de la Sidebar y de la hoja «Más»
// (DEC-034, SBR-4). Se prueba con el componente de voz real.
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

function setup({ keys = null, selected = null, orient, welcomeDrawn = true, noWelcome = false, hosts = [] } = {}) {
  const head = el('head');
  const welcomeBody = el('div', { className: 'panel__body' });
  if (welcomeDrawn) welcomeBody.appendChild(el('div', { _text: 'contenido' }));
  const keysBody = el('div');
  keysBody.appendChild(el('p', { _text: 'Agregá, renombrá…' }));
  const guideBody = el('div');
  guideBody.appendChild(el('p', { className: 'muted', _text: 'Elegí la guía que mejor se adapte a lo que necesitás:' }));
  const map = { '#welcomePanel .panel__body': welcomeBody, '#keysModal .modal__body': keysBody, '#guideModal .modal__body': guideBody };
  const welcomePanel = el('section', { id: 'welcomePanel' });
  const H = {};
  hosts.forEach((id) => { H[id] = el(id === 'sbrSheet' ? 'div' : 'aside', { id }); H[id].appendChild(el('ul', { _text: 'enlaces' })); });
  const window = {
    Storage: { get: (k) => (k === 'gn:account:keys' ? keys : k === 'gn:account:selected' ? selected : null) },
  };
  if (!noWelcome) window.Welcome = { orientation: () => (typeof orient === 'function' ? orient() : orient || []) };
  window.document = {
    readyState: 'complete', head,
    querySelector: (s) => map[s] || null,
    getElementById: (id) => (id === 'welcomePanel' ? welcomePanel : H[id] ? H[id]
      : head.children.concat(welcomePanel.children).find((c) => c.id === id) || null),
    createElement: (t) => el(t),
    addEventListener() {},
  };
  const ctx = { window, globalThis: {}, Date, Math, JSON };
  vm.runInNewContext(VOICE, ctx);
  vm.runInNewContext(SRC, ctx);
  return { P: window.ShiruvanaPlaces, welcomeBody, welcomePanel, keysBody, guideBody, head, H, window };
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

test('lector de pantalla: «Siguiente» y «Preguntame» anuncian el mensaje nuevo en una región polite fija', () => {
  const { welcomeBody, welcomePanel } = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: [O.backupNever, O.cont] });
  const click = (sel) => { const v = voiceOf(welcomeBody); v.listeners.click[0]({ target: v.querySelector(sel), preventDefault() {} }); };
  assert.equal(welcomePanel.children.length, 0, 'al cargar no anuncio nada: el mensaje ya está en pantalla');
  click('[data-guide="next"]');
  const live = welcomePanel.children.find((c) => c.id === 'shvGuideLive');
  assert.ok(live, 'la región vive en #welcomePanel, fuera de .panel__body');
  assert.equal(live.getAttribute('aria-live'), 'polite');
  assert.equal(live.getAttribute('role'), 'status');
  assert.equal(live.className, 'shv-sr');
  assert.match(live.textContent, /^2 de 3\. .*La última vez estuviste en Armería Legendaria/);
  click('[data-ask="safe"]');
  assert.match(live.textContent, /^Preguntame\. .*solo en este navegador/);
  assert.equal(welcomePanel.children.filter((c) => c.id === 'shvGuideLive').length, 1, 'una sola región');
  assert.equal(focused.el && focused.el.getAttribute('data-ask'), 'safe', 'el foco no se mueve');
});

test('versión 1.3.1 en el encabezado y en la API; las guías con sus nombres de hoy', () => {
  const { P } = setup();
  assert.match(SRC, /Versión: 1\.3\.1/);
  assert.equal(P.version, '1.3.1');
  const all = Object.values(P.TEXTS).flat().concat(P.TIPS, ...P.ASK.map((a) => a.text || [])).join(' ');
  assert.doesNotMatch(all, /Backup|guía básica|guía avanzada|Gestión de API Keys/i, 'nombres que ya no existen en la Bóveda');
  assert.match(P.TEXTS.guide.join(' '), /«Primeros pasos»[^]*«Guía por módulo»/);
  assert.match(P.CSS || SRC, /\.shv-sr\{position:absolute;width:1px;height:1px/);
});

// ---------------------------------------------------------------- mi rincón (SBR-4, DEC-034)
const BOTH = ['appSidebar', 'sbrSheet'];
const cornersIn = (host) => host.children.filter((c) => c.attrs['data-shv-place'] === 'corner');
const lineOf = (c) => textOf(c).join(' ');
const linksIn = (c) => c.querySelectorAll('a');

test('rincón: al pie de la Sidebar y de la hoja «Más», con avatar de 48 px, «Shiruvana» y una sola línea', () => {
  const x = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: [O.cont], hosts: BOTH });
  BOTH.forEach((id) => {
    const cs = cornersIn(x.H[id]);
    assert.equal(cs.length, 1, 'uno solo por lugar: ' + id);
    const c = cs[0];
    assert.equal(x.H[id].children[x.H[id].children.length - 1], c, 'al pie, después de los enlaces');
    assert.match(c.className, /\bshv-corner\b/);
    assert.equal(c.getAttribute('aria-label'), 'Shiruvana');
    assert.equal(c.querySelector('.shv-voice__label').textContent, 'Shiruvana');
    const img = c.querySelector('img');
    assert.ok(img, 'con mi avatar');
    assert.equal(img.width, 48);
    assert.equal(textOf(c).length, 1, 'una sola línea');
  });
  assert.equal(lineOf(cornersIn(x.H.appSidebar)[0]), 'Todo en orden en tu Bóveda.');
  assert.equal(linksIn(cornersIn(x.H.appSidebar)[0]).length, 0, 'si está todo en orden no te mando a ningún lado');
});

test('rincón: sin API Key te llevo a Inicio para empezar (un solo enlace)', () => {
  const x = setup({ hosts: BOTH });
  const c = cornersIn(x.H.appSidebar)[0];
  assert.equal(lineOf(c), 'Empezá por tu API Key: te llevo paso a paso en Inicio.');
  const a = linksIn(c);
  assert.equal(a.length, 1);
  assert.equal(a[0].getAttribute('href'), '#/welcome');
  assert.equal(a[0].textContent, 'Ir a Inicio');
  assert.equal(c.getAttribute('data-level'), 'warn');
  assert.equal(c.querySelector('.shv-voice__label').textContent, 'Shiruvana', 'el rótulo es siempre «Shiruvana», también cuando aviso');
  assert.equal(c.getAttribute('aria-label'), 'Shiruvana');
});

test('rincón: cuento lo que hay para revisar con las prioridades de «Shiruvana te guía»', () => {
  const one = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: [O.backupNever, O.cont], hosts: BOTH });
  assert.equal(lineOf(cornersIn(one.H.sbrSheet)[0]), 'Tengo 1 cosa para revisar: tu copia de seguridad.');
  const many = setup({ keys: [k('Main', 'A', ALL), k('Alt', 'B', ['account'])], selected: 'A', orient: [O.keys, O.backupOld, O.verify, O.cont], hosts: BOTH });
  const c = cornersIn(many.H.appSidebar)[0];
  assert.equal(lineOf(c), 'Tengo 3 cosas para revisar; la primera: faltan permisos en tus Keys.');
  assert.equal(linksIn(c).length, 1);
  assert.equal(linksIn(c)[0].textContent, 'Ver en Inicio');
  const blocked = setup({ keys: [k('Main', 'A', ['wallet'])], selected: 'A', orient: [{ id: 'keys', level: 'warn', title: 'A la Key de Main le faltan permisos' }], hosts: BOTH });
  assert.equal(lineOf(cornersIn(blocked.H.appSidebar)[0]), 'Tengo 1 cosa para revisar: tu Key activa no tiene el permiso «cuenta».', 'lo que impide funcionar va primero y no se repite');
  const P = one.P;
  same(P.cornerMessage(true, [O.verify], { label: 'M', value: 'A', perms: ALL }),
    { level: 'warn', text: 'Tengo 1 cosa para revisar: Keys sin sus permisos anotados.', link: { label: 'Ver en Inicio', href: '#/welcome' } });
});

test('rincón: se actualiza en el mismo lugar cuando cambia lo que hay que revisar, sin duplicarse', () => {
  let orient = [O.backupNever, O.cont];
  const x = setup({ keys: [k('Main', 'A', ALL)], selected: 'A', orient: () => orient, hosts: BOTH });
  const before = cornersIn(x.H.appSidebar)[0];
  x.P.corner();
  assert.equal(cornersIn(x.H.appSidebar)[0], before, 'si no cambió nada, no lo rearmo');
  orient = [O.cont];
  x.P.corner();
  assert.equal(cornersIn(x.H.appSidebar).length, 1);
  assert.equal(lineOf(cornersIn(x.H.appSidebar)[0]), 'Todo en orden en tu Bóveda.');
  assert.equal(cornersIn(x.H.sbrSheet).length, 1);
});

test('rincón: el enlace de la hoja «Más» la cierra', () => {
  const x = setup({ hosts: BOTH });
  let closed = 0;
  x.window.SidebarNav = { closeSheet: () => { closed++; } };
  const a = linksIn(cornersIn(x.H.sbrSheet)[0])[0];
  a.listeners.click.forEach((f) => f({}));
  assert.equal(closed, 1);
});

test('rincón: sin la Sidebar, sin la Bienvenida o sin mi voz no pongo nada ni rompo', () => {
  const none = setup({ keys: [k('Main', 'A', ALL)] });
  same(none.P.corner(), []);
  const noW = setup({ keys: [k('Main', 'A', ALL)], noWelcome: true, hosts: BOTH });
  assert.equal(cornersIn(noW.H.appSidebar).length, 0, 'con Keys pero sin saber qué falta, no invento');
  const bad = setup({ keys: [k('Main', 'A', ALL)], orient: () => { throw new Error('x'); }, hosts: BOTH });
  assert.equal(cornersIn(bad.H.appSidebar).length, 0);
});

test('rincón: uno solo a la vista (Sidebar en desktop, hoja en el celular) y nada se abre solo', () => {
  const x = setup({ hosts: BOTH });
  const css = x.P.CORNER_CSS;
  assert.match(css, /@media \(max-width:900px\)\{#appSidebar>\.shv-corner\{display:none\}/);
  assert.match(css, /@media \(min-width:901px\)\{#sbrSheet>\.shv-corner\{display:none\}\}/);
  assert.equal(x.head.children.filter((c) => c.id === 'shv-corner-css').length, 1);
  assert.doesNotMatch(SRC, /openSheet/, 'no abro la hoja por mi cuenta');
});

test('rincón — Frontera (DEC-032, DEC-034): solo estado de la Bóveda, nada de horarios, eventos, metas ni módulos', () => {
  const P = setup().P;
  const all = Object.values(P.CORNER_SHORT).join(' ') + ' ' +
    [P.cornerMessage(false), P.cornerMessage(true, []), P.cornerMessage(true, [O.keys, O.backupOld, O.verify])].map((m) => m.text).join(' ');
  assert.doesNotMatch(all, /meta|evento|horario|reset|world ?boss|jefe|precio|oro|legendaria|logro|infusi|agenda|termina|empieza/i);
});
