# DEC-017 — Gobierno del backlog: READY contiene solo trabajo ejecutable

- Estado: ACEPTADA — parte de FACTORY-RESEARCH-001 (2026-10-20)
- Fecha: 2026-10-20
- Ámbito: Qué puede estar en cada sección de `backlog.md`
- Relacionadas: DEC-009 (formato), DEC-014, DEC-016

## Contexto

El 2026-10-20 READY tenía 8 tareas. Varias no se podían ejecutar:

- BL-007 necesita las CDN, que responden 403 desde el entorno de la Factory;
- BL-008 se configura en otro entorno;
- BL-017 necesita una herramienta que no existe;
- BL-023 tenía la instrucción de no resolverse todavía;
- BL-025 estaba postergada.

READY dejaba de decir la verdad sobre qué puede hacer la Factory y además superaba el límite de 5 (DEC-016).

## Decisión

1. **READY**: solo tareas que la Factory puede ejecutar ya, con prioridad asignada. Máximo 5.
2. **BLOCKED**: tareas que se harán, pero esperan algo concreto. El motivo se escribe después de "Bloqueado:" o "Depende de".
   - El panel muestra como pendiente de Pablo solo los bloqueos que lo nombran.
   - Por eso se nombra a Pablo solo cuando la tarea realmente lo espera.
3. **Ideas, consideraciones y tareas postergadas sin fecha**: vuelven a discovery como DISC con su historia. En el backlog quedan en DONE con el prefijo "Devuelto a discovery", para que sus IDs sigan resolviendo y nada se pierda.
4. **Rechazos de Pablo**: la tarea pasa a DONE con el prefijo "Rechazado por Pablo" y la referencia a la respuesta.
5. **Una sola tarea por problema.** Si una oportunidad se superpone con una tarea existente, se amplía la tarea y no se crea otra.

## Aplicación inicial (2026-10-20)

| Tarea | Antes | Después | Motivo |
|---|---|---|---|
| BL-013 | READY (BAJO, detalle heredado) | READY (ALTO, PSNA del día equivocado) | Discovery DISC-001: el problema real es la rotación vencida, que muestra datos incorrectos todos los días |
| BL-034 | — | READY (ALTO) | Promovida desde DISC-002: metas de Janthir Wilds y Visions of Eternity |
| BL-007 | READY | BLOCKED | CDN con 403 desde el entorno (probado el 2026-10-20) |
| BL-008 | READY | BLOCKED | Fuera del alcance de la Factory |
| BL-017 | READY | BLOCKED | Sin herramienta para borrar ramas |
| BL-023 | READY | DONE: devuelto a discovery (DISC-007) | Consideración futura, no tarea |
| BL-025 | READY | DONE: devuelto a discovery (DISC-008) | Postergada sin fecha desde MC-5 |
| BL-010 | BLOCKED | DONE: rechazado por Pablo | RESP-002 |

Resultado: READY pasa de 8 a 4 tareas (BL-013, BL-034, BL-004 y BL-005) y discovery queda en modo restringido.
