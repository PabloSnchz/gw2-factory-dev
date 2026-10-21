/**
 * legendary-tree-ui.js — el árbol de fabricación y los totales, pintados.
 * v2.0.0 (2026-10-21) - Diseño aprobado por Pablo (BL-047): íconos de 24 px
 *   (raíz 32, primer nivel 28), líneas guía, columnas Pieza / Cantidad / Origen
 *   con título, chips "Material", "Se compra", "Receta · N" (antes "+N"),
 *   leyenda arriba del árbol, el chevron es un botón de verdad (teclado) y, en
 *   Materiales totales, barra de progreso por material, "✓ 0" cuando está
 *   completo y "Completo: X de Y materiales". Estilos en <style id="ltTreeStyle">
 *   con las variables del theme. tests/legendary-tree-ui.test.cjs.
 *
 * QUÉ ES Y QUÉ NO ES
 * El motor está en `legendary-tree.js` y este archivo NO calcula cantidades:
 * las pide ahí con `build()` y las muestra. Si este archivo hiciera aritmética
 * sería el segundo motor, y dos motores divergen sin que nadie lo note.
 * Las únicas cuentas de acá dependen del inventario del usuario, no de la
 * receta: `falta = max(0, necesito - tengo)` y el porcentaje de la barra.
 *
 * POR QUÉ ESTÁ SEPARADO DE `legendary-tracker.js`
 * El tracker tiene el catálogo, la cola, los filtros y el modal. El árbol es
 * una vista: el motor se prueba sin DOM y la UI se prueba sin API.
 *
 * LA CARGA PEREZOSA
 * `legendary-precursors.js` son 268 KB y la mayoría de quien abre la app nunca
 * abre un árbol. Se pide la PRIMERA vez que se abre un árbol. Si la carga
 * falla, `ensurePrecursors` responde `false` y la vista lo dice con un botón
 * "Reintentar": el control queda, no desaparece.
 *
 * POR QUÉ `esc` Y `de` VIENEN POR PARÁMETRO
 * `esc` ya tiene dos copias en el repo; el tracker pasa la suya. `de` (ícono,
 * nombre en español y color de rareza) lo inyecta el tracker, que es el único
 * que sabe de dónde salen. Sin `de`, se dibuja sin ícono y sin color.
 */
(function (root) {
  'use strict';

  var LOG = '[LegendaryTreeUI]';

  // ==========================================================================
  // 1. CARGA PEREZOSA DE LOS PRECURSORES
  // ==========================================================================

  var _cargando = false;
  var _listo = false;
  var _fallo = false;
  var _espera = [];

  function _resolver(ok) {
    var cola = _espera;
    _espera = [];
    for (var i = 0; i < cola.length; i++) {
      try { cola[i](ok); } catch (e) { /* un consumidor roto no corta al resto */ }
    }
  }

  // Callback con true si los precursores quedaron cargados, false si no.
  // Idempotente; un fallo no se reintenta solo (sería una tormenta de red),
  // lo reintenta el botón con `_resetCache()`.
  function ensurePrecursors(cb) {
    if (_listo || root.LegendaryPrecursors) { _listo = true; if (cb) cb(true); return; }
    if (_fallo) { if (cb) cb(false); return; }

    _espera.push(cb || function () {});
    // Dos clics rápidos: el segundo espera al primero, no baja 268 KB otra vez.
    if (_cargando) return;

    if (typeof document === 'undefined' || !document.head) {
      _cargando = false; _fallo = true; _resolver(false); return;
    }

    _cargando = true;
    var s = document.createElement('script');
    s.src = 'js/legendary-precursors.js?v=1.0.0';
    s.async = true;
    s.onload = function () {
      _cargando = false;
      if (root.LegendaryPrecursors) { _listo = true; _resolver(true); }
      else { _fallo = true; _resolver(false); }
    };
    s.onerror = function () { _cargando = false; _fallo = true; _resolver(false); };
    document.head.appendChild(s);
  }

  // Para los tests y el botón "Reintentar": olvidar lo que se sabe.
  function _resetCache() { _cargando = false; _listo = false; _fallo = false; _espera = []; }

  // ==========================================================================
  // 2. ESTADO DE EXPANSIÓN
  // ==========================================================================

  // Dos niveles abiertos de entrada: con uno se ven los 4 ingredientes de la
  // Forja y no se ve que cada uno es una subreceta.
  var NIVEL_ABIERTO_POR_DEFECTO = 2;

  // Un valor EXPLÍCITO gana siempre y se mira PRIMERO: si no, cerrar un nodo
  // de nivel 2 no tendría efecto.
  function _abierto(node, abiertos) {
    if (!node) return false;
    if (abiertos && Object.prototype.hasOwnProperty.call(abiertos, node.id)) {
      return !!abiertos[node.id];
    }
    if (!node.isLeaf && node.level <= NIVEL_ABIERTO_POR_DEFECTO) return true;
    return false;
  }

  // ==========================================================================
  // 3. ESTILOS (una sola vez, con las variables del theme)
  // ==========================================================================

  var CSS = [
    '.lt-tree-wrap{padding:12px 14px 16px}',
    '.lt-legend{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;font-size:.72rem;color:var(--tx-3,#8a91a8);padding:8px 10px;border:1px dashed var(--bd-1,rgba(255,255,255,.14));border-radius:10px;margin-bottom:12px}',
    '.lt-legend b{color:var(--tx-2,#b9bfd3);font-weight:600}',
    '.lt-cols,.lt-node{display:grid;grid-template-columns:minmax(0,1fr) 86px 118px;gap:10px;align-items:center}',
    '.lt-cols{font-size:.68rem;color:var(--tx-3,#8a91a8);text-transform:uppercase;letter-spacing:.04em;padding:0 10px 6px;border-bottom:1px solid var(--bd-1,rgba(255,255,255,.1));margin-bottom:4px}',
    '.lt-cols span:nth-child(n+2){text-align:right}',
    '.lt-tree,.lt-tree ul{list-style:none;margin:0;padding:0}',
    '.lt-tree ul{margin-left:22px;padding-left:12px;border-left:2px solid rgba(155,123,255,.28)}',
    '.lt-node{position:relative;padding:7px 10px;border-radius:9px;margin:3px 0}',
    '.lt-tree ul .lt-node::before{content:"";position:absolute;left:-14px;top:50%;width:12px;border-top:2px solid rgba(155,123,255,.28)}',
    '.lt-node[data-lt-toggle]{cursor:pointer}',
    '.lt-node:hover{background:var(--bg-2,rgba(255,255,255,.04))}',
    '.lt-node--root{background:linear-gradient(90deg,rgba(151,78,255,.18),transparent);border:1px solid rgba(151,78,255,.35)}',
    '.lt-node--lvl1{background:var(--bg-2,rgba(255,255,255,.04));border:1px solid var(--bd-1,rgba(255,255,255,.1))}',
    '.lt-name{display:flex;align-items:center;gap:9px;min-width:0}',
    '.lt-chev{width:22px;height:22px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:5px;background:none;color:var(--tx-3,#8a91a8);font-size:.75rem;cursor:pointer}',
    '.lt-chev:focus-visible{outline:2px solid var(--accent,#9b7bff);outline-offset:1px}',
    '.lt-chev--none{cursor:default}',
    '.lt-ic{flex-shrink:0;border-radius:5px;box-shadow:0 0 0 1px rgba(255,255,255,.08)}',
    '.lt-nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.8rem}',
    '.lt-node--root .lt-nm{font-weight:700;font-size:.95rem}',
    '.lt-node--lvl1 .lt-nm{font-weight:600}',
    '.lt-qty{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;font-size:.8rem}',
    '.lt-qty small{color:var(--tx-3,#8a91a8);font-weight:400}',
    '.lt-qty--one{color:var(--tx-3,#8a91a8);font-weight:400}',
    '.lt-orig{display:flex;justify-content:flex-end}',
    '.lt-chip{font-size:.7rem;padding:3px 9px;border-radius:999px;white-space:nowrap;border:1px solid}',
    '.lt-chip--base{color:var(--color-blue,#6fb3e8);border-color:rgba(111,179,232,.4);background:rgba(111,179,232,.08)}',
    '.lt-chip--buy{color:var(--color-amber,#e2b45a);border-color:rgba(226,180,90,.4);background:rgba(226,180,90,.08)}',
    '.lt-chip--craft{color:var(--accent,#9b7bff);border-color:rgba(155,123,255,.4);background:rgba(155,123,255,.08)}',
    '.lt-chip--other{color:var(--tx-3,#8a91a8);border-color:var(--bd-1,rgba(255,255,255,.14))}',
    '.lt-note{font-size:.66rem;color:var(--tx-3,#8a91a8);padding:0 10px 4px 41px}',
    '.lt-foot{font-size:.68rem;color:var(--tx-3,#8a91a8);margin-top:8px}',
    '.lt-foot:first-of-type{margin-top:12px;padding-top:9px;border-top:1px solid var(--bd-1,rgba(255,255,255,.08))}',
    '.lt-tot{width:100%;border-collapse:collapse;font-size:.8rem}',
    '.lt-tot th{font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--tx-3,#8a91a8);text-align:right;padding:6px 8px;border-bottom:1px solid var(--bd-1,rgba(255,255,255,.1));font-weight:600}',
    '.lt-tot th:first-child{text-align:left}',
    '.lt-tot td{padding:7px 8px;text-align:right;font-variant-numeric:tabular-nums;border-bottom:1px solid rgba(255,255,255,.04)}',
    '.lt-tot td:first-child{text-align:left;max-width:0;width:100%}',
    '.lt-mat{display:flex;align-items:center;gap:8px;min-width:0}',
    '.lt-mat span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.lt-bar{height:4px;border-radius:3px;background:var(--bd-1,rgba(255,255,255,.1));margin-top:4px;overflow:hidden}',
    '.lt-bar i{display:block;height:100%;background:var(--color-green,#5fd39a)}',
    '.lt-done{color:var(--color-green,#5fd39a)}',
    '.lt-part{color:var(--color-amber,#e2b45a);font-weight:600}',
    '.lt-miss{color:var(--color-red,#e0855c);font-weight:600}',
    '.lt-sum{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-top:10px;font-size:.78rem;color:var(--tx-3,#8a91a8)}',
    '.lt-sum strong{color:var(--tx-1,#eceef5)}'
  ].join('\n');

  function _ensureStyle() {
    if (typeof document === 'undefined' || !document.head || !document.getElementById) return;
    if (document.getElementById('ltTreeStyle')) return;
    var st = document.createElement('style');
    st.id = 'ltTreeStyle';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // ==========================================================================
  // 4. PIEZAS
  // ==========================================================================

  // Miles con punto, como se lee en castellano: 1.000, 2.400. Fijo y no
  // toLocaleString, para que el mismo número se vea igual en todos lados.
  function _num(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function _descendientes(node) {
    var n = 0;
    (function walk(x) {
      (x.children || []).forEach(function (c) { n++; walk(c); });
    })(node);
    return n;
  }

  // El origen de la pieza: SIEMPRE con texto, nunca solo color.
  function _chip(node) {
    var k = node.kind;
    if (k === 'material') return '<span class="lt-chip lt-chip--base">Material</span>';
    if (k === 'vendor') return '<span class="lt-chip lt-chip--buy">Se compra</span>';
    if (k === 'recipe' || k === 'root') {
      var d = _descendientes(node);
      return '<span class="lt-chip lt-chip--craft">' + (d ? 'Receta · ' + _num(d) : 'Receta') + '</span>';
    }
    var otro = { no_recipe: 'Sin receta', placeholder: 'Marcador', unknown: 'Desconocido', sinId: 'Sin id' }[k];
    return otro ? '<span class="lt-chip lt-chip--other">' + otro + '</span>' : '';
  }

  function _tamIcono(profundidad) { return profundidad === 0 ? 32 : (profundidad === 1 ? 28 : 24); }

  function _nodo(node, abiertos, esc, profundidad, de) {
    var abierto = _abierto(node, abiertos);
    var tieneHijos = !node.isLeaf && node.children && node.children.length;
    var info = de ? de(node.id) : null;
    // Primero el nombre de la API (español); el de la receta es inglés de origen.
    var nombre = (info && info.name) || node.name;
    var clase = 'lt-node' + (profundidad === 0 ? ' lt-node--root' : (profundidad === 1 ? ' lt-node--lvl1' : ''));
    var out = '<li>';

    // Toda la fila abre y cierra con el mouse; el teclado usa el botón del
    // chevron (un <button> de verdad: Enter y Espacio funcionan solos).
    out += '<div class="' + clase + '"' + (tieneHijos ? ' data-lt-toggle="' + node.id + '"' : '') + '>';
    out += '<div class="lt-name">';
    if (tieneHijos) {
      out += '<button type="button" class="lt-chev" data-lt-toggle="' + node.id + '" aria-expanded="' +
        (abierto ? 'true' : 'false') + '" aria-label="' + (abierto ? 'Cerrar ' : 'Abrir ') + esc(nombre) + '">' +
        (abierto ? '▾' : '▸') + '</button>';
    } else {
      out += '<span class="lt-chev lt-chev--none" aria-hidden="true"></span>';
    }
    var t = _tamIcono(profundidad);
    if (info && info.icon) {
      out += '<img class="lt-ic" src="' + esc(info.icon) + '" alt="" width="' + t + '" height="' + t +
        '" loading="lazy" style="width:' + t + 'px;height:' + t + 'px;">';
    }
    out += '<span class="lt-nm" style="color:' + ((info && info.color) || 'var(--tx-1)') + ';" title="' +
      esc(nombre) + '">' + esc(nombre) + '</span>';
    out += '</div>';

    var c = Number(node.count) || 0;
    out += c > 1
      ? '<div class="lt-qty">' + _num(c) + ' <small>u.</small></div>'
      : '<div class="lt-qty lt-qty--one">' + _num(c) + '</div>';
    out += '<div class="lt-orig">' + _chip(node) + '</div>';
    out += '</div>';

    if (node.note) out += '<div class="lt-note">' + esc(node.note) + '</div>';

    if (tieneHijos && abierto) {
      out += '<ul>';
      for (var i = 0; i < node.children.length; i++) {
        out += _nodo(node.children[i], abiertos, esc, profundidad + 1, de);
      }
      out += '</ul>';
    }
    return out + '</li>';
  }

  var LEYENDA = '<div class="lt-legend">' +
    '<span><b>Cantidad</b>: cuántas hacen falta de esa pieza</span>' +
    '<span><span class="lt-chip lt-chip--base">Material</span> se junta o se compra en el bazar</span>' +
    '<span><span class="lt-chip lt-chip--buy">Se compra</span> a un NPC</span>' +
    '<span><span class="lt-chip lt-chip--craft">Receta · N</span> se fabrica; adentro hay N piezas</span>' +
    '</div>';

  // ==========================================================================
  // 5. PINTAR EL ÁRBOL
  // ==========================================================================

  // Puro: recibe el resultado de build() y devuelve HTML. Sin API.
  function renderTreeHTML(res, opts) {
    opts = opts || {};
    var esc = opts.esc || function (s) { return String(s == null ? '' : s); };
    var abiertos = opts.abiertos || {};
    var de = opts.de || null;
    _ensureStyle();

    // EL ORDEN DE ESTAS DOS GUARDAS ES LO QUE IMPORTA: `needsPrecursors` es un
    // estado conocido ("cargando"), no un error. Y sin precursores NO se dibuja
    // un árbol de un nivel: se leería que la legendaria se hace con 4 cosas.
    if (res && res.needsPrecursors) {
      return '<div style="padding:16px;color:var(--tx-3);font-size:0.78rem;" data-lt-pending="1">' +
        '<div style="margin-bottom:8px;">Cargando las recetas completas…</div>' +
        '<button type="button" data-lt-retry="1" style="padding:6px 12px;border-radius:20px;' +
        'font-size:0.7rem;cursor:pointer;border:1px solid var(--bd-1);background:var(--bg-1);' +
        'color:var(--tx-2);">Reintentar</button></div>';
    }

    if (!res || !res.node) {
      return '<div style="padding:16px;color:var(--tx-3);font-size:0.78rem;">' +
        'No se pudo construir el árbol de este item.</div>';
    }

    var html = '<div class="lt-tree-wrap lt-arbol" data-lt-tree="1">' + LEYENDA +
      '<div class="lt-cols" aria-hidden="true"><span>Pieza</span><span>Cantidad</span><span>Origen</span></div>' +
      '<ul class="lt-tree">' + _nodo(res.node, abiertos, esc, 0, de) + '</ul>';

    // Lo que NO entra en la cuenta, dicho: si desaparece, nadie puede reportarlo.
    var t = res.totals || {};
    if (t.vendor && t.vendor.length) {
      html += '<div class="lt-foot">No entra en el total: ' + t.vendor.length + ' pieza(s) que se compran a un NPC.</div>';
    }
    if (t.sinId && t.sinId.length) {
      html += '<div class="lt-foot">No entra en el total: ' + t.sinId.length + ' ingrediente(s) sin id en la fuente, ' +
        'no se pueden contar contra tu inventario.</div>';
    }
    if (t.unknown && t.unknown.length) {
      html += '<div class="lt-foot">No entra en el total: ' + t.unknown.length + ' pieza(s) no están en el catálogo de recetas.</div>';
    }
    return html + '</div>';
  }

  // ==========================================================================
  // 6. PINTAR LOS TOTALES
  // ==========================================================================

  // Tengo / Necesito / Falta, con barra de progreso y resumen. "Tengo" es el
  // inventario de materiales que pasa el tracker (stockMap, BL-045).
  function renderTotalsHTML(res, owned, opts) {
    opts = opts || {};
    var esc = opts.esc || function (s) { return String(s == null ? '' : s); };
    owned = owned || {};

    if (res && res.needsPrecursors) return renderTreeHTML(res, opts);
    _ensureStyle();

    var rows = (res && res.totals && res.totals.rows) || [];
    if (!rows.length) {
      return '<div style="padding:16px;color:var(--tx-3);font-size:0.78rem;">' +
        'Este item no tiene materiales base que contar.</div>';
    }

    var h = '<div class="lt-tree-wrap">';
    h += '<table class="lt-tot"><thead><tr>' +
      '<th scope="col">Material</th><th scope="col">Tengo</th><th scope="col">Necesito</th><th scope="col">Falta</th>' +
      '</tr></thead><tbody>';

    var totF = 0, completos = 0;
    rows.forEach(function (r) {
      var tengo = Number(owned[r.itemId]) || 0;
      var necesito = Number(r.need) || 0;
      var falta = Math.max(0, necesito - tengo);
      var pct = necesito > 0 ? Math.min(100, Math.floor(tengo * 100 / necesito)) : 100;
      totF += falta;
      if (!falta) completos++;
      var info = opts.de ? opts.de(r.itemId) : null;
      var nombre = (info && info.name) || r.name;
      var cls = !falta ? 'lt-done' : (tengo > 0 ? 'lt-part' : 'lt-miss');
      h += '<tr><td title="' + esc(nombre) + '"><div class="lt-mat">' +
        (info && info.icon
          ? '<img class="lt-ic" src="' + esc(info.icon) + '" alt="" width="20" height="20" loading="lazy" style="width:20px;height:20px;">'
          : '') +
        '<span style="color:' + ((info && info.color) || 'var(--tx-1)') + ';">' + esc(nombre) + '</span></div>' +
        '<div class="lt-bar" role="progressbar" aria-label="' + esc(nombre) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<i style="width:' + pct + '%"></i></div></td>' +
        '<td>' + _num(tengo) + '</td>' +
        '<td>' + _num(necesito) + '</td>' +
        '<td class="' + cls + '">' + (falta ? _num(falta) : '✓ 0') + '</td></tr>';
    });

    h += '</tbody></table>';
    h += '<div class="lt-sum"><span>Completo: <strong>' + completos + '</strong> de ' + rows.length + ' materiales</span>' +
      '<span>Faltan <strong>' + _num(totF) + '</strong> unidades</span></div>';
    return h + '</div>';
  }

  // ==========================================================================
  // 7. API
  // ==========================================================================

  root.LegendaryTreeUI = {
    ensurePrecursors: ensurePrecursors,
    renderTreeHTML: renderTreeHTML,
    renderTotalsHTML: renderTotalsHTML,
    NIVEL_ABIERTO_POR_DEFECTO: NIVEL_ABIERTO_POR_DEFECTO,
    _resetCache: _resetCache,
    _num: _num,
    CSS: CSS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.LegendaryTreeUI;

})((typeof window !== 'undefined' ? window : globalThis));
