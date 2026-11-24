# RESULT de PATCH-477

- Fecha: 2026-11-24T02:39:23.569Z
- Estado: APLICADO
- Resumen: BL-101 paso 1: en bld-lib, el cruce con el bench prueba la lógica (hay cruces y son coherentes) sin fijar cuántas builds lo encuentran: eso depende del bench vivo y lo vigila tests/bld-data.test.cjs.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `tests/bld-lib.test.cjs` | `d5a607bdbc767130dbf7e57409269fcb62749b48` | `850cbc676802b6a02efc1c9e9f85625ebf2173bf` | 24842 |

- Suite de tests: ya estaba en rojo antes del parche (1 fallas: tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no); el parche no rompió ningún archivo nuevo y pasó node --check.
