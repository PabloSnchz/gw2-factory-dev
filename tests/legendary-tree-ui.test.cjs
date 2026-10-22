// Armería: árbol de receta y Materiales totales con el diseño que aprobó Pablo (BL-047).
// Corre con: node --test tests/*.test.cjs
// Prueba las funciones puras renderTreeHTML y renderTotalsHTML con un árbol de ejemplo
// armado igual que lo devuelve legendary-tree.js build() (count ya multiplicado).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const UI = require(path.join(__dirname, '..', 'js', 'legendary-tree-ui.js'));

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => '&#' + m.charCodeAt(0) + ';');
const leaf = (id, name, count, kind, level) => ({ id, name, count, kind, status: kind, level, isLeaf: true, note: null, children: [] });

function ejemplo() {
  const cara = { id: 30, name: 'Faz de Chuka', count: 1, kind: 'recipe', status: 'recipe', level: 3, isLeaf: false, note: null,
    children: [leaf(31, 'Lingote de mithril', 250, 'material', 4), leaf(32, 'Pegote de ectoplasma', 1000, 'material', 4)] };
  const tigris = { id: 20, name: 'Tigris', count: 1, kind: 'recipe', status: 'recipe', level: 2, isLeaf: false, note: null,
    children: [leaf(21, 'Espíritu del Tigre', 1, 'material', 3), cara] };
  const gloria = { id: 40, name: 'Don de gloria', count: 1, kind: 'vendor', status: 'vendor', level: 2, isLeaf: true, note: null, children: [] };
  const root = { id: 10, name: 'Chuka and Champawat', count: 1, kind: 'recipe', status: 'recipe', level: 1, isLeaf: false, note: null,
    children: [tigris, gloria] };
  return {
    needsPrecursors: false, status: 'recipe', node: root,
    totals: { rows: [
      { itemId: 21, name: 'Espíritu del Tigre', need: 1 },
      { itemId: 31, name: 'Lingote de mithril', need: 250 },
      { itemId: 32, name: 'Pegote de ectoplasma', need: 2400 }
    ], vendor: [{ id: 40 }], sinId: [], unknown: [] }
  };
}
const de = (id) => ({ 10: { name: 'Chuka y Champawat', icon: 'i10.png', color: '#974EFF' }, 31: { name: 'Lingote de mithril', icon: 'i31.png' } })[id] || null;

test('árbol: leyenda arriba y columnas Pieza / Cantidad / Origen con título', () => {
  const h = UI.renderTreeHTML(ejemplo(), { esc, de });
  const leyenda = h.indexOf('class="lt-legend"');
  const arbol = h.indexOf('class="lt-tree"');
  assert.ok(leyenda > 0 && leyenda < arbol, 'la leyenda va antes del árbol');
  assert.match(h, /<div class="lt-cols"[^>]*><span>Pieza<\/span><span>Cantidad<\/span><span>Origen<\/span><\/div>/);
  assert.match(h, /se fabrica; adentro hay N piezas/);
});

test('árbol: íconos de 32 px en la raíz, 28 en el primer nivel y 24 más abajo', () => {
  const de2 = (id) => ({ name: 'n' + id, icon: 'i' + id + '.png' });
  const h = UI.renderTreeHTML(ejemplo(), { esc, de: de2, abiertos: { 30: true } });
  assert.match(h, /src="i10\.png" alt="" width="32" height="32"/);
  assert.match(h, /src="i20\.png" alt="" width="28" height="28"/);
  assert.match(h, /src="i21\.png" alt="" width="24" height="24"/);
  assert.match(h, /src="i31\.png" alt="" width="24" height="24"/);
  assert.doesNotMatch(h, /width="14"/);
  assert.match(h, /class="lt-node lt-node--root"/);
  assert.match(h, /class="lt-node lt-node--lvl1"/);
});

test('árbol: el origen siempre tiene texto — Material, Se compra, Receta · N (antes "+N")', () => {
  const h = UI.renderTreeHTML(ejemplo(), { esc, de });
  assert.match(h, /lt-chip--craft">Receta · 6<\/span>/, 'raíz: 6 piezas adentro');
  assert.match(h, /lt-chip--craft">Receta · 2<\/span>/, 'Faz de Chuka cerrada: 2 piezas adentro');
  const arbol = h.slice(h.indexOf('class="lt-tree"'));   // sin la leyenda, que también muestra los chips
  assert.match(arbol, /lt-chip--base">Material<\/span>/);
  assert.match(arbol, /lt-chip--buy">Se compra<\/span>/);
  assert.doesNotMatch(h, />\+\d+<\/span>/, 'no queda el "+N" sin título');
});

test('árbol: cantidad con "u." y punto de miles; 1 queda liviano', () => {
  const h = UI.renderTreeHTML(ejemplo(), { esc, de, abiertos: { 30: true } });
  assert.match(h, /<div class="lt-qty">1\.000 <small>u\.<\/small><\/div>/);
  assert.match(h, /<div class="lt-qty">250 <small>u\.<\/small><\/div>/);
  assert.match(h, /<div class="lt-qty lt-qty--one">1<\/div>/);
  assert.equal(UI._num(1234567), '1.234.567');
  assert.equal(UI._num(999), '999');
});

test('árbol: nombre en español del resolvedor y el chevron es un botón con aria-expanded', () => {
  const h = UI.renderTreeHTML(ejemplo(), { esc, de });
  assert.match(h, /title="Chuka y Champawat">Chuka y Champawat<\/span>/);
  assert.doesNotMatch(h, /Chuka and Champawat/);
  assert.match(h, /<button type="button" class="lt-chev" data-lt-toggle="10" aria-expanded="true" aria-label="Cerrar Chuka y Champawat">▾<\/button>/);
  assert.match(h, /<button type="button" class="lt-chev" data-lt-toggle="30" aria-expanded="false" aria-label="Abrir Faz de Chuka">▸<\/button>/);
  // La fila entera también abre con el mouse (el tracker busca data-lt-toggle hacia arriba).
  assert.match(h, /<div class="lt-node" data-lt-toggle="30">/);
  // Nivel 3 cerrado por defecto: sus hijos no se pintan.
  assert.doesNotMatch(h, /Lingote de mithril/);
  const abierto = UI.renderTreeHTML(ejemplo(), { esc, de, abiertos: { 30: true } });
  assert.match(abierto, /Lingote de mithril/);
  // Un nivel 2 cerrado a mano se cierra (el valor explícito gana).
  const cerrado = UI.renderTreeHTML(ejemplo(), { esc, de, abiertos: { 20: false } });
  assert.doesNotMatch(cerrado, /Espíritu del Tigre/);
});

test('árbol: se mantienen el estado "cargando", el error y lo que no entra en la cuenta', () => {
  const p = UI.renderTreeHTML({ needsPrecursors: true, node: null, totals: {} }, { esc });
  assert.match(p, /data-lt-pending="1"/);
  assert.match(p, /data-lt-retry="1"/);
  assert.match(UI.renderTreeHTML(null, { esc }), /No se pudo construir el árbol/);
  assert.match(UI.renderTreeHTML(ejemplo(), { esc }), /No entra en el total: 1 pieza\(s\) que se compran a un NPC/);
  assert.match(UI.renderTreeHTML(ejemplo(), { esc }), /data-lt-tree="1"/);
});

test('totales: Tengo / Necesito / Falta con barra, "✓ 0" y "Completo: X de Y"', () => {
  const h = UI.renderTotalsHTML(ejemplo(), { 21: 3, 31: 100 }, { esc, de });
  assert.match(h, /<th scope="col">Material<\/th><th scope="col">Tengo<\/th><th scope="col">Necesito<\/th><th scope="col">Falta<\/th>/);
  // Espíritu: tengo 3 de 1 → completo.
  assert.match(h, /aria-valuenow="100"><i style="width:100%"><\/i><\/div><\/td><td>3<\/td><td>1<\/td><td class="lt-done">✓ 0<\/td>/);
  // Mithril: 100 de 250 → 40 %, faltan 150, parcial.
  assert.match(h, /aria-valuenow="40"><i style="width:40%"><\/i><\/div><\/td><td>100<\/td><td>250<\/td><td class="lt-part">150<\/td>/);
  // Ecto: 0 de 2.400 → falta todo.
  assert.match(h, /aria-valuenow="0"><i style="width:0%"><\/i><\/div><\/td><td>0<\/td><td>2\.400<\/td><td class="lt-miss">2\.400<\/td>/);
  assert.match(h, /Completo: <strong>1<\/strong> de 3 materiales/);
  assert.match(h, /Faltan <strong>2\.550<\/strong> unidades/);
  assert.match(h, /src="i31\.png" alt="" width="20" height="20"/);
});

test('totales: sin inventario todo falta; sin filas lo dice; cargando delega al árbol', () => {
  const h = UI.renderTotalsHTML(ejemplo(), null, { esc });
  assert.match(h, /Completo: <strong>0<\/strong> de 3 materiales/);
  assert.match(UI.renderTotalsHTML({ totals: { rows: [] } }, {}, { esc }), /no tiene materiales base/);
  assert.match(UI.renderTotalsHTML({ needsPrecursors: true }, {}, { esc }), /data-lt-retry="1"/);
});

test('estilos: con variables del theme, foco visible y sin depender solo del color', () => {
  assert.match(UI.CSS, /\.lt-chev:focus-visible\{outline:2px solid/);
  assert.match(UI.CSS, /var\(--color-green/);
  assert.match(UI.CSS, /\.lt-tree ul\{[^}]*border-left:2px solid/, 'líneas guía');
  assert.doesNotMatch(UI.CSS, /color-mix/, 'sin color-mix: navegadores viejos perderían las líneas');
});

// ---- Ficha de pantalla completa (v2.1.0) ----------------------------------
test('ficha: cabecera grande con ícono de 64 px, nombre, tipo, expansión y generación', () => {
  const h = UI.renderHeroHTML({ name: 'Chuka y Champawat', icon: 'c.png', color: '#974EFF', tipo: 'Arma', expansion: 'HoT', generation: 2 }, esc);
  assert.match(h, /<img class="lt-hero__ic" src="c\.png" alt="" width="64" height="64">/);
  assert.match(h, /<h3 class="lt-hero__name" style="color:#974EFF;">Chuka y Champawat<\/h3>/);
  assert.match(h, /<span class="lt-tag">Arma<\/span><span class="lt-tag">Heart of Thorns<\/span><span class="lt-tag">Gen 2<\/span>/);
  assert.doesNotMatch(UI.renderHeroHTML({ name: 'X' }, esc), /<img/);
});

test('ficha: resumen en tarjetas y Receta y Materiales totales lado a lado', () => {
  const h = UI.renderSheetHTML(ejemplo(), { 21: 3, 31: 100 }, { esc, de });
  assert.match(h, /Piezas en la receta<\/div><div class="lt-stat__val">6</);
  assert.match(h, /Materiales base<\/div><div class="lt-stat__val">3</);
  assert.match(h, /Completos<\/div><div class="lt-stat__val">1 <small>de 3<\/small>/);
  assert.match(h, /aria-valuenow="33"/);
  assert.match(h, /Unidades que faltan<\/div><div class="lt-stat__val">2\.550</);
  assert.match(h, /Se compran a un NPC<\/div><div class="lt-stat__val">1 /);
  const arbol = h.indexOf('lt-pane--arbol'), totales = h.indexOf('lt-pane--totales');
  assert.ok(arbol > 0 && totales > arbol, 'las dos vistas están en la ficha, la receta primero');
  assert.match(h, /class="lt-tree"/);
  assert.match(h, /class="lt-tot"/);
  assert.match(h, /class="lt-sheet lt-sheet--arbol"/);
});

test('ficha: las pestañas (pantalla angosta) usan data-lt-view y marcan la activa', () => {
  const h = UI.renderSheetHTML(ejemplo(), {}, { esc, vista: 'totales' });
  assert.match(h, /data-lt-view="arbol" aria-pressed="false">Receta</);
  assert.match(h, /data-lt-view="totales" aria-pressed="true">Materiales totales</);
  assert.match(h, /class="lt-sheet lt-sheet--totales"/);
  assert.match(UI.CSS, /@media \(max-width:1000px\)\{[^\n]*\.lt-sheet--arbol \.lt-pane--totales/);
  assert.match(UI.CSS, /\.lt-sheet\{display:grid;grid-template-columns:minmax\(0,1\.45fr\) minmax\(380px,1fr\)/);
});

test('ficha: todo completo se ve en verde; cargando y error no inventan una ficha', () => {
  const h = UI.renderSheetHTML(ejemplo(), { 21: 1, 31: 250, 32: 2400 }, { esc });
  assert.match(h, /lt-stat lt-stat--ok"><div class="lt-stat__lbl">Completos/);
  assert.match(h, /Unidades que faltan<\/div><div class="lt-stat__val">✓ 0/);
  const p = UI.renderSheetHTML({ needsPrecursors: true, node: null, totals: {} }, {}, { esc });
  assert.match(p, /data-lt-retry="1"/);
  assert.doesNotMatch(p, /lt-stats/);
  assert.match(UI.renderSheetHTML(null, {}, { esc }), /No se pudo construir el árbol/);
});

// ---- La legendaria como pantalla (v2.2.0) ----------------------------------
test('pantalla: estilos de la ficha — Volver, cabecera grande y receta sin scroll interno', () => {
  assert.match(UI.CSS, /\.lt-back\{/);
  assert.match(UI.CSS, /\.lt-back:focus-visible/);
  assert.match(UI.CSS, /\.lt-ficha \.lt-hero__ic\{width:80px;height:80px\}/);
  assert.match(UI.CSS, /\.lt-ficha \.lt-pane--arbol \.lt-pane__body\{max-height:none;min-height:0;overflow:visible\}/);
  assert.match(UI.CSS, /\.lt-ficha \.lt-pane--totales\{position:sticky;top:16px\}/);
  // En pantallas angostas los totales dejan de ser fijos (si no, tapan la receta).
  assert.match(UI.CSS, /@media \(max-width:1000px\)\{[^\n]*\.lt-ficha \.lt-pane--totales\{position:static\}/);
});

test('pantalla: aviso de íconos — nada si están, "cargando" mientras llegan, "Reintentar" si fallan', () => {
  assert.equal(UI.renderIconStatusHTML({ estado: 'ok', con: 10, total: 10 }), '');
  assert.equal(UI.renderIconStatusHTML(null), '');
  assert.match(UI.renderIconStatusHTML({ estado: 'cargando' }), /lt-icons--cargando" role="status">Cargando íconos/);
  const f = UI.renderIconStatusHTML({ estado: 'fallo', con: 3, total: 1200 });
  assert.match(f, /No pude traer los íconos de la API de Guild Wars 2 \(3 de 1\.200\)/);
  assert.match(f, /<button type="button" data-lt-icons-retry="1">Reintentar<\/button>/);
  assert.match(f, /role="status"/);
});
