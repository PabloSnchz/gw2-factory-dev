# LES-012 — Sin checkpoint persistido por micro-ciclo, una interrupción borra el trabajo

- Fecha de registro: 2026-10-20
- Origen: FACTORY-RECOVERY-001 (interrupción durante FACTORY-001B)

## Qué pasó

FACTORY-001B se ejecutó durante aproximadamente una hora (desde ~2026-10-20T01:00Z) como una única corrida: investigación, diseño del GDS, tokens, componentes y reescritura del panel en un entorno temporal. No se registró la misión en `status.md` ni se hizo ningún commit. Una interrupción de plataforma terminó la sesión y, al recuperar desde el repositorio, el estado oficial seguía siendo el de FACTORY-001 (2026-10-20T00:38Z): todo el trabajo de FACTORY-001B era inexistente.

La recuperación también encontró que la memoria no reflejaba la realidad medida: GitHub Pages se había activado en gw2-factory-dev y en gw2-factory-dashboard, y el sistema multiagente histórico seguía generando commits automáticos.

## Lección

- Un trabajo que no está en el repositorio no existe. Los borradores en un entorno temporal no son fuente de verdad y no sobreviven a una interrupción.
- La regla de micro-ciclos no es burocracia: es lo que limita la pérdida máxima a un ciclo.
- Al recuperar, la memoria declarada se contrasta contra lo medido (repos, Pages, commits recientes), no solo se relee.

## Cómo aplicar

- Antes de cada micro-ciclo: checkpoint en `status.md` (commit).
- Al terminar cada micro-ciclo: commit del resultado + `status.md` y `backlog.md` actualizados.
- Ningún micro-ciclo debe superar ~30 minutos sin push.
- En cada recuperación: leer `status.md`, `backlog.md`, `memory-index.md`, `roadmap.md`, `risks.md`, revisar commits recientes de todos los repos del ecosistema y registrar las diferencias encontradas.
