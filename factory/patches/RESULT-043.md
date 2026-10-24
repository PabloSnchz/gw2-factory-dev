# RESULT de PATCH-043

- Fecha: 2026-10-24T19:10:06.558Z
- Estado: APLICADO
- Resumen: BL-070 RAI-3: raids-sheet.js declara «Versión: 1.0.0» en la cabecera (index-versions lo pedía) y tests/raids-sheet.test.cjs lo vigila

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/raids-sheet.js` | `5007b9ecb2aaa76cfdf79a32557d3108c07cc793` | `3ade83533ff649456228ec87e0130f47b2ed7826` | 21873 |
| `tests/raids-sheet.test.cjs` | `a74d6c8719f6efe769650800060e71f05b0c8138` | `24fa245758181bdd2a1715b1aae2d58d272b2b63` | 16049 |

- Suite de tests: ya estaba en rojo antes del parche (1 fallas: tests/index-versions.test.cjs: modules.json: cada módulo con su versión exacta y sin cargarse también desde index.html); el parche no rompió ningún archivo nuevo y pasó node --check.
