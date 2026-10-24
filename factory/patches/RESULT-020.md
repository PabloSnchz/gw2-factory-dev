# RESULT de PATCH-020

- Fecha: 2026-10-24T00:47:23.316Z
- Estado: APLICADO
- Resumen: BL-064 CAM-4: index.html pide js/wv-objectives-dashboard.js con ?v=2.0.0 (Todas las cuentas → Objetivos semanales: números, leyenda, «Solo con pendientes», orden y matriz accesible). LES-033: la versión del archivo y su ?v suben juntas.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `7e6857e14d3c40f3dfbace6ded10cbbaaa815407` | `43cdb0443834b8448a8816667e805bf7851513b8` | 69606 |

- Suite de tests: ya estaba en rojo antes del parche (2 fallas: tests/index-versions.test.cjs: index.html pide cada script con la versión que declara el archivo (RSK-020), tests/wv-objectives-dashboard.test.cjs: versión 2.0.0 y index.html la pide con el mismo ?v; dentro de los 40 KB); el parche no rompió ningún archivo nuevo y pasó node --check.
