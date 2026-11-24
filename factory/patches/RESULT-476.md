# RESULT de PATCH-476

- Fecha: 2026-11-24T02:37:01.571Z
- Estado: APLICADO
- Resumen: BL-101 paso 1: bld-lib, bld-rows y bld-view prueban la lógica con la foto fija de Builds (tests/fixtures/builds-mundo.cjs); los datos vivos los revisa tests/bld-data.test.cjs.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `tests/bld-lib.test.cjs` | `4178b76f99ab257c7692d5ec230c05cb08c57ab6` | `d5a607bdbc767130dbf7e57409269fcb62749b48` | 24634 |
| `tests/bld-rows.test.cjs` | `25303675b8eec3cee6b1b7df8a618324df221dc9` | `3f9bbb3dc7a5ecfd872b640837796ddc131f998f` | 11189 |
| `tests/bld-view.test.cjs` | `2345b4231a154a96dc8b9eddd35c502a93b8dd22` | `cba4412928db1801a2bcde27ed51013c173f0f29` | 5941 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
