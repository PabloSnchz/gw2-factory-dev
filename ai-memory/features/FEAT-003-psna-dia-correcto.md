# FEAT-003 — PSNA: el panel muestra el día correcto

- Estado: DISPONIBLE PARA EVALUACIÓN (en gw2-factory-dev `main`)
- Fecha: 2026-10-21
- Backlog: BL-013 · Riesgo que mitiga: RSK-018 (parte del PSNA) · Decisiones: DEC-015, DEC-021 §1 bis (RESP-007)
- Commits (gw2-factory-dev): `2c229d9` datos · `eb517d8` test de datos · `bf1480a` `js/activities.js` v3.21.0 · `1c4e387` test del día · `7edc496` nota de fuente

## Qué resuelve

El panel Actividades mostraba, todos los días, los puntos de ruta de los Pact Supply Network Agents de otro día:

- el archivo de datos cubría una sola semana de marzo de 2026;
- si no encontraba la fecha de hoy, el código usaba el primer día de la lista;
- en cualquier sitio publicado leía el archivo del repo de producción, no el propio;
- 15 códigos de waypoint y 2 nombres estaban mal.

## Qué cambió

- `assets/data/psna-schedule.json` v4: rotación semanal (lunes a domingo) verificada contra la wiki y otras 4 fuentes, con el cambio de las 08:00 UTC.
- `js/activities.js` v3.21.0:
  - el día se calcula con el día de la semana. Entre las 00:00 y las 08:00 UTC sigue el día anterior, como en el juego;
  - si no hay datos, el panel dice "No hay datos PSNA disponibles", nunca muestra un día equivocado;
  - lee solo `assets/data/psna-schedule.json`;
  - el respaldo embebido (sin red) es la misma rotación verificada.
- Tests: `tests/psna-data.test.cjs` (3) y `tests/psna-day.test.cjs` (9).

Funciona igual en DEV y en producción: no depende del host, así que se puede promover sin editar.

## Cómo evaluarlo

Para mirar (Pablo): abrí DEV en https://gw2-factory-dev.vercel.app/, entrá a Actividades y mirá "Agente de red de suministros del Pacto". Los 6 lugares tienen que coincidir con los del juego hoy (o con la wiki). Después de las 08:00 UTC (05:00 en Argentina) cambian.

Verificado por la Factory, sin herramientas de Pablo (DEC-019, LES-024):

1. El día correcto para cada fecha de las tablas de la wiki de octubre y enero de 2026, y el cambio exacto a las 08:00 UTC: tests.
2. Sin datos o con datos incompletos no se muestra un día equivocado: tests.
3. El archivo completo se probó con un entorno simulado: lee solo el archivo propio, usa el respaldo sin red e ignora la caché vieja de marzo.
4. 12 mutaciones del código y 7 de los datos: todas detectadas.

## Riesgos y notas

- **Fuentes en desacuerdo:** la página principal de la wiki, leída el 2026-10-21, mostraba las fechas corridas un día respecto de la plantilla de la propia wiki y de las otras 4 fuentes. Se siguió la mayoría (5 contra 1), probablemente una caché del servidor de la wiki (LES-026). Si el juego mostrara otra cosa, avisá: se corrige en el archivo de datos, sin tocar código.
- La rotación puede cambiar con una actualización del juego. El test de datos lo detecta solo si alguien actualiza el archivo; una ronda de discovery la revisa (LES-021).
- `index.html` sigue cargando `js/activities.js?v=3.20.4`. Vercel sirve los archivos estáticos sin caché larga, así que no hace falta cambiarlo; se actualiza la próxima vez que se toque `index.html` (BL-034 o BL-005).
