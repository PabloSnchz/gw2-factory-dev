/*!
 * js/wv-view.js — Cámara del Brujo: cabecera y navegación (BL-064, CAM-1)
 * Proyecto: Bóveda del Gato Negro
 * Versión: 1.0.0 (2026-10-23)
 *
 * Capa de vista sobre el controlador que ya existe (window.WV en router.js):
 *  - Cabecera nueva: temporada y días que quedan, reset diario y semanal con cuenta
 *    regresiva, AA disponible, avance de hoy y de la semana, AA gastada en la temporada
 *    y «¿Por qué tarda?» (antes era solo un tooltip).
 *  - Tres pestañas: Objetivos (Diarias, Semanales, Especiales), Tienda y Todas las
 *    cuentas (Objetivos semanales, Compras fijadas).
 * No cambia datos ni rutas: maneja los botones de siempre (ocultos), así
 * #/account/wizards-vault y …/objectives-dashboard siguen andando.
 * Se carga por js/modules.json (DEC-035): arranca aunque el documento ya esté listo.
 * Lee solo con las funciones con caché de wizards-vault.js; ningún endpoint nuevo.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var LOG = '[WVView]';
  var DAY = 86400000;
  var WEEK_BTN = { daily: 'wvTabBtnDaily', weekly: 'wvTabBtnWeekly', special: 'wvTabBtnSpecial', shop: 'wvTabBtnShop' };
  var KIND_LABEL = { daily: 'Diarias', weekly: 'Semanales', special: 'Especiales' };
  var WHY = 'La API de Guild Wars 2 actualiza los objetivos recién cuando entrás al juego con esa cuenta, y puede tardar unos minutos. Si completaste algo y no aparece, entrá al juego un momento y tocá «Actualizar».';

  // ------------------------------------------------------------------ puro
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // Próximo 00:00 UTC.
  function nextDailyReset(now) {
    var d = new Date(now);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0);
  }

  // Próximo lunes 07:30 UTC (si es lunes antes de las 07:30, es hoy).
  function nextWeeklyReset(now) {
    var d = new Date(now);
    var base = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 7, 30, 0);
    var t = base + ((1 - d.getUTCDay() + 7) % 7) * DAY;
    return t > now ? t : t + 7 * DAY;
  }

  // «4 d 8 h», «3 h 12 min», «12 min», «menos de 1 min».
  function fmtLeft(ms) {
    ms = Math.max(0, Number(ms) || 0);
    var m = Math.floor(ms / 60000);
    if (m < 1) return 'menos de 1 min';
    var d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d > 0) return d + ' d ' + h + ' h';
    if (h > 0) return h + ' h ' + mm + ' min';
    return mm + ' min';
  }

  function fmtInt(n) {
    n = Math.round(Number(n) || 0);
    var s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '−' : '') + s;
  }

  // «Temporada «X» · termina el 14/12 (en 52 d)».
  function seasonLine(season, now) {
    var title = season && season.title && season.title !== '—' ? String(season.title) : '';
    var end = season && season.end ? Date.parse(season.end) : NaN;
    var parts = [];
    parts.push(title ? 'Temporada «' + title + '»' : 'Temporada actual');
    if (isFinite(end)) {
      var d = new Date(end);
      var left = end - now;
      var when = 'el ' + pad2(d.getUTCDate()) + '/' + pad2(d.getUTCMonth() + 1);
      if (left <= 0) parts.push('terminó ' + when);
      else parts.push('termina ' + when + ' (en ' + (left >= DAY ? Math.floor(left / DAY) + ' d' : fmtLeft(left)) + ')');
    }
    return parts.join(' · ');
  }

  // Objetivos crudos de la API → { total, done, ready, claimed, meta }.
  // done = llegó al 100 % (reclamado o no); ready = al 100 % y sin reclamar.
  function countObjectives(raw) {
    var list = (raw && Array.isArray(raw.objectives)) ? raw.objectives : [];
    var out = { total: list.length, done: 0, ready: 0, claimed: 0, meta: null };
    list.forEach(function (o) {
      var cur = Number(o.progress_current != null ? o.progress_current : o.progress) || 0;
      var tot = Number(o.progress_complete != null ? o.progress_complete : o.total) || 0;
      var full = tot > 0 ? cur >= tot : cur > 0;
      if (o.claimed) { out.claimed++; out.done++; }
      else if (full) { out.ready++; out.done++; }
    });
    if (raw && typeof raw.meta_progress_current === 'number' && typeof raw.meta_progress_complete === 'number') {
      out.meta = { cur: raw.meta_progress_current, total: raw.meta_progress_complete, reward: Number(raw.meta_reward_astral) || 0 };
    }
    return out;
  }

  // AA gastada en la temporada según los listados de la cuenta.
  function spentAA(rows) {
    var s = 0;
    (rows || []).forEach(function (r) {
      var c = Number(r.cost) || 0, p = Number(r.purchased) || 0;
      if (c > 0 && p > 0) s += c * p;
    });
    return s;
  }

  // AA que falta gastar en lo fijado (lo que la API no vio y no está marcado).
  function reservedAA(rows, pinned, marks) {
    var s = 0;
    pinned = pinned || {}; marks = marks || {};
    (rows || []).forEach(function (r) {
      if (!pinned[r.id] || r.purchase_limit == null) return;
      var left = Number(r.purchase_limit) - (Number(r.purchased) || 0) - (Number(marks[r.id]) || 0);
      if (left > 0) s += left * (Number(r.cost) || 0);
    });
    return s;
  }

  // Qué vista está activa, leída del DOM que maneja el controlador.
  function activeView(dom) {
    if (dom.pdOpen) return { tab: 'accounts', sub: 'purchases' };
    if (dom.dashOpen) return { tab: 'accounts', sub: 'weekly' };
    if (dom.lastTab === 'shop') return { tab: 'shop', sub: null };
    return { tab: 'objectives', sub: KIND_LABEL[dom.lastTab] ? dom.lastTab : 'daily' };
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function bar(pct) {
    pct = Math.max(0, Math.min(100, Math.round(pct)));
    return '<div class="wvx-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>';
  }

  // Cabecera completa (HTML). m = modelo armado por buildModel().
  function headHTML(m) {
    var h = [];
    h.push('<div class="wvx-hero">');
    h.push('<div class="wvx-row"><img src="assets/icons/3172791.png" alt="" width="56" height="56">');
    h.push('<div class="wvx-title"><h2 id="wvxTitle">Cámara del Brujo</h2><p>' + esc(m.season) + '</p></div>');
    h.push('<div class="wvx-pills">');
    h.push('<span class="wvx-pill' + (m.dailyHot ? ' wvx-pill--hot' : '') + '">Reset diario <b data-wvx-clock="daily">en ' + esc(m.dailyLeft) + '</b></span>');
    h.push('<span class="wvx-pill">Semanal <b data-wvx-clock="weekly">lun 07:30 UTC · en ' + esc(m.weeklyLeft) + '</b></span>');
    h.push('<button type="button" class="wvx-btn" data-wvx="refresh">↻ Actualizar</button>');
    h.push('</div></div>');
    h.push('<div class="wvx-stats">');
    h.push('<div class="wvx-st"><small>AA disponible</small><b>' + (m.aa == null ? '—' : fmtInt(m.aa)) + '</b><em>' + esc(m.aaNote) + '</em></div>');
    h.push(statCount('Hoy', m.daily));
    h.push(statCount('Esta semana', m.weekly));
    h.push('<div class="wvx-st"><small>Gastada en la temporada</small><b>' + (m.spent == null ? '—' : fmtInt(m.spent)) + '</b><em>según lo que la API ya vio</em></div>');
    h.push('</div>');
    h.push('<div class="wvx-why"><button type="button" class="wvx-link" data-wvx="why" aria-expanded="' + (m.whyOpen ? 'true' : 'false') + '" aria-controls="wvxWhy">ⓘ ¿Por qué tarda en actualizarse?</button>');
    h.push('<p id="wvxWhy"' + (m.whyOpen ? '' : ' hidden') + '>' + esc(WHY) + '</p></div>');
    h.push('</div>');
    h.push(navHTML(m));
    return h.join('');
  }

  function statCount(label, c) {
    if (!c || !c.total) return '<div class="wvx-st"><small>' + label + '</small><b>—</b><em>sin datos todavía</em></div>';
    return '<div class="wvx-st"><small>' + label + '</small><b>' + c.done + ' <span>de ' + c.total + '</span></b>' + bar(c.done * 100 / c.total) + '</div>';
  }

  function navHTML(m) {
    var v = m.view, h = [];
    var tabs = [
      ['objectives', 'Objetivos', m.ready ? '<span class="wvx-badge wvx-badge--gold">' + m.ready + (m.ready === 1 ? ' listo' : ' listos') + '</span>' : ''],
      ['shop', 'Tienda', m.pinned ? '<span class="wvx-badge">' + m.pinned + (m.pinned === 1 ? ' fijado' : ' fijados') + '</span>' : ''],
      ['accounts', 'Todas las cuentas', m.accounts ? '<span class="wvx-badge">' + m.accounts + '</span>' : '']
    ];
    h.push('<div class="wvx-tabs" role="tablist" aria-label="Secciones de la Cámara del Brujo">');
    tabs.forEach(function (t) {
      var on = v.tab === t[0];
      h.push('<button type="button" role="tab" id="wvxTab-' + t[0] + '" data-wvx-tab="' + t[0] + '" aria-selected="' + on + '" tabindex="' + (on ? '0' : '-1') + '">' + t[1] + t[2] + '</button>');
    });
    h.push('</div>');
    var segs = null;
    if (v.tab === 'objectives') {
      segs = ['daily', 'weekly', 'special'].map(function (k) {
        var c = m.counts[k];
        return [k, KIND_LABEL[k], c && c.total ? c.done + '/' + c.total : ''];
      });
    } else if (v.tab === 'accounts') {
      segs = [['weekly', 'Objetivos semanales', ''], ['purchases', 'Compras fijadas', '']];
    }
    if (segs) {
      h.push('<div class="wvx-seg" role="group" aria-label="' + (v.tab === 'objectives' ? 'Tipo de objetivo' : 'Vista de todas las cuentas') + '">');
      segs.forEach(function (s) {
        var on = v.sub === s[0];
        h.push('<button type="button" data-wvx-sub="' + s[0] + '" aria-pressed="' + on + '">' + s[1] + (s[2] ? '<em>' + s[2] + '</em>' : '') + '</button>');
      });
      h.push('</div>');
    }
    return h.join('');
  }

  var CSS = [
    '#wvPanel>.panel-head,#wvPanel>.wv-season,#wvPanel>nav.tabs{display:none!important}',
    '#wvxHead{margin:0 0 12px}',
    '.wvx-hero{border:1px solid var(--bd-1);border-radius:16px;background:linear-gradient(180deg,rgba(79,195,217,.10),var(--bg-1) 70%);padding:16px 18px}',
    '.wvx-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
    '.wvx-row>img{width:56px;height:56px;border-radius:12px;background:var(--bg-2);padding:6px;flex-shrink:0}',
    '.wvx-title h2{margin:0;font-size:1.3rem;color:var(--tx-1)}.wvx-title p{margin:2px 0 0;color:var(--tx-2);font-size:.86rem}',
    '.wvx-pills{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '.wvx-pill{font-size:.78rem;border:1px solid var(--bd-1);border-radius:999px;padding:4px 10px;color:var(--tx-2);background:var(--bg-0);white-space:nowrap}',
    '.wvx-pill b{color:var(--tx-1);font-weight:600}.wvx-pill--hot{border-color:var(--color-amber,#F2B94B)}',
    '.wvx-btn{font:inherit;font-size:.78rem;border:1px solid var(--bd-2);border-radius:999px;padding:5px 12px;color:var(--tx-1);background:transparent;cursor:pointer;min-height:32px}',
    '.wvx-btn:hover{border-color:var(--acc-1)}',
    '.wvx-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}',
    '.wvx-st{border:1px solid var(--bd-1);border-radius:12px;background:var(--bg-0);padding:10px 12px;min-width:0}',
    '.wvx-st small{display:block;font-size:.7rem;color:var(--tx-2);text-transform:uppercase;letter-spacing:.06em}',
    '.wvx-st b{font-size:1.25rem;color:var(--tx-1)}.wvx-st b span{font-size:.8rem;color:var(--tx-2);font-weight:500}',
    '.wvx-st em{display:block;font-style:normal;font-size:.74rem;color:var(--tx-2);margin-top:2px}',
    '.wvx-bar{height:6px;border-radius:6px;background:var(--bg-2);overflow:hidden;margin-top:7px}.wvx-bar i{display:block;height:100%;background:var(--color-green,#3CC48A);border-radius:6px}',
    '.wvx-why{margin-top:10px}.wvx-why p{margin:6px 0 0;font-size:.84rem;color:var(--tx-2);max-width:70ch}',
    '.wvx-link{font:inherit;font-size:.8rem;background:none;border:0;padding:4px 0;color:var(--acc-1);cursor:pointer;text-decoration:underline;text-underline-offset:2px}',
    '.wvx-tabs{display:flex;gap:4px;margin:16px 0 10px;border-bottom:1px solid var(--bd-1);overflow-x:auto}',
    '.wvx-tabs [role=tab]{font:inherit;font-size:.92rem;background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;padding:8px 14px;color:var(--tx-2);cursor:pointer;white-space:nowrap;min-height:40px}',
    '.wvx-tabs [role=tab][aria-selected=true]{color:var(--tx-1);font-weight:700;border-bottom-color:#4FC3D9}',
    '.wvx-badge{font-size:.72rem;color:var(--tx-2);margin-left:6px;font-weight:600;border:1px solid var(--bd-1);border-radius:999px;padding:0 6px}',
    '.wvx-badge--gold{color:var(--color-amber,#F2B94B);border-color:var(--color-amber,#F2B94B)}',
    '.wvx-seg{display:inline-flex;border:1px solid var(--bd-2);border-radius:10px;overflow:hidden;margin:0 0 12px;max-width:100%}',
    '.wvx-seg button{font:inherit;font-size:.84rem;background:none;border:0;border-right:1px solid var(--bd-1);padding:7px 12px;color:var(--tx-2);cursor:pointer;white-space:nowrap;min-height:36px}',
    '.wvx-seg button:last-child{border-right:0}.wvx-seg button[aria-pressed=true]{background:var(--bg-2);color:var(--tx-1);font-weight:600}',
    '.wvx-seg em{font-style:normal;color:var(--tx-2);font-size:.76rem;margin-left:5px}',
    '#wvxHead button:focus-visible{outline:2px solid var(--acc-1);outline-offset:2px}',
    '@media (max-width:900px){.wvx-hero{padding:12px}.wvx-row>img{width:40px;height:40px;padding:4px}.wvx-title h2{font-size:1.05rem}',
    '.wvx-pills{margin-left:0;width:100%}.wvx-stats{grid-template-columns:1fr 1fr;gap:6px}.wvx-st{padding:8px 10px}.wvx-st b{font-size:1.05rem}',
    '.wvx-tabs [role=tab]{padding:8px 10px;font-size:.86rem}.wvx-seg{display:flex}.wvx-seg button{flex:1;min-height:44px}}'
  ].join('\n');

  // ------------------------------------------------------------------ DOM
  var doc = root.document;
  var st = {
    data: { season: null, aa: null, rows: null, counts: {}, at: 0 },
    whyOpen: false, accountsSub: 'weekly', timer: null, loading: null, lastKey: ''
  };

  function byId(id) { return doc && doc.getElementById ? doc.getElementById(id) : null; }
  function isHidden(n) { return !n || n.hidden || (n.getAttribute && n.getAttribute('hidden') != null); }

  function readDom() {
    var last = 'daily';
    Object.keys(WEEK_BTN).forEach(function (k) {
      var b = byId(WEEK_BTN[k]);
      if (b && b.getAttribute && b.getAttribute('aria-selected') === 'true') last = k;
    });
    var pd = byId('wvPDPanel');
    return {
      pdOpen: !!pd && !isHidden(pd) && !(pd.style && pd.style.display === 'none'),
      dashOpen: !isHidden(byId('wvObjectivesDashboardPanel')),
      lastTab: last
    };
  }

  function token() {
    var s = byId('keySelectGlobal');
    return s && s.value ? String(s.value).trim() : '';
  }

  function accountCount() {
    try {
      var S = root.Storage;
      var list = S && S.get && S.STORAGE_KEYS ? S.get(S.STORAGE_KEYS.ACCOUNT_KEYS) : null;
      return Array.isArray(list) ? list.length : 0;
    } catch (_) { return 0; }
  }

  function shopState() {
    try { return root.WV && root.WV.__getShopState ? root.WV.__getShopState() : null; } catch (_) { return null; }
  }

  function buildModel(now) {
    var d = st.data, c = d.counts, shop = shopState();
    var view = activeView(readDom());
    if (view.tab === 'accounts') st.accountsSub = view.sub;
    var pinned = shop && shop.pinned ? Object.keys(shop.pinned).filter(function (k) { return shop.pinned[k]; }).length : 0;
    var rows = (shop && shop.merged && shop.merged.length) ? shop.merged : d.rows;
    var aa = (shop && typeof shop.aa === 'number' && shop.merged && shop.merged.length) ? shop.aa : d.aa;
    var reserved = shop && shop.pinned ? reservedAA(rows, shop.pinned, shop.marks) : null;
    var ready = ['daily', 'weekly', 'special'].reduce(function (s, k) { return s + (c[k] ? c[k].ready : 0); }, 0);
    var dl = nextDailyReset(now) - now;
    return {
      view: view, season: seasonLine(d.season, now),
      dailyLeft: fmtLeft(dl), dailyHot: dl <= 3 * 3600000, weeklyLeft: fmtLeft(nextWeeklyReset(now) - now),
      aa: aa, aaNote: reserved ? 'reservada para fijados: ' + fmtInt(reserved) : 'para gastar en la Tienda',
      daily: c.daily, weekly: c.weekly, spent: rows ? spentAA(rows) : null,
      counts: c, ready: ready, pinned: pinned, accounts: accountCount(), whyOpen: st.whyOpen
    };
  }

  function ensureHost() {
    var panel = byId('wvPanel');
    if (!panel) return null;
    if (!byId('wv-view-css') && doc.createElement && doc.head) {
      var s = doc.createElement('style');
      s.id = 'wv-view-css';
      s.textContent = CSS;
      doc.head.appendChild(s);
    }
    var host = byId('wvxHead');
    if (!host) {
      host = doc.createElement('div');
      host.id = 'wvxHead';
      panel.insertBefore(host, panel.firstChild);
      wire(host);
    }
    return host;
  }

  function render() {
    var host = ensureHost();
    if (!host) return;
    var m = buildModel(Date.now());
    st.lastKey = m.view.tab + ':' + m.view.sub;
    host.innerHTML = headHTML(m);
  }

  // Solo las cuentas regresivas, sin redibujar (no mueve el foco).
  function tick() {
    var panel = byId('wvPanel');
    if (isHidden(panel)) { stopClock(); return; }
    var now = Date.now(), host = byId('wvxHead');
    if (!host || !host.querySelectorAll) return;
    Array.prototype.forEach.call(host.querySelectorAll('[data-wvx-clock]'), function (b) {
      var k = b.getAttribute('data-wvx-clock');
      b.textContent = k === 'daily' ? 'en ' + fmtLeft(nextDailyReset(now) - now)
        : 'lun 07:30 UTC · en ' + fmtLeft(nextWeeklyReset(now) - now);
    });
  }
  function startClock() { if (!st.timer) st.timer = setInterval(tick, 30000); }
  function stopClock() { if (st.timer) { clearInterval(st.timer); st.timer = null; } }

  function load(nocache) {
    var api = root.GW2Api, tk = token();
    if (!api || !tk) { render(); return Promise.resolve(); }
    var o = { nocache: !!nocache };
    var safe = function (p) { return Promise.resolve(p).catch(function () { return null; }); };
    var call = function (fn, a, b) {
      if (typeof api[fn] !== 'function') return Promise.resolve(null);
      try { return safe(b ? api[fn](a, b) : api[fn](a)); } catch (_) { return Promise.resolve(null); }
    };
    st.loading = Promise.all([
      call('getWVSeason', o), call('getWVAccount', tk, o), call('getAccountWVListings', tk, o),
      call('getWVDaily', tk, o), call('getWVWeekly', tk, o), call('getWVSpecial', tk, o)
    ]).then(function (r) {
      st.data = {
        season: r[0], aa: r[1] && typeof r[1].astral_acclaim === 'number' ? r[1].astral_acclaim : null,
        rows: Array.isArray(r[2]) ? r[2] : null,
        counts: { daily: r[3] ? countObjectives(r[3]) : null, weekly: r[4] ? countObjectives(r[4]) : null, special: r[5] ? countObjectives(r[5]) : null },
        at: Date.now()
      };
      render();
    }).then(function () { st.loading = null; }, function () { st.loading = null; });
    return st.loading;
  }

  function click(id) { var b = byId(id); if (b && b.click) b.click(); }

  function closePD() {
    try { if (readDom().pdOpen && root.WVPurchaseDetail) root.WVPurchaseDetail.hide(); } catch (_) {}
  }

  function goObjectives(kind) {
    closePD();
    click(WEEK_BTN[KIND_LABEL[kind] ? kind : 'daily']);
  }

  function goShop() { closePD(); click(WEEK_BTN.shop); }

  function goAccounts(sub) {
    if (sub === 'purchases') {
      if (readDom().dashOpen) {
        try { if (root.WV && root.WV.hideObjectivesDashboard) root.WV.hideObjectivesDashboard(); } catch (_) {}
        if (root.location) root.location.hash = '#/account/wizards-vault';
      }
      try { if (root.WVPurchaseDetail) root.WVPurchaseDetail.show(); } catch (_) {}
    } else {
      closePD();
      if (root.location) root.location.hash = '#/account/wizards-vault/objectives-dashboard';
    }
  }

  function go(tab, sub) {
    var v = activeView(readDom());
    if (tab === 'objectives') goObjectives(sub || (v.tab === 'objectives' ? v.sub : 'daily'));
    else if (tab === 'shop') goShop();
    else goAccounts(sub || st.accountsSub || 'weekly');
    setTimeout(render, 0);
  }

  function refreshNow() {
    var v = activeView(readDom());
    try {
      if (v.tab === 'shop' && root.WVShopUI) root.WVShopUI.refresh(true);
      else if (v.sub === 'purchases' && root.WVPurchaseDetail) root.WVPurchaseDetail.refresh(true);
      else if (v.tab === 'accounts' && root.WVObjectivesDashboard) root.WVObjectivesDashboard.refresh(true);
      else if (root.WV && root.WV.refreshObjectives) root.WV.refreshObjectives(true);
    } catch (e) { if (root.console) root.console.warn(LOG, 'actualizar', e); }
    if (root.toast) root.toast('info', 'Actualizando la Cámara del Brujo…', { ttl: 1500 });
    return load(true);
  }

  function actOf(t) {
    for (var n = t, i = 0; n && i < 6; n = n.parentNode, i++) {
      if (!n.getAttribute) continue;
      var a = n.getAttribute('data-wvx'), tab = n.getAttribute('data-wvx-tab'), sub = n.getAttribute('data-wvx-sub');
      if (a || tab || sub) return { act: a, tab: tab, sub: sub, node: n };
    }
    return null;
  }

  function wire(host) {
    host.addEventListener('click', function (e) {
      var a = actOf(e.target);
      if (!a) return;
      if (a.act === 'refresh') { refreshNow(); return; }
      if (a.act === 'why') {
        st.whyOpen = !st.whyOpen;
        render();
        var b = host.querySelector && host.querySelector('[data-wvx="why"]');
        if (b && b.focus) b.focus();
        return;
      }
      if (a.tab) { go(a.tab); return; }
      if (a.sub) go(activeView(readDom()).tab, a.sub);
    });
    // Flechas, Inicio y Fin entre las tres pestañas (patrón tablist).
    host.addEventListener('keydown', function (e) {
      var a = actOf(e.target);
      if (!a || !a.tab) return;
      var order = ['objectives', 'shop', 'accounts'], i = order.indexOf(a.tab), j = -1;
      if (e.key === 'ArrowRight') j = (i + 1) % 3;
      else if (e.key === 'ArrowLeft') j = (i + 2) % 3;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = 2;
      if (j < 0) return;
      if (e.preventDefault) e.preventDefault();
      go(order[j]);
      setTimeout(function () { var b = byId('wvxTab-' + order[j]); if (b && b.focus) b.focus(); }, 0);
    });
  }

  // Redibuja si el controlador cambió de vista (botones viejos, rutas, Compras).
  function observe() {
    var panel = byId('wvPanel');
    if (!panel || panel.__wvxObs || typeof root.MutationObserver !== 'function') return;
    panel.__wvxObs = true;
    var pend = false;
    new root.MutationObserver(function () {
      if (pend) return;
      pend = true;
      setTimeout(function () {
        pend = false;
        var v = activeView(readDom());
        if (v.tab + ':' + v.sub !== st.lastKey) render();
      }, 0);
    }).observe(panel, { subtree: true, attributes: true, attributeFilter: ['hidden', 'aria-selected', 'style'] });
  }

  function onShow() {
    if (isHidden(byId('wvPanel'))) { stopClock(); return; }
    render();
    observe();
    startClock();
    if (!st.loading && Date.now() - st.data.at > 60000) load(false);
  }

  function init() {
    if (!byId('wvPanel')) return;
    ensureHost();
    render();
    observe();
    if (doc.addEventListener) {
      doc.addEventListener('gn:nav-active', function () { setTimeout(onShow, 50); });
      doc.addEventListener('gn:tokenchange', function () { st.data.at = 0; setTimeout(onShow, 400); });
    }
    if (root.addEventListener) {
      root.addEventListener('hashchange', function () { setTimeout(onShow, 50); });
      root.addEventListener('wv:season:reloaded', function () { load(false); });
    }
    onShow();
  }

  root.WVView = {
    version: VERSION, render: render, refresh: refreshNow, go: go,
    _pure: { nextDailyReset: nextDailyReset, nextWeeklyReset: nextWeeklyReset, fmtLeft: fmtLeft, fmtInt: fmtInt,
      seasonLine: seasonLine, countObjectives: countObjectives, spentAA: spentAA, reservedAA: reservedAA,
      activeView: activeView, headHTML: headHTML, CSS: CSS, WHY: WHY }
  };

  if (doc && doc.readyState === 'loading' && doc.addEventListener) doc.addEventListener('DOMContentLoaded', init);
  else if (doc) init();
  if (root.console && root.console.info) root.console.info(LOG, 'ready v' + VERSION);
})(typeof window !== 'undefined' ? window : this);
