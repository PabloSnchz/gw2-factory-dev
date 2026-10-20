# FEAT-001 — Dashboard Factory

- Estado: DISPONIBLE PARA EVALUACIÓN (publicado; pendiente: validación de Pablo, BL-016)
- Fecha: 2026-10-20
- Repositorio: https://github.com/PabloSnchz/gw2-factory-dashboard
- URL: https://pablosnchz.github.io/gw2-factory-dashboard/ (GitHub Pages activo, medido 2026-10-20)
- Evolución: FACTORY-001B (BL-020, BL-021) — Gato Design System y Centro de Decisiones
- Decisiones: DEC-008, DEC-009, DEC-010, DEC-011, DEC-012
- Responder desde el panel (MC-4, 2026-10-20): cada pedido abierto tiene botones (Aprobar / Rechazar / Posponer 7 días / Ya lo hice) que abren un issue prellenado; el workflow `decision-response` de gw2-factory-dev escribe la respuesta en `ai-memory/responses/`. Después aparece en "Ya respondiste" (DEC-012).

## Qué resuelve

Centro de observación de la Factory. Pablo entiende en menos de 60 segundos qué hace la Factory, por qué, qué hizo hoy y esta semana, qué está bloqueado y qué necesita su decisión.

## Vistas

| Vista | Responde |
|---|---|
| Hoy | Tarea actual, motivo, etapa del workflow, tiempo en ejecución, próxima acción; "Necesita tu decisión"; "Qué debería preocuparte"; hoy / esta semana; KPIs; entornos DEV/PROD/panel |
| Trabajo | Roadmap por fases y backlog READY / IN_PROGRESS / BLOCKED / DONE |
| Conocimiento | Decisiones, lecciones y funcionalidades, con detalle renderizado y "citado por" |
| Riesgos | Críticos, altos, otros abiertos y mitigados (`risks.md`) |
| Actividad | Commits de DEV y del panel + registros de memoria, por día (24h / 7d / 30d) |
| Salud | Chequeos medidos y declarados, fuentes de datos y cuota de API |

## Cómo evaluarlo

1. GitHub Pages ya está activo (medido 2026-10-20): abrir https://pablosnchz.github.io/gw2-factory-dashboard/.
2. Abrir la URL y verificar las preguntas de la misión en la vista "Hoy".
3. Modificar `ai-memory/status.md` en gw2-factory-dev y pulsar "Refrescar": el panel lee el nuevo commit.

## Verificación realizada

- Tests en node (`node --test tests/`) sobre parsers, modelo y vistas con la memoria real como fixture.
- Prueba de punta a punta del pipeline (loader → modelo → vistas) con fetch simulado, incluido el caso sin API (cuota agotada).
