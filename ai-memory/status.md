# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-061 — SBR-0 publicado: propuesta visual del restyle de la Sidebar, esperando aprobación. Sin tocar código.
Motivo: Pablo (06:25Z) abrió BL-061 y pidió la propuesta para aprobar antes de implementar.
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 06:34Z
Próxima acción: con la aprobación de Pablo y sus dos decisiones (ubicación y DEC-034), SBR-1: `sidebar-nav.js` 2.0.0 con la Sidebar desktop.

Micro-ciclo (cerrado):
SBR-0 — propuesta en `docs/propuestas/propuesta-sidebar-bl061.html` (`cc347f7`, blob d1a5fe8, igual al local) y BL-061 en el backlog (`ba4ec1c`).
Archivos:
- docs/propuestas/propuesta-sidebar-bl061.html
- ai-memory/backlog.md
- ai-memory/status.md

Último hecho: relevamiento de la Sidebar real: marcado en `index.html` (no se puede republicar), tres capas de estilos (`index.html`, `main.css`, `theme-polish.css`), `sidebar-nav.js` 1.2 con un oyente anidado que se acumula y respaldo a `#/cards`, paneles por módulo desde `router.js` (`updateSidebarFor`). En el celular la Sidebar queda después del contenido.

Plan BL-061 (Sidebar), propuesto:

- SBR-1 Sidebar desktop: Inicio, módulos desde la lista de la Bienvenida, una capa GDS.
- SBR-2 Cuenta activa con estado de la Key, «Falta permiso», «Nuevo»; salen los paneles viejos.
- SBR-3 Celular: barra fija abajo + «Más».
- SBR-4 Rincón de Shiruvana (solo con DEC-034).
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007).
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008).
- BL-061 abierta: restyle de la Sidebar, propuesta publicada.

## Esperando a Pablo

- [BL-061] Decisión: ubicación de la Sidebar. Recomiendo pasarla a la izquierda: es donde se busca la navegación y el contenido queda como protagonista. Si preferís la derecha, el resto de la propuesta vale igual.
- [BL-061] Decisión: mi rincón global al pie de la Sidebar (DEC-034, excepción acotada a DEC-024: un lugar fijo, avatar de 48 px, una línea, solo el estado de la Bóveda). Recomiendo que sí; sin él, mi voz queda solo en la Bienvenida.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-058] La Bienvenida queda en DEV; pasarla a producción lo decidís vos.
- [BL-057] Metas y Eventos queda solo en DEV: pasarlo a producción lo decidís vos.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
