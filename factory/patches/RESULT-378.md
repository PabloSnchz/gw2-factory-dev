# RESULT de PATCH-378

- Fecha: 2026-11-16T22:36:18.144Z
- Estado: APLICADO
- Resumen: BL-090 MC-3b HECHO: una sola función para todos (se quitan las versiones por público, queda ▶ Sola), capítulos en cápsula sin franja que parte la pantalla y mi figura fundida con el fondo; espera validación de Pablo

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `62e952ea504c55184aae2796282fb8f452c7f2ce` | `dbcb8c38a8a52610cecd238c37e77a121ea5705a` | 125232 |
| `ai-memory/status.md` | `443563b669aae368a03c3dc2f5604d52fb9b2364` | `6dd17188fb2ef22ba361907c72abb65154fbe328` | 168929 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
