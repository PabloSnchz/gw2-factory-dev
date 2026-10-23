# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-057 — MET-2b publicado: la cabecera de Metas y Eventos con el diseño de la propuesta MET-0. Espera la validación de Pablo en DEV; después MET-3 (cierre).
Motivo: Pablo (04:02Z) validó MET-2 y pidió la cabecera de la propuesta con captura: botones sutiles de hora y resets, barra fina «N de 19» y mi aviso de lo que está en curso.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 04:10Z
Próxima acción: cuando Pablo valide en DEV (Ctrl+F5, RSK-020), MET-3: FEAT-007, BL-057 a DONE en el backlog y CHANGELOG-FACTORY. Si pide ajustes, se hacen antes del cierre.

Último hecho: MET-2b (04:09Z). `31fb0d4` `js/meta-theme.js` 2.1.0 (blob 37a2981, 21,4 KB) y `14377ef` `tests/meta-header.test.cjs` (blob 58978c5). Una fila con ícono, «Metas y Eventos», «Horarios en tu hora local · 49 metas» y cuatro botones sutiles (Local, Servidor UTC, Reset diario, Reset semanal con cuenta regresiva; el reset cercano en dorado). Debajo, «Hoy en tu cuenta · N de 19 que puedo seguir por la API» con barra fina en degradé, «↻ Actualizar» y «¿Por qué 19?» (abre la explicación). Mi voz avisa lo que está en curso y cuándo termina, con el nombre en negrita y «Copiar waypoint». Pruebas: 9 tests en UTC, Buenos Aires y Kolkata; 17/17 mutaciones; humo con DOM mínimo (34 comprobaciones). Entre los dos commits CI quedó en rojo unos 45 s (el test de 2.0.0 contra el código 2.1.0); desvío menor de LES-017, cerrado con el segundo commit. La verificación visual queda para Pablo: no hay navegador en el entorno de la Factory.

Plan BL-057 (Meta & Eventos):

- MET-0 propuesta visual. Aprobada por Pablo (00:39Z).
- MET-1 `meta.js` 4.0.0 (`e98a25a`, test `8838217`). Aprobado por Pablo (01:20Z) salvo las vistas previas.
- MET-1b CERRADO por decisión de Pablo (DEC-031). Workflow, herramienta y test retirados (`3375bfd`, `2361b96`, `d0540c7`); DEC-031 (`2f298db`).
- MET-1c `meta.js` 4.0.1 + `meta-drops.json`. Hecho (`28df57a`, `7f17458`, `30b0f18`).
- MET-2 `meta-theme.js` 2.0.0 (`c381ed9`, `3630a56`). Pablo pidió el diseño de la propuesta.
- MET-2b `meta-theme.js` 2.1.0. Hecho (`31fb0d4`, `14377ef`).
- MET-3 cierre: FEAT-007, backlog, CHANGELOG-FACTORY. Después de la validación de Pablo.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `e775d97`).

## Resumen de la sesión

- La cabecera de Metas y Eventos ahora es la de la propuesta (MET-2b): botones sutiles de hora local, hora del servidor y resets con cuenta regresiva, «Hoy en tu cuenta» con una barra fina y «¿Por qué 19?». Yo aviso lo que está en curso y cuándo termina, con el waypoint a un clic.
- Vistas previas arregladas (MET-1c): 8 de 10 se ven desde La Bóveda; Chak y Dragon's End muestran «Sin vista previa» con el nombre de la infusión, sin imágenes rotas.
- MET-1b cerrado como decidió Pablo (DEC-031): las vistas previas que faltan son deuda visual y la recuperación automática de imágenes se retiró del repo.
- Metas y Eventos renovado en DEV (BL-057, MET-1): «Ahora», agenda de 3 horas, Fijadas (hasta 6) y todas las metas por expansión; «Hecho hoy» solo donde la API lo sabe y todo se actualiza cada 30 s.
- La Cartera renovada está en producción (BL-056, REQ-011). Vuelta atrás lista en la rama `rollback/pre-cartera`.

## Esperando a Pablo

- [BL-057] Validación: la cabecera de Metas y Eventos con el diseño de la propuesta, en DEV (https://pablosnchz.github.io/gw2-factory-dev/, pestaña Metas, Ctrl+F5).
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] MET-1b cerrado como pediste (DEC-031). Sin claves nuevas en el navegador en MET-1c, MET-2 ni MET-2b.
- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
