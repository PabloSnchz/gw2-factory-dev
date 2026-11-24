// BL-101 (2026-11-24): foto fija del mundo de Builds para los tests de LÓGICA.
//
// Por qué: los tests de la Biblioteca leían assets/data/builds/*.json, que la vigía builds-watch cambia cada semana.
// Cuando salió el parche de balance del 10/11/2026 las builds pasaron (con razón) a «para revisar» y 5 tests
// quedaron en rojo sin que el código tuviera nada mal. La lógica se prueba contra esta foto; los datos vivos los
// revisa tests/bld-data.test.cjs con reglas que valen para cualquier parche.
//
// Qué es: catalog.json del commit 512ee58 (2026-10-28, blob ed8d2f4: 104 builds, parche 2026-09-29) y watch.json
// del commit 85c1001 (latestPatch 2026-09-29), en un JSON { catalog, watch } comprimido con gzip y en base64
// (builds-2026-10-28.b64, 10 KB en vez de 54 KB). No se edita a mano: si un test necesita otro mundo, se agrega otra foto.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const b64 = fs.readFileSync(path.join(__dirname, 'builds-2026-10-28.b64'), 'utf8').replace(/\s+/g, '');
const mundo = JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));

module.exports = { CAT: mundo.catalog, WATCH: mundo.watch, FECHA: '2026-10-28' };
