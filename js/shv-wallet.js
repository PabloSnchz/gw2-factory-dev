/*!
 * js/shv-wallet.js — Mi voz en la Cartera (BL-059 SHV-1, nivel N2 de DEC-033)
 * Versión: 1.1.0 (2026-10-27) · SHV-2: debajo de mi voz, la evolución de los últimos 30 días de la cuenta
 *          activa, con mi memoria (js/shv-memory.js). Con menos de 2 días no invento tendencias.
 *          1.0.0 (2026-10-26)
 *
 * Un solo mensaje, arriba de Mi cartera, con el formato común de js/shv-core.js:
 *   1. alta  · la Key activa no tiene el permiso «billetera» (no puedo leer tus divisas);
 *   2. media · no fijaste ninguna divisa: te sugiero fijar las que seguís;
 *   3. baja  · cuántas divisas tienen saldo y cuántas fijaste.
 * Cada mensaje dice de dónde lo sé y cuándo («Lo sé por: …»).
 * Lee lo que ya dibujó la Cartera (WalletTheme._state), la Key activa de Storage y mi memoria
 * (js/shv-memory.js, que es la que guarda). Se carga por js/modules.json, después de shv-memory.js.
 */
(function (root) {
  'use strict';
  var VERSION = '1.1.0';
  var HOST_ID = 'shvWalletVoice', MEM_ID = 'shvWalletMemory';
  var doc = root.document;
  var st = { sig: null, memSig: null, timer: null, mo: null };

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /**
   * Observaciones de la Cartera (pura).
   * @param {{models:Array, lastAt:number|null, perms:Array|null, label:string}} input
   */
  function observe(input) {
    input = input || {};
    var out = [];
    var perms = input.perms, label = String(input.label || '').trim();
    if (Array.isArray(perms) && perms.indexOf('wallet') < 0) {
      out.push({
        module: 'cartera', id: 'perm', priority: 'alta', kind: 'advierte',
        text: ['La Key activa' + (label ? ', ' + label + ',' : '') + ' no tiene el permiso «billetera»: sin él no puedo leer tus divisas.',
          'Creá una Key con los 7 permisos en account.arena.net y reemplazala.'],
        action: { label: 'Revisar Keys', act: 'keys' },
        basis: { source: 'los permisos guardados de la Key activa', at: null }
      });
    }
    var models = Array.isArray(input.models) ? input.models : [];
    if (models.length) {
      var withBal = models.filter(function (m) { return Number(m && m.amount) > 0; }).length;
      var pinned = models.filter(function (m) { return m && m.pinned; }).length;
      var basis = { source: 'tu Cartera, leída de la API oficial', at: typeof input.lastAt === 'number' ? input.lastAt : null };
      if (!pinned) {
        out.push({
          module: 'cartera', id: 'pin', priority: 'media', kind: 'recomienda',
          text: ['Tenés ' + plural(withBal, 'divisa', 'divisas') + ' con saldo en esta cuenta. Fijá con ★ las que seguís: suben a Destacadas y son las primeras que voy a mirar.'],
          basis: basis
        });
      } else {
        out.push({
          module: 'cartera', id: 'summary', priority: 'baja', kind: 'explica',
          text: ['Tenés ' + plural(withBal, 'divisa', 'divisas') + ' con saldo en esta cuenta y ' + plural(pinned, 'fijada', 'fijadas') + ' en Destacadas.'],
          basis: basis
        });
      }
    }
    return out;
  }

  function activeKey() {
    try {
      var S = root.Storage;
      var keys = S && S.get('gn:account:keys');
      if (!Array.isArray(keys)) return null;
      var sel = S.get('gn:account:selected'), first = null;
      for (var i = 0; i < keys.length; i++) {
        if (!keys[i] || !keys[i].value) continue;
        if (keys[i].value === sel) return keys[i];
        if (!first) first = keys[i];
      }
      return first;
    } catch (_) { return null; }
  }

  function input() {
    var W = root.WalletTheme, S = W && W._state, k = activeKey();
    return {
      models: S && Array.isArray(S.models) ? S.models : [],
      lastAt: S && S.lastAt ? S.lastAt : null,
      perms: k && Array.isArray(k.perms) ? k.perms : null,
      label: k ? String(k.label || '') : ''
    };
  }

  function host() {
    var p = doc && doc.getElementById('walletPanel');
    return p ? p.querySelector('.panel__body') : null;
  }
  function inside(n) {
    while (n) { if (n.id === HOST_ID || n.id === MEM_ID) return true; n = n.parentNode; }
    return false;
  }

  // ------------------------------------------------------------------ SHV-2: mi memoria de la Cartera
  var NF = typeof Intl !== 'undefined' ? new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }) : null;
  function num(v) { v = Math.round(v); return NF ? NF.format(v) : String(v); }
  function short(v) {
    if (Math.abs(v) >= 1e6) return String(Math.round(v / 1e5) / 10).replace('.', ',') + ' M';
    return num(v);
  }
  var MEM_CSS = [
    '#' + MEM_ID + '{border:1px solid var(--bd-1);border-radius:12px;background:var(--bg-1);padding:12px 14px;margin:0 0 12px;color:var(--tx-1)}',
    '.shv-mem__t{margin:0 0 6px;font-weight:700;font-size:.9rem;color:var(--tx-1)}',
    '#' + MEM_ID + ' svg{display:block;color:var(--acc-1);margin:2px 0 6px}',
    '.shv-mem__r{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-top:1px solid var(--bd-1);font-size:.88rem;color:var(--tx-1)}',
    '.shv-mem__v{font-weight:700;white-space:nowrap}.shv-mem__d{font-weight:600;color:var(--tx-2);margin-left:4px}',
    '.shv-mem__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.shv-mem__f,.shv-mem__x{margin:6px 0 0;font-size:.78rem;color:var(--tx-2)}'
  ].join('');

  /**
   * Lo que muestra el panel de evolución (pura). sum: ShvMemory.summary(...).
   * Con menos de 2 fotos en la ventana no hay tendencia: lo digo así, sin inventar.
   */
  function memoryModel(sum, now) {
    if (!sum || !sum.days) return null;
    var C = root.ShvCore, src = 'tus fotos diarias de la Cartera (' + plural(sum.days, 'día guardado', 'días guardados') + ' en este navegador)';
    var basis = C ? C.basisText({ source: src, at: sum.lastAt }, now) : src;
    if (sum.inWindow < 2) return { empty: true, text: 'Empecé a recordar tu Cartera. Con unos días más de fotos te muestro cómo evoluciona.', basis: basis };
    var n = sum.gold.length, vals = sum.gold.filter(function (v) { return v !== null; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), span = hi - lo || 1, pts = [];
    sum.gold.forEach(function (v, i) {
      if (v !== null) pts.push(Math.round(i * 300 / Math.max(1, n - 1)) + ',' + Math.round(62 - (v - lo) * 54 / span));
    });
    return {
      empty: false, points: pts.join(' '), basis: basis,
      label: 'Oro, últimos ' + n + ' días: de ' + num(vals[0]) + ' a ' + num(vals[vals.length - 1]),
      rows: sum.rows.filter(function (r) { return r.value || r.delta; }).map(function (r) { // lo que está y sigue en 0, no
        var d = r.delta;
        return {
          name: r.name, value: short(r.value) + (r.gold ? ' de oro' : ''),
          delta: d === null ? '' : d > 0 ? '▲ ' + short(d) : d < 0 ? '▼ ' + short(-d) : '=',
          sr: d === null ? '' : d > 0 ? 'subió ' + short(d) : d < 0 ? 'bajó ' + short(-d) : 'sin cambios'
        };
      })
    };
  }

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function memoryNode(m) {
    var box = el('section', 'shv-mem');
    box.id = MEM_ID;
    box.setAttribute('aria-label', 'Evolución de tu Cartera');
    box.appendChild(el('p', 'shv-mem__t', m.empty ? 'Mi memoria de tu Cartera' : 'Evolución · últimos 30 días'));
    if (m.empty) box.appendChild(el('p', 'shv-mem__x', m.text));
    else {
      var NS = 'http://www.w3.org/2000/svg', svg = doc.createElementNS(NS, 'svg'), pl = doc.createElementNS(NS, 'polyline');
      [['viewBox', '0 0 300 70'], ['width', '100%'], ['height', '70'], ['role', 'img'], ['aria-label', m.label]].forEach(function (a) { svg.setAttribute(a[0], a[1]); });
      [['points', m.points], ['fill', 'none'], ['stroke', 'currentColor'], ['stroke-width', '2.5']].forEach(function (a) { pl.setAttribute(a[0], a[1]); });
      svg.appendChild(pl);
      box.appendChild(svg);
      m.rows.forEach(function (r) {
        var row = el('div', 'shv-mem__r'), v = el('span', 'shv-mem__v', r.value);
        row.appendChild(el('span', null, r.name));
        if (r.delta) {
          var d = el('span', 'shv-mem__d', r.delta);
          d.setAttribute('aria-hidden', 'true');
          v.appendChild(d);
          v.appendChild(el('span', 'shv-mem__sr', ' (' + r.sr + ')'));
        }
        row.appendChild(v);
        box.appendChild(row);
      });
    }
    box.appendChild(el('p', 'shv-mem__f', 'Lo sé por: ' + m.basis));
    return box;
  }

  function paintMemory() {
    var M = root.ShvMemory, body = host(), k = activeKey(), cur = doc.getElementById(MEM_ID);
    if (!M || !body || !k || !k.value) {
      if (cur && cur.parentNode) cur.parentNode.removeChild(cur);
      st.memSig = null;
      return;
    }
    var W = root.WalletTheme, S = W && W._state, names = {};
    if (S && S.lastAt) M.ensureToday(k.value);
    [S && S.models, S && S.tmodels].forEach(function (l) {
      (Array.isArray(l) ? l : []).forEach(function (x) { if (x && x.id && x.id !== 1 && x.name) names[x.id] = x.name; });
    });
    var now = Date.now(), m = memoryModel(M.summary(M.fingerprint(k.value), 30, now, names), now);
    var sig = m ? JSON.stringify(m) : '';
    if (sig === st.memSig && (m ? !!cur : !cur)) return;
    st.memSig = sig;
    if (cur && cur.parentNode) cur.parentNode.removeChild(cur);
    if (!m) return;
    if (!doc.getElementById('shv-mem-css')) {
      var s = doc.createElement('style');
      s.id = 'shv-mem-css';
      s.textContent = MEM_CSS;
      (doc.head || doc.documentElement).appendChild(s);
    }
    var voice = doc.getElementById(HOST_ID);
    body.insertBefore(memoryNode(m), voice && voice.parentNode === body ? voice.nextSibling : body.firstChild);
  }

  function paint() {
    st.timer = null;
    paintMemory();
    paintVoice();
  }
  function paintVoice() {
    var C = root.ShvCore, body = host();
    if (!C || !root.Shiruvana || !body) return;
    var obs = C.pick(observe(input()));
    var cur = doc.getElementById(HOST_ID);
    var sig = obs ? obs.id + '|' + obs.text.join(' ') + '|' + C.basisText(obs.basis) : '';
    if (sig === st.sig && (obs ? !!cur : !cur)) return;
    st.sig = sig;
    if (cur && cur.parentNode) cur.parentNode.removeChild(cur);
    if (!obs) return;
    var el = C.render(obs, { doc: doc });
    if (!el) return;
    el.id = HOST_ID;
    body.insertBefore(el, body.firstChild);
  }
  function schedule() { if (!st.timer) st.timer = root.setTimeout(paint, 250); }

  function onClick(e) {
    var b = e && e.target && e.target.closest ? e.target.closest('#' + HOST_ID + ' [data-shv-act]') : null;
    if (!b) return;
    if (b.getAttribute('data-shv-act') === 'keys') { var k = doc.getElementById('keysMenuBtn'); if (k) k.click(); }
  }

  function init() {
    if (!doc) return;
    var p = doc.getElementById('walletPanel');
    if (p && typeof root.MutationObserver === 'function') {
      st.mo = new root.MutationObserver(function (recs) {
        if (recs && recs.length && recs.every(function (r) { return inside(r.target); })) return;
        schedule();
      });
      st.mo.observe(p, { childList: true, subtree: true });
    }
    doc.addEventListener('gn:tokenchange', schedule);
    doc.addEventListener('gn:shv-memory', schedule);
    doc.addEventListener('click', onClick);
    schedule();
  }

  root.ShvWallet = { version: VERSION, observe: observe, memoryModel: memoryModel, refresh: paint, HOST_ID: HOST_ID, MEM_ID: MEM_ID };
  if (doc) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
    else init();
  }
  if (root.console && root.console.info) root.console.info('[ShvWallet] ready v' + VERSION);
})(typeof window !== 'undefined' ? window : globalThis);
