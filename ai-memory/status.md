# STATUS

Estado: EN_CURSO
Tarea actual: FACTORY-OPS-001 — diseñar el modelo operativo de largo plazo (solo análisis y propuesta, sin implementar)
Motivo: Pablo pidió definir cómo opera Shiruvana durante semanas sin supervisión constante: arranque, elección de trabajo, Discovery, detención, scheduler, sesiones y métricas.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T03:23Z
Última actualización: 2026-10-21T03:30Z
Próxima acción: OPS-A, publicar `missions/FACTORY-OPS-001-modelo-operativo.md` y REQ-008. Después, cierre de sesión. BL-034 sigue siendo la próxima tarea de producto.

## Micro-ciclo actual

Micro-ciclo: OPS-A — publicar la propuesta del modelo operativo y su pedido de decisión
Archivos:
- ai-memory/missions/FACTORY-OPS-001-modelo-operativo.md
- ai-memory/requests/REQ-008-modelo-operativo.md
Orden: primero la propuesta, después el pedido que la cita.

## Esperando a Pablo

- [FEAT-003] Validación: Abrí DEV (https://gw2-factory-dev.vercel.app/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
