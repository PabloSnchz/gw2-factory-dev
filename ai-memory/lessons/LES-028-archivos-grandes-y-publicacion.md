# LES-028 — Un archivo que no entra en una publicación se cambia desde otro lugar

- Fecha de registro: 2026-10-21
- Origen: BL-034, MET-2

## Qué pasó

Para agregar una opción al filtro de expansión hacía falta tocar una línea de `index.html` (69 KB). La Factory publica reemplazando el archivo entero en una sola llamada, y una publicación de ese tamaño se cortó antes de ejecutarse. No había forma segura de partirla: un `index.html` a medias deja la app rota.

La solución fue mejor que el cambio original: `js/meta.js` completa el filtro con las expansiones que trae `meta-events.json`. La próxima expansión aparece sola en el filtro y `index.html` no se toca.

## Lección

- El tamaño de publicación es un límite físico de la Factory, igual que el de los micro-ciclos (LES-025): hay que verlo antes de elegir qué archivo cambiar.
- Cuando el dato ya vive en un archivo chico (el JSON, el módulo), conviene que la vista lo derive de ahí en lugar de repetirlo en el HTML.

## Cómo aplicar

- Antes de planificar un cambio en un archivo de más de 45 KB, buscar si se puede resolver en el módulo que lo usa o en los datos.
- Si no hay alternativa, el archivo grande va solo en su micro-ciclo y sin ningún otro archivo en la misma publicación (excepción de DEC-021).
- Las opciones de filtros, listas y etiquetas que dependen de datos se generan desde los datos.
