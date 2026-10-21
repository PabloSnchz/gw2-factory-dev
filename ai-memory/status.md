# STATUS

Estado: EN_CURSO
Tarea actual: Registrar la aprobación de REQ-009 (identidad visual de Shiruvana, opción A con avatar más grande)
Motivo: Pablo aprobó usar su imagen como avatar oficial, con reglas de jerarquía y tamaños de 48/56 px. Implementación después de BL-034.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T04:01Z
Última actualización: 2026-10-21T04:06Z
Próxima acción: G10-A, registrar DEC-024 (voz de Shiruvana) y actualizar la propuesta de identidad con los tamaños aprobados. Después G10-B.

## Micro-ciclo actual

Micro-ciclo: G10-A — registrar DEC-024 (voz de Shiruvana) y actualizar la propuesta de identidad con los tamaños aprobados
Archivos:
- ai-memory/decisions/DEC-024-voz-de-shiruvana.md
- ai-memory/missions/FACTORY-DASHBOARD-IDENTITY-001-propuesta.md
- ai-memory/memory-index.md
Solo memoria: la implementación en gw2-factory-dashboard queda en BL-037, después de BL-034.

Plan, un micro-ciclo por vez:

- G10-A — registrar DEC-024 (voz de Shiruvana) y actualizar la propuesta de identidad con los tamaños aprobados. En curso.
- G10-B — procesar RESP-009 y cerrar REQ-009.
- G10-C — agregar BL-037 (implementar la voz de Shiruvana en el panel) a READY y actualizar la capacidad de discovery.

## Esperando a Pablo

- [REQ-009] Info: Ya la aprobaste (opción A, con avatar más grande); la Factory la cierra en G10-B.
- [FEAT-003] Validación: Abrí DEV (https://gw2-factory-dev.vercel.app/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
