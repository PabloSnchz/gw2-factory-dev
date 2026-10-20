# LES-019 — Sin PR ni lectura de CI, la verificación tiene que ser local y completa

- Fecha de registro: 2026-10-20
- Origen: FACTORY-LIVE-001, ciclo L1

## Qué pasó

El plan era publicar BL-002 en una rama, abrir un PR para ver el resultado de CI y recién entonces integrar. La herramienta para crear PRs no estaba disponible en la sesión ("runtime settings are not configured"), y sin PR no hay forma de leer los check runs de un commit. El cambio se publicó directo en `main` y hubo que reenviar `index.html` (68 KB) una segunda vez.

## Lección

- La Factory no puede asumir que va a ver CI. Lo que no se verifica localmente antes de publicar queda sin verificar.
- Un cambio cuya validez depende de CI (por ejemplo, `node --check` sobre archivos que la Factory no tiene en local) no debe publicarse a ciegas en `main`.
- Probar primero si la herramienta de PR está disponible, antes de publicar en una rama, ahorra el doble envío.

## Cómo aplicar

- Antes de un cambio de código: comprobar si se puede abrir un PR. Si no, publicar en `main` en orden de dependencias (LES-017) y solo con tests que ya pasaron en local.
- Postergar los chequeos de CI que no se pueden correr en local hasta tener una forma de leer el resultado (RSK-016).
