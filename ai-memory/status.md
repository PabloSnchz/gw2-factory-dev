# STATUS

Estado: EN_CURSO
Tarea actual: GV-1 y BL-013 en autonomía continua acotada (autorizado por Pablo al aprobar FACTORY-GOVERNANCE-004)
Motivo: Pablo aprobó FACTORY-GOVERNANCE-004 y autorizó GV-1a a GV-1d y luego BL-013 sin pedir nueva autorización. Límites de DEC-021: 1 objetivo, ≤ 3 archivos, escrituras en serie.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T00:26Z
Última actualización: 2026-10-21T01:00Z
Próxima acción: BL-013x, PSNA: registrar que BL-013b supera el límite de 40 KB y preguntarte (REQ-007). Después BL-013b.

## Micro-ciclo actual

Micro-ciclo: BL-013x — PSNA: registrar que BL-013b supera el límite de 40 KB y preguntarte (REQ-007)
Archivos:
- ai-memory/requests/REQ-007-archivos-grandes.md
- ai-memory/backlog.md
- ai-memory/discovery.md
BL-013a cerrado: rotación verificada y test de datos publicados. BL-013b necesita cambiar `js/activities.js` (59,6 KB), que supera el máximo de 40 KB de DEC-021: en lugar del código, este micro-ciclo registra el bloqueo y te pregunta (REQ-007).

Plan, un micro-ciclo por vez:

- GV-1a — registrar tu aprobación de REQ-005 (RESP-005 y cierre del pedido). Hecho.
- G5-A — registrar DEC-022 (conflictos entre reglas) y la aprobación de FACTORY-GOVERNANCE-004. Hecho.
- GV-1b — reclasificar pendientes: FEAT-002, DEC-018 y DEC-019 según v2. Hecho.
- GV-1c — bloqueos con dueño y áreas en discovery (backlog y discovery). Hecho.
- GV-1d — CI verifica la gobernanza nueva y la propuesta 001 queda APROBADA. Hecho.
- BL-013a — PSNA: rotación semanal verificada contra la wiki, con su test de datos. Hecho.
- BL-013x — PSNA: registrar que BL-013b supera el límite de 40 KB y preguntarte (REQ-007). En curso.
- BL-013b — PSNA: cálculo del día con la rotación y su test (espera REQ-007).
- BL-013c — PSNA: lectura del archivo propio y su test.
- BL-013d — PSNA: documentación y cierre de BL-013.

## Esperando a Pablo

- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
