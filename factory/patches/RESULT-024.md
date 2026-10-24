# RESULT de PATCH-024

- Fecha: 2026-10-24T02:06:43.112Z
- Estado: APLICADO
- Resumen: BL-064 CAM-6: limpieza de lo viejo de la Cámara. index.html: se van los 5 botones viejos (Dashboard, Compras, Refrescar, Volver, Sincronizar), su script y el CSS de la cabecera y de Compras 1.x; el panel de Todas las cuentas lo nombra la pestaña nueva. router.js 2.18.0: se va la Tienda de respaldo (la pinta wv-shop-ui.js). Se van también saveView y saveLegacyFilter, que solo usaba esa copia, y hb98 mide lo nuevo (0 escrituras en router.js). Los dos archivos congelados bajan su techo. (Reemplaza a PATCH-023, rechazado por hb98.)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `5f06d249f9bac107c4e6667512e9d822a1c50244` | `64e3ff45d776e44b0139e4143e181b233e4473d5` | 64835 |
| `js/router.js` | `9fbf39d4a3faaf9bbcd01eafe85d1f24acaadd70` | `50ac0fe031111f65f67f653947c5fed430559d52` | 65576 |
| `tools/size-budget.json` | `0307f94d84c0b6e5aefd4f1ae817accb57640800` | `2cbea2669b4bf132433a60cb0b8ac2e08ab770af` | 2294 |
| `tests/hb98-wv-shop-view.test.js` | `d3431c564de264b395c72cb8748ec0936cb5dde0` | `95973a4faca96792629b2acdff725381e3f25ec5` | 6297 |

- Suite de tests: verde antes y después.
