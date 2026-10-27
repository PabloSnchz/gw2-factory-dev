# RESULT de PATCH-229

- Fecha: 2026-10-27T23:14:38.468Z
- Estado: RECHAZADO
- Resumen: BL-078 UNI-2: reloj común en Metas (grande, 4 relojes) y Raids (solo el reset semanal); gn-kit.js 1.0.1 entra al manifiesto (39 de 40).

Ningún archivo cambió. Motivo:

- la suite de tests pasaba y con el parche falla (2 fallas: tests/raids-sheet.test.cjs: el archivo entra en el presupuesto y se carga por el manifiesto después de raids-view.js, tests/raids-view.test.cjs: UNI-2: con GNKit la cabecera muestra solo el reset semanal con el reloj común)
