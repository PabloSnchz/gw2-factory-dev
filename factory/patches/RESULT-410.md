# RESULT de PATCH-410

- Fecha: 2026-11-17T05:02:01.554Z
- Estado: APLICADO
- Resumen: BL-091: CD-3b HECHO redefinido (La Guarida conserva su escena; kit con CI y guardián de sincronía; CI 65/65). Reemplaza al PATCH-409, publicado sin base por error.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `1ea465c5cdd228b3ee2346c63f913e276830ab80` | `6a8cd70db43a65e941c7b6fae664b85f2785f39d` | 181999 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
