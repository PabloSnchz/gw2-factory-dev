// La Sidebar (BL-061): solo navegación, a la izquierda, con la misma lista que la Bienvenida (SBR-1);
// cuenta activa con el estado de su Key, «Falta permiso» y «Nuevo» en los enlaces (SBR-2);
// en el celular, barra fija abajo y hoja «Más» con foco atrapado (SBR-3); arranque con `defer` (SBR-4a).
// Se prueba con un DOM mínimo y, para la lista de módulos y el estado de las Keys, con la Bienvenida real.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'sidebar-nav.js'), 'utf8');
const WELCOME = fs.readFileSync(path.join(ROOT, 'js', 'welcome-panel.js'), 'utf8');

function matches(n, sel) {
  return sel.split(',').some((s) => {
    s = s.trim();
    let m = s.match(/^#([\w-]+) (\w+)$/);
    if (m) { let x = n.parentNode; while (x) { if (x.attrs && x.attrs.id === m[1]) return n.tag === m[2]; x = x.parentNode; } return false; }
    m = s.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
    if (m) return m[1] in n.attrs && (m[2] === undefined || n.attrs[m[1]] === m[2]);
    m = s.match(/^#([\w-]+)$/);
    if (m) return n.attrs.id === m[1];
    m = s.match(/^(\w*)\.([\w-]+)$/);
    if (m) return (!m[1] || n.tag === m[1]) && (' ' + n.className + ' ').includes(' ' + m[2] + ' ');
    return n.tag === s;
  });
}
let CUR = null; // el document del test en curso (para activeElement)
function el(tag, extra) {
  const n = Object.assign({ tag, children: [], attrs: {}, className: '', parentNode: null, listeners: {}, _text: '' }, extra || {});
  n.focus = () => { if (CUR) CUR.activeElement = n; };
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); if (k === 'id') n.id = String(v); };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.removeAttribute = (k) => { delete n.attrs[k]; };
  n.appendChild = (c) => { c.parentNode = n; n.children.push(c); return c; };
  n.removeChild = (c) => { n.children.splice(n.children.indexOf(c), 1); c.parentNode = null; return c; };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  n.classList = {
    add: (c) => { if (!(' ' + n.className + ' ').includes(' ' + c + ' ')) n.className = (n.className + ' ' + c).trim(); },
    remove: (c) => { n.className = n.className.split(' ').filter((x) => x && x !== c).join(' '); },
    contains: (c) => (' ' + n.className + ' ').includes(' ' + c + ' '),
  };
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  Object.defineProperty(n, 'textContent', {
    get: () => n._text + n.children.map((c) => c.textContent).join(''),
    set: (v) => { n._text = String(v); n.children = []; },
  });
  const all = () => n.children.flatMap((c) => [c, ...c.all()]);
  n.all = all;
  n.querySelector = (s) => all().find((c) => matches(c, s)) || null;
  n.querySelectorAll = (s) => all().filter((c) => matches(c, s));
  return n;
}
function styleObj() {
  const props = {};
  return { props, setProperty: (k, v) => { props[k] = v; }, removeProperty: (k) => { delete props[k]; } };
}

const ALL = ['account', 'wallet', 'progression', 'unlocks', 'inventories', 'tradingpost', 'characters'];
const today = () => new Date().toISOString().slice(0, 10);

function setup({ hash = '#/meta', welcome = 'real', fixes = null, token = '', keys = null, news = null, readyState = 'loading' } = {}) {
  const docRoot = el('html');
  const head = el('head');
  const body = el('body');
  docRoot.appendChild(head); docRoot.appendChild(body);
  const side = el('aside', { attrs: { id: 'appSidebar' }, style: styleObj() });
  const navPanel = el('section', { attrs: { id: 'sideNavPanel', 'aria-labelledby': 'sideNavTitle' }, className: 'panel' });
  navPanel.appendChild(el('div', { className: 'panel-head', _text: 'Navegación' }));
  const oldUl = el('ul', { className: 'side-nav' });
  oldUl.appendChild(el('a', { attrs: { id: 'navCards', href: '#/cards' } }));
  navPanel.appendChild(oldUl);
  side.appendChild(navPanel);
  const acctPanel = el('section', { attrs: { id: 'sideAccountPanel', 'aria-labelledby': 'sideAccTitle' }, className: 'panel' });
  acctPanel.appendChild(el('h3', { attrs: { id: 'sideAccTitle' }, _text: 'Gato identificado' }));
  const label = el('span', { attrs: { id: 'accountIdLabel' }, _text: '—' });
  acctPanel.appendChild(label);
  const sel = el('select', { attrs: { id: 'keySelectGlobal' }, value: token });
  sel.focus = () => { sel.focused = true; document.activeElement = sel; };
  side.children.unshift(acctPanel); acctPanel.parentNode = side;
  ['asideNextFeatures', 'metaAsideNext', 'achAsidePanel'].forEach((id) => side.appendChild(el('section', { attrs: { id }, className: 'panel' })));
  body.appendChild(sel); body.appendChild(side);
  const docListeners = {}, winListeners = {}, observers = [];
  const document = {
    readyState, head, body, documentElement: docRoot, activeElement: null,
    getElementById: (id) => docRoot.all().find((c) => c.attrs.id === id) || null,
    querySelector: (s) => docRoot.querySelector(s),
    querySelectorAll: (s) => docRoot.querySelectorAll(s),
    createElement: (t) => el(t),
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); },
  };
  const window = {
    document, location: { hash }, console: { info() {}, warn() {} },
    addEventListener: (t, f) => { (winListeners[t] = winListeners[t] || []).push(f); },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    MutationObserver: function (cb) {
      this.observe = (n, o) => { if (o && o.attributes && (o.attributeFilter || []).includes('data-theme')) observers.push(cb); };
    },
  };
  const fetched = [];
  window.fetch = (url) => {
    fetched.push(url);
    if (/welcome-news\.json$/.test(url)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: news || [] }) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ name: 'Pablin.1234' }) });
  };
  const store = { 'gn:account:keys': keys, 'gn:account:selected': token || null };
  window.Storage = {
    STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys', ACCOUNT_SELECTED: 'gn:account:selected' },
    get: (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
  };
  const ctx = { window, Date, JSON, Promise, Math, encodeURIComponent };
  vm.runInNewContext(SRC, ctx);
  if (welcome === 'real') {
    const wdoc = { readyState: 'complete', getElementById: () => null, createElement: () => el('div'), addEventListener() {}, body: { appendChild() {} } };
    const wctx = { window: { document: wdoc, console: { info() {} }, Storage: { get: () => null, set() {} }, location: { hash: '' }, addEventListener() {} }, Date, JSON, Promise, Math };
    vm.runInNewContext(WELCOME, wctx);
    window.Welcome = wctx.window.Welcome;
  } else if (welcome === 'stub') {
    window.Welcome = { _pure: { MODULES: null, contrastFixes: () => fixes || {} } };
  }
  const fire = (t, ev) => (docListeners[t] || []).forEach((f) => f(ev || {}));
  CUR = document;
  return { window, document, docListeners, winListeners, observers, side, navPanel, acctPanel, sel, store, label, fetched, fire, S: () => window.SidebarNav };
}
const ready = (x) => { x.fire('DOMContentLoaded'); return x; };
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, msg);
const hrefs = (x) => x.document.querySelectorAll('#sbrNav a').map((a) => a.getAttribute('href'));

test('versión 2.2.5', () => {
  const x = setup();
  assert.match(SRC, /Versión: 2\.2\.5/);
  assert.equal(x.S().version, '2.2.5');
});

test('una sola lista: el respaldo es idéntico a los módulos de la Bienvenida (orden, nombre, ruta, ícono y color)', () => {
  const x = ready(setup());
  const W = x.window.Welcome._pure.MODULES.map((m) => ({ id: m.id, name: m.name, href: m.href, icon: m.icon, color: m.color }));
  same(x.S()._pure.MODULES_FALLBACK, JSON.parse(JSON.stringify(W)));
});

test('arma la Sidebar: Inicio, los 9 módulos en el orden de la Bienvenida y Cuentas aparte', () => {
  const x = ready(setup());
  // PUL-3 (orden de Pablo): Cartera; lo diario; lo semanal; el progreso de la cuenta; Cuentas aparte.
  same(hrefs(x), ['#/welcome', '#/cards', '#/meta', '#/account/wizards-vault', '#/activities', '#/account/homestead',
    '#/account/raids', '#/account/achievements', '#/account/characters', '#/account/legendary-armory', '#/account/accounts']);
  const nav = x.document.getElementById('sbrNav');
  assert.equal(nav.tag, 'nav');
  assert.equal(nav.getAttribute('aria-label'), 'Navegación de la Bóveda');
  const lists = nav.children.filter((c) => c.tag === 'ul');
  assert.equal(lists.length, 3, 'Inicio, módulos y Cuentas');
  lists.forEach((ul) => assert.match(ul.className, /\bside-nav\b/, 'el router sigue encontrando .side-nav a'));
  assert.equal(lists[1].getAttribute('aria-labelledby'), 'sbrModsCap');
  assert.equal(x.document.getElementById('sbrModsCap').textContent, 'Módulos');
  assert.ok(nav.querySelector('.sbr-sep'));
  assert.equal(x.navPanel.getAttribute('aria-labelledby'), null, 'el título viejo ya no existe');
  assert.equal(x.navPanel.className, 'sbr-host');
  assert.equal(x.navPanel.children.length, 1, 'se fueron el título «Navegación» y la lista vieja');
});

test('mismos ids y data-view que antes: el router y los demás módulos no cambian', () => {
  const x = ready(setup());
  const ids = x.document.querySelectorAll('#sbrNav a').map((a) => a.getAttribute('id') + ':' + a.getAttribute('data-view'));
  same(ids, ['navHome:welcome', 'navCards:cards', 'navMeta:meta', 'navWV:wv', 'navAC:activities', 'navHS:homestead',
    'navRaids:raids', 'navAch:achievements', 'navChars:inventory', 'navLegendaryArmory:legendaryArmory', 'navAccounts:accounts']);
});

test('accesibilidad: íconos decorativos (alt vacío), nombre visible en texto y color del módulo para la barra del activo', () => {
  const x = ready(setup());
  const a = x.document.getElementById('navMeta');
  const img = a.children[0];
  assert.equal(img.getAttribute('alt'), '');
  assert.equal(img.className, 'sbr-ic');
  assert.equal(a.children[1].textContent, 'Metas y Eventos');
  assert.equal(a.getAttribute('style'), '--x:#A896FF');
  assert.equal(x.document.getElementById('navHome').getAttribute('style'), '--x:var(--acc-1)');
});

test('el activo: uno solo, con aria-current, también en rutas internas y alias', () => {
  const x = ready(setup({ hash: '#/meta' }));
  const on = () => x.document.querySelectorAll('#sbrNav a').filter((a) => a.classList.contains('is-active')).map((a) => a.getAttribute('id'));
  same(on(), ['navMeta']);
  assert.equal(x.document.getElementById('navMeta').getAttribute('aria-current'), 'page');
  const P = x.S()._pure;
  const H = hrefs(x);
  assert.equal(P.activeFor('#/account/legendary-armory/80055', H), '#/account/legendary-armory');
  assert.equal(P.activeFor('#/account/strikes', H), '#/account/raids');
  assert.equal(P.activeFor('#/wallet/dashboard', H), '#/cards');
  assert.equal(P.activeFor('', H), '#/cards', 'sin hash, lo mismo que muestra el router');
  assert.equal(P.activeFor('#/welcome?x=1', H), '#/welcome');
  assert.equal(P.activeFor('#/metaX', H), null, 'un prefijo sin «/» no cuenta');
  x.window.location.hash = '#/welcome';
  (x.winListeners.hashchange || []).forEach((f) => f());
  same(on(), ['navHome']);
  assert.equal(x.document.getElementById('navMeta').getAttribute('aria-current'), null);
});

test('después de que el router marca y avisa (gn:nav-active), queda mi activo', () => {
  const x = ready(setup({ hash: '#/meta' }));
  x.document.querySelectorAll('#sbrNav a').forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
  x.fire('gn:nav-active', { detail: { hash: '#/account/strikes' } });
  assert.ok(x.document.getElementById('navRaids').classList.contains('is-active'));
});

test('el oyente de gn:nav-active es uno solo aunque cambies de módulo muchas veces (fallo de 1.2)', () => {
  const x = ready(setup());
  for (let i = 0; i < 5; i++) x.fire('gn:nav-active', { detail: { hash: '#/cards' } });
  assert.equal(x.docListeners['gn:nav-active'].length, 1);
});

test('armar dos veces deja una sola Sidebar y un solo bloque de estilos', () => {
  const x = ready(setup());
  x.S().build();
  assert.equal(x.navPanel.children.length, 1);
  assert.equal(x.document.querySelectorAll('#sbrNav a').length, 11);
  assert.equal(x.document.head.children.filter((c) => c.attrs.id === 'sbr-css').length, 1);
});

test('si la Bienvenida cambia su lista, la Sidebar la sigue', () => {
  const x = setup({ welcome: 'stub' });
  x.window.Welcome._pure.MODULES = [
    { id: 'meta', name: 'Metas', href: '#/meta', icon: 'a.png', color: '#111111' },
    { id: 'cards', name: 'Cartera', href: '#/cards', icon: 'b.png', color: '#222222' },
  ];
  ready(x);
  same(hrefs(x), ['#/welcome', '#/meta', '#/cards']);
  assert.equal(x.document.getElementById('navMeta').children[1].textContent, 'Metas');
});

test('sin la Bienvenida uso el respaldo y no rompo nada', () => {
  const x = ready(setup({ welcome: 'none' }));
  assert.equal(hrefs(x).length, 11);
  same(x.S().applyContrast(), {});
});

test('contraste: aplico en #appSidebar la guarda de la Bienvenida y saco lo que ya no hace falta', () => {
  let fixes = { '--tx-3': '#868fba' };
  const x = setup({ welcome: 'stub' });
  x.window.Welcome._pure.contrastFixes = () => fixes;
  ready(x);
  same(x.side.style.props, { '--tx-3': '#868fba' });
  fixes = {};
  x.observers.forEach((f) => f());
  same(x.side.style.props, {}, 'al cambiar a un theme que no lo necesita');
  fixes = { '--acc-1': '#868fec' };
  (x.docListeners.load || []).forEach((f) => f({ target: { id: 'themeStylesheet' } }));
  same(x.side.style.props, { '--acc-1': '#868fec' });
});

test('CSS: a la izquierda desde 901 px, fija al hacer scroll; debajo de 900 px no toco la grilla', () => {
  const css = setup().S()._pure.CSS;
  const mq = css.slice(css.indexOf('@media (min-width:901px)'), css.indexOf('\n'));
  assert.match(mq, /\.container\.layout\{grid-template-columns:252px minmax\(0,1fr\)\}/);
  assert.match(mq, /#appSidebar\{grid-column:1;grid-row:1;position:sticky;top:12px;align-self:start/);
  assert.match(mq, /\.container\.layout>:not\(#appSidebar\)\{grid-column:2\}/);
  assert.doesNotMatch(css.replace(mq, ''), /\.container\.layout|#appSidebar\{/, 'fuera del corte no cambio la grilla de la página');
  assert.match(css, /:is\(#appSidebar,#sbrSheet\) \.sbr-list a:hover\{[^}]*transform:none/);
  assert.match(css, /:is\(#appSidebar,#sbrSheet\) \.sbr-list a:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:is\(#appSidebar,#sbrSheet\) \.sbr-list a span\{color:inherit/, 'theme-polish pinta los span: el activo tiene que heredar');
});

test('Frontera: la Sidebar no lee datos de ningún módulo ni de metas', () => {
  assert.doesNotMatch(SRC, /meta-events|gn:meta|Meta\._pure|metaMiniNext|gn:wallet|tokeninfo|Shiruvana\.voice/);
});

const flush = () => new Promise((r) => setTimeout(r, 0));
const accountFetches = (x) => x.fetched.filter((u) => /\/v2\/account\?/.test(u)).length;
const nameEl = (x) => x.document.getElementById('accountIdLabel');
const line = (x) => x.acctPanel.querySelector('.sbr-st');

test('cuenta: sin Key muestra «—», no pide /v2/account y ofrece «Empezar» (lleva a Inicio)', async () => {
  const a = ready(setup({ token: '' }));
  await flush();
  assert.equal(nameEl(a).textContent, '—');
  assert.equal(accountFetches(a), 0);
  assert.equal(line(a).textContent, 'Todavía no cargaste una API Key');
  assert.equal(line(a).getAttribute('data-level'), 'warn');
  const go = a.acctPanel.querySelector('.sbr-chg');
  assert.equal(go.tag, 'a');
  assert.equal(go.getAttribute('href'), '#/welcome');
  assert.equal(go.textContent, 'Empezar');
});

test('cuenta: reemplaza a «Gato identificado» por «Cuenta activa», con el nombre de /v2/account (un solo pedido)', async () => {
  const x = ready(setup({ token: 'KEY-1', keys: [{ label: 'Main', value: 'KEY-1', perms: ALL }] }));
  assert.equal(nameEl(x).textContent, 'Main', 'mientras llega el nombre, el de la Key');
  await flush();
  assert.equal(nameEl(x).textContent, 'Pablin.1234');
  assert.equal(x.acctPanel.getAttribute('aria-labelledby'), null);
  assert.equal(x.acctPanel.getAttribute('aria-label'), 'Cuenta activa');
  assert.equal(x.acctPanel.className, 'sbr-host');
  assert.equal(x.acctPanel.children.length, 1, 'se fue el título «Gato identificado»');
  assert.equal(x.acctPanel.querySelector('small').textContent, 'Cuenta activa');
  assert.equal(x.acctPanel.querySelector('img').getAttribute('alt'), '');
  x.fire('gn:tokenchange');
  await flush();
  assert.equal(accountFetches(x), 1, 'misma Key: no vuelve a pedir');
  assert.equal(nameEl(x).textContent, 'Pablin.1234', 'al rearmar conserva el nombre');
});

test('cuenta: «Cambiar» lleva al selector de cuenta de arriba', () => {
  const x = ready(setup({ token: 'KEY-1', keys: [{ label: 'Main', value: 'KEY-1', perms: ALL }] }));
  const b = x.acctPanel.querySelector('.sbr-chg');
  assert.equal(b.tag, 'button');
  assert.equal(b.getAttribute('type'), 'button');
  assert.equal(b.getAttribute('aria-label'), 'Cambiar de cuenta');
  b.listeners.click[0]();
  assert.equal(x.sel.focused, true);
});

test('estado de la Key: completa, le falta un permiso, le faltan varios o sin verificar', () => {
  const kl = setup().S()._pure.keyLine;
  const W = setup().window.Welcome._pure;
  const m = (keys) => W.buildModel({ keys, selected: 'A' });
  same(kl(m([{ label: 'Main', value: 'A', perms: ALL }])), { level: 'ok', text: 'API Key completa' });
  same(kl(m([{ label: 'Main', value: 'A', perms: ALL.filter((p) => p !== 'tradingpost') }])), { level: 'warn', text: 'API Key · le falta «bazar»' });
  same(kl(m([{ label: 'Main', value: 'A', perms: ['account', 'wallet'] }])), { level: 'warn', text: 'API Key · le faltan 5 permisos' });
  same(kl(m([{ label: 'Main', value: 'A' }])), { level: 'info', text: 'API Key sin verificar' });
  same(kl(null), { level: 'warn', text: 'Todavía no cargaste una API Key' });
  const x = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL.filter((p) => p !== 'tradingpost') }] }));
  assert.equal(line(x).textContent, 'API Key · le falta «bazar»');
  assert.match(line(x).querySelector('.sbr-dot').className, /is-warn/);
});

test('«Falta permiso»: punto en los módulos que la Key activa no alcanza, con texto para el lector', () => {
  const x = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL.filter((p) => p !== 'wallet') }] }));
  const cards = x.document.getElementById('navCards');
  assert.ok(cards.querySelector('.sbr-w'));
  assert.equal(cards.querySelector('.sbr-w').getAttribute('aria-hidden'), 'true');
  assert.equal(cards.querySelector('.sbr-sr').textContent, ' (falta permiso)');
  assert.match(cards.getAttribute('title'), /falta un permiso/);
  ['navMeta', 'navLegendaryArmory', 'navHome', 'navAccounts'].forEach((id) =>
    assert.equal(x.document.getElementById(id).querySelector('.sbr-w'), null, id + ' sin aviso'));
});

test('«Nuevo»: en los módulos con una novedad de 14 días o menos; el aviso de permiso tiene prioridad', async () => {
  const news = [
    { date: today(), module: 'meta', title: 'Metas' },
    { date: today(), module: 'cards', title: 'Cartera' },
    { date: '2020-01-01', module: 'armory', title: 'Vieja' },
  ];
  const x = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL.filter((p) => p !== 'wallet') }], news }));
  await flush();
  assert.equal(x.document.getElementById('navMeta').querySelector('.sbr-new').textContent, 'Nuevo');
  // SBR-5: la marca es solo visual; el lector de pantalla lee «(nuevo)» (en la barra la marca es un punto).
  assert.equal(x.document.getElementById('navMeta').querySelector('.sbr-new').getAttribute('aria-hidden'), 'true');
  assert.equal(x.document.getElementById('navMeta').querySelector('.sbr-sr').textContent, ' (nuevo)');
  x.S().refresh();
  assert.equal(x.document.getElementById('navMeta').querySelectorAll('.sbr-sr').length, 1, 'al refrescar no se duplica');
  assert.equal(x.document.getElementById('navCards').querySelector('.sbr-new'), null, 'Cartera muestra el aviso de permiso');
  assert.equal(x.document.getElementById('navLegendaryArmory').querySelector('.sbr-new'), null, 'una novedad vieja no');
  assert.equal(x.fetched.filter((u) => /welcome-news/.test(u)).length, 1);
  same(x.S()._pure.newModules([{ module: 'wv', isNew: true }, { module: 'raids', isNew: false }, null]), { wv: true });
});

test('al cambiar la Key (gn:tokenchange) rearmo tarjeta y avisos sin duplicar', () => {
  const x = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL.filter((p) => p !== 'wallet') }] }));
  assert.ok(x.document.getElementById('navCards').querySelector('.sbr-w'));
  x.store['gn:account:keys'] = [{ label: 'Main', value: 'A', perms: ALL }];
  x.fire('gn:tokenchange');
  assert.equal(x.document.getElementById('navCards').querySelector('.sbr-w'), null);
  assert.equal(x.document.getElementById('navCards').getAttribute('title'), null);
  assert.equal(line(x).textContent, 'API Key completa');
  x.store['gn:account:keys'] = [{ label: 'Main', value: 'A', perms: ['account'] }];
  (x.winListeners.storage || []).forEach((f) => f());
  x.fire('gn:tokenchange');
  assert.equal(x.document.getElementById('navCards').querySelectorAll('.sbr-w').length, 1, 'un solo punto');
  assert.equal(x.acctPanel.children.length, 1, 'una sola tarjeta');
});

test('paneles viejos: «Próximas funciones» y «Próximos (Top 3)» ocultos; el de Logros sigue', () => {
  const css = setup().S()._pure.CSS;
  assert.match(css, /#asideNextFeatures,#metaAsideNext\{display:none!important\}/);
  assert.doesNotMatch(css, /achAsidePanel/);
});

// ---------------------------------------------------------------- SBR-3: celular
const byId = (x, id) => x.document.getElementById(id);
const tabLinks = (x) => x.document.querySelectorAll('#sbrTabs a');
const sheetLinks = (x) => x.document.querySelectorAll('#sbrSheet a').filter((a) => a.getAttribute('data-mod'));
const click = (n) => (n.listeners.click || []).forEach((f) => f({ target: n, preventDefault() {} }));
const key = (x, k, shift) => { let p = false; (byId(x, 'sbrSheet').listeners.keydown || []).forEach((f) => f({ key: k, shiftKey: !!shift, preventDefault() { p = true; } })); return p; };
const isOpen = (x) => byId(x, 'sbrSheet').getAttribute('hidden') === null;

test('celular: barra con Inicio, Cartera, Metas y Armería y el botón «Más»', () => {
  const x = ready(setup());
  same(tabLinks(x).map((a) => a.getAttribute('href')), ['#/welcome', '#/cards', '#/meta', '#/account/legendary-armory']);
  same(tabLinks(x).map((a) => a.children[1].textContent), ['Inicio', 'Cartera', 'Metas', 'Armería']);
  tabLinks(x).forEach((a) => {
    assert.equal(a.getAttribute('id'), null, 'sin ids repetidos: los de la Sidebar los usa el router');
    assert.doesNotMatch(a.className, /side-nav/);
    assert.equal(a.children[0].getAttribute('alt'), '');
  });
  const nav = byId(x, 'sbrTabs');
  assert.equal(nav.tag, 'nav');
  assert.equal(nav.getAttribute('aria-label'), 'Navegación principal');
  const more = byId(x, 'sbrMore');
  assert.equal(more.tag, 'button');
  assert.equal(more.getAttribute('type'), 'button');
  assert.equal(more.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(more.getAttribute('aria-expanded'), 'false');
  assert.equal(more.getAttribute('aria-controls'), 'sbrSheet');
  assert.match(more.textContent, /Más/);
  assert.equal(x.document.querySelectorAll('#sbrNav a').filter((a) => a.getAttribute('id') === 'navCards').length, 1);
});

test('celular: la hoja «Más» es un diálogo con la cuenta activa y los otros 7 destinos', async () => {
  const x = ready(setup({ token: 'KEY-1', keys: [{ label: 'Main', value: 'KEY-1', perms: ALL }] }));
  const sh = byId(x, 'sbrSheet');
  assert.equal(sh.getAttribute('role'), 'dialog');
  assert.equal(sh.getAttribute('aria-modal'), 'true');
  assert.equal(sh.getAttribute('aria-labelledby'), 'sbrSheetT');
  assert.ok(byId(x, 'sbrSheetT'));
  assert.equal(isOpen(x), false, 'cerrada al cargar');
  assert.equal(byId(x, 'sbrScrim').getAttribute('hidden'), '');
  same(sheetLinks(x).map((a) => a.getAttribute('href')), ['#/account/wizards-vault', '#/activities', '#/account/homestead',
    '#/account/raids', '#/account/achievements', '#/account/characters', '#/account/accounts']);
  same(sheetLinks(x).map((a) => a.children[1].textContent), ['Cámara del Brujo', 'Actividades', 'Heredad', 'Raids', 'Logros', 'Inventario y Personajes', 'Cuentas']);
  // RAI-5a: el módulo es uno solo desde la unificación del juego; el nombre viejo no vuelve.
  assert.doesNotMatch(SRC + WELCOME, /Raids y Strikes/);
  sheetLinks(x).forEach((a) => assert.equal(a.getAttribute('id'), null));
  const P = x.S()._pure;
  same(P.mobileGroups().tabs.map((m) => m.id), ['home', 'cards', 'meta', 'armory']);
  same(P.TABS, ['cards', 'meta', 'armory']);
  const acct = byId(x, 'sbrSheetAcct');
  assert.equal(acct.querySelector('small').textContent, 'Cuenta activa');
  assert.equal(acct.querySelector('.sbr-st').textContent, 'API Key completa');
  assert.equal(acct.querySelectorAll('#accountIdLabel').length, 0, 'el id queda solo en la Sidebar');
  await flush();
  assert.equal(acct.querySelector('.sbr-accname').textContent, 'Pablin.1234', 'el nombre llega también a la hoja');
  x.fire('gn:tokenchange');
  assert.equal(acct.children.length, 1, 'una sola tarjeta en la hoja');
});

test('celular: «Más» abre la hoja, el foco entra y vuelve a «Más» al cerrar con Escape', () => {
  const x = ready(setup());
  const more = byId(x, 'sbrMore');
  more.focus();
  click(more);
  assert.equal(isOpen(x), true);
  assert.equal(byId(x, 'sbrScrim').getAttribute('hidden'), null);
  assert.equal(more.getAttribute('aria-expanded'), 'true');
  assert.ok(x.document.documentElement.classList.contains('sbr-lock'), 'la página de atrás no se desplaza');
  assert.equal(x.document.activeElement, byId(x, 'sbrSheet').querySelector('.sbr-close'), 'el foco entra en la hoja');
  assert.equal(key(x, 'Escape'), true);
  assert.equal(isOpen(x), false);
  assert.equal(byId(x, 'sbrScrim').getAttribute('hidden'), '');
  assert.equal(more.getAttribute('aria-expanded'), 'false');
  assert.equal(x.document.documentElement.classList.contains('sbr-lock'), false);
  assert.equal(x.document.activeElement, more, 'el foco vuelve a «Más»');
});

test('celular: la hoja se cierra con «Cerrar», tocando afuera, eligiendo un destino o con «Más» otra vez', () => {
  const x = ready(setup());
  const more = byId(x, 'sbrMore');
  click(more); click(byId(x, 'sbrSheet').querySelector('.sbr-close')); assert.equal(isOpen(x), false, 'Cerrar');
  click(more); click(byId(x, 'sbrScrim')); assert.equal(isOpen(x), false, 'afuera');
  click(more); click(sheetLinks(x)[2]); assert.equal(isOpen(x), false, 'un destino');
  click(more); assert.equal(isOpen(x), true); click(more); assert.equal(isOpen(x), false, 'Más otra vez');
  assert.equal(x.S().closeSheet(), false, 'cerrar dos veces no hace nada');
});

test('celular: el foco queda atrapado en la hoja (Tab y Shift+Tab dan la vuelta)', () => {
  const x = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL }] }));
  click(byId(x, 'sbrMore'));
  const f = byId(x, 'sbrSheet').querySelectorAll('a, button');
  const first = f[0], last = f[f.length - 1];
  assert.equal(first.className, 'sbr-close');
  assert.equal(last.getAttribute('href'), '#/account/accounts');
  last.focus();
  assert.equal(key(x, 'Tab'), true);
  assert.equal(x.document.activeElement, first);
  assert.equal(key(x, 'Tab', true), true);
  assert.equal(x.document.activeElement, last);
  f[1].focus();
  assert.equal(key(x, 'Tab'), false, 'en el medio, Tab sigue normal');
  assert.equal(key(x, 'Enter'), false);
  assert.equal(isOpen(x), true);
});

test('celular: «Cambiar» en la hoja la cierra y lleva al selector de cuenta', () => {
  const x = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL }] }));
  click(byId(x, 'sbrMore'));
  click(byId(x, 'sbrSheetAcct').querySelector('.sbr-chg'));
  assert.equal(isOpen(x), false);
  assert.equal(x.sel.focused, true);
  assert.equal(x.document.activeElement, x.sel);
});

test('celular: el activo se marca en la barra; si está en la hoja, se marca «Más»', () => {
  const x = ready(setup({ hash: '#/meta' }));
  const tab = (h) => tabLinks(x).find((a) => a.getAttribute('href') === h);
  assert.ok(tab('#/meta').classList.contains('is-active'));
  assert.equal(tab('#/meta').getAttribute('aria-current'), 'page');
  assert.equal(byId(x, 'sbrMore').classList.contains('is-active'), false);
  x.fire('gn:nav-active', { detail: { hash: '#/account/strikes' } });
  assert.equal(tab('#/meta').classList.contains('is-active'), false);
  assert.ok(byId(x, 'sbrMore').classList.contains('is-active'));
  const raids = sheetLinks(x).find((a) => a.getAttribute('href') === '#/account/raids');
  assert.equal(raids.getAttribute('aria-current'), 'page');
  assert.ok(x.document.getElementById('navRaids').classList.contains('is-active'), 'la Sidebar también');
  x.fire('gn:nav-active', { detail: { hash: '#/account/legendary-armory/80055' } });
  assert.ok(tab('#/account/legendary-armory').classList.contains('is-active'));
  assert.equal(byId(x, 'sbrMore').classList.contains('is-active'), false);
});

test('celular: avisos en la barra y en la hoja; punto en «Más» si adentro hay algo para revisar', () => {
  const ok = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL }] }));
  assert.equal(byId(ok, 'sbrMore').querySelector('.sbr-dot'), null, 'todo en orden: sin punto');
  const x = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL.filter((p) => p !== 'progression') }] }));
  const ach = sheetLinks(x).find((a) => a.getAttribute('data-mod') === 'achievements');
  assert.ok(ach.querySelector('.sbr-w'), 'Logros, en la hoja, con «Falta permiso»');
  const more = byId(x, 'sbrMore');
  assert.ok(more.querySelector('.sbr-dot'));
  assert.equal(more.querySelector('.sbr-sr').textContent, ' (hay algo para revisar)');
  x.fire('gn:tokenchange');
  assert.equal(more.querySelectorAll('.sbr-dot').length, 1, 'sin duplicar');
  const y = ready(setup({ token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL.filter((p) => p !== 'tradingpost') }] }));
  assert.ok(tabLinks(y).find((a) => a.getAttribute('data-mod') === 'cards').querySelector('.sbr-w'), 'Cartera, en la barra');
  const none = ready(setup({ token: '' }));
  assert.ok(byId(none, 'sbrMore').querySelector('.sbr-dot'), 'sin Key: la tarjeta de la hoja lo pide');
  const P = ok.S()._pure;
  assert.equal(P.moreNeedsAttention({ state: 'back', activeStatus: 'ok', activeMods: [] }, ['raids']), false);
  assert.equal(P.moreNeedsAttention({ state: 'back', activeStatus: 'ok', activeMods: ['raids'] }, ['raids']), true);
  assert.equal(P.moreNeedsAttention({ state: 'back', activeStatus: 'ok', activeMods: ['cards'] }, ['raids']), false);
  assert.equal(P.moreNeedsAttention({ state: 'back', activeStatus: 'unknown', activeMods: [] }, ['raids']), false, 'sin verificar no es urgente');
});

test('celular: armar dos veces deja una sola barra y una sola hoja', () => {
  const x = ready(setup());
  x.S().build();
  assert.equal(x.document.body.children.filter((c) => c.attrs.id === 'sbrTabs').length, 1);
  assert.equal(x.document.body.children.filter((c) => c.attrs.id === 'sbrSheet').length, 1);
  assert.equal(x.document.body.children.filter((c) => c.attrs.id === 'sbrScrim').length, 1);
});

test('CSS celular: barra fija hasta 900 px con zona segura y 44 px; el panel de Logros sigue', () => {
  const css = setup().S()._pure.CSS;
  assert.match(css, /#sbrTabs,#sbrSheet,#sbrScrim\{display:none\}/, 'en desktop no existen');
  const mob = css.slice(css.indexOf('@media (max-width:900px){'));
  assert.match(mob, /#sideNavPanel,#sideAccountPanel\{display:none!important\}/);
  assert.doesNotMatch(css, /#appSidebar\{display:none/, 'no escondo la Sidebar entera: ahí vive el panel de Logros');
  assert.match(mob, /#sbrTabs\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\);position:fixed;[^}]*bottom:0/);
  assert.match(mob, /#sbrTabs\{[^}]*env\(safe-area-inset-bottom,0px\)/);
  assert.match(mob, /body\{padding-bottom:calc\(68px \+ env\(safe-area-inset-bottom,0px\)\)\}/, 'nada queda tapado');
  assert.match(mob, /#sbrTabs \.sbr-tab\{[^}]*min-height:52px;min-width:44px/);
  assert.match(mob, /#sbrSheet \.sbr-close\{min-height:44px;min-width:44px/);
  assert.match(mob, /#sbrSheet \.sbr-list a\{min-height:48px\}/);
  assert.match(css, /prefers-reduced-motion:reduce\)\{#sbrSheet:not\(\[hidden\]\)\{animation:none\}\}/);
});

// ---------------------------------------------------------------- SBR-4a: arranque con `defer`
test('con defer (estado «interactive») espero a DOMContentLoaded: ahí ya está la Bienvenida', async () => {
  const news = [{ date: today(), module: 'meta', title: 'Metas' }];
  const x = setup({ readyState: 'interactive', news, token: 'A', keys: [{ label: 'Main', value: 'A', perms: ALL }] });
  assert.equal(x.document.getElementById('sbrNav'), null, 'todavía no armé nada');
  assert.equal(x.fetched.length, 0);
  ready(x);
  await flush();
  assert.ok(x.document.getElementById('sbrNav'));
  assert.equal(x.document.getElementById('navMeta').querySelector('.sbr-new').textContent, 'Nuevo', '«Nuevo» aparece en la primera carga');
  assert.equal(line(x).textContent, 'API Key completa', 'la tarjeta ya sabe de la Key');
});

test('si la página ya terminó de cargar, armo en el momento', () => {
  const x = setup({ readyState: 'complete' });
  assert.ok(x.document.getElementById('sbrNav'));
  assert.equal((x.docListeners.DOMContentLoaded || []).length, 0);
});

test('si la Bienvenida llega tarde, las novedades y el contraste se recuperan en el próximo refresco', async () => {
  const news = [{ date: today(), module: 'meta', title: 'Metas' }];
  const x = ready(setup({ welcome: 'none', news }));
  await flush();
  assert.equal(x.fetched.filter((u) => /welcome-news/.test(u)).length, 0, 'sin la Bienvenida no pido nada');
  const W = setup().window.Welcome;
  W._pure.contrastFixes = () => ({ '--tx-3': '#868fba' });
  x.window.Welcome = W;
  x.fire('gn:tokenchange');
  await flush();
  assert.equal(x.fetched.filter((u) => /welcome-news/.test(u)).length, 1);
  assert.equal(x.document.getElementById('navMeta').querySelector('.sbr-new').textContent, 'Nuevo');
  same(x.side.style.props, { '--tx-3': '#868fba' });
  x.fire('gn:tokenchange');
  await flush();
  assert.equal(x.fetched.filter((u) => /welcome-news/.test(u)).length, 1, 'una sola vez');
});
