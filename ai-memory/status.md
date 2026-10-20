# STATUS

Estado: EN_CURSO
Tarea actual: BL-002 — FACTORY-LIVE-001 · L1: DEV sin Analytics (GA4 solo en el host de producción + guard de repo en el workflow GA4)
Motivo: Pablo validó FACTORY-001B el 2026-10-20 y activó la autonomía continua acotada (DEC-014). Primera misión autónoma: tomar la tarea de mayor valor del backlog que no requiera decisión humana. BL-002 es la de mayor prioridad en READY, ya decidida (DEC-006), y corta un daño activo: las visitas de DEV llegan al GA4 de producción (RSK-003).
Fase: F0 — Fundación
Etapa actual: ARCHITECTURE
Inicio: 2026-10-20T05:45Z
Última actualización: 2026-10-20T05:45Z
Próxima acción: Implementar el cargador de GA condicionado al host en `index.html`, el guard de repo en `github-metrics-to-ga4.yml` y un test que lo verifique; registrar FEAT-002.

## Plan de micro-ciclos (FACTORY-LIVE-001)

Modo: autonomía continua acotada (DEC-014). Los ciclos se encadenan sin aprobación; la Factory se detiene ante una decisión humana, un riesgo CRÍTICO, producción, una dependencia externa, un cambio arquitectónico mayor o un bloqueo operativo.

- L1 — BL-002 DEV sin Analytics: cargador de GA por host, guard de repo en el workflow GA4, test y workflow de CI de la app. EN CURSO.
- L2 — BL-006 Validación automática en gw2-factory-dev: `node --check` de `js/*.js`, UTF-8 y archivos obligatorios de `ai-memory/`.
- L3 — Limpiezas sin cambio de comportamiento: BL-005 (script incluido dos veces) y BOM de `js/analytics.js` (parte de BL-013).
- L4 — Cierre de la misión: informe, memoria y estado.

## Esperando a Pablo

- [BL-016] Mirar el panel en un navegador real, también en el celular (RSK-015 sigue abierto hasta entonces).
- [REQ-002] Publicar la versión de prueba en Vercel y apagar GitHub Pages en DEV (se responde desde el panel).
- [REQ-001] Proteger la rama principal de producción (el panel lo detecta solo cuando esté hecho).

## Bloqueos

- Ninguno.
