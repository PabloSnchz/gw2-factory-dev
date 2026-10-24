# RESULT de PATCH-019

- Fecha: 2026-10-24T00:22:25.843Z
- Estado: APLICADO
- Resumen: BL-064 CAM-3: index.html pide js/wv-shop-ui.js con ?v=2.0.0 (Tienda para planificar: línea de AA, progreso por unidades, selector −/+, segmentos y menú «Gestionar» con confirmación y deshacer). wv-shop-manage.js entra por js/modules.json. LES-033: la versión del archivo y su ?v suben juntas.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `c0c81d16f747ba8ff5cf5521d2a2d51887a5cf5e` | `7e6857e14d3c40f3dfbace6ded10cbbaaa815407` | 69606 |

- Suite de tests: ya estaba en rojo antes del parche (2 fallas: tests/index-versions.test.cjs: index.html pide cada script con la versión que declara el archivo (RSK-020), tests/wv-shop-ui.test.cjs: versión 2.0.0 en index.html; wv-shop-manage.js 1.0.0 por el manifiesto); el parche no rompió ningún archivo nuevo y pasó node --check.
