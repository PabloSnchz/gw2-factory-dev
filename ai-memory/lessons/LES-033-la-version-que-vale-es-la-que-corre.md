# LES-033 — La versión que vale es la que corre, no la del comentario

- Fecha de registro: 2026-10-23
- Origen: BL-065, FP-5 (PATCH-013 rechazado por el canal)

## Qué pasó

Para poner al día los `?v=` de `index.html` (RSK-020) armé un inventario que lee la versión de cada archivo en su cabecera (`tools/index-versions.cjs`). Corrido en CI (OUT-002) dio 14 desfasados. Uno de ellos era `js/settings-manager.js`: `index.html` pedía 1.0.4 y la cabecera decía `v1.0.2`.

Lo traté como los otros y bajé el `?v` a 1.0.2 (PATCH-013). El canal lo rechazó sin tocar nada: `tests/idea50-boton-cache.test.js`, heredado, exige que el `?v` sea igual a la versión que el módulo anuncia al arrancar («Settings Manager v1.0.4 inicializado»). El archivo ya era 1.0.4 (lo dice su propio historial); lo único viejo era la primera línea de su cabecera. Mi inventario tenía razón en que algo no cuadraba y se equivocó en cuál de los dos lados era el viejo.

Lo corregí al revés (PATCH-014): la cabecera pasó a 1.0.4 y el `?v` quedó como estaba. Suite verde antes y después.

## Lección

1. Una cabecera de versión es un comentario: puede quedar vieja sin que nada falle. Ante una diferencia entre el `?v` y la cabecera, primero averiguar cuál de los dos refleja el código que corre (el log de arranque, el historial, un test), y corregir el que miente.
2. El canal de parches hizo exactamente lo que tenía que hacer: un error mío no llegó a `main`. Correr la suite completa antes de cada commit vale más que mi revisión local, que solo cubre los tests que toco.

## Cómo aplicar

- Desde FP-5, `tests/index-versions.test.cjs` exige que cada `?v` de `index.html` y de `js/modules.json` sea igual a la versión de la cabecera del archivo. Al subir la versión de un módulo, en el mismo cambio se sube su `?v` (por el canal, si el módulo lo carga `index.html`) o el módulo vive en `js/modules.json`.
- Cuando un archivo tenga la cabecera vieja, se arregla la cabecera, no el `?v`.
- Inventario en cualquier momento: `factory/diagnose/RUN-NNN.json` con `tests/index-versions.smoke.cjs`.
