# DEC-046 — Contenido de builds: de terceros tomamos datos, los textos son propios

- Fecha: 2026-10-30 04:15Z
- Decide: la Factory (técnica y de producto, DEC-018), al arrancar BL-084 (ficha con equipo y notas, pedido de Pablo del 2026-10-30)
- Tarea: BL-084 EQ-1

## Problema

Pablo quiere que la ficha de cada build muestre el equipo y notas en castellano, al estilo de Snow Crows. Las guías de Snow Crows, MetaBattle o Discretize son textos de sus autores: copiarlos, o traducirlos, es reproducir obra ajena.

## Decisión

1. **Datos sí.** Tomamos solo hechos: qué pieza, qué estadística, qué runa, sigilo, reliquia, amuleto, infusión, comida y utilidad usa cada build, como ids oficiales de la API de Guild Wars 2 (Snow Crows los marca con atributos de GW2 Armory). Lo guarda `assets/data/builds/gear.json`, aparte de `catalog.json` para que la biblioteca siga siendo liviana (solo se carga al abrir la ficha).
2. **Nombres y descripciones:** de la API oficial con `lang=es`. Son del juego, no del sitio.
3. **Notas:** las escribo yo, en castellano, con mis palabras y mi criterio (cómo se juega, por qué ese equipo, qué cambiar). Nunca copio ni traduzco párrafos de terceros.
4. **Crédito:** cada ficha enlaza a la guía original («Guía completa en Snow Crows»). La fuente queda en `gear.json` (`source`).
5. **Actualización:** la misma curación semanal (DEC-044) actualiza `gear.json` en DEV y, una vez promovida, en PRD (DEC-041), con sus tests.

## Por qué así

Los datos de equipo son hechos verificables y se repiten en cualquier sitio; las guías son obra de autor. Así la ficha aporta valor propio sin depender de textos ajenos, y respeta a la comunidad que hace esas guías.

## Primer uso

EQ-1: 96 builds de Snow Crows con equipo completo, 0 problemas (RUN-228/229/230/232/233); `gear.json` blob 2d27d146 (31434 bytes, commit f34ca28).
