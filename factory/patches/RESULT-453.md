# RESULT de PATCH-453

- Fecha: 2026-11-19T01:12:29.338Z
- Estado: APLICADO
- Resumen: BL-094 GU-2: la Guía por módulo carga css/universo.css y css/guias.css 1.1.0 (fecha 18 de noviembre); Primeros pasos pide guias.css?v=1.1.0

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `docs/user-guide-avanzado.html` | `5aefcbef4960f6bd021dcdc0b3b42d2f0b0d5463` | `398fa2c17ac80d5d6a47827347ca3efdc6e9d2f1` | 38496 |
| `docs/user-guide.html` | `25756b2224245d3012aa6f6e9ee7c6b589e26f9d` | `b56a248abc0c370192f67091c2e09ee268b44803` | 19091 |

- Suite de tests: ya estaba en rojo antes del parche (7 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/guias-universo.test.cjs: docs/user-guide.html: carga el theme, después css/universo.css y después css/guias.css, con su versión real, tests/guias-universo.test.cjs: docs/user-guide-avanzado.html: carga el theme, después css/universo.css y después css/guias.css, con su versión real); el parche no rompió ningún archivo nuevo y pasó node --check.
