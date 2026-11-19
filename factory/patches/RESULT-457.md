# RESULT de PATCH-457

- Fecha: 2026-11-19T01:36:20.459Z
- Estado: APLICADO
- Resumen: BL-094 GU-3 (EYE-012): en el celular mis poses van debajo del texto (css/guias.css 1.2.1)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/guias.css` | `0fe8ef30852957d31040213c4327fabafde074ec` | `fd0bab6e05cb4500d3ea830a3a87ea0dcfa44f11` | 11292 |
| `docs/user-guide.html` | `42ef3819a858a9f34e6072fcc1fc053151808a94` | `c9afd72e421f469a94c719ca2d4908b04668ff00` | 19153 |
| `docs/user-guide-avanzado.html` | `cbd20fb81bea587845dfa6c36217cade5df579b2` | `7108c746a470a4979266dbd36ca047a1d7595536` | 38558 |

- Suite de tests: ya estaba en rojo antes del parche (6 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/guias-escena.test.cjs: en el celular las poses van debajo del texto, más chicas, y el texto usa todo el ancho (EYE-012)); el parche no rompió ningún archivo nuevo y pasó node --check.
