# DEC-044 — Curación semanal autónoma de builds: qué cambia sola y qué queda para revisar

- Fecha: 2026-10-30 00:30Z
- Decide: la Factory (técnica, DEC-018), dentro de lo que Pablo aprobó para CUR-1 y DEC-041
- Tarea: BL-082 CUR-1

## Decisión

Una vez por semana (lunes 12:00 UTC, `.github/workflows/builds-watch.yml`), en el repo donde esté (DEV o PRD), un script (`.github/scripts/bld-curate.cjs`) vuelve a leer las fuentes y actualiza solo datos factuales:

1. **Bench** (`bench.json`): se rehace entero desde snowcrows.com/en/benchmarks (máximo, promedio, dificultad, log, élite, daño, bendición).
2. **Catálogo** (`catalog.json`), build por build, desde su página de origen:
   - **Código**: se reemplaza solo si la fuente muestra un código distinto, válido y de la misma profesión y élite (si el que tengo sigue en la página, no se toca). Las armas se toman del código nuevo.
   - **Fecha de la fuente** (`sourceUpdated`): «Updated» de Snow Crows o «last edited» de MetaBattle.
   - **Parche** (`patch`): MetaBattle → el que la página declara; Snow Crows → pasa al último parche solo si la fuente se actualizó después de ese parche. Si no, la build sigue «para revisar»: no se marca como vigente algo que nadie revisó.
   - `reviewed` = día en que algo cambió.
3. Lo que no se puede resolver solo (página 404, sin código, código de otra élite, varios códigos) **no se toca**: queda en `catalog.review` con desde cuándo. Nunca se borran builds ni se agregan nuevas solas (agregar es curación con criterio).

## Frenos

- Si el bench trae menos de 20 filas o menos del 60 % de las que había, no se pisa (la página cambió de forma).
- Si responde menos del 70 % de las páginas del catálogo, no se toca el catálogo.
- Si una página no responde, esa build queda igual.
- Sin novedades no hay commit (una semana tranquila no publica nada).
- Antes de escribir corren los tests; el commit solo puede llevar watch.json, bench.json y catalog.json, y los tres tienen que ser JSON válido.

## Portabilidad (DEC-041)

El workflow no nombra el repo ni la rama: usa la rama por defecto, se saltea en forks y republica con `dev-pages.yml` solo si ese archivo existe (DEV). En PRD, que publica Pages desde la rama, el push alcanza. PRD necesita Actions con permiso de escritura; Discord sigue siendo opcional (DISCORD_WEBHOOK_URL).

## Evidencia

RUN-215 (forma real del HTML) y RUN-216 (prueba en seco contra las fuentes reales: 188 filas de bench idénticas a las curadas a mano en BENCH-1; 25 fichas sin diferencias).
