/*!
 * js/guias-escena.js — Mis poses en las guías de usuario (BL-094 GU-3, FEAT-028)
 * Versión: 1.0.0
 *
 * Solo con el theme Gato Negro (data-theme="gato" o todavía sin data-theme, igual que css/universo.css):
 * baja el kit de escena de la Bóveda (js/escena-kit.js, la misma copia fija que usa js/shv-bubble.js) y le
 * pide mis poses sin fondo con su recorte (posesSinFondo, una vez por imagen, desde assets/brand/shiruvana/).
 * Quedan en body como --svk-p-<pose> y la clase svk-p-<pose>; css/guias.css las pone en momentos puntuales:
 * la bienvenida (saluda), un consejo (pensando) y el cierre (sentada). Mientras no están listas no se ve nada:
 * nunca un rectángulo negro. Con los otros 18 themes no baja nada.
 * No guarda nada en el navegador ni pide nada fuera de pablosnchz.github.io.
 * Las guías lo cargan con <script defer src="../js/guias-escena.js?v=1.0.0">; lo vigila tests/guias-escena.test.cjs.
 */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';
  var KIT_V = '1.0.0', KIT_JS = '../js/escena-kit.js', BRAND = '../assets/brand/';
  var POSES = ['saluda', 'pensando', 'sentada'];

  /** El theme oficial: data-theme="gato" o todavía sin data-theme. */
  function gatoTheme(doc) {
    var r = doc && doc.documentElement, t = r && r.getAttribute ? r.getAttribute('data-theme') : null;
    return t == null || t === 'gato';
  }
  function kit() { var K = root.ShiruvanaKit; return K && typeof K.posesSinFondo === 'function' ? K : null; }
  function poner(doc) {
    var K = kit();
    if (!K || !doc.body) return false;
    K.posesSinFondo({ el: doc.body, base: BRAND, poses: POSES });
    return true;
  }
  /** Arranca: con otro theme no hace nada; con Gato Negro baja el kit (una vez) y pide las poses. */
  function iniciar(doc) {
    doc = doc || root.document;
    if (!doc || !gatoTheme(doc)) return 'otro-theme';
    if (poner(doc)) return 'listo';
    if (!doc.createElement || !doc.head || doc.getElementById('guiasKitJs')) return 'sin-kit';
    var s = doc.createElement('script');
    s.id = 'guiasKitJs';
    s.async = false;
    s.src = KIT_JS + '?v=' + KIT_V;
    s.onload = function () { poner(doc); };
    doc.head.appendChild(s); // si no carga, la guía queda como en GU-2, sin poses
    return 'bajando';
  }

  var api = { VERSION: VERSION, KIT: { v: KIT_V, js: KIT_JS, base: BRAND }, POSES: POSES, gatoTheme: gatoTheme, iniciar: iniciar };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.GuiasEscena = api;
  var d = root.document;
  if (d && d.addEventListener) {
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { iniciar(d); });
    else iniciar(d);
  }
})(typeof window !== 'undefined' ? window : globalThis);
