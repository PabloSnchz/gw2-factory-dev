# LES-015 — Un cambio y sus tests van en el mismo commit

- Fecha de registro: 2026-10-20
- Origen: FACTORY-001B MC-2 y MC-3

## Qué pasó

Dos veces seguidas un push al panel dejó un commit intermedio inconsistente:

- MC-2: `3984bb1` publicó `tests/gds.test.mjs` sin `gds/GDS_FOUNDATION.md`, que el test lee. Se corrigió con `05392ab`.
- MC-3: `b8e0e08` publicó `js/decisions.js` y sus tests sin `js/model.js` ni `js/views.js`, que los tests usan. Se corrigió con `e2275b1`.

En ambos casos `main` quedó bien al final, pero el CI de esos commits intermedios falla y cualquiera que los use como base hereda un estado roto.

## Lección

- Al publicar archivo por archivo (sin git local), el riesgo no es el código: es olvidar un archivo del conjunto.
- La lista de archivos de un commit se arma desde lo que cambió, no de memoria.

## Cómo aplicar

- Antes de cada push: listar los archivos modificados o nuevos de la copia de trabajo (comparando SHA con el remoto) y publicar exactamente ese conjunto en un solo commit.
- Después del push: verificar los SHA de **todos** los archivos del conjunto, no solo de los que se acaban de publicar.
