/*!
 * js/shv-wallet.js — Mi voz en la Cartera (BL-059 SHV-1, nivel N2 de DEC-033)
 * Versión: 1.0.0
 *
 * Un solo mensaje, arriba de Mi cartera, con el formato común de js/shv-core.js:
 *   1. alta  · la Key activa no tiene el permiso «billetera» (no puedo leer tus divisas);
 *   2. media · no fijaste ninguna divisa: te sugiero fijar las que seguís;
 *   3. baja  · cuántas divisas tienen saldo y cuántas fijaste.
 * Cada mensaje dice de dónde lo sé y cuándo («Lo sé por: …»).
 * Lee lo que ya dibujó la Cartera (WalletTheme._state) y la Key activa de Storage: no pide nada
 * a la API ni guarda nada (la memoria de la Cartera llega en SHV-2). Se carga por js/modules.json.
 */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';
  var HOST_ID = 'shvWalletVoice';
  var doc = root.document;
  var st = { sig: null, timer: null, mo: null };

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
    while (n) { if (n.id === HOST_ID) return true; n = n.parentNode; }
    return false;
  }

  function paint() {
    st.timer = null;
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
    doc.addEventListener('click', onClick);
    schedule();
  }

  root.ShvWallet = { version: VERSION, observe: observe, refresh: paint, HOST_ID: HOST_ID };
  if (doc) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
    else init();
  }
  if (root.console && root.console.info) root.console.info('[ShvWallet] ready v' + VERSION);
})(typeof window !== 'undefined' ? window : globalThis);
