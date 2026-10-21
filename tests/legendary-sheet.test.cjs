// Armería: la legendaria se abre en una ficha de pantalla completa (BL-047).
// Corre con: node --test tests/*.test.cjs
// Prueba el cableado en js/legendary-tracker.js: diálogo grande, cabecera con la ficha,
// respaldo del catálogo para ícono y nombre, y que "Tengo" siga siendo stockMap().
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'legendary-tracker.js'), 'utf8');

function extract(name) {
  const start = SRC.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'no está la función ' + name);
  let i = SRC.indexOf('{', start);
  let depth = 0;
  for (; i < SRC.length; i++) {
    if (SRC[i] === '{') depth++;
    else if (SRC[i] === '}') { depth--; if (depth === 0) break; }
  }
  return SRC.slice(start, i + 1);
}

// Arma infoPieza / metaCabecera con un catálogo y un ItemIcons de mentira.
function helpers(root) {
  const code = 'var _catPorId = null;\n' + extract('itemDelCatalogo') + '\n' + extract('infoPieza') + '\n' +
    extract('metaCabecera') + '\nreturn { infoPieza: infoPieza, metaCabecera: metaCabecera };';
  return new Function('root', code)(root);
}

const CAT = { items: [
  { id: 30684, name: 'Frostfang', nameEs: 'Colmilloescarcha', icon: 'ff.png', type: 'weapon', expansion: 'Core', generation: 1 },
  { id: 96937, name: 'Klobjarne Geirr', nameEs: 'Klobjarne Geirr', icon: 'kg.png', type: 'weapon', expansion: 'PoF', generation: 2 }
] };
const CUI = { TYPE_LABELS: { weapon: 'Arma' }, expansionReal: (it) => (it.id === 96937 ? 'JW' : it.expansion) };

test('ficha: el diálogo ocupa casi toda la pantalla (antes 680 px)', () => {
  assert.doesNotMatch(SRC, /max-width: 680px/);
  assert.match(SRC, /class="modal__dialog lt-sheet-dialog" style="width:min\(1320px,96vw\);max-width:min\(1320px,96vw\);' \+\s*'height:94vh;max-height:94vh;"/);
});

test('ficha: el cuerpo es la ficha, con "Tengo" = stockMap() y la vista elegida', () => {
  assert.match(SRC, /UI\.renderSheetHTML\(res, stockMap\(\), opts\)/);
  assert.match(SRC, /vista: vistaModal,/);
  assert.match(SRC, /titleEl\.innerHTML = UI\.renderHeroHTML\(metaCabecera\(id\), esc\)/);
  // Con la ficha, la cabecera solo tiene la cola: Receta y Totales están juntos.
  assert.match(SRC, /actions\.innerHTML = \(UI\.renderSheetHTML \? '' :/);
  assert.match(SRC, /data-lt-queue=/);
});

test('ficha: sin datos de la API, ícono y nombre en español salen del catálogo', () => {
  const h = helpers({ LegendaryCatalog: CAT, ItemIcons: { de: () => ({ icon: null, name: null, color: null }) } });
  assert.deepEqual(h.infoPieza(30684), { icon: 'ff.png', name: 'Colmilloescarcha', color: '#974EFF', rarity: null });
  // Lo que trae la API gana.
  const h2 = helpers({ LegendaryCatalog: CAT, ItemIcons: { de: () => ({ icon: 'api.png', name: 'API', color: '#123456', rarity: 'Legendario' }) } });
  assert.equal(h2.infoPieza(30684).icon, 'api.png');
  assert.equal(h2.infoPieza(30684).name, 'API');
  // Un material que no está en el catálogo queda como lo dice la API.
  assert.deepEqual(h2.infoPieza(19721), { icon: 'api.png', name: 'API', color: '#123456', rarity: 'Legendario' });
  // Sin ItemIcons y fuera del catálogo: null (el árbol dibuja sin ícono).
  assert.equal(helpers({ LegendaryCatalog: CAT }).infoPieza(1), null);
});

test('ficha: la cabecera lleva tipo, expansión real y generación', () => {
  const h = helpers({ LegendaryCatalog: CAT, LegendaryCatalogUI: CUI });
  assert.deepEqual(h.metaCabecera(96937), { name: 'Klobjarne Geirr', icon: 'kg.png', color: '#974EFF', tipo: 'Arma', expansion: 'JW', generation: 2 });
  assert.equal(h.metaCabecera(30684).expansion, 'Core');
});
