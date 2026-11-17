# RESULT de PATCH-420

- Fecha: 2026-11-17T22:42:30.365Z
- Estado: APLICADO
- Resumen: BL-092 BV-2 HECHO: index.html carga css/universo.css?v=1.1.0 (solo cambia la versión) y status.md queda esperando la validación de Pablo

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `3852bb823a2bacdaa0a5670180ad734f98513626` | `0585c60333007da2a56f40cbf38e1192bda9e272` | 48548 |
| `ai-memory/status.md` | `09c2128c96003bb44b0b3a6bd0df4b184fd42c3f` | `23b4b87de626f304f79cc03b8f4117b3cc2472c7` | 187247 |

- Suite de tests: ya estaba en rojo antes del parche (6 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/universo.test.cjs: index.html carga css/universo.css después del theme, con la versión del archivo); el parche no rompió ningún archivo nuevo y pasó node --check.
