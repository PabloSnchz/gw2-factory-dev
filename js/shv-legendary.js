/*!
 * js/shv-legendary.js — Lo que noto de tu legendaria (BL-059 SHV-3, nivel N4 de DEC-033)
 * Versión: 1.0.0 (2026-10-27) · SHV-3a: solo la cuenta, sin pantalla. Todavía no está en js/modules.json:
 *          la conecta SHV-3b, en «Mi cola» y con mi globo (js/shv-bubble.js).
 *
 * Propuesta aprobada por Pablo (2026-10-27 04:00Z): docs/propuestas/propuesta-shiruvana-shv3.html.
 *   D1 hablo de la primera legendaria de «Mi cola»; sin cola no digo nada.
 *   D2 árbol completo (LegendaryTree.build) si los precursores ya están cargados; si no, la receta directa
 *      (LegendaryTracker.computeMaterials) y lo digo. No obligo a bajar los 268 KB de precursores.
 *   D3 el precio es el de venta del Bazar: lo que pagás comprando al instante.
 *   D4 el ritmo («a tu ritmo, ~Y días») queda para SHV-3c, con 7 días de memoria o más.
 *   D5 lo que no se vende va aparte y no suma oro.
 *
 * Todo es puro: recibe lo que ya calcularon la Armería y el Bazar y devuelve números u observaciones con el
 * formato común de js/shv-core.js. No lee el DOM, no guarda nada y no llama a la API.
 */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';

  function num(v) { var n = Number(v); return isFinite(n) && n > 0 ? n : 0; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  // Precio de venta en cobre. Acepta el número solo, {sell} o la forma de /v2/commerce/prices
  // ({sells:{unit_price}}). Sin vendedores (unit_price 0) es como si no se vendiera.
  function priceOf(prices, id) {
    if (!prices) return 0;
    var p = prices[id];
    if (p == null) return 0;
    if (typeof p === 'number') return num(p);
    if (typeof p === 'object') {
      if (p.sells && typeof p.sells === 'object') return num(p.sells.unit_price);
      return num(p.sell);
    }
    return 0;
  }

  // De qué cuento: del árbol (materiales base) si está, o de la receta directa.
  function rowsOf(input) {
    var t = input.tree;
    if (t && !t.needsPrecursors && t.status === 'recipe' && t.totals && Array.isArray(t.totals.rows) && t.totals.rows.length) {
      return { base: 'tree', rows: t.totals.rows, vendor: t.totals.vendor || [],
        unknown: (t.totals.sinId || []).length + (t.totals.unknown || []).length };
    }
    var r = input.recipe;
    if (r && r.status === 'recipe' && Array.isArray(r.rows) && r.rows.length) {
      return { base: 'recipe', rows: r.rows, vendor: [], unknown: 0 };
    }
    return null;
  }

  /**
   * Cuánto falta para una legendaria (puro).
   * input: { item:{id,name}, tree: LegendaryTree.build(id) | null, recipe: computeMaterials(id) | null,
   *          stock: {itemId: cantidad} (banco + materiales + personajes), prices: {itemId: precio} | null }
   * Devuelve null si no hay de qué contar.
   */
  function estimate(input) {
    if (!input || !input.item || !input.item.id) return null;
    var src = rowsOf(input);
    if (!src) return null;
    var stock = input.stock || {}, priced = !!input.prices;
    var acc = {}, order = [];
    src.rows.forEach(function (r) {
      var id = Number(r && r.itemId);
      if (!id) return;
      if (!acc[id]) { acc[id] = { itemId: id, name: r.name || ('#' + id), need: 0 }; order.push(id); }
      acc[id].need += num(r.need);
    });
    var out = {
      itemId: Number(input.item.id), name: String(input.item.name || ('#' + input.item.id)), base: src.base,
      total: 0, missingKinds: 0, missingUnits: 0, gold: 0, buyable: 0, untradeable: 0, untradeableNames: [],
      vendor: 0, unknown: src.unknown, priced: priced
    };
    order.forEach(function (id) {
      var row = acc[id];
      if (!(row.need > 0)) return;
      out.total++;
      var miss = Math.max(0, row.need - num(stock[id]));
      if (!miss) return;
      out.missingKinds++;
      out.missingUnits += miss;
      var p = priceOf(input.prices, id);
      if (p > 0) { out.buyable++; out.gold += miss * p; }
      else if (priced) { out.untradeable++; out.untradeableNames.push(row.name); }
    });
    var seen = {};
    src.vendor.forEach(function (v) { var id = Number(v && v.id); if (id && !seen[id]) { seen[id] = 1; out.vendor++; } });
    return out;
  }

  // 1234567 de cobre -> «123»; 1.234 con punto de miles. Menos de 1 oro se dice así.
  function goldText(copper) {
    var g = Math.round(num(copper) / 10000);
    if (g < 1) return 'menos de 1 oro';
    return '~' + String(g).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' oro';
  }

  /** Observaciones con el formato de js/shv-core.js (a lo sumo una). opts: { at } = cuándo se leyó. */
  function observe(input, opts) {
    opts = opts || {};
    var e = estimate(input);
    if (!e || !e.total) return [];
    var tree = e.base === 'tree', text = [];
    if (!e.missingKinds) {
      text.push(tree ? 'Para ' + e.name + ' ya tenés todos los materiales base: lo que queda es fabricar.' :
        'Para ' + e.name + ' ya tenés todo lo de la receta directa.');
    } else {
      var falta = e.missingKinds === 1 ? 'te falta ' : 'te faltan ';
      text.push(tree ? 'Para ' + e.name + ' ' + falta + plural(e.missingKinds, 'material base', 'materiales base') + ' (de ' + e.total + ').' :
        'Para ' + e.name + ' ' + falta + e.missingKinds + ' de los ' + e.total + ' ingredientes de la receta directa' +
        ' (cuando abras su árbol, te cuento los materiales base).');
      if (e.buyable) text.push('Comprando lo que se vende: ' + goldText(e.gold) + ' al precio del Bazar.');
      if (e.untradeable) text.push(plural(e.untradeable, 'no se vende', 'no se venden') + ': ' +
        (e.untradeable === 1 ? 'se fabrica o se consigue' : 'se fabrican o se consiguen') + ' jugando.');
    }
    var src = 'tu inventario (banco, materiales y personajes) y ' + (tree ? 'el árbol de fabricación' : 'la receta de la Armería') +
      (e.priced ? ', con los precios del Bazar' : '');
    return [{
      module: 'legendary', id: 'falta:' + e.itemId, priority: 'media',
      kind: e.missingKinds ? 'explica' : 'saluda', text: text,
      action: { label: 'Ver qué me falta', act: 'legendary-open:' + e.itemId },
      basis: { source: src, at: typeof opts.at === 'number' ? opts.at : null }
    }];
  }

  root.ShvLegendary = { version: VERSION, estimate: estimate, observe: observe, priceOf: priceOf, goldText: goldText };
})(typeof window !== 'undefined' ? window : globalThis);
