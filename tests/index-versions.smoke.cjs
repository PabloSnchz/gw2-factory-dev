// Inventario de versiones (RSK-020): imprime la tabla de ?v pedidos contra la versión
// de cada archivo. No es parte de la suite (no falla nunca por atrasos): la Factory lo
// pide con factory/diagnose/RUN-NNN.json para ver el estado real en CI.
'use strict';
const path = require('node:path');
const { inventory, table } = require('../tools/index-versions.cjs');

console.log(table(inventory(path.join(__dirname, '..'))));
