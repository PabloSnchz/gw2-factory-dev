# LES-030 — Nunca publicar un archivo con contenido provisorio

- Fecha de registro: 2026-10-23
- Origen: BL-061, SBR-5

## Qué pasó

Para publicar dos tests en un solo commit armé la lista de archivos y dejé uno con un texto provisorio («PLACEHOLDER»), con la idea de completarlo después. La herramienta publica exactamente lo que recibe: `tests/sidebar-nav.test.cjs` quedó con esa palabra en `main` (`dbf621c`). Lo detecté al leer la respuesta y lo reemplacé por el contenido real dos minutos y medio después (`81f4439`, blob idéntico al local). En ese rato CI estuvo en rojo y DEV no cambió: el código ya estaba publicado y el test no se sirve.

## Lección

Una publicación no tiene borradores: lo que va en la lista de archivos es lo que queda en `main`. Un texto provisorio no es un paso intermedio, es un archivo roto publicado.

## Cómo aplicar

- Cada archivo de una publicación va con su contenido final, verificado en local. Si no lo tengo listo, ese archivo no va en esa publicación.
- Si dos archivos no entran juntos, se publican en dos commits seguidos, cada uno completo (LES-017, LES-025).
- Después de cada publicación comparo el blob de cada archivo con el local, como siempre. Fue lo que mostró el error enseguida.
