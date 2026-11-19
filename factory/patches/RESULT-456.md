# RESULT de PATCH-456

- Fecha: 2026-11-19T01:31:17.272Z
- Estado: APLICADO
- Resumen: BL-094 GU-3: css/guias.css 1.2.0 (mis poses en momentos puntuales) y las dos guías cargan js/guias-escena.js

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/guias.css` | `5321e259ccc70cf8d9876b767e6804815f1e522f` | `0fe8ef30852957d31040213c4327fabafde074ec` | 11116 |
| `docs/user-guide.html` | `b56a248abc0c370192f67091c2e09ee268b44803` | `42ef3819a858a9f34e6072fcc1fc053151808a94` | 19153 |
| `docs/user-guide-avanzado.html` | `398fa2c17ac80d5d6a47827347ca3efdc6e9d2f1` | `cbd20fb81bea587845dfa6c36217cade5df579b2` | 38558 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
