# RESULT de PATCH-299

- Fecha: 2026-10-30T04:01:46.535Z
- Estado: RECHAZADO
- Resumen: BL-084 EQ-1: la curación semanal (DEV y PRD) también lee el equipo de cada ficha de Snow Crows como ids oficiales y mantiene assets/data/builds/gear.json (freno si la página cambia de forma; ficha sin equipo conserva el anterior). Pausa 2,5 s y espera ante 429. builds-watch commitea gear.json y corre los tests del lector.

Ningún archivo cambió. Motivo:

- files[0]: ruta fuera de lo que el canal puede tocar (.github/scripts/bld-curate.cjs)
- files[1]: ruta fuera de lo que el canal puede tocar (.github/scripts/bld-curate.test.cjs)
