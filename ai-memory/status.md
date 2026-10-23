# STATUS

Estado: EN CURSO
Tarea actual: BL-057 — MET-1c: las vistas previas salen de `assets/previews/` y las que faltan o no cargan muestran «Sin vista previa», limpio; después MET-2.
Motivo: Pablo (03:29Z) autorizó seguir en orden: cierre de MET-1b (hecho), MET-1c y MET-2. La vista previa es un diferencial de La Bóveda y hoy 8 de 10 muestran el texto alternativo de una imagen rota.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 03:45Z
Próxima acción: MET-1c en 3 commits en serie (datos → test → `meta.js`), cada uno con CI en verde. Después MET-2 `meta-theme.js` 2.0.0.

Micro-ciclo (en curso, checkpoint de este commit):
MET-1c — `meta-drops.json` apunta las 8 vistas previas a `assets/previews/` y marca las 2 que faltan (`previewMissing`); `meta.js` 4.0.1 (63,6 KB, archivo grande dedicado) muestra «Sin vista previa» con el nombre del objeto cuando falta o no carga, y «Cargando vista previa…» mientras baja, sin texto alternativo a la vista. Tests en `meta-view.test.cjs` (8 nuevos o cambiados; 7 de 8 mutaciones atrapadas, la otra es equivalente).
Archivos:
- assets/meta-drops.json
- tests/meta-view.test.cjs
- js/meta.js

Último hecho: cierre de MET-1b (03:32Z–03:34Z). Retirados el test (`3375bfd`), el workflow `meta-previews` (`2361b96`) y la herramienta de recuperación con Internet Archive (`d0540c7`): ya no puede correr. Decisión registrada en DEC-031 con su línea en el índice (`2f298db`). `tools/meta-previews/REPORTE.md` queda solo como registro del origen y la licencia de las imágenes.

Plan BL-057 (Meta & Eventos):

- MET-0 propuesta visual. Aprobada por Pablo (00:39Z): la vista previa de infusiones se queda; «Vista compacta» se va.
- MET-1 `meta.js` 4.0.0 (`e98a25a`, test `8838217`). Aprobado por Pablo (01:20Z) salvo las vistas previas.
- MET-1b vistas previas servidas desde La Bóveda. CERRADO por decisión de Pablo (DEC-031): 8 de 10 en `assets/previews/`; Chak y Dragon's End son deuda visual. No se investiga más.
- MET-1b cierre: workflow, herramienta y test retirados; DEC-031. Hecho.
- MET-1c `meta.js` 4.0.1 + `meta-drops.json` (este micro-ciclo).
- MET-2 `meta-theme.js` 2.0.0: cabecera nueva (relojes UTC y local, reset diario y semanal, «Hoy en tu cuenta») y mis mensajes según el momento, con el diseño de la Cartera.
- MET-3 cierre: FEAT, backlog, CHANGELOG-FACTORY.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `e775d97`).

## Resumen de la sesión

- MET-1b cerrado como decidió Pablo (DEC-031): las vistas previas que faltan son deuda visual y la recuperación automática de imágenes se retiró del repo.
- Metas y Eventos renovado en DEV (BL-057, MET-1): arriba «Ahora» con lo que está en curso o empieza en 20 min, después la agenda de las próximas 3 horas, tus Fijadas (hasta 6) y todas las metas agrupadas por expansión. La vista previa de infusiones se quedó. «Hecho hoy» aparece solo donde la API lo sabe y todo se actualiza solo cada 30 s. Falta MET-2: la cabecera nueva y mis mensajes.
- La Cartera renovada está en producción (BL-056, REQ-011): 4 pasos en el mismo orden que DEV, cada archivo idéntico al validado. Vuelta atrás lista en la rama `rollback/pre-cartera`.
- La Cartera renovada quedó cerrada (BL-056, FEAT-006): Mi cartera, Cambio de divisas y Todas las cuentas en una sola pantalla con pestañas. Una preferencia nueva en el navegador: `gn:wallet:hidezero` («ocultar en cero»).
- Pablo archivó los dos repos del legado. El Gist queda deprecado (DEC-030) y el respaldo va a una nube que todos tengan (DISC-009); Homestead pasa a módulo propio (BL-055).

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] MET-1b cerrado como pediste (DEC-031): 8 de 10 vistas previas ya están guardadas en La Bóveda; las 2 que faltan quedan como deuda visual con un aviso limpio. No se investiga más.
- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
