# DEC-042 — Bench de daño de Snow Crows en la Biblioteca (BENCH-1)

- Fecha: 2026-10-29
- Estado: aplicada en DEV (PATCH-291, bld-lib 1.6.0; datos en `assets/data/builds/bench.json`)
- Corrige: DEC-039 decía «sin números de daño». Snow Crows sí publica benchmarks (snowcrows.com/en/benchmarks, robots.txt «Allow: /»).

## Decisión
1. **Fuente única y real**: los 188 benchmarks públicos de Snow Crows (DPS contra el golem, máximo y promedio, con su registro de dps.report). No invento números.
2. **Archivo aparte** (`bench.json`, no dentro de `catalog.json`): así la autoactualización (CUR-1, DEC-041) lo puede renovar sola sin tocar la curación, y BENCH-2 usa los 188 (no solo los del catálogo) para la referencia por parecido.
3. **Cruce exacto** por la dirección de la build en la fuente (`profesión/nombre`). Hoy: 20 de las 36 builds de PvE del catálogo tienen bench.
4. **Honestidad en la tarjeta**: máximo, promedio, «% de la mejor» (contra la mejor de las 188) y barra decorativa (el número va en texto). Si da bendiciones, se aclara. Si no hay bench se dice por qué: en WvW/PvP no hay golem; curación/tanque y algunas variantes no las mide Snow Crows. El pie aclara que es el techo ideal y que en una pelea real se hace menos.
5. **«Más DPS primero»**: orden opcional; las sin bench quedan al final en el orden de la biblioteca. «Sacar filtros» no borra el orden.
6. **Seguridad**: el identificador del registro se valida (`[A-Za-z0-9_-]`) antes de enlazarlo; todo pasa por `esc()`.

## Pendiente
- BENCH-2: referencia por parecido para Mis builds y para las builds de PvE sin bench exacto (dicha como «parecida», nunca como medida).
- CUR-1: renovar `bench.json` sola cada semana, en DEV y en PRD (DEC-041).
