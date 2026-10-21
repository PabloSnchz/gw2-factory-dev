# STATUS

Estado: EN_CURSO
Tarea actual: BL-038 — Alineación de UI de La Bóveda (FACTORY-BOVEDA-UI-001): marca Gato Negro, theme oficial y mi voz
Motivo: Pablo lo priorizó antes de BL-034 (2026-10-21 04:52Z) y confirmó el enfoque a las 05:00Z (DEC-025). Es producto: lo ve el jugador. Solo DEV.
Fase: F1 — Visibilidad
Etapa actual: ARCHITECTURE
Inicio: 2026-10-21T05:01Z
Última actualización: 2026-10-21T05:08Z
Próxima acción: BOV-1, registrar DEC-025, BL-038 y el índice. Después BOV-2.

## Micro-ciclo actual

Micro-ciclo: BOV-1 — registrar DEC-025, BL-038 y el índice
Archivos:
- ai-memory/decisions/DEC-025-identidad-en-la-boveda.md
- ai-memory/memory-index.md
- ai-memory/backlog.md
Pablo validó el panel 2.2.0 en pantalla y en el celular: BL-016 pasa a DONE.

Plan, un micro-ciclo por vez:

- BOV-1 — registrar DEC-025, BL-038 y el índice. En curso.
- BOV-2 — theme oficial Gato Negro (css/themes/gato.css) y su test de contraste.
- BOV-3 — selector de themes 1.2.0: Gato Negro por defecto y migración de una sola vez.
- BOV-4 — gato oficial como asset (assets/brand/gato-negro.svg) y su test.
- BOV-5 — index.html: logo, pie, favicon y theme por defecto (archivo grande).
- BOV-6 — mi componente de voz en La Bóveda y su test.
- BOV-7 — mi voz en la bienvenida, el modal de API Keys y la ayuda.
- BOV-8 — cierre: funcionalidad, backlog y estado.

## Esperando a Pablo

- [FEAT-003] Validación: Abrí DEV (https://gw2-factory-dev.vercel.app/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
