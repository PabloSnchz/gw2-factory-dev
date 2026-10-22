#!/usr/bin/env python3
"""
tools/legendary/build_legendary_data.py — Paso 3: armar js/legendary-data.js.

Migrado del legado de QwenPaw (gw2-wallet-agents, js/_build_legendary_data.py,
blob b2859138) en MIG-2b (BL-043). La clasificación (infer_gex, map_type,
map_subtype) y el orden son los del original: con los datos de hoy reproduce
las 206 legendarias de js/legendary-data.js campo por campo
(tests/legendary-build-data.test.cjs). Cambios:
  - lee de tools/legendary/.work/ y escribe en js/legendary-data.js del repo;
  - --input, --prices, --out y --generated (fecha fija, para tests);
  - el encabezado nombra los scripts nuevos.

EXPANSIONES NUEVAS: infer_gex conoce Core, HoT, PoF, IBS y EoD. Secrets of the
Obscure, Janthir Wilds y Visions of Eternity se corrigen en UN solo lugar,
js/render-catologo.js (BL-046), que pisa `expansion` al mostrar el catálogo.
No se duplican acá: si cambia una regla, cambia en un archivo.

Uso:
  python3 tools/legendary/build_legendary_data.py --with-prices
"""
import json
import os
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
WORK_DIR = os.path.join(HERE, ".work")
INPUT_FILE = os.path.join(WORK_DIR, "legendary_items_full.json")
PRICES_FILE = os.path.join(WORK_DIR, "legendary_prices.json")
OUTPUT_FILE = os.path.join(REPO, "js", "legendary-data.js")

TYPE_ORDER = {"weapon": 0, "armor": 1, "trinket": 2, "back": 3, "upgradecomponent": 4, "relic": 5}

GEN3_ARMOR = ["obsidian", "eikasia", "selachimorpha", "khan-ur"]
GEN2_HOT = ["nevermore", "hope", "astralaria"]
GEN2_POF = ["chuka and champawat", "eureka", "shooshadoo", "claws of the fallen",
            "visions of the risen", "the primer", "the weather"]
GEN2_IBS = ["embers", "frost", "voice of the fallen", "claw of the fallen", "the voice in the mists"]


def infer_gex(item_id, name_en, item_type, details):
    """Generación y expansión. Es una cadena de elif: EL ORDEN IMPORTA.

    Historia (legado, ALERT-ARME-01, 2026-10-02): los 90 items de armadura de
    set de PoF (Glorious/Triumphant Hero's y variantes) y la reliquia, la runa y
    el sigilo salían con generation=null y ningún filtro de la Armería los
    alcanzaba. La regla de sets y las de Relic/UpgradeComponent lo corrigen.
    """
    name = (name_en or "").lower()
    gen = None
    exp = None

    if 30684 <= item_id <= 30704:                      # Gen 1, armas Core
        gen, exp = 1, "Core"
    elif "perfected envoy" in name:                    # Gen 1, armadura de raids (HoT)
        gen, exp = 1, "HoT"
    elif item_id == 77474:                             # The Ascension (PoF, WvW)
        gen, exp = 1, "PoF"
    elif name.startswith("aurene's "):                 # Gen 3, armas de EoD
        gen, exp = 3, "EoD"
    elif any(x in name for x in GEN3_ARMOR):           # Gen 3, armadura de EoD
        gen, exp = 3, "EoD"
    elif item_type == "Armor" and any(x in name for x in ["hero's", "ardent", "calibrated"]) \
            and not any(x in name for x in GEN3_ARMOR):
        # Sets de PvP y WvW de PoF (Glorious/Triumphant Hero's, Ardent, Calibrated).
        gen, exp = 1, "PoF"
    elif item_type == "Weapon" and item_id >= 71383:   # Gen 2
        gen = 2
        if name in GEN2_HOT:
            exp = "HoT"
        elif name in GEN2_POF:
            exp = "PoF"
        elif name in GEN2_IBS:
            exp = "IBS"
        else:
            exp = "HoT" if item_id < 76000 else "PoF"
    elif item_id == 74155:                             # Ad Infinitum
        gen, exp = 2, "HoT"
    elif item_type == "Trinket":
        if any(x in name for x in ["mistforged", "triumphant", "glorious"]):
            gen, exp = 1, "HoT"
        elif "prismatic" in name:
            gen, exp = 1, "PoF"
        else:
            gen, exp = 2, "PoF"
    elif item_type in ("Relic", "UpgradeComponent"):   # reliquia, runa y sigilo
        gen, exp = 3, "EoD"
    elif item_type == "Back":
        if "ad infinitum" in name:
            gen, exp = 2, "HoT"
        else:
            gen, exp = 1, "Core"

    return gen, exp


def map_type(item_type):
    mapping = {"Weapon": "weapon", "Armor": "armor", "Trinket": "trinket", "Back": "back",
               "Relic": "relic", "UpgradeComponent": "upgradecomponent"}
    return mapping.get(item_type, item_type.lower() if item_type else "unknown")


def map_subtype(item_type, details):
    if item_type == "Weapon" and details:
        return (details.get("type") or "").lower()
    if item_type == "Armor" and details:
        a_type = (details.get("type") or "").lower()
        weight = (details.get("weight_class") or "").lower()
        return f"{weight} {a_type}" if weight else a_type
    if item_type == "Trinket" and details:
        return (details.get("type") or "").lower()
    if item_type == "Back":
        return "back"
    return ""


def transform_item(item, prices=None, with_prices=False):
    item_id = item.get("id", 0)
    name_en = item.get("name_en", "")
    item_type = item.get("type", "")
    details = item.get("details") or {}
    gen, exp = infer_gex(item_id, name_en, item_type, details)
    entry = {
        "id": item_id,
        "name": name_en,
        "nameEs": item.get("name_es", "") or name_en,
        "icon": item.get("icon", ""),
        "type": map_type(item_type),
        "subtype": map_subtype(item_type, details),
        "rarity": "Legendary",
        "generation": gen,
        "expansion": exp,
    }
    if with_prices and prices is not None:
        p = prices.get(str(item_id))
        entry["tpSell"] = p.get("sell", 0) if p else 0
        entry["tpBuy"] = p.get("buy", 0) if p else 0
        entry["tpTradeable"] = p is not None
    return entry


def build_items(items_raw, prices=None, with_prices=False):
    items = [transform_item(v, prices, with_prices) for v in items_raw.values() if v.get("name_en")]
    items.sort(key=lambda x: (TYPE_ORDER.get(x["type"], 99), x.get("generation") or 99, x["id"]))
    return items


def build_js(items, with_prices, generated):
    total = len(items)
    counts = {}
    for i in items:
        counts[i["type"]] = counts.get(i["type"], 0) + 1
    sin_gen = sum(1 for i in items if not i.get("generation"))
    sin_exp = sum(1 for i in items if not i.get("expansion"))
    phase = "catálogo + precios del Bazar" if with_prices else "catálogo"

    lines = [
        "/*!",
        " * js/legendary-data.js - Catalogo estatico de legendarias del Armory",
        " * Proyecto: Boveda del Gato Negro (GW2 Wallet Ligero)",
        f" * Version: 1.0.0 ({phase})",
        f" * Generado: {generated}",
        " *",
        f" * Catalogo estatico de {total} legendarias. NO modificar a mano: se genera con",
        " *   python3 tools/legendary/fetch_legendary_items.py",
        " *   python3 tools/legendary/fetch_thematic_prices.py   (opcional)",
        " *   python3 tools/legendary/build_legendary_data.py --with-prices",
        " * Ver tools/legendary/README.md. Consumido por legendary-tracker.js.",
        " *",
        " * Tipos: " + ", ".join(f"{t}={c}" for t, c in sorted(counts.items())),
        " * Expansiones posteriores a EoD (SotO, Janthir Wilds, Visions of Eternity):",
        " *   las corrige js/render-catologo.js al mostrar el catalogo (BL-046).",
    ]
    if sin_gen or sin_exp:
        lines.append(f" * SIN CLASIFICAR: generation=null {sin_gen}/{total}, expansion=null {sin_exp}/{total}")
        lines.append(" *   (agregar la regla en infer_gex() de tools/legendary/build_legendary_data.py)")
    if with_prices:
        tradeable = sum(1 for i in items if i.get("tpTradeable"))
        lines.append(" * Precios del Bazar: tpSell (venta directa), tpBuy (pedido de compra)")
        lines.append(f" *   {tradeable}/{total} se venden en el Bazar (el resto, 0: ligadas a la cuenta)")
    lines += [
        " */",
        "",
        "(function (root) {",
        "  'use strict';",
        "",
        "  var LEGENDARY_CATALOG = " + json.dumps(items, indent=2, ensure_ascii=False) + ";",
        "",
        "  root.LegendaryCatalog = {",
        '    version: "1.0.0",',
        f'    generated: "{generated}",',
        f"    totalItems: {total},",
        "    items: LEGENDARY_CATALOG",
        "  };",
        "",
        f"  console.info('[LegendaryCatalog]', 'Catalogo cargado: {total} items, v1.0.0');",
        "})(typeof window !== 'undefined' ? window : this);",
        "",
    ]
    return "\n".join(lines)


def _arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return default


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    with_prices = "--with-prices" in sys.argv
    input_path = _arg("--input", INPUT_FILE)
    prices_path = _arg("--prices", PRICES_FILE)
    out_path = _arg("--out", OUTPUT_FILE)
    generated = _arg("--generated") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    if not os.path.exists(input_path):
        print(f"BuildError: falta {input_path}: primero correr fetch_legendary_items.py", file=sys.stderr)
        sys.exit(1)
    with open(input_path, "r", encoding="utf-8") as f:
        items_raw = json.load(f)

    prices = None
    if with_prices:
        if not os.path.exists(prices_path):
            # Sin precios, todas saldrían "ligadas a la cuenta": mejor no escribir nada.
            print(f"BuildError: --with-prices y falta {prices_path}: correr fetch_thematic_prices.py",
                  file=sys.stderr)
            sys.exit(1)
        with open(prices_path, "r", encoding="utf-8") as f:
            prices = json.load(f)

    items = build_items(items_raw, prices, with_prices)
    if not items:
        print("BuildError: el snapshot no tiene legendarias", file=sys.stderr)
        sys.exit(1)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(build_js(items, with_prices, generated))

    sin_gen = sum(1 for i in items if not i.get("generation"))
    sin_exp = sum(1 for i in items if not i.get("expansion"))
    print(f"Listo: {len(items)} legendarias -> {out_path}")
    print(f"  Precios: {'sí' if with_prices else 'no'}   Sin clasificar: generation={sin_gen}, expansion={sin_exp}")


if __name__ == "__main__":
    main()
