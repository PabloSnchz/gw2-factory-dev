# STATUS

Estado: EN_CURSO
Tarea actual: BL-036 — FACTORY-DASHBOARD-REFINEMENT-001 · SD-2 hecho; sigue SD-3 (cierre)
Motivo: El panel 2.1.0 ya aplica la soberanía de decisiones (DEC-018). A Pablo le llega 1 decisión (REQ-004, con su justificación) y 2 validaciones; lo demás es información. Recuperado tras una interrupción de plataforma (LES-022); RESP-003 procesada: DEV en Vercel.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-20T14:40Z
Última actualización: 2026-10-20T16:05Z
Próxima acción: SD-3 — que `tests/ai-memory.test.cjs` de gw2-factory-dev falle si un pedido de decisión abierto no tiene "Por qué te lo pregunto" o si una línea de "Esperando a Pablo" no tiene clase; informe de misión y BL-036 a DONE. Después, autonomía continua: BL-013 (PSNA).

## Plan de micro-ciclos (FACTORY-DASHBOARD-REFINEMENT-001)

- SD-1 — Producto y arquitectura: relevar los pendientes, clasificarlos y definir la regla. HECHO 2026-10-20.
- SD-R — Recuperación: estado reconstruido desde el repositorio; RESP-003 procesada (REQ-002 cerrado, BL-003 y BL-011 hechos, RSK-002 mitigado, F0 cumplida). HECHO 2026-10-20.
- SD-2 — Panel: clasificación en el modelo, pedidos de decisión con justificación obligatoria, Hoy rediseñado, riesgo aceptado como información; tests y contrato de datos v4. Panel 2.1.0 publicado en 9 commits verificados por SHA (`1f59031`…`ff077b8`): 82 tests, 9/9 mutaciones, 110 páginas simuladas sin problemas. La revisión encontró 3 problemas y los corrigió antes de publicar; además, la tarjeta de producción en Entornos dejó de mostrar como crítico un riesgo aceptado. HECHO 2026-10-20.
- SD-3 — Cierre: chequeo en CI de la memoria (pedido de decisión sin "Por qué te lo pregunto" o línea sin clase) e informe. Ya adelantado: DEC-018, LES-022, REQ-004 y status.md clasificados. SIGUIENTE.

## Esperando a Pablo

- [REQ-004] Decisión: Elegir cuándo puede investigar sola la Factory (se responde desde el panel). Hasta entonces, sin rondas autónomas de discovery.
- [FEAT-002] Validación: Abrí DEV en https://gw2-factory-dev.vercel.app/ y confirmá que no carga Google Analytics (en la consola, `window.__gaEnabled` vale `false`).
- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).

## Para tu información

- [RSK-016] La Factory no puede ver el resultado de CI. No hace falta que lo revises: si alguna vez ves `app-checks` en rojo en GitHub Actions, avisá.

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
