# STATUS

Estado: EN_CURSO
Tarea actual: BL-035 — FACTORY-RESEARCH-001 · R2 y R3: publicar gobernanza y control automático de discovery
Motivo: La investigación (R1) terminó con la ronda inicial: 8 oportunidades, 2 de ellas promovidas (PSNA en BL-013, metas en BL-034). R2 deja escritas las reglas (DEC-015, DEC-016, DEC-017) y el backlog dentro del límite. R3 hace que CI verifique los límites. Antes se procesó RESP-002: Pablo rechazó REQ-001 y el riesgo queda aceptado hasta el 2026-11-20.
Fase: F2 — Calidad
Etapa actual: REVIEW
Inicio: 2026-10-20T07:52Z
Última actualización: 2026-10-20T08:20Z
Próxima acción: Publicar la memoria en orden de dependencias y, al final, `tests/ai-memory.test.cjs` (13/13 en local, 8/8 mutaciones detectadas). Después R4: informe y cierre.

## Plan de micro-ciclos (FACTORY-RESEARCH-001)

- R1 — Investigación: fuentes externas y memoria del producto; ronda inicial de discovery. HECHO 2026-10-20.
- R2 — Gobernanza: DEC-015, DEC-016, DEC-017; `discovery.md` y `discovery-archive.md`; backlog dentro de los límites (READY 8 → 4); REQ-004. EN CURSO.
- R3 — Control automático: el test de memoria verifica READY ≤ 5, abiertas ≤ 15, formato y salida con motivo. EN CURSO.
- R4 — Cierre: lecciones, riesgos, informe y estado.

## Esperando a Pablo

- [REQ-004] Elegir cuándo puede investigar sola la Factory (se responde desde el panel).
- [FEAT-002] Evaluar DEV sin Analytics: en DEV no debe haber peticiones a Google Analytics y `window.__gaEnabled` vale `false`.
- [RSK-016] Confirmar en GitHub Actions que `app-checks` está en verde (la Factory no puede ver CI).
- [BL-016] Mirar el panel en un navegador real, también en el celular (RSK-015 sigue abierto hasta entonces).
- [REQ-002] Publicar la versión de prueba en Vercel y apagar GitHub Pages en DEV (se responde desde el panel).

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
