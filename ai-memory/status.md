# STATUS

Estado: EN CURSO
Tarea actual: BL-061 — SBR-1: Sidebar desktop a la izquierda (Inicio, módulos desde la lista de la Bienvenida, Cuentas aparte, una capa de estilos GDS). Antes, DEC-034 registrada.
Motivo: Pablo (06:37Z) aprobó la propuesta SBR-0, eligió la Sidebar a la izquierda y aprobó mi rincón global (DEC-034).
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 06:40Z
Próxima acción: publicar DEC-034 y el índice; después `js/sidebar-nav.js` 2.0.0 con su test en un solo commit.

Micro-ciclo (en curso):
SBR-1 — `sidebar-nav.js` 2.0.0: la Sidebar pasa a la izquierda desde 901 px (sticky), Inicio primero, los 8 módulos y Cuentas desde `Welcome._pure.MODULES`, activo con la barra del color del módulo, guarda de contraste de la Bienvenida aplicada a la Sidebar, región de navegación con nombre y sin el oyente que se acumulaba. Mismos ids de enlace que usa el router.
Archivos:
- js/sidebar-nav.js
- tests/sidebar-nav.test.cjs
- ai-memory/decisions/DEC-034-rincon-global-de-shiruvana.md

Último hecho: SBR-0 aprobado por Pablo (06:37Z).

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. En curso.
- SBR-2 Cuenta activa con estado de la Key, «Falta permiso», «Nuevo»; salen los paneles viejos.
- SBR-3 Celular: barra fija abajo + «Más».
- SBR-4 Rincón de Shiruvana (DEC-034).
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007).
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008).
- BL-061 aprobada: restyle de la Sidebar, en implementación.

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
