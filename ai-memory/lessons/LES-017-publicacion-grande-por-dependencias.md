# LES-017 — Una publicación grande se planifica por dependencias antes de empezar

- Fecha de registro: 2026-10-20
- Origen: FACTORY-001B MC-5

## Qué pasó

MC-5 cambió 14 archivos del panel (unos 150 KB). Sin git en el entorno, cada archivo se publica transcribiendo su contenido completo en una llamada a la API, y una llamada tiene un límite de tamaño.

- El primer push salió con 5 de los 14 archivos (`4018d5a`): `index.html`, `css/app.css`, `app.js`, `config.js` y `loader.js`.
- Durante unos 2 minutos el panel publicado combinó el `app.js` nuevo con el `views.js` viejo: rompía al calcular el título de la pestaña y mostraba la vista anterior sin estilos.
- El intento de publicar los 9 restantes juntos superó el límite y no se ejecutó.
- Se completó en 7 commits más. Uno de ellos (`e3bbc88`) anunciaba 4 archivos en el mensaje y llevaba 2.
- `main` quedó idéntico a lo validado (14 SHA verificados), pero el CI de los commits intermedios queda en rojo. Es la tercera vez que pasa (LES-015, RSK-012).

## Lección

- LES-015 ("un cambio y sus tests en un mismo commit") no alcanza cuando el cambio no entra en una sola llamada. El límite es físico y hay que planificarlo antes, no descubrirlo en el medio.
- El orden importa: publicar primero lo que consume (`app.js`, `index.html`) antes que lo que provee (`views.js`, GDS) rompe lo publicado. El orden seguro va de las dependencias a los consumidores.
- El mensaje de un commit se escribe después de decidir su contenido final, no antes.

## Cómo aplicar

- Antes de publicar: listar los archivos por SHA (LES-015) y estimar su tamaño. Si superan unos 40 KB, partir en commits ordenados de manera que cada uno deje el sitio funcionando:
  1. base: GDS, estilos y datos;
  2. lógica: modelo y loader;
  3. vistas;
  4. consumidores: `app.js` e `index.html`;
  5. los tests de cada parte, junto con esa parte.
- Si una parte no puede funcionar sin otra, publicar primero código compatible hacia atrás. Por ejemplo, las vistas toleran que falte `model.channel`: así quedó `views.js` y por eso el sitio se recuperó apenas se publicó.
- Después de cada commit intermedio: verificar SHA y declarar en el mensaje qué parte de la publicación es.
