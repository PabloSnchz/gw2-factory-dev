# STATUS

Estado: EN_CURSO
Tarea actual: BL-038 — Alineación de UI de La Bóveda (FACTORY-BOVEDA-UI-001): marca Gato Negro, theme oficial y mi voz
Motivo: Pablo lo priorizó antes de BL-034 (2026-10-21 04:52Z) y confirmó el enfoque a las 05:00Z (DEC-025). Es producto: lo ve el jugador. Solo DEV.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T05:01Z
Última actualización: 2026-10-21T06:00Z
Próxima acción: BOV-5e, la página de la bio (repo PabloSnchz/bio) con el theme oficial y el gato en el enlace a La Bóveda. Después BOV-5c.

## Micro-ciclo actual

Micro-ciclo: BOV-5d — el enlace a la bio en la cabecera usa los colores oficiales de Gato Negro, fijos (no siguen el theme)
Archivos:
- index.html
- tests/index-identity.test.cjs
Pablo validó la guía básica con el theme (05:53Z) y pidió: el enlace a su bio con los colores oficiales, y la página de la bio (https://pablosnchz.github.io/bio/, repo PabloSnchz/bio) con el theme oficial y el gato en el enlace a La Bóveda. Me dio acceso a ese repo como parte del ecosistema. `index.html` publicado (`e881e38`, archivo grande, solo): lado obsidiana #232A3A con texto #F4F6FA y lado arcano #5A3DDB con texto blanco (6,7:1). Validado en local: 52/52 tests, 2/2 mutaciones.

Plan, un micro-ciclo por vez:

- BOV-1 — registrar DEC-025, BL-038 y el índice. Hecho.
- BOV-2 — theme oficial Gato Negro (css/themes/gato.css) y su test de contraste. Hecho.
- BOV-3 — selector de themes 1.2.0: Gato Negro por defecto y migración de una sola vez. Hecho.
- BOV-4 — gato oficial como asset (assets/brand/gato-negro.svg) y su test. Hecho.
- BOV-5 — index.html: logo, pie, favicon y theme por defecto (archivo grande). Hecho.
- BOV-5b — guía básica con la identidad Gato Negro y el theme activo. Hecho.
- BOV-5d — enlace a la bio con los colores oficiales. En curso.
- BOV-5e — página de la bio (repo bio) con el theme oficial y el gato.
- BOV-5c — guía avanzada con la identidad Gato Negro y el theme activo.
- BOV-6 — mi componente de voz en La Bóveda y su test.
- BOV-7 — mi voz en la bienvenida, el modal de API Keys y la ayuda.
- BOV-8 — cierre: funcionalidad, backlog y estado.

## Esperando a Pablo

- [FEAT-003] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://pablosnchz.github.io/gw2-factory-dev/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
