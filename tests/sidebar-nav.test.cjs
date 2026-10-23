// La Sidebar (BL-061, SBR-1): solo navegación, a la izquierda, con la misma lista que la Bienvenida.
// Se prueba con un DOM mínimo y, para la lista de módulos, con la Bienvenida real.
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
function el(tag, extra) {
  const n = Object.assign({ tag, children: [], attrs: {}, className: '', parentNode: null, listeners: {}, _text: '' }, extra || {});
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

function setup({ hash = '#/meta', welcome = 'real', fixes = null, token = '' } = {}) {
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
  const label = el('span', { attrs: { id: 'accountIdLabel' }, _text: '—' });
  const sel = el('select', { attrs: { id: 'keySelectGlobal' }, value: token });
  side.appendChild(label);
  body.appendChild(sel); body.appendChild(side);
  const docListeners = {}, winListeners = {}, observers = [];
  const document = {
    readyState: 'loading', head, body, documentElement: docRoot,
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
  window.fetch = (url) => { fetched.push(url); return Promise.resolve({ ok: true, json: () => Promise.resolve({ name: 'Pablin.1234' }) }); };
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
  return { window, document, docListeners, winListeners, observers, side, navPanel, label, fetched, fire, S: () => window.SidebarNav };
}
const ready = (x) => { x.fire('DOMContentLoaded'); return x; };
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, msg);
const hrefs = (x) => x.document.querySelectorAll('#sbrNav a').map((a) => a.getAttribute('href'));

test('versión 2.0.0', () => {
  const x = setup();
  assert.match(SRC, /Versión: 2\.0\.0/);
  assert.equal(x.S().version, '2.0.0');
});

test('una sola lista: el respaldo es idéntico a los módulos de la Bienvenida (orden, nombre, ruta, ícono y color)', () => {
  const x = ready(setup());
  const W = x.window.Welcome._pure.MODULES.map((m) => ({ id: m.id, name: m.name, href: m.href, icon: m.icon, color: m.color }));
  same(x.S()._pure.MODULES_FALLBACK, JSON.parse(JSON.stringify(W)));
});

test('arma la Sidebar: Inicio, los 8 módulos en el orden de la Bienvenida y Cuentas aparte', () => {
  const x = ready(setup());
  same(hrefs(x), ['#/welcome', '#/cards', '#/meta', '#/account/legendary-armory', '#/account/achievements',
    '#/account/wizards-vault', '#/activities', '#/account/raids', '#/account/characters', '#/account/accounts']);
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
  same(ids, ['navHome:welcome', 'navCards:cards', 'navMeta:meta', 'navLegendaryArmory:legendaryArmory', 'navAch:achievements',
    'navWV:wv', 'navAC:activities', 'navRaids:raids', 'navChars:inventory', 'navAccounts:accounts']);
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
  assert.equal(x.document.querySelectorAll('#sbrNav a').length, 10);
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
  assert.equal(hrefs(x).length, 10);
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
  assert.doesNotMatch(css.replace(mq, ''), /grid-template-columns/, 'fuera del corte no cambio la grilla');
  assert.match(css, /#appSidebar \.sbr-list a:hover\{[^}]*transform:none/);
  assert.match(css, /#appSidebar \.sbr-list a:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /#appSidebar \.sbr-list a span\{color:inherit/, 'theme-polish pinta los span: el activo tiene que heredar');
});

test('Frontera: la Sidebar no lee datos de ningún módulo ni de metas', () => {
  assert.doesNotMatch(SRC, /meta-events|gn:meta|Meta\._pure|metaMiniNext|gn:wallet|tokeninfo|Shiruvana\.voice/);
});

test('cuenta: sin Key muestra «—» y no pide nada; con Key pide /v2/account una sola vez', async () => {
  const a = ready(setup({ token: '' }));
  assert.equal(a.label.textContent, '—');
  assert.equal(a.fetched.length, 0);
  const b = ready(setup({ token: 'KEY-1' }));
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(b.label.textContent, 'Pablin.1234');
  b.fire('gn:tokenchange');
  assert.equal(b.fetched.length, 1, 'misma Key y nombre ya mostrado: no vuelve a pedir');
});
