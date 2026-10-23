# STATUS

Estado: EN CURSO
Tarea actual: BL-057 — MET-2b: la cabecera de Metas y Eventos vuelve al diseño de la propuesta MET-0 (pedido de Pablo con captura, 04:02Z).
Motivo: Pablo revisó MET-2 en DEV y prefiere la cabecera de la propuesta: botones sutiles de Local, Servidor y resets con cuenta regresiva, barra fina y elegante para «N de 19», y mi voz avisando lo que está en curso y cuándo termina.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 04:15Z
Próxima acción: MET-2b en 2 commits en serie (`meta-theme.js` 2.1.0 → su test). Después, validación de Pablo y MET-3.

Micro-ciclo (en curso, checkpoint de este commit):
MET-2b — `meta-theme.js` 2.1.0 (21,4 KB): una fila con ícono, «Metas y Eventos», «Horarios en tu hora local · 49 metas» y cuatro botones sutiles (Local, Servidor UTC, Reset diario, Reset semanal «en 3 d 7 h»; el reset cercano en dorado); debajo «Hoy en tu cuenta · 6 de 19 que puedo seguir por la API», barra fina con degradé, «↻ Actualizar» y «¿Por qué 19?». Mi voz avisa lo que está en curso y cuándo termina, con el nombre en negrita y un botón para copiar el waypoint; prioridad: reset cerca con una pendiente en curso > fijada > pendiente en curso > lo que está en curso > lo que empieza en ≤ 20 min > Key sin permiso > día completo. Pruebas: 9 tests en UTC, Buenos Aires y Kolkata; 17/17 mutaciones; humo de integración con DOM mínimo (34 comprobaciones).
Archivos:
- js/meta-theme.js
- tests/meta-header.test.cjs

Último hecho: MET-2 (03:48Z–03:49Z). `c381ed9` `js/meta-theme.js` 2.0.0 y `3630a56` su test. Pablo la vio en DEV y pidió volver a la cabecera de la propuesta (este micro-ciclo).

Plan BL-057 (Meta & Eventos):

- MET-0 propuesta visual. Aprobada por Pablo (00:39Z).
- MET-1 `meta.js` 4.0.0 (`e98a25a`, test `8838217`). Aprobado por Pablo (01:20Z) salvo las vistas previas.
- MET-1b CERRADO por decisión de Pablo (DEC-031). Workflow, herramienta y test retirados (`3375bfd`, `2361b96`, `d0540c7`); DEC-031 (`2f298db`).
- MET-1c `meta.js` 4.0.1 + `meta-drops.json`. Hecho (`28df57a`, `7f17458`, `30b0f18`).
- MET-2 `meta-theme.js` 2.0.0. Hecho (`c381ed9`, `3630a56`); Pablo pidió el diseño de la propuesta.
- MET-2b `meta-theme.js` 2.1.0 (este micro-ciclo).
- MET-3 cierre: FEAT-007, backlog, CHANGELOG-FACTORY. Después de la validación de Pablo.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `e775d97`).

## Resumen de la sesión

- Metas y Eventos tiene cabecera nueva en DEV (MET-2): hora del servidor y la tuya, cuánto falta para el reset diario y el semanal, y «Hoy en tu cuenta: N de 19». Pablo pidió el diseño de la propuesta: lo estoy rehaciendo (MET-2b).
- Vistas previas arregladas (MET-1c): 8 de 10 se ven desde La Bóveda; Chak y Dragon's End muestran «Sin vista previa» con el nombre de la infusión, sin imágenes rotas.
- MET-1b cerrado como decidió Pablo (DEC-031): las vistas previas que faltan son deuda visual y la recuperación automática de imágenes se retiró del repo.
- Metas y Eventos renovado en DEV (BL-057, MET-1): «Ahora», agenda de 3 horas, Fijadas (hasta 6) y todas las metas por expansión; «Hecho hoy» solo donde la API lo sabe y todo se actualiza cada 30 s.
- La Cartera renovada está en producción (BL-056, REQ-011). Vuelta atrás lista en la rama `rollback/pre-cartera`.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] MET-1b cerrado como pediste (DEC-031). Sin claves nuevas en el navegador en MET-1c ni en MET-2.
- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
