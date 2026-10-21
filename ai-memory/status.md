# STATUS

Estado: EN_CURSO
Tarea actual: BL-038 — Alineación de UI de La Bóveda (FACTORY-BOVEDA-UI-001): marca Gato Negro, theme oficial y mi voz
Motivo: Pablo lo priorizó antes de BL-034 (2026-10-21 04:52Z) y confirmó el enfoque a las 05:00Z (DEC-025). Es producto: lo ve el jugador. Solo DEV.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T05:01Z
Última actualización: 2026-10-21T06:15Z
Próxima acción: BOV-6, mi componente de voz en La Bóveda y su test. Después BOV-7.

## Micro-ciclo actual

Micro-ciclo: BOV-5c — la guía avanzada (docs/user-guide-avanzado.html) usa el gato oficial, el favicon y el theme que eligió el jugador
Archivos:
- docs/user-guide-avanzado.html
- tests/guides-identity.test.cjs
Pablo validó la bio (repo PabloSnchz/bio, `9551c57`) y el enlace con los colores oficiales (06:07Z). Anunció que si BOV-5c, BOV-6 y BOV-7 salen bien, hago mi primer pase a producción con estos cambios (espero su orden explícita). Más adelante también voy a cuidar La Guarida del Gato Negro, su multi-launcher; todavía sin repo. BOV-5c validado en local: 55/55 tests, 3/3 mutaciones.

Plan, un micro-ciclo por vez:

- BOV-1 — registrar DEC-025, BL-038 y el índice. Hecho.
- BOV-2 — theme oficial Gato Negro (css/themes/gato.css) y su test de contraste. Hecho.
- BOV-3 — selector de themes 1.2.0: Gato Negro por defecto y migración de una sola vez. Hecho.
- BOV-4 — gato oficial como asset (assets/brand/gato-negro.svg) y su test. Hecho.
- BOV-5 — index.html: logo, pie, favicon y theme por defecto (archivo grande). Hecho.
- BOV-5b — guía básica con la identidad Gato Negro y el theme activo. Hecho.
- BOV-5d — enlace a la bio con los colores oficiales. Hecho.
- BOV-5e — página de la bio (repo bio) con el theme oficial y el gato. Hecho.
- BOV-5c — guía avanzada con la identidad Gato Negro y el theme activo. En curso.
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
