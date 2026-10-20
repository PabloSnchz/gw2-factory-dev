# STATUS

Estado: EN_CURSO
Tarea actual: BL-036 — FACTORY-DASHBOARD-REFINEMENT-001 · SD-2: panel con soberanía de decisiones (retomado tras la recuperación)
Motivo: Una interrupción de plataforma cortó SD-2 a las ~14:50. Reconstruido desde el repositorio: el último checkpoint es `49bb894`/`f67b539`; del panel no se publicó nada desde `cfdd1fa`. Quedó un borrador local de 4 archivos sin publicar que se revisa antes de usarlo. Mientras tanto llegó RESP-003 (Pablo: Vercel hecho), que se procesa primero (DEC-011).
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-20T14:40Z
Última actualización: 2026-10-20T15:50Z
Próxima acción: SD-2 — publicar el panel en orden de dependencias (parse → decisions → model → views → tests → documentación) y verificar por SHA. Borrador revisado: 82/82 tests, 9/9 mutaciones. La memoria ya está en contrato v4 (DEC-018, REQ-004 justificado, pendientes clasificados).

## Plan de micro-ciclos (FACTORY-DASHBOARD-REFINEMENT-001)

- SD-1 — Producto y arquitectura: relevar los pendientes, clasificarlos y definir la regla. HECHO 2026-10-20.
- SD-R — Recuperación: estado reconstruido desde el repositorio; RESP-003 procesada (REQ-002 cerrado, BL-003 y BL-011 hechos, RSK-002 mitigado, F0 cumplida). HECHO 2026-10-20.
- SD-2 — Panel: clasificación en el modelo, pedidos de decisión con justificación obligatoria, Hoy rediseñado, riesgo aceptado como información; tests y contrato de datos v4. Revisión: REQ-004 habría quedado oculto y DEC-018 no existía; se publica antes la memoria. Se cerró un hueco: una decisión sin pedido podía colarse como línea de status.md. EN CURSO.
- SD-3 — Cierre: chequeo en CI de la memoria (pedido de decisión sin "Por qué te lo pregunto" o línea sin clase), lección, documentación e informe. Ya adelantado en SD-2: DEC-018, REQ-004 y status.md clasificados.

## Esperando a Pablo

- [REQ-004] Decisión: Elegir cuándo puede investigar sola la Factory (se responde desde el panel). Hasta entonces, sin rondas autónomas de discovery.
- [FEAT-002] Validación: Abrí DEV en https://gw2-factory-dev.vercel.app/ y confirmá que no carga Google Analytics (en la consola, `window.__gaEnabled` vale `false`).
- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).

## Para tu información

- [RSK-016] La Factory no puede ver el resultado de CI. No hace falta que lo revises: si alguna vez ves `app-checks` en rojo en GitHub Actions, avisá.

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
