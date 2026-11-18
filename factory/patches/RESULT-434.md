# RESULT de PATCH-434

- Fecha: 2026-11-18T03:31:19.594Z
- Estado: APLICADO
- Resumen: BL-092 CERRADA (FEAT-028); BL-093 pasaje a PRD vía PowerShell preparado (manifiesto BL-093, DevSha f2f72e0, PRD 6dca6a9)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `87cfa8ff53e0d7a04cf3e5cd3befd1e2657dcad5` | `b55379dc0a1650eae1f366c2f8b6509a70e4ad5b` | 128654 |
| `ai-memory/status.md` | `e3d693816464350bfa24ea9af7d0dd661bf0f1b1` | `74b327249961c4f123427c2b2de9e2fa0d5dd122` | 196348 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
