#!/usr/bin/env python3
"""
tools/legendary/build_legendary_precursors.py — Paso 6: armar js/legendary-precursors.js.

Migrado del legado de QwenPaw (gw2-wallet-agents, js/_build_legendary_precursors.py,
blob 93eecdd0) en MIG-2d (BL-043). Las entradas (BY) salen idénticas a las del
archivo actual (tests/legendary-build-precursors.test.cjs). Cambios:
  - la fuente es .work/recipes_source.json (fetch_recipes_source.py, crafty_legend
    fijado por huella), no un tools/cl_recipes.json sin origen;
  - --source, --catalog y --out, para probarlo sin tocar los archivos servidos;
  - los ids del catálogo se pasan como argumento (el legado usaba una variable
    global que solo se llenaba desde main());
  - errores como BuildError con código de salida 1, no SystemExit con texto suelto.

QUÉ ES ESTE ARCHIVO: lo que hay DEBAJO de cada legendaria del catálogo, bajando el
árbol de fabricación: piezas intermedias, precursores y materiales base. Está
separado de js/legendary-recipes.js porque casi nadie abre un árbol: se carga
recién cuando se abre uno (decisión de Pablo del 2026-10-02).

  dataStatus  'recipe'   se fabrica (Forja Mística o disciplina)
              'material' no tiene receta en la fuente: es una hoja del árbol
              'vendor'   se compra a un NPC (sale igual: si faltara, el árbol
                         llegaría a un id desconocido)

LO QUE LA FUENTE NO TIENE, Y NO SE INVENTA
  - Íconos: los resuelve la app en el momento (js/item-icons.js), porque la URL
    lleva el hash del recurso y no se puede adivinar.
  - Nombres en español: la fuente trae solo el inglés.
  - Dos ingredientes vienen con item_id 0 (en 101540 "Relic (any)", cualquier
    reliquia, y en 109686 "Testimony of Castoran Heroics", sin id en la fuente).
    Se conservan con itemId 0 y su nombre: la app no los cuenta contra el
    inventario. Inventar un id daría un total de materiales falso.

Uso:
  python3 tools/legendary/build_legendary_precursors.py
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SOURCE_FILE = os.path.join(HERE, ".work", "recipes_source.json")
CATALOG_FILE = os.path.join(REPO, "js", "legendary-data.js")
OUTPUT_FILE = os.path.join(REPO, "js", "legendary-precursors.js")


class BuildError(RuntimeError):
    pass


def js_str(s):
    return json.dumps("" if s is None else str(s), ensure_ascii=False)


def read_source(path):
    if not os.path.exists(path):
        raise BuildError(f"falta {path}: primero correr fetch_recipes_source.py")
    with open(path, "r", encoding="utf-8") as f:
        recipes = json.load(f).get("recipes", [])
    if not recipes:
        raise BuildError("la fuente no tiene recetas")
    by_output = {}
    for r in recipes:
        iid = int(r["output_id"])
        if iid in by_output:
            raise BuildError(f"la fuente repite la salida {iid}")
        by_output[iid] = r
    return by_output


def read_catalog_ids(path):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    m = re.search(r"var LEGENDARY_CATALOG = (\[.*?\n\]);", src, re.S)
    if not m:
        raise BuildError(f"no encontré 'var LEGENDARY_CATALOG = [...]' en {path}")
    ids = {int(it["id"]) for it in json.loads(m.group(1))}
    if not ids:
        raise BuildError("el catálogo está vacío")
    return ids


def walk(roots, by_output):
    """Todo lo alcanzable desde las raíces. Devuelve (vistos, hojas)."""
    seen = set(roots)
    leaves = set()
    queue = list(roots)
    while queue:
        r = by_output.get(queue.pop())
        if r is None:
            continue
        for ing in r.get("ingredients", []):
            c = int(ing["item_id"])
            if c in seen:
                continue
            seen.add(c)
            if c in by_output:
                queue.append(c)
            else:
                leaves.add(c)
    return seen, leaves


def build(by_output, catalog_ids):
    roots = [i for i in catalog_ids if i in by_output]
    seen, leaves = walk(roots, by_output)

    # Nombre de cada item como ingrediente: el primero que aparece en la fuente.
    ing_name = {}
    for r in by_output.values():
        for ing in r.get("ingredients", []):
            c = int(ing["item_id"])
            if ing.get("name") and c not in ing_name:
                ing_name[c] = ing["name"]

    entries = {}
    counts = {"recipe": 0, "material": 0, "vendor": 0}
    for iid in sorted(i for i in seen if i not in catalog_ids):
        r = by_output.get(iid)
        if r is None:
            entries[iid] = {"name": ing_name.get(iid, ""), "dataStatus": "material", "craftType": "none",
                            "outputCount": 1, "disciplines": [], "isMaterial": True, "ingredients": []}
            counts["material"] += 1
            continue
        kind = r.get("type", "")
        status = "vendor" if kind == "vendor" else "recipe"
        entries[iid] = {
            "name": r.get("name") or ing_name.get(iid, ""),
            "dataStatus": status,
            "craftType": kind,
            "outputCount": int(r.get("output_count", 1)),
            "disciplines": r.get("disciplines", []),
            "isMaterial": True,
            "ingredients": [{"itemId": int(i["item_id"]), "count": int(i.get("count", 1)), "name": i.get("name", "")}
                            for i in r.get("ingredients", [])],
        }
        counts[status] += 1
    return entries, counts, leaves


def verify(entries):
    """Corta el build ante un nombre perdido; devuelve las aristas con id 0.

    El legado además buscaba aristas "huérfanas" (a ids que no están ni acá ni en
    el catálogo). No pueden existir: el recorrido agrega cada ingrediente que
    visita, así que ese chequeo nunca podía fallar y no se migró.
    """
    no_name = [i for i, e in entries.items() if not (e.get("name") or "").strip()]
    if no_name:
        raise BuildError(f"{len(no_name)} entradas sin nombre: {no_name[:10]}")
    return [(iid, ing["name"], ing["count"])
            for iid, e in sorted(entries.items()) for ing in e["ingredients"] if ing["itemId"] == 0]


def entry_line(iid, e):
    ings = ",".join('{ "itemId": %d, "count": %d, "name": %s }' % (i["itemId"], i["count"], js_str(i["name"]))
                    for i in e["ingredients"])
    disc = ",".join(js_str(d) for d in e["disciplines"])
    return ('    "%d": { "name": %s, "dataStatus": "%s", "craftType": "%s", "outputCount": %d, '
            '"disciplines": [%s], "isMaterial": %s, "ingredients": [%s] },'
            % (iid, js_str(e["name"]), e["dataStatus"], e["craftType"], e["outputCount"], disc,
               "true" if e["isMaterial"] else "false", ings))


def build_js(entries, counts, leaves, zero):
    L = [
        "// js/legendary-precursors.js - lo que hay debajo de cada legendaria del catalogo.",
        "// NO EDITAR A MANO: se genera con",
        "//   python3 tools/legendary/fetch_recipes_source.py",
        "//   python3 tools/legendary/build_legendary_precursors.py",
        "// Ver tools/legendary/README.md.",
        "//",
        "// Recetas: crafty_legend (https://github.com/PieOrCake/crafty_legend),",
        "//   de PieOrCake, licencia MIT.",
        "//",
        "// Se carga BAJO DEMANDA, al abrir un arbol. El contrato de las legendarias",
        "// del catalogo esta en js/legendary-recipes.js.",
        "//",
        "// MEDIDAS",
        "//   entradas totales : %d" % len(entries),
        "//   con receta       : %d" % counts["recipe"],
        "//   materiales base  : %d" % counts["material"],
        "//   vendor (NPC)     : %d" % counts["vendor"],
        "//   hojas totales    : %d" % len(leaves),
        "//",
        "// Sin `icon` (lo resuelve js/item-icons.js) ni `nameEs` (la fuente trae ingles).",
        "//",
        "// ARISTAS SIN ID (%d): itemId 0 no es un item. Se conservan con su nombre" % len(zero),
        "// para que la app no las cuente contra el inventario:",
    ]
    L += ["//     %s  %d x %s" % (p, c, n) for p, n, c in zero]
    L += ["//", "var LegendaryPrecursors = (function(){", "  'use strict';", "  var BY = {"]
    L += [entry_line(i, entries[i]) for i in sorted(entries)]
    L += [
        "  };",
        "  return {",
        "    byItem: BY,",
        "    counts: %s," % json.dumps(counts),
        "    totalItems: %d," % len(entries),
        "    get: function(id){ return BY[String(id)] || null; },",
        "    has: function(id){ return Object.prototype.hasOwnProperty.call(BY, String(id)); }",
        "  };",
        "})();",
        "if (typeof module !== 'undefined' && module.exports) module.exports = LegendaryPrecursors;",
        "if (typeof window !== 'undefined') window.LegendaryPrecursors = LegendaryPrecursors;",
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
    out_path = _arg("--out", OUTPUT_FILE)
    by_output = read_source(_arg("--source", SOURCE_FILE))
    catalog_ids = read_catalog_ids(_arg("--catalog", CATALOG_FILE))
    entries, counts, leaves = build(by_output, catalog_ids)
    zero = verify(entries)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(build_js(entries, counts, leaves, zero))
    print(f"Listo: {len(entries)} precursores -> {out_path}")
    print(f"  recipe={counts['recipe']} material={counts['material']} vendor={counts['vendor']} "
          f"hojas={len(leaves)} aristas sin id={len(zero)}")


if __name__ == "__main__":
    try:
        main()
    except BuildError as exc:
        print(f"BuildError: {exc}", file=sys.stderr)
        sys.exit(1)
