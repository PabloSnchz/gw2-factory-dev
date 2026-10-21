# STATUS

Estado: EN_CURSO
Tarea actual: BL-042 — FEAT-005 a producción, por orden de Pablo (2026-10-21 07:30Z). Después, FACTORY-ASSET-001.
Motivo: Pablo validó FEAT-005 ("quedó perfecto") y ordenó promoverla.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T07:31Z
Última actualización: 2026-10-21T07:31Z
Próxima acción: PRD-1.

Plan BL-042 (gw2-wallet-ligero, copia de contenido desde DEV, cada commit deja el sitio funcionando). Vuelta atrás: `4629e7e` (meta-events.json `f612bebf`, meta.js `15da703c`).

- PRD-1 — `assets/meta-events.json` (blob `cd504a6a`). Con el `meta.js` anterior funciona igual: las metas nuevas se ven en "Todas".
- PRD-2 — `js/meta.js` 3.5.0 (blob `188c80ee`): filtro de expansión desde los datos y versión nueva del JSON.
- PRD-3 — cierre: FEAT-005 en producción, backlog y estado.

Después: FACTORY-ASSET-001 — analizar gw2-wallet-agents y gw2-agents-dashboard (QwenPaw dado de baja por Pablo el 2026-10-21; los dos repos quedan para mí). Solo proponer, no migrar.

## Resumen de la sesión

- Meta & Eventos en DEV: 5 metas nuevas de Janthir Wilds y Visions of Eternity, la Convergencia del Nexo de la Eternidad, Secretos del Bosque cada 2 h, Monte Balrior en Janthir y el filtro "Convergence" funcionando (FEAT-005, BL-034).
- Primer deploy a producción: La Bóveda tiene la marca Gato Negro, el theme oficial y mi voz (FEAT-004, BL-039).
- La Guarida (https://pablosnchz.github.io/la-guarida/) lleva el gato oficial, el theme Gato Negro por defecto (Bóveda queda como opción) y la bio con los colores oficiales; además, el theme guardado ahora se aplica al recargar.
- Encontré credenciales de Twitch y YouTube publicadas en el código de La Guarida (RSK-019): necesito que las revoques o restrinjas.

## Esperando a Pablo

- [FEAT-005] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/) → Meta & Eventos. En Expansión elegí "Visions of Eternity" (5 tarjetas) y "Janthir Wilds" (3); en Tipo elegí "Convergence" (3). Si estás en el juego, compará una meta con su horario real.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.
- [FEAT-004] Validación: Abrí producción (https://pablosnchz.github.io/gw2-wallet-ligero/), en pantalla y en el celular. Fijate que aparezco en Inicio, en Gestión de API Keys y en Guía, y que el gato y el theme Gato Negro están en la app y en las dos guías.
- [FEAT-003] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://pablosnchz.github.io/gw2-factory-dev/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [BL-040] La Guarida: si no ves el cambio, recargá con Ctrl+F5. Tus favoritos, categorías y widgets no se tocaron.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
