# RESULT de PATCH-316

- Fecha: 2026-10-30T17:37:46.186Z
- Estado: APLICADO
- Resumen: BL-084 EQ-6: la ficha suma los desplegables de notas (bld-notes) al pie de Equipo y de Rasgos y habilidades; bld-sheet 1.4.0; modules.json; test

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/bld-sheet.js` | `aaaeb8cfd7cc95c2d38145066f1bb3a3993c6612` | `000ead390ac9a74feca49cd074d75938e87b8273` | 25944 |
| `tests/bld-sheet.test.cjs` | `1ed55b3b90e879de875388b0ff9b537bebf5644e` | `21869a725ffbb1acbc9e2cded446dc3e693ea2da` | 22002 |
| `js/modules.json` | `31e2cafa7285df9aad28bd5bbca4cff0347fa2cc` | `33e615d109e7480ec60429650cdc40948f160c3e` | 2877 |

- Suite de tests: ya estaba en rojo antes del parche (1 fallas: tests/bld-notes.test.cjs: versión en la cabecera, en modules.json antes de la ficha; sin estado guardado); el parche no rompió ningún archivo nuevo y pasó node --check.
