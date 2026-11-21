# RESULT de PATCH-462

- Fecha: 2026-11-21T21:13:38.471Z
- Estado: APLICADO
- Resumen: DEC-053 nacimiento de Shiruna: índice y status (S-4a en el panel)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/memory-index.md` | `8bb03a8f60c0a464becfe8f9152183be62364ca8` | `f3d79d998a3748a5e5e2dd46bef01fade96daf75` | 24760 |
| `ai-memory/status.md` | `4fec4a6c8206d35084b19fa869b30184f972aeb3` | `f72ad7efb111dba249d27442fb7382165a63d865` | 210629 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
