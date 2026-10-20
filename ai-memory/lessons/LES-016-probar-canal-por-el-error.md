# LES-016 — Un canal que actúa por Pablo se prueba por el camino de error

- Fecha de registro: 2026-10-20
- Origen: FACTORY-001B MC-4 (DEC-012)

## Qué pasó

El canal de respuesta escribe decisiones de Pablo en la memoria. Había que comprobar en GitHub real que el workflow se dispara y tiene permisos. Sin embargo, la Factory no puede responder ningún pedido real (REQ-001, REQ-002) en nombre de Pablo, ni crear pedidos o respuestas falsas que ensucien la memoria oficial.

Se probó con un issue marcado como prueba que apunta a un pedido inexistente (el número 999):

- el workflow corrió y comentó el error en 3 s (eso prueba el disparador, el filtro por dueño y la marca, la lectura del repo y el permiso de issues);
- no escribió nada en `ai-memory/` ni generó commits;
- el issue se cerró como "no planificado".

## Lección

- Lo que actúa en nombre de Pablo se verifica por el camino que **no** decide: el rechazo ejercita casi todo el canal sin efectos en la memoria.
- La parte que sí escribe (crear el RESP) se cubre con tests sobre un GitHub simulado. Su confirmación real queda declarada como pendiente, no se da por hecha.

## Cómo aplicar

- Para cada canal o automatismo nuevo que escriba en la memoria: test simulado del camino feliz + prueba real del camino de error + declarar qué quedó sin probar en real.
- Nunca usar un pedido real para probar.
