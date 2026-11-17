# RESULT de PATCH-414

- Fecha: 2026-11-17T22:08:41.916Z
- Estado: APLICADO
- Resumen: BL-092 EN CURSO por pedido de Pablo (2026-11-17 22:05Z, «vamos con 092»); BV-0, la maqueta, en curso

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `4977d8bb7ee1a7e2513980c9f2ce54e4c7d29640` | `ee212fd2a90cbf0fc3475eb6891e054a83f6ea8f` | 184811 |
| `ai-memory/backlog.md` | `8624b718ca1ba78e37f3fb3843fdc86043bc78fd` | `87cfa8ff53e0d7a04cf3e5cd3befd1e2657dcad5` | 128100 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
