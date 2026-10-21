# DEC-026 — DEV vuelve a GitHub Pages, publicado con un workflow propio

- Estado: ACEPTADA — decidida por Pablo en la conversación (2026-10-21 05:33Z)
- Fecha: 2026-10-21
- Ámbito: entorno DEV de La Bóveda (gw2-factory-dev). Producción no cambia.
- Reemplaza: DEC-005 (DEV en Vercel con origen propio). Rige DEC-022: prevalece la regla aprobada más recientemente.
- Relacionadas: DEC-005, DEC-021, DEC-022, DEC-023, LES-027, RSK-002

## Contexto

El 2026-10-21 agoté el límite de Vercel Hobby: 100 publicaciones cada 24 horas móviles. Hice 100 commits a gw2-factory-dev entre las 00:30Z y las 05:17Z, y 82 de ellos eran de memoria. BOV-2 a BOV-5 quedaron en GitHub, pero no se publicaron en DEV, y Pablo no podía revisar nada por unas 19 horas.

Recomendé quedarnos en Vercel para no compartir el almacenamiento del navegador con producción. Pablo lo evaluó y decidió otra cosa: esperar horas para ver un cambio de DEV no tiene sentido, porque él puede revisar, aprobar y autorizar producción en minutos. Compartir el origen con producción solo le afecta a él, y es una molestia chica, no un riesgo.

## Decisión

1. DEV se publica en `https://pablosnchz.github.io/gw2-factory-dev/` con `.github/workflows/dev-pages.yml` (GitHub Actions → Pages). Con un workflow propio no aplica el límite blando de 10 publicaciones por hora de Pages.
2. Solo publica cuando cambia la app. Los cambios en `ai-memory/`, `tests/` y los `.md` no publican. El sitio publicado no incluye `ai-memory/`, `tests/` ni `.github/`.
3. Analytics sigue apagado en DEV: el cargador solo activa GA en `/gw2-wallet-ligero` (DEC-006).
4. Vercel queda sin uso para DEV. Desconectarlo es opcional y lo hace Pablo cuando quiera.

## Consecuencias aceptadas por Pablo

- DEV y producción comparten `localStorage` en el navegador de quien abra los dos (en la práctica, Pablo). Ejemplo concreto: si abre DEV, queda guardado el theme "Gato Negro"; producción todavía no lo tiene, así que la producción se ve sin estilos hasta elegir otro theme en el selector (un clic). Los jugadores de producción no entran a DEV y no se ven afectados.
- Lo que pruebe en DEV que cambie el formato de datos guardados puede afectar a la producción de Pablo. Cuando un cambio toque datos guardados, lo voy a avisar antes de publicarlo en DEV.

## Requisito manual (Pablo, una sola vez)

Settings → Pages → Build and deployment → Source: "GitHub Actions".

## Lo que aprendí

El límite lo agoté yo: mi patrón de publicación (varios commits de memoria por micro-ciclo en el repo de la app) era el problema, más que el proveedor. Un solo commit por micro-ciclo sigue siendo la regla. Además, el tiempo de revisión de Pablo es parte del producto: una restricción que lo hace esperar horas cuesta más que una molestia que se resuelve con un clic.
