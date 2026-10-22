#!/usr/bin/env python3
"""
tools/legendary/build_legendary_recipes.py — Paso 5: armar js/legendary-recipes.js.

Migrado del legado de QwenPaw (gw2-wallet-agents, js/_build_legendary_recipes.py,
blob fb02a142) en MIG-2c (BL-043). Las entradas (BY_ITEM) salen idénticas a las
del archivo actual (tests/legendary-build-recipes.test.cjs). Cambios:
  - la fuente es .work/recipes_source.json (fetch_recipes_source.py), no un
    tools/cl_recipes.json que nadie sabía de dónde salía;
  - --source, --catalog, --out y --generated (fecha fija, para tests);
  - los textos que ve el jugador ya no nombran archivos internos;
  - el encabezado cuenta lo que hay, no la historia del legado.

QUÉ ES ESTE ARCHIVO: el contrato de fabricación de las legendarias del CATÁLOGO
(js/legendary-data.js). Lista a TODAS, tengan receta o no: una clave ausente es
un id desconocido, nunca "no sé". Lo que hay debajo de cada pieza (precursores y
materiales) está en js/legendary-precursors.js, que se carga al abrir un árbol.

  craftType   'mystic_forge' | 'crafting' | 'none'
  dataStatus  'recipe' | 'no_recipe' | 'placeholder'

Uso:
  python3 tools/legendary/build_legendary_recipes.py
"""
import json
import os
import re
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SOURCE_FILE = os.path.join(HERE, ".work", "recipes_source.json")
CATALOG_FILE = os.path.join(REPO, "js", "legendary-data.js")
OUTPUT_FILE = os.path.join(REPO, "js", "legendary-recipes.js")

# El objeto que GW2 crea al desbloquear una legendaria: está en el Armory pero no
# es una pieza. Declarado acá (y no filtrado en silencio) para que, si GW2 le
# cambia el id o el nombre, el build lo avise.
PLACEHOLDER_ID = 95093
PLACEHOLDER_NAME = "Legendary Equipment Unlocked!"

# Textos que ve el jugador en la Armería (legendary-tracker.js los muestra).
NO_RECIPE_NOTE = (
    "No hay receta publicada para esta pieza: se consigue por otra vía "
    "(colección, logro o vendedor)."
)
PLACEHOLDER_NOTE = (
    "Marcador de cuenta que GW2 crea al desbloquear una legendaria. "
    "No es una pieza que se pueda fabricar."
)

# Tipos de receta de la fuente que pueden tener las legendarias del catálogo.
# 'vendor' no: si una legendaria apareciera como compra a un NPC, el build falla
# en vez de inventarle un tipo.
SOURCE_TYPE_TO_CRAFT = {"mystic_forge": "mystic_forge", "crafting": "crafting"}


class BuildError(RuntimeError):
    pass


def read_catalog(path):
    """Catálogo servido: id -> entrada de js/legendary-data.js."""
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    m = re.search(r"var LEGENDARY_CATALOG = (\[.*?\n\]);", src, re.S)
    if not m:
        raise BuildError(f"no encontré 'var LEGENDARY_CATALOG = [...]' en {path}")
    try:
        items = json.loads(m.group(1))
    except ValueError as exc:
        raise BuildError(f"el catálogo no es JSON válido ({exc})")
    if not items:
        raise BuildError("el catálogo está vacío")
    cat = {}
    for it in items:
        iid = int(it["id"])
        if iid in cat:
            raise BuildError(f"el catálogo repite el id {iid}")
        cat[iid] = it
    return cat


def read_source(path):
    with open(path, "r", encoding="utf-8") as f:
        recipes = json.load(f)["recipes"]
    by_output = {}
    for r in recipes:
        out = int(r["output_id"])
        if out in by_output:
            raise BuildError(f"dos recetas para el item {out}: hace falta una regla, no 'la primera que aparezca'")
        by_output[out] = r
    return recipes, by_output


def build_entries(catalog, by_output):
    entries = {}
    counts = {"mystic_forge": 0, "crafting": 0, "none": 0}
    status = {"recipe": 0, "no_recipe": 0, "placeholder": 0}
    for item_id in sorted(catalog):
        meta = catalog[item_id]
        r = by_output.get(item_id)
        if r is None:
            kind = "placeholder" if item_id == PLACEHOLDER_ID else "no_recipe"
            entries[item_id] = {
                "craftType": "none", "dataStatus": kind,
                "name": meta.get("name", PLACEHOLDER_NAME if kind == "placeholder" else ""),
                "nameEs": meta.get("nameEs", ""), "icon": meta.get("icon", ""),
                "isMaterial": False, "ingredients": [],
            }
            status[kind] += 1
            counts["none"] += 1
            continue
        craft_type = SOURCE_TYPE_TO_CRAFT.get(r.get("type"))
        if craft_type is None:
            raise BuildError(f"la legendaria {item_id} tiene una receta de tipo {r.get('type')!r}, "
                             f"que el contrato no conoce")
        entries[item_id] = {
            "craftType": craft_type, "dataStatus": "recipe",
            "recipeId": int(r["output_id"]),
            "outputCount": r.get("output_count", 1),
            "disciplines": r.get("disciplines", []),
            "name": meta.get("name", ""), "nameEs": meta.get("nameEs", ""), "icon": meta.get("icon", ""),
            "isMaterial": True,
            # La fuente trae los ids como texto; en la app se comparan con ===.
            "ingredients": [{"itemId": int(i["item_id"]), "count": i["count"], "name": i["name"]}
                            for i in r.get("ingredients", [])],
        }
        counts[craft_type] += 1
        status["recipe"] += 1
    sin_nombre = [i for i, e in entries.items() if not (e.get("name") or "").strip()]
    if sin_nombre:
        raise BuildError(f"{len(sin_nombre)} entradas sin nombre ({sin_nombre[:10]}): "
                         f"¿cambió la forma de legendary-data.js?")
    return entries, counts, status


def js_str(s):
    return json.dumps(s, ensure_ascii=False)


def entry_line(item_id, e):
    if e["dataStatus"] == "recipe":
        ings = ", ".join('{ "itemId": %d, "count": %s, "name": %s }' % (i["itemId"], json.dumps(i["count"]), js_str(i["name"]))
                         for i in e["ingredients"])
        disc = ", ".join(js_str(d) for d in e["disciplines"])
        return ('    "%d": { "craftType": "%s", "dataStatus": "recipe", "recipeId": %d, "outputCount": %s, '
                '"disciplines": [%s], "name": %s, "nameEs": %s, "icon": %s, "isMaterial": %s, "ingredients": [%s] },'
                % (item_id, e["craftType"], e["recipeId"], json.dumps(e["outputCount"]), disc,
                   js_str(e["name"]), js_str(e["nameEs"]), js_str(e["icon"]), json.dumps(e["isMaterial"]), ings))
    return ('    "%d": { "craftType": "none", "dataStatus": "%s", "name": %s, "nameEs": %s, "icon": %s, '
            '"isMaterial": %s, "ingredients": [] },'
            % (item_id, e["dataStatus"], js_str(e["name"]), js_str(e["nameEs"]), js_str(e["icon"]),
               json.dumps(e["isMaterial"])))


def build_js(entries, counts, status, source_counts, generated):
    total = len(entries)
    c, s = counts, status
    L = [
        "/*!",
        f" * js/legendary-recipes.js - Contrato de fabricacion de las {total} legendarias del catalogo",
        " * Proyecto: Boveda del Gato Negro (GW2 Wallet Ligero)",
        " * Version: 1.0.0",
        f" * Generado: {generated}",
        " *",
        " * NO modificar a mano: se genera con",
        " *   python3 tools/legendary/fetch_recipes_source.py",
        " *   python3 tools/legendary/build_legendary_recipes.py",
        " * Ver tools/legendary/README.md.",
        " *",
        " * Recetas: crafty_legend (https://github.com/PieOrCake/crafty_legend),",
        " *   de PieOrCake, licencia MIT. La API de GW2 no publica las de la Forja.",
        f" * Fuente: {source_counts['total']} recetas ("
        + ", ".join(f"{k}={v}" for k, v in sorted(source_counts["por_tipo"].items())) + ")",
        " *",
        " * craftType   'mystic_forge' | 'crafting' | 'none'",
        " * dataStatus  'recipe' | 'no_recipe' | 'placeholder'",
        f" *   craftType   mystic_forge={c['mystic_forge']}  crafting={c['crafting']}  none={c['none']}",
        f" *   dataStatus  recipe={s['recipe']}  no_recipe={s['no_recipe']}  placeholder={s['placeholder']}",
        " *",
        f" * Lista las {total} legendarias, tengan receta o no: una clave ausente es un id",
        " * desconocido. Lo que hay debajo de cada pieza esta en js/legendary-precursors.js.",
        " */",
        "",
        "(function (root) {",
        "  'use strict';",
        "",
        "  var CRAFT_TYPE = { MYSTIC_FORGE: 'mystic_forge', CRAFTING: 'crafting', NONE: 'none' };",
        "  var DATA_STATUS = { RECIPE: 'recipe', NO_RECIPE: 'no_recipe', PLACEHOLDER: 'placeholder' };",
        "",
        "  var NO_RECIPE_NOTE = " + js_str(NO_RECIPE_NOTE) + ";",
        "  var PLACEHOLDER_NOTE = " + js_str(PLACEHOLDER_NOTE) + ";",
        "  var PLACEHOLDER = { id: %d, name: %s, note: PLACEHOLDER_NOTE };" % (PLACEHOLDER_ID, js_str(PLACEHOLDER_NAME)),
        "",
        "  // Claves: id del catalogo. get() normaliza con Number().",
        "  var BY_ITEM = {",
    ]
    L += [entry_line(i, entries[i]) for i in sorted(entries)]
    L += [
        "  };",
        "",
        "  function get(itemId) {",
        "    var e = BY_ITEM[Number(itemId)];",
        "    return e === undefined ? null : e;",
        "  }",
        "",
        "  function describe(itemId) {",
        "    var e = get(itemId);",
        "    if (!e) return null;",
        "    if (e.dataStatus === 'placeholder') return PLACEHOLDER_NOTE;",
        "    if (e.dataStatus === 'no_recipe') return NO_RECIPE_NOTE;",
        "    if (e.craftType === 'crafting') {",
        "      var d = e.disciplines && e.disciplines.length ? e.disciplines.join(', ') : 'disciplina';",
        "      return 'Se craftea con ' + d + '.';",
        "    }",
        "    return 'Se hace en la Forja Mística.';",
        "  }",
        "",
        "  root.LegendaryRecipes = {",
        "    version: '1.0.0',",
        f"    generated: {js_str(generated)},",
        f"    totalItems: {total},",
        "    craftType: CRAFT_TYPE,",
        "    dataStatus: DATA_STATUS,",
        "    placeholder: PLACEHOLDER,",
        "    noRecipeNote: NO_RECIPE_NOTE,",
        "    counts: {",
        f"      craftType: {{ mystic_forge: {c['mystic_forge']}, crafting: {c['crafting']}, none: {c['none']} }},",
        f"      dataStatus: {{ recipe: {s['recipe']}, no_recipe: {s['no_recipe']}, placeholder: {s['placeholder']} }}",
        "    },",
        "    byItem: BY_ITEM,",
        "    get: get,",
        "    describe: describe",
        "  };",
        "",
        f"  console.info('[LegendaryRecipes]', 'Contrato cargado: {total} items, ' +",
        f"    'mystic_forge={c['mystic_forge']} crafting={c['crafting']} none={c['none']}');",
        "})(typeof window !== 'undefined' ? window : this);",
        "",
    ]
    return "\n".join(L)


def _arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return default


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    source = _arg("--source", SOURCE_FILE)
    catalog_path = _arg("--catalog", CATALOG_FILE)
    out_path = _arg("--out", OUTPUT_FILE)
    generated = _arg("--generated") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    if not os.path.exists(source):
        raise BuildError(f"falta {source}: primero correr fetch_recipes_source.py")

    recipes, by_output = read_source(source)
    catalog = read_catalog(catalog_path)
    if PLACEHOLDER_ID not in catalog:
        print(f"AVISO: el catálogo ya no tiene el marcador {PLACEHOLDER_ID} ({PLACEHOLDER_NAME!r}). "
              f"Revisar si GW2 lo cambió.")
    entries, counts, status = build_entries(catalog, by_output)
    tipos = {}
    for r in recipes:
        tipos[r.get("type")] = tipos.get(r.get("type"), 0) + 1

    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(build_js(entries, counts, status, {"total": len(recipes), "por_tipo": tipos}, generated))
    print(f"Listo: {len(entries)} legendarias -> {out_path}")
    print(f"  craftType  mystic_forge={counts['mystic_forge']} crafting={counts['crafting']} none={counts['none']}")
    print(f"  dataStatus recipe={status['recipe']} no_recipe={status['no_recipe']} placeholder={status['placeholder']}")


if __name__ == "__main__":
    try:
        main()
    except BuildError as exc:
        print(f"BuildError: {exc}", file=sys.stderr)
        sys.exit(1)
