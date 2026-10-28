/*!
 * js/bld-view.js — Builds: el panel, las pestañas y las rutas del módulo (BL-082)
 * Versión: 1.1.0 (2026-10-28) · BLD-4: cada pestaña dibuja en un lugar nuevo (sin oyentes de la anterior);
 *          íconos de pestaña por GNKit (tab.bld.*) · antes 1.0.0 BLD-1: panel propio, ruta #/builds y pestañas
 *
 * Se carga «por ruta» (js/boot.js 1.2.0, js/modules.json → routes["#/builds"]): recién al entrar a #/builds.
 * No vive en index.html: crea su <section id="buildsPanel"> al lado de los otros paneles y js/router.js
 * lo muestra y lo esconde como a los demás.
 * Rutas: #/builds (Biblioteca) · #/builds/editor · #/builds/mis · #/builds/importar · #/builds/c/<código> (enlace
 * para compartir: abre la build en Importar). Cada pestaña la dibuja su archivo (bld-lib, bld-editor, bld-mine,
 * bld-import) con GNBld.register(id, { render(host, ctx) }); si todavía no cargó, se ve un aviso.
 * Sin pedidos propios: los datos del juego los trae js/bld-ref.js.
 */
(function (root) {
  'use strict';

  var VERSION = '1.1.0';
  var LOG = '[GNBld]';
  var PANEL = 'buildsPanel';
  var ROUTE = '#/builds';
  var COLOR = '#C9B6FF';
  var ICON = 'assets/icons/professions/2163510.png';
  var TABS = [
    { id: 'lib', label: 'Biblioteca', path: '' },
    { id: 'editor', label: 'Editor', path: 'editor' },
    { id: 'mine', label: 'Mis builds', path: 'mis' },
    { id: 'import', label: 'Importar', path: 'importar' }
  ];
  var doc = root.document;
  var st = { impl: {}, tab: 'lib', arg: '', shown: false, renderedTab: null };

  // ---------------------------------------------------------------- puro
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // '#/builds/editor' → { tab: 'editor', arg: '' } · '#/builds/c/XYZ' → { tab: 'import', arg: 'XYZ' } · otra ruta → null
  function parseHash(h) {
    var s = String(h || '');
    if (s !== ROUTE && s.indexOf(ROUTE + '/') !== 0) return null;
    var rest = s.slice(ROUTE.length + 1), parts = rest.split('/');
    var head = parts.shift() || '';
    if (head === 'c') return { tab: 'import', arg: safeDecode(parts.join('/')) };
    for (var i = 0; i < TABS.length; i++) if (TABS[i].path === head) return { tab: TABS[i].id, arg: safeDecode(parts.join('/')) };
    return { tab: 'lib', arg: '' };
  }
  function safeDecode(s) { try { return decodeURIComponent(s || ''); } catch (_) { return ''; } }
  function hashFor(tab, arg) {
    var t = TABS.filter(function (x) { return x.id === tab; })[0] || TABS[0];
    return ROUTE + (t.path ? '/' + t.path : '') + (arg ? '/' + encodeURIComponent(arg) : '');
  }
  // Enlace para compartir: la build viaja adentro (sin servidor). base = la página actual sin el hash.
  function shareUrl(code, base) {
    var b64 = String(code || '').replace(/^\[&/, '').replace(/\]$/, '');
    return String(base || '') + ROUTE + '/c/' + encodeURIComponent(b64);
  }

  function headHTML(sub) {
    return '<h2 class="panel__title bld-title" id="bldTitle"><img src="' + ICON + '" alt="" width="40" height="40"> ' +
      '<span>Builds</span></h2>' +
      '<p class="bld-sub" id="bldSub">' + esc(sub || 'Builds curadas, tu editor y tus códigos del juego, en castellano.') + '</p>';
  }
  function tabsHTML(active, kit) {
    var h = ['<div class="bld-tabs" role="tablist" aria-label="Secciones de Builds">'];
    TABS.forEach(function (t) {
      var on = t.id === active;
      var ic = kit && typeof kit.icon === 'function' ? kit.icon('tab.bld.' + t.id, 18) : '';
      h.push('<button type="button" role="tab" id="bldTab-' + t.id + '" data-bld-tab="' + t.id + '" aria-selected="' + on +
        '" aria-controls="bldBody" tabindex="' + (on ? '0' : '-1') + '">' + ic + esc(t.label) + '</button>');
    });
    h.push('</div>');
    return h.join('');
  }
  function viewHTML(m) {
    return headHTML(m.sub) + tabsHTML(m.tab, m.kit) +
      '<div id="bldBody" class="bld-body" role="tabpanel" aria-labelledby="bldTab-' + esc(m.tab) + '" tabindex="-1"></div>';
  }
  function waitingHTML(label) {
    return '<div class="bld-card bld-wait"><p>Cargando ' + esc(label) + '…</p></div>';
  }

  // ---------------------------------------------------------------- CSS (con los tokens de los 19 themes)
  var P = '#' + PANEL;
  var CSS = [
    P + '{--gn-mod:' + COLOR + '}',
    P + ' .bld-title{display:flex;align-items:center;gap:10px;font-size:1.3rem;font-weight:800;color:var(--tx-1);padding-bottom:12px;margin:0 0 6px;border-bottom:1px solid var(--bd-1);background:linear-gradient(90deg,var(--gn-mod),transparent) 0 100%/140px 2px no-repeat}',
    P + ' .bld-title img{width:40px;height:40px;padding:4px;border-radius:10px;background:var(--gn-plate,var(--bg-2));box-shadow:0 0 0 2px color-mix(in srgb,var(--gn-mod) 70%,transparent);box-sizing:content-box}',
    P + ' .bld-sub{margin:0 0 12px;color:var(--tx-2);font-size:.9rem}',
    P + ' .bld-tabs{display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid var(--bd-1);margin-bottom:12px}',
    P + ' .bld-tabs [role=tab]{display:inline-flex;align-items:center;gap:6px;background:none;border:0;border-bottom:2px solid transparent;color:var(--tx-2);padding:8px 12px;font:inherit;cursor:pointer}',
    P + ' .bld-tabs [role=tab][aria-selected=true]{color:var(--tx-1);font-weight:700;border-bottom-color:var(--gn-mod)}',
    P + ' .bld-card{background:var(--bg-1);border:1px solid var(--bd-1);border-radius:12px;padding:12px 14px;box-shadow:var(--gn-elev,none)}',
    P + ' .bld-muted{color:var(--tx-2)}',
    P + ' .bld-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bd-2,var(--bd-1));border-radius:999px;background:var(--bg-2);color:var(--tx-1);padding:5px 12px;font:inherit;font-size:.85rem;cursor:pointer;text-decoration:none}',
    P + ' .bld-btn:hover{border-color:var(--gn-mod)}',
    P + ' .bld-btn[disabled]{opacity:.5;cursor:not-allowed}',
    P + ' .bld-err{color:var(--color-red,#F47C7C)}',
    P + ' .bld-ok{color:var(--color-green,#3fb950)}',
    P + ' :is(a,button,input,select,textarea,[tabindex]):focus-visible{outline:2px solid var(--acc-1);outline-offset:2px}',
    '@media (prefers-reduced-motion:reduce){' + P + ' *{transition:none!important;animation:none!important}}',
    '@media (max-width:720px){' + P + ' :is(button,.bld-btn,select,input,textarea){min-height:44px}' + P + ' .bld-title{font-size:1.15rem}}'
  ].join('\n');

  // ---------------------------------------------------------------- DOM
  function byId(id) { return doc && doc.getElementById ? doc.getElementById(id) : null; }
  function hash() { return String((root.location && root.location.hash) || '').split('?')[0]; }

  function ensureCss() {
    if (!doc || byId('bld-view-css') || !doc.head) return;
    var s = doc.createElement('style');
    s.id = 'bld-view-css';
    s.textContent = CSS;
    doc.head.appendChild(s);
  }

  // El panel va junto a los demás (después de Cuentas); si no está ese ancla, al final del contenedor principal.
  function ensurePanel() {
    var p = byId(PANEL);
    if (p) return p;
    if (!doc || !doc.createElement) return null;
    var anchor = byId('accountsPanel') || byId('walletPanel');
    if (!anchor || !anchor.parentNode) return null;
    p = doc.createElement('section');
    p.id = PANEL;
    p.className = 'panel col-main';
    p.setAttribute('aria-labelledby', 'bldTitle');
    p.setAttribute('data-gn-frame', 'builds');
    p.hidden = true;
    anchor.parentNode.insertBefore(p, anchor.nextSibling);
    if (root.GNSurface && typeof root.GNSurface.register === 'function') {
      try { if (!root.GNSurface.scopes || root.GNSurface.scopes().indexOf(PANEL) < 0) root.GNSurface.register(PANEL); } catch (_) {}
    }
    wire(p);
    return p;
  }

  function wire(p) {
    p.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-bld-tab]') : null;
      if (b) { e.preventDefault(); go(b.getAttribute('data-bld-tab')); }
    });
    p.addEventListener('keydown', function (e) {
      var b = e.target && e.target.getAttribute && e.target.getAttribute('role') === 'tab' ? e.target : null;
      if (!b) return;
      var i = TABS.map(function (t) { return t.id; }).indexOf(b.getAttribute('data-bld-tab')), n = TABS.length, j = -1;
      if (e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
      if (j < 0) return;
      e.preventDefault();
      go(TABS[j].id, '', true);
    });
  }

  function ctx() {
    return { code: root.GNBldCode || null, ref: root.GNBldRef || null, store: root.GNBldStore || null, arg: st.arg, tab: st.tab,
      go: go, esc: esc, shareUrl: function (c) { return shareUrl(c, String(root.location && root.location.href || '').split('#')[0]); },
      toast: toast, setSub: setSub };
  }

  function setSub(text) { var s = byId('bldSub'); if (s) s.textContent = text; }

  function toast(msg, kind) {
    var host = byId('bldToast');
    if (!host) {
      var p = byId(PANEL); if (!p) return;
      host = doc.createElement('div'); host.id = 'bldToast'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite');
      host.style.cssText = 'position:sticky;bottom:12px;margin-top:12px;text-align:center';
      p.appendChild(host);
    }
    host.innerHTML = msg ? '<span class="bld-btn ' + (kind === 'err' ? 'bld-err' : 'bld-ok') + '">' + esc(msg) + '</span>' : '';
    clearTimeout(st.toastT);
    st.toastT = setTimeout(function () { if (host) host.innerHTML = ''; }, 3500);
  }

  function render(focusTab) {
    var p = ensurePanel();
    if (!p) return null;
    ensureCss();
    var keep = byId('bldSub') ? byId('bldSub').textContent : '';
    if (!byId('bldBody') || st.renderedTab !== st.tab) {
      p.innerHTML = viewHTML({ tab: st.tab, kit: root.GNKit, sub: keep });
    } else {
      TABS.forEach(function (t) {
        var b = byId('bldTab-' + t.id); if (!b) return;
        var on = t.id === st.tab;
        b.setAttribute('aria-selected', String(on)); b.setAttribute('tabindex', on ? '0' : '-1');
      });
      byId('bldBody').setAttribute('aria-labelledby', 'bldTab-' + st.tab);
    }
    var body = byId('bldBody'), impl = st.impl[st.tab];
    var label = (TABS.filter(function (t) { return t.id === st.tab; })[0] || {}).label;
    if (impl && typeof impl.render === 'function') {
      try { impl.render(body, ctx()); } catch (e) {
        body.innerHTML = '<div class="bld-card bld-err">No pude dibujar ' + esc(label) + '. Recargá la página; si sigue, avisame.</div>';
        if (root.console) root.console.warn(LOG, 'render', st.tab, e);
      }
    } else {
      body.innerHTML = waitingHTML(label);
    }
    st.renderedTab = st.tab;
    if (focusTab) { var fb = byId('bldTab-' + st.tab); if (fb && fb.focus) fb.focus(); }
    return body;
  }

  function go(tab, arg, focusTab) {
    var h = hashFor(tab, arg);
    if (hash() !== h && root.location) {
      st.pendingFocus = !!focusTab;
      root.location.hash = h;   // onRoute dibuja
      return;
    }
    st.tab = tab; st.arg = arg || '';
    render(focusTab);
  }

  function onRoute() {
    var r = parseHash(hash());
    if (!r) { st.shown = false; return; }
    st.tab = r.tab; st.arg = r.arg; st.shown = true;
    var p = ensurePanel();
    if (p) p.hidden = false;
    render(st.pendingFocus);
    st.pendingFocus = false;
  }

  // Los archivos de cada pestaña se anotan acá; si su pestaña está a la vista, se dibuja.
  function register(id, impl) {
    st.impl[id] = impl;
    if (st.shown && st.tab === id) render();
  }

  function init() {
    if (root.addEventListener) root.addEventListener('hashchange', function () { setTimeout(onRoute, 60); });
    onRoute();
  }

  root.GNBld = {
    version: VERSION, register: register, go: go, render: render, toast: toast,
    _pure: { parseHash: parseHash, hashFor: hashFor, shareUrl: shareUrl, viewHTML: viewHTML, tabsHTML: tabsHTML, esc: esc, TABS: TABS, CSS: CSS, ROUTE: ROUTE, PANEL: PANEL }
  };

  if (doc && doc.readyState === 'loading' && doc.addEventListener) doc.addEventListener('DOMContentLoaded', init);
  else if (doc) init();
  if (root.console && root.console.info) root.console.info(LOG, 'ready v' + VERSION);
})(typeof window !== 'undefined' ? window : this);
