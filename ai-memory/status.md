# STATUS

Estado: EN CURSO
Tarea actual: BL-061 — SBR-5: revisión final de la Sidebar (19 themes, celular, teclado y lector de pantalla), FEAT-009, backlog, CHANGELOG-FACTORY y cierre de BL-061.
Motivo: Pablo pidió seguir con SBR-5 (2026-10-23 13:47Z).
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 13:50Z
Próxima acción: revisar contraste de la Sidebar, la barra, la hoja y mi rincón en los 19 themes con un test propio; revisar teclado y lector de pantalla; corregir lo que aparezca; documentar y cerrar.

Micro-ciclo:
SBR-5 — revisión y cierre. Si la revisión encuentra algo, lo corrijo en `sidebar-nav.js` con su test antes de cerrar.
Archivos:
- js/sidebar-nav.js
- tests/sidebar-contrast.test.cjs
- ai-memory/features/FEAT-009-sidebar.md

Último hecho: SBR-4 publicado en DEV (13:34Z): `9bb2957`, `2b47351`, `6b041f2`, `6eb15d0`.

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. Hecho, validado y en producción.
- SBR-2 Cuenta activa, «Falta permiso», «Nuevo». Hecho, validado y en producción.
- SBR-3 Celular: barra fija abajo + «Más». En DEV.
- SBR-4 Rincón de Shiruvana (DEC-034) y arranque corregido. En DEV.
- SBR-5 Revisión y cierre (FEAT-009). En curso.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061: SBR-1 y SBR-2 en producción; SBR-3 y SBR-4 en DEV; SBR-5 en curso.

## Esperando a Pablo

- [BL-062] Validación: abrí producción con Ctrl+F5 y revisá Inicio (Bienvenida con «Shiruvana te guía»), Metas y Eventos (cabecera nueva, «Hoy en tu cuenta») y la Sidebar a la izquierda con «Cuenta activa». Si algo no va, la vuelta atrás es la rama `rollback/pre-meta-welcome-sidebar`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-061] El arranque que corregí en SBR-4a también está en producción (`sidebar-nav.js` 2.1.0): allá «Nuevo» no aparece y la guarda de contraste de la Sidebar recién actúa al cambiar de theme. No afecta la navegación ni la cuenta activa. El arreglo queda en DEV.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-062] En producción la Bienvenida suma una clave nueva en el navegador de cada usuario: `gn:global:welcome` (último módulo, visitas y fecha de la última copia).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
