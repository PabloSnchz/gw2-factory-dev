# RESULT de PATCH-413

- Fecha: 2026-11-17T11:14:09.574Z
- Estado: APLICADO
- Resumen: BL-091 CERRADA por Pablo; FEAT-027; 3.0.1 (textos largos plegados en «04 · La Factory ahora»); status.md con tarea, motivo y próxima acción cortos; BL-092 en READY

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `82ea2751b55f347e6184f434534d47f05b710b39` | `4977d8bb7ee1a7e2513980c9f2ce54e4c7d29640` | 184730 |
| `ai-memory/backlog.md` | `7a2ee81ed75a2439ad092ef3e899b26ac2f3258f` | `8624b718ca1ba78e37f3fb3843fdc86043bc78fd` | 128048 |
| `ai-memory/memory-index.md` | `5d038ed2df6e72d9f6920254a142a2bafce82579` | `caef396f33f0ef21eea7035af64a51a30c07348c` | 22770 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
