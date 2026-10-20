# STATUS

Estado: EN_CURSO
Tarea actual: BL-020 — FACTORY-001B: Gato Design System y Centro de Decisiones · MC-3 intercambio de decisiones
Motivo: MC-2 validado por Pablo (2026-10-20T03:12Z). MC-3 construye el contrato con el que la Factory propone decisiones y Pablo responde (pedidos y respuestas en ai-memory), con parser, modelo y tests en el panel. Sin cambios de interfaz (MC-5) ni canal automático desde el panel (MC-4).
Fase: F1 — Visibilidad
Etapa actual: ARCHITECTURE
Inicio: 2026-10-20T03:13Z
Última actualización: 2026-10-20T03:13Z
Próxima acción: Definir el contrato v3 (requests/ y responses/), publicar los pedidos abiertos, implementar parser y modelo en gw2-factory-dashboard y esperar validación.

## Plan de micro-ciclos (FACTORY-001B)

- MC-1 — Registrar arranque, riesgos y lecciones (gw2-factory-dev). HECHO 2026-10-20.
- MC-2 — GDS: tokens, componentes, GDS_FOUNDATION.md, contraste calculado, test de reglas; DEC-010 (dashboard + dev). HECHO 2026-10-20.
- MC-3 — Contrato de datos v3 (nueva decisión): requests/ y responses/, pedidos en lenguaje simple; parser y tests (dev + dashboard). EN CURSO.
- MC-4 — Canal de respuesta (nueva decisión): Action en gw2-factory-dev que convierte el issue de Pablo en un archivo de respuesta, con tests (dev).
- MC-5 — Interfaz con GDS: vista Decidir con Aprobar / Rechazar / Posponer; index.html, estilos y tests en un único push (dashboard).
- MC-6 — Revisión (WCAG AA, textos), funcionalidades GDS y Centro de Decisiones registradas, CHANGELOG 2.0.0, pedido de validación (ambos).

## Esperando a Pablo

- [BL-003] Crear el proyecto de Vercel para gw2-factory-dev (requiere tu cuenta) y, cuando esté activo, apagar GitHub Pages en gw2-factory-dev.
- [BL-016] Validar el panel publicado (se recomienda validar la versión con GDS al cierre de FACTORY-001B).
- [RSK-001] Activar protección de rama en main de producción.

## Bloqueos

- Ninguno para MC-3.
