# STATUS

Estado: EN_CURSO
Tarea actual: FACTORY-GOVERNANCE-002 — GV-1: registrar la gobernanza aprobada (REQ-005) en memoria y CI
Motivo: Pablo aprobó REQ-005 en la conversación con un cambio: la ronda forzada de discovery es a los 14 días sin investigar, no a los 7. Se registra su respuesta (RESP-005), las decisiones y lecciones aprobadas, la reclasificación de pendientes y los chequeos en CI. Después, trabajo de producto: BL-013.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-20T18:27Z
Última actualización: 2026-10-20T18:30Z
Próxima acción: GV-1 — RESP-005 y REQ-005; DEC-019, DEC-020, LES-023, LES-024; reclasificar pendientes y bloqueos con dueño; campo Área en discovery; tests de CI (clase obligatoria, justificación, máximo 3 decisiones abiertas). Cierra BL-036.

## Plan de micro-ciclos (FACTORY-GOVERNANCE-002)

- GV-1 — Memoria y CI de la gobernanza aprobada. Cierra BL-036 (absorbe su SD-3). EN CURSO.
- BL-013 — PSNA del día equivocado (producto primero).
- GV-2 — Panel: bloqueos por dueño, "Para mirar", avisos que vencen, "La Factory decidió…".
- GV-3 — Vista "Ideas" de solo lectura, con análisis y promoción explícitos.

## Esperando a Pablo

- [FEAT-002] Validación: Abrí DEV en https://gw2-factory-dev.vercel.app/ y confirmá que no carga Google Analytics (en la consola, `window.__gaEnabled` vale `false`).
- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).

## Para tu información

- [RSK-016] La Factory no puede ver el resultado de CI. No hace falta que lo revises: si alguna vez ves `app-checks` en rojo en GitHub Actions, avisá.

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
