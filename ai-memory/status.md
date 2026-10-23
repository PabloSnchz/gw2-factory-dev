# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-058 — WEL-0: propuesta visual de la Pantalla de Bienvenida publicada, esperando aprobación. BL-057 cerrada.
Motivo: Pablo (04:14Z) aprobó MET-2b y pidió cerrar BL-057 y preparar la propuesta de la Bienvenida sin tocar código, para aprobarla primero.
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 04:28Z
Próxima acción: con la aprobación de Pablo (o sus cambios a la propuesta), WEL-1: `js/welcome-panel.js` 2.0.0 con la estructura nueva y `tests/welcome-view.test.cjs`.

Micro-ciclo (cerrado):
MET-3 — cierre de BL-057 y propuesta WEL-0.
Archivos:
- ai-memory/backlog.md
- ai-memory/status.md
- docs/propuestas/propuesta-bienvenida-bl058.html

Último hecho: MET-3 (04:28Z). `5ae10e3` FEAT-007, `d24ae69` memory-index, `8b2dcdd` CHANGELOG-FACTORY, `4ec91ff` propuesta WEL-0, `965d6a7` backlog (BL-057 y BL-041 a DONE, BL-058 en READY).

Plan BL-058 (Pantalla de Bienvenida), sujeto a aprobación:

- WEL-0 propuesta visual (`docs/propuestas/propuesta-bienvenida-bl058.html`). Esperando a Pablo.
- WEL-1 `welcome-panel.js` 2.0.0: estructura nueva, dos estados (nuevo / vuelve), 9 módulos, Keys y Datos, pie compacto; mismos ids de botones.
- WEL-2 `welcome-panel.js` 2.1.0: relojes, resets y «Ahora en Tyria» desde la agenda local (sin pedidos nuevos a la API).
- WEL-3 `shiruvana-places.js` 1.1.0: mi voz según el momento; fuera la mención al Gist (DEC-030).
- WEL-4 revisión en 19 themes, celular y teclado.
- WEL-5 cierre (FEAT-008, backlog, CHANGELOG-FACTORY).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007). Documentada en FEAT-007, índice, CHANGELOG-FACTORY y backlog.
- Propuesta de la Bienvenida lista (WEL-0): diagnóstico, problemas, objetivos, maqueta con dos estados y vista de celular, GDS, mi voz, responsive y plan WEL-1 a WEL-5.
- La Cartera renovada está en producción (BL-056, REQ-011). Vuelta atrás lista en la rama `rollback/pre-cartera`.

## Esperando a Pablo

- [BL-058] Decisión: aprobá la propuesta de la Bienvenida (`docs/propuestas/propuesta-bienvenida-bl058.html`) o decime qué cambiar. Con tu OK arranco WEL-1.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
