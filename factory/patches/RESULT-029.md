# RESULT de PATCH-029

- Fecha: 2026-10-24T05:40:46.734Z
- Estado: APLICADO
- Resumen: BL-067 LOG-2: achievements.js 3.4.0 deja las tarjetas, los filtros y las recompensas a js/ach-cards.js (por manifiesto): calcula la lista, avisa con gn:achievements y setFilter acepta búsqueda y recompensa. Baja de 47454 a 23325 bytes y entra en el presupuesto (sale de advertencia). Sube su ?v y el test conjunto pasa a cubrir las tarjetas nuevas con el ícono oficial (LES-035).

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/achievements.js` | `c6661351d40af02acc31cb00149362c13a2c1af2` | `53956585120237996751e80143a410c1fdceaab5` | 23325 |
| `index.html` | `9a8bbaa2bfc412955529f24ad95e1426a14127da` | `5cd2d4d52edc99b6a8be9def4585227a602070e7` | 64835 |
| `tools/size-budget.json` | `b476259572a8e51dadb7f4758b3bde7af4b74144` | `a3fc1abebb5e23686688deb114c239ab94d63104` | 2233 |
| `tests/ach-view.test.cjs` | `5fd64b70a317bf7f6237d5f57e1d849c5a98b620` | `858cb3c30e05abd21a76e647a1d595a376bc893c` | 23725 |

- Suite de tests: verde antes y después.
