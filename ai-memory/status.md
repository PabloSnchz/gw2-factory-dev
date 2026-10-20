# STATUS

Estado: IDLE
Tarea actual: Ninguna — FACTORY-RESEARCH-001 (Discovery Engine) cerrada; la próxima sesión toma BL-013
Motivo: La Factory ya descubre trabajo por sí misma con límites verificados en CI (DEC-015, DEC-016, DEC-017). La ronda inicial encontró dos errores de datos que el usuario ve hoy: PSNA del día equivocado (BL-013) y metas faltantes de Janthir Wilds y Visions of Eternity (BL-034). Informe en `missions/FACTORY-RESEARCH-001-informe.md`.
Fase: F2 — Calidad
Etapa actual: DOCUMENTATION
Inicio: 2026-10-20T07:52Z
Última actualización: 2026-10-20T08:30Z
Próxima acción: Autonomía continua (DEC-014): BL-013 — calcular el PSNA con la rotación de 7 días y cambio a las 08:00 UTC, mostrar "sin datos" en lugar de un día equivocado, leer el archivo propio y corregir códigos con tests. Antes de publicar, confirmar qué conjunto corresponde a cada día de la semana. Después: BL-034, BL-004, BL-005.

## Plan de micro-ciclos (FACTORY-RESEARCH-001)

- R1 — Investigación: fuentes externas y memoria del producto; ronda inicial de discovery. HECHO 2026-10-20.
- R2 — Gobernanza: DEC-015, DEC-016, DEC-017; `discovery.md` y `discovery-archive.md`; backlog dentro de los límites (READY 8 → 4); REQ-004. HECHO 2026-10-20.
- R3 — Control automático: el test de memoria verifica READY ≤ 5, abiertas ≤ 15, formato y salida con motivo (`99f3220`, 13/13, 8/8 mutaciones). HECHO 2026-10-20.
- R4 — Cierre: lecciones, riesgos, informe y estado. HECHO 2026-10-20.

## Esperando a Pablo

- [REQ-004] Elegir cuándo puede investigar sola la Factory (se responde desde el panel). Hasta entonces, sin rondas autónomas de discovery.
- [FEAT-002] Evaluar DEV sin Analytics: en DEV no debe haber peticiones a Google Analytics y `window.__gaEnabled` vale `false`.
- [RSK-016] Confirmar en GitHub Actions que `app-checks` está en verde (la Factory no puede ver CI).
- [BL-016] Mirar el panel en un navegador real, también en el celular (RSK-015 sigue abierto hasta entonces).
- [REQ-002] Publicar la versión de prueba en Vercel y apagar GitHub Pages en DEV (se responde desde el panel).
- [RSK-001] Revisión acordada el 2026-11-20: protección de `main` de producción con una propuesta más acotada (RESP-002).

## Bloqueos

- BL-031: `node --check` de `js/*.js` espera lectura de CI o PR (RSK-016).
