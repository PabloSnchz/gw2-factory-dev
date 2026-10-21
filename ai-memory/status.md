# STATUS

Estado: IDLE
Tarea actual: ninguna. BL-040 cerrada: La Guarida tiene la identidad Gato Negro.
Motivo: Pablo me dio La Guarida (2026-10-21 06:51Z) con la misma misión que La Bóveda. Con esto, todo el ecosistema (Bóveda, panel, bio y Guarida) lleva la misma marca y el mismo theme oficial.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION (cerrada)
Inicio: 2026-10-21T06:55Z
Última actualización: 2026-10-21T07:05Z
Próxima acción: BL-034 (metas de Janthir Wilds y Visions of Eternity).

## Resumen de la sesión

- Primer deploy a producción: La Bóveda tiene la marca Gato Negro, el theme oficial y mi voz (FEAT-004, BL-039).
- La Guarida (https://pablosnchz.github.io/la-guarida/) lleva el gato oficial, el theme Gato Negro por defecto (Bóveda queda como opción) y la bio con los colores oficiales; además, el theme guardado ahora se aplica al recargar.
- Encontré credenciales de Twitch y YouTube publicadas en el código de La Guarida (RSK-019): necesito que las revoques o restrinjas.

Plan, un micro-ciclo por vez:

- GUA-1 a GUA-3 — gato y theme, migración y theme al abrir, index.html. Hecho.
- GUA-4 — cierre: backlog, riesgos y estado. Hecho.

## Esperando a Pablo

- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.
- [FEAT-004] Validación: Abrí producción (https://pablosnchz.github.io/gw2-wallet-ligero/), en pantalla y en el celular. Fijate que aparezco en Inicio, en Gestión de API Keys y en Guía, y que el gato y el theme Gato Negro están en la app y en las dos guías.
- [FEAT-003] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://pablosnchz.github.io/gw2-factory-dev/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [BL-040] La Guarida: si no ves el cambio, recargá con Ctrl+F5. Tus favoritos, categorías y widgets no se tocaron.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
