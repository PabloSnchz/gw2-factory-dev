# STATUS

Estado: EN_CURSO
Tarea actual: FACTORY-ASSET-001 — analizar gw2-wallet-agents y gw2-agents-dashboard y proponer qué conservar, archivar y migrar. Solo proponer: no migrar ni escribir en esos repos.
Motivo: Pablo dio de baja a QwenPaw (2026-10-21 07:30Z). Soy la única operadora del ecosistema y los dos repos, con todo lo que exploró el modelo anterior, quedan para mí.
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T07:37Z
Última actualización: 2026-10-21T07:37Z
Próxima acción: ASSET-1.

Plan FACTORY-ASSET-001 (lectura de los dos repos; escribo solo en gw2-factory-dev):

- ASSET-1 — inventario de los dos repos: estructura, documentos, herramientas, workflows y actividad.
- ASSET-2 — clasificar: conocimiento, documentación, herramientas; qué archivar y qué migrar, con motivo.
- ASSET-3 — informe `missions/FACTORY-ASSET-001-informe.md` y propuesta a Pablo.

Hecho antes, BL-042: FEAT-005 en producción (gw2-wallet-ligero `36010ab`, `2bab20f`; vuelta atrás `4629e7e`).

## Resumen de la sesión

- FEAT-005 en producción por orden de Pablo (BL-042).
- Meta & Eventos en DEV: 5 metas nuevas de Janthir Wilds y Visions of Eternity, la Convergencia del Nexo de la Eternidad, Secretos del Bosque cada 2 h, Monte Balrior en Janthir y el filtro "Convergence" funcionando (FEAT-005, BL-034).
- Primer deploy a producción: La Bóveda tiene la marca Gato Negro, el theme oficial y mi voz (FEAT-004, BL-039).
- La Guarida (https://pablosnchz.github.io/la-guarida/) lleva el gato oficial, el theme Gato Negro por defecto (Bóveda queda como opción) y la bio con los colores oficiales; además, el theme guardado ahora se aplica al recargar.
- Encontré credenciales de Twitch y YouTube publicadas en el código de La Guarida (RSK-019): necesito que las revoques o restrinjas.

## Esperando a Pablo

- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.
- [FEAT-004] Validación: Abrí producción (https://pablosnchz.github.io/gw2-wallet-ligero/), en pantalla y en el celular. Fijate que aparezco en Inicio, en Gestión de API Keys y en Guía, y que el gato y el theme Gato Negro están en la app y en las dos guías.
- [FEAT-003] Validación: Abrí DEV (https://pablosnchz.github.io/gw2-factory-dev/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://pablosnchz.github.io/gw2-factory-dev/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [BL-042] Metas en producción: si no ves Visions of Eternity en el filtro, recargá con Ctrl+F5.
- [BL-040] La Guarida: si no ves el cambio, recargá con Ctrl+F5. Tus favoritos, categorías y widgets no se tocaron.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
