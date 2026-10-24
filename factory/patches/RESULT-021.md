# RESULT de PATCH-021

- Fecha: 2026-10-24T01:27:50.737Z
- Estado: APLICADO
- Resumen: BL-064 CAM-5: index.html pide js/wv-purchase-detail.js con ?v=2.0.0 (Todas las cuentas → Compras fijadas: números, −/+ por cuenta, «Gestionar» con «Deshacer»; de 91 KB a 28 KB, la vista en js/wv-purchases-view.js por manifiesto). LES-033: la versión y su ?v suben juntas, y el test de la Idea 55 pasa a fijar la 2.0.0 (la función de online no cambió).

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `43cdb0443834b8448a8816667e805bf7851513b8` | `5f06d249f9bac107c4e6667512e9d822a1c50244` | 69605 |
| `tests/idea55.wv-online-parallel.test.js` | `f96438052978d79d38a0e311a9bc96caf99fca51` | `38deeae1e53d2374c8b1213dcbc16eb22d71ff1f` | 12645 |

- Suite de tests: ya estaba en rojo antes del parche (3 fallas: tests/idea55.wv-online-parallel.test.js, tests/index-versions.test.cjs: index.html pide cada script con la versión que declara el archivo (RSK-020), tests/wv-purchase-detail.test.cjs: versión 2.0.0 con su ?v en index.html; de 91 KB a menos de 40 KB y fuera de los congelados); el parche no rompió ningún archivo nuevo y pasó node --check.
