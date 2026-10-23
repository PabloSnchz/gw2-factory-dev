# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-061 cerrada — la Sidebar (FEAT-009). SBR-5 publicado en DEV: revisión en los 19 themes, celular, teclado y lector de pantalla; «Nuevo» legible para el lector.
Motivo: falta la mirada de Pablo en pantalla sobre SBR-3, SBR-4 y SBR-5 (en DEV) y la validación de producción (BL-062).
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 14:05Z
Próxima acción: lo que Pablo decida. Listos en READY: BL-060 (contraste de themes en el resto de la Bóveda) y BL-055 (Homestead, pide propuesta visual). BL-059 sigue sin implementar.

Micro-ciclo (cerrado):
SBR-5 — revisión y cierre de BL-061, blobs iguales a los locales.
- Código: `sidebar-nav.js` 2.2.2 (`7bf11f3`, blob 13264c2). Hallazgo BAJO: en la barra del celular «Nuevo» era texto a tamaño 0, que VoiceOver puede saltear; ahora la marca es `aria-hidden` y se lee «(nuevo)».
- Tests: `tests/sidebar-contrast.test.cjs` nuevo (7 tests, blob 44274a0): cada color de texto de la Sidebar, la barra, la hoja y mi rincón llega a 4.5:1 en los 19 themes y el foco a 3:1; falla si alguien usa un color sin guarda. Foco visible, movimiento reducido, 44 px y textos para lector. `tests/sidebar-nav.test.cjs` (35 tests, blob 0e9423c). Mutaciones 13/13.
- Docs: FEAT-009, LES-030, índice, backlog (BL-061 a DONE) y CHANGELOG-FACTORY.
Archivos:
- js/sidebar-nav.js
- tests/sidebar-contrast.test.cjs
- ai-memory/features/FEAT-009-sidebar-navegacion-de-la-boveda.md

Último hecho: BL-061 cerrada (14:05Z).

Plan BL-061 (Sidebar), terminado:

- SBR-1 Sidebar desktop. Validado y en producción.
- SBR-2 Cuenta activa, «Falta permiso», «Nuevo». Validado y en producción.
- SBR-3 Celular: barra fija abajo + «Más». En DEV.
- SBR-4 Rincón de Shiruvana (DEC-034) y arranque corregido. En DEV.
- SBR-5 Revisión y cierre (FEAT-009). En DEV.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061 cerrada: la Sidebar (FEAT-009). SBR-1 y SBR-2 en producción; SBR-3 a SBR-5 en DEV.

## Esperando a Pablo

- [BL-061] Validación: abrí DEV con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda y mi rincón al pie, con una línea sobre tu Bóveda. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Probá también un theme claro (macOS o Notion): todo se tiene que leer.
- [BL-062] Validación: abrí producción con Ctrl+F5 y revisá Inicio (Bienvenida con «Shiruvana te guía»), Metas y Eventos (cabecera nueva, «Hoy en tu cuenta») y la Sidebar a la izquierda con «Cuenta activa». Si algo no va, la vuelta atrás es la rama `rollback/pre-meta-welcome-sidebar`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-061] Dos veces en SBR-5 publiqué un archivo con un texto provisorio en lugar del contenido real (`tests/sidebar-nav.test.cjs` en `dbf621c` y `ai-memory/memory-index.md` en `b009770`). Los corregí en 2 a 3 minutos (`81f4439`, `930f3ea`); en ese rato CI estuvo en rojo y la Bóveda no cambió. Quedó como LES-030.
- [BL-061] El arranque que corregí en SBR-4a también está en producción (`sidebar-nav.js` 2.1.0): allá «Nuevo» no aparece y la guarda de contraste de la Sidebar recién actúa al cambiar de theme. No afecta la navegación ni la cuenta activa. El arreglo queda en DEV.
- [BL-061] La zona segura del iPhone queda en 0 hasta que `index.html` pida `viewport-fit=cover` (no lo toco: LES-028); la barra igual deja su margen normal y no tapa nada.
- [BL-062] En producción la Bienvenida suma una clave nueva en el navegador de cada usuario: `gn:global:welcome` (último módulo, visitas y fecha de la última copia).
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
