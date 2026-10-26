/*!
 * docs/herramientas/medir-almacenamiento.js — BL-074: mide el almacenamiento de la Bóveda en este navegador.
 * SOLO LEE: no escribe ni borra nada. Se corre desde la consola (F12) en la Bóveda:
 *   fetch('https://raw.githubusercontent.com/PabloSnchz/gw2-factory-dev/main/docs/herramientas/medir-almacenamiento.js').then(r => r.text()).then(eval)
 * Muestra: claves y caracteres de localStorage (y el % de ~5 M), las 15 más grandes por nombre (sin valores),
 * lo que guarda IndexedDB según GNIdb y el total del sitio que informa el navegador.
 */
(function () {
  var total = 0, rows = [], n = localStorage.length;
  for (var i = 0; i < n; i++) {
    var k = localStorage.key(i), v = localStorage.getItem(k) || '', c = k.length + v.length;
    total += c;
    rows.push({ clave: k, KB: Math.round(c * 2 / 102.4) / 10 });
  }
  rows.sort(function (a, b) { return b.KB - a.KB; });
  console.log('localStorage: ' + n + ' claves, ' + Math.round(total / 1000) + ' mil caracteres = ' + Math.round(total / 50000) + ' % de ~5 M');
  console.table(rows.slice(0, 15));
  if (window.GNIdb && GNIdb.stats) {
    var s = GNIdb.stats();
    console.log('IndexedDB (caché de la Bóveda): ' + s.keys + ' claves, ' + Math.round(s.chars / 1000) + ' mil caracteres; mudadas ' + s.migrated + ', restos borrados ' + (s.swept || 0) + (s.enabled ? '' : ' (IndexedDB no disponible)'));
  } else {
    console.log('Esta versión de la Bóveda todavía no usa IndexedDB (GNIdb no está).');
  }
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(function (e) { console.log('Todo el sitio, según el navegador: ' + Math.round(e.usage / 104857.6) / 10 + ' MB usados'); });
  }
})();
