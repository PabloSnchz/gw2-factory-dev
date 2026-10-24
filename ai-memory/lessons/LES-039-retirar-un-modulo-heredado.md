# LES-039 — Retirar un módulo heredado: primero se mapea quién lo lee, después se suelta, al final se borra

- Fecha de registro: 2026-10-24
- Origen: BL-070 RAI-5 (retiro de `js/strike-tracker.js`, PATCH-054 a PATCH-062, RUN-036 a RUN-038)

## Qué pasó

`js/strike-tracker.js` (57 KB) ya no tenía uso: el juego unificó strikes y raids el 2026-02-03 y Raids los muestra en la pestaña Encuentros. Borrarlo parecía un cambio de una línea, pero una sonda en CI (RUN-036) encontró 149 menciones: el router, `index.html`, el marco común, el presupuesto de tamaño y 10 tests heredados que leen su código fuente.

Lo hice en cuatro pasos, cada uno con la suite completa:

1. El nombre «Raids» en la navegación (PATCH-054).
2. Dejar de cargarlo: `index.html` y `router.js` 2.18.1 (PATCH-057). PATCH-056 fue rechazado porque `hb133` exigía el script viejo.
3. Soltar sus dependencias con el archivo todavía presente: el panel, `gn-frame.js` 1.0.1 y los tests que lo leían (PATCH-060). PATCH-059 fue rechazado porque mi comentario nuevo nombraba el archivo y un test lo prohíbe.
4. Borrar el archivo y los tres tests que solo probaban el selector Raids|Strikes (hb101, hb125, hb136), y ajustar el presupuesto (PATCH-061) y el censo del latch, que pedía 4 módulos y quedan 3 (PATCH-062, medido en RUN-038).

El canal de parches no borra archivos: el borrado se hace con un commit aparte y deja la suite en rojo unos segundos, hasta el parche que lo sigue.

## Lección

1. Antes de retirar un archivo, una sonda en CI que liste todas sus menciones. La lista manda el orden.
2. Primero se suelta todo lo que depende del archivo con el archivo presente y la suite en verde; el borrado va al final y solo con lo que no puede ir antes (el presupuesto de tamaño, los conteos).
3. Un test que solo prueba lo que se retira se borra con el código; uno que prueba algo más se reduce, no se borra.
4. Los comentarios nuevos también cuentan: los tests que prohíben nombrar un archivo leen comentarios.

## Cómo aplicar

- Sonda de menciones → parche «soltar» (suite verde) → borrado → parche de cierre con la suite completa (LES-035).
- No tocar `tools/legacy/`: dispara la reimportación de los tests del legado. `tools/legacy/importar.txt` sigue nombrando hb101, hb125 y hb136 como historia de la migración.
