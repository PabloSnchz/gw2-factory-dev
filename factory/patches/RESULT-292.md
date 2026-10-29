# RESULT de PATCH-292

- Fecha: 2026-10-29T23:36:17.701Z
- Estado: APLICADO
- Resumen: BL-082 BENCH-2: referencia de daño por parecido. La Biblioteca muestra, en las builds de PvE que hacen daño y no tienen bench propio, la «Referencia» medida más parecida de Snow Crows (misma élite, daño, rol y armas) diciendo que no es su DPS; Mis builds muestra el bench de la build de la Biblioteca en que se basa o esa referencia (por fuente, código o parecido de líneas y rasgos). Módulo js/bld-bench.js 1.0.0 en la ruta; bld-lib 1.7.0, bld-mine 1.4.0.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/bld-lib.js` | `36190e2a6ff847b7bf6321354be483b38b17f4ba` | `92918d88e3c724a6158c1d09aacdbd2b514801d1` | 32666 |
| `js/bld-mine.js` | `a751df9ea1859ec0591fb5bdff18d9d700ae435b` | `308f1abbb6464e1bbfa6854f233c5665d445ffb7` | 11160 |
| `tests/bld-lib.test.cjs` | `3a5f612ca7ad5d347b7b1513051754ad6cd0fcac` | `1f3f6454d1b3a5cf6c116e891930bfda0b86fe98` | 22629 |
| `js/modules.json` | `89b887d573d781c8848759894100cfb7f0499311` | `a6d8c10cb09a5bffe54d0a0209c259db2110f33f` | 2571 |

- Suite de tests: verde antes y después.
