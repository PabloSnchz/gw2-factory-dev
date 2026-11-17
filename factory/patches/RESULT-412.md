# RESULT de PATCH-412

- Fecha: 2026-11-17T10:41:23.647Z
- Estado: APLICADO
- Resumen: BL-091: CD-5 HECHO (celular, revisión final, CHANGELOG 3.0.0 del panel); CI 124/124; validación en el teléfono pedida a Pablo

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `e2dcfdeaa9987330bf1a859f4e54db60cce4e9c0` | `82ea2751b55f347e6184f434534d47f05b710b39` | 183651 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
