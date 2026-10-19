# BACKLOG

Formato: `- [ID] [PRIORIDAD] Título — contexto · referencia`
Prioridades: CRÍTICO · ALTO · MEDIO · BAJO

## READY

- [BL-004] [MEDIO] Sincronizar documentación de producto con el código real — `docs/BRIEFING.md` y `docs/DESARROLLADORES.md` describen v6.6.2 (ej. `api-gw2.js` v2.15.0) pero `index.html` carga `api-gw2.js?v=2.33.0`; la Armería Legendaria no figura en `CHANGELOG.md`. · LES-003, DEC-003
- [BL-005] [BAJO] `js/characters-theme.js?v=1.0.1` se incluye dos veces en `index.html` (una con `defer`, otra sin). · FEAT-000
- [BL-006] [MEDIO] Validación automática mínima en PRs: `node --check` sobre `js/*.js` y chequeo de UTF-8 + archivos obligatorios en `ai-memory/`. · LES-008
- [BL-007] [BAJO] Dependencias CDN sin Subresource Integrity: `crypto-js@4.2.0` (jsdelivr) y `xlsx-0.20.2` (sheetjs). · FEAT-000
- [BL-008] [BAJO] Varios commits heredados usan el email placeholder "TU EMAIL DE LA CUENTA PRINCIPAL"; configurar `git user.email` en los entornos de agentes.
- [BL-009] [MEDIO] FEAT-001 — Vista "Salud del Ecosistema" en gw2-agents-dashboard (estado general, problemas críticos, riesgos, últimas decisiones). Requiere BL-001. · roadmap F1

## IN_PROGRESS

## BLOCKED

- [BL-001] [ALTO] Definir el rol futuro de `gw2-wallet-agents` y reapuntar `gw2-agents-dashboard` (hoy lee los .md de gw2-wallet-agents). · DEC-001 — Bloqueado: decisión de Pablo.
- [BL-002] [MEDIO] `.github/workflows/github-metrics-to-ga4.yml` corre a diario (00:00 UTC) también en DEV: falla si faltan los secrets o mezcla métricas de DEV con las de producción. · DEC-001 — Bloqueado: decisión de Pablo.
- [BL-003] [MEDIO] Publicar DEV en GitHub Pages para evaluación humana. Riesgo asociado: `index.html` usa el GA4 de producción (`G-LB782QT9TR`), por lo que las visitas a DEV contaminarían métricas. · DEC-001 — Bloqueado: decisión de Pablo.

## DONE

- [BL-000] [ALTO] Inicializar la memoria fundacional de la Factory (estructura, roadmap, DEC-001..004, LES-001..008, FEAT-000, corrección de codificación). — 2026-10-19
