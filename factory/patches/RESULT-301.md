# RESULT de PATCH-301

- Fecha: 2026-10-30T04:49:19.683Z
- Estado: APLICADO
- Resumen: BL-084 EQ-2 (reintento de PATCH-300, faltaba el base_sha de index.html): js/bld-items.js entra en la ruta #/builds; boot.js 1.3.0 sube el tope de módulos por ruta de 12 a 20 (index.html pide ?v=1.3.0).

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/boot.js` | `05f6b34ed248daafa810a03a7bb191174d0f376e` | `d58b41b8952ffde4fb4a61986025a56481777d00` | 8989 |
| `tests/boot.test.cjs` | `2b64e5dcb4c352d29914c2fb7f4fb7c0ff62fe5d` | `91b29687f7467d34bfe3d7870ca84272848393a4` | 10420 |
| `js/modules.json` | `a77e82a385e188bdb1b9db3d8c6f989c5e72a6a9` | `0daaf50afc0bef663adb2c793c5c57a9fb50c959` | 2621 |
| `index.html` | `71a87975af61b00d924c95e9c5d2a72702afa8d3` | `5a49e8d194be59fb013cf146c069ee18bb4daf4f` | 48435 |

- Suite de tests: verde antes y después.
