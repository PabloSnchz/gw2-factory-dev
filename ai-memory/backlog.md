# BACKLOG

Formato: `- [ID] [PRIORIDAD] Título — contexto · referencia`
Prioridades: CRÍTICO · ALTO · MEDIO · BAJO

## READY

- [BL-004] [MEDIO] Sincronizar documentación de producto con el código real — `docs/BRIEFING.md` y `docs/DESARROLLADORES.md` describen v6.6.2 (ej. `api-gw2.js` v2.15.0) pero `index.html` carga `api-gw2.js?v=2.33.0`; la Armería Legendaria no figura en `CHANGELOG.md`. · LES-003, DEC-003
- [BL-005] [BAJO] `js/characters-theme.js?v=1.0.1` se incluye dos veces en `index.html` (una con `defer`, otra sin). · FEAT-000
- [BL-006] [MEDIO] Validación automática mínima en PRs: `node --check` sobre `js/*.js` y chequeo de UTF-8 + archivos obligatorios en `ai-memory/`. · LES-008
- [BL-007] [BAJO] Dependencias CDN sin Subresource Integrity: `crypto-js@4.2.0` (jsdelivr) y `xlsx-0.20.2` (sheetjs). · FEAT-000
- [BL-008] [BAJO] Varios commits heredados usan el email placeholder "TU EMAIL DE LA CUENTA PRINCIPAL"; configurar `git user.email` en los entornos de agentes.
- [BL-013] [BAJO] `js/analytics.js` empieza con BOM (U+FEFF); `js/activities.js` usa como fallback de PSNA una URL raw de `gw2-wallet-ligero/main`. · DEC-005
- [BL-014] [BAJO] Dashboard: `getFeaturesUrl()` duplicado en `js/config.js`; README desactualizado (dice 7 archivos monitoreados). · DEC-007

## IN_PROGRESS

## BLOCKED

- [BL-001] [ALTO] Definir el rol futuro de `gw2-wallet-agents` y la fuente por defecto de `gw2-agents-dashboard`. · DEC-001, DEC-007 — Bloqueado: decisión de Pablo.
- [BL-002] [MEDIO] Desacoplar GA4 por entorno (frontend con allowlist de host + guard de repo en `github-metrics-to-ga4.yml`). · DEC-006 — Bloqueado: decisión de Pablo.
- [BL-003] [MEDIO] Publicar DEV con origen propio (propuesta: Vercel). · DEC-005 — Bloqueado: decisión de Pablo; depende de BL-002.
- [BL-009] [MEDIO] FEAT-001 — Extender la pestaña "Salud" existente del dashboard con un bloque "Factory" (estado general, problemas críticos, riesgos, últimas decisiones) leído de ai-memory. · DEC-007, LES-009 — Depende de BL-001.
- [BL-010] [ALTO] `main` de `gw2-wallet-ligero` (producción) figura sin protección de rama (`protected: false` en `data/git.json` del dashboard, 2026-10-09). Recomendación: activar branch protection. · Acción exclusiva de Pablo.
- [BL-011] [ALTO] DEV en GitHub Pages compartiría origen `pablosnchz.github.io` con PROD ⇒ mismo `localStorage` (API keys, cuentas, settings). Hoy ya ocurre con `gw2-wallet-agents` publicado. · DEC-005 — Se resuelve con la opción de hosting.
- [BL-012] [MEDIO] Datos del dashboard sin actualizar desde 2026-10-09 09:29 UTC (`salud.json`, `git.json`): los generadores locales `_eco\*.py` no están corriendo. · DEC-007 — Confirmar con Pablo si siguen vigentes.

## DONE

- [BL-000] [ALTO] Inicializar la memoria fundacional de la Factory (estructura, roadmap, DEC-001..004, LES-001..008, FEAT-000, corrección de codificación). — 2026-10-19
- [BL-015] [MEDIO] Proponer estrategias de entorno DEV: publicación (DEC-005), GA (DEC-006), dashboard (DEC-007). — 2026-10-19
