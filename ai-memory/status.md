# STATUS

Estado: EN CURSO
Tarea actual: BL-057 — MET-3: cierre formal de Meta & Eventos (FEAT-007, índice, CHANGELOG-FACTORY y backlog). Después, WEL-0: propuesta visual de la Pantalla de Bienvenida, sin código.
Motivo: Pablo (04:14Z) validó MET-2b en pantalla («coincide con la propuesta aprobada. Aprobado.») y pidió cerrar BL-057 y preparar la propuesta de la Bienvenida con la misma metodología que Cartera y Metas.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 04:20Z
Próxima acción: MET-3a (FEAT-007 + memory-index + CHANGELOG-FACTORY) → MET-3b (backlog: BL-057 y BL-041 a DONE, BL-058 Bienvenida en READY) → WEL-0 propuesta para aprobación.

Micro-ciclo (en curso, checkpoint de este commit):
MET-3a — documentación de BL-057: FEAT-007 con lo que cambió, cómo evaluarlo y sus riesgos; su línea en el índice; la entrada en el CHANGELOG-FACTORY (solo DEV).
Archivos:
- ai-memory/features/FEAT-007-metas-y-eventos-renovado.md
- ai-memory/memory-index.md
- docs/CHANGELOG-FACTORY.md

Último hecho: MET-2b (04:09Z), aprobado por Pablo a las 04:14Z. `31fb0d4` `js/meta-theme.js` 2.1.0 y `14377ef` `tests/meta-header.test.cjs`.

Plan BL-057 (Meta & Eventos):

- MET-0 propuesta visual. Aprobada por Pablo (00:39Z).
- MET-1 `meta.js` 4.0.0 (`e98a25a`, test `8838217`). Aprobado (01:20Z) salvo las vistas previas.
- MET-1b CERRADO por decisión de Pablo (DEC-031) (`3375bfd`, `2361b96`, `d0540c7`, `2f298db`).
- MET-1c `meta.js` 4.0.1 + `meta-drops.json` (`28df57a`, `7f17458`, `30b0f18`).
- MET-2 `meta-theme.js` 2.0.0 (`c381ed9`, `3630a56`) y MET-2b 2.1.0 (`31fb0d4`, `14377ef`). Aprobado por Pablo (04:14Z).
- MET-3 cierre (este micro-ciclo y el siguiente).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `e775d97`).

## Resumen de la sesión

- Pablo aprobó Metas y Eventos renovado en DEV (BL-057): cabecera de la propuesta, «Ahora», agenda de 3 horas, Fijadas, catálogo por expansión, vistas previas sin imágenes rotas y mis avisos de lo que está en curso. Lo cierro y documento.
- MET-1b cerrado como decidió Pablo (DEC-031): las vistas previas que faltan son deuda visual y la recuperación automática de imágenes se retiró del repo.
- La Cartera renovada está en producción (BL-056, REQ-011). Vuelta atrás lista en la rama `rollback/pre-cartera`.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
