# BACKLOG

Formato: `- [ID] [PRIORIDAD] Título — contexto · referencia` (ver DEC-009)
Prioridades: CRÍTICO · ALTO · MEDIO · BAJO

## READY

- [BL-021] [ALTO] Centro de Decisiones — que Pablo pueda aprobar, rechazar o posponer desde el panel y que cada respuesta quede como archivo en ai-memory; micro-ciclos MC-3 a MC-6 de FACTORY-001B. · FEAT-001, LES-012, DEC-010
- [BL-002] [ALTO] DEV sin Analytics — cargar GA4 solo en el host de producción (allowlist en runtime) + guard de repo en `github-metrics-to-ga4.yml`. Decidido por Pablo (DEC-006, 2026-10-20). Cambio de código de la app: se ejecuta con ciclo completo después de FACTORY-001B (Dashboard First). · DEC-006, RSK-003
- [BL-004] [MEDIO] Sincronizar documentación de producto con el código real — `docs/BRIEFING.md` y `docs/DESARROLLADORES.md` describen v6.6.2 (ej. `api-gw2.js` v2.15.0) pero `index.html` carga `api-gw2.js?v=2.33.0`; la Armería Legendaria no figura en `CHANGELOG.md`. · LES-003, DEC-003
- [BL-005] [BAJO] `js/characters-theme.js?v=1.0.1` se incluye dos veces en `index.html` (una con `defer`, otra sin). · FEAT-000
- [BL-006] [MEDIO] Validación automática mínima en PRs de gw2-factory-dev — `node --check` sobre `js/*.js` y chequeo de UTF-8 + archivos obligatorios en `ai-memory/`. · LES-008
- [BL-007] [BAJO] Dependencias CDN sin Subresource Integrity — `crypto-js@4.2.0` (jsdelivr) y `xlsx-0.20.2` (sheetjs). · FEAT-000
- [BL-008] [BAJO] Email placeholder en commits heredados — varios usan "TU EMAIL DE LA CUENTA PRINCIPAL"; configurar `git user.email` en los entornos de agentes.
- [BL-013] [BAJO] Detalles heredados en la app — `js/analytics.js` empieza con BOM (U+FEFF); `js/activities.js` usa como fallback de PSNA una URL raw de `gw2-wallet-ligero/main`. · DEC-005
- [BL-017] [BAJO] Rama duplicada `chore/init-ai-memory` en gw2-factory-dev — mismo contenido que `main` @ b9599d2; la Factory no tiene herramienta para borrar ramas.

## IN_PROGRESS

- [BL-020] [ALTO] FACTORY-001B — Gato Design System y Centro de Decisiones; MC-1 y MC-2 hechos (2026-10-20: registro, fundamentos del GDS en gw2-factory-dashboard/gds); siguiente MC-3 tras validación de Pablo. · LES-012, DEC-010, BL-021

## BLOCKED

- [BL-003] [ALTO] Publicar DEV en Vercel — decidido por Pablo (DEC-005 opción B, 2026-10-20). Falta que Pablo cree el proyecto en su cuenta de Vercel (repo gw2-factory-dev, rama `main`, raíz, sin build) y, con Vercel activo, apague GitHub Pages en gw2-factory-dev. · DEC-005, RSK-002 — Bloqueado: acción de Pablo.
- [BL-011] [ALTO] Origen compartido DEV/PROD — ocurre hoy (GitHub Pages activo en gw2-factory-dev). Se cierra cuando BL-003 esté hecho y Pages apagado en DEV. Mientras tanto: usar DEV solo en incógnito. · RSK-002, DEC-005 — Depende de BL-003.
- [BL-016] [ALTO] FEAT-001 Dashboard Factory: validación — GitHub Pages ya está activo en gw2-factory-dashboard (medido 2026-10-20); falta que Pablo valide el criterio de 60 segundos, idealmente sobre la versión con GDS (BL-020). · FEAT-001, DEC-008 — Bloqueado: validación de Pablo.
- [BL-010] [ALTO] Proteger `main` de producción — `gw2-wallet-ligero` sin branch protection (medido en vivo por el dashboard). · RSK-001 — Acción exclusiva de Pablo.

## DONE

- [BL-000] [ALTO] Inicializar la memoria fundacional de la Factory — estructura, roadmap, DEC-001..004, LES-001..008, FEAT-000, corrección de codificación. — 2026-10-19
- [BL-015] [MEDIO] Proponer estrategias de entorno DEV — publicación (DEC-005), GA (DEC-006), dashboard (DEC-007). — 2026-10-19
- [BL-009] [MEDIO] Reemplazado: extender la pestaña "Salud" del dashboard histórico — sustituido por un dashboard nuevo (FEAT-001, DEC-008). — 2026-10-20
- [BL-012] [MEDIO] Obsoleto: datos del dashboard histórico sin actualizar — el histórico queda como referencia; el nuevo panel no depende de scripts locales (RSK-004). — 2026-10-20
- [BL-014] [BAJO] Obsoleto: detalles de `js/config.js` del dashboard histórico — fuera de alcance, el histórico no se modifica (DEC-008). — 2026-10-20
- [BL-019] [ALTO] FEAT-001 Dashboard Factory: investigación, diseño, implementación, tests y documentación — gw2-factory-dashboard. · DEC-008, DEC-009 — 2026-10-20
- [BL-018] [MEDIO] CI del dashboard — `.github/workflows/test.yml` corre `node --test` en cada push y PR de gw2-factory-dashboard. · FEAT-001 — 2026-10-20
- [BL-001] [ALTO] Futuro de `gw2-wallet-agents` y `gw2-agents-dashboard` — decidido por Pablo: pasan a LEGACY y se mantienen activos como benchmark histórico. La Factory no los modifica ni los usa como fuente. · DEC-001, DEC-008, RSK-008 — 2026-10-20
- [BL-022] [ALTO] GDS 1.0.0 fundamentos — tokens en 3 niveles, 23 componentes, íconos, contraste calculado (57 pares AA), GDS_FOUNDATION.md y 12 tests en gw2-factory-dashboard/gds. · DEC-010, LES-013 — 2026-10-20
