# LES-035 — Al borrar código, también cambian los tests que lo describían

- Fecha de registro: 2026-10-24
- Origen: BL-064, CAM-6 (PATCH-023 rechazado, PATCH-024 aplicado)

## Qué pasó

Para limpiar `router.js` saqué la Tienda de respaldo, que ya nadie usaba. Corrí en local los tests que pensé que tocaban esos archivos y pasaron. El canal de parches corrió la suite completa y rechazó el parche: `tests/hb98-wv-shop-view.test.js` contaba que `saveView` y `saveLegacyFilter` tuvieran exactamente un uso dentro de esa copia. El test no protegía una conducta: describía la forma del código viejo. Al irse el código, el test quedó midiendo algo que ya no existía.

## Lección

1. Antes de borrar código, buscar en `tests/` todos los que lo nombran, no solo los del módulo. Un test heredado puede describir la forma de un archivo ajeno.
2. Si el test medía la forma de lo que se va, se actualiza en el mismo parche para medir la verdad nueva (acá: 0 escrituras en `router.js`), y lo que quedó huérfano también se va (`saveView`, `saveLegacyFilter`).
3. La suite completa en el canal es la red que vale: el rechazo no rompió nada y explicó el motivo en el RESULT.

## Cómo aplicar

- Antes de un parche que borra: `factory/diagnose/RUN-NNN.json` y una sonda que busque en `tests/` los nombres que se van, o leer los tests que los citan.
- Un parche rechazado no se reusa: se publica uno nuevo con otro número y la razón en el resumen.
