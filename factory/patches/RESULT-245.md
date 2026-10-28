# RESULT de PATCH-245

- Fecha: 2026-10-28T01:34:41.184Z
- Estado: RECHAZADO
- Resumen: BL-079 (CRÍTICO, lo reportó un usuario): el formulario de API Keys rechazaba toda Key real de GW2. La regla esperaba dos GUID separados por guion (73 caracteres) y la Key real tiene 72 (8-4-4-4-20-4-4-4-12, sin guion en la unión). Regla corregida, mensaje claro y se quitan espacios al pegar; app.js?v=2.9.2 para que el navegador tome el arreglo.

Ningún archivo cambió. Motivo:

- la suite de tests pasaba y con el parche falla (3 fallas: tests/hb75-permisos.test.js, tests/index-versions.test.cjs: index.html pide cada script con la versión que declara el archivo (RSK-020), tests/size-budget.test.cjs: la Bóveda cumple su presupuesto de tamaño)
