# STATUS

Estado: EN_CURSO
Tarea actual: BL-013 — PSNA del día equivocado, en autonomía continua acotada
Motivo: Pablo aprobó REQ-007 (opción A): un archivo que solo supera 40 KB ocupa un micro-ciclo completo, como único archivo funcional, con revisión, validación y publicación dedicadas (DEC-021).
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T00:53Z
Última actualización: 2026-10-21T01:12Z
Próxima acción: BL-013d, PSNA: FEAT-003 y la lección LES-026, con su índice. Después BL-013e.

## Micro-ciclo actual

Micro-ciclo: BL-013d — PSNA: FEAT-003 y la lección LES-026, con su índice
Archivos:
- ai-memory/features/FEAT-003-psna-dia-correcto.md
- ai-memory/lessons/LES-026-fuentes-en-desacuerdo.md
- ai-memory/memory-index.md
BL-013c cerrado: `tests/psna-day.test.cjs` publicado (9 tests) y nota de fuente corregida en `assets/data/psna-schedule.json`. En CI corren 4 archivos de test: memoria (19), datos y cálculo del PSNA (3 y 9) y Analytics (5).
Orden: FEAT-003 y LES-026 antes que el backlog, para que ninguna referencia quede rota (DEC-021 §2.3).

Plan, un micro-ciclo por vez:

- G6-A — registrar tu aprobación de REQ-007 y retomar BL-013. Hecho.
- G6-B — anotar en DEC-021 la excepción de archivo grande y liberar el área en discovery. Hecho.
- BL-013b — PSNA: `js/activities.js` calcula el día con la rotación y lee el archivo propio (archivo grande, micro-ciclo dedicado). Hecho.
- BL-013c — PSNA: test del cálculo del día. Hecho.
- BL-013d — PSNA: FEAT-003 y la lección LES-026, con su índice. En curso.
- BL-013e — PSNA: cierre de BL-013 en backlog, riesgos y roadmap.

## Esperando a Pablo

- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
