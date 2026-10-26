// Barra de arriba y pie (BL-070 paso 5, TOP-5 y TOP-6): js/gn-topbar.js y su marcado en index.html.
// Tres zonas (quién sos, con qué cuenta mirás, herramientas), leyenda de sitio no oficial en la barra y en la
// pestaña (ArenaNet), marca DEV solo en el repo de desarrollo, menús con teclado y la hoja del celular.
// La prueba de conducta arma la barra REAL de index.html en un DOM mínimo.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/gn-topbar.js');
const I = read('index.html');
const HDR = I.slice(I.indexOf('<header class="gn-tb"'), I.indexOf('</header>') + 9);
const STYLE = I.slice(I.indexOf('/* ============ BARRA DE ARRIBA'), I.indexOf('/* ============ SIDEBAR'));

test('archivo: versión, manifiesto después de gn-ui, menos de 40 KB, sin almacenamiento, sin API y sin emojis', () => {
  const v = SRC.match(/Versión: ([\d.]+)/)[1];
  assert.match(SRC, new RegExp("var VERSION = '" + v.replace(/\./g, '\\.') + "'"));
  const mods = JSON.parse(read('js/modules.json')).modules.map((m) => m.src + '@' + m.v);
  assert.ok(mods.indexOf('js/gn-topbar.js@' + v) === mods.indexOf('js/gn-ui.js@' + mods.find((s) => s.startsWith('js/gn-ui.js@')).split('@')[1]) + 1, 'va justo después de gn-ui');
  assert.ok(Buffer.byteLength(SRC) < 40 * 1024);
  assert.doesNotMatch(SRC, /localStorage|sessionStorage|Storage\.|fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'sin emojis');
  assert.doesNotMatch(I, /src="js\/gn-topbar\.js/, 'se carga por el manifiesto, no desde index.html');
});

test('ArenaNet: la pestaña y la barra dicen que es un sitio de la comunidad, no oficial', () => {
  assert.match(I, /<title>Bóveda del Gato Negro · sitio de la comunidad de Guild Wars 2 \(no oficial\)<\/title>/);
  assert.doesNotMatch(I, /v6\.6\.2<\/title>/, 'sin la versión vieja que no significaba nada');
  assert.match(HDR, /<span class="gn-tb__fan">Sitio de la comunidad · no oficial<\/span>/);
});

test('index.html: tres zonas, el logo lleva a Inicio, cuenta y Keys juntas, herramientas en menús', () => {
  assert.match(HDR, /<a class="gn-tb__brand" href="#\/welcome"[^>]*>\s*<img class="brand-logo-compact" src="assets\/brand\/gato-negro\.svg"/);
  const acct = HDR.slice(HDR.indexOf('gn-tb__acct'), HDR.indexOf('gnTbMore'));
  assert.match(acct, /<select id="keySelectGlobal"/);
  assert.match(acct, /<button id="keysMenuBtn"[^>]*aria-controls="keysModal"/);
  const tools = HDR.slice(HDR.indexOf('id="gnTbTools"'));
  assert.match(tools, /id="guideLink"/);
  const menu = (id) => { const s = tools.slice(tools.indexOf('<ul class="gn-tb__menu" id="' + id + '"')); return s.slice(0, s.indexOf('</ul>')); };
  const links = menu('gnTbLinks'), set = menu('gnTbSet');
  assert.match(links, /role="menu" aria-labelledby="gnTbLinksBtn" hidden/);
  assert.equal((links.match(/role="menuitem" href="https:\/\/[^"]+" target="_blank" rel="noopener"/g) || []).length, 5, '5 enlaces externos, en otra pestaña');
  assert.match(links, /href="https:\/\/account\.arena\.net\/applications"[^>]*>Crear una API Key/);
  ['themeToggleBtn', 'exportSettingsBtn', 'importSettingsBtn', 'clearCacheBtn'].forEach((id) =>
    assert.match(set, new RegExp('<button id="' + id + '"[^>]*role="menuitem"|<button id="' + id + '"[\\s\\S]*?role="menuitem"'), id + ' en Ajustes'));
  const visible = HDR.replace(/<ul class="gn-tb__menu"[\s\S]*?<\/ul>/g, '');
  const controls = (visible.match(/<(a|button|select)\b/g) || []).length;
  assert.equal(controls, 7, 'a la vista: logo, cuenta, Keys, Opciones (solo celular), Guías, Enlaces y Ajustes');
  assert.doesNotMatch(HDR, /an-util-left|an-home-link|Welcome\/3380755|⛁|style="/, 'sin la barra vieja, el ícono de la Heredad ni estilos en línea');
  assert.doesNotMatch(HDR, /pablosnchz\.github\.io\/bio/, 'el distintivo ya no está en la barra');
  const foot = I.slice(I.indexOf('<footer'), I.indexOf('</footer>'));
  assert.match(foot, /href="https:\/\/pablosnchz\.github\.io\/bio\/"/, 'el distintivo está en el pie (D7)');
});

test('estilos: solo los textos del theme, DEV ámbar legible, 44 px y una fila en el celular', () => {
  const colors = [...STYLE.matchAll(/(?:^|[;{\s])color:\s*([^;}]+)/g)].map((m) => m[1].trim());
  colors.forEach((c) => assert.ok(/^var\(--tx-[12]\)$|^var\(--gn-gold\)$|^#0F1117$|^inherit$/.test(c), 'color ' + c));
  const lum = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (lum('F2B94B') + 0.05) / (lum('0F1117') + 0.05);
  assert.match(STYLE, /\.gn-tb__dev \{ display: none;[^}]*background: #F2B94B; color: #0F1117;/);
  assert.ok(ratio >= 4.5, 'DEV ' + ratio.toFixed(2));
  assert.match(STYLE, /html\.gn-env-dev \.gn-tb__dev \{ display: inline-flex; \}/);
  const mob = STYLE.slice(STYLE.indexOf('@media (max-width: 900px)'));
  assert.match(mob, /\.gn-tb__btn \{ min-height: 44px; \}/);
  assert.match(mob, /#keySelectGlobal \{[^}]*min-height: 44px/);
  assert.match(mob, /\.gn-tb__tools \{ display: none;/);
  assert.match(mob, /\.gn-tb\.is-open \.gn-tb__tools \{ display: flex; \}/);
  assert.doesNotMatch(STYLE, /flex-direction: column; align-items: stretch; \}\s*\.gn-tb__row/, 'la fila ya no se apila');
  assert.match(STYLE, /\.gn-tb a:focus-visible[^{]*\{ outline: 2px solid var\(--acc-1\)/);
});

test('marca DEV: solo cuando corre desde gw2-factory-dev', () => {
  const { G } = load();
  assert.equal(G.isDev({ pathname: '/gw2-factory-dev/' }), true);
  assert.equal(G.isDev({ pathname: '/gw2-factory-dev' }), true);
  assert.equal(G.isDev({ pathname: '/gw2-wallet-ligero/' }), false);
  assert.equal(G.isDev({ pathname: '/gw2-factory-devx/' }), false);
  assert.equal(G.isDev({ pathname: '/' }), false);
  const dev = load('/gw2-factory-dev/index.html');
  assert.ok(dev.D.html.classList.contains('gn-env-dev'));
  assert.ok(!load('/gw2-wallet-ligero/').D.html.classList.contains('gn-env-dev'), 'en producción no aparece');
});

// ------------------------------------------------------------------ DOM mínimo con la barra real
function parse(html, D) {
  const VOID = /^(img|input|br|meta|link|hr|path|circle)$/;
  const rootN = D.node('header-host'), stack = [rootN];
  const re = /<!--[\s\S]*?-->|<\/([a-z0-9]+)\s*>|<([a-z0-9]+)((?:\s+[a-z-]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    if (m[1]) { stack.pop(); continue; }
    if (m[2]) {
      const n = D.node(m[2]);
      (m[3] || '').replace(/([a-z-]+)(?:="([^"]*)")?/gi, (_, k, v) => { n.setAttribute(k, v == null ? '' : v); return ''; });
      stack[stack.length - 1].appendChild(n);
      if (!m[4] && !VOID.test(m[2])) stack.push(n);
      continue;
    }
    if (m[5].trim()) stack[stack.length - 1].textContent += m[5];
  }
  return rootN.children[0];
}
function fakeDom() {
  const D = { active: null };
  D.node = (tag) => {
    const n = {
      tagName: tag.toUpperCase(), attrs: {}, children: [], parentNode: null, listeners: [], textContent: '', disabled: false,
      classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); }, contains(c) { return this.s.has(c); } },
      get id() { return this.attrs.id || ''; },
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') String(v).split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c)); },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      removeAttribute(k) { delete this.attrs[k]; },
      appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
      addEventListener(t, f, cap) { this.listeners.push({ t, f, cap: !!cap }); },
      focus() { D.active = this; },
      querySelectorAll(sel) {
        const out = [], walk = (x) => x.children.forEach((c) => { if (match(c, sel)) out.push(c); walk(c); });
        walk(this); return out;
      },
    };
    return n;
  };
  const match = (n, sel) => sel.split(',').some((s) => {
    s = s.trim();
    const a = s.match(/^\[([a-z-]+)="([^"]*)"\]$/);
    return a ? n.getAttribute(a[1]) === a[2] : n.tagName === s.toUpperCase();
  });
  D.html = D.node('html');
  D.body = D.html.appendChild(D.node('body'));
  const all = (n, out) => { out.push(n); n.children.forEach((c) => all(c, out)); return out; };
  D.doc = {
    readyState: 'complete', documentElement: D.html, body: D.body,
    get activeElement() { return D.active; },
    getElementById: (id) => all(D.html, []).find((n) => n.attrs.id === id) || null,
    addEventListener: (t, f, cap) => D.html.listeners.push({ t, f, cap: !!cap, doc: true }),
  };
  return D;
}
// Captura desde arriba, el objetivo y la burbuja hacia arriba, como en el navegador.
function fire(D, target, type, extra) {
  const e = Object.assign({ type, target, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; } }, extra || {});
  const pathUp = []; for (let n = target; n; n = n.parentNode) pathUp.push(n);
  const run = (n, phase) => n.listeners.filter((l) => l.t === type && (phase === 'target' || (phase === 'cap') === l.cap))
    .forEach((l) => { if (!e.stopped) { e.currentTarget = n; l.f(e); } });
  for (let i = pathUp.length - 1; i > 0 && !e.stopped; i--) run(pathUp[i], 'cap');
  run(target, 'target');
  for (let i = 1; i < pathUp.length && !e.stopped; i++) run(pathUp[i], 'bub');
  return e;
}
function load(pathname) {
  const D = fakeDom();
  const header = parse(HDR, D);
  D.body.appendChild(header);
  const outside = D.body.appendChild(D.node('main'));
  const calls = { theme: 0, themeFocus: null };
  const sb = { console: { info() {} }, Array, String, Object, location: { pathname: pathname || '/' }, document: D.doc };
  sb.ThemeSelector = { openModal() { calls.theme++; calls.themeFocus = D.active; } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'js/gn-topbar.js' });
  const $ = (id) => D.doc.getElementById(id);
  const key = (k, extra) => fire(D, D.active, 'keydown', Object.assign({ key: k }, extra || {}));
  return { D, G: sb.GNTopbar, $, key, outside, calls };
}
const hid = (n) => n.getAttribute('hidden') !== null;

test('menús: abren con el botón y el foco entra; flechas, Inicio y Fin; Escape cierra y vuelve al botón', () => {
  const { D, $, key } = load();
  const btn = $('gnTbLinksBtn'), menu = $('gnTbLinks');
  const items = menu.querySelectorAll('[role="menuitem"]');
  assert.equal(items.length, 5);
  btn.focus(); fire(D, btn, 'click');
  assert.ok(!hid(menu)); assert.equal(btn.getAttribute('aria-expanded'), 'true'); assert.equal(D.active, items[0]);
  key('ArrowDown'); assert.equal(D.active, items[1]);
  key('ArrowUp'); key('ArrowUp'); assert.equal(D.active, items[4], 'da la vuelta');
  key('Home'); assert.equal(D.active, items[0]);
  key('End'); assert.equal(D.active, items[4]);
  key('ArrowDown'); assert.equal(D.active, items[0], 'del último, flecha abajo vuelve al primero');
  const e = key('Escape');
  assert.ok(e.defaultPrevented && hid(menu)); assert.equal(btn.getAttribute('aria-expanded'), 'false'); assert.equal(D.active, btn);
  key('ArrowUp'); assert.ok(!hid(menu)); assert.equal(D.active, items[4], 'flecha arriba en el botón abre en el último');
  key('Tab'); assert.ok(hid(menu), 'Tab sale y cierra');
});

test('menús: uno a la vez, tocar afuera cierra, y el foco nunca queda en un botón escondido', () => {
  const { D, $, outside, calls } = load();
  fire(D, $('gnTbLinksBtn'), 'click');
  fire(D, $('gnTbSetBtn'), 'click');
  assert.ok(hid($('gnTbLinks')) && !hid($('gnTbSet')), 'abrir Ajustes cierra Enlaces');
  fire(D, outside, 'click'); assert.ok(hid($('gnTbSet')), 'tocar afuera cierra');
  // Elegir «Cambiar el tema»: el menú se cierra ANTES de abrir la ventana, así el foco vuelve a «Ajustes».
  fire(D, $('gnTbSetBtn'), 'click');
  const order = [];
  $('exportSettingsBtn').addEventListener('click', () => order.push(hid($('gnTbSet')) ? 'cerrado' : 'abierto'));
  fire(D, $('themeToggleBtn'), 'click');
  assert.equal(calls.theme, 1, 'abre el selector de themes de siempre');
  assert.equal(calls.themeFocus, $('gnTbSetBtn'), 'la ventana se abre con el foco en «Ajustes»');
  fire(D, $('gnTbSetBtn'), 'click');
  fire(D, $('exportSettingsBtn'), 'click');
  assert.deepEqual(order, ['cerrado'], 'la acción de cada botón corre con el menú ya cerrado');
});

test('celular: «Opciones» abre la hoja, el foco entra y no se escapa, Escape cierra y vuelve a «Opciones»', () => {
  const { D, G, $, key, outside } = load();
  const more = $('gnTbMore'), bar = $('gnTopbar');
  assert.equal(more.getAttribute('aria-controls'), 'gnTbTools');
  more.focus(); fire(D, more, 'click');
  assert.ok(bar.classList.contains('is-open')); assert.equal(more.getAttribute('aria-expanded'), 'true');
  assert.equal(D.active, $('guideLink'), 'el foco entra en Guías');
  more.focus(); key('Tab', { shiftKey: true }); assert.equal(D.active, $('gnTbSetBtn'), 'Mayús+Tab desde «Opciones» va al último de la hoja');
  key('Tab'); assert.equal(D.active, more, 'Tab desde el último vuelve a «Opciones»: no se escapa');
  // un menú dentro de la hoja: Tab recorre sus opciones sin cerrarlo
  fire(D, $('gnTbSetBtn'), 'click');
  assert.equal(D.active, $('themeToggleBtn'));
  key('End'); key('Tab'); assert.equal(D.active, more, 'del último ítem vuelve a «Opciones»');
  key('Escape'); assert.ok(hid($('gnTbSet')) || !G._state().open, 'Escape primero cierra el menú');
  $('guideLink').focus(); key('Escape');
  assert.ok(!bar.classList.contains('is-open')); assert.equal(D.active, more);
  fire(D, more, 'click'); fire(D, outside, 'click');
  assert.ok(!bar.classList.contains('is-open'), 'tocar afuera la cierra');
  fire(D, more, 'click'); fire(D, $('guideLink'), 'click');
  assert.ok(!bar.classList.contains('is-open'), 'elegir Guías cierra la hoja');
  assert.equal(D.active, more, 'y el foco queda en «Opciones», visible');
});

// ------------------------------------------------------------------ pie (TOP-6)
const FOOT = I.slice(I.indexOf('<footer'), I.indexOf('</footer>') + 9);
const ANET = '© 2014 ArenaNet, LLC. All rights reserved. NCSOFT, the interlocking NC logo, ArenaNet, Guild Wars, Guild Wars Factions, ' +
  'Guild Wars Nightfall, Guild Wars: Eye of the North, Guild Wars 2, and all associated logos and designs are trademarks or registered ' +
  'trademarks of NCSOFT Corporation. All other trademarks are the property of their respective owners.';

test('pie: el aviso de ArenaNet tal cual, la leyenda de sitio no oficial y nada en línea', () => {
  assert.match(FOOT, /<footer class="site-footer gn-ft" id="gnFooter" role="contentinfo">/);
  assert.ok(FOOT.indexOf('<p lang="en">' + ANET + '</p>') > 0, 'el aviso de copyright y marcas, en inglés y sin tocar');
  assert.match(FOOT, /Sitio de la comunidad, no oficial: no está afiliado a ArenaNet ni a NCSOFT\./);
  assert.doesNotMatch(FOOT, /style="|onclick=|onmouse/, 'sin estilos ni código en línea');
  const ext = FOOT.match(/<a [^>]*href="https:\/\/[^"]+"[^>]*>/g) || [];
  assert.equal(ext.length, 4, 'tres enlaces del juego y el distintivo');
  ext.forEach((a) => assert.match(a, /target="_blank" rel="noopener"/, a));
  assert.equal((FOOT.match(/\(se abre en otra pestaña\)/g) || []).length, 4, 'el lector avisa que se abre en otra pestaña');
});

test('pie: el distintivo con sus colores fijos y legibles, y la foto servida desde la Bóveda', () => {
  assert.doesNotMatch(I, /raw\.githubusercontent\.com/, 'la foto ya no se pide a otro sitio');
  assert.match(FOOT, /<a class="gn-bio" href="https:\/\/pablosnchz\.github\.io\/bio\/"[^>]*><span class="gn-bio__a"><img src="assets\/brand\/pablo-bio\.svg" alt="" width="18" height="18">Link in Bio<\/span><span class="gn-bio__b">Pablin Schez<\/span>/);
  const svg = read('assets/brand/pablo-bio.svg');
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.doesNotMatch(svg, /<script|on\w+=|href="(?!data:image\/webp;base64,)/i, 'no ejecuta nada ni pide recursos de afuera');
  assert.ok(Buffer.byteLength(svg) < 8 * 1024, 'foto chica');
  assert.match(SRC, /\.gn-bio \.gn-bio__a \{[^}]*background-color: #232A3A; color: #F4F6FA;/);
  assert.match(SRC, /\.gn-bio \.gn-bio__b \{[^}]*background-color: #5A3DDB; color: #FFFFFF;/);
  const lum = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  assert.ok(ratio('F4F6FA', '232A3A') >= 4.5 && ratio('FFFFFF', '5A3DDB') >= 4.5, 'los dos lados se leen');
});

test('pie: estilos con los textos del theme, foco visible y 44 px en el celular', () => {
  const css = SRC.slice(SRC.indexOf('var FOOT_CSS = ['), SRC.indexOf("].join('\\n');"));
  assert.ok(css.length > 200, 'los estilos del pie viven en el módulo');
  const colors = [...css.matchAll(/(?:^|[;{\s'])color:\s*([^;}]+)/g)].map((m) => m[1].trim()).filter((c) => !/^#(F4F6FA|FFFFFF)$/.test(c));
  colors.forEach((c) => assert.ok(/^var\(--tx-[12]\)$/.test(c), 'color ' + c));
  assert.match(css, /\.gn-ft a:focus-visible, \.gn-ft button:focus-visible \{ outline: 2px solid var\(--acc-1\)/);
  assert.match(css, /@media \(max-width: 900px\) \{[^']*\.gn-ft__col a, \.gn-ft__col button \{ min-height: 44px; \}/);
});

function loadFoot() {
  const D = fakeDom();
  D.doc.head = D.html.appendChild(D.node('head'));
  D.doc.createElement = (t) => D.node(t);
  D.body.appendChild(parse(HDR, D));
  D.body.appendChild(parse(FOOT, D));
  const sb = { console: { info() {} }, Array, String, Object, location: { pathname: '/' }, document: D.doc };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'js/gn-topbar.js' });
  const $ = (id) => D.doc.getElementById(id);
  return { D, G: sb.GNTopbar, $ };
}

test('pie: «Guías de uso» y «Gestión de Keys» tocan los botones de la barra y el foco queda en el pie', () => {
  const { D, G, $ } = loadFoot();
  const css = D.doc.head.children.filter((n) => n.attrs.id === 'gn-ft-css');
  assert.equal(css.length, 1, 'pone sus estilos una vez');
  assert.match(css[0].textContent, /\.gn-bio \.gn-bio__b/);
  assert.equal(G.footer(), false, 'no se engancha dos veces');
  const seen = [];
  ['guideLink', 'keysMenuBtn'].forEach((id) => { $(id).click = () => seen.push([id, D.active]); });
  const btns = $('gnFooter').querySelectorAll('button');
  assert.deepEqual(btns.map((b) => b.getAttribute('data-gn-open')), ['guideLink', 'keysMenuBtn']);
  btns.forEach((b) => fire(D, b, 'click'));
  assert.deepEqual(seen.map((s) => s[0]), ['guideLink', 'keysMenuBtn']);
  assert.ok(seen.every((s, i) => s[1] === btns[i]), 'la ventana se abre con el foco en el botón del pie, que es adonde vuelve');
  const home = $('gnFooter').querySelectorAll('a')[0];
  const e = fire(D, home, 'click');
  assert.ok(!e.defaultPrevented, 'Inicio es un enlace común');
});
