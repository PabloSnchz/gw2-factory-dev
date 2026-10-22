# tools/legendary — cómo regenerar los datos de la Armería

La Armería de La Bóveda usa tres archivos de datos que **no se escriben a mano**:

| Archivo | Qué tiene | Lo genera |
|---------|-----------|-----------|
| `js/legendary-data.js` | Catálogo de las legendarias del Armory: nombre en inglés y español, ícono, tipo, subtipo, generación, expansión y precios del Bazar | `fetch_legendary_items.py` → `build_legendary_data.py` (MIG-2b) |
| `js/legendary-recipes.js` | Recetas de cada legendaria (árbol de la Forja Mística) | generador de recetas (MIG-2c) |
| `js/legendary-precursors.js` | Recetas de los precursores | generador de precursores (MIG-2d) |

Hay que regenerarlos cuando ArenaNet agrega legendarias (una expansión nueva, un set nuevo de armadura, una reliquia…). Hasta octubre de 2026 los scripts vivían solo en el legado de QwenPaw (`gw2-wallet-agents/js/_*.py`) y DEV no podía regenerar nada (RSK-018). Se migran acá en BL-043, uno por micro-ciclo y siempre con tests.

## Estado de la migración

| Paso | Script | Estado |
|------|--------|--------|
| 1. Bajar el catálogo crudo | `fetch_legendary_items.py` | ✅ MIG-2a |
| 2. Bajar precios del Bazar | `fetch_thematic_prices.py` | ⏳ MIG-2b |
| 3. Armar `legendary-data.js` | `build_legendary_data.py` | ⏳ MIG-2b |
| 4. Recetas | generador de recetas | ⏳ MIG-2c |
| 5. Precursores | generador de precursores | ⏳ MIG-2d |

## Paso 1 — bajar el catálogo

```bash
python3 tools/legendary/fetch_legendary_items.py            # usa la caché si existe
python3 tools/legendary/fetch_legendary_items.py --refresh  # pide todo de nuevo a la API
```

- Pide `/v2/legendaryarmory` (la lista de ids) y `/v2/items` en inglés y en español, de a 200 ids (la API rechaza más).
- Escribe `tools/legendary/.work/legendary_items_full.json`: `{id: {id, name_en, name_es, icon, type, details}}`.
- Guarda cada respuesta cruda en `tools/legendary/.work/raw_cache/`. Con la caché completa no sale a la red.
- Si un id pedido no vuelve, **falla** (`FetchError`) y no escribe nada: un catálogo incompleto es peor que ninguno.

Opciones: `--refresh` (ignora la caché), `--offline` (nunca sale a la red: si falta algo, falla), `--cache-dir <dir>` y `--out <archivo>`.

No necesita token ni API key: los endpoints son públicos.

## Qué se versiona y qué no

- **Se versiona:** los scripts, sus tests y los `.js` generados en `js/`.
- **No se versiona:** `tools/legendary/.work/` (caché y snapshot). Si se versionara el snapshot, dentro de seis meses el build "funcionaría" y devolvería el catálogo viejo. Se regenera desde la API.

## Tests

```bash
node --test tests/legendary-fetch.test.cjs
```

Corren sin red: arman una caché de prueba en un directorio temporal y usan `--offline`. Necesitan `python3` (viene instalado en los runners de GitHub Actions).

## Para tener en cuenta

- La API de GW2 permite 300 pedidos por minuto por IP; el script hace 3 por corrida para 206 legendarias (ver `docs/GW2-API-HECHOS.md`).
- El clasificador de generación y expansión del legado (`infer_gex`) solo conoce Core, HoT, PoF, IBS y EoD. Las expansiones nuevas (Secrets of the Obscure, Janthir Wilds, Visions of Eternity) hoy se corrigen al mostrar el catálogo, en `js/render-catologo.js` (BL-046). Al migrar el build (MIG-2b) esa regla tiene que quedar en un solo lugar.
