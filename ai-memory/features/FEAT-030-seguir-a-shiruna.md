# FEAT-030 — Seguir a Shiruna desde el Centro de mando

- Estado: DISPONIBLE — validada por Pablo (2026-11-23, «tarea cumplida»). BL-097 cerrada.
- Fecha: 2026-11-23
- Backlog: BL-097 · Decisiones: DEC-053 (y DEC-007 de Shiruna, su ciclo continuo) · Antes: FEAT-027
- Repo: gw2-factory-dashboard (https://pablosnchz.github.io/gw2-factory-dashboard/), versión 3.3.0
- Archivos: js/pulso.js 1.0.0, js/tablero.js 1.1.0, js/plegar.js 1.1.0, js/alertas.js 1.0.0, js/sudia.js 1.0.0, js/app.js 2.13.0
- Tests: tests/pulso.test.mjs (13), tests/tablero.test.mjs (10), tests/plegar.test.mjs (7), tests/alertas.test.mjs (10), tests/sudia.test.mjs (8); suite 215/215

## Qué hace

- Hoy · «Hoy hizo» en la tarjeta de Shiruna: sus commits desde la medianoche de Buenos Aires, pasos, tareas cerradas, tests y si está activa (< 45 min), hace un rato (< 2 h), quieta con trabajo en cola o descansando. Una sola llamada a la API por carga, cacheada.
- Trabajo · «04 · El tablero de Shiruna» debajo del mío: en curso, bloqueado, en la fila (con «La próxima») y hecho, con el paso por el que va cada tarea. Sus IDs nunca enlazan a mi memoria.
- Trabajo · los dos tableros muestran 5 tarjetas por columna y el resto en «Ver N más», plegado y con scroll propio; «Hecho» de lo más nuevo a lo más viejo; el conteo dice el total (pedido de Pablo: mi «Hecho» tenía cerca de 90 tareas).
- Salud · «¿Cómo está Shiruna?»: crítico si está quieta más de 2 h con cola, si commiteó en rojo o si le bajaron los tests; para revisar si un paso no dice sus tests o si está trabada; informativo si faltan datos. No se suma a mis chequeos.
- Actividad · «El día de Shiruna»: de qué hora a qué hora trabajó, cómo cambiaron sus tests, las pausas de más de 45 min (y si la última sigue abierta con cola) y sus commits del día.
- Todo lee el formato de commit de su ciclo: «BL-NNN paso X/Y — qué — tests N/N». Lo que no lo trae se muestra tal cual, sin inventar datos.

## Revisión

- Mutaciones detectadas en cada paso: 12/12 (pulso), 12/12 (tablero), 11/11 (plegado), 14/14 (alertas), 14/14 (día).
- Sin hallazgos CRÍTICO ni ALTO. Las piezas nuevas se montan después de cada dibujo y nunca rompen el panel si falta un dato.

## Aprendizajes

- El panel la encontró trabada en su primera noche: 6 h sin commits con 5 tareas en cola. Lo que se mide se ve; sin estas vistas no lo habríamos notado.
- Un horario se dice en la hora de Pablo: convertir siempre de UTC a Buenos Aires antes de hablar de «hace cuánto» (me equivoqué una vez en el chat).
