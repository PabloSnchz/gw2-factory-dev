# RESULT de PATCH-374

- Fecha: 2026-11-16T21:58:07.503Z
- Estado: APLICADO
- Resumen: BL-090 checkpoint: Pablo subió los 4 webp (verificados por blob) y validó MC-2 (2026-11-16 21:56Z); arranca MC-3

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `7121437e3e014acb8e2f269aa6f1a9f168f60c38` | `f2d8d58593c0ff5c0a3c90f8fbce7d7495a6089e` | 168403 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
