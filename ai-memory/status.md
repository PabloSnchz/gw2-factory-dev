# STATUS

Estado: EN CURSO
Tarea actual: BL-057 — MET-2: cabecera nueva de Metas y Eventos (relojes, resets, «Hoy en tu cuenta») y mis mensajes, con el diseño de la Cartera.
Motivo: Pablo (03:29Z) autorizó seguir en orden: cierre de MET-1b y MET-1c ya están; la cabecera es lo que falta de la propuesta MET-0 aprobada.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 03:50Z
Próxima acción: MET-2 en 2 commits en serie (`meta-theme.js` 2.0.0 → su test). Después MET-3: FEAT-007, backlog, CHANGELOG-FACTORY y validación de Pablo en DEV.

Micro-ciclo (en curso, checkpoint de este commit):
MET-2 — `meta-theme.js` 2.0.0 (14,1 KB): cabecera como la de la Cartera (ícono, título, estado y «↻ Actualizar»), fila con hora del servidor, tu hora, reset diario (00:00 UTC), reset semanal (lunes 07:30 UTC) y «Hoy en tu cuenta: N de 19» con barra; mi voz con un solo mensaje y solo cuando sirve (reset cerca con pendientes > fijada que empieza o está en curso > Key sin «progression» > día completo). Lee `Meta.snapshot()`, no pide nada a la API ni guarda nada. Se va lo de la 1.x (estilos en línea, migraciones de tarjetas viejas, emojis). Pruebas: 7 tests en UTC, Buenos Aires y Kolkata, 10/10 mutaciones, humo de integración con DOM simulado (19 comprobaciones).
Archivos:
- js/meta-theme.js
- tests/meta-header.test.cjs

Último hecho: MET-1c (03:39Z–03:44Z). `28df57a` `meta-drops.json` (blob 4eaa46f): las 8 vistas previas desde `assets/previews/`, Chak y Dragon's End con `previewMissing`. `7f17458` `tests/meta-view.test.cjs` (blob b9ae731, 8 tests nuevos o cambiados). `30b0f18` `js/meta.js` 4.0.1 (blob d70026a, 63,6 KB, archivo grande dedicado): «Sin vista previa» con el nombre del objeto si falta o no carga, «Cargando vista previa…» mientras baja, nunca la imagen rota ni el texto alternativo suelto. 7 de 8 mutaciones atrapadas (la otra es equivalente). Para que el archivo entre en una publicación, resumí comentarios del encabezado y saqué la sangría de las líneas de CSS (sin cambios de comportamiento).

Plan BL-057 (Meta & Eventos):

- MET-0 propuesta visual. Aprobada por Pablo (00:39Z).
- MET-1 `meta.js` 4.0.0 (`e98a25a`, test `8838217`). Aprobado por Pablo (01:20Z) salvo las vistas previas.
- MET-1b CERRADO por decisión de Pablo (DEC-031): Chak y Dragon's End son deuda visual. Workflow, herramienta y test retirados (`3375bfd`, `2361b96`, `d0540c7`); DEC-031 (`2f298db`).
- MET-1c `meta.js` 4.0.1 + `meta-drops.json`. Hecho (`28df57a`, `7f17458`, `30b0f18`).
- MET-2 `meta-theme.js` 2.0.0 (este micro-ciclo).
- MET-3 cierre: FEAT-007, backlog, CHANGELOG-FACTORY.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `e775d97`).

## Resumen de la sesión

- Vistas previas de Metas y Eventos arregladas (MET-1c): 8 de 10 se ven desde La Bóveda; Chak y Dragon's End muestran «Sin vista previa» con el nombre de la infusión, sin imágenes rotas.
- MET-1b cerrado como decidió Pablo (DEC-031): las vistas previas que faltan son deuda visual y la recuperación automática de imágenes se retiró del repo.
- Metas y Eventos renovado en DEV (BL-057, MET-1): «Ahora», agenda de 3 horas, Fijadas (hasta 6) y todas las metas por expansión; «Hecho hoy» solo donde la API lo sabe y todo se actualiza cada 30 s.
- La Cartera renovada está en producción (BL-056, REQ-011). Vuelta atrás lista en la rama `rollback/pre-cartera`.
- Pablo archivó los dos repos del legado. El Gist queda deprecado (DEC-030) y el respaldo va a una nube que todos tengan (DISC-009); Homestead pasa a módulo propio (BL-055).

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] MET-1b cerrado como pediste (DEC-031) y MET-1c publicado: para ver las vistas previas nuevas en DEV recargá con Ctrl+F5 (RSK-020).
- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
