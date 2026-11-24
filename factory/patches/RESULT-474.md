# RESULT de PATCH-474

- Fecha: 2026-11-24T01:58:09.355Z
- Estado: APLICADO
- Resumen: BL-102: CAR-3b validado en la PC (las ventanas caen solas). CAR-4 publicado: vigía 1.3.0 con línea del día, avisos y causa de la traba.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `ai-memory/status.md` | `92f895b6b7c1a769f7ee0c6c19427784502fae01` | `7bc51c10a13079cb9aff839925c2f7d4022c763b` | 219326 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
