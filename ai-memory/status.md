# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 paso 2 — CAM-3 hecho en DEV: la Tienda de la Cámara del Brujo para planificar (`js/wv-shop-ui.js` 2.0.0) y el menú «Gestionar» (`js/wv-shop-manage.js` 1.0.0, por manifiesto). Espera la validación visual de Pablo.
Motivo: Pablo validó CAM-2 (prioridad por estados, filtros de modo, recompensa del día y de la semana, GDS y módulo independiente) y autorizó CAM-3 (2026-10-24 00:05Z), manteniendo selector −/+, «Gestionar», confirmación de lo destructivo, «Deshacer» y coherencia con Cartera, Bienvenida y Metas.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-24 00:28Z
Próxima acción: con la validación de Pablo, CAM-4: «Todas las cuentas → Objetivos semanales» como matriz legible (`wv-objectives-dashboard.js` 2.0.0).

Micro-ciclo:
CAM-3 — la Tienda para planificar. HECHO, espera validación.
Archivos:
- js/wv-shop-ui.js (c06e88c)
- js/wv-shop-manage.js (ec4d04c)
- index.html (PATCH-019, 15ba012)

Último hecho: Tienda nueva sobre el mismo estado de `router.js` y la misma API (`render`, `refresh`, `ensureShopToolbar`). Arriba, la línea de AA: disponible, marcada sin registrar, reservada para fijados y lo que sobra o falta, con la gastada en la temporada. Tarjetas con progreso por unidades (verde = la API ya lo vio, violeta = marcado por vos), selector −/+ y «Máx» en lugar del campo numérico, «★ Fijar» con texto; la vista ☰ Lista tiene las mismas columnas. Segmentos «Fijados primero», «Todos» y «Me falta»; búsqueda y Legado mostrar/ocultar. Los botones sueltos (Limpiar sincronizados, Limpiar fijados, Replicar fijados, Refrescar) pasaron al menú «Gestionar»: Ajustar marcas a la API, Copiar mis fijados a las otras cuentas (confirma) y Quitar fijados de todas las cuentas (confirma); las tres se pueden deshacer durante 10 s. En el celular «Gestionar» es una hoja inferior y los botones miden 40 px. Una sola fuente de marcas: `enhanceShopCards` y `wv-theme.js` ya no escriben sobre las tarjetas, y si Compras fijadas cambia algo la Tienda se pone al día. Pruebas: 20 tests nuevos; mutaciones 55/55; RUN-007 en CI: 10 suites en verde (incluye hb98, idea61, t19c y Compras).

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle (BL-064, RETOMADO 2026-10-23):

1. Armería Legendaria: CERRADA en DEV y validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo. CAM-0 a CAM-2 validados; CAM-3 hecho, espera validación; CAM-4 a CAM-6 después.
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
- BL-064: la Armería terminada y validada en DEV (FEAT-010). Cámara del Brujo: CAM-2 validado, CAM-3 hecho en DEV.
- BL-065 cerrada y validada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-064] Validación: abrí la Cámara del Brujo en DEV con recarga completa (Ctrl+F5) → Tienda. Revisá la línea de AA (disponible, reservada, sobra o falta); en una tarjeta fijada probá − / + / Máx y mirá cómo cambian las unidades y la línea de AA; probá «Fijados primero», «Todos» y «Me falta», la búsqueda, Legado y ☰ Lista. En «Gestionar», «Quitar fijados de todas las cuentas» pide confirmación y después tocá «Deshacer» antes de 10 s: tienen que volver todos. En el celular, «Gestionar» se abre abajo.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-064] Deuda registrada (DEBT-CAM-1): la Tienda sigue leyendo la lista de cuentas desde la clave vieja `gw2_keys` (lectura tolerada que vigila idea61). Pasarla a `Storage` toca ese guard y va en un ciclo propio.
- [BL-065] Zonas de hoy: 19 archivos congelados (el más grande, `api-gw2.js`, 129 KB; `welcome-panel.js` quedó congelado por 1 byte y sale con el próximo recorte); en advertencia `converter-modal.js`, `activities-theme.js` y `css/theme-polish.css`; excepciones, solo los datos generados de la Armería.
- [BL-065] Regla de LES-033: cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.
