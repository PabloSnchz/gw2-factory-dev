# ROADMAP

Horizonte de evolución de la Factory sobre gw2-factory-dev (DEV).
La promoción a producción no forma parte de este roadmap: es decisión exclusiva de Pablo.

| Fase | Objetivo | Criterio de salida | Estado |
|---|---|---|---|
| F0 — Fundación | Memoria oficial operativa y entorno DEV definido | ai-memory inicializada; DEC-005..007 decididas por Pablo; GA desacoplado (BL-002); DEV publicado con origen propio (BL-003) | EN CURSO |
| F1 — Visibilidad | Pablo entiende el estado del ecosistema desde el dashboard | Perfil de fuente `factory` en el dashboard (DEC-007); FEAT-001 como extensión de la pestaña "Salud" | PENDIENTE |
| F2 — Calidad | Cada PR se valida automáticamente | `node --check` + validación de ai-memory en CI (BL-006); documentación de producto sincronizada (BL-004) | PENDIENTE |
| F3 — Evolución | Funcionalidades nuevas listas para evaluación humana en DEV | ≥1 FEAT nueva con ciclo Product→Architecture→Development→Review→Documentation completo | PENDIENTE |

## Dependencias

- F1 depende de BL-001 (fuente de datos del dashboard).
- F3 depende de BL-003 (DEV evaluable) o de un mecanismo alternativo de evaluación acordado con Pablo.

## Historial

- 2026-10-19 — Roadmap inicial creado durante la inicialización de ai-memory.
- 2026-10-19 — F0 amplía su criterio de salida con el entorno DEV (DEC-005, DEC-006); F1 redefine FEAT-001 como extensión de la pestaña "Salud" existente (DEC-007, LES-009).
