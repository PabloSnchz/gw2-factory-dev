# FEAT-012 — Logros renovado

- **Estado:** en DEV, en curso. LOG-0 aprobado (2026-10-24 05:00Z); LOG-1 y LOG-2 validados por Pablo; LOG-3 hecho (2026-10-24 06:14Z), espera su validación.
- **Fecha:** 2026-10-24
- **Backlog:** BL-067, paso 3 del restyle de la Bóveda
- **Propuesta aprobada:** `docs/propuestas/propuesta-logros-bl067.html` (`9798082`), con las 4 decisiones: tres pestañas, categorías agrupadas por expansión o modo, tarjetas «te falta» e integración con la Armería.
- **Regla de Pablo (LOG-0):** el ícono oficial de Guild Wars 2 de cada logro se queda en la tarjeta, destacado. Se puede reorganizar la tarjeta y mejorar la jerarquía, pero no reemplazar ni ocultar el ícono. Lo vigilan `tests/ach-view.test.cjs` y `tests/ach-cards.test.cjs`. En «Por categoría» va el ícono oficial de cada categoría (`tests/ach-categories.test.cjs`).
- **Producción:** no. La decide Pablo.

## Pasos

| Paso | Qué | Archivos | Estado |
|---|---|---|---|
| LOG-0 | Diagnóstico, maquetas y plan | `docs/propuestas/propuesta-logros-bl067.html` | Aprobado |
| LOG-1 | Cabecera, tres pestañas y mi línea | `js/ach-view.js` 1.0.0 (`8b42616`), `js/modules.json`, `tests/ach-view.test.cjs`, PATCH-027 (`achievements.js` 3.3.0 `c666135`, `index.html`, `tools/size-budget.json`) | Validado |
| LOG-2 | Filtros accesibles y tarjetas «te falta» (con el ícono oficial destacado) | `js/ach-cards.js` 1.0.0 (`4d488b9`), `tests/ach-cards.test.cjs` (`4c6c1dc`), PATCH-029 (`achievements.js` 3.4.0 `5395658`, `index.html` `5cd2d4d`, `tools/size-budget.json`, test conjunto) | Validado |
| LOG-3 | «Por categoría» agrupada por expansión o modo; se va el panel de Logros de la Sidebar | `js/ach-categories.js` 1.0.0 (`a7353e3`), `tests/ach-categories.test.cjs` (`850d5cb`), `js/ach-view.js` 1.1.0 (`43ee65b`), `js/modules.json` (`4fccfe1`), PATCH-030 (`achievements.js` 3.5.0 `c4c3dae`, `index.html` `6555667`, `tools/size-budget.json` `cca7cc9`, `tests/ach-view.test.cjs` `ddb33c1`) | Hecho, espera validación |
| LOG-4 | Colecciones legendarias con salto a la Armería | parche | Pendiente |
| LOG-5 | Revisión final: 19 themes, teclado, lector, celular; se retira `achievements-theme.js` | tests | Pendiente |

## LOG-1: qué cambió para el usuario

- Cabecera nueva, igual que la de la Cámara: ícono oficial de Logros, el dato en el subtítulo, la pastilla «Al alcance +N AP» y cuatro indicadores (puntos de logro, al alcance, a un paso, con recompensa).
- Tres pestañas: «Casi listos», «Por categoría» y «Colecciones legendarias».
- Mi línea en la cabecera, solo si hay algo cerca. «↻ Actualizar» vuelve a pedir sin caché.
- Se fueron la fila vieja de AP, el chip suelto de «AP potenciales» y el botón «Refrescar» sin uso.

## LOG-2: qué cambió para el usuario

- **Tarjetas «te falta»:** ícono oficial del logro a 48 px, nombre y categoría con su ícono; «Te faltan **2** de 50»; barra verde que pasa a dorada desde el 95 % (nunca roja, nunca 100 % si falta algo); «+N AP al terminar» y «Wiki ↗» a la wiki en español.
- **Recompensas con ícono**, pedidas una vez por tipo y en español, sin repintar la grilla. Monedas en oro, plata y cobre.
- **Filtros accesibles:** buscador, umbral y recompensa como botones (`aria-pressed`), categoría con `<select>` nativo; en el celular, plegados en «Filtros · N».
- **Sin resultados:** «Ver todos los pendientes». **Colecciones legendarias:** la misma tarjeta, sin «⚠», con «Te da».

## LOG-3: qué cambió para el usuario

- **«Por categoría» agrupada:** las categorías van dentro de su grupo oficial de Guild Wars 2 (cada expansión, Mundo Viviente, modos de juego…), en el orden del juego. Cada grupo es una tarjeta con su nombre, cuántas categorías muestra, cuánto llevás (%) y cuántos logros tenés cerca.
- **Cada categoría:** su ícono oficial, «N de M» terminados, una barra fina verde (dorada desde el 95 %) y «2 cerca · 3 pendientes». Tocarla abre «Casi listos» con todos sus pendientes, como antes.
- **Buscador** de categoría o expansión (sin acentos ni mayúsculas; si buscás el nombre de un grupo, trae todas sus categorías) y **«Con pendientes» / «Todas»**. Las categorías completas se ven en «Todas», sin botón.
- Si la API no devuelve los grupos, se muestran las categorías juntas y lo digo; mientras cargan, «Agrupando por expansión y modo…».
- **La Sidebar vuelve a ser solo navegación:** se fue el panel de Logros («Más cercanos» y las 30 categorías por orden alfabético) que `achievements.js` inyectaba en la barra lateral, y la sección vacía `#achAsidePanel` de `index.html`.

## Cómo está hecho

- `js/ach-view.js` (cabecera y pestañas), `js/ach-cards.js` (filtros y tarjetas) y `js/ach-categories.js` (categorías agrupadas) son capas de vista sobre `Achievements.getSnapshot()`. Se cargan por `js/modules.json` (DEC-035).
- `ach-view.js` 1.1.0 le pide a `AchCategories.html(snap, calc)` el contenido de la pestaña si está cargado; si no (o si falla), muestra la lista de antes. Devuelve el foco al buscador y a «Con pendientes / Todas» al redibujar.
- `ach-categories.js` hace un solo pedido público a `/v2/achievements/groups?ids=all&lang=es` (sin API Key), lo guarda en memoria y, si falla, reintenta recién al minuto. El buscador y el modo redibujan solo la lista, no la cabecera.
- Orden de publicación seguro: `ach-view.js` 1.1.0 (funciona sin el módulo nuevo), después `ach-categories.js` con el manifiesto y al final PATCH-030.
- `achievements.js` 3.5.0 solo calcula y avisa: sin el panel de la Sidebar ni sus utilidades sin uso (`iconImg`, `fmtPct`, `fmtInt`, `esc`). En tres ciclos pasó de 52352 a 17897 bytes (−66 %). `index.html` bajó a 64712 bytes y su techo también.
- `router.js` todavía busca `#achAsidePanel` al cambiar de módulo; como ya no existe, no hace nada (lo controla con `if (ach)`). Se limpia cuando se renueve el router.

## Verificación

| Qué | Resultado |
|---|---|
| `tests/ach-categories.test.cjs` | 11/11 (grupos y orden, buscador, fila con ícono oficial, un solo pedido, error, controles, celular) |
| `tests/ach-view.test.cjs` | 19/19; la parte conjunta corre los cuatro archivos reales y cubre «Por categoría» agrupada |
| `tests/ach-cards.test.cjs` | 13/13 |
| PATCH-027, PATCH-029 y PATCH-030 | APLICADOS, suite verde antes y después; los blobs iguales a la simulación local |
| Blobs publicados | idénticos a los locales en cada paso |

## Riesgos y deudas

- `achievements-theme.js` pintaba las tarjetas viejas (`.a-card`); con las nuevas queda sin efecto. Se retira en LOG-5.
- El salto a la Armería desde «Colecciones legendarias» llega en LOG-4.
- Los enlaces con filtros (`?q=`, `?pct=`) siguen sin sobrevivir a una recarga porque el router compara la ruta exacta. Es anterior a LOG-1; lo anoto para el marco común.
