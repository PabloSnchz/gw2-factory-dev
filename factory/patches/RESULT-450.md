# RESULT de PATCH-450

- Fecha: 2026-11-19T00:41:56.918Z
- Estado: APLICADO
- Resumen: BL-094 GU-1: la Guía por módulo pide cada theme con su versión real (gato.css?v=2.0.0, THEME_V); reenvío de PATCH-449 con tests/guides-identity ya al día

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `docs/user-guide-avanzado.html` | `966d17274b1420237532b734737583676cfcdabd` | `5aefcbef4960f6bd021dcdc0b3b42d2f0b0d5463` | 38375 |

- Suite de tests: ya estaba en rojo antes del parche (7 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/guides-identity.test.cjs: docs/user-guide-avanzado.html: aplica el theme guardado por La Bóveda y cae en Gato Negro si no hay o es inválido, tests/guides-identity.test.cjs: docs/user-guide-avanzado.html: pide cada theme con la versión de js/theme-selector.js (BL-094)); el parche no rompió ningún archivo nuevo y pasó node --check.
