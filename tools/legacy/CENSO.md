# Censo de los tests del legado contra DEV

Generado por `tools/legacy/census.cjs` en CI (`.github/workflows/legacy-tests.yml`). No editar a mano.

- Fecha: 2026-10-22T14:02:24.134Z
- Legado: gw2-wallet-agents @ `eb91075`
- Archivos: 88
- En el legado: VERDE 85 · ROJO 3 · MIENTE 0 · TIEMPO 0 · DEPENDENCIA 0
- En DEV: VERDE 73 · ROJO 15 · MIENTE 0 · TIEMPO 0 · DEPENDENCIA 0

Estados: VERDE sale con 0 y sin FAIL · ROJO sale con error · MIENTE sale con 0 pero imprime FAIL · TIEMPO no terminó · DEPENDENCIA le falta un paquete.

| Archivo | KB | Legado | DEV | OK/FAIL en DEV | Archivos de la app distintos en DEV | Faltan en DEV |
|---|---|---|---|---|---|---|
| `alert84.leyenda-estado-honesto.test.js` | 15.7 | VERDE | VERDE | 40/0 | index.html, js/legendary-tracker.js, js/router.js | — |
| `alert84.t3t4-registro.test.js` | 18.2 | VERDE | VERDE | 29/0 | index.html, js/legendary-tracker.js, js/render-catologo.js | — |
| `alert86.censo-clasificacion.test.js` | 6.9 | VERDE | ROJO | 0/0 | index.html, js/legendary-tracker.js, js/router.js | js/homestead-tracker.js |
| `arma-2-3-cola-contrato.test.js` | 22.6 | VERDE | ROJO | 18/3 | js/legendary-tracker.js, js/legendary-tree-ui.js, js/render-catologo.js | — |
| `armeria-alert-01-clasificacion.test.js` | 12.1 | VERDE | ROJO | 0/0 | — | — |
| `armeria-arbol-premisa.test.js` | 7.0 | VERDE | VERDE | 0/0 | — | — |
| `armeria-cola.test.js` | 9.6 | VERDE | VERDE | 0/0 | js/legendary-tracker.js | — |
| `armeria-filtros-cola-card.test.js` | 18.7 | VERDE | ROJO | 0/0 | js/legendary-tracker.js, js/render-catologo.js | — |
| `armeria-item-icons.test.js` | 24.0 | VERDE | VERDE | 0/0 | js/api-gw2.js, js/legendary-tree-ui.js | — |
| `armeria-modal-iconos-nombre.test.js` | 17.5 | VERDE | ROJO | 0/1 | js/api-gw2.js, js/legendary-tracker.js, js/legendary-tree-ui.js | — |
| `armeria-motor-arbol.test.js` | 8.8 | VERDE | VERDE | 0/0 | — | — |
| `armeria-ui-arbol.test.js` | 18.9 | VERDE | ROJO | 1/0 | js/legendary-tracker.js, js/legendary-tree-ui.js | — |
| `commerce-delivery.smoke.js` | 4.5 | VERDE | VERDE | 8/0 | — | — |
| `hb101-t12-camino.test.js` | 21.4 | VERDE | VERDE | 23/0 | — | — |
| `hb104-confirm-antes-de-escribir.test.js` | 14.4 | VERDE | VERDE | 19/0 | — | — |
| `hb105-perms-persistidos.test.js` | 8.7 | VERDE | VERDE | 11/0 | — | — |
| `hb106-censo-latch.test.js` | 11.0 | VERDE | VERDE | 13/0 | — | — |
| `hb106-t13-invariante.test.js` | 13.7 | VERDE | VERDE | 22/0 | js/raid-tracker.js, js/router.js, js/strike-tracker.js | — |
| `hb109-cache-drop-token.test.js` | 13.1 | VERDE | VERDE | 33/0 | js/api-gw2.js | — |
| `hb111-puerta-import.test.js` | 13.0 | VERDE | VERDE | 26/0 | — | — |
| `hb114-t17-t18.mjs` | 12.4 | ROJO | ROJO | 0/0 | index.html | — |
| `hb119-1-1-precio-oro.test.js` | 6.5 | VERDE | VERDE | 5/0 | js/legendary-tracker.js, js/render-catologo.js | — |
| `hb119-2-2-filtros-progreso.test.js` | 10.2 | VERDE | VERDE | 7/0 | js/legendary-tracker.js, js/render-catologo.js | — |
| `hb119-alert2-1.test.js` | 10.3 | VERDE | VERDE | 9/0 | js/legendary-tracker.js, js/render-catologo.js | — |
| `hb119-t19a-cadena.test.js` | 6.7 | VERDE | ROJO | 14/1 | — | — |
| `hb119-t20a-confirm.test.js` | 6.4 | VERDE | VERDE | 18/0 | — | — |
| `hb121-gist-cancel.test.js` | 3.5 | VERDE | VERDE | 10/0 | index.html | — |
| `hb122-contrato-recetas.test.js` | 25.0 | VERDE | ROJO | 44/0 | index.html | js/_build_legendary_recipes.py |
| `hb123-alert179-delegacion.test.js` | 6.1 | VERDE | VERDE | 16/0 | — | — |
| `hb124-arme-1-2-modal-materiales.test.js` | 12.6 | VERDE | VERDE | 34/0 | js/legendary-tracker.js, js/render-catologo.js | — |
| `hb125-t12b-escritor-comun.test.js` | 13.1 | VERDE | VERDE | 29/0 | — | — |
| `hb126-cola-crafteo.test.js` | 11.6 | VERDE | VERDE | 15/0 | js/legendary-tracker.js, js/render-catologo.js | — |
| `hb133-appjs-no-traga-gn.test.js` | 11.5 | VERDE | VERDE | 17/0 | index.html | — |
| `hb134-cuento-po-refs.test.js` | 4.1 | VERDE | ROJO | 0/0 | — | — |
| `hb135-t20b-direccion.test.js` | 15.2 | VERDE | VERDE | 38/0 | — | — |
| `hb136-escena2-solo-strikes.test.js` | 12.6 | VERDE | VERDE | 23/0 | index.html | — |
| `hb148-filtro05-guardia-cognitiva.test.js` | 10.0 | VERDE | VERDE | 6/0 | js/legendary-tracker.js, js/render-catologo.js | — |
| `hb150-cuenta-skins.test.js` | 12.7 | VERDE | VERDE | 17/0 | js/api-gw2.js | — |
| `hb154-skins-catalogo.test.js` | 11.7 | VERDE | VERDE | 47/0 | js/api-gw2.js | — |
| `hb204-alert204-veredicto.test.js` | 7.7 | VERDE | ROJO | 0/0 | — | — |
| `hb205-ruta-no-atada.test.js` | 8.8 | VERDE | ROJO | 6/0 | — | — |
| `hb75-permisos.test.js` | 12.9 | VERDE | VERDE | 54/0 | index.html | — |
| `hb77-puerta-llega.test.js` | 8.8 | VERDE | VERDE | 20/0 | — | — |
| `hb78-preferencia-pestana.test.js` | 15.9 | VERDE | VERDE | 25/0 | — | — |
| `hb80-clic-cuenta.test.js` | 7.9 | VERDE | VERDE | 23/0 | — | — |
| `hb80-toast-permanencia.test.js` | 5.8 | VERDE | VERDE | 8/0 | — | — |
| `hb81-toast-legible.test.js` | 14.6 | VERDE | VERDE | 16/0 | index.html | — |
| `hb85-ttl-y-fuga.test.js` | 15.8 | VERDE | VERDE | 23/0 | — | — |
| `hb87-carga-gana.test.js` | 9.2 | VERDE | VERDE | 12/0 | — | — |
| `hb89-premisa-raw-selected.test.js` | 8.7 | VERDE | VERDE | 18/0 | — | — |
| `hb90-t9-mutex.test.js` | 12.2 | ROJO | VERDE | 14/0 | — | — |
| `hb94-raid-wing-card.test.js` | 10.2 | VERDE | VERDE | 10/0 | index.html, js/raid-tracker.js, js/strike-tracker.js | — |
| `hb98-wv-shop-view.test.js` | 6.1 | VERDE | VERDE | 11/0 | js/router.js | — |
| `idea47-commit1.allsettled.test.js` | 7.9 | VERDE | VERDE | 29/0 | — | — |
| `idea47-commit2.propagate.test.js` | 7.9 | VERDE | VERDE | 31/0 | index.html, js/api-gw2.js | — |
| `idea47-commit4.converter.test.js` | 9.1 | VERDE | VERDE | 37/0 | index.html, js/api-gw2.js | — |
| `idea48.poolmax.test.js` | 8.2 | VERDE | VERDE | 17/0 | js/api-gw2.js | — |
| `idea48b.eta-counter.test.js` | 7.7 | VERDE | VERDE | 29/0 | index.html | — |
| `idea49.activities-cache-wipe.test.js` | 8.8 | VERDE | VERDE | 21/0 | js/activities.js, js/api-gw2.js, js/router.js | — |
| `idea49.partial-206.retry404.test.js` | 7.8 | VERDE | VERDE | 13/0 | js/api-gw2.js | — |
| `idea49.partial-206.test.js` | 10.2 | VERDE | VERDE | 23/0 | js/api-gw2.js | — |
| `idea49.quotavisible.test.js` | 6.9 | VERDE | VERDE | 11/0 | js/activities.js, js/api-gw2.js | — |
| `idea49.shard-concurrency.test.js` | 7.4 | VERDE | VERDE | 14/0 | js/api-gw2.js | — |
| `idea49.tramoc-sharding.test.js` | 13.1 | VERDE | VERDE | 37/0 | js/api-gw2.js | — |
| `idea50-boton-cache.test.js` | 25.7 | VERDE | VERDE | 65/0 | index.html, js/api-gw2.js | — |
| `idea50b-hook-cache-mem.test.js` | 13.3 | VERDE | VERDE | 25/0 | js/api-gw2.js | — |
| `idea50e.cache-expiry-purge.test.js` | 19.0 | VERDE | VERDE | 40/0 | js/api-gw2.js | — |
| `idea50f.cacheclear-real.test.js` | 27.7 | ROJO | ROJO | 64/5 | index.html, js/api-gw2.js | — |
| `idea52.raid-encounter-ids.test.js` | 13.1 | VERDE | VERDE | 35/0 | js/raid-tracker.js | — |
| `idea55.account-layer.test.js` | 13.8 | VERDE | VERDE | 44/0 | — | — |
| `idea55.characters-ach-layer.test.js` | 8.8 | VERDE | VERDE | 22/0 | index.html, js/api-gw2.js | — |
| `idea55.wv-online-parallel.test.js` | 12.3 | VERDE | VERDE | 58/0 | index.html, js/api-gw2.js | — |
| `idea56.f1-hint-permiso.test.js` | 6.0 | VERDE | VERDE | 23/0 | js/api-gw2.js, js/raid-tracker.js, js/strike-tracker.js | — |
| `idea56.forma-raids.test.js` | 7.1 | VERDE | VERDE | 20/0 | js/api-gw2.js | — |
| `idea57-t2-forma-propaga.test.js` | 9.6 | VERDE | VERDE | 21/0 | js/api-gw2.js | — |
| `idea57.forma-contracts.test.js` | 10.0 | VERDE | VERDE | 14/0 | js/api-gw2.js | — |
| `idea57t2-luck-sindato.test.js` | 14.4 | VERDE | VERDE | 21/0 | js/api-gw2.js | — |
| `idea57t3-jsdoc-honesto.test.js` | 8.5 | VERDE | VERDE | 13/0 | js/api-gw2.js | — |
| `idea57t4-idioma-contrato.test.js` | 3.9 | VERDE | VERDE | 0/0 | js/api-gw2.js | — |
| `idea57t5-cuenta-medida.test.js` | 11.1 | VERDE | VERDE | 13/0 | js/api-gw2.js | — |
| `idea60b.forma-charcount.test.js` | 7.4 | VERDE | VERDE | 21/0 | js/api-gw2.js | — |
| `idea61-claves-congeladas.test.js` | 26.1 | VERDE | ROJO | 29/9 | — | — |
| `idea63-filtros-cuentas.test.js` | 7.8 | VERDE | VERDE | 26/0 | — | — |
| `idea64-dos-pestanas.test.js` | 29.2 | VERDE | VERDE | 30/0 | — | — |
| `idea78-puntos-logros-nan.test.js` | 5.8 | VERDE | VERDE | 12/0 | — | — |
| `idea84-leyenda-pipeline.test.js` | 22.1 | VERDE | ROJO | 0/2 | — | js/_legendary_catalog_test.js, js/_legendary_items_full.json, js/_legendary_raw_cache/armory.json |
| `inventory-dashboard.abort.test.js` | 2.8 | VERDE | VERDE | 5/0 | js/inventory-dashboard.js | — |
| `t19c-lectores-legacy.test.js` | 8.9 | VERDE | VERDE | 36/0 | js/raid-tracker.js, js/strike-tracker.js | — |

## Salida de los que no están en VERDE en DEV

### alert86.censo-clasificacion.test.js — ROJO (código 1)

    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '/tmp/censo-7i6Nym/dev/js/homestead-tracker.js'
    }
    Node.js v22.23.3

### arma-2-3-cola-contrato.test.js — ROJO (código 1)

    pass - 4.2 las 3 primeras filas se distinguen de las otras 2 (borde distinto)  [tres=["3px solid #974EFF","3px solid #974EFF","3px solid #974EFF"] otras=["3px s
    probes: {"LegendaryCatalog.items":206,"LegendaryTree":"object","LegendaryTreeUI":"object","LegendaryPrecursors":"object","openItemModal":"function","id existe e
    FAIL - 5.1 un item SIN encolar ofrece "Agregar a la cola"  [n=0]
    FAIL - 5.2 un item ENCOLADO ofrece "Quitar de la cola" (el boton cambia de sentido)  [n=0]
    FAIL - 5.3 el boton del modal apunta al item con el que se encolo  [id=30684]
    CONTRATO DE LA COLA: 18 pass / 3 fail

### armeria-alert-01-clasificacion.test.js — ROJO (código 1)

    50,  93,  32,  78, 111,  32, 115, 117,  99, 104,  32, 102,
    105, 108, 101,  32,
    ... 13 more items
    ]
    }
    Node.js v22.23.3

### armeria-filtros-cola-card.test.js — ROJO (código 1)

    at Module.load (node:internal/modules/cjs/loader:1505:32)
    at Function._load (node:internal/modules/cjs/loader:1309:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49
    Node.js v22.23.3

### armeria-modal-iconos-nombre.test.js — ROJO (código 1)

    [4] el arbol y la tabla pintan <img> y el nombre traducido
    [5] el presupuesto propio no pierde ids al recargar
    [6] controles negativos: id desconocido y red caida
    SUITE CON FALLOS  30 pass / 1 FAIL
    Lo que cayo:
    - (3) la produccion pidio ids  [pidio: null]

### armeria-ui-arbol.test.js — ROJO (código 1)

    at Module.load (node:internal/modules/cjs/loader:1505:32)
    at Function._load (node:internal/modules/cjs/loader:1309:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49
    Node.js v22.23.3

### hb114-t17-t18.mjs — ROJO (código 1)

    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '\\tmp\\censo-7i6Nym\\dev\\\\js\\raid-tracker.js'
    }
    Node.js v22.23.3

### hb119-t19a-cadena.test.js — ROJO (código 1)

    pass  hay exactamente 1 refresh del InventoryHub en router.js (si hay 0, alguien lo saco en silencio)
    FAIL  14 archivos escuchan gn:tokenchange (medido: 13)
    pass  CONTROL: inventory-hub.js NO esta entre ellos -- el punto 1 por censo, no por grep de una linea
    14 pass / 1 FAIL
    fallos:
    - 14 archivos escuchan gn:tokenchange (medido: 13)

### hb122-contrato-recetas.test.js — ROJO (código 1)

    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '/tmp/censo-7i6Nym/dev/js/_build_legendary_recipes.py'
    }
    Node.js v22.23.3

### hb134-cuento-po-refs.test.js — ROJO (código 1)

    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '/tmp/censo-7i6Nym/dev/tools/hb116-union-po.mjs'
    }
    Node.js v22.23.3

### hb204-alert204-veredicto.test.js — ROJO (código 1)

    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '/tmp/censo-7i6Nym/dev/tools/hb100-suite.mjs'
    }
    Node.js v22.23.3

### hb205-ruta-no-atada.test.js — ROJO (código 1)

    errno: -2,
    code: 'ENOENT',
    syscall: 'open',
    path: '/tmp/censo-7i6Nym/dev/tools/hb100-suite.mjs'
    }
    Node.js v22.23.3

### idea50f.cacheclear-real.test.js — ROJO (código 1)

    PASS  isCacheKey recibe el registro por parametro: (k, bases)
    PASS  isCacheKey NO colecta por clave (serian 2 arrays + 24 indexOf POR clave del store)
    PASS  el cuerpo de cacheClear se pudo acotar
    PASS  y la colecta ocurre UNA sola vez en todo el cuerpo: por clave serian 2 arrays + 24 indexOf POR clave  (obtenido: 1)
    PASS  cacheClear colecta el registro ANTES del loop que recorre el store
    HAY FALLOS — 64 pass / 5 FAIL

### idea61-claves-congeladas.test.js — ROJO (código 1)

    TOTAL: 29 pass, 9 FAIL
    Un FAIL aca no es "el fix esta mal" a secas. Antes de tocar el
    codigo: las secciones 1-4 son la ESPECIFICACION de la Idea 61 y
    deben estar en verde; la 5 afirma un INVARIANTE (gw2_keys no es una
    huerfana) y su forma cambio con el fix. Si la 5 falla, la razon
    puede ser que el invariante se haya roto de verdad.

### idea84-leyenda-pipeline.test.js — ROJO (código 1)

    ==============================================================
    idea84-leyenda-pipeline: 0 pass, 2 FAIL
    FALLOS:
    x existe _fetch_legendary_items.py (el eslabón que baja el input)
    x existe _build_legendary_data.py (el transformador)
    ==============================================================

