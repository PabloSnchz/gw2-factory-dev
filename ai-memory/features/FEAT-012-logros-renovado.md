# FEAT-012 — Logros renovado

- **Estado:** en DEV, en curso. LOG-0 aprobado (2026-10-24 05:00Z); LOG-1 validado por Pablo; LOG-2 hecho (2026-10-24 05:41Z), espera su validación.
- **Fecha:** 2026-10-24
- **Backlog:** BL-067, paso 3 del restyle de la Bóveda
- **Propuesta aprobada:** `docs/propuestas/propuesta-logros-bl067.html` (`9798082`), con las 4 decisiones: tres pestañas, categorías agrupadas por expansión o modo, tarjetas «te falta» e integración con la Armería.
- **Regla de Pablo (LOG-0):** el ícono oficial de Guild Wars 2 de cada logro se queda en la tarjeta, destacado. Se puede reorganizar la tarjeta y mejorar la jerarquía, pero no reemplazar ni ocultar el ícono. Lo vigilan `tests/ach-view.test.cjs` y `tests/ach-cards.test.cjs`.
- **Producción:** no. La decide Pablo.

## Pasos

| Paso | Qué | Archivos | Estado |
|---|---|---|---|
| LOG-0 | Diagnóstico, maquetas y plan | `docs/propuestas/propuesta-logros-bl067.html` | Aprobado |
| LOG-1 | Cabecera, tres pestañas y mi línea | `js/ach-view.js` 1.0.0 (`8b42616`, por manifiesto), `js/modules.json` (`80e549e`), `tests/ach-view.test.cjs`, PATCH-027 (`achievements.js` 3.3.0 `c666135`, `index.html` `9a8bbaa`, `tools/size-budget.json`) | Validado |
| LOG-2 | Filtros accesibles y tarjetas «te falta» (con el ícono oficial destacado) | `js/ach-cards.js` 1.0.0 (`4d488b9`, por manifiesto), `tests/ach-cards.test.cjs` (`4c6c1dc`), `js/modules.json` (`f3290bb`), PATCH-029 (`achievements.js` 3.4.0 `5395658`, `index.html` `5cd2d4d`, `tools/size-budget.json` `a3fc1ab`, `tests/ach-view.test.cjs` `858cb3c`) | Hecho, espera validación |
| LOG-3 | «Por categoría» agrupada por expansión o modo; se va el panel de la Sidebar | `ach-categories.js` (nuevo), parche | Pendiente |
| LOG-4 | Colecciones legendarias con salto a la Armería | parche | Pendiente |
| LOG-5 | Revisión final: 19 themes, teclado, lector, celular; se retira `achievements-theme.js` | tests | Pendiente |

## LOG-1: qué cambió para el usuario

- Cabecera nueva, igual que la de la Cámara: ícono oficial de Logros, el dato en el subtítulo («Tenés 23 logros al 80 % o más»), la pastilla «Al alcance +N AP» y cuatro indicadores: puntos de logro (permanentes y de diarios y mensuales), al alcance, a un paso (≥ 95 %) y con recompensa (ítems, títulos y maestrías).
- Tres pestañas:
  - **Casi listos:** la grilla.
  - **Por categoría:** las categorías con logros pendientes, con su ícono oficial, cuántos están cerca y cuántos pendientes; tocar una muestra todos sus pendientes en «Casi listos». En LOG-3 se agrupan por expansión o modo.
  - **Colecciones legendarias:** todo lo legendario que está en curso.
- Mi línea en la cabecera, solo si hay algo cerca. Si no hay nada cerca, no digo nada.
- «↻ Actualizar» vuelve a pedir sin caché.
- Se fueron la fila vieja de AP, el chip suelto de «AP potenciales» y el botón «Refrescar» que ya no se usaba.

## LOG-2: qué cambió para el usuario

- **Tarjetas «te falta»:** arriba, el ícono oficial del logro a 48 px (antes 28 px; si el logro no trae ícono, va el de Logros), el nombre y la categoría con su ícono. En grande lo que falta: «Te faltan **2** de 50». Barra verde que pasa a dorada desde el 95 % (se fue la barra roja → amarilla) y nunca dice 100 % si falta algo. Abajo, «+N AP al terminar» y «Wiki ↗».
- **Recompensas con ícono:** ítems con su ícono y cantidad, «Título «X»», «Maestría: X» y monedas en oro, plata y cobre («1 oro 23 plata 45 cobre» en vez de «12.345 cobre»). Se piden una sola vez por tipo y en español; al llegar se cambian solo esas etiquetas, sin repintar la grilla.
- **Wiki en español:** busca el logro en `wiki-es.guildwars2.com` (los nombres llegan en español; antes abría la wiki inglesa con el nombre en español y solía no encontrar nada).
- **Filtros accesibles:** buscador con etiqueta; umbral (≥ 80 %, ≥ 90 %, ≥ 95 %, Todos) y recompensa (Todas, Ítem, Título, Maestría) como botones con `aria-pressed`; categoría con un `<select>` nativo que lista solo las categorías con pendientes. Todo se usa con teclado. En el celular van plegados en «Filtros · N» (N = filtros activos), con controles de 44 px.
- **Sin resultados:** «No hay logros con estos filtros» con «Ver todos los pendientes», que limpia todo.
- **Colecciones legendarias:** misma tarjeta que el resto (sin «⚠ Componentes»); lo que dan se titula «Te da». El salto a la Armería llega en LOG-4.
- Si hay más de 60 resultados, una nota lo dice y sugiere filtrar.

## Cómo está hecho

- `js/ach-view.js` (cabecera y pestañas) y `js/ach-cards.js` (filtros y tarjetas) son capas de vista: leen `Achievements.getSnapshot()` y escuchan `gn:achievements`. Se cargan por `js/modules.json` (DEC-035).
- `achievements.js` 3.4.0 solo calcula: carga los datos, arma `state.rows` y avisa. `setFilter` acepta `cat`, `pct`, `q` (búsqueda) y `reward`, y publica `cardsByModule: true`. Bajó de 47454 a 23325 bytes y salió de la zona de advertencia: ya está en el presupuesto de 40 KB. En dos ciclos pasó de 52352 a 23325 bytes (−55 %).
- Orden de publicación seguro: primero `ach-cards.js` (no hace nada sin `cardsByModule`), después su test con el manifiesto y al final PATCH-029.
- Las recompensas: ítems por `GW2Api.getItemsMany` (con caché); títulos y maestrías en un pedido cada uno a `/v2/titles` y `/v2/masteries` con `lang=es`. Antes había un pedido por recompensa y cada respuesta repintaba toda la grilla.
- La barra de filtros lleva la clase `ach-toolbar`, así «Por categoría» la oculta como antes.

## Verificación

| Qué | Resultado |
|---|---|
| `tests/ach-cards.test.cjs` | 13/13 (incluye la regla del ícono a 48 px, recompensas en un pedido por tipo, teclado y celular) |
| `tests/ach-view.test.cjs` | 17/17; la parte conjunta corre ahora los tres archivos reales (`achievements.js`, `ach-view.js`, `ach-cards.js`) |
| PATCH-027 y PATCH-029 | APLICADOS, suite verde antes y después; los blobs iguales a la simulación local |
| Blobs publicados | idénticos a los locales en cada paso |

## Riesgos y deudas

- `achievements-theme.js` pintaba las tarjetas viejas (`.a-card`); con las nuevas queda sin efecto. Se retira en LOG-5.
- El panel «Más cercanos» y las 30 categorías de la Sidebar siguen hasta LOG-3.
- Los enlaces con filtros (`?q=`, `?pct=`) siguen sin sobrevivir a una recarga porque el router compara la ruta exacta. Es anterior a LOG-1; lo anoto para el marco común.
