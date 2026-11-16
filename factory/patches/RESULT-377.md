# RESULT de PATCH-377

- Fecha: 2026-11-16T22:29:22.333Z
- Estado: APLICADO
- Resumen: BL-090 checkpoint: Pablo revisó MC-3 (2026-11-16 22:25Z): descarta las versiones por público y marca dos ruidos visuales (la barra parte la pantalla y corta la figura; el fondo negro de las poses contrasta). Arranca MC-3b

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `ead84294e0e1d3c617f50316f175f17308381109` | `443563b669aae368a03c3dc2f5604d52fb9b2364` | 168529 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
