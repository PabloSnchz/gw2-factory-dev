# REQ-008 — ¿Aprobás el modelo operativo de largo plazo y cómo se despierta Shiruvana?

- Estado: ABIERTA
- Tipo: decisión
- Fecha: 2026-10-21
- Prioridad: MEDIO
- Área: infraestructura
- Relacionado: DEC-014, DEC-020, DEC-021, DEC-022, RSK-016
- Bloquea: nada

## Qué pasó

Pediste diseñar cómo opera Shiruvana durante semanas sin supervisión constante (FACTORY-OPS-001). La propuesta completa está en `missions/FACTORY-OPS-001-modelo-operativo.md`. En resumen:

- un arranque fijo al despertar: estado, recuperación, tus respuestas y alertas;
- un orden fijo para elegir trabajo, con producto primero;
- un presupuesto semanal: 60 % o más de producto y 15 % o menos de panel, memoria y procesos;
- sesiones de hasta 60 minutos o 12 micro-ciclos;
- reglas claras de qué detiene toda la Factory y qué detiene solo un área;
- qué hacer sin trabajo listo: Discovery primero, y si no hay nada, cerrar la sesión sin inventar trabajo;
- 11 métricas de productividad.

El límite real: Shiruvana no se despierta sola. Cada sesión empieza cuando vos escribís. Una sesión programada depende de que la plataforma del agente lo permita, y tiene un costo de uso.

## Por qué importa

Define cuánto avanza la app cuando no estás mirando, y evita que la Factory se dedique a mejorarse a sí misma. Hoy la autonomía funciona, pero solo dentro de las sesiones que abrís.

## Riesgo

- Con A: la Factory avanza solo cuando escribís. No hay riesgo nuevo, pero tampoco avance entre sesiones.
- Con B: hay sesiones programadas que trabajan sin que mires. El riesgo es acumular cambios que nadie revisa; se mitiga con las mismas reglas de detención, nunca producción y un resumen por sesión. Tiene un costo de uso desconocido.
- Con C: el riesgo de B, más los errores del canal. Si el canal falla, la Factory queda quieta sin que nadie lo note.
- Con D: el de A al principio; el de B solo si después lo habilitás. La vigilia agrega una pieza que puede fallar; se mitiga tratando un resultado viejo como alerta.

## Por qué te lo pregunto

Cuánta autonomía tiene la Factory y cuánto cuesta son decisiones tuyas (DEC-018, instrucciones v2). Además, habilitar sesiones programadas es configurar la plataforma del agente: solo vos tenés acceso a eso.

## Opciones

- A — Solo cuando escribís: el modelo operativo se aplica dentro de cada sesión que abrís; no se agrega nada más.
- B — Sesiones programadas: el modelo operativo más 2 sesiones por día que abre la plataforma, si lo permite. Requiere que configures la plataforma y aceptes su costo.
- C — Por eventos del panel: el modelo operativo más un despertar cuando respondés un pedido. Depende de la plataforma y solo avanza cuando respondés.
- D — Híbrido por etapas: el modelo operativo, despertar cuando escribís y una vigilia diaria en GitHub Actions que corre tests y chequeos sin el agente. Más adelante, si la plataforma lo permite y aceptás el costo, se suman sesiones programadas.

## Recomendación

D — Hoy no cuesta nada y no depende de saber si la plataforma permite programar sesiones. La vigilia avisa si algo se rompió entre sesiones y le da a la Factory una forma de ver los tests, que hoy no tiene. Las sesiones programadas quedan como un paso posterior que decidís vos. Se implementa después de BL-034, para no frenar el producto.
