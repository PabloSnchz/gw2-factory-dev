# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-058 — WEL-0b: segunda propuesta de la Pantalla de Bienvenida, con el estado «con API Key» orientado a la Bóveda. Esperando aprobación.
Motivo: Pablo (04:39Z) aprobó el estado sin API Key y rechazó el estado con API Key de WEL-0: la Bienvenida no asume funciones de Metas y Eventos (DEC-032). Pidió una propuesta nueva centrada en navegación, configuración, guías y mi voz como guía general.
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 04:48Z
Próxima acción: con la aprobación de Pablo (o sus cambios), WEL-1: `js/welcome-panel.js` 2.0.0, `tests/welcome-view.test.cjs` (incluye el test de frontera de DEC-032) y `assets/welcome-news.json`.

Micro-ciclo (cerrado):
WEL-0b — propuesta v2 y la decisión de Pablo registrada.
Archivos:
- docs/propuestas/propuesta-bienvenida-bl058.html
- ai-memory/decisions/DEC-032-bienvenida-frontera-con-metas.md
- ai-memory/memory-index.md

Último hecho: WEL-0b (04:47Z). `9b45215` propuesta v2 (blob 881bcdb), `e696be8` DEC-032, `0733e2b` memory-index.

Plan BL-058 (Pantalla de Bienvenida), sujeto a aprobación:

- WEL-0 propuesta v1: estado sin API Key aprobado; estado con API Key rechazado (DEC-032).
- WEL-0b propuesta v2 (`docs/propuestas/propuesta-bienvenida-bl058.html`). Esperando a Pablo.
- WEL-1 `welcome-panel.js` 2.0.0: estructura, dos estados, 9 módulos, Novedades, Guías, pie; test de frontera.
- WEL-2 `welcome-panel.js` 2.1.0: «Tu Bóveda» y botones de estado (Keys, permisos por `/v2/tokeninfo` con caché de 24 h, cuentas, copia, theme).
- WEL-3 `welcome-panel.js` 2.2.0: «Seguí donde quedaste» con la clave nueva `gn:global:welcome`.
- WEL-4 `shiruvana-places.js` 1.1.0: mi guía (prioridades, Preguntame, trucos); fuera el Gist (DEC-030).
- WEL-5 revisión (19 themes, celular, teclado) y cierre (FEAT-008).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `611f7c9`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado validado por Pablo en DEV (FEAT-007).
- Bienvenida: Pablo fijó la frontera con Metas y Eventos (DEC-032). La propuesta v2 contesta qué puedo hacer, qué módulos tengo, qué configuré, qué me falta y dónde sigo, con mi voz como guía de la Bóveda.
- La Cartera renovada está en producción (BL-056, REQ-011). Vuelta atrás lista en la rama `rollback/pre-cartera`.

## Esperando a Pablo

- [BL-058] Decisión: aprobá la propuesta v2 de la Bienvenida (`docs/propuestas/propuesta-bienvenida-bl058.html`) o decime qué cambiar. Suma una clave nueva en el navegador (`gn:global:welcome`) y un pedido liviano a la API (`/v2/tokeninfo`, una vez por día por Key). Con tu OK arranco WEL-1.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
