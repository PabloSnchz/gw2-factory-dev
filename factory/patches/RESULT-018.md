# RESULT de PATCH-018

- Fecha: 2026-10-23T23:56:31.025Z
- Estado: APLICADO
- Resumen: BL-064 CAM-2: index.html pide js/wv-objectives-ui.js con ?v=2.0.0 (objetivos agrupados: listos para reclamar, en curso, reclamados; filtro por modo; recompensa del día o de la semana). Regla de LES-033: la versión del archivo y su ?v suben juntas.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `fd9c1343cb5f60d42a5111f1ba091c2c744761f7` | `c0c81d16f747ba8ff5cf5521d2a2d51887a5cf5e` | 69606 |

- Suite de tests: ya estaba en rojo antes del parche (2 fallas: tests/index-versions.test.cjs: index.html pide cada script con la versión que declara el archivo (RSK-020), tests/wv-objectives-ui.test.cjs: versión 2.0.0 y index.html la pide con el mismo ?v); el parche no rompió ningún archivo nuevo y pasó node --check.
