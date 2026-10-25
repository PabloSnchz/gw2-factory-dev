# FEAT-016 — Actividades renovado y la Heredad como módulo propio

- **Estado:** HECHO en DEV (2026-10-25 21:12Z). Espera la validación de Pablo del paso 3 completo.
- **Fecha:** 2026-10-25 05:35Z (ACT-0 aprobada) → 2026-10-25 21:12Z (ACT-7c).
- **Backlog:** BL-070, paso 3 (Actividades), con BL-055 (la Heredad).
- **Propuesta:** `docs/propuestas/propuesta-actividades-bl070.html` (bfc81db), aprobada con D1 a D6 (2026-10-25 05:35Z).
- **Producción:** no. La promoción la decide Pablo.

## Qué cambió para el usuario

- **Actividades** (`#/activities`): un solo contenedor con el degradado del módulo, como Cartera y Metas.
  - Cabecera con 3 relojes en tu hora local: reset diario (00:00 UTC), cambio del PSNA (08:00 UTC) y semanal (lunes 07:30 UTC).
  - 4 indicadores: fabricación diaria, fractales del día, llave semanal y piedras vetustas.
  - Abre siempre en **Hoy** (D6) y no guarda la pestaña.
- **Hoy:**
  - Las 5 fabricaciones diarias con su ícono oficial, incluido el cristal de cuarzo cargado, que antes faltaba.
  - Los 3 fractales del día con sus 4 rangos (escala 1, 26, 51 y 76 o más) y las escalas recomendadas, y «Mañana» con los 3 siguientes (D4).
  - El PSNA con su día, la cuenta regresiva y los 6 puntos de ruta para copiar (`js/act-psna.js`, la misma lógica de siempre).
- **Semana:**
  - **Llave del León Negro** con su ícono. Queda «Probable» si tenés un personaje de nivel 10 o más creado desde el reset, de cualquier profesión.
    - Como pidió Pablo, raza humana, clase social «Plebeyo» y profesión suben la confianza a «Muy probable», pero no filtran.
    - La API no informa el capítulo terminado, y mi voz lo explica.
    - Vos confirmás con «Ya la saqué» o «Todavía no» (D2).
  - **Cómo la saca la comunidad:** raza Humano y clase social Plebeyo, las 5 profesiones más usadas con su ícono oficial y 5 pasos.
  - **Piedras de invocación vetustas:** Leivas vende 5 por semana, una por moneda (1 de oro, 7.000 de karma, 100 de favor imperial, 10 monedas antiguas y 10 esquirlas de magnetita).
    - Cada una tiene su casilla, con lo que tenés en la cartera y cuánto te falta.
    - Botón «Copiar el punto de ruta de Piedra Arbórea».
- **La Heredad** (`#/account/homestead`, BL-055): módulo propio, en la barra lateral y en la Bienvenida.
  - **Nodos y gatos:** 57 nodos de la API más 10 a mano (Janthir y contratos, que la API no informa; D5), y los 35 gatos.
    - Los filtros son herramienta, «Me faltan», «Sin recolectar hoy» y búsqueda sin tildes.
    - «Recolectado» conserva las marcas de siempre.
  - **Glifos:** los 12 glifos con su efecto (wiki oficial) y, por caja de recolección, «La tenés» o «Te falta».
  - **Decoraciones:** 1210 decoraciones en 27 categorías, con cuántas tenés sobre el tope de 250.
- **Estados honestos:** lo que no se pudo leer dice «sin datos» y nombra el permiso; nunca muestra «te falta» ni 0 sin una lectura. La Key nunca se guarda; las marcas van por cuenta con una huella.

## Pasos

| Paso | Qué | Hecho | Validado | Evidencia |
|---|---|---|---|---|
| ACT-0 | Propuesta visual | entregada | 05:35Z (D1 a D6) | `propuesta-actividades-bl070.html` bfc81db |
| ACT-1 | Datos verificados y modelo | 05:45Z | con ACT-2 | `catalog.json` d9880cb, `js/act-model.js` 1.0.0 |
| ACT-2 | Vista nueva, pestaña Hoy | 15:47Z | 16:08Z | `js/act-view.js` 1.0.0, PATCH-091 y 092 |
| — | Un solo contenedor (gn-shell) | — | 17:53Z | `js/gn-shell.js` 1.0.0 |
| ACT-3 | Fractales del día | 17:57Z | con el dale a ACT-4 | PATCH-101, act-view 1.1.0 |
| ACT-4 | Pestaña Semana: llave y piedras | 18:18Z | 18:24Z | `js/act-week.js` 1.0.0, `key-farm.json`, PATCH-103 |
| ACT-5 | La Heredad como módulo propio | 19:00Z | 19:09Z | `js/home-view.js` 1.0.0, `nodes.json`, PATCH-106 y 107 |
| ACT-6 | Glifos y Decoraciones | 19:40Z | 19:46Z | `js/home-extra.js` 1.0.0, `glyphs.json`, PATCH-109 |
| ACT-7a | El PSNA en la vista nueva | 20:05Z | 20:16Z | `js/act-psna.js` 1.0.0, PATCH-111 |
| ACT-7b | Retiro de la pantalla vieja | 20:36Z | 20:57Z | PATCH-113 y 115 (PATCH-114 rechazado), router 2.21.0 |
| ACT-7c | Revisión final y esta ficha | 21:12Z | — | PATCH-117 (act-week 1.1.0), RUN-072 |

## Lo que se retiró (ACT-7b y ACT-7c)

- `js/activities.js` (64.918 bytes), `js/activities-theme.js` (47.274 bytes) y `js/fractal-tracker-theme.js` (4.575 bytes). Son 116.767 bytes menos de JavaScript en cada carga.
- `index.html` pesa 7.914 bytes menos: sin el CSS de `#activitiesPanel` y `#homeNodesGrid`, ni el script en línea que volvía a meter la grilla vieja de nodos de casa.
- `tests/psna-day.test.cjs`. Lo cubre `tests/act-psna.test.cjs` con las mismas funciones.
- `js/router.js` 2.21.0 ya no precarga, activa ni desactiva Activities. Otros 8 tests heredados se pusieron al día.
- ACT-7c: `js/act-week.js` 1.1.0 ya no intenta leer el −/+ de la pantalla vieja (D3). Desde ACT-7b ese código no encontraba nada. Las marcas −/+ que quedaron guardadas no se pasan a las casillas nuevas: las piedras se marcan de nuevo y se reinician el lunes a las 07:30 UTC.

## Revisión final (ACT-7c)

| Eje | Qué medí | Hallazgo | Arreglo |
|---|---|---|---|
| 19 themes | Cada texto de Actividades (vista, PSNA y Semana), la Heredad (Nodos, Glifos y Decoraciones) y la cabecera común contra sus superficies | Correcto: los 6 tests de contraste pasan 4.5:1 en los 19 themes (RUN-072) | — |
| Teclado | Pestañas de Actividades y de la Heredad | Correcto: tablist con flechas, Inicio y Fin; foco visible en botones, casillas y selector | — |
| Lector de pantalla | Estados y anuncios | Correcto: los estados van en texto (no solo color), con regiones `aria-live` o `role="status"` en cada vista e imágenes decorativas con `alt=""` (0 imágenes sin `alt` en los 5 archivos) | — |
| Celular | Objetivos táctiles | Correcto: 44 px en pestañas, botones, casillas de piedras y nodos | — |
| Movimiento reducido | `prefers-reduced-motion` | Correcto: act-view y home-view lo respetan; act-week, act-psna y home-extra no tienen animaciones | — |
| Almacenamiento | Claves y Key | Correcto: ninguna vista nueva toca `localStorage` directo, todas van por Storage, y la Key nunca se guarda | — |
| Restos | Código nuevo que apuntaba a lo viejo | BAJO: `act-week.js` leía el −/+ de `activities.js` (D3) | `act-week.js` 1.1.0 sin ese camino (PATCH-117) |

RUN-072: 10 archivos y 119 tests verdes (act-model 10, act-view 13, act-psna 11, act-week 11, home-view 13, home-extra 9, gn-shell 6, sidebar-nav 35, size-budget 6 e index-versions 5).

## Cómo evaluarlo

1. En DEV, recargá con Ctrl+F5 y abrí https://pablosnchz.github.io/gw2-factory-dev/#/activities.
2. En Hoy, revisá la fabricación, los fractales y el PSNA. En Semana, la llave con la guía y las piedras: marcá una y cambiá de cuenta.
3. Abrí https://pablosnchz.github.io/gw2-factory-dev/#/account/homestead y recorré las 3 pestañas con el teclado y en el celular.

## Riesgos y deudas

- **BAJO:** `ActModel.stonesFromCount` (en `js/act-model.js`) ya no la usa nadie. Se queda porque está probada y es pura; sale cuando se toque `act-model.js`.
- **BAJO:** `act-view.js` todavía oculta `.panel__title` y `.panel__body` de `#activitiesPanel`, y desde ACT-7b el panel nace vacío. La regla no hace daño; sale en el próximo cambio de `act-view.js`.
- **BAJO:** el título de un test de humo de `act-view` todavía dice «reubica el PSNA de siempre». Lo que mide está al día; el texto se corrige con el próximo cambio de ese test.
- **BAJO:** un comentario de `js/router.js` 2.21.0 dice que `act-week.js` escucha `gn:tokenchange`. La que escucha es `act-view.js`, que redibuja Semana. Se corrige con el próximo cambio del router.
- **BAJO:** `css/theme-polish.css` conserva reglas `.fractal-card` que ya no pintan nada. Se limpian en el paso 8 (capa visual común).
- **BAJO:** nadie escribe más las claves `gn:activities:toggles` y `gn:activities:stones`. Siguen en `storage.js` y en el respaldo de Configuración; los datos guardados no se tocan.
- Fuera de la API: el capítulo de la llave, los nodos de Janthir y los contratos de expedición se confirman a mano (D2 y D5).
