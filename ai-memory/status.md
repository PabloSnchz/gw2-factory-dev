# STATUS

Estado: EN_CURSO
Tarea actual: BL-038 — Alineación de UI de La Bóveda (FACTORY-BOVEDA-UI-001): marca Gato Negro, theme oficial y mi voz
Motivo: Pablo lo priorizó antes de BL-034 (2026-10-21 04:52Z) y confirmó el enfoque a las 05:00Z (DEC-025). Es producto: lo ve el jugador. Solo DEV.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T05:01Z
Última actualización: 2026-10-21T05:20Z
Próxima acción: BOV-3, selector de themes 1.2.0: Gato Negro por defecto y migración de una sola vez. Después BOV-4.

## Micro-ciclo actual

Micro-ciclo: BOV-3 — selector de themes 1.2.0: Gato Negro por defecto y migración de una sola vez
Archivos:
- js/theme-selector.js
- tests/theme-selector.test.cjs
BOV-2 publicado: `css/themes/gato.css` (`b553040`) y su test (`9ebf376`). BOV-3 validado en local: 42/42 tests, 7/7 mutaciones. Hasta BOV-5 el index.html sigue pidiendo la versión 1.1.0 del selector; el cambio se ve en DEV después de BOV-5.

Plan, un micro-ciclo por vez:

- BOV-1 — registrar DEC-025, BL-038 y el índice. Hecho.
- BOV-2 — theme oficial Gato Negro (css/themes/gato.css) y su test de contraste. Hecho.
- BOV-3 — selector de themes 1.2.0: Gato Negro por defecto y migración de una sola vez. En curso.
- BOV-4 — gato oficial como asset (assets/brand/gato-negro.svg) y su test.
- BOV-5 — index.html: logo, pie, favicon y theme por defecto (archivo grande).
- BOV-6 — mi componente de voz en La Bóveda y su test.
- BOV-7 — mi voz en la bienvenida, el modal de API Keys y la ayuda.
- BOV-8 — cierre: funcionalidad, backlog y estado.

## Esperando a Pablo

- [FEAT-003] Validación: Abrí DEV (https://gw2-factory-dev.vercel.app/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
