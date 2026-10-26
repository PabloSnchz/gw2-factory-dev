# RESULT de PATCH-183

- Fecha: 2026-10-26T23:30:54.379Z
- Estado: APLICADO
- Resumen: BL-074 BLS-3: el conversor (converter-modal 2.1.0, además tira lo vencido) y los logros de Cuentas (acc-view 1.2.0) pasan a IndexedDB por gn-idb 1.1.0

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/converter-modal.js` | `e311da4c9816d77ca61cd612a7ec7d465f2b67be` | `0ebadd56a642ff5b137d266377664fc35c0a7e75` | 48472 |
| `js/gn-idb.js` | `e67b34f311dea6ad8c4e62a6e745068ba6a3c915` | `8ec56a4f710df20beff20941484e37ac12bbad21` | 8450 |
| `js/acc-view.js` | `96434e228eeb16ee0408fb6b6235c04dc6f655af` | `319553fbcc1c75bd01ef578510f493946f8506c8` | 39502 |
| `index.html` | `222e61d87ed2d38f1035bcf205e3a179108b17c2` | `238c2dc6de953f44ec56fc9c593cf06f91078fc7` | 48435 |
| `js/modules.json` | `6e648cc143dafdff00e0869b97c4f739ccaa165e` | `9ffda8dce3079a0a6080ac879333d93f91f7a4b2` | 1694 |
| `tests/gn-idb.test.cjs` | `2422b6e6db3212519642dcc1970940aa763c026d` | `ecf129f37d197c3c809595be489de94f5bbb756b` | 9452 |
| `tests/acc-view.test.cjs` | `62a57a4af2bf65c44e03fde3771f7fc9f6d1954c` | `6b45b20b789b94291b01fd508f769b14e34f43c1` | 24123 |
| `tests/converter-view.test.cjs` | `7692e3ba63c44f268ac261417b4ca375de1ea365` | `eb9f46d430f5ff4dc176906e1b3b8e6cbafc1e12` | 9715 |

- Suite de tests: verde antes y después.
