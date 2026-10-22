// Armería: la legendaria se abre como PANTALLA dentro de la Armería (BL-047, BL-049).
// Corre con: node --test tests/*.test.cjs
// Prueba el cableado en js/legendary-tracker.js: pantalla en vez de diálogo, cabecera con
// la ficha, respaldo del catálogo para ícono y nombre, que "Tengo" siga siendo stockMap()
// y el camino de los íconos (árbol primero, respaldo directo a la API, aviso si fallan).
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

const COLORES = SRC.match(/var COLOR_RAREZA = \{[\s\S]*?\};/);

// Arma las funciones de íconos con un catálogo, un ItemIcons y un fetch de mentira.
function helpers(root, fetchFake) {
  const code = 'var _catPorId = null; var _iconosDirectos = {}; var LOG = "[t]";\n' + COLORES[0] + '\n' +
    ['itemDelCatalogo', 'infoPieza', 'metaCabecera', 'idsDelArbol', 'conIcono', 'traerDirecto'].map(extract).join('\n') +
    '\nreturn { infoPieza, metaCabecera, idsDelArbol, conIcono, traerDirecto };';
  return new Function('root', 'fetch', 'console', code)(root, fetchFake, { warn() {} });
}

const CAT = { items: [
  { id: 30684, name: 'Frostfang', nameEs: 'Colmilloescarcha', icon: 'ff.png', type: 'weapon', expansion: 'Core', generation: 1 },
  { id: 96937, name: 'Klobjarne Geirr', nameEs: 'Klobjarne Geirr', icon: 'kg.png', type: 'weapon', expansion: 'PoF', generation: 2 }
] };
const CUI = { TYPE_LABELS: { weapon: 'Arma' }, expansionReal: (it) => (it.id === 96937 ? 'JW' : it.expansion) };
const SIN_ICONOS = { de: () => ({ icon: null, name: null, color: null }) };

test('pantalla: la legendaria se abre dentro de la Armería, no en un diálogo (BL-049)', () => {
  assert.doesNotMatch(SRC, /modal__dialog/);
  assert.doesNotMatch(SRC, /ltItemModal/);
  assert.match(SRC, /host\.id = 'ltFicha';/);
  assert.match(SRC, /var body = \$\('#legendaryArmoryBody'\);[\s\S]{0,1500}body\.appendChild\(host\);/);
  assert.match(SRC, /<button type="button" class="lt-back" data-close="1">← Volver a la Armería<\/button>/);
  // El catálogo se oculta, no se destruye, y Escape vuelve.
  assert.match(SRC, /if \(content\) content\.hidden = true;/);
  assert.match(SRC, /if \(content\) content\.hidden = false;/);
  assert.match(SRC, /e\.key !== 'Escape'/);
});

test('pantalla: el cuerpo es la ficha, con "Tengo" = stockMap() y el aviso de íconos', () => {
  assert.match(SRC, /UI\.renderSheetHTML\(res, stockMap\(\), opts\)/);
  assert.match(SRC, /vista: vistaModal,/);
  assert.match(SRC, /titleEl\.innerHTML = UI\.renderHeroHTML\(metaCabecera\(id\), esc\)/);
  assert.match(SRC, /avisoIconos\.innerHTML = UI\.renderIconStatusHTML\(estadoIconos\)/);
  assert.match(SRC, /data-lt-icons-retry'\) === '1'\) \{\s*pedirIconos\(state\.openItemId, true\);/);
  assert.match(SRC, /actions\.innerHTML = \(UI\.renderSheetHTML \? '' :/);
});

test('ficha: sin datos de la API, ícono y nombre en español salen del catálogo', () => {
  const h = helpers({ LegendaryCatalog: CAT, ItemIcons: SIN_ICONOS });
  assert.deepEqual(h.infoPieza(30684), { icon: 'ff.png', name: 'Colmilloescarcha', color: '#974EFF', rarity: null });
  const h2 = helpers({ LegendaryCatalog: CAT, ItemIcons: { de: () => ({ icon: 'api.png', name: 'API', color: '#123456', rarity: 'Legendario' }) } });
  assert.equal(h2.infoPieza(30684).icon, 'api.png');
  assert.equal(h2.infoPieza(30684).name, 'API');
  assert.deepEqual(h2.infoPieza(19721), { icon: 'api.png', name: 'API', color: '#123456', rarity: 'Legendario' });
  assert.equal(helpers({ LegendaryCatalog: CAT }).infoPieza(1), null);
});

test('ficha: la cabecera lleva tipo, expansión real y generación', () => {
  const h = helpers({ LegendaryCatalog: CAT, LegendaryCatalogUI: CUI });
  assert.deepEqual(h.metaCabecera(96937), { name: 'Klobjarne Geirr', icon: 'kg.png', color: '#974EFF', tipo: 'Arma', expansion: 'JW', generation: 2 });
  assert.equal(h.metaCabecera(30684).expansion, 'Core');
});

test('íconos: se piden los ids del árbol abierto (nodos y totales, sin repetir ni el 0)', () => {
  const h = helpers({ LegendaryCatalog: CAT });
  const res = { node: { id: 30684, children: [{ id: 19721, children: [] }, { id: 0, children: [] },
    { id: 19700, children: [{ id: 19721, children: [] }] }] }, totals: { rows: [{ itemId: 19721 }, { itemId: 24295 }] } };
  assert.deepEqual(h.idsDelArbol(res), [30684, 19721, 19700, 24295]);
  assert.deepEqual(h.idsDelArbol(null), []);
});

test('íconos: si el camino normal no los trae, el respaldo va directo a /v2/items y se usan', async () => {
  const pedidas = [];
  const fakeFetch = (url) => {
    pedidas.push(url);
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([
      { id: 19721, icon: 'ecto.png', name: 'Pegote de ectoplasma', rarity: 'Exotic' }]) });
  };
  const h = helpers({ LegendaryCatalog: CAT, ItemIcons: SIN_ICONOS }, fakeFetch);
  assert.equal(h.conIcono([30684, 19721]), 1, 'la legendaria ya tiene el ícono del catálogo');
  const traidos = await h.traerDirecto([30684, 19721]);
  assert.equal(traidos, 1);
  // Solo se piden los que faltan, en español.
  assert.deepEqual(pedidas, ['https://api.guildwars2.com/v2/items?lang=es&ids=19721']);
  assert.deepEqual(h.infoPieza(19721), { icon: 'ecto.png', name: 'Pegote de ectoplasma', color: '#FFA405', rarity: null });
  assert.equal(h.conIcono([30684, 19721]), 2);
});

test('íconos: si el respaldo también falla, no rompe y queda el aviso con "Reintentar"', async () => {
  const h = helpers({ LegendaryCatalog: CAT, ItemIcons: SIN_ICONOS }, () => Promise.reject(new TypeError('Failed to fetch')));
  assert.equal(await h.traerDirecto([19721, 24295]), 0);
  assert.equal(h.conIcono([19721, 24295]), 0);
  // El estado de fallo se arma con cuántos hay de cuántos, y lo pinta renderIconStatusHTML.
  assert.match(SRC, /\{ estado: 'fallo', con: con, total: arbol\.length \}/);
  assert.match(SRC, /setTimeout\(function \(\) \{ r\('tarde'\); \}, 6000\)/);
});
