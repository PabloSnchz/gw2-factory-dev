# STATUS

Estado: EN_CURSO
Tarea actual: BL-039 — Promoción de FEAT-004 a producción (gw2-wallet-ligero): theme oficial, marca Gato Negro y mi voz
Motivo: orden explícita de Pablo (2026-10-21 06:33Z): "vamos a PRD con todo lo nuevo, el tema gato oficial, la imagen de marca y la expansión de Shiruvana a la webapp". Es mi primer deploy a producción.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T06:35Z
Última actualización: 2026-10-21T06:40Z
Próxima acción: PRD-2 — mi voz: js/shiruvana.js y js/shiruvana-places.js (inertes hasta PRD-5).

## Micro-ciclo actual

Micro-ciclo: PRD-1 — theme oficial y gato: css/themes/gato.css, assets/brand/gato-negro.svg, js/theme-selector.js 1.2.0
Repositorio: gw2-wallet-ligero (producción, por orden de Pablo)
Archivos: css/themes/gato.css, assets/brand/gato-negro.svg, js/theme-selector.js. Son los mismos blobs verificados en DEV (672c21b7, 319f1b62, 8b8c8b7e). El selector migra una sola vez a Gato Negro y gato.css llega en el mismo commit.

Alcance: solo FEAT-004. Quedan fuera FEAT-003 (PSNA, espera tu validación) y el cargador de GA de DEV (DEC-006): en producción GA sigue exactamente como está.
Vuelta atrás: producción antes de empezar está en `c0471e0` (index.html `41b65b8b`, js/theme-selector.js `a7d0457a`, docs/user-guide.html `aac11f59`, docs/user-guide-avanzado.html `214cd6ef`). Los archivos nuevos se borran.

Plan, un micro-ciclo por vez (escrituras en serie, cada commit deja el sitio funcionando):

- PRD-1 — theme oficial y gato: css/themes/gato.css, assets/brand/gato-negro.svg, js/theme-selector.js 1.2.0. En curso.
- PRD-2 — mi voz: js/shiruvana.js y js/shiruvana-places.js (inertes hasta PRD-5).
- PRD-3 — guía básica con la identidad Gato Negro.
- PRD-4 — guía avanzada con la identidad Gato Negro.
- PRD-5 — index.html de producción: marca, theme, bio y mi voz (archivo grande; el bloque de GA de producción no se toca).
- PRD-6 — cierre: FEAT-004 promovida, backlog, estado.

## Esperando a Pablo

- [FEAT-003] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://pablosnchz.github.io/gw2-factory-dev/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).