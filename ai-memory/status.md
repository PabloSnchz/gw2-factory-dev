# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-068 — Armería y Cámara del Brujo en producción, en una sola tarea, como pidió Pablo. Espera su validación en producción.
Motivo: Pablo validó CAM-6 y cerró BL-064 («funcionamiento ok, todo estable», 2026-10-24 02:25Z) y ordenó pasar a producción la Cámara junto con la Armería.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-24 02:55Z
Próxima acción: con la validación de producción, empezar BL-067 por Logros (propuesta visual primero, como en la Armería y la Cámara), salvo que Pablo elija otro orden.

Micro-ciclo:
BL-068 — Promoción de la Armería y la Cámara a producción. HECHO, espera validación.
Archivos:
- gw2-wallet-ligero: 11 archivos en 10 commits (`3cd00da` … `374b6f0`)
- ai-memory: backlog, FEAT-010, FEAT-011 e índice (PATCH-026)
- ai-memory/status.md

Último hecho: medí producción contra DEV, guardé la vuelta atrás en la rama `rollback/pre-camara-armeria` (`f72cde8`) y publiqué en serie, en el mismo orden en que se armó en DEV, para que cada commit deje el sitio andando: primero el cargador (`boot.js`, `modules.json`) y los módulos nuevos de la Cámara, después `index.html`, después los 4 módulos renovados de la Cámara y al final la Armería (`render-catologo.js` 1.6.1). Comprobé cada archivo publicado contra DEV: idénticos. Quedan distintos a propósito tres archivos: `analytics.js` (producción mide, DEV no), `router.js` (producción sigue en 2.17.0: la 2.18.0 solo borra código que ya no se usa y no entra entera en una publicación mía) y `wallet-theme.js` (2.1.0; la corrección de BL-066 no se pidió). El `index.html` de producción conserva Google Analytics y pide esas dos versiones.

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle:

BL-064 (cerrada y validada por Pablo, 2026-10-24 02:25Z):
1. Armería Legendaria: validada al 100% (FEAT-010). En producción (BL-068).
2. Cámara del Brujo: CAM-0 a CAM-6 validados (FEAT-011). En producción (BL-068).

BL-067 (READY, sigue el mismo plan aprobado):
3. Logros.
4. Actividades (después de decidir BL-055).
5. Raids y Strikes.
6. Inventario y Personajes.
7. Cuentas.
8. Marco común: barra de arriba, modales, avisos y pie.

Historial de planes anteriores (ARM, PSN, PRD, GUA, MIG, CAR, MEM, MET, WEL, SBR, CAM): en el backlog (DONE) y en git (`ai-memory/status.md` hasta `86afe37`).

## Resumen de la sesión

- BL-057 cerrada: Metas y Eventos renovado (FEAT-007), en producción.
- BL-058 cerrada: Bienvenida, la puerta de entrada de la Bóveda (FEAT-008), en producción.
- BL-061 cerrada: la Sidebar (FEAT-009). Completa en producción (BL-062 y BL-063).
- BL-064 cerrada y validada: la Armería (FEAT-010) y la Cámara del Brujo (FEAT-011), en producción (BL-068). El resto del restyle sigue en BL-067.
- BL-065 cerrada y validada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-068] Validación: abrí producción con recarga completa (Ctrl+F5). Armería: cabecera con buscador, pestañas Catálogo / Mi cola (sin la barra «Modo:»), filtros en una fila y armaduras por set. Cámara del Brujo: 3 pestañas sin los botones viejos, mi línea en la cabecera cuando hay algo para hacer, Tienda con −/+ y «Gestionar», y Compras fijadas. Si algo no va, la vuelta atrás es la rama `rollback/pre-camara-armeria`.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-064] Deuda registrada (DEBT-CAM-1): la Tienda, Objetivos semanales y Compras fijadas siguen leyendo la lista de cuentas desde la clave vieja `gw2_keys` (lectura tolerada que vigila idea61). Pasarla a `Storage` toca ese guard y va en un ciclo propio.
- [BL-064] Quedan ocultos y sin borrar el título viejo de la Cámara, la línea de temporada y la nota de sincronización (`router.js` y `wizards-vault.js` todavía los usan). Se van cuando se renueven esos dos archivos.
- [BL-065] Zonas de hoy: `index.html` (64.8 KB) y `router.js` (65.6 KB) siguen congelados pero con el techo más bajo; `welcome-panel.js` quedó congelado por 1 byte y sale con el próximo recorte; en advertencia `converter-modal.js`, `activities-theme.js` y `css/theme-polish.css`; excepciones, solo los datos generados de la Armería.
- [BL-065] Regla de LES-033: cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-068] En producción `router.js` sigue en 2.17.0, con la Tienda de respaldo vieja adentro: no se usa y no se ve. Su limpieza (2.18.0) queda en DEV. La rama `promo/camara-armeria` fue mi prueba de publicación y se puede borrar.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.
