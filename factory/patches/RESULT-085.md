# RESULT de PATCH-085

- Fecha: 2026-10-25T04:47:54.080Z
- Estado: APLICADO
- Resumen: BL-070 INV-7b (1/2): con los archivos viejos todavía presentes, nada nuevo depende de ellos. gn-frame.js 1.0.2 sin los paneles charactersPanel e inventoryDashboardPanel; inv-multi.js 1.1.0: el nombre de cada ítem del Multicuenta abre su ficha (el número sigue mostrando dónde está), pedido de Pablo; manifiesto al día; 7 tests heredados dejan de leer inventory-hub.js, inventory-dashboard.js y characters.js, conservando lo que miden de achievements.js, accounts-panel.js, app.js, raid-tracker.js, api-gw2.js y la Armería.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/gn-frame.js` | `77a90c1f79173ec9732e035690495973e7d0f6c9` | `f8ed6bdf359377ed659ca80dc8627425c7fd8a6e` | 8922 |
| `js/modules.json` | `072d10dfb33e9c23f2d466316c325c997b5b73dd` | `31f55f244b86019406909b6d22e657ebff9e8374` | 924 |
| `js/inv-multi.js` | `33deb7a3453cdb7f1c045b9eee45d7fff632faaa` | `289155328fe06b278c436765f9a8c632f7355349` | 30815 |
| `tests/inv-multi.test.cjs` | `bb6c53990c22e65aa630da14b1f27c4056205204` | `8ab5d7b821a5fdd9a5c4853f269299cdfd303069` | 22494 |
| `tests/gn-frame.test.cjs` | `30958d4e578c3eaecc07f29fc5b256b23ab1708b` | `874b2a0349cb375c1981c84033d357486cf4879f` | 8290 |
| `tests/idea47-commit1.allsettled.test.js` | `f329b34cb9b41eaeeb00db827538e0c18d51a70c` | `9c4dabc1376ee1c833b02f50d32fba9e0e89bd6b` | 6994 |
| `tests/idea47-commit2.propagate.test.js` | `ea300e4f2addac87d8096c4a53bfd6b4b641fc58` | `9f75227dbd163a6adcc2fd49f151c6339c2af31f` | 8147 |
| `tests/idea55.account-layer.test.js` | `f1f435d810cd133f3fafaa5fcd251970f5a5a82d` | `c46c723d1f3848e4cf957e08487f62c19d4a5cba` | 12312 |
| `tests/idea63-filtros-cuentas.test.js` | `5571ebbcb5778978000df282d8e1b5c9642607f7` | `1d483e24a715f5f689e06a8003997a82fe720861` | 8023 |
| `tests/t19c-lectores-legacy.test.js` | `a461201a17df1b2a7bfa885e486b78eb3706d30c` | `c46e7086ea4ea13a3071a65ef906bb4ab9e1cbf7` | 9149 |
| `tests/armeria-item-icons.test.js` | `cf60bfa2716ceffd2f1d39f93acf8ac73acb3975` | `0c775834bf8dcc76e3375be50348508e0f0feed6` | 24370 |

- Suite de tests: verde antes y después.
