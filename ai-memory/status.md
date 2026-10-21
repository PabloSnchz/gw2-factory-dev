# STATUS

Estado: EN_CURSO
Tarea actual: BL-013 — PSNA del día equivocado, en autonomía continua acotada
Motivo: Pablo aprobó REQ-007 (opción A): un archivo que solo supera 40 KB ocupa un micro-ciclo completo, como único archivo funcional, con revisión, validación y publicación dedicadas (DEC-021).
Fase: F1 — Visibilidad
Etapa actual: REVIEW
Inicio: 2026-10-21T00:53Z
Última actualización: 2026-10-21T01:20Z
Próxima acción: BL-013b, PSNA: `js/activities.js` calcula el día con la rotación y lee el archivo propio (archivo grande, micro-ciclo dedicado). Después BL-013c.

## Micro-ciclo actual

Micro-ciclo: BL-013b — PSNA: `js/activities.js` calcula el día con la rotación y lee el archivo propio (archivo grande, micro-ciclo dedicado)
Archivos:
- js/activities.js
G6-B cerrado: DEC-021 §1 bis publicada y área liberada en discovery.
Micro-ciclo de archivo grande (DEC-021 §1 bis): `js/activities.js`, 59,6 KB → 62,0 KB, único archivo funcional.
- Revisión dedicada: diff completo leído; ningún otro módulo depende de lo que cambia (`activities-theme.js` solo usa `_debug().token` y la grilla; `api-gw2.js` cita la clave vieja en un comentario).
- Validación dedicada: `node --check`; 9 tests del día (en `tests/psna-day.test.cjs`, que se publica en BL-013c); 12/12 mutaciones detectadas; arnés con el archivo completo y DOM simulado: sitio publicado lee solo `assets/data/psna-schedule.json`, miércoles 12:00 UTC → Town of Prosperity, 07:30 UTC → Camp Resolve (martes), sin red → rotación de respaldo, cache vieja de marzo ignorada, 0 errores.
- Publicación dedicada: una sola escritura, verificada por SHA.

Plan, un micro-ciclo por vez:

- G6-A — registrar tu aprobación de REQ-007 y retomar BL-013. Hecho.
- G6-B — anotar en DEC-021 la excepción de archivo grande y liberar el área en discovery. Hecho.
- BL-013b — PSNA: `js/activities.js` calcula el día con la rotación y lee el archivo propio (archivo grande, micro-ciclo dedicado). En curso.
- BL-013c — PSNA: test del cálculo del día.
- BL-013d — PSNA: cierre de BL-013 (backlog, riesgo y funcionalidad).

## Esperando a Pablo

- [BL-016] Validación: Mirá el panel en un navegador real, también en el celular, y confirmá que entendés el estado en menos de 60 segundos (RSK-015 sigue abierto hasta entonces).
- [FEAT-002] Validación: Usá DEV (https://gw2-factory-dev.vercel.app/) como siempre y avisá si algo no funciona. Lo de Analytics ya lo verificó la Factory con tests: no hace falta abrir herramientas de desarrollador.

## Para tu información

- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
