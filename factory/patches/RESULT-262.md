# RESULT de PATCH-262

- Fecha: 2026-10-28T04:14:57.974Z
- Estado: APLICADO
- Resumen: BL-082 BLD-1 (reintento de PATCH-261 con index.html pidiendo boot.js?v=1.2.0): js/boot.js 1.2.0 carga módulos «por ruta» (routes en js/modules.json, recién al entrar a la ruta); #/builds carga bld-code y bld-view.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `d92e27c421c1edcf58e5e0a41bc11654a9c15251` | `7cfecaa9f2ae0917f2360f353967b55500fb0fc9` | 48435 |
| `js/boot.js` | `130894a27a3c63f32588b97f34b641c50a05f078` | `05f6b34ed248daafa810a03a7bb191174d0f376e` | 8815 |
| `tests/boot.test.cjs` | `c4b53ca3c8e71f5c2ffe14cf1b8432b77cd9e305` | `2b64e5dcb4c352d29914c2fb7f4fb7c0ff62fe5d` | 10300 |
| `js/modules.json` | `075858a3dc8414665b7b457a109dd13c5e56bbe3` | `c5841c6b12fae06d63edcb207c142949840247df` | 2078 |

- Suite de tests: verde antes y después.
