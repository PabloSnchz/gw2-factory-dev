# RESULT de PATCH-147

- Fecha: 2026-10-26T03:35:43.215Z
- Estado: APLICADO
- Resumen: BL-070 TOP-2 (reintento de PATCH-146): renombrar y eliminar una Key, restaurar una copia, liberar la caché y el error al importar preguntan con la ventana de la Bóveda (app.js 2.9.0, settings-manager 1.0.5); gn-ui 1.0.1 no deja que otra trampa de foco se lleve el Tab.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/app.js` | `7dc8c13f1f6b6554b6c95051d6b76f1d498aa9e0` | `2fcecb7581cb5719cae059d688391df9dbd41427` | 66793 |
| `js/settings-manager.js` | `f78bc8d13f234e2a3ebd9635af17a3565ba6f918` | `f90c60756f0023c6d2f9e0c17ce4ad60d62cfb9d` | 36469 |
| `js/gn-ui.js` | `e763f43bd3334631a5df6806f67f9660fe51d739` | `d1a4d3321e26baf07538997a1205dae62b49d5d9` | 19141 |
| `js/modules.json` | `d7e11020ebf89bdba7e6a0fb8da58bdb3754555b` | `1809cbf4a2eb754b79bf69a4f2a64e1dafd794bb` | 1550 |
| `index.html` | `cfb641c1d7003ea01552e5ece1090b52b41be23c` | `3048c2f230caf3ab343284a9ef14aabfd4afd045` | 54909 |
| `tests/gn-ui.test.cjs` | `c7a1c61e7e7026628e62692f3453c45a7765481e` | `da245b61eaba6306a9a9569f50b3783811bc8c1f` | 19086 |
| `tests/hb104-confirm-antes-de-escribir.test.js` | `93670858202593a620f6e8b76d6c9f3d894327d6` | `15258bccadf210f26e08ab6b6e043f64e38ed69d` | 16054 |
| `tests/idea50-boton-cache.test.js` | `7050c5ed4d02fc81b9091f45b75a3f20ecfc70ee` | `12cf70f537fe814b4692363e28f5d2aa47df2076` | 27667 |

- Suite de tests: verde antes y después.
