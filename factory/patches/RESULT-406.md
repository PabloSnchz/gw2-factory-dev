# RESULT de PATCH-406

- Fecha: 2026-11-17T04:43:20.526Z
- Estado: APLICADO
- Resumen: BL-091: CD-3 VALIDADO por Pablo («dale» 04:41Z); CD-4 EN CURSO; CD-3b queda para después de CD-4

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `aaa1a03ab8bfc69774ec49da52965347284b7a3b` | `f00848ad15bd4b15af813f19594857d9aea4b48b` | 179647 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
