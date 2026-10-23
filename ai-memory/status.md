# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-061 — SBR-4 publicado en DEV: mi rincón al pie de la Sidebar y de la hoja «Más» (DEC-034), y el arranque de la Sidebar corregido.
Motivo: falta la validación visual de Pablo antes de SBR-5 (revisión y cierre).
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 13:35Z
Próxima acción: con la validación de Pablo, SBR-5 (revisión en los 19 themes, teclado y lector de pantalla; FEAT-009, backlog y CHANGELOG-FACTORY; cierre de BL-061).

Micro-ciclo (cerrado):
SBR-4 — en dos pasos, cada uno con su test, blobs iguales a los locales.
- SBR-4a — `sidebar-nav.js` 2.2.1 (`9bb2957`, blob d2d4723) + test (`2b47351`, blob 429d563; 35 tests). Hallazgo de la revisión: con `defer` la Sidebar arrancaba antes de que existiera la Bienvenida; «Nuevo» no aparecía nunca y la guarda de contraste no se aplicaba hasta cambiar de theme (la tarjeta se arreglaba con el gn:tokenchange de app.js). Ahora arranca en DOMContentLoaded y, si la Bienvenida igual llega tarde, el próximo refresco recupera novedades y contraste. Mutaciones: 5/5 nuevas; 29/29, 19/19, 16/16 y 6/6 de lo anterior.
- SBR-4b — `shiruvana-places.js` 1.3.0 (`6b041f2`, blob 4a73342) + test (`6eb15d0`, blob fda8d45; 24 tests). Mi rincón: avatar de 48 px, «Shiruvana», una línea y como mucho un enlace a Inicio. Dice «Empezá por tu API Key», «Todo en orden en tu Bóveda» o «Tengo N cosas para revisar; la primera: …» con las prioridades de «Shiruvana te guía». Uno solo a la vista: el de la Sidebar en desktop y el de la hoja «Más» en el celular; el enlace de la hoja la cierra. Se actualiza al cambiar de Key, de pantalla o después de un clic (por ejemplo, Guardar copia), sin rearmarse si no cambió nada. Nada se abre solo y no habla de horarios, eventos, metas ni de ningún módulo (lo vigila un test). Mutaciones: 19/20 (la que sobrevive es equivalente: un try/catch ya cubre el caso).
Archivos:
- js/sidebar-nav.js
- js/shiruvana-places.js
- ai-memory/status.md

Último hecho: SBR-4 publicado en DEV (13:34Z).

Plan BL-061 (Sidebar), aprobado:

- SBR-1 Sidebar desktop. Hecho, validado y en producción.
- SBR-2 Cuenta activa, «Falta permiso», «Nuevo». Hecho, validado y en producción.
- SBR-3 Celular: barra fija abajo + «Más». Publicado en DEV.
- SBR-4 Rincón de Shiruvana (DEC-034) y arranque corregido. Publicado en DEV, espera validación.
- SBR-5 Revisión y cierre (FEAT-009).

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061: SBR-1 y SBR-2 en producción; SBR-3 y SBR-4 en DEV.

## Esperando a Pablo

- [BL-061] Validación: abrí DEV con recarga completa (Ctrl+F5). En la computadora, al pie de la Sidebar tiene que estar mi rincón con una línea sobre tu Bóveda; en el celular, el mismo rincón aparece al pie de la hoja «Más». Además, los módulos con novedad reciente ya dicen «Nuevo» desde la primera carga.
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
