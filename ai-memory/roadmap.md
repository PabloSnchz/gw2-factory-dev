# ROADMAP

Horizonte de evolución de la Factory sobre gw2-factory-dev (DEV).
La promoción a producción no forma parte de este roadmap: es decisión exclusiva de Pablo.

| Fase | Objetivo | Criterio de salida | Estado |
|---|---|---|---|
| F0 — Fundación | Memoria oficial operativa y entorno DEV definido | ai-memory inicializada; DEC-005 y DEC-006 decididas por Pablo (hecho 2026-10-20); GA desacoplado (BL-002, hecho 2026-10-20); DEV publicado en Vercel y Pages apagado en DEV (BL-003, hecho 2026-10-20) | HECHA |
| F1 — Visibilidad | Pablo entiende el estado de la Factory en menos de 60 segundos | gw2-factory-dashboard publicado (hecho 2026-10-20) y validado por Pablo (FEAT-001, BL-016); Pablo decide desde el panel (Centro de Decisiones, BL-020, BL-021) | EN CURSO |
| F2 — Calidad | Cada cambio se valida automáticamente | validación de ai-memory en CI (BL-006, hecho 2026-10-20) y `node --check` (BL-031); CI del dashboard (BL-018, hecho); documentación de producto sincronizada (BL-004) | EN CURSO |
| F3 — Evolución | Funcionalidades nuevas listas para evaluación humana en DEV | ≥1 FEAT nueva con ciclo Product→Architecture→Development→Review→Documentation completo | PENDIENTE |

## Dependencias

- F1 depende de BL-020/BL-021 (FACTORY-001B) y de la validación de Pablo (BL-016). Pages ya está activo en el panel.
- F0 cumplida el 2026-10-20: DEV en Vercel con origen propio (`https://gw2-factory-dev.vercel.app/`), GA desacoplado (BL-002) y RSK-002 mitigado.
- F3 ya tiene dónde evaluarse: DEV en Vercel (BL-003, hecho).

## Historial

- 2026-10-19 — Roadmap inicial creado durante la inicialización de ai-memory.
- 2026-10-19 — F0 amplía su criterio de salida con el entorno DEV (DEC-005, DEC-006); F1 redefine FEAT-001 como extensión de la pestaña "Salud" existente (DEC-007, LES-009).
- 2026-10-20 — Misión FACTORY-001 (Dashboard First): F1 pasa a EN CURSO con un dashboard nuevo (DEC-008, reemplaza DEC-007); F0 queda BLOQUEADA esperando decisiones de Pablo.
- 2026-10-20 — Misión FACTORY-001B (GDS y Centro de Decisiones) registrada tras una interrupción de plataforma (LES-012); se ejecuta en 6 micro-ciclos (ver status.md). Medido: Pages activo en DEV y en el panel.
- 2026-10-20 — Pablo decide DEC-005 (Vercel), DEC-006 (DEV sin Analytics) y BL-001 (repos históricos a LEGACY, activos como benchmark): F0 deja de estar bloqueada por decisiones. MC-2 publica el Gato Design System 1.0 (DEC-010).
- 2026-10-20 — MC-3: intercambio de decisiones (DEC-011). Lo que la Factory necesita de Pablo pasa a ser un pedido en requests/ con respuesta en responses/; primeros pedidos REQ-001 y REQ-002.
- 2026-10-20 — MC-4: Pablo responde desde el panel con un botón (DEC-012). Se cierra el ciclo Factory trabaja → panel propone → Pablo responde → Factory continúa sin crear archivos a mano.
- 2026-10-20 — MC-5: el panel pasa a ser un Centro de decisiones sobre el Gato Design System (DEC-013). Lo que necesita a Pablo va primero, con lenguaje sin códigos internos y los errores del canal visibles. Queda MC-6 (revisión y cierre de FACTORY-001B).
- 2026-10-20 — MC-6: FACTORY-001B cerrada (informe en `missions/`). Panel 2.0.0 con revisión de accesibilidad y textos y documentación consolidada. F1 sigue EN CURSO hasta la validación visual de Pablo (BL-016). La Factory propone autonomía continua acotada (DEC-014, REQ-003) y no inicia misiones nuevas hasta la respuesta.
- 2026-10-20 — Pablo aprueba FACTORY-001B funcionalmente y elige la opción B desde el panel (RESP-001, primera decisión real del canal). DEC-014 queda aceptada; la autonomía se activa cuando Pablo lo indique, después de la validación final.
- 2026-10-20 — Pablo valida FACTORY-001B y activa la autonomía continua acotada. FACTORY-LIVE-001 (sesión 1): DEV sin Analytics (FEAT-002, BL-002), validación de la memoria en CI (BL-006) y BOM de `analytics.js`. F2 pasa a EN CURSO. Informe en `missions/FACTORY-LIVE-001-informe.md`.
- 2026-10-20 — FACTORY-RESEARCH-001 (Discovery Engine): la Factory descubre oportunidades sin un agente nuevo (DEC-015), con límites verificados en CI (DEC-016) y un backlog que solo contiene trabajo ejecutable (DEC-017, READY 8 → 4). La ronda inicial encontró datos de producto desactualizados (PSNA y metas, RSK-018), promovidos a BL-013 y BL-034: el próximo trabajo de producto corrige información que el usuario ve hoy. Las rondas autónomas esperan REQ-004. Informe en `missions/FACTORY-RESEARCH-001-informe.md`.
- 2026-10-20 — Pablo publica DEV en Vercel y apaga Pages en DEV (RESP-003): F0 queda HECHA, RSK-002 mitigado. Se procesa al recuperar FACTORY-DASHBOARD-REFINEMENT-001 tras una interrupción de plataforma.
- 2026-10-21 — Gobernanza: límites de micro-ciclo simultáneos (DEC-021, con excepción para archivos de más de 40 KB por RESP-007), reconciliación con las instrucciones v2 y regla de conflictos (DEC-022). Primer trabajo de producto en autonomía: BL-013 cerrado, el PSNA muestra el día correcto en DEV (FEAT-003). RSK-018 queda abierto solo por las metas (BL-034).
