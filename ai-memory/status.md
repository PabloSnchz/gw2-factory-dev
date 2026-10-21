# STATUS

Estado: EN_CURSO
Tarea actual: BL-013 — PSNA del día equivocado, en autonomía continua acotada
Motivo: Pablo aprobó REQ-007 (opción A): un archivo que solo supera 40 KB ocupa un micro-ciclo completo, como único archivo funcional, con revisión, validación y publicación dedicadas (DEC-021).
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T00:53Z
Última actualización: 2026-10-21T00:57Z
Próxima acción: G6-B, anotar en DEC-021 la excepción de archivo grande y liberar el área en discovery. Después BL-013b.

## Micro-ciclo actual

Micro-ciclo: G6-B — anotar en DEC-021 la excepción de archivo grande y liberar el área en discovery
Archivos:
- ai-memory/decisions/DEC-021-tamano-de-micro-ciclo.md
- ai-memory/discovery.md
G6-A cerrado: RESP-007 (escrita por el panel, issue #6) procesada con tus condiciones, REQ-007 cerrada y BL-013 en curso.

Plan, un micro-ciclo por vez:

- G6-A — registrar tu aprobación de REQ-007 y retomar BL-013. Hecho.
- G6-B — anotar en DEC-021 la excepción de archivo grande y liberar el área en discovery. En curso.
- BL-013b — PSNA: `js/activities.js` calcula el día con la rotación y lee el archivo propio (archivo grande, micro-ciclo dedicado).
- BL-013c — PSNA: test del cálculo del día.
- BL-013d — PSNA: cierre de BL-013 (backlog, riesgo y funcionalidad).

## Esperando a Pablo

- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
