#!/usr/bin/env python3
"""
tools/legendary/fetch_legendary_items.py — Paso 1: bajar el catálogo crudo.

Migrado del legado de QwenPaw (gw2-wallet-agents, js/_fetch_legendary_items.py,
blob 6409c472) en MIG-2a (BL-043). Cambios respecto del original:
  - vive en tools/legendary/ y escribe en tools/legendary/.work/ (no versionado);
  - --offline: si falta algo en la caché, falla con FetchError en vez de salir a
    la red (lo usan los tests: en CI no hay que depender de la API);
  - --cache-dir es un argumento normal, no un truco con globals().

Produce `.work/legendary_items_full.json`, la entrada de build_legendary_data.py
(MIG-2b). La forma es {id_str: {id, name_en, name_es, icon, type, details}}.

POR QUÉ EL SNAPSHOT NO SE VERSIONA: si se versionara, dentro de 6 meses el build
"funcionaría" y produciría el catálogo viejo. Se regenera desde la API.

ENDPOINTS (públicos, sin token):
  /v2/legendaryarmory         -> lista de ids (206 al 2026-10-02)
  /v2/items?ids=...           -> datos en inglés (máximo 200 ids por pedido)
  /v2/items?ids=...&lang=es   -> datos en español

CACHÉ PRIMERO: cada respuesta cruda se guarda en .work/raw_cache/. Sin red, se
repite igual; con --refresh se vuelve a pedir todo.

Uso:
  python3 tools/legendary/fetch_legendary_items.py            # caché primero
  python3 tools/legendary/fetch_legendary_items.py --refresh  # todo de nuevo
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
WORK_DIR = os.path.join(HERE, ".work")
OUTPUT_FILE = os.path.join(WORK_DIR, "legendary_items_full.json")
CACHE_DIR = os.path.join(WORK_DIR, "raw_cache")
API_BASE = "https://api.guildwars2.com/v2"
UA = "gw2-legendary-data-builder/1.1 (Boveda del Gato Negro)"

# La API acepta como máximo 200 ids por pedido (206 en una URL -> HTTP 400).
BATCH_SIZE = 200
RATE_SLEEP = 0.2  # cortesía: el límite real es 300 pedidos por minuto por IP


class FetchError(RuntimeError):
    """Fallo de red o forma inesperada. Distinto de 'no hay datos'."""


class Fetcher:
    def __init__(self, cache_dir=CACHE_DIR, refresh=False, offline=False, sleep=RATE_SLEEP):
        self.cache_dir = cache_dir
        self.refresh = refresh
        self.offline = offline
        self.sleep = sleep

    def _get(self, url, timeout=60):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def cached(self, name, url):
        """Caché primero: si la respuesta está en disco y no se pide refresh, no hay red."""
        path = os.path.join(self.cache_dir, name)
        if not self.refresh and os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        if self.offline:
            raise FetchError(f"sin red (--offline) y falta {name} en {self.cache_dir} (pedido: {url})")
        data = self._get(url)
        os.makedirs(self.cache_dir, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        if self.sleep:
            time.sleep(self.sleep)
        return data

    def armory(self):
        """Ids del catálogo. /v2/legendaryarmory devuelve la lista entera."""
        data = self.cached("armory.json", f"{API_BASE}/legendaryarmory")
        if not isinstance(data, list):
            raise FetchError(f"/v2/legendaryarmory: se esperaba una lista, vino {type(data).__name__}")
        return [int(i) for i in data]

    def items(self, ids, lang):
        """Datos de /v2/items para `ids`, en lotes de 200, indexados por id.

        Un id pedido que no vuelve es un FALLO de este script, no una baja del
        catálogo: si GW2 saca una legendaria, /v2/legendaryarmory deja de
        listarla y el id ni se pide.
        """
        tag = "en" if lang == "en" else "es"
        suffix = "" if lang == "en" else f"&lang={lang}"
        out = {}
        for n, i in enumerate(range(0, len(ids), BATCH_SIZE), start=1):
            batch = ids[i:i + BATCH_SIZE]
            q = ",".join(str(x) for x in batch)
            data = self.cached(f"items-{tag}-{n}.json", f"{API_BASE}/items?ids={q}{suffix}")
            if not isinstance(data, list):
                raise FetchError(f"/v2/items?lang={lang} lote {n}: se esperaba una lista, "
                                 f"vino {type(data).__name__}")
            for entry in data:
                if isinstance(entry, dict) and "id" in entry:
                    out[int(entry["id"])] = entry
        faltan = [i for i in ids if i not in out]
        if faltan:
            raise FetchError(f"lang={lang}: {len(faltan)} de {len(ids)} ids pedidos no volvieron. "
                             f"Primeros: {faltan[:10]}")
        return out


def build_snapshot(ids, en, es):
    """La forma EXACTA que consume build_legendary_data.py."""
    snap = {}
    for i in ids:
        e = en[i]
        s = es.get(i, {})
        snap[str(i)] = {
            "id": i,
            "name_en": e.get("name", ""),
            "name_es": s.get("name", ""),
            "icon": e.get("icon", ""),
            "type": e.get("type", ""),
            "details": e.get("details") or {},
        }
    return snap


def _arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return default


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    out_path = _arg("--out", OUTPUT_FILE)
    fetcher = Fetcher(
        cache_dir=_arg("--cache-dir", CACHE_DIR),
        refresh="--refresh" in sys.argv,
        offline="--offline" in sys.argv,
        sleep=0 if "--offline" in sys.argv else RATE_SLEEP,
    )

    ids = fetcher.armory()
    print(f"Legendary Armory: {len(ids)} ids")
    en = fetcher.items(ids, "en")
    es = fetcher.items(ids, "es")
    print(f"  items EN: {len(en)}   items ES: {len(es)}")

    snap = build_snapshot(ids, en, es)
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(snap, f, indent=2, ensure_ascii=False)

    sin_es = sum(1 for v in snap.values() if not v["name_es"])
    print(f"Snapshot: {len(snap)} items -> {out_path}")
    if sin_es:
        print(f"  AVISO: {sin_es} sin nombre en español (el build usa el inglés)")
    print("  Siguiente: python3 tools/legendary/build_legendary_data.py --with-prices")


if __name__ == "__main__":
    try:
        main()
    except FetchError as exc:
        # El nombre de la clase va en el mensaje: así un fallo CONTROLADO se
        # distingue de un crash (los dos salen con código distinto de 0).
        print(f"FetchError: {exc}", file=sys.stderr)
        sys.exit(1)
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as exc:
        print(f"NetworkError: {exc}", file=sys.stderr)
        sys.exit(1)
