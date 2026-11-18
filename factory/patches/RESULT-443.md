# RESULT de PATCH-443

- Fecha: 2026-11-18T05:20:00.293Z
- Estado: APLICADO
- Resumen: BL-096 OJ-2: sin API Key no se ve la pastilla vacía del selector de cuenta (theme-polish 2.4.2)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/theme-polish.css` | `4b0fa21d16a9ab07fcba73f2fc5f71776be5e02a` | `7216c6b7385ef46f47122e0aca04c9240a0efe4b` | 44740 |
| `index.html` | `8b5900293ccb19f57880aa5cefb52ee200cc90f2` | `2219f3261b07ebc425f5287189dc75a9b5a10c4d` | 48548 |

- Suite de tests: ya estaba en rojo antes del parche (6 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/topbar-select.test.cjs: sin cuentas, el selector de cuenta no se muestra (theme-polish.css)); el parche no rompió ningún archivo nuevo y pasó node --check.
