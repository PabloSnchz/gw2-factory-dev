# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: BL-067 paso 3 — Logros. LOG-1 hecho en DEV: cabecera nueva con «Al alcance», tres pestañas (Casi listos, Por categoría, Colecciones legendarias) y mi línea, en `js/ach-view.js` por manifiesto. Espera la validación de Pablo.
Motivo: Pablo aprobó LOG-0 (2026-10-24 05:00Z) con las 4 decisiones y pidió mantener destacada la iconografía oficial de Guild Wars 2 en las tarjetas.
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-24 05:25Z
Próxima acción: con la validación de Pablo, LOG-2: filtros accesibles y tarjetas «te falta» con el ícono oficial del logro destacado, en `js/ach-cards.js`; `achievements.js` se sigue achicando.

Micro-ciclo:
LOG-1 — Cabecera, pestañas y mi línea en Logros. HECHO, espera validación.
Archivos:
- js/ach-view.js 1.0.0 (`8b42616`), tests/ach-view.test.cjs y js/modules.json (`80e549e`)
- PATCH-027: js/achievements.js 3.3.0 (`c666135`), index.html (`9a8bbaa`), tools/size-budget.json y el test conjunto — APLICADO
- ai-memory: FEAT-012, índice (PATCH-028) y status.md

Último hecho: publiqué primero `js/ach-view.js` (no hace nada si `achievements.js` no publica su estado) y después PATCH-027, que dejó a `achievements.js` 3.3.0 publicando su estado (`getSnapshot`, `setFilter`, `_calc`, evento `gn:achievements`) y sin la fila vieja de AP, el chip de «AP potenciales» ni el botón «Refrescar» sin uso. De paso: los botones de filtro dicen lo que filtra la grilla, el umbral suma «Todos» y el desplegable de categorías no pierde los clics al recargar. `achievements.js` bajó de 52352 a 47454 bytes y pasó de congelado a advertencia. Tests: 17/17 (4 con el archivo real); suite verde antes y después; los blobs publicados son iguales a los locales. Las tarjetas y sus íconos oficiales no cambiaron.

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle:

BL-064 (cerrada y validada por Pablo, 2026-10-24 02:25Z):
1. Armería Legendaria: validada al 100% (FEAT-010). En producción (BL-068).
2. Cámara del Brujo: CAM-0 a CAM-6 validados (FEAT-011). En producción y validada (BL-068).

BL-067 (READY, sigue el mismo plan aprobado):
3. Logros. ← LOG-0 aprobado; LOG-1 hecho, espera validación.
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
- BL-064 cerrada y validada: la Armería (FEAT-010) y la Cámara del Brujo (FEAT-011), en producción y validadas por Pablo (BL-068, 2026-10-24). El resto del restyle sigue en BL-067.
- SHIRUVANA-ART-001: obra «EVOLVING» entregada (A + B, plana y anime, más prompts para IA).
- BL-065 cerrada y validada: canal de parches, manifiesto de módulos y presupuesto de tamaño (DEC-035; LES-031 a LES-034).
- BL-066 cerrada: suite de DEV en verde; las 3 fallas eran mías (LES-032).
- BL-005 cerrada con el primer parche sobre `index.html` (FP-4).

## Esperando a Pablo

- [BL-067] Validación: abrí Logros en DEV con recarga completa (Ctrl+F5). Arriba: ícono de Logros, «Tenés N logros al 80 % o más», la pastilla «Al alcance +N AP» y cuatro números (puntos de logro, al alcance, a un paso, con recompensa); si algo está a un paso, mi línea te dice cuál. Ya no están la fila vieja de AP ni el chip suelto. Probá las tres pestañas: «Casi listos» es la grilla de siempre con sus íconos; «Por categoría» lista las categorías con pendientes y al tocar una te muestra todos sus logros; «Colecciones legendarias» muestra las legendarias en curso. Con el teclado: Tab hasta las pestañas y flechas para cambiar.
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-067] Regla de Pablo para Logros: el ícono oficial de cada logro se queda en la tarjeta, destacado. Se puede reorganizar la tarjeta, pero no reemplazar ni ocultar el ícono. Lo vigila `tests/ach-view.test.cjs`.
- [BL-064] Deuda registrada (DEBT-CAM-1): la Tienda, Objetivos semanales y Compras fijadas siguen leyendo la lista de cuentas desde la clave vieja `gw2_keys` (lectura tolerada que vigila idea61). Pasarla a `Storage` toca ese guard y va en un ciclo propio.
- [BL-064] Quedan ocultos y sin borrar el título viejo de la Cámara, la línea de temporada y la nota de sincronización (`router.js` y `wizards-vault.js` todavía los usan). Se van cuando se renueven esos dos archivos.
- [BL-065] Zonas de hoy: `index.html` (64.8 KB) y `router.js` (65.6 KB) siguen congelados pero con el techo más bajo; `welcome-panel.js` quedó congelado por 1 byte y sale con el próximo recorte; en advertencia `converter-modal.js`, `activities-theme.js`, `css/theme-polish.css` y, desde LOG-1, `achievements.js` (46,3 KB, salió de congelados); excepciones, solo los datos generados de la Armería.
- [BL-065] Regla de LES-033: cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-068] En producción `router.js` sigue en 2.17.0, con la Tienda de respaldo vieja adentro: no se usa y no se ve. Su limpieza (2.18.0) queda en DEV. La rama `promo/camara-armeria` fue mi prueba de publicación y se puede borrar.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.
