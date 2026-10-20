# LES-011 — El dato medido no puede depender de una máquina local

- Fecha de registro: 2026-10-20
- Origen: análisis de gw2-agents-dashboard (DEC-008)

## Qué pasó

Los datos medidos del dashboard histórico los generaban scripts `_eco\*.py` ejecutados por el programador de tareas de Windows en la PC de Pablo. El 2026-10-09 dejaron de correr y el panel siguió mostrando, con apariencia de vigente, datos de 10 días atrás. Además, el histórico documentó (2026-10-04) que el CDN de `raw.githubusercontent.com` servía una versión vieja de un archivo pedido por rama durante más de 5 minutos.

## Lección

- Un panel cuyo dato depende de una máquina que puede apagarse se degrada en silencio. La medición tiene que ocurrir donde se mira (el navegador) o en infraestructura gestionada.
- Leer archivos por **SHA de commit** en lugar de por rama da un snapshot inmutable y consistente: todos los archivos corresponden al mismo instante y el CDN no puede servir una versión vieja.

## Cómo aplicar

- El Dashboard Factory mide en el navegador en cada lectura y fija la memoria al SHA del último commit (FEAT-001).
- Si alguna vez se necesita precálculo, hacerlo con GitHub Actions, nunca con scripts locales.

## Corrección (2026-10-20)

Durante FACTORY-RECOVERY-001 se midió que `gw2-agents-dashboard` recibe commits "chore(dashboard): pulso automatico" cada ~15 minutos (2026-10-20T01:34Z, 01:36Z, 01:51Z) y que `gw2-wallet-agents` registró un heartbeat a las 01:13Z. La afirmación "dejaron de correr el 2026-10-09" no se sostiene hoy: los scripts se reanudaron o el diagnóstico original fue incompleto. No se puede determinar cuál desde el repositorio.

La lección no cambia: el panel histórico estuvo días mostrando datos viejos con apariencia de vigentes, que es exactamente el modo de falla descrito. Lo que cambia es el hecho: el sistema histórico sigue activo y eso es un riesgo propio (RSK-008, BL-001).
