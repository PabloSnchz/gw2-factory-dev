# ROADMAP

Horizonte de evolución de la Factory sobre gw2-factory-dev (DEV).
La promoción a producción no forma parte de este roadmap: es decisión exclusiva de Pablo.

| Fase | Objetivo | Criterio de salida | Estado |
|---|---|---|---|
| F0 — Fundación | Memoria oficial operativa y rol del repo definido | ai-memory inicializada; DEC-001..004; BL-001..003 resueltos por Pablo | EN CURSO |
| F1 — Visibilidad | Pablo entiende el estado del ecosistema desde el dashboard | Dashboard leyendo ai-memory de este repo; FEAT-001 "Salud del Ecosistema" disponible | PENDIENTE |
| F2 — Calidad | Cada PR se valida automáticamente | `node --check` + validación de ai-memory en CI (BL-006); documentación de producto sincronizada (BL-004) | PENDIENTE |
| F3 — Evolución | Funcionalidades nuevas listas para evaluación humana en DEV | ≥1 FEAT nueva con ciclo Product→Architecture→Development→Review→Documentation completo | PENDIENTE |

## Dependencias

- F1 depende de BL-001 (fuente de datos del dashboard).
- F3 depende de BL-003 (DEV evaluable) o de un mecanismo alternativo de evaluación acordado con Pablo.

## Historial

- 2026-10-19 — Roadmap inicial creado durante la inicialización de ai-memory.
