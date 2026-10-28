# LES-040 — Archivos grandes: crear un tramo y sumar el resto por parches

- Fecha: 2026-10-28
- Tarea: BL-082 (catalog.json de 53 KB)

## Qué pasó

Subir el catálogo entero en una sola llamada cortó la salida y la llamada no se ejecutó. Borrar varios archivos en paralelo también falló: cada borrado es un commit y chocan entre sí («not a fast forward»).

## Qué aprendí

- Un archivo de más de ~20 KB: crearlo con el primer tramo (JSON válido) y agregar los siguientes con `insert_before` sobre el cierre (`\n]}\n`) en el canal de parches. Calcular antes el blob esperado de cada tramo y compararlo con el RESULT.
- Commits a GitHub: de a uno. Nunca en paralelo sobre la misma rama.
- Las sondas en tests/*.smoke.cjs no las corre la suite: conviene borrarlas en la misma sesión, de a una.
