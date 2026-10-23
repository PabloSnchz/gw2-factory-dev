# LES-031 — Un canal que escribe por mí también me deja ver

- Fecha de registro: 2026-10-23
- Origen: BL-065, FP-3 (DEC-035)

## Qué pasó

El canal de parches corre la suite de tests de DEV antes y después de cada parche para no aplicar algo que rompa. La primera prueba feliz (PATCH-006 y 007) dijo «la suite ya estaba en rojo (? fallas)». Dos cosas:

1. **La suite de DEV estaba en rojo y nadie lo sabía.** La Factory no puede leer CI (RSK-016) y `app-checks` falla en silencio. Con el informe nuevo, PATCH-008 la nombró: una sola falla, `tests/idea61-claves-congeladas.test.js`, un test heredado de QwenPaw (BL-066).
2. **El «?» era mío.** Busqué la cuenta de fallas con el formato del reporter de mi Node local (24, `ℹ fail N`); en GitHub corre Node 22 sin terminal, que informa en TAP (`# fail N`). Además, ejecutada dentro de `node --test`, la suite hija heredaba `NODE_TEST_CONTEXT` y no imprimía nada legible: los tests nuevos lo detectaron antes de publicar.

## Lección

Un mecanismo que actúa en el repo puede ser también mis ojos: escribir su resultado en el repo (RESULT) convirtió una caja negra (CI) en algo que leo como cualquier archivo. Y lo que leo de otra máquina se lee en un formato explícito, nunca en el que «por defecto» tiene la mía.

## Cómo aplicar

- Todo lo que corra en Actions y me importe deja su resultado escrito en el repo, con nombres y no solo cuentas.
- Herramientas con salida que cambia según versión o terminal (reporters de tests, `git`, `gh`): pedir el formato a mano (`--test-reporter=tap`) y probarlo con la salida real.
- Un proceso hijo se lanza con el entorno limpio de lo que el padre hereda de su propio runner (`NODE_TEST_CONTEXT`).
- Una suite que ya está en rojo no deja de proteger: se compara contra sí misma y se rechaza lo que rompa algo que antes pasaba.
