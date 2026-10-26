# DEC-036 — Pasaje a producción: «vía PowerShell» o «vía Shiruvana»

- Estado: PROPUESTA por Pablo (2026-10-26 16:56Z). Se estrena con BL-073; pasa a ACEPTADA cuando Pablo valide esa promoción.
- Fecha: 2026-10-26
- Ámbito: cómo llega a producción (`gw2-wallet-ligero`) lo validado en DEV. No cambia quién decide: la promoción la pide siempre Pablo (DEC-016).
- Relacionadas: BL-073, BL-069, DEC-016, DEC-006, DEC-035, RSK-020

## Contexto

Hasta BL-069, la Factory escribía en producción por API, un archivo por commit y en serie. Para BL-073 eran 67 movimientos (unos 800 KB): muchos commits, ventanas con versiones mezcladas y muchas idas y vueltas. Pablo propuso correrlo él con PowerShell y que yo controle después.

## Decisión

Cuando Pablo pide pasar a producción, dice la modalidad:

1. **«Pasamos a PRD vía PowerShell»** (estándar recomendado para promociones grandes):
   - Yo preparo en DEV `factory/promote/<TAREA>.txt` (manifiesto: `C ruta` copiar, `M origen destino` copiar con otro nombre, `D ruta` borrar) y fijo el commit de DEV.
   - Le paso a Pablo 3 líneas que bajan `factory/promote/promote.ps1` de ese commit y lo corren con `-DevSha`, `-PrdBase`, `-Manifest` y `-Tarea`.
   - El script clona sin `autocrlf`, frena si producción no está en la base, crea `rollback/pre-<tarea>`, copia, controla blob a blob y sube **un solo commit** solo si Pablo escribe SI.
   - Yo controlo producción contra DEV, escribo el informe en `ai-memory/missions/` y le paso la lista de validación.
2. **«Pasamos a PRD vía Shiruvana»**: la modalidad anterior (yo escribo en producción por API, en serie, con rama de vuelta atrás e informe).

Si Pablo dice solo «pasamos a PRD», pregunto la modalidad.

## Consecuencias

- Un commit atómico: no hay ventana con mezcla de versiones.
- Copia exacta (blob a blob), incluso de archivos grandes como `index.html`.
- Sin workflows nuevos en producción.
- Pablo necesita git en su máquina; el script es ASCII y no depende del chat (se baja de GitHub, no se copia y pega).
- El GA de producción ya no requiere un `index.html` distinto: el de DEV lo carga solo en el host de producción (DEC-006).
