# LES-043 — Una caché sin tope en un origen compartido le roba lugar a todos

- Fecha: 2026-10-31
- Tarea: bug de La Guarida reportado por Pablo (fuera de backlog; arreglo en gw2-factory-dashboard `673a4cf`)

## Qué pasó

Pablo agregó un favorito en La Guarida (Firefox) y salió «⚠️ No se pudo guardar»; al recargar, el favorito desaparecía. La Guarida no tenía nada roto: `localStorage` de `pablosnchz.github.io` estaba en 5,00 MB, el tope. Ese origen es UNO para la Bóveda de producción, DEV, el panel, la bio y La Guarida (DEC-026 lo aceptó para DEV).

Lo llenaba el panel: `js/github.js` cacheaba cada respuesta de la API con la URL como clave. La URL de commits llevaba `since=<ahora menos 30 días>` (cambia en cada carga) y la del árbol, el SHA del último commit (cambia con cada commit de DEV). Cada carga dejaba claves nuevas de 190 a 400 KB y nunca se borraba ninguna. Como `cacheSet` ignoraba el error de cuota, el panel siguió andando y nadie lo vio: el que falló fue otro sitio.

## Arreglo (gw2-factory-dashboard `673a4cf`, github.js 1.1.0)

- Un casillero fijo por llamada (`slot`) que se sobrescribe; el dato es fresco solo si se pidió con la misma ruta.
- `shape`: se guarda solo lo que el panel usa (commits sin archivos ni avatares; del árbol, solo los .md de `ai-memory/`).
- `since` arranca a la medianoche UTC.
- Al iniciar borra las claves viejas `gfd:api:/…`; si el storage está lleno, libera solo su propia caché y reintenta. Nunca toca claves de otras apps.
- `tests/cache.test.mjs`: 8 tests, 4/4 mutaciones detectadas. Validado por Pablo 2026-10-31 (el favorito quedó guardado).

## Qué aprendí

- En `pablosnchz.github.io` el `localStorage` es de todos: cualquier caché que agregue cualquier sitio necesita una clave estable y un tope, y se prueba con muchas cargas seguidas, no con una.
- La clave de una caché no puede llevar valores que cambian en cada uso (la hora, un SHA): se separan el casillero (estable) y la ruta (para saber si el dato está fresco).
- Tragarse un error de cuota oculta el problema y se lo pasa a otro sitio. Si no hay lugar, primero se libera lo propio.
- Para diagnosticar «no guarda», medir el storage por clave antes de tocar código: la causa estaba en otro repo.
