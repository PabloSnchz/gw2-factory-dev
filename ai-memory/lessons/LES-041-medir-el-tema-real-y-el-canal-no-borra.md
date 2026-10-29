# LES-041 — Medir con los temas reales; el canal de parches no borra archivos

- Fecha: 2026-10-29
- Tarea: BL-082 BUI-5

## Qué pasó

BUI-1 a BUI-4 usaban solo tokens de los temas y daban por sentado que «con tokens, los 19 temas andan». Al medir (RUN-203) fallaban 11: los temas claros comparten el verde y el rojo de los oscuros, y un acento fijo del módulo no sirve en fondo blanco.

## Qué aprendí

- «Usa tokens» no es «se lee en todos los temas». Antes de cerrar una interfaz: sonda que imprima los tokens (una línea JSON por tema), calcular el contraste con el CSS real y dejar una guarda que lea css/themes/.
- Probar los porcentajes en local (calc5.cjs) con los tokens copiados ahorra parches: un solo PATCH-284 quedó verde.
- El canal de parches solo modifica archivos existentes: crear o borrar archivos va por commit directo (tests/ y ai-memory/ no republican DEV). Un test nuevo que depende de un parche se sube después del RESULT.
- Las sondas *.smoke.cjs de curación se quedan (se vuelven a correr por diagnóstico); las de un solo uso se borran al cerrar, de a una.
