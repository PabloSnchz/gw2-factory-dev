// BL-082: sonda 9 de lectura: los tests de la Sidebar que fijan la lista de módulos. No modifica nada.
const fs = require('fs');
const L = fs.readFileSync('tests/sidebar-nav.test.cjs', 'utf8').split('\n');
['versión 2.2.6', 'arma la Sidebar: Inicio', 'mismos ids y data-view', 'celular: la hoja'].forEach((t) => {
  const i = L.findIndex((l) => l.includes(t));
  console.log('\n## ' + t + ' (línea ' + (i + 1) + ')');
  for (let j = i; j < Math.min(L.length, i + 30); j++) { console.log((j + 1) + ': ' + L[j].slice(0, 230)); if (j > i && /^\}\);/.test(L[j])) break; }
});
const H = fs.readFileSync('js/sidebar-nav.js', 'utf8').split('\n');
H.forEach((l, i) => { if (/var TABS|function groups|function mobileGroups|more\.length|7 destinos/.test(l)) console.log('sidebar ' + (i + 1) + ': ' + l.slice(0, 200)); });
