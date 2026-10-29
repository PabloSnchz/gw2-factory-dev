# DEC-041 — Los flujos que actualizan datos corren solos en DEV y en PRD

- Fecha: 2026-10-29 18:47Z
- Decide: Pablo (al aprobar CUR-1 en BL-082)
- Tarea: BL-082 (CUR-1) y toda funcionalidad futura con actualización automática

## Decisión

Cualquier funcionalidad que actualice información sola (la vigía semanal de builds, la curación semanal CUR-1 y las que vengan) tiene que existir y correr de forma autónoma en DEV y en PRD, escribiendo en su propio repo. PRD no depende de que la Factory la mantenga desde DEV: eso sería un costo de mantenimiento.

## Cómo se aplica

1. Los workflows y scripts de actualización se escriben portátiles: sin el nombre del repo fijo (hoy `builds-watch.yml` tiene `if: github.repository == 'PabloSnchz/gw2-factory-dev'` y republica con `dev-pages.yml`: se corrige en CUR-1), publicando en el sitio de cada repo.
2. Al preparar un pasaje a PRD (siempre a pedido de Pablo, DEC-036) el manifiesto incluye esos workflows y scripts, y el informe dice qué tiene que habilitar Pablo en PRD (permiso de escritura de Actions, secretos opcionales como DISCORD_WEBHOOK_URL).
3. Cada flujo pasa por la suite de tests antes de escribir y deja registrado qué cambió; si algo falla, no escribe.

## Fuera de alcance

La Factory sigue sin tocar PRD por su cuenta: esta decisión define cómo quedan las cosas cuando Pablo pide el pasaje.
