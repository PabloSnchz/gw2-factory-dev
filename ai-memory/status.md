# STATUS

Estado: EN_CURSO
Tarea actual: BL-037 — Voz de Shiruvana en el panel (gw2-factory-dashboard)
Motivo: Pablo ordenó implementarla ahora (2026-10-21 04:14Z), antes de BL-034. Es una orden explícita: no cuenta contra el 15 % de soporte (DEC-023 §4) y prevalece sobre el orden anterior (DEC-022).
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T04:15Z
Última actualización: 2026-10-21T04:24Z
Próxima acción: BL-037a, parse.js lee el resumen de la sesión de status.md (dashboard). Después BL-037b.

## Micro-ciclo actual

Micro-ciclo: BL-037a — parse.js lee el resumen de la sesión de status.md (dashboard)
Archivos:
- gw2-factory-dashboard: js/parse.js
- gw2-factory-dashboard: tests/parse.test.mjs
Regla de marca (DEC-024 §1): la cabecera del panel (brandMark, nombre y subtítulo) no se toca en ningún micro-ciclo.

Plan, un micro-ciclo por vez:

- BL-037a — parse.js lee el resumen de la sesión de status.md (dashboard). En curso.
- BL-037b — componente gds-voice y avatar oficial en el GDS (dashboard).
- BL-037c — tests y documentación del componente en el GDS (dashboard).
- BL-037d — views.js usa la voz de Shiruvana: recomienda, advierte, decidió y resume (dashboard, archivo grande).
- BL-037e — tests del panel para la voz de Shiruvana (dashboard).
- BL-037f — versiones en index.html, CHANGELOG y README (dashboard).
- BL-037g — cierre en memoria: backlog, FEAT-001 y roadmap.

## Esperando a Pablo

- [FEAT-003] Validación: Abrí DEV (https://gw2-factory-dev.vercel.app/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
