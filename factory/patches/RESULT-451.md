# RESULT de PATCH-451

- Fecha: 2026-11-19T00:45:42.981Z
- Estado: APLICADO
- Resumen: BL-094 GU-1 HECHO: documentación y validación pendiente

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/backlog.md` | `9457e3f0fd6066215226cb3ea60e6d20cca2c924` | `546fc2651c54348469bf7102ed6c59c6b176a046` | 131487 |
| `ai-memory/status.md` | `63cd9ae405d9a8afc55aeea3cab9ce8d5baacd63` | `239c252059de12df9169f1196082e33545db622e` | 204955 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
