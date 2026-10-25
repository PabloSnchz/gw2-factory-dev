# RESULT de PATCH-083

- Fecha: 2026-10-25T03:25:40.913Z
- Estado: APLICADO
- Resumen: BL-070 INV-7a: las pantallas viejas de Inventario y Personajes dejan de cargarse. index.html sin inventory-hub.js, inventory-dashboard.js, characters.js ni characters-theme.js; router.js 2.19.0 sin InventoryHub ni InventoryDashboard y #/inventory/dashboard abre la pestaña Multicuenta; los 3 tests heredados que pedían esos scripts ahora exigen que no se carguen; techos de index.html y router.js al tamaño nuevo. Los archivos viejos siguen en el repo (INV-7b). Vuelta atrás: base_sha de cada archivo.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `6e8283fbd10aa3eec31e9f8804d0fa8435b5c1af` | `11eeb6959cb986afec6883b0acd3736d6996873c` | 63170 |
| `js/router.js` | `bb4e4ba9bdc1b37235f870927ecdd00299a2e992` | `95110c57a5b84fb0ef0416575bba71d70b99fb62` | 64806 |
| `tests/idea47-commit2.propagate.test.js` | `0185b3284efdb0efbcfca454af0b4a97dbe74b69` | `ea300e4f2addac87d8096c4a53bfd6b4b641fc58` | 8117 |
| `tests/idea55.characters-ach-layer.test.js` | `8d4749a11e31e89968a4cdfba79f5603999fae3f` | `aee745337a30f68d4001756a8e91e22d3e16c25e` | 8865 |
| `tests/index-identity.test.cjs` | `40a54261074ff1f81f8602d47a76192a14ae1a20` | `15e9e09fa4f8205e601b8000563e831fca6be4fc` | 4343 |
| `tools/size-budget.json` | `057d486b02c7d4c81c699d4db647aa77bb650a2b` | `02c9a393725b5b505cfe78776a3a527f2b48285c` | 2191 |

- Suite de tests: verde antes y después.
