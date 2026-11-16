# RESULT de PATCH-380

- Fecha: 2026-11-16T23:02:48.833Z
- Estado: APLICADO
- Resumen: BL-090 MC-4 HECHO: cifras vivas desde ai-memory (Action cada 2 h → data/hoy.js) y la escena «Hoy en la Factory»; status.md al día (Tarea actual y Motivo estaban congelados en BL-084/BL-070 y el panel y el sitio los mostraban); espera validación de Pablo para cerrar BL-090

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `0a8f36e7ec1d79fefd3244c45c4bb80cb9f86a9d` | `d62840f60f2b615c50a39be33c0dafed1074d621` | 127941 |
| `ai-memory/status.md` | `deaacdf6d7a1b0946ca7c7208fa0f2f17eb234e8` | `6b454fdccb149d548aa69d8055e2ab7e6fc88774` | 168704 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
