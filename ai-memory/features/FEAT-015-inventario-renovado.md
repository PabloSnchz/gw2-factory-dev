# FEAT-015 — Inventario y Personajes renovado

- **Estado:** HECHO EN DEV (2026-10-25 05:00Z). Espera la validación de Pablo.
- **Fecha:** 2026-10-25 00:28Z (INV-0) → 2026-10-25 05:00Z (INV-7b).
- **Backlog:** BL-070, paso 2 (Inventario y Personajes).
- **Propuesta:** `docs/propuestas/propuesta-inventario-bl070.html` (b849cb5), aprobada con D1 a D6 (2026-10-25 00:55Z).
- **Producción:** no. La promoción la decide Pablo.

## Qué cambió para el usuario

- **Un solo módulo con 6 pestañas:** Multicuenta, Buscar, Materiales, Banco, Armería legendaria y Personajes. La primera vez abre en Multicuenta y después recuerda la última pestaña que usaste (D6, clave `gn:inventory:tab`).
- **Cabecera:** 4 indicadores (banco, materiales, armería legendaria y personajes) y un aviso si el banco tiene menos del 10 % libre.
- **Multicuenta** (antes, el Dashboard multicuenta):
  - los 3 sets de siempre: Alto Valor, Materiales de artesanía (con sus tiers) y Símbolos y demás;
  - elegir ítems, ordenar por cualquier ítem, ocultar cuentas o ítems en cero y las cuentas principales, total por ítem y valor con el precio de venta del Bazar;
  - las preferencias de antes (`inv_dashboard_*`) se respetan;
  - D5: cuenta el depósito, el banco, las ranuras compartidas y las bolsas de **todos** los personajes (antes, solo un personaje), de a 3 cuentas;
  - tocar un número muestra dónde está; tocar el nombre de un ítem abre su ficha (pedido de Pablo, 2026-10-25 04:39Z).
- **Buscar** (D1): busca en el banco, el depósito, la armería, las ranuras compartidas y las bolsas de todos los personajes. Las bolsas se piden recién al buscar.
- **Materiales:** las 9 categorías del juego. **Banco:** por pestaña de 30, como en el juego. **Armería legendaria:** por tipo.
- **Personajes** (D4, como pestaña): profesión, especialización de élite, raza, nivel, oficios y «Qué lleva» cada uno. Sin Mapa ni Punto de interés (D2): la API no da la ubicación. Las asignaciones guardadas no se borran.
- **Ficha del ítem** (D3): dónde está, precio del Bazar (compra y venta), lo que paga el mercader, código de chat con «Copiar» y búsqueda en la wiki en español.
- **Marcadores viejos:** `#/account/characters` abre el módulo y `#/inventory/dashboard` abre la pestaña Multicuenta.
- **Estados honestos:** lo que no se pudo leer dice «sin datos», nunca 0. La Key nunca se guarda.

## Pasos

| Paso | Qué | Fecha | Evidencia |
|---|---|---|---|
| INV-0 | Propuesta visual (v2 con el Multicuenta) | 00:28Z → 00:55Z | `propuesta-inventario-bl070.html`, PATCH-067/069 |
| INV-1 | Datos y modelo | 01:08Z | `js/inv-model.js` b2254ee, `material-categories.json`, sets corregidos (PATCH-071), validado 01:37Z |
| INV-2 | Vista nueva: cabecera, Materiales, Banco, Armería | 01:26Z | `js/inv-view.js` 1.0.0, validado 02:17Z |
| INV-3 | Pestaña Multicuenta | 01:58Z | `js/inv-multi.js` 1.0.0, PATCH-075, validado 02:31Z |
| INV-4 | Pestaña Buscar | 02:27Z | `js/inv-search.js` 1.0.0, PATCH-077, validado 02:31Z |
| INV-5 | Pestaña Personajes | 02:45Z | `js/inv-chars.js` 1.0.0, `professions.json`, PATCH-079, validado 02:47Z |
| INV-6 | Ficha del ítem | 02:56Z | `js/inv-sheet.js` 1.0.0, PATCH-081, validado 03:17Z |
| INV-7a | Las pantallas viejas dejan de cargarse | 03:27Z | PATCH-083, router 2.19.0 |
| INV-7b | Retiro de las pantallas viejas y revisión final | 05:00Z | PATCH-085 a PATCH-087; 4 archivos y 3 tests heredados borrados |

## Lo que se retiró (INV-7b)

- `js/inventory-hub.js` (70.258 bytes), `js/inventory-dashboard.js` (53.460), `js/characters.js` (62.006) y `js/characters-theme.js`. Desde INV-7a ya no se cargaban.
- Tests que solo medían esos archivos: `inventory-dashboard.abort`, `idea78-puntos-logros-nan` e `idea55.characters-ach-layer`. Otros 9 tests dejaron de leerlos y conservan lo que miden del resto de la app (achievements.js, accounts-panel.js, app.js, raid-tracker.js, api-gw2.js, la Armería, storage).
- `index.html` sin `#inventoryDashboardPanel`; `js/gn-frame.js` 1.0.2 sin `charactersPanel` ni `inventoryDashboardPanel`; `js/router.js` 2.19.1 sin InventoryHub en `MODULOS_CON_LATCH` ni los 2 paneles en `showPanel`; `tools/size-budget.json` sin los 3 congelados.
- Se conservan a propósito: el alias `#/inventory/dashboard` (sidebar y router) y la exportación de las asignaciones de Personajes en Configuración y en el respaldo (`settings-manager.js`, `gist-sync.js`).

## Revisión final (INV-7b)

| Eje | Qué medí | Hallazgo | Arreglo |
|---|---|---|---|
| 19 themes | Cada texto de las 5 hojas contra sus superficies | Correcto: los 5 tests de contraste (vista, Multicuenta, Buscar, Personajes, ficha) pasan en los 19 themes | — |
| Teclado | Pestañas, ficha y Multicuenta | Correcto: tablist con flechas, Inicio y Fin; la ficha atrapa el foco, Escape cierra y el foco vuelve al ítem | — |
| Lector de pantalla | Anuncios | MEDIO: en el Multicuenta, el detalle «dónde está» se dibujaba con su región y el lector no lo leía | `inv-multi.js` 1.1.1: el foco va al detalle y, al cerrar, vuelve al número |
| Celular | Objetivos táctiles | Correcto: 44 px en pestañas, botones, filtros y los nombres del Multicuenta | — |
| Movimiento reducido | `prefers-reduced-motion` | Correcto en la vista y la ficha | — |
| Restos | Código nuevo que apuntaba a lo viejo | BAJO: `inv-view.js` conservaba botones, una nota «por ahora su pantalla de siempre» y `openChars` para las pantallas viejas | `inv-view.js` 1.5.0 sin ese camino |

## Verificación

- Tests propios: `inv-model`, `inv-view`, `inv-multi`, `inv-search`, `inv-chars` e `inv-sheet` (contraste en 19 themes, humo con DOM, mutaciones en cada paso).
- RESULT-085: suite verde antes y después. RESULT-086: pasa de rojo (el esperado tras borrar los archivos) a verde. RESULT-087: suite verde antes y después.

## Cómo evaluarlo

1. En DEV, Ctrl+F5 y abrir Inventario y Personajes.
2. Multicuenta: tocar el nombre de un ítem (arriba de la tabla) abre su ficha; tocar un número muestra dónde está, con «Ver la ficha» y «Cerrar».
3. Abrir un marcador viejo `#/inventory/dashboard`: abre Multicuenta.
4. Recorrer las 6 pestañas con el teclado (flechas) y en el celular.

## Riesgos y deudas

- **BAJO:** `css/theme-polish.css` conserva unas 34 reglas de `#inventoryDashboardPanel` que ya no pintan nada. Se limpian con el paso 8 (capa visual común), que achica ese archivo.
- **BAJO:** el resumen de cuenta de la pantalla vieja de Personajes (puntos de logro, rango JcJ y McM, etiqueta del clan) vuelve en el paso Cuentas, por decisión de Pablo (2026-10-25 04:39Z). Al rehacerlo, sumar los logros con `Number(a.current) || 0` (la API omite `current` en un logro completado sin tiers: era el bug de idea78).
- **BAJO:** las claves de la pantalla vieja de Personajes (asignaciones de mapa y punto de interés, caché de personajes) quedan en el navegador sin uso; siguen en el respaldo de Configuración.
- `tools/legacy/` no se toca.
