# RESULT de PATCH-023

- Fecha: 2026-10-24T02:01:00.898Z
- Estado: RECHAZADO
- Resumen: BL-064 CAM-6: limpieza de lo viejo de la Cámara. index.html: se van los 5 botones viejos (Dashboard, Compras, Refrescar, Volver, Sincronizar), su script y el CSS de la cabecera y de Compras 1.x; el panel de Todas las cuentas lo nombra la pestaña nueva. router.js 2.18.0: se va la Tienda de respaldo (la pinta wv-shop-ui.js). Los dos archivos congelados bajan su techo.

Ningún archivo cambió. Motivo:

- la suite de tests pasaba y con el parche falla (1 fallas: tests/hb98-wv-shop-view.test.js)
