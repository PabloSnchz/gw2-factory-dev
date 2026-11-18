# RESULT de PATCH-445

- Fecha: 2026-11-18T10:33:05.564Z
- Estado: APLICADO
- Resumen: BL-096 OJ-3: en el celular, plegada ocupo menos (pegada al borde, cara 40 px, gato 50 px) y no tapo el paso 1 de Inicio; universo.css 1.6.0

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/universo.css` | `6af1e63ff0f585fb93e97bbb8de900e256d00b21` | `e2668491f76b8b5e4624929e2ea504a0d89ec0dc` | 22666 |
| `index.html` | `2219f3261b07ebc425f5287189dc75a9b5a10c4d` | `74ca2d543f82ad7de0e3f3da14484b57294f6ce3` | 48548 |
| `tests/shv-escena.test.cjs` | `f2e2567594a28f15f97664b37d850fc475127780` | `7baac7ea11b314394bed57fc1ae0d4632ffe08db` | 23279 |

- Suite de tests: ya estaba en rojo antes del parche (9 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/universo-globo.test.cjs: celular, plegada: pegada al borde y sin relleno de más, tests/universo-globo.test.cjs: celular, plegada: cara de 40 px y el gato más chico que el del kit (64 px), sentado sobre mi cara, tests/universo-globo.test.cjs: ocupo menos: el rectángulo plegado (con el gato) baja al menos un 25 % frente al del kit en el celular, tests/universo-globo.test.cjs: versión 1.6.0 en el archivo y en index.html; todo con el alcance del theme y sin !important); el parche no rompió ningún archivo nuevo y pasó node --check.
