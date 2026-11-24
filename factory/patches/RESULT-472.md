# RESULT de PATCH-472

- Fecha: 2026-11-24T01:08:30.369Z
- Estado: APLICADO
- Resumen: BL-102: La casa de las dos funciona en vivo en la PC SHIRUVANA (Pablo lo validó con captura). CAR-2 poses de Shiruna, CAR-3a abre con el acceso de QwenPaw, CAR-3c mi globo lee commits reales.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `0eb4b2d3cfa4b9789392640bd87de3445e1e4083` | `5658d9170cfdcff3b88e1f52182a7cb505920118` | 216609 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
