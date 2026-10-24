# RESULT de PATCH-031

- Fecha: 2026-10-24T06:52:15.675Z
- Estado: APLICADO
- Resumen: BL-067 LOG-5: achievements.js 3.6.0 — la grilla deja de ser región viva (el lector leía todas las tarjetas en cada filtro; ahora avisa ach-cards.js 1.2.0) y se van showLegendaryTracker y referencias sin uso; index.html sube su ?v, deja de cargar js/achievements-theme.js (pintaba tarjetas .a-card que ya no existen) y baja su techo; el test conjunto lo vigila.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/achievements.js` | `c4c3daed68e3e9c0949a41ab2fd6a4f8883bc454` | `b9cc84a3811febb5b6e6a591093d735a8bd19ab8` | 17625 |
| `index.html` | `65556670624bd7d7280ed65101a5933397c32d6b` | `649a09bd1eb2ce5f60e139cff490823c75a3b256` | 64653 |
| `tools/size-budget.json` | `cca7cc90ad17d0403d9ff69ff7e7f7a53f419778` | `1c681cc8d2f24ea41bd4ec61016e074dc04f27bd` | 2233 |
| `tests/ach-view.test.cjs` | `9ca02a40caa281e3d39f604c439e6df6fc14708a` | `fb7dd467f1f1ce882106dd0629d215a0a3ffa1cc` | 28028 |

- Suite de tests: verde antes y después.
