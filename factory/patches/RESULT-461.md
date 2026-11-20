# RESULT de PATCH-461

- Fecha: 2026-11-20T13:18:32.539Z
- Estado: APLICADO
- Resumen: DEC-052 v1.1: puntos abiertos resueltos por Pablo; índice y status

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/memory-index.md` | `595bd6a5118b954781475bd09e7a1ab3985c1de4` | `8bb03a8f60c0a464becfe8f9152183be62364ca8` | 24352 |
| `ai-memory/status.md` | `916001b60cffe824ea8abb1de534e51a11b21871` | `4fec4a6c8206d35084b19fa869b30184f972aeb3` | 209818 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
