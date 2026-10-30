# RESULT de PATCH-314

- Fecha: 2026-10-30T14:49:30.832Z
- Estado: APLICADO
- Resumen: BL-084 EQ-5: bld-ref 1.3.0 (habilidades de arma y mecánica F1–F5) + la ficha pinta «Rasgos y habilidades» con bld-traitview; bld-sheet 1.3.0; modules.json; tests

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/bld-ref.js` | `528e82cc876e7ded852e27f61fdd9bed0f74ab4f` | `a4db2aeadd19a4659278560be63df39af43c92fe` | 21010 |
| `tests/bld-ref.test.cjs` | `4d3baa967f240e6da653bcb3d303ce74744f27fd` | `7027cda3e0f09f4ff01f9af0eaa54685193f1f9c` | 11286 |
| `js/bld-sheet.js` | `1aeeb1cf08542943d79c909542e2d3053b503193` | `aaaeb8cfd7cc95c2d38145066f1bb3a3993c6612` | 24999 |
| `tests/bld-sheet.test.cjs` | `6af09c837ef1677e24976c95b3637502371280b3` | `1ed55b3b90e879de875388b0ff9b537bebf5644e` | 19883 |
| `js/modules.json` | `911d94570e33eb934a0c89b4cc26e2ed991fa142` | `31e2cafa7285df9aad28bd5bbca4cff0347fa2cc` | 2827 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-traitview.test.cjs: versión en la cabecera, en modules.json antes de la ficha y bld-ref 1.3.0, tests/bld-traitview.test.cjs: bld-ref 1.3.0: guarda las habilidades de cada arma y la mecánica de la profesión; lo de antes se vuelve a pedir, tests/bld-traitview.test.cjs: armas: juegos desde el equipo (Daga+Pistola, Rifle) y, sin equipo, desde las armas del código, tests/bld-traitview.test.cjs: mecánica: con la élite elegida, su F1; si la élite deja dos opciones en una tecla, no adivino, tests/bld-traitview.test.cjs: HTML: barra con teclas, líneas con fondo oficial, elegidos encendidos, otras opciones para el lector, guía de teclas y acciones); el parche no rompió ningún archivo nuevo y pasó node --check.
