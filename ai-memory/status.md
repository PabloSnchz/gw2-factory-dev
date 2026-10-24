# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-064 paso 2 — CAM-2 hecho en DEV: objetivos de la Cámara del Brujo agrupados por lo que se puede hacer ya (`js/wv-objectives-ui.js` 2.0.0). Espera la validación visual de Pablo.
Motivo: Pablo validó CAM-1 (cabecera, tres pestañas, indicadores, navegación, GDS y DEC-035) y autorizó CAM-2 (2026-10-23 23:49Z): objetivos agrupados y prioridad a lo reclamable.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-24 00:02Z
Próxima acción: con la validación de Pablo, CAM-3: la Tienda para planificar, con selector −/+ y menú «Gestionar» con deshacer (`wv-shop-ui.js` 2.0.0 + `wv-shop-manage.js` por manifiesto).

Micro-ciclo:
CAM-2 — objetivos agrupados de la Cámara del Brujo. HECHO, espera validación.
Archivos:
- js/wv-objectives-ui.js (e7b35d2)
- tests/wv-objectives-ui.test.cjs (e7b35d2)
- index.html (PATCH-018, 810b26e)

Último hecho: `wv-objectives-ui.js` 2.0.0 (15,4 KB, saludable) con el mismo contrato que usa `router.js` (`renderTab`, `renderZero`, `WV.__setObjState`). Cada pestaña de objetivos muestra primero «Listos para reclamar» con la AA que suman («se cobran dentro del juego»), después «En curso» con los más avanzados arriba y al final «Reclamados», plegado y recordando si lo abriste. Filtro Todos/PvE/PvP/WvW cuando la pestaña mezcla modos; vale para las tres pestañas. «Meta de la temporada» ahora dice lo que es: «Recompensa del día» o «de la semana». Estados con texto y sin emoji; filas en lista, legibles en el celular. El `?v` de `index.html` subió a 2.0.0 por el canal (PATCH-018, LES-033). Pruebas: 10 tests nuevos; mutaciones 22/23 (la sobreviviente es equivalente); RUN-006 en CI: 10 suites en verde (incluye versiones, tamaño, identidad, Tienda y ai-memory).

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle (BL-064, RETOMADO 2026-10-23):

1. Armería Legendaria: CERRADA en DEV y validada por Pablo al 100% (FEAT-010).
2. Cámara del Brujo. CAM-0 y CAM-1 validados; CAM-2 hecho, espera validación; CAM-3 a CAM-6 después.
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
- BL-064: la Armería terminada y validada en DEV (FEAT-010). Cámara del Brujo: CAM-1 validado, CAM-2 hecho en DEV.
- BL-065 cerrada y validada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-064] Validación: abrí la Cámara del Brujo en DEV con recarga completa (Ctrl+F5) → Objetivos. En Diarias, Semanales y Especiales: arriba «Listos para reclamar» (dorado, con la AA total), después «En curso» y al final «Reclamados» plegado; la barra «Recompensa del día» o «de la semana»; el filtro PvE/PvP/WvW cuando hay modos mezclados; y en el celular, cada objetivo en dos renglones sin cortar textos.
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
