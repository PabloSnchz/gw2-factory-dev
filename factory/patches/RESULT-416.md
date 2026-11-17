# RESULT de PATCH-416

- Fecha: 2026-11-17T22:28:52.916Z
- Estado: APLICADO
- Resumen: BL-092 BV-1: index.html carga css/universo.css 1.0.0 después del theme, en la línea vacía que ya había (no se corre ninguna línea del archivo)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `ccbdbba5001a631e1b453a0b4695a4f087c5727b` | `3852bb823a2bacdaa0a5670180ad734f98513626` | 48548 |

- Suite de tests: ya estaba en rojo antes del parche (6 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/universo.test.cjs: index.html carga css/universo.css después del theme, con la versión del archivo); el parche no rompió ningún archivo nuevo y pasó node --check.
