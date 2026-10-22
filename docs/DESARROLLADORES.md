# Developer Guide — Bóveda del Gato Negro (gw2-wallet-ligero)

> Estado al 2026-10-22 — API pública, eventos, storage, depuración y convenciones. Lo que cambió desde la v6.6.2: Armería Legendaria, metas nuevas, PSNA, mi voz (Shiruvana) y el storage real con sus claves espejo.

## Quick Start

```js
// Cada módulo expone su API en window.* al cargar.
// Los _debug() muestran el estado interno:
InventoryHub._debug();     // { active, view, section, bankItems, materialsCount, ... }
Accounts._debug();         // { active, hasData, fileName, accountsCount, view, compact }
RaidTracker._debug();      // { active, token, wings, completedCount, ... }
StrikeTracker._debug();    // { inited, active, token, completedStrikes, loading, error }
LegendaryTracker._debug(); // { version, active, mode, armoryCount, loading, error, filters, dom }
ConverterModal._debug();   // { inited, activeTab }
WVObjectivesDashboard._debug(); // comparación multi-cuenta
SettingsManager._debug();  // { version, ready }
```

La versión real de cada módulo está en el encabezado de su archivo (o en su `_debug()`). El `?v=` con que `index.html` carga cada script es solo para el caché del navegador y puede ir atrasado.

---

## Arquitectura en 3 capas CSS (NO ROMPER)

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Layout | `main.css` | Estructura, fondos, tipografía. **Sin bordes ni box-shadows.** |
| Piel unificada | `theme-polish.css` | Bordes neutros, glow base, hover, dimensiones de UI. |
| Color semántico | `*-theme.js` | **SOLO `borderLeft: 3px solid <color>`.** |

**Nunca usar `!important`** en temas. Ningún `*-theme.js` puede sobrescribir `border`, `boxShadow`, `borderRadius`, `transition` (excepto `borderLeft`). Los themes viven en `css/themes/`; el oficial por defecto es `gato.css` ("Gato Negro").

---

## Módulos y APIs públicas (`window.*`)

| Módulo | Archivo | API pública |
|--------|---------|-------------|
| `Accounts` | `accounts-panel.js` | `initOnce()`, `activate()`, `deactivate()`, `Route`, `_debug()` |
| `Achievements` | `achievements.js` | `initOnce()`, `render(opts)`, `onTokenChange()` |
| `Activities` | `activities.js` | `initOnce()`, `activate()`, `deactivate()`, `prefetch()`, `Route`, `_debug()`, `_renderPSNA`, `_forceReload()` |
| `ActivitiesAPI` | `activities.js` | `getToken()`, `isActive()`, `onHomeNodesTabSelected(cb)`, `renderHomeNodes(container)` |
| `Analytics` | `analytics.js` | `viewModule(name)`, `exportBackup()`, `importBackup()`, `openAccountWizard()`, `downloadExcelTemplate()`, `enrichWithAPI()`, `encryptAccountsFile()`, `forceReloadSeason()`, `openApiKeysModal()`, `addApiKey()`, `deleteApiKey()` — solo envía en el host de producción (DEC-006) |
| `ConverterModal` | `converter-modal.js` | `initOnce()`, `open()`, `close()`, `_debug()` |
| `GistSync` | `gist-sync.js` | `syncUp()`, `syncDown()`, `clearLocal()`, `_debug()` |
| `InventoryDashboard` | `inventory-dashboard.js` | `initOnce()`, `activate()`, `deactivate()`, `refresh(forceNoCache)` |
| `InventoryHub` | `inventory-hub.js` | `initOnce()`, `activate()`, `deactivate()`, `refresh(force)`, `_debug()` |
| `ItemIcons` | `item-icons.js` | Íconos y rareza por id de item, contra `GW2Api.getItemsMany` |
| `LegendaryCatalog` | `legendary-data.js` | Catálogo generado de las 206 legendarias (ver `tools/legendary/`) |
| `LegendaryCatalogUI` | `render-catologo.js` | `filterBar`, `catalogGrid`, `skeleton`, `expansionReal(item)`, `corregirExpansiones(items)`, `EXPANSION_ORDER`, `TYPE_LABELS` |
| `LegendaryRecipes` | `legendary-recipes.js` | Contrato de fabricación de las 206: `byItem`, `get(id)`, `describe(id)`, `counts` (generado) |
| `LegendaryPrecursors` | `legendary-precursors.js` | Las 907 piezas bajo cada legendaria: `byItem`, `get(id)`, `has(id)` (generado; se carga al abrir una legendaria) |
| `LegendaryTracker` | `legendary-tracker.js` | `initOnce()`, `activate()`, `deactivate()`, `refresh()`, `prefetch()`, `openItemModal(id)` (abre la **pantalla** de la legendaria), `closeItemModal()`, `toggleQueue(id)`, `getQueue()`, `computeMaterials()`, `setMode()`, `setFilter(key, value)`, `getState()`, `Route`, `_debug()` |
| `LegendaryTreeUI` | `legendary-tree-ui.js` | `renderSheetHTML`, `renderHeroHTML`, `renderTreeHTML`, `renderTotalsHTML`, `renderIconStatusHTML`, `ensurePrecursors()` |
| `Meta` | `meta.js` | Metas y eventos con horario; el filtro de expansión se arma desde los datos |
| `RaidTracker` | `raid-tracker.js` | `initOnce()`, `activate()`, `deactivate()`, `prefetch()`, `Route`, `_debug()` |
| `SettingsManager` | `settings-manager.js` | `init()`, `exportAll()`, `exportData()`, `importAll()`, `importFromFile()`, `importFromData()`, `_debug()` |
| `Shiruvana` | `shiruvana.js` | `voice({ kind, text, ... })` arma mi bloque de voz; `KINDS`, `AVATAR`, `CSS` (DEC-024, DEC-025) |
| `ShiruvanaPlaces` | `shiruvana-places.js` | Dónde hablo en la app: `welcome`, `keys`, `guide`, `TEXTS` |
| `Storage` | `storage.js` | Ver "Storage" abajo |
| `StrikeTracker` | `strike-tracker.js` | `initOnce()`, `activate()`, `deactivate()`, `prefetch()`, `Route`, `_debug()` |
| `ThemeSelector` | `theme-selector.js` | `init()`, `apply(theme)`, `_debug()` |
| `WalletDashboard` | `wallet-dashboard.js` | `initOnce()`, `activate()`, `deactivate()`, `show()`, `refresh(forceNoCache)` |
| `Welcome` | `welcome-panel.js` | `initOnce()`, `activate()`, `refreshAPIKeysStatus()` |
| `WizardsVault` | `wizards-vault.js` | `forceReload()`, `getCurrentSeason()`, `getAccountListings()`, `purchase(itemId)` |
| `WVSeasonStore` | `wv-season-storage.js` | `getCurrentSeasonInfo()`, `listSeasons()`, `readSeason(fp,y,s)`, `writeSeason()`, `getPinned()`, `setPinned()`, `delPinned()`, `getMarks()`, `setMarks()`, `getPrefs()`, `setPrefs()`, `getKeyPrefs()`, `setKeyPrefs()`, `compact()`, `migrateFromLegacy()` |
| `WVShopUI` | `wv-shop-ui.js` | `render()`, `ensureShopToolbar()`, `refresh(nocache)` |
| `WVObjectivesUI` | `wv-objectives-ui.js` | `renderTab(host,data,kind)`, `renderZero(kind)` |
| `WVObjectivesDashboard` | `wv-objectives-dashboard.js` | `activate()`, `deactivate()`, `refresh(force)`, `_debug()` |
| `WVPurchaseDetail` | `wv-purchase-detail.js` | `initOnce()`, `show(data)`, `hide()`, `refreshOnlineStatus()`, `_debug()` |
| `toast` | `app.js` | `toast(type, message, opts)` — type: `'success'`\|`'error'`\|`'warn'`\|`'info'` |
| `KeyManager` | `app.js` | `load()`, `refreshSelects()`, `setSelected(token,opts)`, `addOrUpdate(key)`, `copy(val)`, `rename(val,name)`, `remove(val)`, `list`, `selected` |
| `GW2Api` | `api-gw2.js` | Wrapper de la API con caché: `getAccount()`, `getWallet()`, `getCharacters()`, `getInventories()`, `getItemsMany(ids)`, `getAccountWvListings()`, etc. Límite real de la API: 300 pedidos por minuto por IP (`GW2-API-HECHOS.md`) |

---

## Sistema de eventos

### `gn:tokenchange` — Canal único de cambio de cuenta

```
UX cambia key → KeyManager.setSelected() → dispatchEvent('gn:tokenchange')
```

**Invariante técnica:** es el **único canal** para cambio de cuenta. Lo escuchan 13 módulos (router, inventario, personajes, raids, strikes, actividades, Armería, entre otros). Al cambiar de cuenta, el router desactiva los módulos con estado activo para que no sigan pidiendo datos de la cuenta anterior. Lo vigilan `tests/hb133-appjs-no-traga-gn.test.js`, `tests/hb106-censo-latch.test.js` y `tests/hb106-t13-invariante.test.js`.

```js
document.addEventListener('gn:tokenchange', function(e) {
  const token = e.detail.token;  // API key string
});
```

### `gn:nav-active` — Navegación activa

Se dispara con `{ detail: { hash } }` cuando cambia la ruta. Lo usa `wizards-vault.js` para el botón de recarga estacional.

### `characters:<event>` — Eventos de Characters

```js
window.Characters.on('loaded', callback);
window.Characters.off('loaded', callback);
```

---

## Storage (localStorage)

Todo pasa por `storage.js` (v1.1.0). Claves con prefijo `gn:` y un namespace conocido: `account:`, `activities:`, `global:`, `theme:`, `wallet:`, `wv:`, `inventory:`, `meta:`, `raids:`, `converter:`, `github:`, `accounts:`. Los nombres están en `Storage.STORAGE_KEYS` (por ejemplo `Storage.STORAGE_KEYS.ACCOUNT_KEYS`); no escribir el texto de la clave a mano.

| Clave | Qué guarda |
|---|---|
| `gn:account:keys` | Lista de cuentas (API keys con nombre) |
| `gn:account:selected` | Cuenta elegida |
| `gn:account:favs` | Favoritos |
| `gn:theme` | Theme elegido |
| `gn:wallet:*` | Cartera: vista compacta, orden, divisas, fijadas, snapshots, dashboard |
| `gn:wv:*` | Cámara del Brujo: temporada, tienda, última pestaña, detalle de compra |
| `gn:inventory:*` | Dashboard de inventario: set, orden, tiers, ocultar ceros |
| `gn:meta:*` | Metas: compacto, hecho hoy, favoritas |
| `gn:activities:*` | Nodos del hogar, toggles, piedras, caché del PSNA |
| `gn:github:*` | Gist: token cifrado, id, foto de seguridad antes de restaurar, última subida |

**Claves espejo (`MIRROR_MAP`):** `gn:account:keys`, `gn:account:selected`, `gn:activities:home:nodes` y `gn:activities:toggles` tienen todavía una clave vieja que algunos módulos escriben directamente (`gw2_keys`, `gw2_selected_key_v1`, `gn_home_nodes_marked`, `gn_activities_toggles`). Para esas cuatro la vieja manda: `Storage.get` la lee primero, `set` y `remove` tocan las dos, y al arrancar la nueva se resincroniza. Así el backup del Gist sube la lista de cuentas actual. Lo vigilan `tests/idea61-claves-congeladas.test.js` y `tools/audit-61-congeladas.mjs`: **no leer ni escribir directamente la clave `gn:` de un par espejo**.

La migración de claves viejas está en modo `copy` (no borra las viejas).

## Debug methods

| Módulo | `window.X._debug()` devuelve |
|--------|------------------------------|
| `InventoryHub` | `{ active, view, section, bankItems, materialsCount, armoryCount, token }` |
| `ConverterModal` | `{ inited, activeTab }` |
| `Accounts` | `{ active, hasData, fileName, accountsCount, view, compact }` |
| `RaidTracker` | `{ active, token, wings, completedCount, pendingCount }` |
| `StrikeTracker` | `{ inited, active, token, completedStrikes, loading, error }` |
| `LegendaryTracker` | `{ version, inited, active, mode, token, armoryCount, loading, error, render, filters, dom }` |
| `Characters` | `{ characters, maps, pois, profIcons, specs, assignments, filters, view, pagination, token, accountAchievements, ... }` |
| `WVObjectivesDashboard` | Datos comparativos multi-cuenta |
| `SettingsManager` | `{ version, ready }` |

## Tests y herramientas

| Qué | Dónde |
|---|---|
| Todos los tests | `node --test tests/*.test.cjs tests/*.test.js tests/*.smoke.js` (CI: `app-checks`) |
| Tests del legado de QwenPaw que siguen valiendo | `tests/*.test.js`, ver `tools/legacy/README.md` |
| Regenerar catálogo, recetas y precursores de la Armería | `tools/legendary/README.md` |
