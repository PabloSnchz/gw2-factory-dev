# RESULT de PATCH-426

- Fecha: 2026-11-18T00:25:09.570Z
- Estado: APLICADO
- Resumen: BL-092 BV-5: celular y revisión final — universo.css 1.4.0 (lugar abajo para el globo, botón de 44 px, mensajes largos con scroll, me corro mientras escribís en el celular, globo fuera de la impresión); solo theme Gato Negro

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/universo.css` | `dd7748de095b394ca3eeebbc9f247d2167baf332` | `96310dc95a6dd4e263f64e6e0a59ebd4a6408f6f` | 16486 |
| `tests/shv-escena.test.cjs` | `858ed3629281ddcbb218bc65a8805714a0d9af25` | `e18c7bcc13b78b1f0f7f5cb8e031fe239e69b1cc` | 23279 |
| `index.html` | `799436676f6bf1aa7e9298610976c00868c5d1eb` | `7b306f9395846910e5321e129a868af49a7a8b29` | 48548 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
