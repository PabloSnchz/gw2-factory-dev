# RESULT de PATCH-087

- Fecha: 2026-10-25T04:56:22.678Z
- Estado: APLICADO
- Resumen: BL-070 INV-7b, revisión final de Inventario y Personajes. inv-view.js 1.5.0: sin los botones, la nota «por ahora su pantalla de siempre» ni openChars, que llevaban a las pantallas viejas ya retiradas. inv-multi.js 1.1.1: al tocar un número el foco va al detalle «dónde está» para que el lector de pantalla lo lea, y al cerrarlo vuelve al número. Manifiesto al día; tests de inv-view e inv-multi.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/inv-view.js` | `824f4e233f8cc212ab971682c644a53bf73d0f3d` | `bd55c7dac22af695be81123b8eca1fc74c7fadab` | 32092 |
| `tests/inv-view.test.cjs` | `0fe5c3b9d86c4f7b457cfca3b22ac3b6c41436be` | `b73548b24c47daa24a91267d91b6a806fef0ed34` | 18263 |
| `js/inv-multi.js` | `289155328fe06b278c436765f9a8c632f7355349` | `540dbf21332f3fc6f23202fe5d27d498ced50b40` | 31439 |
| `tests/inv-multi.test.cjs` | `8ab5d7b821a5fdd9a5c4853f269299cdfd303069` | `775ccba2e4d520847201fd1df1c41dec1f137694` | 23094 |
| `js/modules.json` | `31f55f244b86019406909b6d22e657ebff9e8374` | `915bbfcfccd338c75e1757e5e1190d4e392416b3` | 924 |

- Suite de tests: verde antes y después.
