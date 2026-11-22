# RESULT de PATCH-465

- Fecha: 2026-11-22T20:25:22.957Z
- Estado: APLICADO
- Resumen: Status al día: S-5 resuelto (Shiruna corre en QwenPaw con latido diario), SH-1 a SH-3 hechos (Shiruna y Pablo con cuerpo en el Centro de mando 3.2.0 y capítulo «Shiruna» en el sitio)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `fffb099e695df90c201026cd73c6722466f220bc` | `22f066b843df7e050e15a6fd8c8ea48eb014c5e9` | 212022 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
