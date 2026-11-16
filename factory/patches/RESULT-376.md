# RESULT de PATCH-376

- Fecha: 2026-11-16T22:13:47.742Z
- Estado: APLICADO
- Resumen: BL-090 MC-3 HECHO: la función de Shiruvana según quién llega (jugador/curioso/Pablo, ?para=) y modo que avanza sola (?sola=1); espera validación de Pablo (reenvío de PATCH-375, rechazado por la clase de la línea de Esperando a Pablo)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `989d6db25096f8b1b7317835b90164efa9a1266e` | `62e952ea504c55184aae2796282fb8f452c7f2ce` | 124084 |
| `ai-memory/status.md` | `f2d8d58593c0ff5c0a3c90f8fbce7d7495a6089e` | `ead84294e0e1d3c617f50316f175f17308381109` | 168986 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
