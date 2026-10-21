# LES-025 — El tamaño de un micro-ciclo se decide antes de comenzar

- Fecha de registro: 2026-10-21
- Origen: GV-1 (FACTORY-GOVERNANCE-002) y FACTORY-GOVERNANCE-003

## Qué pasó

GV-1 se preparó entero en local (14 archivos, 7 objetivos, 74 KB) y se publicó al final, en ráfaga. Una interrupción lo cortó con 6 publicados: REQ-005 quedó abierta en el panel aunque Pablo ya la había aprobado, y dos entradas citaban una respuesta sin publicar. No era la primera vez: MC-5, FACTORY-RESEARCH-001 y SD-2 también habían superado el tamaño previsto.

La regla de tamaño existía, pero decía "al menos una" condición y nada la verificaba.

## Lección

- Un límite de tamaño que nadie verifica se pierde en cuanto el trabajo parece claro.
- Preparar todo y publicar al final convierte cualquier interrupción en un repositorio a medias.
- Dividir es barato antes de empezar y caro durante la publicación.

## Cómo aplicar

- Antes de tocar un archivo, escribir el manifiesto en `status.md` (objetivo y archivos) y comprobar todos los límites de DEC-021.
- Si el objetivo necesita "y", o hay más de 3 archivos, dividir en ese momento.
- Publicar cada micro-ciclo en cuanto está listo, con escrituras en serie.
