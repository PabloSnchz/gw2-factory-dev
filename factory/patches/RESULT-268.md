# RESULT de PATCH-268

- Fecha: 2026-10-28T11:10:15.238Z
- Estado: RECHAZADO
- Resumen: BL-082 BLD-6 (D4): «Mis builds» (gn:builds:mine) viajan en el archivo de respaldo y en la copia de seguridad previa a importar. settings-manager.js 1.1.0: global.buildsMine al exportar; al importar, solo una lista válida (hasta 300); un respaldo sin builds no borra las tuyas.

Ningún archivo cambió. Motivo:

- la suite de tests pasaba y con el parche falla (2 fallas: tests/hb89-premisa-raw-selected.test.js, tests/idea50-boton-cache.test.js)
