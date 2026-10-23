# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 — ARM-0 publicado: plan del restyle de toda la Bóveda y propuesta de la Armería Legendaria (catálogo y cola).
Motivo: falta la aprobación de Pablo: plan y orden, diseño de la Armería y armaduras por set (ARM-4).
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 15:26Z
Próxima acción: con la aprobación, ARM-1 (dieta de `legendary-tracker.js`, cabecera con resumen, pestañas «Catálogo / Mi cola» y buscador).

Micro-ciclo (cerrado):
ARM-0 — propuesta, sin código. `docs/propuestas/propuesta-armeria-bl064.html` (`7ac2f3f`, blob ce2eb4c, igual al local) y BL-064 en el backlog (`36354d4`).
Archivos:
- docs/propuestas/propuesta-armeria-bl064.html
- ai-memory/backlog.md
- ai-memory/status.md

Último hecho: ARM-0 publicado (15:23Z).

Plan del restyle (propuesto, espera aprobación):

1. Armería Legendaria (ARM-1 a ARM-5).
2. Cámara del Brujo.
3. Logros.
4. Actividades (después de decidir BL-055).
5. Raids y Strikes.
6. Inventario y Personajes.
7. Cuentas.
8. Marco común: barra de arriba, modales, avisos y pie.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL, SBR): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061 cerrada: la Sidebar (FEAT-009). Completa en producción (BL-062 y BL-063).
- BL-064 abierta: restyle completo, primero la Armería. Propuesta publicada.

## Esperando a Pablo

- [BL-064] Validación: mirá la propuesta en https://pablosnchz.github.io/gw2-factory-dev/docs/propuestas/propuesta-armeria-bl064.html y decime tres cosas: si aprobás el plan y el orden de los módulos, si aprobás el diseño de la Armería, y si agrupo las armaduras por set (ARM-4; recomiendo que sí).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-064] Cuatro archivos del resto de la Bóveda no entran en una publicación de la Factory (`raid-tracker.js` 100 KB, `wv-purchase-detail.js` 91 KB, `inventory-hub.js` 70 KB, `accounts-panel.js` 68 KB). Esos módulos se renuevan desde sus archivos `*-theme.js`, que ya se cargan. `legendary-tracker.js` está a 1 KB del límite: ARM-1 lo achica primero.
- [BL-062] Pablo informó (2026-10-23 15:14Z) que la aceptación de los usuarios de Cartera, Metas, Bienvenida y Sidebar fue muy positiva.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
