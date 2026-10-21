# STATUS

Estado: EN_CURSO
Tarea actual: BL-040 — Identidad Gato Negro en La Guarida (PabloSnchz/la-guarida): gato oficial, theme oficial y bio
Motivo: Pablo me dio La Guarida (2026-10-21 06:51Z) con la misma misión que La Bóveda, antes de las tareas pendientes. Es su lanzador personal y se publica al instante en GitHub Pages.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T06:55Z
Última actualización: 2026-10-21T06:58Z
Próxima acción: GUA-2 — js/data.js v8 y js/app.js v3.1: Gato Negro por defecto, migración de una sola vez y el theme guardado se aplica al abrir.

## Micro-ciclo actual

Micro-ciclo: GUA-1 — gato oficial y theme Gato Negro (assets/brand/gato-negro.svg, css/themes/gato.css)
Repositorio: la-guarida
El repo no tiene tests: lo verifico en local (8 pruebas de migración, theme al abrir, contraste AA y marca; 4 fallan contra el código anterior, como corresponde). Mi voz no va acá: La Guarida es tu lanzador personal y no tiene lugares donde le hable a un jugador nuevo.
Vuelta atrás: la-guarida `20cb59c` (index.html `61469144`, js/app.js `c0da10e5`, js/data.js `f48310e4`).

Plan, un micro-ciclo por vez:

- GUA-1 — gato oficial y theme Gato Negro (assets/brand/gato-negro.svg, css/themes/gato.css). En curso.
- GUA-2 — js/data.js v8 y js/app.js v3.1: Gato Negro por defecto, migración de una sola vez y el theme guardado se aplica al abrir.
- GUA-3 — index.html: logo, favicon, tipografía de la marca, Gato Negro en el selector (Bóveda queda) y la bio con los colores oficiales.
- GUA-4 — cierre: backlog, estado y aviso de credenciales expuestas.

## Esperando a Pablo

- [FEAT-004] Validación: Abrí producción (https://pablosnchz.github.io/gw2-wallet-ligero/), en pantalla y en el celular. Fijate que aparezco en Inicio, en Gestión de API Keys y en Guía, y que el gato y el theme Gato Negro están en la app y en las dos guías.
- [FEAT-003] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://pablosnchz.github.io/gw2-factory-dev/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
