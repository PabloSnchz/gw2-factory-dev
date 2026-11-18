# RESULT de PATCH-436

- Fecha: 2026-11-18T03:54:16.990Z
- Estado: APLICADO
- Resumen: BL-093 CERRADA (validada en PRD por Pablo); BL-094 anotada (guías de usuario en mi universo); FEAT-028 disponible en PRD

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `b55379dc0a1650eae1f366c2f8b6509a70e4ad5b` | `0784b61a6d9fbaf9a04a0db78eb30edc5dc55545` | 129416 |
| `ai-memory/status.md` | `34fd3c639a612cd5fbe57b303ae6bf518d215afd` | `6ace69ea7820abc7ea357970002cf0b76c4d873c` | 196874 |
| `ai-memory/features/FEAT-028-boveda-en-el-universo-shiruvana.md` | `5b2600ee4a7d8ef4c5fcf26955e463003fa8561b` | `0115ea774aa330c1dd62eea9ce881d4a58f9a037` | 3049 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
