# RESULT de PATCH-425

- Fecha: 2026-11-17T23:47:56.639Z
- Estado: APLICADO
- Resumen: BL-092: BV-3 validado (23:24Z, «segui con bv4»); BV-4 HECHO (poses sin fondo, PATCH-424, RUN-294 verde); validación de BV-4 en «Esperando a Pablo»

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `c228418966432e2242988f3d0ed0eb7c7bbe0216` | `45ae4641bf13c76e3b958f9b9599e79dccbcb8f2` | 190245 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
