# STATUS

Estado: IDLE
Tarea actual: Ninguna — FACTORY-OPS-001 entregó su propuesta (sin implementar). Esperando REQ-008
Motivo: El modelo operativo define autonomía y posible costo de la plataforma: decide Pablo. REQ-008 no bloquea nada; el trabajo de producto sigue.
Fase: F1 — Visibilidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-21T03:23Z
Última actualización: 2026-10-21T03:33Z
Próxima acción: BL-034 en la próxima sesión (metas de Janthir Wilds y Visions of Eternity). Con la respuesta a REQ-008, DEC 023, LES 027 y la vigilia diaria, después de BL-034.

## Resumen de la sesión

- FACTORY-OPS-001: propuesta del modelo operativo en `missions/FACTORY-OPS-001-modelo-operativo.md`:
  - arranque fijo y orden de elección del trabajo;
  - presupuesto semanal: 60 % o más de producto, 15 % o menos de soporte;
  - Discovery por nivel de READY, con la regla "1 promovida por 1 cerrada";
  - qué detiene la Factory y qué detiene solo un área;
  - qué hacer sin READY;
  - sesiones de 60 min o 12 micro-ciclos;
  - 11 métricas.
- Scheduler recomendado: D híbrido por etapas. Despertar cuando escribe Pablo, más una vigilia diaria en GitHub Actions; sesiones programadas solo si la plataforma lo permite y Pablo acepta el costo.
- Hallazgo: Shiruvana no se despierta sola; la autonomía de largo plazo depende de la plataforma (LES 027 propuesta).
- 1 micro-ciclo de 2 archivos, escrituras en serie.

## Esperando a Pablo

- [REQ-008] Decisión: Aprobar el modelo operativo de largo plazo y elegir cómo se despierta Shiruvana (se responde desde el panel).
- [FEAT-003] Validación: Abrí DEV (https://gw2-factory-dev.vercel.app/), entrá a Actividades y fijate que los 6 lugares del Agente de red de suministros del Pacto sean los de hoy en el juego. Cambian a las 05:00 de Argentina.
- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
