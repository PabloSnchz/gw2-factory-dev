# RESULT de PATCH-421

- Fecha: 2026-11-17T23:05:20.079Z
- Estado: APLICADO
- Resumen: BL-092 BV-3: mi globo con el gato con el theme Gato Negro (shv-bubble 1.5.0 carga la copia fija del kit de escena; universo.css 1.2.0 lo acomoda y oculta el rincón de la Sidebar); otros themes sin cambios

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/shv-bubble.js` | `b225f9f3a398297dae48ad12419fd94991317638` | `325e6f477fa52384e338333a142c99f0691b343d` | 29741 |
| `css/universo.css` | `4a16fa801608db02565c0d4fbe559e115364d82e` | `1e59024d6891a6feda7ead40c5d0911961974fa0` | 12656 |
| `js/modules.json` | `9f70716b8b12fc3d349b3a571dd1a37977c50e4f` | `d712869d811053ae5c119b6d9651ca35463d70f2` | 2926 |
| `index.html` | `0585c60333007da2a56f40cbf38e1192bda9e272` | `b181257a35b4efa346daa7aa2d586c177af3e9b0` | 48548 |
| `tests/shv-bubble.test.cjs` | `e6b05856d939b76ff00a0716f2b99248a7e7b465` | `eb5b37fbd2a77aa8e36200bc5eb4e7590c1cee09` | 28819 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
