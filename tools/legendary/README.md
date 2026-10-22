# tools/legendary — cómo regenerar los datos de la Armería

La Armería de La Bóveda usa tres archivos de datos que **no se escriben a mano**:

| Archivo | Qué tiene | Lo genera |
|---------|-----------|-----------|
| `js/legendary-data.js` | Catálogo de las legendarias del Armory: nombre en inglés y español, ícono, tipo, subtipo, generación, expansión y precios del Bazar | pasos 1 a 3 |
| `js/legendary-recipes.js` | De qué se hace cada legendaria del catálogo (Forja Mística o disciplina). Se carga siempre | pasos 4 y 5 |
| `js/legendary-precursors.js` | Lo que hay debajo: piezas intermedias, precursores y materiales base. Se carga al abrir un árbol | pasos 4 y 6 |

Hay que regenerarlos cuando ArenaNet agrega legendarias (una expansión nueva, un set nuevo de armadura, una reliquia…) o cuando cambia una receta. Hasta octubre de 2026 los scripts vivían solo en el legado de QwenPaw (`gw2-wallet-agents/js/_*.py`) y DEV no podía regenerar nada (RSK-018). Se migraron acá en BL-043, uno por micro-ciclo y con tests.

## Los seis pasos

| Paso | Script | Lee | Escribe | Migrado |
|------|--------|-----|---------|---------|
| 1. Catálogo crudo | `fetch_legendary_items.py` | API de GW2 | `.work/legendary_items_full.json` | MIG-2a |
| 2. Precios del Bazar | `fetch_thematic_prices.py` | paso 1 + API | `.work/legendary_prices.json` | MIG-2b |
| 3. Catálogo servido | `build_legendary_data.py` | pasos 1 y 2 | `js/legendary-data.js` | MIG-2b |
| 4. Fuente de recetas | `fetch_recipes_source.py` | crafty_legend | `.work/recipes_source.json` | MIG-2c |
| 5. Recetas del catálogo | `build_legendary_recipes.py` | pasos 3 y 4 | `js/legendary-recipes.js` | MIG-2c |
| 6. Precursores | `build_legendary_precursors.py` | pasos 3 y 4 | `js/legendary-precursors.js` | MIG-2d |

Todo de una vez, desde la raíz del repo:

```bash
python3 tools/legendary/fetch_legendary_items.py --refresh
python3 tools/legendary/fetch_thematic_prices.py
python3 tools/legendary/build_legendary_data.py --with-prices
python3 tools/legendary/fetch_recipes_source.py
python3 tools/legendary/build_legendary_recipes.py
python3 tools/legendary/build_legendary_precursors.py
node --test tests/*.test.cjs
```

Después, revisar el diff de los tres `.js` antes de publicarlos. Ojo: `legendary-recipes.js` (~110 KB) y `legendary-precursors.js` (~270 KB) no entran en una publicación de la Factory (LES-028); se suben con `git` desde una máquina.

## Pasos 1 a 3 — catálogo y precios

- El paso 1 pide `/v2/legendaryarmory` y `/v2/items` en inglés y en español, de a 200 ids. Guarda cada respuesta en `.work/raw_cache/`; con la caché completa no sale a la red. Si un id no vuelve, **falla** (`FetchError`) y no escribe nada: un catálogo incompleto es peor que ninguno. Opciones: `--refresh`, `--offline`, `--cache-dir`, `--out`.
- El paso 2 pide `/v2/commerce/prices` **en cada corrida** (un precio guardado para siempre miente). Solo aparecen las legendarias que se venden; las ligadas a la cuenta no tienen precio.
- El paso 3 clasifica tipo, subtipo, generación y expansión con las reglas del legado. Opciones: `--input`, `--prices`, `--out`, `--generated`.

No hace falta token ni API key: los endpoints son públicos. La API permite 300 pedidos por minuto por IP (ver `docs/GW2-API-HECHOS.md`).

## Pasos 4 a 6 — recetas y precursores

La API de GW2 **no publica las recetas de la Forja Mística**. Salen de `data/CraftyLegend/recipes.json` del proyecto abierto [crafty_legend](https://github.com/PieOrCake/crafty_legend), de PieOrCake, con **licencia MIT**: gracias. El legado lo usaba con otro nombre (`tools/cl_recipes.json`) y nunca dejó dicho de dónde salía; se encontró en MIG-2c.

- **Fijado a un commit.** `fetch_recipes_source.py` baja siempre el commit `a24d244` (2026-09-17, 634 recetas) y compara la huella del archivo (blob `551cedfa…`). Si no coincide, falla. Para actualizar las recetas se cambia el commit **a propósito**: `--commit <sha> --blob <sha>` (o las constantes del script) y se revisa el diff de los `.js`. `--from-file` sirve para trabajar sin red.
- **Paso 5** lista las 206 legendarias del catálogo, tengan receta o no: 142 con receta (124 de la Forja Mística, 18 de disciplina), 63 sin receta publicada y 1 marcador de cuenta (95093). Si una legendaria apareciera con receta de vendedor, o con dos recetas, el build falla.
- **Paso 6** recorre el árbol desde esas 142 y emite las 907 entradas de abajo: 467 con receta, 436 materiales base y 4 de vendedor. No tiene íconos (los resuelve la app con `js/item-icons.js`) ni nombres en español (la fuente trae solo el inglés). Dos ingredientes vienen con id 0 en la fuente ("Relic (any)" en 101540 y "Testimony of Castoran Heroics" en 109686): se conservan con su nombre y la app no los cuenta contra el inventario.

## Qué se versiona y qué no

- **Se versiona:** los scripts, sus tests y los `.js` generados en `js/`.
- **No se versiona:** `tools/legendary/.work/` (cachés y fuentes bajadas). Si se versionara, dentro de seis meses el build "funcionaría" con datos viejos.

## Tests

```bash
node --test tests/legendary-fetch.test.cjs tests/legendary-build-data.test.cjs \
  tests/legendary-build-recipes.test.cjs tests/legendary-build-precursors.test.cjs
```

Corren sin red y necesitan `python3` (viene en los runners de GitHub Actions). La prueba fuerte de cada build: arma la entrada a partir de los `.js` versionados, corre el script y exige el mismo resultado, entrada por entrada (206 legendarias, 206 recetas, 907 precursores). Con el `recipes.json` real de crafty_legend `a24d244` los pasos 5 y 6 también dan 0 diferencias.

## Para tener en cuenta

- `infer_gex` (paso 3) solo conoce Core, HoT, PoF, IBS y EoD. Secrets of the Obscure, Janthir Wilds y Visions of Eternity se corrigen al mostrar el catálogo, en un solo lugar: `js/render-catologo.js` (BL-046).
- Al regenerar las recetas, los textos que ve el jugador cambian a su versión nueva ("Forja Mística", sin nombres de archivos internos).
