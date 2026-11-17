# RESULT de PATCH-397

- Fecha: 2026-11-17T03:17:16.027Z
- Estado: APLICADO
- Resumen: BL-091: Pablo validó ESC-7 y cerró La Guarida; checkpoint de BIO-1 (Link in Bio al universo Shiruvana)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `2422c78b8412716458f5099bd0f53c1daf74a4cf` | `92a77c723083c28fd5605a471ee210c03c815a2d` | 174745 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
