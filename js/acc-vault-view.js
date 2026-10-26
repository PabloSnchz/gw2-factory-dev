/*!
 * js/acc-vault-view.js — La pestaña Llavero de Cuentas (BL-070, paso 4, CTA-3)
 * Proyecto: Bóveda del Gato Negro
 * Versión: 1.0.0 (2026-10-26)
 *
 * Abre tu archivo cifrado de siempre (o la copia que el panel anterior guardó en este navegador) con
 * js/acc-vault.js y lo muestra sin perder nada, en modo lectura:
 *  - todo enmascarado; «Ver» muestra un dato y lo vuelve a ocultar a los 20 segundos (D4);
 *  - «Copiar» lo copia y vacía el portapapeles a los 30 segundos, si seguís en la pestaña (D4);
 *  - se cierra solo a los 5 minutos sin uso y al salir de Cuentas; al cerrarse, lo descifrado se borra de
 *    la memoria. La contraseña nunca se guarda y los secretos solo llegan a la página cuando tocás «Ver».
 * Mientras está abierto, Mis cuentas suma las etiquetas del archivo (farming, llaves, semanal, taxi y las
 * tuyas) y muestra en gris las cuentas que no tienen Key en la Bóveda (D7).
 * Editar, guardar con el cifrado nuevo e importar desde Excel llegan en CTA-4; hasta entonces el panel
 * anterior queda a mano con «Mostrar el panel anterior». Lo dibuja y le pasa los eventos js/acc-view.js.
 * Se carga por js/modules.json (DEC-035), después de acc-vault.js y antes de acc-view.js.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var ROUTE = '#/account/accounts';
  var LEGACY_KEY = 'accounts:lastFile'; // la copia cifrada que guarda js/accounts-panel.js
  var IDLE = 5 * 60000, REVEAL = 20000, CLIP = 30000;
  var LOCK_ICON = 'assets/icons/Cuentas/733265.png';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function clock(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  var doc = root.document;
  var st = { data: null, format: null, name: '', list: [], reveal: {}, timers: {}, last: 0, tick: null, clip: null, fileText: null, fileName: '', err: '', busy: false, q: '', legacy: false };

  function V() { return root.AccVault || null; }
  function byId(id) { return doc && doc.getElementById ? doc.getElementById(id) : null; }
  function now() { return Date.now(); }
  function rerender() { if (root.AccView && typeof root.AccView.render === 'function') root.AccView.render(); }
  function toast(kind, text) { if (typeof root.toast === 'function') root.toast(kind, text, { ttl: 2200 }); }
  function stored() {
    var S = root.Storage, c = S && typeof S.get === 'function' ? S.get(LEGACY_KEY) : null;
    return c && typeof c === 'object' && typeof c.data === 'string' && c.data ? { name: String(c.name || 'archivo guardado'), data: c.data } : null;
  }
  function isOpen() { return !!st.data; }
  function field(key) { return (V() ? V().FIELDS : []).filter(function (f) { return f.key === key; })[0]; }
  function acc(i) { return st.data && Array.isArray(st.data.accounts) ? st.data.accounts[i] : null; }

  // ------------------------------------------------------------------ HTML
  function lockedHTML() {
    var sv = stored(), h = '<section class="vk-box" aria-labelledby="vkT"><div class="vk-h"><span class="cv-av vk-av"><img src="' + LOCK_ICON + '" alt="" width="30" height="30"></span>' +
      '<div><h3 id="vkT">Tu Llavero está cerrado</h3><p>Tus contraseñas, Twitch, GeForce NOW, notas y etiquetas viven cifradas en tu archivo. Se abren solo en este navegador, nunca salen de él, y se cierran solas a los 5 minutos sin uso.</p></div></div>';
    if (sv && !st.fileText) h += '<p class="vk-file">Último archivo abierto en este navegador: <b>' + esc(sv.name) + '</b></p>';
    h += '<div class="vk-form"><label class="cv-btn vk-pick"><input type="file" id="vkFile" accept=".enc,.json,.txt" class="vk-file-in">' + (sv && !st.fileText ? 'Elegir otro archivo' : 'Elegir archivo') + '</label>' +
      '<span class="vk-chosen">' + (st.fileText ? esc(st.fileName) : sv ? '' : 'Ningún archivo elegido') + '</span>' +
      '<label class="vk-pass"><span>Contraseña</span><input type="password" id="vkPass" autocomplete="off" spellcheck="false"></label>' +
      '<button type="button" class="cv-btn vk-go" data-vk="open"' + (st.busy ? ' disabled' : '') + '>' + (st.busy ? 'Abriendo…' : 'Abrir') + '</button></div>';
    if (st.err) h += '<p class="cv-warn" role="alert">' + esc(st.err) + '</p>';
    return h + legacyHTML('¿Todavía no tenés archivo o querés cambiar algo? Hasta el próximo paso se hace con el panel anterior.') + '</section>';
  }

  function legacyHTML(text) {
    return '<p class="cv-note vk-legacy">' + text + ' <button type="button" class="cv-btn" data-vk="legacy" aria-pressed="' + st.legacy + '">' + (st.legacy ? 'Ocultar el panel anterior' : 'Mostrar el panel anterior') + '</button></p>';
  }

  function rowHTML(e, f) {
    var a = acc(e.i), id = e.i + ':' + f.key, v = V().value(a, f.key), who = esc(e.name), lab = esc(f.label);
    var h = '<div class="vk-row' + (f.kind === 'note' ? ' vk-row--note' : '') + '"><img src="' + esc(f.icon) + '" alt="" width="20" height="20"><span class="vk-k">' + lab + '</span>';
    if (f.kind === 'flag') return h + '<span class="vk-v">' + (v ? 'Vinculada' : 'No vinculada') + '</span></div>';
    if (f.kind === 'note') return h + '<span class="vk-v vk-note">' + esc(v) + '</span></div>';
    var shown = f.kind !== 'secret' || st.reveal[id];
    h += '<span class="vk-v' + (shown ? '' : ' vk-masked') + '">' + esc(shown ? v : V().mask(v, f)) + '</span><span class="vk-acts">';
    if (f.kind === 'secret') h += '<button type="button" class="cv-btn" data-vk-show="' + id + '" aria-pressed="' + !!st.reveal[id] + '">' + (st.reveal[id] ? 'Ocultar' : 'Ver') + '<span class="cv-sr"> ' + lab + ' de ' + who + '</span></button>';
    return h + '<button type="button" class="cv-btn" data-vk-copy="' + id + '">Copiar<span class="cv-sr"> ' + lab + ' de ' + who + '</span></button></span></div>';
  }

  function cardHTML(e, cat, M) {
    var tags = M ? M.tags(e.tags, cat.tags, cat.otherTagColor) : [], t = tags.filter(function (x) { return x.type; })[0];
    var color = t ? t.color : (cat && cat.otherTagColor) || '#8E96A3';
    var h = '<article class="vk-card" style="--tc:' + esc(color) + '" aria-labelledby="vkN-' + e.i + '"><div class="cv-ch"><span class="cv-av"><img src="' + esc(t ? t.icon : LOCK_ICON) + '" alt="" width="34" height="34"></span>' +
      '<div class="cv-nm"><b id="vkN-' + e.i + '">' + esc(e.name) + '</b>' + (e.accountName ? '<small>' + esc(e.accountName) + '</small>' : '') + '</div></div>';
    if (tags.length) h += '<div class="cv-chips">' + tags.map(function (x) {
      return '<span class="cv-chip cv-tag" style="--cc:' + esc(x.color) + '">' + (x.icon ? '<img src="' + esc(x.icon) + '" alt="" width="16" height="16">' : '<i aria-hidden="true"></i>') + esc(x.name) + '</span>';
    }).join('') + '</div>';
    var rows = V().FIELDS.filter(function (f) { return e.fields.indexOf(f.key) >= 0; });
    h += rows.length ? '<div class="vk-rows">' + rows.map(function (f) { return rowHTML(e, f); }).join('') + '</div>' : '<p class="cv-note">Esta cuenta no tiene datos guardados.</p>';
    return h + '</article>';
  }

  function openHTML(cat, M) {
    var q = fold(st.q), shown = st.list.filter(function (e) { return !q || fold(e.name + ' ' + e.accountName + ' ' + e.tags.join(' ')).indexOf(q) >= 0; });
    var h = '<div class="vk-bar"><img src="' + LOCK_ICON + '" alt="" width="22" height="22"><span>Llavero abierto · <b>' + esc(st.name) + '</b> · ' + st.list.length + (st.list.length === 1 ? ' cuenta' : ' cuentas') +
      ' · se cierra solo en <b id="vkClock">' + clock(IDLE - (now() - st.last)) + '</b></span><button type="button" class="cv-btn" data-vk="lock">Cerrar ya</button></div>';
    if (st.format === 'legacy') h += '<p class="cv-warn">Este archivo usa el cifrado anterior, que se rompe fácil por fuerza bruta. En el próximo paso vas a poder guardarlo con el cifrado nuevo, en un archivo aparte: este no se toca.</p>';
    h += '<div class="cv-filters"><label class="cv-q"><span class="cv-sr">Buscar en el Llavero</span><input type="search" id="vkQ" placeholder="Buscar en el Llavero" value="' + esc(st.q) + '" autocomplete="off"></label></div>';
    h += shown.length ? '<div class="vk-grid">' + shown.map(function (e) { return cardHTML(e, cat, M); }).join('') + '</div>' : '<p class="cv-note">No hay cuentas con esa búsqueda.</p>';
    return h + legacyHTML('Para agregar, editar o borrar, hasta el próximo paso, está el panel anterior.') + '<p class="cv-src">Solo lectura. «Ver» oculta el dato de nuevo a los 20 segundos y «Copiar» vacía el portapapeles a los 30. Tu contraseña no se guarda.</p>';
  }

  function html(cat, M) {
    if (!V()) return '<p class="cv-note">No pude cargar el Llavero. Recargá la página (Ctrl+F5).</p>';
    return isOpen() ? openHTML(cat, M) : lockedHTML();
  }

  // ------------------------------------------------------------------ Mis cuentas (D7)
  // Suma las etiquetas del archivo a la tarjeta de su Key y agrega en gris las cuentas sin Key.
  function decorate(cards, cat, M) {
    if (!isOpen() || !M || !cat) return cards;
    var byFp = {};
    st.list.forEach(function (e) { if (e.keyFp) byFp[e.keyFp] = e; });
    var used = {}, out = cards.map(function (c) {
      var e = byFp[c.fp];
      if (!e) return c;
      used[e.i] = true;
      var tags = M.tags(c.tags.map(function (x) { return x.id; }).concat(e.tags), cat.tags, cat.otherTagColor);
      return Object.assign({}, c, { tags: tags, type: M.accountType(tags) });
    });
    st.list.forEach(function (e) {
      if (used[e.i]) return;
      var tags = M.tags(e.tags, cat.tags, cat.otherTagColor);
      out.push({ fp: 'vk' + e.i, label: e.name, name: e.accountName || e.name, state: 'nokey', tags: tags, type: M.accountType(tags), exps: [], guilds: [] });
    });
    return out;
  }

  // ------------------------------------------------------------------ acciones
  function stopTimers() {
    Object.keys(st.timers).forEach(function (k) { root.clearTimeout(st.timers[k]); });
    st.timers = {};
    if (st.tick) root.clearInterval(st.tick);
    st.tick = null;
  }

  function lock(reason) {
    if (!isOpen()) return false;
    stopTimers();
    st.data = null; st.list = []; st.reveal = {}; st.format = null; st.q = '';
    if (reason === 'idle') toast('info', 'Cerré tu Llavero: pasaron 5 minutos sin uso.');
    else if (reason === 'leave') toast('info', 'Cerré tu Llavero al salir de Cuentas.');
    rerender();
    return true;
  }

  function tickOnce() {
    if (!isOpen()) { stopTimers(); return; }
    var left = IDLE - (now() - st.last);
    if (left <= 0) { lock('idle'); return; }
    var c = byId('vkClock');
    if (c) c.textContent = clock(left);
  }

  function openVault() {
    var pass = byId('vkPass'), p = pass ? String(pass.value || '') : '', sv = stored();
    var text = st.fileText || (sv ? sv.data : null), name = st.fileText ? st.fileName : sv ? sv.name : '';
    if (!text) { st.err = 'Elegí tu archivo .enc.'; rerender(); return null; }
    if (!p) { st.err = 'Escribí la contraseña de tu archivo.'; rerender(); return null; }
    st.busy = true; st.err = ''; rerender();
    return V().open(text, p).then(function (r) {
      st.busy = false; st.data = r.data; st.format = r.format; st.name = name; st.list = V().entries(r.data);
      st.fileText = null; st.last = now(); st.reveal = {};
      if (!st.tick && typeof root.setInterval === 'function') st.tick = root.setInterval(tickOnce, 1000);
      toast('success', 'Llavero abierto: ' + st.list.length + (st.list.length === 1 ? ' cuenta' : ' cuentas'));
      rerender();
    }, function (e) {
      st.busy = false;
      st.err = e && e.code === 'BAD_PASSWORD' ? 'Esa contraseña no abre este archivo (o el archivo está dañado).' : e && e.code === 'NOT_VAULT' ? 'Este archivo no es un Llavero de la Bóveda.' : 'No pude abrir el archivo: ' + ((e && e.message) || 'error');
      rerender();
    });
  }

  function reveal(id) {
    if (st.timers[id]) { root.clearTimeout(st.timers[id]); delete st.timers[id]; }
    if (st.reveal[id]) delete st.reveal[id];
    else {
      st.reveal[id] = true;
      st.timers[id] = root.setTimeout(function () { delete st.reveal[id]; delete st.timers[id]; rerender(); }, REVEAL);
    }
    rerender();
  }

  function copy(id) {
    var parts = id.split(':'), a = acc(Number(parts[0])), f = field(parts[1]), cb = root.navigator && root.navigator.clipboard;
    if (!a || !f) return null;
    if (!cb || typeof cb.writeText !== 'function') { toast('error', 'Tu navegador no me deja copiar: tocá «Ver» y copialo a mano.'); return null; }
    return cb.writeText(V().value(a, f.key)).then(function () {
      toast('success', f.label + ' copiado. Lo borro del portapapeles en 30 segundos.');
      if (st.clip) root.clearTimeout(st.clip);
      st.clip = root.setTimeout(function () { st.clip = null; if (!doc.hasFocus || doc.hasFocus()) cb.writeText('').catch(function () {}); }, CLIP);
    }, function () { toast('error', 'No pude copiar: tocá «Ver» y copialo a mano.'); });
  }

  function attr(t, name) {
    for (var n = t, i = 0; n && i < 6; n = n.parentNode, i++) { var v = n.getAttribute ? n.getAttribute(name) : null; if (v) return v; }
    return null;
  }

  function onClick(e) {
    var t = e && e.target, act = attr(t, 'data-vk'), show = attr(t, 'data-vk-show'), cp = attr(t, 'data-vk-copy');
    if (!act && !show && !cp) return false;
    st.last = now();
    if (act === 'open') openVault();
    else if (act === 'lock') { lock('manual'); toast('info', 'Llavero cerrado.'); }
    else if (act === 'legacy') { st.legacy = !st.legacy; rerender(); }
    else if (show) reveal(show);
    else if (cp) copy(cp);
    return true;
  }
  function onInput(e) {
    var t = e && e.target;
    if (!t || (t.id !== 'vkQ' && t.id !== 'vkPass')) return false;
    st.last = now();
    if (t.id === 'vkQ') { st.q = String(t.value || ''); rerender(); }
    return true;
  }
  function onKeydown(e) {
    var t = e && e.target;
    if (!t || !t.id || String(t.id).indexOf('vk') !== 0) return false;
    st.last = now();
    if (t.id === 'vkPass' && e.key === 'Enter') { if (e.preventDefault) e.preventDefault(); openVault(); }
    return true;
  }
  function onChange(e) {
    var t = e && e.target, file = t && t.id === 'vkFile' && t.files ? t.files[0] : null;
    if (!file) return false;
    var name = String(file.name || 'archivo');
    var p = typeof file.text === 'function' ? file.text() : new Promise(function (ok, ko) { var r = new root.FileReader(); r.onload = function () { ok(r.result); }; r.onerror = ko; r.readAsText(file); });
    return p.then(function (text) { st.fileText = String(text || ''); st.fileName = name; st.err = ''; rerender(); }, function () { st.err = 'No pude leer ese archivo.'; rerender(); });
  }

  if (root.addEventListener) root.addEventListener('hashchange', function () {
    var h = String((root.location && root.location.hash) || '').split('?')[0];
    if (h !== ROUTE) lock('leave');
  });

  var CSS = [
    '.vk-box{border:1px solid var(--bd-1);border-radius:14px;background:var(--bg-1);padding:16px;display:grid;gap:12px}',
    '.vk-h{display:flex;gap:12px;align-items:center}.vk-h h3{margin:0;font-size:1.02rem;color:var(--tx-1)}.vk-h p{margin:2px 0 0;font-size:.84rem;color:var(--tx-2)}.vk-av{--tc:#8E96A3}',
    '.vk-file{margin:0;font-size:.85rem;color:var(--tx-2)}.vk-file b{color:var(--tx-1)}',
    '.vk-form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.vk-chosen{font-size:.8rem;color:var(--tx-2)}',
    '.vk-pick{position:relative;overflow:hidden}.vk-file-in{position:absolute;inset:0;opacity:0;cursor:pointer}',
    '.vk-pass{display:flex;align-items:center;gap:6px;font-size:.8rem;color:var(--tx-2)}.vk-pass input{font:inherit;font-size:.9rem;border:1px solid var(--bd-2);border-radius:10px;padding:6px 10px;background:var(--bg-0);color:var(--tx-1);min-height:32px;min-width:200px}',
    '.vk-go{font-weight:700;border-color:var(--cv-mod)}',
    '.vk-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;border:1px solid var(--bd-1);border-radius:12px;background:var(--bg-0);padding:8px 12px;font-size:.85rem;color:var(--tx-2);margin-bottom:10px}.vk-bar b{color:var(--tx-1)}.vk-bar .cv-btn{margin-left:auto}',
    '.vk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px}',
    '.vk-card{border:1px solid var(--bd-1);border-left:3px solid var(--tc);border-radius:14px;background:var(--bg-1);box-shadow:var(--gn-elev,0 6px 18px rgba(0,0,0,.28));padding:12px 14px;min-width:0}',
    '.vk-rows{margin-top:8px}.vk-row{display:grid;grid-template-columns:20px 130px minmax(0,1fr) auto;gap:8px;align-items:center;border-top:1px solid var(--bd-1);padding:6px 0;font-size:.85rem}',
    '.vk-row img{width:20px;height:20px}.vk-k{color:var(--tx-2)}.vk-v{color:var(--tx-1);overflow-wrap:anywhere;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.vk-masked{letter-spacing:.06em}',
    '.vk-row--note{grid-template-columns:20px 130px minmax(0,1fr)}.vk-note{font-family:inherit;white-space:pre-wrap}',
    '.vk-acts{display:flex;gap:6px}.vk-legacy{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
    '@media (max-width:900px){.vk-grid{grid-template-columns:1fr}.vk-row{grid-template-columns:20px minmax(0,1fr) auto}.vk-k{display:none}.vk-row--note{grid-template-columns:20px minmax(0,1fr)}.vk-pass,.vk-pass input{width:100%}.vk-acts{flex-wrap:wrap}}'
  ].join('\n');
  function ensureCss() {
    if (!doc || !doc.createElement || !doc.head || byId('acc-vault-view-css')) return;
    var s = doc.createElement('style'); s.id = 'acc-vault-view-css'; s.textContent = CSS; doc.head.appendChild(s);
  }
  if (doc) ensureCss();

  root.AccVaultView = {
    version: VERSION, html: html, decorate: decorate, onClick: onClick, onInput: onInput, onKeydown: onKeydown, onChange: onChange,
    isOpen: isOpen, lock: lock, showLegacy: function () { return st.legacy; },
    _pure: { esc: esc, fold: fold, clock: clock, CSS: CSS, IDLE: IDLE, REVEAL: REVEAL, CLIP: CLIP, LEGACY_KEY: LEGACY_KEY, state: function () { return st; } }
  };
  if (root.console && root.console.info) root.console.info('[AccVaultView] ready v' + VERSION);
})(typeof window !== 'undefined' ? window : this);
