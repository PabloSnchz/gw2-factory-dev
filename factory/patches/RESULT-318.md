# RESULT de PATCH-318

- Fecha: 2026-10-30T23:58:50.758Z
- Estado: APLICADO
- Resumen: BL-084 EQ-7: «Cómo se juega» con js/bld-play.js (conceptos, apertura, bucle y control con íconos en línea); bld-notes 1.1.0 inline(); bld-sheet 1.5.0; modules.json; tests

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/bld-notes.js` | `539d4b069cf3f8850d2d45c0e988939caf8c88ae` | `78decc4a47692ba0d0920a14a147ad586357079c` | 10032 |
| `tests/bld-notes.test.cjs` | `e788d0bc6befd172771e258de2483d9038b6f7e9` | `becda8d78a759acf30182813b0873fe4715d3c69` | 7680 |
| `js/bld-sheet.js` | `000ead390ac9a74feca49cd074d75938e87b8273` | `c0bb48700e9a7a9e42c2e142b062a404538c2a3d` | 26513 |
| `tests/bld-sheet.test.cjs` | `21869a725ffbb1acbc9e2cded446dc3e693ea2da` | `bd3b8e24b81d8dfeba47d6e960b7244cc35a488a` | 23310 |
| `js/modules.json` | `33e615d109e7480ec60429650cdc40948f160c3e` | `3b08d069d25822932171cef335c03a2a3b7c5d70` | 2926 |

- Suite de tests: ya estaba en rojo antes del parche (3 fallas: tests/bld-play.test.cjs: versión en la cabecera, en modules.json después de las notas y antes de la ficha; sin estado guardado, tests/bld-play.test.cjs: con nota: conceptos y control en párrafos, apertura y bucle numerados, íconos y nombres oficiales en línea, tests/bld-play.test.cjs: sin bld-notes, el texto sigue escapado y las referencias quedan como \#ID); el parche no rompió ningún archivo nuevo y pasó node --check.
