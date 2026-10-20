# STATUS

Estado: EN_CURSO
Tarea actual: BL-036 — FACTORY-DASHBOARD-REFINEMENT-001 · Soberanía de decisiones: a Pablo solo le llegan decisiones de producto, negocio o estrategia
Motivo: Pablo detectó que "Necesita tu decisión" le presenta cosas que no requieren su criterio. Medido el 2026-10-20 sobre la memoria real: 6 ítems en esa sección; solo 1 es un pedido de decisión, y trata de un proceso interno de la Factory. Los demás son 1 acción manual, 2 validaciones y 2 avisos informativos.
Fase: F1 — Visibilidad
Etapa actual: ARCHITECTURE
Inicio: 2026-10-20T14:40Z
Última actualización: 2026-10-20T14:55Z
Próxima acción: SD-2 — en el panel, clasificar lo pendiente en decisión, acción, validación e información; exigir contexto, impacto, recomendación y justificación a todo pedido de decisión; rediseñar Hoy. Publicar compatible con la memoria actual.

## Plan de micro-ciclos (FACTORY-DASHBOARD-REFINEMENT-001)

- SD-1 — Producto y arquitectura: relevar los pendientes, clasificarlos y definir la regla. HECHO 2026-10-20.
- SD-2 — Panel: clasificación en el modelo, pedidos de decisión con justificación obligatoria, Hoy rediseñado, riesgo aceptado como información; tests y contrato de datos v4. EN CURSO.
- SD-3 — Memoria: status.md con pendientes clasificados, pedidos revisados con la regla nueva, DEC-018, chequeo en CI, documentación y cierre.

## Esperando a Pablo

- [REQ-004] Elegir cuándo puede investigar sola la Factory (se responde desde el panel). Hasta entonces, sin rondas autónomas de discovery.
- [FEAT-002] Evaluar DEV sin Analytics: en DEV no debe haber peticiones a Google Analytics y `window.__gaEnabled` vale `false`.
- [RSK-016] Confirmar en GitHub Actions que `app-checks` está en verde (la Factory no puede ver CI).
- [BL-016] Mirar el panel en un navegador real, también en el celular (RSK-015 sigue abierto hasta entonces).
- [REQ-002] Publicar la versión de prueba en Vercel y apagar GitHub Pages en DEV (se responde desde el panel).
- [RSK-001] Revisión acordada el 2026-11-20: protección de `main` de producción con una propuesta más acotada (RESP-002).

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
