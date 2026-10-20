# FEAT-001 — Dashboard Factory

- Estado: DISPONIBLE PARA EVALUACIÓN (versión 2.0.0 publicada; pendiente: validación visual de Pablo, BL-016, RSK-015)
- Versión: 2.0.0 — Centro de Decisiones (2026-10-20, gw2-factory-dashboard @ `cfdd1fa`; ver CHANGELOG)
- Fecha: 2026-10-20
- Repositorio: https://github.com/PabloSnchz/gw2-factory-dashboard
- URL: https://pablosnchz.github.io/gw2-factory-dashboard/ (GitHub Pages activo, medido 2026-10-20)
- Evolución: FACTORY-001B (BL-020, BL-021) — Gato Design System y Centro de Decisiones
- Decisiones: DEC-008, DEC-009, DEC-010, DEC-011, DEC-012, DEC-013
- Revisión final (MC-6, 2026-10-20): un test recorre todas las vistas y exige un solo h1 y títulos sin saltear niveles; corrigió dos errores reales. Tablas con scroll propio en pantallas chicas. Textos sin códigos internos y documentación consolidada (BL-024). Informe en gw2-factory-dev `ai-memory/missions/FACTORY-001B-informe-final.md`.
- Centro de decisiones con GDS (MC-5, 2026-10-20, DEC-013): Hoy empieza con una frase que dice qué hacer y una tarjeta por pendiente (por qué importa, qué recomienda la Factory, botones). Los IDs pasan a ser referencias secundarias y los estados se dicen en palabras. Las respuestas que no se registraron se ven en el panel. Panel @ `9c8726b`.
- Responder desde el panel (MC-4, 2026-10-20): cada pedido abierto tiene botones (Aprobar / Rechazar / Posponer 7 días / Ya lo hice) que abren un issue prellenado; el workflow `decision-response` de gw2-factory-dev escribe la respuesta en `ai-memory/responses/`. Después aparece en "Ya respondiste" (DEC-012).

## Qué resuelve

Centro de decisiones de la Factory. Pablo entiende en menos de 60 segundos qué necesita de él, qué hace la Factory y por qué, qué hizo hoy y esta semana, y qué está bloqueado; y responde desde el mismo lugar.

## Vistas

| Vista | Responde |
|---|---|
| Hoy | Frase de resumen; respuestas sin registrar; "Necesita tu decisión" (tarjetas con recomendación y botones); "Ya respondiste"; qué hace la Factory (tarea, motivo, etapa, tiempo, próxima acción); "Qué debería preocuparte"; hoy / esta semana; números; entornos DEV/PROD/panel |
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

- 74 tests en node (`node --test tests/`) sobre parsers, decisiones, modelo, vistas, GDS, accesibilidad y textos, con la memoria real como fixture; 20 mutaciones detectadas en MC-5 y MC-6.
- Revisión de accesibilidad de las 87 páginas que genera la memoria real (MC-6): un solo h1 por página y niveles de título sin saltear.
- Prueba de punta a punta del pipeline (loader → modelo → vistas) con fetch simulado, incluido el caso sin API (cuota agotada).
