# RESULT de PATCH-086

- Fecha: 2026-10-25T04:50:13.187Z
- Estado: APLICADO
- Resumen: BL-070 INV-7b (2/2): después de borrar inventory-hub.js, inventory-dashboard.js, characters.js y characters-theme.js. router.js 2.19.1 sin InventoryHub en MODULOS_CON_LATCH ni los 2 paneles viejos en showPanel; index.html sin #inventoryDashboardPanel y con router ?v=2.19.1; el censo de hb106 baja a 2 módulos con latch; idea61 deja de contar inventory-dashboard.js (umbral 3, la 49D sigue bloqueada); tools/size-budget.json sin los 3 congelados retirados y con los techos nuevos de index.html y router.js.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/router.js` | `95110c57a5b84fb0ef0416575bba71d70b99fb62` | `aa85ed67734846e4f12a94cde040defca754f8be` | 64348 |
| `index.html` | `11eeb6959cb986afec6883b0acd3736d6996873c` | `d1d8b6d421c5f0ae2fdcf35c89d1d2407af9d74f` | 62931 |
| `tools/size-budget.json` | `02c9a393725b5b505cfe78776a3a527f2b48285c` | `5b13b3fe87c2f2fa3bfde95a1813c043fd11e76c` | 2002 |
| `tests/hb106-censo-latch.test.js` | `dd73e4448bdea50448f3b1bce3b09f2f83a2ee65` | `f2314fb7cf185bfff3a7ba58b00804965537b571` | 11375 |
| `tests/idea61-claves-congeladas.test.js` | `2d681bfa1e94785eda73e32ef169a38b46e13782` | `69ff40a30008cf19e65f5dc25a7cf8503e1b6a30` | 26781 |

- Suite de tests: ya estaba en rojo antes del parche (3 fallas: tests/hb106-censo-latch.test.js, tests/idea61-claves-congeladas.test.js, tests/size-budget.test.cjs: la Bóveda cumple su presupuesto de tamaño); el parche no rompió ningún archivo nuevo y pasó node --check.
