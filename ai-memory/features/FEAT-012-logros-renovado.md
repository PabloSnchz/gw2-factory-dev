# FEAT-012 — Logros renovado

- **Estado:** hecho en DEV. LOG-0 aprobado (2026-10-24 05:00Z); LOG-1 a LOG-4 validados por Pablo; LOG-5, la revisión final, hecho (2026-10-24 06:58Z) y validado por Pablo con todo BL-067, visual y funcional (2026-10-24 13:10Z). En producción por orden de Pablo (BL-069, 2026-10-24).
- **Fecha:** 2026-10-24
- **Backlog:** BL-067, paso 3 del restyle de la Bóveda
- **Propuesta aprobada:** `docs/propuestas/propuesta-logros-bl067.html` (`9798082`), con las 4 decisiones: tres pestañas, categorías agrupadas por expansión o modo, tarjetas «te falta» e integración con la Armería.
- **Regla de Pablo (LOG-0):** el ícono oficial de Guild Wars 2 de cada logro se queda en la tarjeta, destacado. Se puede reorganizar la tarjeta y mejorar la jerarquía, pero no reemplazar ni ocultar el ícono. Lo vigilan `tests/ach-view.test.cjs` y `tests/ach-cards.test.cjs`. En «Por categoría» va el ícono oficial de cada categoría (`tests/ach-categories.test.cjs`).
- **Producción:** sí, por orden de Pablo (BL-069, 2026-10-24 15:07Z a 15:20Z): `ach-view.js` 1.3.0, `ach-cards.js` 1.2.0, `ach-categories.js` y `ach-armory.js` 1.0.0 por el manifiesto, `achievements.js` 3.6.0 e `index.html` sin `#achAsidePanel` ni `achievements-theme.js` (GA de producción intacto, DEC-006). Blobs idénticos a DEV. Vuelta atrás: rama `rollback/pre-restyle-ciclo` (`374b6f0`).

## Pasos

| Paso | Qué | Archivos | Estado |
|---|---|---|---|
| LOG-0 | Diagnóstico, maquetas y plan | `docs/propuestas/propuesta-logros-bl067.html` | Aprobado |
| LOG-1 | Cabecera, tres pestañas y mi línea | `js/ach-view.js` 1.0.0 (`8b42616`), `js/modules.json`, `tests/ach-view.test.cjs`, PATCH-027 (`achievements.js` 3.3.0 `c666135`, `index.html`, `tools/size-budget.json`) | Validado |
| LOG-2 | Filtros accesibles y tarjetas «te falta» (con el ícono oficial destacado) | `js/ach-cards.js` 1.0.0 (`4d488b9`), `tests/ach-cards.test.cjs` (`4c6c1dc`), PATCH-029 (`achievements.js` 3.4.0 `5395658`, `index.html` `5cd2d4d`, `tools/size-budget.json`, test conjunto) | Validado |
| LOG-3 | «Por categoría» agrupada por expansión o modo; se va el panel de Logros de la Sidebar | `js/ach-categories.js` 1.0.0 (`a7353e3`), `tests/ach-categories.test.cjs` (`850d5cb`), `js/ach-view.js` 1.1.0 (`43ee65b`), `js/modules.json` (`4fccfe1`), PATCH-030 (`achievements.js` 3.5.0 `c4c3dae`, `index.html` `6555667`, `tools/size-budget.json` `cca7cc9`, `tests/ach-view.test.cjs` `ddb33c1`) | Validado |
| LOG-4 | Colecciones legendarias con salto a la Armería | `js/ach-armory.js` 1.0.0 (`3c29765`), `tests/ach-armory.test.cjs` (`a33451a`), `js/ach-cards.js` 1.1.0 (`58a89ec`), `js/ach-view.js` 1.2.0 (`3e09666`), sus tests y `js/modules.json` (`6169da7`). Sin parche | Validado |
| LOG-5 | Revisión final: 19 themes, teclado, lector, celular; se retira `achievements-theme.js` | `js/ach-cards.js` 1.2.0 (`a73c9ba`), `tests/ach-cards.test.cjs` (`37ec40c`), `js/modules.json` (`fb52fe5`), PATCH-031 (`achievements.js` 3.6.0 `b9cc84a`, `index.html` `649a09b`, `tools/size-budget.json` `1c681cc`, `tests/ach-view.test.cjs` `fb7dd46`), `js/achievements-theme.js` borrado (`c1d0021`), `tests/ach-a11y.test.cjs` nuevo | Validado |

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

## LOG-4: qué cambió para el usuario

- **«Ver en la Armería →»** en la tarjeta, al lado de «Wiki ↗», con borde dorado, cuando lo que da el logro es una legendaria o una pieza que usa **una sola** legendaria (por ejemplo, el colmillo de Tooth of Frostfang → «Colmilloescarcha»). Las piezas compartidas (Don de la Maestría, Don de la Fortuna, Tributo místico…) no llevan enlace: no adivino.
- **El clic** lleva a la Armería y, cuando está lista, abre la ficha de esa legendaria. Ctrl+clic o el botón del medio abren la Armería en otra pestaña, como cualquier enlace.
- **En «Colecciones legendarias»** se piden los precursores (una sola vez) para encontrar también las partes de los precursores; al llegar, las tarjetas se vuelven a pintar con los enlaces nuevos.
- **Mi línea en esa pestaña:** «Tu colección más avanzada es «X»: vas N % y te faltan K.» y, si sé a qué legendaria lleva, «Es para «Y»: lo que falta de la legendaria lo ves en la Armería.».
- El enlace tiene nombre accesible («Ver la legendaria «Y» en la Armería») y foco visible.

## LOG-5: revisión final

Medí antes de tocar (RUN-012, con los 19 themes reales y la guarda de la Bienvenida) y después (RUN-014).

| Hallazgo | Nivel | Qué hice |
|---|---|---|
| `achievements.js` marcaba toda la grilla como región viva (`aria-live`): con lector de pantalla, cada filtro leía las 60 tarjetas | ALTO | La grilla ya no es región viva (`achievements.js` 3.6.0, PATCH-031). `ach-cards.js` 1.2.0 avisa una sola frase en `role=status`: «Ves 12 logros.», «Ves los 60 más cercanos de 75 logros.» o «No hay logros con estos filtros.», y solo si cambió |
| `achievements-theme.js` seguía cargándose en cada página y vigilando el panel para pintar tarjetas `.a-card` que ya no existen | MEDIO | Se retira: `index.html` deja de cargarlo (PATCH-031) y el archivo se borró. Nadie más lo usaba (RUN-012: solo lo nombraban documentos) |
| «Ver en la Armería →» y «Wiki ↗» medían 28 px de alto en el celular | BAJO | 44 px en pantallas de hasta 900 px |
| Restos en `achievements.js`: el interruptor del tracker de legendarias, el buscador y la cabecera viejos, un título de sección engañoso | BAJO | Fuera (17897 → 17625 bytes). `index.html` bajó a 64653 bytes y su techo también |
| Contraste | — | Sin cambios necesarios: los textos de Logros usan solo `--tx-1`, `--tx-2`, `--acc-1` y `--color-amber`. Con la guarda, en los 19 themes todos pasan 4.5:1 sobre fondo, tarjeta y cabecera (el más justo: One Dark, `--tx-2` sobre la cabecera, 4.63), el foco pasa 3:1 y las barras también (Notion, 4.77) |
| Teclado, movimiento reducido | — | Ya estaban bien: foco visible en todo, flechas/Inicio/Fin en las pestañas, nadie quita el contorno, sin animaciones propias en tarjetas ni categorías |

`tests/ach-a11y.test.cjs` (7 tests) deja todo esto vigilado: colores permitidos, contraste en los 19 themes reales, guarda sobre `#achievementsPanel`, foco y teclado, lector, celular y que `achievements-theme.js` no vuelva.

## Cómo está hecho

- `js/ach-view.js` (cabecera y pestañas), `js/ach-cards.js` (filtros y tarjetas), `js/ach-categories.js` (categorías agrupadas) y `js/ach-armory.js` (puente a la Armería) son capas de vista sobre `Achievements.getSnapshot()`. Se cargan por `js/modules.json` (DEC-035), con `ach-armory.js` antes de `ach-cards.js` para que el enlace esté desde la primera pintada.
- `ach-view.js` 1.1.0 le pide a `AchCategories.html(snap, calc)` el contenido de la pestaña si está cargado; si no (o si falla), muestra la lista de antes. Devuelve el foco al buscador y a «Con pendientes / Todas» al redibujar. Aplica la guarda de contraste de la Bienvenida sobre `#achievementsPanel`.
- `ach-categories.js` hace un solo pedido público a `/v2/achievements/groups?ids=all&lang=es` (sin API Key), lo guarda en memoria y, si falla, reintenta recién al minuto.
- `ach-armory.js` no hace pedidos: usa las recetas que la Armería ya carga y, en «Colecciones legendarias», los precursores. Para abrir la ficha usa la API pública de la Armería (`LegendaryTracker.openItemModal(id)`).
- `achievements.js` 3.6.0 solo calcula y avisa. En cuatro ciclos pasó de 52352 a 17625 bytes (−66 %).
- `router.js` todavía busca `#achAsidePanel` al cambiar de módulo; como ya no existe, no hace nada (lo controla con `if (ach)`). Se limpia cuando se renueve el router.

## Verificación

| Qué | Resultado |
|---|---|
| `tests/ach-a11y.test.cjs` | 7/7 con los 19 themes reales (RUN-014) |
| `tests/ach-view.test.cjs` | 20/20; la parte conjunta corre los archivos reales y vigila `achievements.js` 3.6.0 |
| `tests/ach-cards.test.cjs` | 16/16 (nuevos: aviso al lector una sola vez, 44 px en el celular) |
| `tests/ach-categories.test.cjs` | 11/11 |
| `tests/ach-armory.test.cjs` | 9/9 |
| Total Logros | 63/63 en DEV (RUN-014), más `index-versions`, `size-budget`, `boot`, `welcome-contrast` y `legacy-census` en verde |
| PATCH-027, 029, 030 y 031 | APLICADOS, suite verde antes y después; los blobs iguales a la simulación local |
| Blobs publicados | idénticos a los locales en cada paso |

## Riesgos y deudas

- LOG-4: el mapeo usa las recetas del repo. Si una colección real da una pieza que la receta no lista, no aparece el enlace (falla hacia «no muestro», nunca hacia un salto equivocado). Falta mirarlo con colecciones reales de Gen 3 y armaduras.
- Documentos que todavía nombran `achievements-theme.js` como parte de la Bóveda: `README.md`, `docs/ONBOARDING.md`, `docs/Modulos JS Referencia.md` y comentarios en `characters-theme.js` y `commerce-delivery-theme.js`. No afectan nada; los corrijo cuando toque cada documento o módulo.
- `css/main.css` y `css/theme-polish.css` siguen teniendo reglas para `.a-card` (la Armería también usa esa clase en algunos lugares). Se revisan en el paso 8 del restyle (marco común).
- Los enlaces con filtros (`?q=`, `?pct=`) siguen sin sobrevivir a una recarga porque el router compara la ruta exacta. Es anterior a LOG-1; lo anoto para el marco común.
