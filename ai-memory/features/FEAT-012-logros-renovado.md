# FEAT-012 — Logros renovado

- **Estado:** en DEV, en curso. LOG-0 aprobado por Pablo (2026-10-24 05:00Z); LOG-1 hecho, espera su validación.
- **Fecha:** 2026-10-24
- **Backlog:** BL-067, paso 3 del restyle de la Bóveda
- **Propuesta aprobada:** `docs/propuestas/propuesta-logros-bl067.html` (`9798082`), con las 4 decisiones: tres pestañas, categorías agrupadas por expansión o modo, tarjetas «te falta» e integración con la Armería.
- **Regla de Pablo (LOG-0):** el ícono oficial de Guild Wars 2 de cada logro se queda en la tarjeta, destacado. Se puede reorganizar la tarjeta y mejorar la jerarquía, pero no reemplazar ni ocultar el ícono. Lo vigila `tests/ach-view.test.cjs`.
- **Producción:** no. La decide Pablo.

## Pasos

| Paso | Qué | Archivos | Estado |
|---|---|---|---|
| LOG-0 | Diagnóstico, maquetas y plan | `docs/propuestas/propuesta-logros-bl067.html` | Aprobado |
| LOG-1 | Cabecera, tres pestañas y mi línea | `js/ach-view.js` 1.0.0 (`8b42616`, por manifiesto), `js/modules.json` (`80e549e`), `tests/ach-view.test.cjs`, PATCH-027 (`achievements.js` 3.3.0 `c666135`, `index.html` `9a8bbaa`, `tools/size-budget.json`) | Hecho, espera validación |
| LOG-2 | Filtros accesibles y tarjetas «te falta» (con el ícono oficial destacado) | `ach-cards.js` (nuevo), parche | Pendiente |
| LOG-3 | «Por categoría» agrupada por expansión o modo; se va el panel de la Sidebar | `ach-categories.js` (nuevo), parche | Pendiente |
| LOG-4 | Colecciones legendarias sin «⚠» y con salto a la Armería | parche | Pendiente |
| LOG-5 | Revisión final: 19 themes, teclado, lector, celular | tests | Pendiente |

## LOG-1: qué cambió para el usuario

- Cabecera nueva, igual que la de la Cámara: ícono oficial de Logros, el dato en el subtítulo («Tenés 23 logros al 80 % o más»), la pastilla «Al alcance +N AP» y cuatro indicadores: puntos de logro (permanentes y de diarios y mensuales), al alcance, a un paso (≥ 95 %) y con recompensa (ítems, títulos y maestrías).
- Tres pestañas:
  - **Casi listos:** la grilla de siempre, con sus tarjetas e íconos.
  - **Por categoría:** las categorías con logros pendientes, con su ícono oficial, cuántos están cerca y cuántos pendientes; tocar una muestra todos sus pendientes en «Casi listos». En LOG-3 se agrupan por expansión o modo.
  - **Colecciones legendarias:** el filtro de legendarias de siempre, con todo lo que está en curso.
- Mi línea en la cabecera, solo si hay algo cerca: «Con 3 logros sumás 45 AP: el más cercano es X y te falta 1», o una recompensa a mano (título o maestría). Si no hay nada cerca, no digo nada.
- «↻ Actualizar» vuelve a pedir sin caché.
- Se fueron la fila vieja de AP (Permanente, Logro diario, «+», Total), el chip suelto de «AP potenciales» y el botón «Refrescar» que ya no se usaba.
- Los botones de filtro ahora dicen lo que filtra la grilla (antes, tocar una categoría en la Sidebar o entrar por un enlace dejaba el botón en «Todas» o «≥ 80%»), el umbral suma «Todos» y el desplegable de categorías no pierde los clics al recargar.

## Cómo está hecho

- `js/ach-view.js` es una capa de vista: lee `Achievements.getSnapshot()` y escucha `gn:achievements`. No pide nada a la API.
- `achievements.js` 3.3.0 publica su estado (`getSnapshot`, `setFilter`, `_calc`) y avisa cada vez que pinta la grilla. Bajó de 52352 a 47454 bytes: salió de la zona congelada a la de advertencia (DEC-035).
- Si `achievements.js` no publica su estado, `ach-view.js` no toca nada (así se publicó primero el módulo y después el parche, sin dejar la pantalla rota en el medio).
- El estado de la pestaña vive en memoria: el router compara la ruta exacta, así que un `?tab=` en el enlace rompería la recarga.

## Verificación

| Qué | Resultado |
|---|---|
| `tests/ach-view.test.cjs` | 17/17 (13 de la vista con datos de prueba y 4 con el `achievements.js` real) |
| PATCH-027 | APLICADO, suite verde antes y después; los 4 blobs iguales a la simulación local |
| Blobs publicados | idénticos a los locales en cada paso |

## Riesgos y deudas

- La guarda de contraste corre en todo Logros, pero las tarjetas todavía tienen colores fijos (barra roja → amarilla, títulos pastel de `achievements-theme.js`). Se van en LOG-2 y LOG-5.
- El panel «Más cercanos» y las 30 categorías de la Sidebar siguen hasta LOG-3.
- Los enlaces con filtros (`?q=`, `?pct=`) siguen sin sobrevivir a una recarga porque el router compara la ruta exacta. Es anterior a LOG-1; lo anoto para el marco común.
