# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-057 — Metas y Eventos renovado completo en DEV (MET-1, MET-1c y MET-2): espera la validación de Pablo en pantalla; después MET-3 (cierre).
Motivo: Pablo (03:29Z) autorizó cerrar MET-1b, corregir MET-1c y seguir con MET-2. Las tres cosas están publicadas; lo que falta es su mirada de usuario.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 03:51Z
Próxima acción: cuando Pablo valide en DEV (Ctrl+F5, RSK-020), MET-3: FEAT-007, BL-057 a DONE en el backlog y CHANGELOG-FACTORY. Si pide cambios, se hacen antes del cierre.

Último hecho: MET-2 (03:48Z–03:49Z). `c381ed9` `js/meta-theme.js` 2.0.0 (blob 15d3c43, 14,1 KB) y `3630a56` `tests/meta-header.test.cjs` (blob 147327f). Cabecera con el lenguaje de la Cartera: ícono, «Metas y Eventos», estado y «↻ Actualizar»; fila con hora del servidor, tu hora, reset diario (00:00 UTC), reset semanal (lunes 07:30 UTC) y «Hoy en tu cuenta: N de 19» con barra; mi voz con un solo mensaje y solo cuando sirve (reset cerca con pendientes > fijada que empieza o está en curso > Key sin «progression» > día completo). Lee `Meta.snapshot()`; no pide nada a la API ni guarda nada en el navegador. Se fue lo de la 1.x. Pruebas: 7 tests en UTC, Buenos Aires y Kolkata; 10/10 mutaciones; humo de integración con DOM simulado (19 comprobaciones). La cabecera vieja de `index.html` («Pendientes / Hecho hoy») queda oculta, no borrada (LES-028).

Plan BL-057 (Meta & Eventos):

- MET-0 propuesta visual. Aprobada por Pablo (00:39Z).
- MET-1 `meta.js` 4.0.0 (`e98a25a`, test `8838217`). Aprobado por Pablo (01:20Z) salvo las vistas previas.
- MET-1b CERRADO por decisión de Pablo (DEC-031): Chak y Dragon's End son deuda visual. Workflow, herramienta y test retirados (`3375bfd`, `2361b96`, `d0540c7`); DEC-031 (`2f298db`).
- MET-1c `meta.js` 4.0.1 + `meta-drops.json`. Hecho (`28df57a`, `7f17458`, `30b0f18`).
- MET-2 `meta-theme.js` 2.0.0. Hecho (`c381ed9`, `3630a56`).
- MET-3 cierre: FEAT-007, backlog, CHANGELOG-FACTORY. Después de la validación de Pablo.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `e775d97`).

## Resumen de la sesión

- Metas y Eventos tiene cabecera nueva en DEV (MET-2): hora del servidor y la tuya, cuánto falta para el reset diario y el semanal, y «Hoy en tu cuenta: N de 19» con su barra. Arriba de todo aparezco yo, solo cuando sirve: si el reset está cerca y te quedan metas, si una fijada tuya está por empezar, si tu Key no tiene permiso o si completaste el día.
- Vistas previas arregladas (MET-1c): 8 de 10 se ven desde La Bóveda; Chak y Dragon's End muestran «Sin vista previa» con el nombre de la infusión, sin imágenes rotas.
- MET-1b cerrado como decidió Pablo (DEC-031): las vistas previas que faltan son deuda visual y la recuperación automática de imágenes se retiró del repo.
- Metas y Eventos renovado en DEV (BL-057, MET-1): «Ahora», agenda de 3 horas, Fijadas (hasta 6) y todas las metas por expansión; «Hecho hoy» solo donde la API lo sabe y todo se actualiza cada 30 s.
- La Cartera renovada está en producción (BL-056, REQ-011). Vuelta atrás lista en la rama `rollback/pre-cartera`.

## Esperando a Pablo

- [BL-057] Validación: Metas y Eventos completo en DEV (https://pablosnchz.github.io/gw2-factory-dev/, pestaña Metas, Ctrl+F5): la cabecera nueva, mis mensajes y las vistas previas (Furienredadera y Drakkar ya se ven; Chak y Dragon's End dicen «Sin vista previa»).
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] MET-1b cerrado como pediste (DEC-031). Sin claves nuevas en el navegador en MET-1c ni en MET-2.
- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
