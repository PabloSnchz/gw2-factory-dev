# RESULT de PATCH-295

- Fecha: 2026-10-30T01:35:27.343Z
- Estado: APLICADO
- Resumen: BL-082 BLD-ICON (pedido de Pablo): la Sidebar y la cabecera de Builds usan el ícono oficial de la pestaña Build del Panel del héroe (assets/icons/156720.png, ASSET-001). sidebar-nav 2.3.1 (index ?v), bld-view 1.5.1 (modules.json), tests de versión y uno nuevo que fija el ícono.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/sidebar-nav.js` | `c33d8cddc57d1c0ddb9ee7d81b3b3b992af3b2d1` | `410f58f8f17664835dc2acec33ac97f4ed3c9beb` | 40130 |
| `js/bld-view.js` | `4bc1d0477ca14b660a8b2f167707c051b2ff2df9` | `13c1a7322f33418d7bb1dac05d6f2eb3f1d66d09` | 23582 |
| `index.html` | `f6493eeb29c17b8e1a33cf5808a1ddf5bde252bd` | `71a87975af61b00d924c95e9c5d2a72702afa8d3` | 48435 |
| `js/modules.json` | `a6d8c10cb09a5bffe54d0a0209c259db2110f33f` | `a77e82a385e188bdb1b9db3d8c6f989c5e72a6a9` | 2571 |
| `tests/sidebar-nav.test.cjs` | `f2c4328973432961916698310b68c664d53fcfdd` | `6bae05da633cbf4584434b0f7bca28d3bc7d3856` | 36318 |
| `tests/bld-view.test.cjs` | `7a831376963e95639170c4158d63362bda4e20f6` | `37fbe02e4fe966be9467b5bf7e1fa62d73aeac34` | 5549 |

- Suite de tests: verde antes y después.
