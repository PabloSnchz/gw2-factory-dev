# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-063 — la Sidebar final en producción (sidebar-nav.js 2.2.2 y shiruvana-places.js 1.3.0), por orden de Pablo.
Motivo: falta la validación de Pablo en producción.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 14:20Z
Próxima acción: lo que Pablo decida. Listos en READY: BL-060 (contraste de themes en el resto de la Bóveda) y BL-055 (Homestead, pide propuesta visual). BL-059 sigue sin implementar.

Micro-ciclo (cerrado):
BL-063 — promoción a producción, 2 archivos en serie, blobs idénticos a DEV.
- Medición: en `js/` de producción solo cambiaban esos dos archivos (y `analytics.js`, DEC-006); las dependencias de mi rincón ya estaban.
- Vuelta atrás: rama `rollback/pre-sidebar-final` = `d5136bd`.
- gw2-wallet-ligero: `fd03d1b` sidebar-nav.js 2.2.2 (blob 13264c2) y `f72cde8` shiruvana-places.js 1.3.0 (blob 4a73342).
- Docs: FEAT-009, backlog (BL-063) y CHANGELOG-FACTORY.
Archivos:
- js/sidebar-nav.js
- js/shiruvana-places.js
- ai-memory/features/FEAT-009-sidebar-navegacion-de-la-boveda.md

Último hecho: BL-063 en producción (14:16Z).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL, SBR): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061 cerrada: la Sidebar (FEAT-009). Completa en producción (BL-062 y BL-063).

## Esperando a Pablo

- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Validación: en producción, Inicio (Bienvenida con «Shiruvana te guía») y Metas y Eventos (cabecera nueva, «Hoy en tu cuenta»). Vuelta atrás: rama `rollback/pre-meta-welcome-sidebar`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-061] Dos veces en SBR-5 publiqué un archivo con un texto provisorio en lugar del contenido real (`dbf621c`, `b009770`). Los corregí en 2 a 3 minutos (`81f4439`, `930f3ea`); la Bóveda no cambió. Quedó como LES-030.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-062] En producción la Bienvenida suma una clave nueva en el navegador de cada usuario: `gn:global:welcome` (último módulo, visitas y fecha de la última copia).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
