# LES-032 — La suite roja era mía, no del legado

- Fecha de registro: 2026-10-23
- Origen: BL-066 (descubierta por el canal de parches, BL-065)

## Qué pasó

El canal de parches mostró que la suite de DEV estaba en rojo por `tests/idea61-claves-congeladas.test.js`, un test heredado de QwenPaw. Lo registré como «fallo heredado» y le dije a Pablo que los módulos renovados no eran la causa, **sin haberlo comprobado**: lo deduje porque los archivos que tenía a mano no leían claves crudas.

Al diagnosticarlo de verdad (RUN-001, la salida completa del test en CI), la falla era mía: `js/wallet-theme.js` (Cartera, CAR-1) tenía un respaldo que leía `gn:account:keys` directo del navegador, saltándose el espejo de Storage. El test heredado lo prohíbe con razón: es la clase de bug que vigila.

Y mientras tanto rompí dos reglas más de `tests/ai-memory.test.cjs` con mi propio `status.md` (una línea de «Esperando a Pablo» sin la forma «Decisión:» y un manifiesto de 4 archivos). Las 3 fallas eran mías.

## Lección

1. «No es mío» también es una afirmación que se verifica. Un test heredado que falla primero se lee completo; la etiqueta «heredado» describe al test, no al culpable.
2. Durante semanas publiqué sin ver CI (RSK-016) y la suite estaba roja sin que nadie lo supiera: verificar en local solo los tests que uno toca deja afuera los invariantes globales (como idea61, que barre todos los módulos) y las reglas de formato de la memoria.

## Cómo aplicar

- Antes de atribuir una falla, leer la aserción exacta (`factory/diagnose/RUN-NNN.json`).
- Antes de publicar `ai-memory/status.md` o el backlog, correr localmente las reglas de `tests/ai-memory.test.cjs` sobre el archivo nuevo.
- Antes de publicar un módulo que toca cuentas o claves, revisar contra `tools/audit-61-congeladas.mjs`: las claves espejo (`gn:account:*`, `gn:activities:*`) se leen y escriben solo por Storage.
- El canal de parches ya corre la suite completa antes y después: es la red que faltaba.
