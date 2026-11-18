# RESULT de PATCH-447

- Fecha: 2026-11-18T11:00:00.379Z
- Estado: APLICADO
- Resumen: BL-096 cerrada: OJ-3 validado por Pablo (10:58Z «ok»)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `d34282db2c5e1dc87b25d1e67c9d0322499f2dfa` | `36f2293665b0ce0453e988427f49ad5d12137674` | 131079 |
| `ai-memory/status.md` | `c15b67395b180538351a80d366cfba29ef3bafb3` | `8576117de85583e197d0fbfb9218dd4c4b32c3c8` | 202728 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
