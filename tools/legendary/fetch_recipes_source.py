#!/usr/bin/env python3
"""
tools/legendary/fetch_recipes_source.py — Paso 4: la fuente de las recetas.

Las recetas de la Armería (js/legendary-recipes.js y js/legendary-precursors.js)
salen de `data/CraftyLegend/recipes.json` del proyecto abierto crafty_legend
(https://github.com/PieOrCake/crafty_legend, de PieOrCake, licencia MIT). La API
de GW2 no publica las recetas de la Forja Mística, y ese archivo las mantiene a
mano y verificadas contra la wiki.

El legado de QwenPaw lo usaba con otro nombre (tools/cl_recipes.json) y nunca lo
versionó ni dejó dicho de dónde salía. Se encontró en MIG-2c (BL-043): el commit
`a24d244` (2026-09-17) reproduce las 206 entradas de js/legendary-recipes.js sin
una diferencia.

FIJADO A UN COMMIT: se baja siempre ese commit y se compara la huella (blob SHA de
git) del archivo. Si alguien cambia el archivo en ese commit, o la descarga llega
rota, el script falla. Para actualizar las recetas se cambia el commit A
PROPÓSITO (--commit y --blob, o las constantes de abajo) y se revisa qué cambió.

Uso:
  python3 tools/legendary/fetch_recipes_source.py
  python3 tools/legendary/fetch_recipes_source.py --commit <sha> --blob <sha>   # actualizar
  python3 tools/legendary/fetch_recipes_source.py --from-file recipes.json      # sin red
"""
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
WORK_DIR = os.path.join(HERE, ".work")
OUTPUT_FILE = os.path.join(WORK_DIR, "recipes_source.json")

SOURCE_REPO = "PieOrCake/crafty_legend"
SOURCE_PATH = "data/CraftyLegend/recipes.json"
SOURCE_COMMIT = "a24d24411f8e4cd49755c85e287758d993a07ec9"   # 2026-09-17, 634 recetas
SOURCE_BLOB = "551cedfaa257f7bb3c7b4aa20509121202d2e3fd"
UA = "gw2-legendary-data-builder/1.1 (Boveda del Gato Negro)"

REQUIRED_RECIPE_KEYS = ("output_id", "type", "ingredients")
REQUIRED_ING_KEYS = ("item_id", "count", "name")


class SourceError(RuntimeError):
    """La fuente no se pudo bajar, no es la esperada o no tiene la forma esperada."""


def git_blob_sha(data):
    """Huella de git de un archivo: la misma que muestra GitHub como 'sha'."""
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def source_url(commit):
    return f"https://raw.githubusercontent.com/{SOURCE_REPO}/{commit}/{SOURCE_PATH}"


def download(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def validate(data):
    """Devuelve el JSON si tiene la forma que consumen los builds; si no, SourceError."""
    try:
        obj = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, ValueError) as exc:
        raise SourceError(f"la fuente no es JSON válido: {exc}")
    recipes = obj.get("recipes") if isinstance(obj, dict) else None
    if not isinstance(recipes, list) or not recipes:
        raise SourceError("la fuente no tiene una lista 'recipes' con datos")
    seen = set()
    for n, r in enumerate(recipes):
        falta = [k for k in REQUIRED_RECIPE_KEYS if k not in r]
        if falta:
            raise SourceError(f"receta {n}: faltan {', '.join(falta)}")
        out = str(r["output_id"])
        if out in seen:
            raise SourceError(f"dos recetas para el mismo item {out}: no hay forma de elegir")
        seen.add(out)
        for ing in r["ingredients"]:
            falta = [k for k in REQUIRED_ING_KEYS if k not in ing]
            if falta:
                raise SourceError(f"receta de {out}: un ingrediente no tiene {', '.join(falta)}")
    return obj


def _arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return default


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    commit = _arg("--commit", SOURCE_COMMIT)
    # Con un commit distinto del fijado, la huella hay que darla explícita.
    blob = _arg("--blob", SOURCE_BLOB if commit == SOURCE_COMMIT else None)
    if not blob:
        raise SourceError("--commit distinto del fijado necesita --blob <sha> (la huella del archivo en ese commit)")
    out_path = _arg("--out", OUTPUT_FILE)
    from_file = _arg("--from-file")

    if from_file:
        with open(from_file, "rb") as f:
            data = f.read()
        origen = from_file
    else:
        origen = source_url(commit)
        data = download(origen)

    real = git_blob_sha(data)
    if real != blob:
        raise SourceError(f"la huella no coincide: esperada {blob}, llegó {real} ({origen})")
    obj = validate(data)

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(data)
    tipos = {}
    for r in obj["recipes"]:
        tipos[r["type"]] = tipos.get(r["type"], 0) + 1
    print(f"Fuente de recetas: {len(obj['recipes'])} recetas "
          f"({', '.join(f'{k}={v}' for k, v in sorted(tipos.items()))})")
    print(f"  crafty_legend @ {commit[:7]}, huella {real[:8]} verificada -> {out_path}")
    print("  Siguiente: python3 tools/legendary/build_legendary_recipes.py")


if __name__ == "__main__":
    try:
        main()
    except SourceError as exc:
        print(f"SourceError: {exc}", file=sys.stderr)
        sys.exit(1)
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as exc:
        print(f"NetworkError: {exc}", file=sys.stderr)
        sys.exit(1)
