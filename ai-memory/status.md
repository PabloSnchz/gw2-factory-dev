# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 paso 2 — CAM-6 hecho en DEV: mi voz en la cabecera de la Cámara, contraste AA en los 19 themes, teclado y lector, y limpieza de lo viejo en `index.html` y `router.js`. La Cámara del Brujo queda completa (FEAT-011) y BL-064 cerrada como pidió Pablo; los módulos que faltan del restyle pasan a BL-067. Espera la validación de Pablo.
Motivo: Pablo validó CAM-5 (AA, −/+, sincronización Tienda ↔ Compras fijadas, Gestionar, Deshacer, filtros, celular y reducción de congelados) y autorizó CAM-6 (2026-10-24 01:45Z): voz, accesibilidad, contraste, teclado, limpieza, cierre de FEAT-011 y de BL-064.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-24 02:20Z
Próxima acción: con la validación de Pablo, empezar BL-067 por Logros (propuesta visual primero, como en la Armería y la Cámara), salvo que Pablo elija otro orden.

Micro-ciclo:
CAM-6 — Voz, accesibilidad, contraste, teclado y limpieza. HECHO, espera validación.
Archivos:
- js/wv-view.js 1.1.0 (PATCH-022)
- index.html y js/router.js 2.18.0 (PATCH-024)
- tests/wv-camara-a11y.test.cjs (636d6dd)

Último hecho: mi voz en la cabecera de la Cámara, una sola línea y solo cuando hay algo para hacer, en este orden: objetivos listos para reclamar (con la AA que suman), reset diario o semanal en menos de una hora con objetivos pendientes, fijados para los que no alcanza la AA (con cuántas semanas faltan si completás lo diario y lo semanal) y temporada que termina en 7 días o menos con fijados sin comprar. Si todo está al día, no digo nada. Sin pedidos nuevos a la API. Contraste: la guarda de la Bienvenida corre en toda la Cámara y corrige también los colores fijos de los módulos (rojo, «AA» y marcado): todos los textos llegan a 4.5:1 en los 19 themes, medido en un test. Teclado y lector: cada pestaña dice qué panel controla y el panel dice qué pestaña lo nombra; foco visible en pestañas y paneles; movimiento reducido respetado. Limpieza: se fueron los 5 botones viejos (Dashboard, Compras, Refrescar, Volver, Sincronizar), su script y el CSS viejo de `index.html` (69.6 → 64.8 KB), y la Tienda de respaldo de `router.js` (90.5 → 65.6 KB); los dos techos bajaron. PATCH-023 fue rechazado por el canal porque `hb98` medía el código que se iba; PATCH-024 lo corrige y mide lo nuevo (LES-035). Suite completa en verde antes y después.

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle:

BL-064 (cerrada, pedido de Pablo 2026-10-24 01:45Z):
1. Armería Legendaria: validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo: CAM-0 a CAM-5 validados; CAM-6 hecho, espera validación (FEAT-011).

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
- BL-064 cerrada en DEV: la Armería (FEAT-010) y la Cámara del Brujo (FEAT-011). El resto del restyle sigue en BL-067.
- BL-065 cerrada y validada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-064] Validación: abrí la Cámara del Brujo en DEV con recarga completa (Ctrl+F5). Arriba ya no están los botones viejos (Dashboard, Compras, Refrescar, Volver, Sincronizar): todo se navega con las 3 pestañas. Si tenés objetivos listos o fijados sin AA suficiente, vas a ver mi línea en la cabecera; si está todo al día, no aparece. Cambiá a un theme claro (macOS o Notion) y fijate que la AA, lo marcado y los números rojos se lean bien. Con el teclado: Tab hasta las pestañas, flechas para cambiar, Enter para entrar; el foco se ve siempre. La Tienda y Compras fijadas tienen que seguir igual que en CAM-5.
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
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.
