# STATUS

Estado: EN_CURSO
Tarea actual: BL-013 — PSNA del día equivocado, en autonomía continua acotada
Motivo: Pablo aprobó REQ-007 (opción A): un archivo que solo supera 40 KB ocupa un micro-ciclo completo, como único archivo funcional, con revisión, validación y publicación dedicadas (DEC-021).
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T00:53Z
Última actualización: 2026-10-21T01:07Z
Próxima acción: BL-013c, PSNA: test del cálculo del día. Después BL-013d.

## Micro-ciclo actual

Micro-ciclo: BL-013c — PSNA: test del cálculo del día
Archivos:
- tests/psna-day.test.cjs
- assets/data/psna-schedule.json
BL-013b cerrado: `js/activities.js` v3.21.0 publicado (`bf1480a`). El publicador agregó un salto de línea final que el original no tenía (62 065 bytes en lugar de 62 064): se revalidó el archivo publicado y pasa todo (31 tests, 12/12 mutaciones, arnés).
BL-013c: el test del cálculo del día (9 tests) y la nota de fuente del archivo de datos, que citaba una copia de la wiki con las fechas corridas un día.

Plan, un micro-ciclo por vez:

- G6-A — registrar tu aprobación de REQ-007 y retomar BL-013. Hecho.
- G6-B — anotar en DEC-021 la excepción de archivo grande y liberar el área en discovery. Hecho.
- BL-013b — PSNA: `js/activities.js` calcula el día con la rotación y lee el archivo propio (archivo grande, micro-ciclo dedicado). Hecho.
- BL-013c — PSNA: test del cálculo del día. En curso.
- BL-013d — PSNA: cierre de BL-013 (backlog, riesgo y funcionalidad).

## Esperando a Pablo

- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
