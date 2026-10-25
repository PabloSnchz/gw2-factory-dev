/*!
 * js/gn-shell.js — Un solo contenedor por módulo renovado (BL-070, pedido de Pablo del 2026-10-25)
 * Proyecto: Bóveda del Gato Negro
 * Versión: 1.0.0 (2026-10-25)
 *
 * Por qué existe: en Raids, Inventario y Personajes, Actividades, Logros y la Cámara del Brujo la
 * cabecera nueva es una caja con borde y degradado metida dentro del panel, que ya tiene su borde.
 * Se ve doble borde, el degradado del color del módulo queda encerrado en la cabecera y lo de abajo
 * toca el borde del panel. La Cartera y Metas y Eventos están bien: un solo contenedor, la cabecera
 * a todo el ancho y separada por una línea, y el contenido con aire a los costados.
 * Qué hace, solo con CSS y sin tocar las vistas:
 *  - el panel es el único contenedor: sin relleno propio y con el degradado del color del módulo de
 *    fondo, que se desvanece hacia la bandeja (--gn-tray de js/gn-surface.js);
 *  - la cabecera pierde su caja (borde, esquinas y fondo) y queda a todo el ancho, con una línea abajo;
 *  - el resto del módulo (pestañas, filtros, listas) va con 24 px a cada lado (12 px en el celular).
 * Cada regla depende de la clase o el id que pone la vista al montarse: si una vista no carga, su
 * panel queda como estaba. Vuelta atrás: sacar este archivo de js/modules.json.
 * Se carga por js/modules.json, después de gn-frame.js (DEC-035). Sin pedidos ni almacenamiento.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var LOG = '[GNShell]';
  var SIDE = 24, SIDE_M = 12, TINT = 12, FADE = 300;
  // panel: selector del panel con la vista montada · head: lo que la vista inserta arriba ·
  // hero: su caja de cabecera · mod: color del módulo (el de la Bienvenida).
  var SHELLS = [
    { id: 'raids', panel: '#raidTrackerPanel.rv-on', head: '#rvRoot', hero: '.rv-hero', mod: 'var(--gn-mod,#F47C7C)', hex: '#F47C7C' },
    { id: 'inventory', panel: '#inventoryPanel.iv-on', head: '#ivRoot', hero: '.iv-hero', mod: 'var(--gn-mod,#7EC3FF)', hex: '#7EC3FF' },
    { id: 'activities', panel: '#activitiesPanel.av-on', head: '#avRoot', hero: '.av-hero', mod: 'var(--gn-mod,#3CC48A)', hex: '#3CC48A' },
    { id: 'achievements', panel: '#achievementsPanel.achx-on', head: '#achxHead', hero: '.achx-hero', mod: '#E8A33D', hex: '#E8A33D' },
    { id: 'wv', panel: '#wvPanel', head: '#wvxHead', hero: '.wvx-hero', mod: '#4FC3D9', hex: '#4FC3D9' }
  ];

  // ------------------------------------------------------------------ CSS (puro)
  function shellCSS(s) {
    var P = s.panel, H = P + ' ' + s.head;
    return [
      // un solo contenedor: el panel, con el degradado del módulo de fondo
      P + '{padding:0 0 22px;background:linear-gradient(180deg,color-mix(in srgb,' + s.mod + ' ' + TINT + '%,transparent),transparent ' + FADE + 'px),var(--gn-tray,var(--bg-1))}',
      // la cabecera, sin caja: a todo el ancho y con una línea abajo
      P + ' ' + s.hero + '{border:0;border-bottom:1px solid var(--bd-1);border-radius:0;background:none;box-shadow:none;padding:20px ' + SIDE + 'px 18px}',
      H + '{margin:0 0 12px}',
      // el resto, con aire a los costados
      P + '>:not(' + s.head + '),' + H + '>:not(' + s.hero + '){margin-left:' + SIDE + 'px;margin-right:' + SIDE + 'px}'
    ];
  }

  function mobileCSS(s) {
    var P = s.panel, H = P + ' ' + s.head;
    return P + ' ' + s.hero + '{padding:14px ' + SIDE_M + 'px 12px}' +
      P + '>:not(' + s.head + '),' + H + '>:not(' + s.hero + '){margin-left:' + SIDE_M + 'px;margin-right:' + SIDE_M + 'px}';
  }

  function buildCSS(list) {
    var out = [];
    (list || SHELLS).forEach(function (s) { out = out.concat(shellCSS(s)); });
    out.push('@media (max-width:900px){' + (list || SHELLS).map(mobileCSS).join('') + '}');
    return out.join('\n');
  }

  var CSS = buildCSS(SHELLS);

  // ------------------------------------------------------------------ DOM
  var doc = root.document;

  function inject() {
    if (!doc || !doc.createElement || !doc.head || (doc.getElementById && doc.getElementById('gn-shell-css'))) return false;
    var s = doc.createElement('style');
    s.id = 'gn-shell-css';
    s.textContent = CSS;
    doc.head.appendChild(s);
    return true;
  }

  root.GNShell = {
    version: VERSION,
    _pure: { SHELLS: SHELLS, SIDE: SIDE, SIDE_M: SIDE_M, TINT: TINT, FADE: FADE, shellCSS: shellCSS, buildCSS: buildCSS, CSS: CSS }
  };

  if (doc && doc.readyState === 'loading' && doc.addEventListener) doc.addEventListener('DOMContentLoaded', inject);
  else inject();
  if (root.console && root.console.info) root.console.info(LOG, 'ready v' + VERSION);
})(typeof window !== 'undefined' ? window : this);
