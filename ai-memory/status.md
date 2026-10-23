# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 paso 2 — CAM-0 entregada: propuesta visual de la Cámara del Brujo (`docs/propuestas/propuesta-camara-bl064.html`). Sin código. Espera la aprobación de Pablo.
Motivo: Pablo validó y cerró BL-065 (DEC-035, FP-1 a FP-6, LES-031 a LES-034) y autorizó iniciar CAM-0 (2026-10-23 23:12Z), con el mismo proceso de Cartera, Metas y Bienvenida y las reglas de DEC-035.
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-23 23:22Z
Próxima acción: con la aprobación de Pablo (3 decisiones: tres pestañas, marcar compras con −/+ y «Gestionar», mi voz en la cabecera), CAM-1: cabecera nueva y 3 pestañas en `js/wv-view.js` 1.0.0, archivo nuevo cargado por `js/modules.json`.

Micro-ciclo:
CAM-0 — propuesta visual de la Cámara del Brujo. HECHO, espera aprobación.
Archivos:
- docs/propuestas/propuesta-camara-bl064.html (e487b0d)

Último hecho: diagnóstico medido sobre el código de DEV. La Cámara está en 10 archivos; dos congelados: `wv-purchase-detail.js` (89 KB, con ~20 KB de CSS adentro) y `router.js` (88 KB, controlador `window.WV`). 10 problemas: 3 ALTOS (dos capas de navegación con 5 botones fantasma; barra de la tienda con 8 controles y una acción destructiva al lado del buscador; dos módulos que escriben la misma tarjeta de la tienda), 5 MEDIOS (objetivos sin resumen; la recompensa del día o de la semana rotulada «Meta de la temporada»; emoji y colores fijos; ayuda solo en tooltip; tablas ilegibles en el celular) y 2 BAJOS. Propuesta: 3 pestañas (Objetivos, Tienda, Todas las cuentas), cabecera con temporada, resets y AA, objetivos agrupados por «listos para reclamar», tienda para planificar con selector −/+ y menú «Gestionar» con deshacer, maquetas de computadora y celular, GDS, mi voz con 4 prioridades y plan CAM-1 a CAM-6 dentro de DEC-035.

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle (BL-064, RETOMADO 2026-10-23):

1. Armería Legendaria: CERRADA en DEV y validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo. CAM-0 entregada; CAM-1 a CAM-6 después de la aprobación.
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
- BL-064: la Armería terminada y validada en DEV (FEAT-010). Cámara del Brujo: CAM-0 entregada.
- BL-065 cerrada y validada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-064] Decisión: aprobar la propuesta de la Cámara del Brujo (`docs/propuestas/propuesta-camara-bl064.html`). Recomiendo sí a las tres: tres pestañas; marcar compras con −/+ y acciones masivas en «Gestionar» con deshacer; mi voz en una línea de la cabecera.
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
