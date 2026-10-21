# STATUS

Estado: EN_CURSO
Tarea actual: BL-038 — Alineación de UI de La Bóveda (FACTORY-BOVEDA-UI-001): marca Gato Negro, theme oficial y mi voz
Motivo: Pablo lo priorizó antes de BL-034 (2026-10-21 04:52Z) y confirmó el enfoque a las 05:00Z (DEC-025). Es producto: lo ve el jugador. Solo DEV.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T05:01Z
Última actualización: 2026-10-21T06:50Z
Próxima acción: BOV-8, cierre de la misión (funcionalidad, backlog, riesgos y resumen). Después, validación de Pablo en DEV y su decisión sobre producción.

## Micro-ciclo actual

Micro-ciclo: BOV-7b — index.html carga mi voz (archivo grande, único archivo funcional)
Archivos:
- index.html
- tests/index-identity.test.cjs
BOV-7a publicado (`57dd06c`). Los dos scripts van al final de los módulos, antes del router: después de la bienvenida y sin correr de lugar ninguna línea anterior (hay tests que anclan líneas de index.html por posición). Con esto aparezco en DEV en la bienvenida, el modal de API Keys y el de guías. Validado en local: 70/70 tests, 2/2 mutaciones.

Plan, un micro-ciclo por vez:

- BOV-1 — registrar DEC-025, BL-038 y el índice. Hecho.
- BOV-2 — theme oficial Gato Negro (css/themes/gato.css) y su test de contraste. Hecho.
- BOV-3 — selector de themes 1.2.0: Gato Negro por defecto y migración de una sola vez. Hecho.
- BOV-4 — gato oficial como asset (assets/brand/gato-negro.svg) y su test. Hecho.
- BOV-5 — index.html: logo, pie, favicon y theme por defecto (archivo grande). Hecho.
- BOV-5b — guía básica con la identidad Gato Negro y el theme activo. Hecho.
- BOV-5d — enlace a la bio con los colores oficiales. Hecho.
- BOV-5e — página de la bio (repo bio) con el theme oficial y el gato. Hecho.
- BOV-5c — guía avanzada con la identidad Gato Negro y el theme activo. Hecho.
- BOV-6 — mi componente de voz en La Bóveda y su test. Hecho.
- BOV-7a — dónde le hablo al jugador: bienvenida, API Keys y guías. Hecho.
- BOV-7b — index.html carga mi voz (archivo grande). En curso.
- BOV-8 — cierre: funcionalidad, backlog y estado.

## Esperando a Pablo

- [FEAT-003] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://pablosnchz.github.io/gw2-factory-dev/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
