# LES-045 — Un módulo con versión fijada en tests se publica con sus tests en el mismo parche

- Fecha de registro: 2026-11-16
- Tarea: BL-084 EQ-9b (bld-import 1.1.0) y EQ-10
- Complementa: LES-015 (commit atómico), LES-018 (escrituras en serie), LES-032 (la suite roja era mía)

## Qué pasó

Publiqué js/bld-import.js 1.1.0 directo (entraba en una publicación) y después, con PATCH-358, sus tests y modules.json. Entre las dos escrituras, cerca de 1 minuto, la suite quedó en rojo: tests/bld-mods.test.cjs fija la versión de Importar y tests/boot.test.cjs exige que modules.json coincida con la cabecera. El canal lo aceptó porque «ya estaba en rojo antes», pero DEV quedó un minuto con la suite rota por mí. En EQ-10, además, una escritura en paralelo (sonda y su RUN) dio 409 y el RUN corrió la sonda vieja.

## Regla

1. Si un módulo sube de versión y esa versión está fijada en tests o en modules.json, el módulo, sus tests y modules.json van en **un solo parche** (el canal acepta replace de anclas en los tres). Antes de escribir, buscar la versión en tests/.
2. Un test nuevo que todavía no corrió nunca entra directo a la suite: primero se ensaya como sonda (\*.smoke.cjs) en un RUN y, verde, se publica con el mismo contenido (mismo blob).
3. Escrituras a la misma rama, una por vez; el RUN se escribe después de que la sonda quedó publicada.

Con eso, PATCH-360 (Editor) y PATCH-362 (traitview) entraron verdes, y tests/bld-eq10.test.cjs se publicó con el blob ensayado en RUN-287 (5482ab8).
