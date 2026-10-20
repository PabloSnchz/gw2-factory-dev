# LES-021 — Los datos estáticos del producto envejecen en silencio

- Fecha de registro: 2026-10-20
- Origen: FACTORY-RESEARCH-001, ronda inicial de discovery

## Qué pasó

La primera ronda de discovery buscaba oportunidades nuevas. Los dos hallazgos de mayor valor fueron datos que la app ya mostraba mal:

- la rotación del PSNA (`assets/data/psna-schedule.json`) cubre una semana de marzo y tiene códigos que no coinciden con la wiki; la app lleva meses mostrando el día equivocado;
- las metas (`assets/meta-events.json`) no tienen nada de Janthir Wilds, casi nada de Visions of Eternity y una entrada mal etiquetada.

Ninguno de los dos produce un error en consola ni rompe un test: la app funciona y muestra datos falsos.

## Lección

- En una app que vive de datos del juego, **la fuente más rentable de discovery es el propio repositorio** comparado con fuentes vivas (wiki, notas de actualización).
- Un dato estático con fecha necesita **fecha de vencimiento** y un aviso visible cuando se pasa, en lugar de repetir el último valor conocido.
- Las expansiones y los parches son disparadores: cada actualización grande del juego vuelve sospechosos los datos estáticos relacionados.

## Cómo aplicar

- Cada ronda de discovery empieza por la familia "Producto": tomar un archivo de datos y compararlo con su fuente (DEC-015).
- Al corregir un archivo de datos, agregar un test que falle si la fecha de los datos quedó vieja o si un código está repetido.
