# ROADMAP

Horizonte de evolución de la Factory sobre gw2-factory-dev (DEV).
La promoción a producción no forma parte de este roadmap: es decisión exclusiva de Pablo.

| Fase | Objetivo | Criterio de salida | Estado |
|---|---|---|---|
| F0 — Fundación | Memoria oficial operativa y entorno DEV definido | ai-memory inicializada; DEC-005 y DEC-006 decididas por Pablo (hecho 2026-10-20); GA desacoplado (BL-002); DEV publicado en Vercel y Pages apagado en DEV (BL-003) | PENDIENTE |
| F1 — Visibilidad | Pablo entiende el estado de la Factory en menos de 60 segundos | gw2-factory-dashboard publicado (hecho 2026-10-20) y validado por Pablo (FEAT-001, BL-016); Pablo decide desde el panel (Centro de Decisiones, BL-020, BL-021) | EN CURSO |
| F2 — Calidad | Cada cambio se valida automáticamente | `node --check` + validación de ai-memory en CI (BL-006); CI del dashboard (BL-018); documentación de producto sincronizada (BL-004) | PENDIENTE |
| F3 — Evolución | Funcionalidades nuevas listas para evaluación humana en DEV | ≥1 FEAT nueva con ciclo Product→Architecture→Development→Review→Documentation completo | PENDIENTE |

## Dependencias

- F1 depende de BL-020/BL-021 (FACTORY-001B) y de la validación de Pablo (BL-016). Pages ya está activo en el panel.
- F0 se volvió más urgente: DEV ya está publicado en el dominio de producción (RSK-002, RSK-003). Decisiones tomadas; falta crear el proyecto de Vercel (Pablo, BL-003) y desacoplar GA (Factory, BL-002, después de FACTORY-001B).
- F3 depende de BL-003 (DEV evaluable) o de un mecanismo alternativo de evaluación acordado con Pablo.

## Historial

- 2026-10-19 — Roadmap inicial creado durante la inicialización de ai-memory.
- 2026-10-19 — F0 amplía su criterio de salida con el entorno DEV (DEC-005, DEC-006); F1 redefine FEAT-001 como extensión de la pestaña "Salud" existente (DEC-007, LES-009).
- 2026-10-20 — Misión FACTORY-001 (Dashboard First): F1 pasa a EN CURSO con un dashboard nuevo (DEC-008, reemplaza DEC-007); F0 queda BLOQUEADA esperando decisiones de Pablo.
- 2026-10-20 — Misión FACTORY-001B (GDS y Centro de Decisiones) registrada tras una interrupción de plataforma (LES-012); se ejecuta en 6 micro-ciclos (ver status.md). Medido: Pages activo en DEV y en el panel.
- 2026-10-20 — Pablo decide DEC-005 (Vercel), DEC-006 (DEV sin Analytics) y BL-001 (repos históricos a LEGACY, activos como benchmark): F0 deja de estar bloqueada por decisiones. MC-2 publica el Gato Design System 1.0 (DEC-010).
