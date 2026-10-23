# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 paso 2 — CAM-1 hecho en DEV: cabecera nueva y tres pestañas de la Cámara del Brujo (`js/wv-view.js` 1.0.0, cargado por `js/modules.json`). Espera la validación visual de Pablo.
Motivo: Pablo aprobó CAM-0 (tres pestañas, selector −/+ para compras, mi voz en la cabecera) y autorizó CAM-1 (2026-10-23 23:25Z), con micro-ciclos validados, archivos nuevos por manifiesto, congelados que solo bajan y una sola línea de Shiruvana.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 23:45Z
Próxima acción: con la validación de Pablo, CAM-2: objetivos agrupados por «listos para reclamar» (`wv-objectives-ui.js` 2.0.0).

Micro-ciclo:
CAM-1 — cabecera y navegación de la Cámara del Brujo. HECHO, espera validación.
Archivos:
- js/wv-view.js (32c7b01)
- tests/wv-view.test.cjs (32c7b01)
- js/modules.json (32c7b01)

Último hecho: `js/wv-view.js` 1.0.0 (24 KB, zona saludable) es una capa de vista sobre el controlador de siempre (`window.WV`): no cambia datos, rutas ni archivos congelados. Cabecera: temporada con fecha de fin y días que quedan, reset diario (00:00 UTC) y semanal (lun 07:30 UTC) con cuenta regresiva, «↻ Actualizar» según lo que estás mirando, y 4 números: AA disponible (con «reservada para fijados» si la Tienda ya cargó), Hoy, Esta semana y AA gastada en la temporada. «¿Por qué tarda en actualizarse?» pasó del tooltip a un texto que se abre. Tres pestañas (Objetivos con Diarias/Semanales/Especiales; Tienda; Todas las cuentas con Objetivos semanales/Compras fijadas), con teclado (flechas, Inicio, Fin). La cabecera vieja y los 9 botones viejos quedan ocultos por CSS y se borran en CAM-6. Pruebas: 15 tests nuevos; mutaciones 22/23 (la sobreviviente es equivalente); RUN-005 en CI: 39/39 en verde (wv-view, boot, index-versions, size-budget, index-identity).

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle (BL-064, RETOMADO 2026-10-23):

1. Armería Legendaria: CERRADA en DEV y validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo. CAM-0 aprobada; CAM-1 hecho, espera validación; CAM-2 a CAM-6 después.
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
- BL-064: la Armería terminada y validada en DEV (FEAT-010). Cámara del Brujo: CAM-0 aprobada, CAM-1 hecho en DEV.
- BL-065 cerrada y validada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-064] Validación: abrí la Cámara del Brujo en DEV con recarga completa (Ctrl+F5). Arriba, la cabecera nueva (temporada, resets, 4 números, «¿Por qué tarda?») y las 3 pestañas; ya no están los botones viejos. Probá: Diarias/Semanales/Especiales; Tienda; Todas las cuentas → Objetivos semanales y Compras fijadas; volver a Objetivos desde Compras; el enlace directo `#/account/wizards-vault/objectives-dashboard`; y el celular (números en 2 columnas, botones de 44 px).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-065] Zonas de hoy: 19 archivos congelados (el más grande, `api-gw2.js`, 129 KB; `welcome-panel.js` quedó congelado por 1 byte y sale con el próximo recorte); en advertencia `converter-modal.js`, `activities-theme.js` y `css/theme-polish.css`; excepciones, solo los datos generados de la Armería.
- [BL-065] Regla de LES-033: cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.
