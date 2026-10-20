# LES-014 — Trabajar sobre la versión publicada, verificada por SHA

- Fecha de registro: 2026-10-20
- Origen: FACTORY-001B MC-3

## Qué pasó

La copia local del panel en el entorno de trabajo contenía borradores de la sesión interrumpida (vistas, modelo y loader reescritos para el Centro de Decisiones) que nunca se publicaron. Si MC-3 se hubiera construido encima, habría publicado cambios de interfaz no revisados y rotos respecto de los tests reales. Además, el entorno no podía descargar archivos de GitHub directamente (el proxy devolvió 403).

## Lección

- Antes de modificar un repositorio, comparar el SHA de cada archivo local con el publicado. Lo que no coincide no es base de trabajo.
- Si hay que reconstruir la base a mano, se valida igual por SHA: 5 archivos reconstruidos coincidieron byte a byte con `main` antes de tocar nada, y los 27 tests existentes pasaron sobre esa base.

## Cómo aplicar

- Al empezar un micro-ciclo que modifica código: listar los SHA remotos (API) y compararlos con la copia local (`git hash-object` o equivalente).
- Los borradores no publicados se tratan como referencia, nunca como base.
