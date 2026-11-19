# RESULT de PATCH-459

- Fecha: 2026-11-19T06:13:45.358Z
- Estado: APLICADO
- Resumen: BL-094 GU-4: cierre (BL-094 a DONE, FEAT-028 al día, índice con FEAT-028 y FEAT-029, status)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `3dd12188fdf74de6bf11145d43e0b559067bb7d1` | `8979670c9f2430fc08d1699512fa8de05a1280ca` | 131153 |
| `ai-memory/status.md` | `be2e673b0fbe9aea67efd59870c0d670d66ab5b5` | `4a07ed13b0d0a42da12b8c724b25c882f922fe3f` | 208478 |
| `ai-memory/features/FEAT-028-boveda-en-el-universo-shiruvana.md` | `0115ea774aa330c1dd62eea9ce881d4a58f9a037` | `b0bfaca7b2b096208b4746688d73cf6a85a0840e` | 3066 |
| `ai-memory/memory-index.md` | `caef396f33f0ef21eea7035af64a51a30c07348c` | `ebb665e6e8118bd15e3fb207454b43e575620c3c` | 23409 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
