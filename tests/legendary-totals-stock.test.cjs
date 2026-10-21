// Armería: la columna "Tengo" de Materiales totales (BL-045). Corre con: node --test tests/*.test.cjs
// El modal le pasaba a la tabla las legendarias desbloqueadas (ownedMap) y la columna salía siempre en 0.
// "Tengo" tiene que ser el inventario de materiales: banco + almacén (+ personajes cuando se pidan).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'legendary-tracker.js'), 'utf8');

// Extrae una función de nivel de módulo por su nombre, contando llaves.
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

function stockMapWith(state) {
  return new Function('state', extract('stockMap') + '\nreturn stockMap();')(state);
}

test('totales: la tabla recibe el inventario de materiales (stockMap), no las legendarias (ownedMap)', () => {
  const calls = SRC.match(/UI\.renderTotalsHTML\(\s*res\s*,\s*([A-Za-z_]+)\(\)/g) || [];
  assert.ok(calls.length >= 1, 'no se encontró la llamada a UI.renderTotalsHTML');
  for (const c of calls) assert.match(c, /stockMap\(\)/, 'renderTotalsHTML recibe: ' + c);
});

test('totales: stockMap suma banco y almacén por id e ignora huecos vacíos', () => {
  const m = stockMapWith({
    bank: [null, { id: 19721, count: 5 }, { id: 24295, count: 2 }],
    materials: [{ id: 19721, count: 250 }, { id: 24295, count: 0 }],
    characterItems: []
  });
  assert.equal(m[19721], 255, 'pegote de ectoplasma: 5 en el banco + 250 en el almacén');
  assert.equal(m[24295], 2, 'una ranura con 0 no suma ni borra');
  assert.equal(Object.keys(m).length, 2);
});

test('totales: sin inventario cargado, "Tengo" es 0 y no rompe', () => {
  const m = stockMapWith({ bank: [], materials: [], characterItems: [] });
  assert.deepEqual(m, {});
});
