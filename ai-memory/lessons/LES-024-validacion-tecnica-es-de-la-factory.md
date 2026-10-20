# LES-024 — Una validación que pide herramientas de desarrollador es técnica

- Fecha de registro: 2026-10-20
- Origen: FEAT-002 y FACTORY-GOVERNANCE-001

## Qué pasó

FEAT-002 (DEV sin Analytics) quedó "para evaluar" con una instrucción para Pablo: abrir la pestaña Red del navegador y escribir `window.__gaEnabled` en la consola.

Eso no es criterio de usuario: es una verificación técnica que la Factory ya había cubierto con 5 tests y 8 mutaciones. Pablo podía hacerla, pero no tenía por qué.

## Lección

- Si una verificación necesita herramientas de desarrollo (consola, network, DevTools, CI, Actions, tests, contrastes), le corresponde a la Factory. Se resuelve con un test, una medición o, si el entorno no lo permite, se registra como bloqueo de entorno.
- A Pablo se le pide solo lo que necesita su mirada de usuario: usar la app, entender una pantalla, decidir si algo le sirve.

## Cómo aplicar

- Al cerrar una funcionalidad, la sección "Cómo evaluarlo" separa:
  - "verificado por la Factory": lo técnico, con evidencia;
  - "para mirar": lo funcional, sin herramientas.
- Antes de agregar una línea de "Validación:" en `status.md`, revisar que no mencione consola, red, CI, tests ni herramientas de desarrollador.
