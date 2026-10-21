# STATUS

Estado: IDLE
Tarea actual: ninguna. BL-034 cerrada: Meta & Eventos tiene las metas de Janthir Wilds y Visions of Eternity (FEAT-005, solo DEV).
Motivo: Pablo lo pidió (2026-10-21). Faltaban las metas de JW y casi todas las de VoE, Secretos del Bosque tenía horarios incorrectos, Monte Balrior figuraba como SotO y el filtro "Convergence" no mostraba nada.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION (cerrada)
Inicio: 2026-10-21T07:10Z
Última actualización: 2026-10-21T07:30Z
Próxima acción: BL-041 (metas que cruzan la medianoche UTC), salvo que Pablo priorice otra cosa.

Plan BL-034, un micro-ciclo por vez:

- MET-1 — datos y tests (`b04ffbf`). Hecho.
- MET-2 — filtro de expansión desde los datos en `js/meta.js` 3.5.0 (`faaee56`) y sus tests (`c6b24b6`). Hecho. `index.html` (69 KB) no entraba en una publicación: LES-028.
- MET-3 — cierre: FEAT-005, LES-028, backlog, riesgos y estado. Hecho.

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
