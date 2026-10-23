# STATUS

Estado: EN CURSO
Tarea actual: BL-057 — cierre de MET-1b: se retira el workflow de recuperación de imágenes y se registra la decisión de Pablo; después MET-1c y MET-2.
Motivo: Pablo (2026-10-23 02:47Z, confirmado 02:51Z y 03:29Z) cerró MET-1b con una decisión de producto definitiva: las vistas previas que faltan quedan como deuda visual, no se investiga más Internet Archive, Wayback ni fuentes alternativas y no se construye más infraestructura de recuperación. La prioridad vuelve a ser BL-057.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 03:33Z
Próxima acción: MET-1b cierre (este micro-ciclo) → memoria (DEC-031, backlog) → MET-1c `meta.js` 4.0.1: vistas previas desde `assets/previews/` y estado «sin vista previa» limpio → MET-2 `meta-theme.js` 2.0.0.
Recuperación (2026-10-23 02:47Z–03:28Z): la sesión estuvo sin herramientas de contenido de GitHub; nada se publicó en ese lapso. Pablo agregó el GitHub MCP Server a las 03:28Z y retomo desde el repo (HEAD `e775d97`).

Micro-ciclo (en curso, checkpoint de este commit):
MET-1b cierre — se retira la recuperación automática de imágenes para que no vuelva a correr: se borran el workflow, la herramienta y su test, en serie (primero el test, que lee a los otros dos). `tools/meta-previews/REPORTE.md` queda como registro del origen y la licencia de las imágenes ya guardadas.
Archivos:
- tests/meta-previews.test.cjs
- .github/workflows/meta-previews.yml
- tools/meta-previews/build_previews.py

Último hecho: MET-1b (01:33Z–01:59Z). El workflow dejó en `assets/previews/` 8 de las 10 vistas previas en WebP (las 2 de La Bóveda y 6 de la wiki); faltan Chak (`chak_gerent`) y Dragon's End (`dragons_end`). `meta-drops.json` todavía apunta a la wiki: lo corrige MET-1c.

Plan BL-057 (Meta & Eventos):

- MET-0 propuesta visual. Aprobada por Pablo (00:39Z): la vista previa de infusiones se queda; «Vista compacta» se va.
- MET-1 `meta.js` 4.0.0 (`e98a25a`, test `8838217`). Aprobado por Pablo (01:20Z) salvo las vistas previas.
- MET-1b vistas previas servidas desde La Bóveda. CERRADO por decisión de Pablo (02:47Z): 8 de 10 quedaron en `assets/previews/`; las 2 que faltan son deuda visual. Prohibido seguir investigando o recuperando imágenes.
- MET-1b cierre: retirar workflow, herramienta y test (este micro-ciclo).
- MET-1c `meta.js` 4.0.1 + `meta-drops.json`: las 8 desde `assets/previews/`; las 2 que faltan y cualquier imagen que no cargue muestran un estado «sin vista previa» limpio, con el lenguaje del GDS, nunca la imagen rota ni el texto alternativo suelto.
- MET-2 `meta-theme.js` 2.0.0: cabecera nueva (relojes, resets, «Hoy en tu cuenta») y mis mensajes según el momento, con el diseño de la Cartera.
- MET-3 cierre: FEAT, backlog, CHANGELOG-FACTORY.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `e775d97`).

## Resumen de la sesión

- Metas y Eventos renovado en DEV (BL-057, MET-1): arriba «Ahora» con lo que está en curso o empieza en 20 min, después la agenda de las próximas 3 horas, tus Fijadas (hasta 6) y todas las metas agrupadas por expansión. La vista previa de infusiones se quedó. «Hecho hoy» aparece solo donde la API lo sabe y todo se actualiza solo cada 30 s. Falta MET-2: la cabecera nueva y mis mensajes.
- La Cartera renovada está en producción (BL-056, REQ-011): 4 pasos en el mismo orden que DEV, cada archivo idéntico al validado. Vuelta atrás lista en la rama `rollback/pre-cartera`.
- La Cartera renovada quedó cerrada (BL-056, FEAT-006): Mi cartera, Cambio de divisas y Todas las cuentas en una sola pantalla con pestañas. Una preferencia nueva en el navegador: `gn:wallet:hidezero` («ocultar en cero»).
- Pablo archivó los dos repos del legado. El Gist queda deprecado (DEC-030) y el respaldo va a una nube que todos tengan (DISC-009); Homestead pasa a módulo propio (BL-055).
- Migración del legado de QwenPaw terminada (BL-043): 73 de sus 88 tests protegen DEV y los generadores de la Armería reproducen el catálogo.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] MET-1b cerrado como pediste: 8 de 10 vistas previas ya están guardadas en La Bóveda; las 2 que faltan quedan como deuda visual con un aviso limpio. No se investiga más.
- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
