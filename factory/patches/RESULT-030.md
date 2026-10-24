# RESULT de PATCH-030

- Fecha: 2026-10-24T06:13:45.311Z
- Estado: APLICADO
- Resumen: BL-067 LOG-3: achievements.js 3.5.0 deja de inyectar el panel de Logros en la Sidebar («Más cercanos» y 30 categorías) y saca sus utilidades sin uso; index.html sube su ?v, quita la sección vacía #achAsidePanel y baja su techo; el test conjunto cubre «Por categoría» agrupada con ach-categories.js (LES-035).

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/achievements.js` | `53956585120237996751e80143a410c1fdceaab5` | `c4c3daed68e3e9c0949a41ab2fd6a4f8883bc454` | 17897 |
| `index.html` | `5cd2d4d52edc99b6a8be9def4585227a602070e7` | `65556670624bd7d7280ed65101a5933397c32d6b` | 64712 |
| `tools/size-budget.json` | `a3fc1abebb5e23686688deb114c239ab94d63104` | `cca7cc90ad17d0403d9ff69ff7e7f7a53f419778` | 2233 |
| `tests/ach-view.test.cjs` | `f0d793b9be542dcbe0b6e38fad4af86ba92de8bd` | `ddb33c1add5d732090d26acc1015b45b93da52df` | 26659 |

- Suite de tests: verde antes y después.
