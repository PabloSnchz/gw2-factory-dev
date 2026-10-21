# LES-027 — La autonomía tiene un límite físico

- Fecha de registro: 2026-10-21
- Origen: FACTORY-OPS-001

## Qué pasó

Pablo pidió un modelo para operar "durante semanas o meses sin supervisión constante". Las reglas de autonomía ya existían (DEC-014, DEC-021, DEC-022), pero al diseñar el scheduler apareció el límite real: Shiruvana solo trabaja cuando alguien abre una sesión. Ninguna regla escrita en la memoria cambia eso. Lo que sí corre solo es lo que vive en GitHub: tests, workflows y el registro de respuestas.

## Lección

- Antes de diseñar autonomía, separar lo que necesita al agente (decidir, programar, revisar, documentar) de lo que puede correr sin él (tests, chequeos, avisos, registros).
- Lo que puede correr solo se automatiza primero: es gratis y no depende de la plataforma.
- Despertar al agente por horario o por evento depende de la plataforma y tiene costo: es decisión de Pablo, no de la Factory.

## Cómo aplicar

- Cuando una propuesta prometa "trabajo sin supervisión", nombrar qué pieza lo ejecuta de verdad.
- Si una verificación no necesita criterio, va a un workflow, y la Factory lee su resultado al despertar.
