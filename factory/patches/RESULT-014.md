# RESULT de PATCH-014

- Fecha: 2026-10-23T22:14:21.499Z
- Estado: APLICADO
- Resumen: FP-5 (DEC-035, RSK-020): los 13 ?v atrasados de index.html al día (inventario OUT-002), la cabecera de settings-manager.js al día (ya era 1.0.4; PATCH-013 rechazado por idea50) y primer módulo cargado desde js/modules.json: wv-tabs-skin.js sale de index.html y lo carga boot.js.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `d17e6e39cee328c82c4f1757a73a762a5ac497b3` | `fd9c1343cb5f60d42a5111f1ba091c2c744761f7` | 69606 |
| `js/settings-manager.js` | `d35a7c31d8da2b65afae04fec5926e8f82d35b9f` | `f78bc8d13f234e2a3ebd9635af17a3565ba6f918` | 35238 |
| `js/modules.json` | `f5e671e9df835877e81e0fea323fac67fb63f36c` | `8a61ed59a416307cbc57549988c9a37910a78925` | 89 |
| `tests/boot.test.cjs` | `2cd44d1961deba133dc7e565e96d44bf27141c34` | `87d2d4910efe96287d676d4725340da622dac73f` | 6301 |

- Suite de tests: verde antes y después.
