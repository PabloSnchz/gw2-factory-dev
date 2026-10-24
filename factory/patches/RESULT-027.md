# RESULT de PATCH-027

- Fecha: 2026-10-24T05:17:27.804Z
- Estado: APLICADO
- Resumen: BL-067 LOG-1: achievements.js 3.3.0 publica su estado para js/ach-view.js (getSnapshot, setFilter, _calc, gn:achievements), deja de pintar la fila de AP, el chip de AP potenciales y el botón Refrescar sin uso, sincroniza los botones de filtro y acepta el umbral «Todos». Sube su ?v, pasa de congelado a advertencia (52352 → 47454 bytes) y suma el test conjunto con la cabecera nueva.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/achievements.js` | `7687c716dc2aa8d9aae7f290aca4c5df35a938af` | `c6661351d40af02acc31cb00149362c13a2c1af2` | 47454 |
| `index.html` | `64e3ff45d776e44b0139e4143e181b233e4473d5` | `9a8bbaa2bfc412955529f24ad95e1426a14127da` | 64835 |
| `tools/size-budget.json` | `2cbea2669b4bf132433a60cb0b8ac2e08ab770af` | `b476259572a8e51dadb7f4758b3bde7af4b74144` | 2366 |
| `tests/ach-view.test.cjs` | `2f9701be3a05da4b36de0de795d83f1daced0ed2` | `5fd64b70a317bf7f6237d5f57e1d849c5a98b620` | 22731 |

- Suite de tests: verde antes y después.
