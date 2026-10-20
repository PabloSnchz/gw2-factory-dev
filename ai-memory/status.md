# STATUS

Estado: EN_CURSO
Tarea actual: FACTORY-RESEARCH-001 — Discovery Engine · R1: investigación de fuentes y análisis del producto
Motivo: Pablo encargó un sistema permanente de descubrimiento continuo, integrado en la Factory y sin un agente nuevo, para que el trabajo valioso no dependa de que alguien llene el backlog. Debe tener límites de carga para no repetir el PRE_BACKLOG histórico.
Fase: F2 — Calidad
Etapa actual: PRODUCT
Inicio: 2026-10-20T07:52Z
Última actualización: 2026-10-20T07:52Z
Próxima acción: Clasificar las fuentes (comunidad, herramientas similares, producto) y registrar las primeras oportunidades reales. Después R2: decisiones, `discovery.md`, `discovery-archive.md` y depuración del backlog según los límites.

## Plan de micro-ciclos (FACTORY-RESEARCH-001)

- R1 — Investigación: fuentes externas y memoria del producto; primeras oportunidades. EN CURSO.
- R2 — Gobernanza: DEC del mecanismo, de límites y promoción y de gobierno del backlog; `discovery.md` y `discovery-archive.md`; backlog dentro de los límites.
- R3 — Control automático: el test de memoria verifica los límites (READY ≤ 5, oportunidades abiertas ≤ 15, formato, motivo de archivo).
- R4 — Cierre: lecciones, riesgos, informe y estado.

## Esperando a Pablo

- [FEAT-002] Evaluar DEV sin Analytics: en DEV no debe haber peticiones a Google Analytics y `window.__gaEnabled` vale `false`.
- [RSK-016] Confirmar en GitHub Actions que `app-checks` está en verde (la Factory no puede ver CI).
- [BL-016] Mirar el panel en un navegador real, también en el celular (RSK-015 sigue abierto hasta entonces).
- [REQ-002] Publicar la versión de prueba en Vercel y apagar GitHub Pages en DEV (se responde desde el panel).
- [REQ-001] Proteger la rama principal de producción (el panel lo detecta solo cuando esté hecho).

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
