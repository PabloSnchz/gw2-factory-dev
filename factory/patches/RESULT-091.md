# RESULT de PATCH-091

- Fecha: 2026-10-25T15:41:31.409Z
- Estado: APLICADO
- Resumen: BL-070 ACT-2: js/act-model.js 1.0.0 y js/act-view.js 1.0.0 se cargan por el manifiesto, después de Inventario. Vuelta atrás: sacar las dos líneas.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/modules.json` | `915bbfcfccd338c75e1757e5e1190d4e392416b3` | `3ccc98c70b4992e07bc488cc264d14e03d131c2b` | 1019 |

- Suite de tests: ya estaba en rojo antes del parche (2 fallas: tests/act-view.test.cjs: el archivo entra en el presupuesto, va por el manifiesto después del modelo y del marco común, sin emojis, tests/act-view.test.cjs: en los 19 themes cada texto de la vista llega a 4.5:1 sobre las superficies donde se pinta); el parche no rompió ningún archivo nuevo y pasó node --check.
