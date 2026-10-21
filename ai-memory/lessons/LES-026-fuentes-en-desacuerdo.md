# LES-026 — Una fuente de referencia puede estar desfasada: se contrasta y se mide lo publicado

- Fecha de registro: 2026-10-21
- Origen: BL-013 (PSNA del día equivocado)

## Qué pasó

1. **La wiki contra sí misma.** Para el PSNA, la página principal de la wiki mostraba las fechas corridas un día respecto de la plantilla de la propia wiki (copias de octubre y enero), de doncpauli.com y de dos implementaciones abiertas. Un test armado solo con esa página habría fijado el día equivocado como correcto. Se detectó porque el test se escribió primero contra la página y después se contrastó con las otras 5 fuentes, que coincidían entre sí.
2. **Lo publicado no es lo enviado.** Al publicar `js/activities.js`, la herramienta agregó un salto de línea final que el original no tenía (1 byte). El SHA no coincidió, se bajó el archivo publicado, se encontró la diferencia y se revalidó el archivo real con todos los tests.

## Lección

- Un dato de referencia (horario, rotación, código) se toma de al menos 3 fuentes independientes. Si no coinciden, manda la mayoría y la discrepancia queda escrita en el archivo de datos.
- Las páginas con caché (wikis, sitios de comunidad) pueden mostrar un estado viejo sin decirlo.
- Lo que se valida es lo publicado, no la copia local: si el SHA no coincide, se baja, se compara y se vuelve a probar antes de seguir.

## Cómo aplicar

- Antes de fijar un dato externo en un test, anotar las fuentes y comprobar que coinciden.
- Los archivos de código terminan con salto de línea final, así lo enviado y lo publicado son iguales.
