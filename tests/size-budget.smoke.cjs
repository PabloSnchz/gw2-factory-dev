// Presupuesto de tamaño (DEC-035 FP-6): imprime las zonas de cada archivo de la app.
// La Factory lo pide con factory/diagnose/RUN-NNN.json para ver el estado real en CI.
'use strict';
const path = require('node:path');
const { check, table } = require('../tools/size-budget.cjs');

console.log(table(check(path.join(__dirname, '..'))));
