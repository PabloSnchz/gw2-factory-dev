# REQ-004 — ¿Cuándo puede investigar sola la Factory?

- Estado: CERRADA
- Tipo: decisión
- Fecha: 2026-10-20
- Prioridad: MEDIO
- Relacionado: DEC-015, DEC-016
- Cerrado: 2026-10-20 · RESP-004

## Qué pasó

Pediste que la Factory no investigue si hay decisiones humanas pendientes o tareas bloqueadas por resolver. Leídas al pie de la letra, esas dos condiciones casi siempre se cumplen: siempre hay alguna acción o validación tuya pendiente (hoy, mirar el panel en el celular) y tareas bloqueadas por el entorno (CI, CDN, ramas). Con esa lectura, la Factory casi nunca podría buscar trabajo nuevo, ni siquiera con el backlog vacío.

## Por qué importa

Discovery existe para que la Factory no se quede sin trabajo valioso. Si las condiciones de bloqueo siempre están activas, el sistema queda apagado sin que nadie lo decida. Mientras no respondas, la Factory aplica la lectura literal y no inicia rondas por su cuenta.

## Por qué te lo pregunto

Define cuánta autonomía tiene la Factory para buscar trabajo nuevo, y la autonomía de la Factory la decidís vos (DEC-018). Además, las condiciones las escribiste vos: cambiar cómo se leen sin preguntarte sería reinterpretar tu instrucción.

## Opciones

- A — Lectura literal: sin rondas autónomas mientras haya cualquier pedido abierto o cualquier tarea bloqueada.
- B — Lectura acotada: frenan las rondas solo los pedidos de tipo decisión sin responder, las tareas bloqueadas que la Factory puede destrabar por sí misma y los riesgos CRÍTICOS del registro. No frenan tus acciones y validaciones pendientes (como mirar el panel), los bloqueos externos ni el aviso del panel sobre un riesgo que aceptaste.
- C — Sin esas dos condiciones: frenan las rondas solo READY > 5 y los riesgos CRÍTICOS.

## Recomendación

B — Mantiene tu intención de no investigar cuando hay algo tuyo por decidir o algo propio por destrabar, sin apagar discovery por cosas que la Factory no controla. Los límites de cantidad (READY ≤ 5, 15 abiertas, 3 por ronda) siguen igual y los verifica CI.
