# RESULT de PATCH-441

- Fecha: 2026-11-18T05:06:04.287Z
- Estado: APLICADO
- Resumen: BL-096 OJ-1: etiquetas Con Key/Sin Key sin montarse sobre los títulos (theme-polish 2.4.1; welcome-panel.js está en su techo)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/theme-polish.css` | `f0ca08c96bb7c382316d5114353d61c8a3c300d0` | `4b0fa21d16a9ab07fcba73f2fc5f71776be5e02a` | 44476 |
| `index.html` | `82c1c913229059079927890806e52a778153df9e` | `8b5900293ccb19f57880aa5cefb52ee200cc90f2` | 48548 |

- Suite de tests: ya estaba en rojo antes del parche (8 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/welcome-tags.test.cjs: en la compu la tarjeta con etiqueta reserva su renglón (≥ 26 px: top 8 + alto de la etiqueta), tests/welcome-tags.test.cjs: en el celular la tarjeta vuelve a 12 px (gana a la reserva por estar en el mismo selector, después), tests/welcome-tags.test.cjs: theme-polish 2.4.1 en el archivo y en index.html (sin caché vieja)); el parche no rompió ningún archivo nuevo y pasó node --check.
