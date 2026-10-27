/*!
 * js/shv-bubble.js — Shiruvana que aparece: mi globo (BL-075 SHE-1, DEC-038)
 * Versión: 1.0.0
 *
 * Mis observaciones (formato común de js/shv-core.js) pueden aparecer como un globo que sale de mi
 * avatar del rincón (DEC-034), con las reglas que aprobó Pablo:
 *  - una vez por cosa nueva: lo que ya viste no vuelve (gn:shv:seen guarda solo una huella del texto);
 *  - uno por pantalla, 2 segundos después de llamarme, nunca con un diálogo abierto ni mientras escribís;
 *  - no tapo nada, no oscurezco el fondo y no te saco el foco;
 *  - me voy sola a los 12 segundos (me quedo mientras me mirás o tenés el foco adentro); lo que no
 *    llegaste a leer queda como un punto en mi avatar y reopen() lo vuelve a mostrar;
 *  - Escape o ✕ me cierran; «Después» me guarda en el punto; el botón de la observación avisa al
 *    módulo dueño con el evento gn:shv-act;
 *  - silenciarme (gn:shv:quiet) me deja hablando solo dentro de los módulos;
 *  - el lector de pantalla me anuncia sin interrumpir; con «Movimiento reducido» aparezco sin animación.
 * SHE-1: inerte, nadie me llama todavía. SHE-2 conecta la Cartera y el rincón.
 */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';
  var SEEN_KEY = 'gn:shv:seen', QUIET_KEY = 'gn:shv:quiet';
  var DELAY = 2000, TTL = 12000, RETRY = 3000, MIN_LEFT = 3000, SEEN_MAX = 200, SEEN_DAYS = 60;
  var ID = 'shvBubble', LIVE_ID = 'shvBubbleLive', STYLE_ID = 'shv-bubble-css';
  var CSS = [
    '#' + ID + '{position:fixed;z-index:900;left:16px;bottom:16px;width:min(380px,calc(100vw - 32px));',
    'background:var(--bg-1,var(--panel));color:var(--text);border:1px solid var(--bd-2,var(--bd-1));border-radius:14px;',
    'box-shadow:var(--gn-elev,0 12px 30px rgba(0,0,0,.45));animation:shv-bub-in .18s ease-out}',
    '#' + ID + ' .shv-voice{margin:0;border-top:0;border-right:0;border-bottom:0;border-radius:14px;padding:12px 40px 12px 14px}',
    '.shv-bub__x{position:absolute;top:6px;right:6px;width:32px;height:32px;border:0;border-radius:8px;',
    'background:transparent;color:var(--tx-2,var(--text));font:inherit;font-size:1rem;cursor:pointer}',
    '.shv-bub__x:hover{color:var(--text)}',
    '#' + ID + ' :is(button,a):focus-visible{outline:2px solid var(--acc-1);outline-offset:2px}',
    '.shv-bub__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '[data-shv-unread]{position:relative}',
    '[data-shv-unread]::after{content:"";position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;',
    'background:var(--acc-warn,var(--acc-1));box-shadow:0 0 0 2px var(--bg-1,var(--panel))}',
    '@keyframes shv-bub-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '@media (max-width:900px){#' + ID + '{left:12px;right:12px;bottom:72px;width:auto}}',
    '@media (prefers-reduced-motion:reduce){#' + ID + '{animation:none}}'
  ].join('');

  var doc = root.document;
  var st = { queue: [], cur: null, timer: null, deadline: 0, left: TTL, unread: [], anchor: null, inited: false, ls: null };

  // ------------------------------------------------------------------ puro
  /** Huella del mensaje (FNV-1a): no guarda el texto. */
  function sig(o) {
    var s = String(o.module) + '|' + String(o.id) + '|' + o.text.join(' '), h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  /** Saca lo de más de 60 días y deja como mucho las 200 más nuevas. */
  function prune(map, now) {
    var min = now - SEEN_DAYS * 864e5;
    var keys = Object.keys(map).filter(function (k) { return map[k] >= min; }).sort(function (a, b) { return map[b] - map[a]; }).slice(0, SEEN_MAX);
    var out = {};
    keys.forEach(function (k) { out[k] = map[k]; });
    return out;
  }

  // ------------------------------------------------------------------ almacenamiento
  function ls() { return st.ls || root.localStorage || null; }
  function readSeen() {
    try { var v = JSON.parse(ls().getItem(SEEN_KEY) || 'null'); return v && v.v === 1 && v.s ? v.s : {}; } catch (_) { return {}; }
  }
  function markSeen(o) {
    var map = readSeen();
    map[sig(o)] = Date.now();
    try { ls().setItem(SEEN_KEY, JSON.stringify({ v: 1, s: prune(map, Date.now()) })); } catch (_) {}
  }
  function seen(o) { return Object.prototype.hasOwnProperty.call(readSeen(), sig(o)); }
  function quiet(v) {
    if (typeof v === 'boolean') {
      try { if (v) ls().setItem(QUIET_KEY, 'true'); else ls().removeItem(QUIET_KEY); } catch (_) {}
      if (v) { st.queue = []; st.unread = []; close('read'); setUnread(); } // silenciada: tampoco queda el punto
    }
    try { return ls().getItem(QUIET_KEY) === 'true'; } catch (_) { return false; }
  }

  // ------------------------------------------------------------------ DOM
  function byId(id) { return doc && doc.getElementById ? doc.getElementById(id) : null; }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function ensure() {
    if (!byId(STYLE_ID)) {
      var s = el('style');
      s.id = STYLE_ID;
      s.textContent = CSS + (root.ShvCore && root.ShvCore.CSS ? root.ShvCore.CSS : '');
      (doc.head || doc.documentElement).appendChild(s);
    }
    var live = byId(LIVE_ID);
    if (!live) {
      live = el('div', 'shv-bub__sr');
      live.id = LIVE_ID;
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      doc.body.appendChild(live);
    }
    return live;
  }
  function shown(n) { return n && !n.hidden && !(n.closest && n.closest('[hidden]')); }
  /** No aparezco con un diálogo abierto ni mientras escribís. */
  function busy() {
    var a = doc.activeElement, tag = a && a.tagName ? String(a.tagName).toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (a && a.isContentEditable)) return true;
    var list = doc.querySelectorAll ? doc.querySelectorAll('[aria-modal="true"], dialog[open]') : [];
    for (var i = 0; i < list.length; i++) if (shown(list[i])) return true;
    return false;
  }
  function setUnread() {
    var a = st.anchor;
    if (!a || !a.setAttribute) return;
    if (st.unread.length) a.setAttribute('data-shv-unread', String(st.unread.length));
    else if (a.removeAttribute) a.removeAttribute('data-shv-unread');
  }
  function place(box) {
    var a = st.anchor, w = root.innerWidth || 0;
    if (!a || !a.getBoundingClientRect || w <= 900) return;
    var r = a.getBoundingClientRect();
    box.style.left = Math.round(r.right + 12) + 'px';
    box.style.bottom = Math.max(16, Math.round((root.innerHeight || 0) - r.bottom)) + 'px';
  }

  function arm(ms) {
    if (st.timer) root.clearTimeout(st.timer);
    st.deadline = Date.now() + ms;
    st.timer = root.setTimeout(function () { st.timer = null; close('later'); }, ms);
  }
  function pause() {
    if (!st.timer) return;
    root.clearTimeout(st.timer);
    st.timer = null;
    st.left = Math.max(MIN_LEFT, st.deadline - Date.now());
  }
  function resume() { if (st.cur && !st.timer) arm(st.left); }

  /**
   * Cierra el globo. how: 'read' (✕, Escape o su botón: lo diste por visto) o 'later' («Después» o se fue
   * solo: queda en el punto). En los dos casos ya no vuelve a aparecer solo.
   */
  function close(how) {
    var c = st.cur, box = byId(ID);
    if (st.timer) { root.clearTimeout(st.timer); st.timer = null; }
    st.cur = null;
    if (box && box.parentNode) {
      var hadFocus = box.contains && box.contains(doc.activeElement);
      box.parentNode.removeChild(box);
      if (hadFocus && st.anchor && st.anchor.focus) st.anchor.focus();
    }
    if (!c) return false;
    markSeen(c);
    if (how === 'later') st.unread.push(c);
    setUnread();
    next(DELAY);
    return true;
  }

  function render(o, focus) {
    var C = root.ShvCore;
    var voice = C && C.render ? C.render(o, { doc: doc }) : null;
    if (!voice) return false;
    var live = ensure();
    var box = el('section', 'shv-bub');
    box.id = ID;
    box.setAttribute('aria-label', 'Mensaje de Shiruvana');
    var x = el('button', 'shv-bub__x', '✕');
    x.type = 'button';
    x.setAttribute('aria-label', 'Cerrar el mensaje de Shiruvana');
    x.setAttribute('data-shv-bub', 'close');
    box.appendChild(x);
    box.appendChild(voice);
    var row = voice.querySelector ? voice.querySelector('.shv-obs__acts') : null;
    var main = voice.querySelector ? voice.querySelector('.shv-voice__main') : null;
    if (!row && main) { row = el('div', 'shv-obs__acts'); main.appendChild(row); }
    if (row) {
      var later = el('button', 'shv-obs__btn', 'Después');
      later.type = 'button';
      later.setAttribute('data-shv-bub', 'later');
      row.appendChild(later);
    }
    box.addEventListener('click', onClick);
    box.addEventListener('mouseenter', pause);
    box.addEventListener('mouseleave', resume);
    box.addEventListener('focusin', pause);
    box.addEventListener('focusout', function (e) { if (!e || !e.relatedTarget || !box.contains(e.relatedTarget)) resume(); });
    place(box);
    doc.body.appendChild(box);
    st.cur = o;
    live.textContent = '';
    live.textContent = (root.Shiruvana && root.Shiruvana.KINDS && root.Shiruvana.KINDS[o.kind] ? root.Shiruvana.KINDS[o.kind].label : 'Shiruvana') + ': ' + o.text.join(' ');
    st.left = TTL;
    arm(TTL);
    if (focus && x.focus) x.focus(); // solo si me abriste vos (reopen)
    return true;
  }

  function next(ms) {
    if (st.cur || st.timer || !st.queue.length) return;
    st.timer = root.setTimeout(function () {
      st.timer = null;
      if (st.cur || !st.queue.length) return;
      if (quiet()) { st.queue = []; return; }
      if (busy()) { next(RETRY); return; }
      render(st.queue.shift(), false);
    }, ms);
  }

  function onClick(e) {
    var t = e && e.target, b = t && t.closest ? t.closest('[data-shv-bub],[data-shv-act]') : null;
    if (!b || !st.cur) return;
    var bub = b.getAttribute('data-shv-bub'), act = b.getAttribute('data-shv-act'), o = st.cur;
    if (bub === 'close') { close('read'); return; }
    if (bub === 'later') { close('later'); return; }
    if (act !== null) {
      close('read');
      if (typeof root.CustomEvent === 'function') doc.dispatchEvent(new root.CustomEvent('gn:shv-act', { detail: { module: o.module, id: o.id, act: act } }));
    }
  }

  function onKey(e) {
    if (!st.cur || !e || e.key !== 'Escape') return;
    var list = doc.querySelectorAll ? doc.querySelectorAll('[aria-modal="true"], dialog[open]') : [];
    for (var i = 0; i < list.length; i++) if (shown(list[i])) return; // Escape es del diálogo
    close('read');
  }

  // ------------------------------------------------------------------ API
  /** Me ofrecen una observación. true si la voy a mostrar; false si estoy silenciada, ya la viste o no tiene formato. */
  function offer(obs) {
    var C = root.ShvCore, o = C && C.observation ? C.observation(obs) : null;
    if (!o || !doc || quiet() || seen(o)) return false;
    var s = sig(o);
    if ((st.cur && sig(st.cur) === s) || st.queue.some(function (q) { return sig(q) === s; })) return false;
    init();
    st.queue.push(o);
    next(DELAY);
    return true;
  }
  /** Tocaste mi avatar: muestro lo último que no leíste (con el foco en el globo, porque lo pediste vos). */
  function reopen() {
    if (!st.unread.length || !doc) return false;
    init();
    if (st.cur) close('read');
    if (st.timer) { root.clearTimeout(st.timer); st.timer = null; }
    var o = st.unread.pop();
    setUnread();
    return render(o, true);
  }
  function setAnchor(a) { st.anchor = a || null; setUnread(); }
  function init() {
    if (st.inited || !doc || !doc.addEventListener) return;
    st.inited = true;
    doc.addEventListener('keydown', onKey);
  }

  root.ShvBubble = {
    version: VERSION, SEEN_KEY: SEEN_KEY, QUIET_KEY: QUIET_KEY, DELAY: DELAY, TTL: TTL, ID: ID, CSS: CSS,
    offer: offer, reopen: reopen, close: function () { return close('read'); }, quiet: quiet, setAnchor: setAnchor,
    unread: function () { return st.unread.length; }, current: function () { return st.cur; },
    _pure: { sig: sig, prune: prune }, _setStorage: function (L) { st.ls = L; }
  };
  if (root.console && root.console.info) root.console.info('[ShvBubble] ready v' + VERSION);
})(typeof window !== 'undefined' ? window : globalThis);
