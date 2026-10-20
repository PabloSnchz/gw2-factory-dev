# STATUS

Estado: EN_CURSO
Tarea actual: FACTORY-GOVERNANCE-001 — análisis y propuesta de gobernanza (taxonomía de pendientes, política y visibilidad de Discovery). Sin implementar, por pedido de Pablo
Motivo: Pablo pidió refinar la clasificación de pendientes, la autonomía de Discovery y su visibilidad. Antes llegó RESP-004 (REQ-004 aprobada, opción B con reglas propias), que se procesa primero (DEC-011). BL-036 queda en pausa con SD-3 pendiente.
Fase: F1 — Visibilidad
Etapa actual: PRODUCT
Inicio: 2026-10-20T16:53Z
Última actualización: 2026-10-20T16:55Z
Próxima acción: G-1 — procesar RESP-004 (REQ-004 cerrada, DEC-015 §5 reemplazado por las reglas de Pablo). G-2 — escribir la propuesta en `missions/FACTORY-GOVERNANCE-001-propuesta.md` y esperar la validación de Pablo. Pendiente después: SD-3 de BL-036 y BL-013.

## Plan de micro-ciclos (FACTORY-GOVERNANCE-001)

- G-1 — Procesar RESP-004 (REQ-004 aprobada, opción B con reglas de Pablo). EN CURSO.
- G-2 — Análisis y propuesta: taxonomía de pendientes, política de Discovery, visibilidad de Discovery, DEC y LES propuestas. Sin implementar.

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
