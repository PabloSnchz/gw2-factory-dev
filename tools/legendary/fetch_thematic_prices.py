#!/usr/bin/env python3
"""
tools/legendary/fetch_thematic_prices.py — Paso 2: precios del Bazar.

Migrado del legado de QwenPaw (gw2-wallet-agents, js/_fetch_thematic_prices.py,
blob c0dba056) en MIG-2b (BL-043). Cambios respecto del original:
  - los precios se piden de nuevo en cada corrida: el original los guardaba
    para siempre y nunca los actualizaba (un precio de caché eterna miente);
  - un error de red ya no se traga en silencio (antes devolvía [] y el build
    marcaba esas legendarias como "no se venden");
  - --offline reutiliza las respuestas crudas guardadas (lo usan los tests).

Lee `.work/legendary_items_full.json` (paso 1) y escribe
`.work/legendary_prices.json`: {id_str: {buy, sell, buy_listings,
sell_listings, whitelisted}}. Solo aparecen las legendarias que se venden en el
Bazar; las ligadas a la cuenta no tienen precio y el build las marca así.

ENDPOINT (público, sin token):
  /v2/commerce/prices?ids=...  (máximo 200 ids; si ninguno se vende, 404)

Uso:
  python3 tools/legendary/fetch_thematic_prices.py
"""
import json
import os
import sys
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_legendary_items import (  # noqa: E402
    API_BASE, BATCH_SIZE, CACHE_DIR, RATE_SLEEP, WORK_DIR, FetchError, Fetcher, _arg,
)

INPUT_FILE = os.path.join(WORK_DIR, "legendary_items_full.json")
OUTPUT_FILE = os.path.join(WORK_DIR, "legendary_prices.json")


def fetch_prices(fetcher, ids):
    """Precios de /v2/commerce/prices para `ids`, de a 200. Indexado por id (str)."""
    prices = {}
    for n, i in enumerate(range(0, len(ids), BATCH_SIZE), start=1):
        batch = ids[i:i + BATCH_SIZE]
        q = ",".join(str(x) for x in batch)
        try:
            data = fetcher.cached(f"prices-{n}.json", f"{API_BASE}/commerce/prices?ids={q}")
        except urllib.error.HTTPError as exc:
            # 404 = ninguno de los ids del lote se vende: no es un error.
            if exc.code != 404:
                raise
            data = []
        if not isinstance(data, list):
            raise FetchError(f"/v2/commerce/prices lote {n}: se esperaba una lista, "
                             f"vino {type(data).__name__}")
        for entry in data:
            if not isinstance(entry, dict) or "id" not in entry:
                continue
            buys = entry.get("buys") or {}
            sells = entry.get("sells") or {}
            prices[str(entry["id"])] = {
                "buy": buys.get("unit_price", 0),
                "sell": sells.get("unit_price", 0),
                "buy_listings": buys.get("quantity", 0),
                "sell_listings": sells.get("quantity", 0),
                "whitelisted": entry.get("whitelisted", False),
            }
    return prices


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    input_path = _arg("--input", INPUT_FILE)
    out_path = _arg("--out", OUTPUT_FILE)
    offline = "--offline" in sys.argv
    fetcher = Fetcher(
        cache_dir=_arg("--cache-dir", CACHE_DIR),
        refresh=not offline,  # los precios cambian: siempre de nuevo, salvo sin red
        offline=offline,
        sleep=0 if offline else RATE_SLEEP,
    )

    if not os.path.exists(input_path):
        raise FetchError(f"falta {input_path}: primero correr fetch_legendary_items.py")
    with open(input_path, "r", encoding="utf-8") as f:
        items = json.load(f)
    ids = [v["id"] for v in items.values() if v.get("name_en")]
    print(f"Precios del Bazar para {len(ids)} legendarias")

    prices = fetch_prices(fetcher, ids)
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(prices, f, indent=2, ensure_ascii=False, sort_keys=True)

    print(f"  {len(prices)} se venden en el Bazar; {len(ids) - len(prices)} ligadas a la cuenta")
    print(f"  -> {out_path}")
    print("  Siguiente: python3 tools/legendary/build_legendary_data.py --with-prices")


if __name__ == "__main__":
    try:
        main()
    except FetchError as exc:
        print(f"FetchError: {exc}", file=sys.stderr)
        sys.exit(1)
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as exc:
        print(f"NetworkError: {exc}", file=sys.stderr)
        sys.exit(1)
