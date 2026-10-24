# STATUS

Estado: ESPERANDO A PABLO
Tarea actual: CAM-POLISH-001 — fuerza visual de las tarjetas de la Tienda, Compras fijadas y Logros. Propuesta entregada (`docs/propuestas/propuesta-cam-polish-001.html`), sin implementar. Logros LOG-5 sigue esperando validación.
Motivo: Pablo comparó el resultado con las propuestas aprobadas y pidió recuperar contraste, profundidad y jerarquía, solo en presentación (2026-10-24 07:02Z).
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-24 07:12Z
Próxima acción: con la aprobación de Pablo, POL-1: `js/gn-surface.js` (superficies por panel) y su test en los 19 themes; después Tienda, Compras fijadas y Logros, un paso por vez.

Micro-ciclo:
CAM-POLISH-001 — POL-0 propuesta visual. ENTREGADA, espera aprobación.
Archivos:
- docs/propuestas/propuesta-cam-polish-001.html (diagnóstico, comparación, ajustes, maqueta e impacto)
- factory/diagnose/RUN-015 (medición de superficies en los 19 themes; sonda borrada) y ai-memory/status.md

Último hecho: medí dónde viven las tarjetas (RUN-015). Causa raíz: las maquetas usaban tres superficies (lienzo `#0F1117`, tarjeta `#1A1F2B`, pista `#232A3A`); en la Bóveda la tarjeta pinta lo mismo que su `.panel` (1.00:1) y en 17 de 19 themes `--bg-2` es igual a `--bg-1`, así que las barras perdieron la pista y el ícono de Logros su placa. No es una regresión del código: es el contenedor real. Propuse superficies propias de esas pantallas calculadas desde el theme (bandeja, tarjeta elevada, borde, pista y placa), íconos oficiales más grandes con anillo de rareza o dorado y jerarquía ícono → título → progreso → recompensa. En Gato Negro: tarjeta 1.00 → 1.29, pista 1.00 → 1.44, borde 1.36 → 1.65.

Plan BL-065 (DEC-035): CERRADA y validada por Pablo (2026-10-23 23:12Z).

Plan del restyle:

BL-064 (cerrada y validada por Pablo, 2026-10-24 02:25Z):
1. Armería Legendaria: validada al 100% (FEAT-010). En producción (BL-068).
2. Cámara del Brujo: CAM-0 a CAM-6 validados (FEAT-011). En producción y validada (BL-068).

BL-067 (READY, sigue el mismo plan aprobado):
3. Logros. ← LOG-0 a LOG-4 validados; LOG-5 (revisión final) hecho, espera validación. FEAT-012.
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

- [BL-067] Decisión: CAM-POLISH-001. Abrí `docs/propuestas/propuesta-cam-polish-001.html` en DEV y decidí tres cosas: la bandeja oscura detrás de las tarjetas (recomiendo que sí), el anillo dorado «a un paso» en el ícono de los logros (recomiendo que sí) y `gn-surface.js` como base del resto del restyle (recomiendo que sí). No cambia comportamiento ni datos.
- [BL-067] Validación: abrí Logros en DEV con recarga completa (Ctrl+F5) y fijate que todo se vea y funcione como en LOG-4 (no cambia nada a la vista, salvo en el celular: «Ver en la Armería →» y «Wiki ↗» son más altos, para el dedo). Si querés probar el lector de pantalla (NVDA o el Narrador de Windows): al cambiar un filtro tiene que decir una sola frase, como «Ves 12 logros.», y no leer todas las tarjetas. Probá también un theme claro (Notion o macOS). Con tu validación cierro Logros (FEAT-012).
- [BL-063] Validación: abrí producción con recarga completa (Ctrl+F5). En la computadora: Sidebar a la izquierda, «Nuevo» en los módulos con novedad y mi rincón al pie. En el celular: barra abajo; «Más» abre la hoja con tu cuenta, los otros módulos y mi rincón. Si algo no va, la vuelta atrás es la rama `rollback/pre-sidebar-final`.
- [BL-062] Acción: para que en producción se vean las 6 vistas previas que faltan, subí a `gw2-wallet-ligero/assets/previews/` los archivos de DEV `octovine.webp`, `drakkar.webp`, `drizzlewood_north.webp`, `vinewrath.webp`, `death_branded_shatterer.webp` y `dragonstorm.webp` (en GitHub: Add file → Upload files). Son imágenes y yo no puedo subirlas. Mientras tanto dicen «Sin vista previa», sin imágenes rotas.
- [DISC-009] Decisión: respaldo en la nube. Recomiendo empezar por «Guardar copia» con el menú Compartir del celular (Drive, iCloud o lo que tengas, sin cuentas nuevas) y dejar la sincronización automática con Google Drive para después: necesita un proyecto tuyo en Google Cloud.
- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.

## Para tu información

- [BL-067] Regla de Pablo para Logros: el ícono oficial de cada logro se queda en la tarjeta, destacado. Se puede reorganizar la tarjeta, pero no reemplazar ni ocultar el ícono. Lo vigilan `tests/ach-view.test.cjs` y `tests/ach-cards.test.cjs`.
- [BL-064] Deuda registrada (DEBT-CAM-1): la Tienda, Objetivos semanales y Compras fijadas siguen leyendo la lista de cuentas desde la clave vieja `gw2_keys` (lectura tolerada que vigila idea61). Pasarla a `Storage` toca ese guard y va en un ciclo propio.
- [BL-064] Quedan ocultos y sin borrar el título viejo de la Cámara, la línea de temporada y la nota de sincronización (`router.js` y `wizards-vault.js` todavía los usan). Se van cuando se renueven esos dos archivos.
- [BL-065] Zonas de hoy: `index.html` (63.2 KB, techo bajado en LOG-3) y `router.js` (65.6 KB) siguen congelados pero con el techo más bajo; `welcome-panel.js` quedó congelado por 1 byte y sale con el próximo recorte; en advertencia `converter-modal.js`, `activities-theme.js` y `css/theme-polish.css`; `achievements.js` salió de advertencia en LOG-2 y en LOG-3 quedó en 17,5 KB; excepciones, solo los datos generados de la Armería.
- [BL-065] Regla de LES-033: cuando subo la versión de un módulo, en el mismo cambio sube su `?v`, o el módulo vive en `js/modules.json`. El test `index-versions` lo exige en CI.
- [BL-065] El canal de parches solo corre en DEV, solo con pushes tuyos, y nunca puede tocar workflows ni a sí mismo. Guía: `factory/README.md`. El diagnóstico (`factory/diagnose/`) solo lee: corre tests y escribe la salida.
- [BL-068] En producción `router.js` sigue en 2.17.0, con la Tienda de respaldo vieja adentro: no se usa y no se ve. Su limpieza (2.18.0) queda en DEV. La rama `promo/camara-armeria` fue mi prueba de publicación y se puede borrar.
- [BL-066] Producción tiene la misma Cartera (`wallet-theme.js` 2.1.0, BL-056). El respaldo nunca se usa en la app real (Storage siempre está cargado), así que no hay efecto visible; la corrección queda en DEV hasta que decidas promoverla.
- [BL-064] Deuda conocida de la Armería (DEBT-ARM-3): el panel viejo de la cola y la barra «Modo:» del tracker se siguen pintando y se ocultan por CSS. Se limpian con el canal de parches.
- [BL-059] El frente de Shiruvana queda aprobado conceptualmente y sin implementar hasta que lo habilites.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016). Con el canal, los `.js` que se parchean ya pasan `node --check` antes del commit.
