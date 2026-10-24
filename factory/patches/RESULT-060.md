# RESULT de PATCH-060

- Fecha: 2026-10-24T23:53:43.725Z
- Estado: APLICADO
- Resumen: BL-070 RAI-5b (2/2, parte 1): sin el panel #strikeTrackerPanel en index.html ni en gn-frame.js 1.0.1; los tests heredados dejan de leer strike-tracker.js (hb94, hb106-t13, idea56, idea57t4, t19c); techo de index.html al tamaño nuevo. Reintento de PATCH-059: la cabecera de gn-frame.js no nombra el archivo retirado (el test lo prohíbe).

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `e222d9b1d5baba6d252e349bc264f438e0106569` | `8355411b116fa253d09bf180e64c325a61eb0fbb` | 63440 |
| `js/gn-frame.js` | `bbb18edab6857edea3715427b919fc5e753d471a` | `77a90c1f79173ec9732e035690495973e7d0f6c9` | 9084 |
| `js/modules.json` | `52f8a6ee6f752156ea11e081c0d04cf37af09daf` | `6fe461c9271ed4e1baf655b4b7f84c641b7b4ff1` | 636 |
| `tests/gn-frame.test.cjs` | `76793eed99e1ed8a1494200a1d2c4da603acfa60` | `30958d4e578c3eaecc07f29fc5b256b23ab1708b` | 8291 |
| `tests/hb94-raid-wing-card.test.js` | `6ea77a4199ff67e2bc9947f73bcb88ef2ff75b2d` | `a3865aac228b8b89881b37edb61fd509823d61e3` | 10230 |
| `tests/hb106-t13-invariante.test.js` | `ebbfd1853d13a085a7e96355f3a6780d3c20fe57` | `247cf64888dc92657755a9831d8939dad63836be` | 13221 |
| `tests/idea56.f1-hint-permiso.test.js` | `940a12a85f4142fcc5e6f983976cc3371f386ee4` | `625264c03df8eab00519385ed5a0ea4cb674b1f2` | 6175 |
| `tests/idea57t4-idioma-contrato.test.js` | `5c17d24b0e9544c6b66da0fe6a8a42f72d27eeef` | `1ea7dd8c14a86b9b583157bca1134638f0628746` | 4023 |
| `tests/t19c-lectores-legacy.test.js` | `c8b2b4e5c5eba9754b28f32eedfc5a54bf76b15a` | `a461201a17df1b2a7bfa885e486b78eb3706d30c` | 9144 |
| `tools/size-budget.json` | `532863a4135d4ef09a375b97388f52f722f24e8a` | `4ea62f57b829ffe9f7de4d947585a0252c5e0683` | 2254 |

- Suite de tests: verde antes y después.
