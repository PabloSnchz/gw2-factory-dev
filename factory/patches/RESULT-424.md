# RESULT de PATCH-424

- Fecha: 2026-11-17T23:40:09.673Z
- Estado: APLICADO
- Resumen: BL-092 BV-4: mis poses sin fondo (recorte del kit) en Inicio y en 3 pantallas vacías (cola de la Armería, Cuentas, Compras fijadas); shv-bubble 1.6.0, universo.css 1.3.0; solo theme Gato Negro. Reenvío de PATCH-423 (rechazado: universo.test lee el primer bloque de 640 px)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/shv-bubble.js` | `325e6f477fa52384e338333a142c99f0691b343d` | `379547424209cefd3b34e44f27f4fede02619925` | 30455 |
| `css/universo.css` | `1e59024d6891a6feda7ead40c5d0911961974fa0` | `dd7748de095b394ca3eeebbc9f247d2167baf332` | 14838 |
| `tests/shv-escena.test.cjs` | `5d0abe3767b1c7ca3a59294089209adb7855339d` | `858ed3629281ddcbb218bc65a8805714a0d9af25` | 20817 |
| `js/modules.json` | `d712869d811053ae5c119b6d9651ca35463d70f2` | `3247fca31aa46d97ee07f5db5c4e5bcae3e1974a` | 2926 |
| `index.html` | `b181257a35b4efa346daa7aa2d586c177af3e9b0` | `799436676f6bf1aa7e9298610976c00868c5d1eb` | 48548 |
| `tests/shv-bubble.test.cjs` | `eb5b37fbd2a77aa8e36200bc5eb4e7590c1cee09` | `bd28aca106d4b330d9b3bf8ed378a60d6c62d949` | 28819 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
