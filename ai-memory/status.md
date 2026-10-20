# STATUS

Estado: EN_CURSO
Tarea actual: BL-036 — FACTORY-DASHBOARD-REFINEMENT-001 · Recuperación de SD-2 y procesamiento de RESP-003
Motivo: Una interrupción de plataforma cortó SD-2 a las ~14:50. Reconstruido desde el repositorio: el último checkpoint es `49bb894`/`f67b539`; del panel no se publicó nada desde `cfdd1fa`. Quedó un borrador local de 4 archivos sin publicar que se revisa antes de usarlo. Mientras tanto llegó RESP-003 (Pablo: Vercel hecho), que se procesa primero (DEC-011).
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-20T14:40Z
Última actualización: 2026-10-20T15:40Z
Próxima acción: SD-R — procesar RESP-003 (REQ-002 cerrado, BL-003 y BL-011 a DONE, RSK-002 mitigado, F0 cumplida). Después retomar SD-2 desde el borrador revisado: ajustar los 4 tests que cambian por diseño, agregar tests de la regla y publicar el panel en commits compatibles.

## Plan de micro-ciclos (FACTORY-DASHBOARD-REFINEMENT-001)

- SD-1 — Producto y arquitectura: relevar los pendientes, clasificarlos y definir la regla. HECHO 2026-10-20.
- SD-R — Recuperación: estado reconstruido desde el repositorio; procesar RESP-003. EN CURSO.
- SD-2 — Panel: clasificación en el modelo, pedidos de decisión con justificación obligatoria, Hoy rediseñado, riesgo aceptado como información; tests y contrato de datos v4. Borrador local sin publicar (70/74 tests; los 4 que fallan reflejan el cambio buscado). PENDIENTE de revisión y publicación.
- SD-3 — Memoria: status.md con pendientes clasificados, pedidos revisados con la regla nueva, decisión de soberanía registrada, chequeo en CI, documentación y cierre.

## Esperando a Pablo

- [REQ-004] Elegir cuándo puede investigar sola la Factory (se responde desde el panel). Hasta entonces, sin rondas autónomas de discovery.
- [FEAT-002] Evaluar DEV sin Analytics: en DEV no debe haber peticiones a Google Analytics y `window.__gaEnabled` vale `false`.
- [RSK-016] Confirmar en GitHub Actions que `app-checks` está en verde (la Factory no puede ver CI).
- [BL-016] Mirar el panel en un navegador real, también en el celular (RSK-015 sigue abierto hasta entonces).
- [RSK-001] Revisión acordada el 2026-11-20: protección de `main` de producción con una propuesta más acotada (RESP-002).

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
