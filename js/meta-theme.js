/*!
 * js/meta-theme.js — Cabecera de Metas y Eventos y mi voz (BL-057, MET-2)
 * v2.0.0 (2026-10-23)
 *
 * v2.0.0: la cabecera aprobada en MET-0, con el lenguaje de la Cartera (BL-056).
 *   - Arriba: ícono, «Metas y Eventos», estado de la carga y «↻ Actualizar».
 *   - Fila de datos: hora del servidor (UTC), tu hora, reset diario (00:00 UTC), reset semanal
 *     (lunes 07:30 UTC) y «Hoy en tu cuenta: N de 19» con su barra (solo lo que la API sigue).
 *   - Mi voz, un solo mensaje y solo cuando sirve, por prioridad: reset cerca con pendientes >
 *     una fijada empieza o está en curso > la Key no tiene permiso > día completo.
 *   - Lee todo de Meta.snapshot() (meta.js 4.x) cuando meta.js termina de dibujar (gn:meta-rendered);
 *     no pide nada a la API ni guarda nada. Los relojes corren cada 1 s solo con el panel a la vista.
 *   - Se va lo de la 1.x: barra de relojes con estilos en línea, migraciones de tarjetas viejas
 *     (.meta-card, .m-card: meta.js 4.x ya no las dibuja) y emojis en los estados.
 * No toca index.html ni meta.js (LES-028).
 */
(function (root) {
  'use strict';

  var VERSION = '2.0.0';
  var ICON = 'assets/icons/';
  var SOON_RESET_MIN = 60;
  var doc = root.document;

  // ---------------------------------------------------------------- reglas puras
  function pad2(n) { return String(n).padStart(2, '0'); }
  function clock(d, utc) {
    return utc ? pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds())
      : pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }
  function hhmm(d) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  // «2 d 03 h», «5 h 07 min», «12 min 05 s», «40 s».
  function countdown(ms) {
    if (!isFinite(ms) || ms <= 0) return 'ahora';
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    if (d) return d + ' d ' + pad2(h) + ' h';
    if (h) return h + ' h ' + pad2(m) + ' min';
    if (m) return m + ' min ' + pad2(s % 60) + ' s';
    return (s % 60) + ' s';
  }
  function minsText(m) {
    if (m == null) return '';
    var h = Math.floor(m / 60), r = m % 60;
    return h ? h + ' h' + (r ? ' ' + pad2(r) + ' min' : '') : m + ' min';
  }
  function nextDailyReset(now) {
    var t = new Date(+now);
    return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1));
  }
  // Lunes 07:30 UTC.
  function nextWeeklyReset(now) {
    var t = new Date(+now);
    var base = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), 7, 30);
    var next = base + ((1 - t.getUTCDay() + 7) % 7) * 86400000;
    if (next <= +t) next += 7 * 86400000;
    return new Date(next);
  }
  // Lo hecho hoy, solo con lo que la API sigue. state: ok | loading | noperm | error | none.
  function todayStats(snap) {
    var rows = (snap && snap.rows) || [], st = snap && snap.flags ? snap.flags.state : 'none';
    var tracked = rows.filter(function (r) { return r.tracked; });
    var done = tracked.filter(function (r) { return r.done === true; }).length;
    return { state: st, done: done, total: tracked.length, pending: st === 'ok' ? tracked.length - done : null,
      at: snap && snap.flags ? snap.flags.lastHuman : '—' };
  }
  // Un solo mensaje mío, por prioridad; null si no hay nada útil para decir.
  function pickVoice(snap, now) {
    if (!snap || !snap.rows) return null;
    var st = todayStats(snap), t = +now;
    var toReset = Math.ceil((+nextDailyReset(now) - t) / 60000);
    if (st.state === 'ok' && st.pending > 0 && toReset <= SOON_RESET_MIN) {
      return { key: 'reset:' + st.pending, kind: 'advierte',
        text: 'Faltan ' + minsText(toReset) + ' para el reset diario y te ' + (st.pending === 1 ? 'queda 1 meta' : 'quedan ' + st.pending + ' metas') +
          ' que la API sigue. Lo que hagas después cuenta para mañana.' };
    }
    var pins = snap.rows.filter(function (r) { return r.pinned && (r.state === 'active' || r.state === 'soon') && r.done !== true; })
      .sort(function (a, b) { return (a.state === 'active' ? 0 : 1) - (b.state === 'active' ? 0 : 1) || a.mins - b.mins; });
    if (pins.length) {
      var p = pins[0];
      return { key: 'pin:' + p.id + ':' + p.state, kind: 'recomienda',
        text: p.state === 'active'
          ? 'Tu fijada «' + p.name + '» está en curso: termina en ' + minsText(p.mins) + '.' + (p.chat ? ' Waypoint ' + p.chat + '.' : '')
          : 'Tu fijada «' + p.name + '» empieza a las ' + hhmm(new Date(p.start)) + ', en ' + minsText(p.mins) + '.' + (p.chat ? ' Waypoint ' + p.chat + '.' : '') };
    }
    if (st.state === 'noperm') {
      return { key: 'noperm', kind: 'explica',
        text: 'Tu API Key no tiene el permiso «progression», así que no puedo saber qué hiciste hoy. Los horarios funcionan igual; si querés ver tu avance, creá una Key con ese permiso.' };
    }
    if (st.state === 'ok' && st.total && st.pending === 0) {
      return { key: 'done', kind: 'saluda', text: 'Hiciste hoy las ' + st.total + ' metas que la API puede seguir. Día completo: el próximo reset es a las ' + hhmm(nextDailyReset(now)) + '.' };
    }
    return null;
  }

  // ---------------------------------------------------------------- dibujo
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function tileHTML(id, icon, label, tip) {
    return '<div class="mh-tile" title="' + esc(tip) + '"><img src="' + ICON + icon + '" width="28" height="28" alt="">' +
      '<div><div class="mh-lbl">' + esc(label) + '</div><div class="mh-val" id="' + id + '">—</div></div></div>';
  }
  function headHTML() {
    return '<div class="mh-hero"><div class="mh-hico"><img src="' + ICON + '102420.png" width="30" height="30" alt=""></div>' +
      '<div class="mh-htx"><div class="mh-h2slot"></div><div class="mh-sub"></div></div>' +
      '<div class="mh-hr"><button type="button" class="mh-btn" data-mh-refresh="1" title="Volver a leer qué hiciste hoy">↻ Actualizar</button></div></div>' +
      '<div class="mh-tiles">' +
        tileHTML('mhUtc', '460028.png', 'Hora del servidor', 'Hora del servidor (UTC)') +
        tileHTML('mhLocal', '841720.png', 'Tu hora', 'Tu hora local') +
        tileHTML('mhDaily', '534745.png', 'Reset diario', 'Todos los días a las 00:00 UTC') +
        tileHTML('mhWeekly', '155064.png', 'Reset semanal', 'Los lunes a las 07:30 UTC') +
        '<div class="mh-tile mh-today" title="Solo las metas que la API de GW2 informa (jefes del mundo y cofres de mapa)">' +
          '<div class="mh-lbl">Hoy en tu cuenta</div><div class="mh-val" id="mhToday">—</div>' +
          '<div class="mh-bar" aria-hidden="true"><i id="mhTodayBar"></i></div><div class="mh-note" id="mhTodayNote"></div></div>' +
      '</div>';
  }
  function todayView(st) {
    if (st.state === 'ok') return { val: st.done + ' de ' + st.total, pct: st.total ? Math.round(100 * st.done / st.total) : 0,
      note: (st.pending ? st.pending + (st.pending === 1 ? ' pendiente' : ' pendientes') : 'todo hecho') + ' · leído ' + st.at };
    if (st.state === 'loading') return { val: '…', pct: 0, note: 'Leyendo lo que hiciste hoy' };
    if (st.state === 'noperm') return { val: '—', pct: 0, note: 'Tu Key no tiene «progression»' };
    if (st.state === 'error') return { val: '—', pct: 0, note: 'No se pudo leer: probá ↻ Actualizar' };
    return { val: '—', pct: 0, note: 'Elegí una cuenta para verlo' };
  }

  var S = { panel: null, head: null, timer: null, voiceKey: null };
  function $(s, r) { return (r || doc).querySelector(s); }
  function setText(id, v) { var n = doc.getElementById(id); if (n && n.textContent !== v) n.textContent = v; }

  function ensureHead() {
    var panel = $('#metaPanel');
    if (!panel) return null;
    if (panel.classList.contains('mh-ready')) return panel;
    var h2 = $('#metaTitle', panel), status = $('#metaStatus', panel);
    panel.classList.add('mh-ready');
    var head = doc.createElement('div');
    head.className = 'mh-head';
    head.innerHTML = headHTML();
    panel.insertBefore(head, panel.firstChild);
    if (h2) { h2.textContent = 'Metas y Eventos'; $('.mh-h2slot', head).appendChild(h2); }
    if (status) { status.classList.add('mh-status'); $('.mh-sub', head).appendChild(status); }
    head.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('[data-mh-refresh]') && root.Meta && typeof root.Meta.refresh === 'function') root.Meta.refresh({ nocache: true });
    });
    S.panel = panel; S.head = head;
    return panel;
  }

  function tickClocks() {
    var now = new Date();
    setText('mhUtc', clock(now, true));
    setText('mhLocal', clock(now, false));
    setText('mhDaily', countdown(+nextDailyReset(now) - +now));
    setText('mhWeekly', countdown(+nextWeeklyReset(now) - +now));
  }
  function renderToday(snap) {
    var v = todayView(todayStats(snap));
    setText('mhToday', v.val);
    setText('mhTodayNote', v.note);
    var bar = doc.getElementById('mhTodayBar'); if (bar) bar.style.width = v.pct + '%';
  }
  function renderVoice(snap) {
    var host = doc.getElementById('mtVoice'); if (!host) return;
    var msg = pickVoice(snap, new Date());
    var key = msg ? msg.key + '|' + msg.text : null;
    if (key === S.voiceKey && (host.firstChild || !msg)) return;
    S.voiceKey = key;
    while (host.firstChild) host.removeChild(host.firstChild);
    if (msg && root.Shiruvana && typeof root.Shiruvana.voice === 'function') host.appendChild(root.Shiruvana.voice({ kind: msg.kind, text: msg.text }));
  }
  function onRendered() {
    if (!ensureHead()) return;
    var snap = root.Meta && typeof root.Meta.snapshot === 'function' ? root.Meta.snapshot() : null;
    renderToday(snap);
    renderVoice(snap);
    tickClocks();
    startClock();
  }
  function visible() { var p = S.panel || $('#metaPanel'); return !!(p && !p.hasAttribute('hidden') && !doc.hidden); }
  function startClock() {
    if (S.timer) return;
    S.timer = setInterval(function () { if (visible()) tickClocks(); }, 1000);
  }

  // ---------------------------------------------------------------- estilos (lenguaje de la Cartera)
  var CSS = [
    '#metaPanel.mh-ready{padding:0}',
    '#metaPanel.mh-ready>.panel__body{padding:18px 20px 22px}',
    '#metaPanel.mh-ready .panel__body>.panel-head,#metaPanel.mh-ready #mtFlags{display:none}',
    '.mh-head{border-bottom:1px solid var(--bd-1);border-radius:var(--radius-lg,12px) var(--radius-lg,12px) 0 0;overflow:hidden}',
    '.mh-hero{display:flex;align-items:center;gap:14px;padding:18px 20px 12px;background:linear-gradient(180deg,var(--glow-base,rgba(168,150,255,.10)),transparent)}',
    '.mh-hico{width:48px;height:48px;border-radius:12px;background:var(--bg-0);display:grid;place-items:center;box-shadow:0 0 0 1px var(--bd-2),0 0 18px rgba(242,185,75,.18);flex-shrink:0}',
    '.mh-htx{min-width:0}.mh-hero h2,.mh-hero .panel__title{margin:0;font-size:1.3rem;padding:0;border:0;background:none;display:block}',
    '.mh-hero .panel__title img{display:none}',
    '.mh-sub{color:var(--tx-3);font-size:.82rem}.mh-sub .mh-status{margin:0;font-size:.82rem}',
    '.mh-hr{margin-left:auto;display:flex;gap:8px;align-items:center}',
    '.mh-btn{display:inline-flex;align-items:center;gap:8px;background:var(--bg-0);border:1px solid var(--bd-1);color:var(--tx-1);border-radius:10px;padding:7px 11px;font:inherit;cursor:pointer}',
    '.mh-btn:hover{border-color:var(--acc-1)}',
    '.mh-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) minmax(0,1.4fr);gap:10px;padding:4px 20px 16px}',
    '.mh-tile{position:relative;background:var(--bg-0);border:1px solid var(--bd-1);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center;min-width:0}',
    '.mh-tile img{flex-shrink:0;border-radius:6px}',
    '.mh-lbl{font-size:.72rem;color:var(--tx-3);text-transform:uppercase;letter-spacing:.05em}',
    '.mh-val{font-size:1.1rem;font-weight:700;color:var(--tx-1);font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.mh-today{display:grid;gap:4px;align-items:start}.mh-today .mh-val{font-size:1.2rem;color:var(--gn-gold)}',
    '.mh-bar{height:6px;border-radius:999px;background:var(--bg-2);overflow:hidden}.mh-bar i{display:block;height:100%;width:0;background:var(--color-green);border-radius:inherit;transition:width .3s}',
    '.mh-note{font-size:.75rem;color:var(--tx-3)}',
    '.mh-btn:focus-visible{outline:2px solid var(--acc-1);outline-offset:2px}',
    '#metaPanel.mh-ready .mt-voice .shv-voice{margin:0 0 6px}',
    '@media (max-width:980px){.mh-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.mh-today{grid-column:1/-1}}',
    '@media (max-width:720px){.mh-hero{flex-wrap:wrap;padding:14px 12px 10px}.mh-hr{margin-left:0}.mh-tiles{padding:4px 12px 12px}#metaPanel.mh-ready>.panel__body{padding:14px 12px}.mh-btn{min-height:40px}}',
    '@media (prefers-reduced-motion:reduce){.mh-bar i{transition:none}}'
  ].join('\n');
  function injectCSS() {
    if (doc.getElementById('mh-style')) return;
    var s = doc.createElement('style'); s.id = 'mh-style'; s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }

  function init() {
    injectCSS();
    doc.addEventListener('gn:meta-rendered', onRendered);
    doc.addEventListener('gn:tabchange', function (ev) {
      if (ev && ev.detail && ev.detail.view === 'meta' && ensureHead()) { tickClocks(); startClock(); }
    });
    if (visible() && ensureHead()) { tickClocks(); startClock(); }
  }

  root.MetaTheme = {
    version: VERSION,
    refresh: onRendered,
    _pure: { clock: clock, countdown: countdown, minsText: minsText, nextDailyReset: nextDailyReset, nextWeeklyReset: nextWeeklyReset,
      todayStats: todayStats, todayView: todayView, pickVoice: pickVoice, headHTML: headHTML }
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : this);
