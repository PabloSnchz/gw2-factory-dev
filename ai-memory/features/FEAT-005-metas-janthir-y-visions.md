# FEAT-005 — Metas de Janthir Wilds y Visions of Eternity en Meta & Eventos

- Estado: EN PRODUCCIÓN desde 2026-10-21 07:35Z (gw2-wallet-ligero `36010ab` datos, `2bab20f` meta.js), por orden de Pablo (BL-042). Blobs idénticos a DEV. Vuelta atrás: `4629e7e` (meta-events.json `f612bebf`, meta.js `15da703c`).
- Fecha: 2026-10-21
- Backlog: BL-034 · Riesgo: RSK-018 · Lecciones: LES-026, LES-028
- Commits (gw2-factory-dev): `b04ffbf` datos y tests · `faaee56` `js/meta.js` 3.5.0 · `c6b24b6` tests del filtro

## Qué resuelve

Meta & Eventos no tenía las metas de Janthir Wilds, tenía una sola de Visions of Eternity con horarios equivocados (cada 4 h en vez de cada 2 h), Monte Balrior figuraba como SotO y el filtro "Convergence" no mostraba nada. El jugador veía información falsa sin ningún error (RSK-018).

## Qué cambió

Horarios en UTC, cada uno verificado en al menos 3 fuentes (LES-026): wiki oficial (Event timers y páginas de cada evento), GuildJen, Le Bus Magique, buildop, Aeronef y Convergence Corp.

| Expansión | Meta | Mapa | Primera (UTC) | Cada | Dura | Waypoint |
|---|---|---|---|---|---|---|
| Janthir Wilds | De Nieblas y Monstruos (nueva) | Janthir Syntri | 00:30 | 2 h | 25 min | `[&BCoPAAA=]` |
| Janthir Wilds | Un Viaje Titánico (nueva) | Bava Nisos | 01:20 | 2 h | 25 min | `[&BGEPAAA=]` |
| Janthir Wilds | Convergencia: Monte Balrior (antes SotO, 01:30) | Costas Bajas | 00:00 | 3 h | 10 min | `[&BK4OAAA=]` |
| Visions of Eternity | Secretos del Bosque (antes cada 4 h) | Bosque Estrellado | 01:40 | 2 h | 35 min | `[&BJ4PAAA=]` |
| Visions of Eternity | ¡Trifulca de Hammerhart! (nueva) | Shipwreck Strand | 00:40 | 2 h | 20 min | `[&BJEPAAA=]` |
| Visions of Eternity | Grilletes de los Antiguos (nueva) | Eternity's Garden | 01:10 | 2 h | 25 min | `[&BP8PAAA=]` |
| Visions of Eternity | Profundidades de la Crueldad (nueva) | Leyspring Hollows | 02:00 | 3 h | 30 min | `[&BDYQAAA=]` |
| Visions of Eternity | Convergencia: Nexo de la Eternidad (nueva) | Leyspring Hollows | 01:00 | 3 h | 10 min | `[&BDYQAAA=]` |
| SotO | Convergencia: Nayos Exterior (antes "Convergencias") | La Torre del Mago | 01:30 | 3 h | 10 min | `[&BB8OAAA=]` |

- Las 3 convergencias pasan a tipo `convergence`: el filtro "Convergence" ahora las encuentra.
- `js/meta.js` 3.5.0 completa el filtro de expansión con lo que trae el JSON: aparecen Visions of Eternity, Icebrood Saga y Living World, y "Janthir" se muestra como "Janthir Wilds". `index.html` no se tocó.
- `meta-events.json?v=2.6.0`: con la versión vieja el navegador podía seguir mostrando los horarios anteriores.
- `tests/meta-events.test.cjs`: 15 tests (esquema, expansiones, filtro de tipo, horarios de las 9 entradas, filtro de expansión cargando `meta.js` en `node:vm`, versión del fetch). 85 tests en total. Contra los archivos originales fallan 13 de los 15.

## Cómo evaluarlo

Para mirar (Pablo), en DEV (https://pablosnchz.github.io/gw2-factory-dev/) → Meta & Eventos:

1. Expansión → "Visions of Eternity": aparecen 5 tarjetas. "Janthir Wilds": aparecen 3.
2. Tipo → "Convergence": aparecen Monte Balrior, Nexo de la Eternidad y Nayos Exterior.
3. Si estás en el juego, compará una meta con el horario real.

Verificado por la Factory: horarios contra 3 o más fuentes, blobs publicados idénticos a los locales y mutaciones (los tests fallan contra los datos y el código anteriores).

## Riesgos y notas

- **Grilletes de los Antiguos:** la wiki marca su propio horario como incorrecto desde la última actualización (dice :15). Tres fuentes independientes coinciden en :10 en horas impares. Si la wiki corrige y difiere, se ajusta.
- **Waypoints:** algunos sitios usan otro waypoint cercano para el mismo evento (por ejemplo `[&BHUPAAA=]` para Hammerhart). Usé los de la wiki oficial; el de Grilletes es The Forge, donde empieza la meta.
- **Cruce de medianoche:** una ventana que empieza antes de las 00:00 UTC y termina después (Secretos del Bosque 23:40 + 35 min) no figura como "activa" entre 00:00 y 00:15. Le pasa a todo `meta.js` desde antes; es una mejora menor pendiente.
- `index.html` carga `meta.js?v=3.4.1`: GitHub Pages revalida en 10 minutos, así que el cambio llega igual; la próxima vez que se toque `index.html` conviene subir esa versión.
