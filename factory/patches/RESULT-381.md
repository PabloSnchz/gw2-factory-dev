# RESULT de PATCH-381

- Fecha: 2026-11-16T23:17:42.493Z
- Estado: APLICADO
- Resumen: BL-090 CERRADA (Pablo validó MC-4, 2026-11-16 23:14Z) y BL-091 a IN_PROGRESS: La Guarida primero, con la maqueta ESC-0

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `d62840f60f2b615c50a39be33c0dafed1074d621` | `7a2ee81ed75a2439ad092ef3e899b26ac2f3258f` | 129018 |
| `ai-memory/status.md` | `6b454fdccb149d548aa69d8055e2ab7e6fc88774` | `1df87cef2847f1b696ecda873b7592be8f13ba6d` | 168121 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
