# STATUS

Estado: EN CURSO
Tarea actual: BL-061 — SBR-0: propuesta visual del restyle de la Sidebar (diagnóstico, maquetas desktop y celular, GDS, Bienvenida, Shiruvana, BL-059 y plan). Sin tocar código.
Motivo: Pablo (06:25Z) abrió BL-061 y pidió la propuesta para aprobar antes de implementar.
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 06:30Z
Próxima acción: publicar la maqueta en `docs/propuestas/propuesta-sidebar-bl061.html`, registrar BL-061 en el backlog y presentarla a Pablo.

Micro-ciclo (en curso):
SBR-0 — relevamiento de `index.html` (sidebar, 2 capas de estilos en línea), `css/main.css`, `css/theme-polish.css`, `js/sidebar-nav.js` 1.2 y `js/router.js` (`updateSidebarFor`); maqueta de la propuesta y backlog.
Archivos:
- docs/propuestas/propuesta-sidebar-bl061.html
- ai-memory/backlog.md
- ai-memory/status.md

Último hecho: BL-058 cerrada (FEAT-008, `86afe37`).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007).
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008).
- BL-061 abierta: restyle de la Sidebar, en propuesta.

## Esperando a Pablo

- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-058] La Bienvenida queda en DEV; pasarla a producción lo decidís vos.
- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
