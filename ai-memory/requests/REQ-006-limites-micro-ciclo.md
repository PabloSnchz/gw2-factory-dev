# REQ-006 — ¿Aprobás los límites de tamaño de un micro-ciclo?

- Estado: CERRADA
- Tipo: decisión
- Fecha: 2026-10-20
- Prioridad: ALTO
- Relacionado: LES-012, LES-018, LES-022, RSK-009, RSK-012
- Bloquea: nada
- Cerrado: 2026-10-21 · RESP-006

## Qué pasó

GV-1 se hizo como un solo micro-ciclo de 14 archivos y 7 objetivos, y una interrupción lo cortó con 6 publicados. No es la primera vez: MC-5, la segunda parte de FACTORY-RESEARCH-001 y SD-2 también superaron el límite de 3 archivos.

La propuesta completa está en `missions/FACTORY-GOVERNANCE-003-propuesta.md`. Cada micro-ciclo cumpliría **todos** estos límites:

- 1 objetivo;
- como máximo 3 archivos y 5 commits;
- 1 repositorio;
- como máximo 40 KB enviados;
- como máximo 1 decisión nueva;
- como máximo 20 minutos de punta a punta.

Además: las escrituras siempre en serie, un manifiesto de archivos en `status.md` antes de empezar y un test de CI que lo verifica.

## Por qué importa

Con estos límites, una interrupción cuesta como mucho unos minutos de trabajo, el panel nunca muestra algo falso (como hoy REQ-005, que ya respondiste y sigue abierta) y `status.md` dice exactamente qué falta. Es más lento en commits, pero mucho más recuperable.

## Por qué te lo pregunto

Los límites de micro-ciclo están en las reglas que escribiste para la Factory, y hoy dicen "cumplir al menos una". La propuesta los cambia a "cumplir todas" y fija números nuevos (commits, volumen, tiempo). Cambiar una regla tuya sin preguntarte sería reinterpretarla. Además pediste explícitamente frenar GV-1 hasta tener esta definición.

## Recomendación

Aprobar. Con la aprobación, GV-1 se retoma en 4 micro-ciclos de 2 o 3 archivos. El primero saca REQ-005 de tu panel. Después sigue BL-013 (PSNA). Si querés otros números, rechazá y escribilos en el comentario: se aplican tal como los escribas.
