/*!
 * js/bld-view.js — Builds: el panel, las pestañas y las rutas del módulo (BL-082)
 * Versión: 1.2.0 (2026-10-29) · BUI-4: el marco de Raids y Cuentas: cabecera con ícono, subtítulo, píldora del último
 *          parche de balance y 4 indicadores; pestañas con contador; el menú ⋯ es común a todas las pestañas y se cierra
 *          con Escape o tocando afuera · antes 1.1.0 BLD-4: cada pestaña dibuja en un lugar nuevo; íconos tab.bld.* de GNKit
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

  var VERSION = '1.2.0';
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

  function fmtDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
  // BUI-4: lo que muestra la cabecera. info = { cat, watch, mine, lib } (lib = GNBldLib._pure); sin catálogo, guiones.
  function statsModel(info) {
    info = info || {};
    var out = { builds: null, cov: null, ok: null, old: null, latest: '', mine: typeof info.mine === 'number' ? info.mine : null };
    var cat = info.cat, L = info.lib;
    if (!cat || !Array.isArray(cat.builds) || !L) return out;
    var latest = L.latestPatch(cat, info.watch);
    out.builds = cat.builds.length;
    out.latest = latest;
    out.cov = L.coverage(cat.builds, latest, true);
    out.ok = L.coverage(cat.builds, latest);
    out.old = cat.builds.filter(function (b) { return L.stateOf(b, latest) === 'revisar'; }).length;
    return out;
  }
  function stat(label, value, note) {
    return '<div class="bld-st"><small>' + label + '</small><b>' + value + '</b><em>' + note + '</em></div>';
  }
  function statsHTML(s) {
    var none = s.builds == null, n = function (x) { return x == null ? '—' : String(x); };
    var cov = none ? '—' : (s.cov.pve || 0) + ' <span>PvE</span> · ' + (s.cov.wvw || 0) + ' <span>WvW</span>';
    return stat('Builds curadas', n(s.builds), none ? 'cargando la biblioteca…' : 'Snow Crows y MetaBattle, con crédito') +
      stat('Élites cubiertas', cov, none ? 'de 36 por modo' : 'de 36 por modo' + (s.cov.pvp ? ' · PvP ' + s.cov.pvp + '/36' : '')) +
      stat('Para revisar', n(s.old), none ? 'según el último parche' : (s.old ? 'de un parche anterior al ' + fmtDate(s.latest) : 'todas al día con el ' + fmtDate(s.latest))) +
      stat('Mis builds', n(s.mine), 'en este navegador · viajan en tu respaldo');
  }
  function pillsHTML(s) {
    return s.latest ? '<span class="bld-pill" title="Último parche de balance que declaran las fuentes o la vigía semanal">Último parche de balance <b>' +
      esc(fmtDate(s.latest)) + '</b></span>' : '';
  }
  function heroHTML(m) {
    var s = m.stats || statsModel(null);
    return '<div class="bld-hero"><div class="bld-row"><img class="bld-ico" src="' + ICON + '" alt="" width="56" height="56">' +
      '<div class="bld-ttl"><h2 id="bldTitle">Builds</h2>' +
      '<p class="bld-sub" id="bldSub">' + esc(m.sub || 'Builds curadas, tu editor y tus códigos del juego, en castellano.') + '</p></div>' +
      '<div class="bld-pills" id="bldPills">' + pillsHTML(s) + '</div></div>' +
      '<div class="bld-stats" id="bldStats">' + statsHTML(s) + '</div></div>';
  }
  function badge(id, s) {
    var v = id === 'lib' ? s.builds : id === 'mine' ? s.mine : null;
    return v == null ? '' : '<span class="bld-badge">' + v + '</span>';
  }
  function tabsHTML(active, kit, stats) {
    var s = stats || statsModel(null);
    var h = ['<div class="bld-tabs" role="tablist" aria-label="Secciones de Builds">'];
    TABS.forEach(function (t) {
      var on = t.id === active;
      var ic = kit && typeof kit.icon === 'function' ? kit.icon('tab.bld.' + t.id, 18) : '';
      h.push('<button type="button" role="tab" id="bldTab-' + t.id + '" data-bld-tab="' + t.id + '" aria-selected="' + on +
        '" aria-controls="bldBody" tabindex="' + (on ? '0' : '-1') + '">' + ic + esc(t.label) + '<span id="bldBadge-' + t.id + '">' + badge(t.id, s) + '</span></button>');
    });
    h.push('</div>');
    return h.join('');
  }
  function viewHTML(m) {
    return heroHTML(m) + tabsHTML(m.tab, m.kit, m.stats) +
      '<div id="bldBody" class="bld-body" role="tabpanel" aria-labelledby="bldTab-' + esc(m.tab) + '" tabindex="-1"></div>';
  }
  function waitingHTML(label) {
    return '<div class="bld-card bld-wait"><p>Cargando ' + esc(label) + '…</p></div>';
  }

  // ---------------------------------------------------------------- CSS (con los tokens de los 19 themes)
  var P = '#' + PANEL;
  var CSS = [
    P + '{--gn-mod:' + COLOR + '}',
    P + ' .bld-hero{border:1px solid var(--bd-1);border-radius:16px;background:linear-gradient(180deg,color-mix(in srgb,var(--gn-mod) 12%,transparent),var(--bg-1) 70%);padding:16px 18px}',
    P + ' .bld-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
    P + ' .bld-ico{width:56px;height:56px;border-radius:12px;background:var(--bg-2);padding:6px;box-shadow:0 0 0 2px color-mix(in srgb,var(--gn-mod) 70%,transparent);flex-shrink:0;box-sizing:border-box}',
    P + ' .bld-ttl h2{margin:0;font-size:1.3rem;font-weight:800;color:var(--tx-1)}',
    P + ' .bld-sub{margin:2px 0 0;color:var(--tx-2);font-size:.86rem}',
    P + ' .bld-pills{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    P + ' .bld-pill{font-size:.78rem;border:1px solid var(--bd-1);border-radius:999px;padding:4px 10px;color:var(--tx-2);background:var(--bg-0);white-space:nowrap}.bld-pill b{color:var(--tx-1)}',
    P + ' .bld-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}',
    P + ' .bld-st{border:1px solid var(--bd-1);border-radius:12px;background:var(--bg-0);padding:10px 12px;min-width:0}',
    P + ' .bld-st small{display:block;font-size:.7rem;color:var(--tx-2);text-transform:uppercase;letter-spacing:.06em}',
    P + ' .bld-st b{font-size:1.25rem;color:var(--tx-1)}' + P + ' .bld-st b span{font-size:.8rem;color:var(--tx-2);font-weight:500}',
    P + ' .bld-st em{display:block;font-style:normal;font-size:.74rem;color:var(--tx-2);margin-top:2px}',
    P + ' .bld-tabs{display:flex;gap:4px;margin:16px 0 12px;border-bottom:1px solid var(--bd-1);overflow-x:auto}',
    P + ' .bld-tabs [role=tab]{display:inline-flex;align-items:center;background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;color:var(--tx-2);padding:8px 14px;font:inherit;font-size:.92rem;cursor:pointer;white-space:nowrap;min-height:40px}',
    P + ' .bld-tabs [role=tab][aria-selected=true]{color:var(--tx-1);font-weight:700;border-bottom-color:var(--gn-mod)}',
    P + ' .bld-badge{font-size:.72rem;color:var(--tx-2);margin-left:6px;font-weight:600;border:1px solid var(--bd-1);border-radius:999px;padding:0 6px}',
    P + ' .bld-btn.is-primary{background:color-mix(in srgb,var(--gn-mod) 38%,var(--bg-2));border-color:var(--gn-mod);color:var(--tx-1);font-weight:600}',
    P + ' .bld-menu{position:relative;margin-left:auto}' + P + ' .bld-menu>summary{list-style:none;cursor:pointer}' + P + ' .bld-menu>summary::-webkit-details-marker{display:none}',
    P + ' .bld-menu-l{position:absolute;right:0;top:calc(100% + 4px);z-index:5;display:grid;gap:4px;min-width:220px;padding:6px;background:var(--bg-1);border:1px solid var(--bd-1);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.35)}',
    P + ' .bld-menu-l .bld-btn{text-align:left;justify-content:flex-start}',
    P + ' .bld-card{background:var(--bg-1);border:1px solid var(--bd-1);border-radius:12px;padding:12px 14px;box-shadow:var(--gn-elev,none)}',
    P + ' .bld-muted{color:var(--tx-2)}',
    P + ' .bld-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bd-2,var(--bd-1));border-radius:999px;background:var(--bg-2);color:var(--tx-1);padding:5px 12px;font:inherit;font-size:.85rem;cursor:pointer;text-decoration:none}',
    P + ' .bld-btn:hover{border-color:var(--gn-mod)}',
    P + ' .bld-btn[disabled]{opacity:.5;cursor:not-allowed}',
    P + ' .bld-err{color:var(--color-red,#F47C7C)}',
    P + ' .bld-ok{color:var(--color-green,#3fb950)}',
    P + ' :is(a,button,input,select,textarea,[tabindex]):focus-visible{outline:2px solid var(--acc-1);outline-offset:2px}',
    '@media (prefers-reduced-motion:reduce){' + P + ' *{transition:none!important;animation:none!important}}',
    '@media (max-width:900px){' + P + ' .bld-hero{padding:12px}' + P + ' .bld-ico{width:40px;height:40px;padding:4px}' + P + ' .bld-ttl h2{font-size:1.05rem}' +
      P + ' .bld-pills{margin-left:0;width:100%}' + P + ' .bld-stats{grid-template-columns:1fr 1fr;gap:6px}' + P + ' .bld-st{padding:8px 10px}' + P + ' .bld-st b{font-size:1.05rem}}',
    '@media (max-width:720px){' + P + ' :is(button,.bld-btn,select,input,textarea){min-height:44px}}'
  ].join('\n');

  // ---------------------------------------------------------------- DOM
  function byId(id) { return doc && doc.getElementById ? doc.getElementById(id) : null; }
  function hash() { return String((root.location && root.location.hash) || '').split('?')[0]; }

  function ensureCss() {
    if (!doc || !doc.head) return;
    var s = byId('bld-view-css');
    if (!s) { s = doc.createElement('style'); s.id = 'bld-view-css'; doc.head.appendChild(s); }
    if (s.textContent !== CSS) s.textContent = CSS;
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

  // BUI-4: el menú ⋯ de cualquier pestaña se cierra tocando afuera o con Escape (y el foco vuelve a su botón).
  function closeMenus(p, except) {
    if (!p || !p.querySelectorAll) return 0;
    var n = 0;
    Array.prototype.forEach.call(p.querySelectorAll('.bld-menu[open]'), function (m) { if (m !== except) { m.open = false; n++; } });
    return n;
  }
  function wire(p) {
    p.addEventListener('click', function (e) {
      var t = e.target, m = t && t.closest ? t.closest('.bld-menu') : null;
      closeMenus(p, m);
      var b = t && t.closest ? t.closest('[data-bld-tab]') : null;
      if (b) { e.preventDefault(); go(b.getAttribute('data-bld-tab')); }
    });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var m = e.target && e.target.closest ? e.target.closest('.bld-menu[open]') : null;
        if (m) { m.open = false; var s = m.querySelector('summary'); if (s && s.focus) s.focus(); }
        else closeMenus(p, null);
      }
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

  function setSub(text) { var s = byId('bldSub'); if (s) s.textContent = text; refreshHead(); }

  // BUI-4: datos de la cabecera. La Biblioteca trae el catálogo; si todavía no lo trajo, se lo pido (sin dibujarla).
  function info() {
    var L = root.GNBldLib, S = root.GNBldStore, mine = null;
    try { if (S && typeof S.list === 'function') mine = S.list().length; } catch (_) {}
    var ls = L && L._state;
    if (L && ls && !ls.cat && typeof L.preload === 'function' && !st.preloading) {
      st.preloading = true;
      L.preload().then(function () { st.preloading = false; refreshHead(); }, function () { st.preloading = false; });
    }
    return { cat: ls && ls.cat, watch: ls && ls.watch, mine: mine, lib: L && L._pure };
  }
  function refreshHead() {
    var s = statsModel(info()), a = byId('bldStats'), b = byId('bldPills');
    if (a) a.innerHTML = statsHTML(s);
    if (b) b.innerHTML = pillsHTML(s);
    TABS.forEach(function (t) { var x = byId('bldBadge-' + t.id); if (x) x.innerHTML = badge(t.id, s); });
    return s;
  }

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
      p.innerHTML = viewHTML({ tab: st.tab, kit: root.GNKit, sub: keep, stats: statsModel(info()) });
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
    if (doc && doc.addEventListener) doc.addEventListener('gn:builds-changed', function () { refreshHead(); });
    onRoute();
  }

  root.GNBld = {
    version: VERSION, register: register, go: go, render: render, toast: toast,
    _pure: { parseHash: parseHash, hashFor: hashFor, shareUrl: shareUrl, viewHTML: viewHTML, tabsHTML: tabsHTML, esc: esc, TABS: TABS, CSS: CSS, ROUTE: ROUTE, PANEL: PANEL,
      statsModel: statsModel, statsHTML: statsHTML, closeMenus: closeMenus }
  };

  if (doc && doc.readyState === 'loading' && doc.addEventListener) doc.addEventListener('DOMContentLoaded', init);
  else if (doc) init();
  if (root.console && root.console.info) root.console.info(LOG, 'ready v' + VERSION);
})(typeof window !== 'undefined' ? window : this);
