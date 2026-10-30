# RESULT de PATCH-312

- Fecha: 2026-10-30T11:38:38.310Z
- Estado: APLICADO
- Resumen: BL-084 EQ-4: la ficha pinta el equipo con js/bld-gearview.js (3 tarjetas, rareza, descripción oficial accesible); bld-sheet 1.2.0

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/bld-sheet.js` | `2b794e75927b2d25deed9e2f1aab43cd45a9dbd8` | `1aeeb1cf08542943d79c909542e2d3053b503193` | 24118 |
| `tests/bld-sheet.test.cjs` | `02a91fe293b2cb2a79159990f64e4fc5717f465b` | `6af09c837ef1677e24976c95b3637502371280b3` | 18084 |
| `js/modules.json` | `b432b6952ca2b6fba735303d86e80120d68efc92` | `911d94570e33eb934a0c89b4cc26e2ed991fa142` | 2773 |
| `tests/bld-gearview.test.cjs` | `81da16313d60ce5867a4b7bee3d5a341897eb19b` | `0bbab841cc8603290d0c63007a43fc33f2b31876` | 11528 |

- Suite de tests: ya estaba en rojo antes del parche (1 fallas: tests/bld-gearview.test.cjs: versión en la cabecera y en el objeto); el parche no rompió ningún archivo nuevo y pasó node --check.
