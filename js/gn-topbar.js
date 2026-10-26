/*!
 * js/gn-topbar.js — Barra de arriba de la Bóveda (BL-070 paso 5, TOP-5)
 * Versión: 1.0.0
 *
 * La barra tiene tres zonas: quién sos y dónde estás (logo, que lleva a Inicio, con la leyenda
 * «Sitio de la comunidad · no oficial» que pide ArenaNet), con qué cuenta mirás (#keySelectGlobal y Keys)
 * y las herramientas (Guías y los menús Enlaces y Ajustes). El marcado vive en index.html, así se ve
 * bien desde el primer cuadro; este módulo le pone la conducta:
 *  - Marca DEV: solo cuando la Bóveda corre desde gw2-factory-dev (clase gn-env-dev en <html>).
 *  - Menús con teclado: flechas, Inicio y Fin; Escape cierra y el foco vuelve a su botón; Tab sale y cierra;
 *    tocar afuera cierra. Al elegir algo, el menú se cierra ANTES de que corra la acción, así una ventana
 *    que se abra devuelve el foco a un botón visible.
 *  - Celular (hasta 900 px): una sola fila. «Opciones» abre la hoja con Guías, Enlaces y Ajustes; el foco
 *    queda adentro, Escape o tocar afuera la cierran y el foco vuelve a «Opciones». No uso las tres
 *    rayas: son el «Más» de la barra de abajo (sidebar-nav.js), y dos iguales confunden.
 *  - «Cambiar el tema» es el #themeToggleBtn de siempre: theme-selector.js ya no inyecta el suyo.
 * No guarda nada, no pide nada a la API y no cambia ningún id que usen otros módulos.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var DEV_PATH = /^\/gw2-factory-dev(\/|$)/;
  var MENUS = ['gnTbLinksBtn', 'gnTbSetBtn'];
  var st = { open: null, sheet: false, wired: false };

  function doc() { return root.document; }
  function byId(id) { return doc().getElementById(id); }
  function arr(x) { return Array.prototype.slice.call(x || []); }
  function focus(n) { if (n && typeof n.focus === 'function') n.focus(); }
  function hiddenUp(n) {
    for (; n && n.getAttribute; n = n.parentNode) if (n.getAttribute('hidden') !== null) return true;
    return false;
  }
  function inside(box, n) { for (; n; n = n.parentNode) if (n === box) return true; return false; }
  function stop(e) { if (e.preventDefault) e.preventDefault(); if (e.stopPropagation) e.stopPropagation(); }

  function isDev(loc) {
    loc = loc || root.location || {};
    return DEV_PATH.test(String(loc.pathname || ''));
  }
  function markEnv(loc) {
    var html = doc().documentElement, dev = isDev(loc);
    if (html && html.classList) { if (dev) html.classList.add('gn-env-dev'); else html.classList.remove('gn-env-dev'); }
    return dev;
  }

  // ---------------------------------------------------------------- menús
  function menuOf(btn) { return btn ? byId(btn.getAttribute('aria-controls')) : null; }
  function items(menu) { return menu ? arr(menu.querySelectorAll('[role="menuitem"]')) : []; }

  function openMenu(btn, which) {
    var menu = menuOf(btn);
    if (!menu) return false;
    if (st.open && st.open !== btn) closeMenu(false);
    menu.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
    st.open = btn;
    var list = items(menu);
    if (which === 'last') focus(list[list.length - 1]); else if (which !== 'none') focus(list[0]);
    return true;
  }

  function closeMenu(refocus) {
    var btn = st.open;
    if (!btn) return false;
    var menu = menuOf(btn);
    if (menu) menu.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', 'false');
    st.open = null;
    if (refocus) focus(btn);
    return true;
  }

  function onMenuKey(e, btn) {
    var list = items(menuOf(btn)), i = list.indexOf(doc().activeElement), n = list.length;
    if (!n) return;
    if (e.key === 'ArrowDown') { stop(e); focus(list[(i + 1) % n]); }
    else if (e.key === 'ArrowUp') { stop(e); focus(list[(i - 1 + n) % n]); }
    else if (e.key === 'Home') { stop(e); focus(list[0]); }
    else if (e.key === 'End') { stop(e); focus(list[n - 1]); }
    else if (e.key === 'Escape' || e.key === 'Esc') { stop(e); closeMenu(true); }
    else if (e.key === 'Tab' && !st.sheet) closeMenu(false); // en la hoja el menú queda abierto y Tab sigue adentro
  }

  // ---------------------------------------------------------------- hoja del celular
  function tools() { return byId('gnTbTools'); }
  function more() { return byId('gnTbMore'); }
  function bar() { return byId('gnTopbar'); }

  function sheetFocusables() {
    var t = tools();
    var list = t ? arr(t.querySelectorAll('a, button')).filter(function (n) { return !n.disabled && !hiddenUp(n); }) : [];
    return [more()].filter(Boolean).concat(list);
  }

  function openSheet() {
    var b = bar(), m = more();
    if (!b || st.sheet) return false;
    st.sheet = true;
    b.classList.add('is-open');
    if (m) m.setAttribute('aria-expanded', 'true');
    focus(sheetFocusables()[1]);
    return true;
  }

  function closeSheet(refocus) {
    var b = bar(), m = more();
    if (!b || !st.sheet) return false;
    closeMenu(false);
    st.sheet = false;
    b.classList.remove('is-open');
    if (m) m.setAttribute('aria-expanded', 'false');
    if (refocus) focus(m);
    return true;
  }

  function trapTab(e) {
    var list = sheetFocusables();
    if (list.length < 2) return;
    var first = list[0], last = list[list.length - 1], cur = doc().activeElement;
    if (e.shiftKey && (cur === first || list.indexOf(cur) < 0)) { stop(e); focus(last); }
    else if (!e.shiftKey && (cur === last || list.indexOf(cur) < 0)) { stop(e); focus(first); }
  }

  // ---------------------------------------------------------------- oyentes
  function onKey(e) {
    if (!e) return;
    var btn = st.open, menu = menuOf(btn), cur = doc().activeElement;
    if (btn && menu && inside(menu, cur)) { onMenuKey(e, btn); if (e.key !== 'Tab' || !st.sheet) return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (cur && MENUS.indexOf(cur.id) >= 0) { stop(e); openMenu(cur, e.key === 'ArrowUp' ? 'last' : 'first'); }
      return;
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (st.open) { stop(e); closeMenu(true); return; }
      if (st.sheet) { stop(e); closeSheet(true); }
      return;
    }
    if (e.key === 'Tab' && st.sheet) trapTab(e);
  }

  // Captura: elegir algo cierra el menú y la hoja ANTES de que corra la acción del botón.
  function onPick(e) {
    var t = e && e.target, n = t;
    for (; n && n !== tools(); n = n.parentNode) {
      if (n.getAttribute && (n.getAttribute('role') === 'menuitem' || n.id === 'guideLink')) break;
    }
    if (!n || n === tools()) return;
    var back = st.sheet ? more() : st.open;
    closeMenu(false);
    closeSheet(false);
    focus(back);
  }

  function onTrigger(e) {
    var btn = e.currentTarget || e.target;
    if (st.open === btn) closeMenu(false); else openMenu(btn, 'first');
  }

  function onOutside(e) {
    var b = bar();
    if (!b || inside(b, e && e.target)) return;
    closeMenu(false);
    closeSheet(false);
  }

  function onTheme(e) {
    if (e && e.preventDefault) e.preventDefault();
    var T = root.ThemeSelector;
    if (T && typeof T.openModal === 'function') T.openModal();
  }

  function wire() {
    if (st.wired || !bar()) return false;
    st.wired = true;
    MENUS.forEach(function (id) { var b = byId(id); if (b) b.addEventListener('click', onTrigger); });
    var m = more();
    if (m) m.addEventListener('click', function () { if (st.sheet) closeSheet(true); else openSheet(); });
    var t = tools();
    if (t) t.addEventListener('click', onPick, true);
    var th = byId('themeToggleBtn');
    if (th) th.addEventListener('click', onTheme);
    bar().addEventListener('keydown', onKey);
    doc().addEventListener('click', onOutside);
    if (typeof root.matchMedia === 'function') {
      var mq = root.matchMedia('(max-width:900px)');
      var on = function () { if (!mq.matches) closeSheet(false); };
      if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on);
    }
    return true;
  }

  function init() {
    markEnv();
    wire();
    if (root.console && root.console.info) root.console.info('[GNTopbar] v' + VERSION);
  }

  root.GNTopbar = {
    version: VERSION, init: init, isDev: isDev, markEnv: markEnv,
    openMenu: openMenu, closeMenu: closeMenu, openSheet: openSheet, closeSheet: closeSheet,
    _state: function () { return { open: st.open ? st.open.id : null, sheet: st.sheet }; }
  };

  if (doc() && doc().readyState === 'loading') doc().addEventListener('DOMContentLoaded', init);
  else if (doc()) init();
})(typeof window !== 'undefined' ? window : this);
