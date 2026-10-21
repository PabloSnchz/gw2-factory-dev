# FACTORY-ASSET-001 — Qué conservar de gw2-wallet-agents y gw2-agents-dashboard

- Fecha: 2026-10-21
- Pedido por: Pablo (2026-10-21 07:30Z), después de dar de baja a QwenPaw.
- Alcance: solo análisis y propuesta. No migré nada ni escribí en esos dos repos.
- Base medida: gw2-wallet-agents @ `eb91075` (2026-10-21 06:02Z) y gw2-agents-dashboard @ `7c41de5` (2026-10-21 04:26Z), comparados por blob contra gw2-factory-dev @ `39d396c` y gw2-wallet-ligero @ `2bab20f`.
- Decisión pendiente: REQ-010.

## Resumen

- **Lo más valioso es la red de tests:** gw2-wallet-agents tiene unos 90 archivos de tests del producto (su última medición, del 2026-10-19: 2326 aserciones que pasan y 7 que fallan, en 87 archivos). DEV tiene 12. La mayoría prueba módulos que hoy son idénticos en DEV y en producción.
- **También valen mucho los generadores de datos de la Armería:** son los scripts que arman `legendary-data.js`, las recetas y los precursores. DEV tiene los datos generados, pero no la forma de regenerarlos (RSK-018).
- **Hay trabajo de producto que no llegó a DEV ni a producción:** un panel de Homestead completo, un arreglo en los totales de la Armería y conexiones nuevas con la API. Una parte de eso descarga datos que no se muestran en ninguna pantalla.
- **El conocimiento vale si se filtra:** hay hechos de la API verificados y decisiones de producto que siguen vigentes. Están mezclados con unos 2 MB de bitácoras del sistema de agentes, que no aportan al producto.
- **gw2-agents-dashboard no tiene nada para migrar:** el panel nuevo (gw2-factory-dashboard) lo reemplaza desde DEC-008.
- **Hay dos riesgos que siguen activos hoy:**
  - gw2-wallet-agents publica en GitHub Pages una copia vieja de La Bóveda en el mismo dominio que producción (RSK-002, RSK-008).
  - Su workflow de métricas no tiene la protección por repositorio que tiene DEV (FEAT-002).

## 1. Conocimiento que sigue teniendo valor

Hechos verificados contra la API por el modelo anterior:

| Hecho | Fuente en agents | Uso hoy |
|---|---|---|
| ~~El modo legendario del raid Nexus of Eternity es el logro **9472** ("Legendary Nexus of Eternity"). El 9478 no existe: el rango 9478–9485 da 404~~ **Corregido en MIG-1 (2026-10-21):** el 9472 es el modo desafío y el 9478 existe ("Legendary Conqueror of Vloxx", desafío legendario). Ver `docs/GW2-API-HECHOS.md` y LES-029 | ALERT-272, BACKLOG | Seguimiento del modo legendario en Raids |
| `/v2/account/buildstorage` pide el permiso `account`, no `inventories` | ALERT-270 | Plantillas guardadas |
| Homestead: existen `/v2/account/homestead/decorations`, `/v2/homestead/glyphs` y `/v2/homestead/decorations/categories`. Los glyphs llegan como texto, no como objetos | DECISIONS_LOG, commit `ca673ac` | Panel de Homestead |
| El 429 de la API es por cantidad de pedidos en el tiempo, no por pedidos simultáneos. Con 27 cuentas, una vista de colecciones serían 324 pedidos | ALERT-27 | Cualquier vista que consulte todas las cuentas |
| No hay endpoint para los LI de fractales ni para las inestabilidades: solo se puede marcar el logro de cada nivel del modo desafío (9423, 9412, 9373, 9388) | DECISIONS_LOG C1–C3 | Actividades / fractales |
| `/v2/events` está retirado | ya está en `js/meta.js` | — |

Decisiones de producto que siguen vigentes:

- **Datos de fractales en un módulo compartido** (`fractal-data.js`), para que Actividades y un futuro seguimiento de fractales no dupliquen la tabla.
- **"No arreglar código que se va a eliminar":** antes de corregir un error, preguntarse si ese código va a seguir existiendo.
- **Seguimiento de varias cuentas:** el control de "el último pedido gana" tiene que ser por cuenta, no global. Si no, el dibujo de una cuenta pisa el de otra.

Lecciones de proceso: la mayoría ya está en mi memoria. Por ejemplo, "verificar contra la fuente y no contra el repo" (LES-026) y el límite de archivos grandes (LES-028). Hay una nueva que vale registrar: **una tarea que trae datos pero no los muestra en pantalla no está terminada.** El modelo anterior marcó como "COMPLETADO" el seguimiento del logro 9472, pero `raid-tracker.js` solo guarda el dato en `state.legendaryAchievements` y nada lo dibuja (commit `267264c`).

Sin valor para el producto: las notas sobre fallas de la plataforma QwenPaw (bucles del heartbeat, timeouts del revisor, `share_session`) en `MEMORY.md`.

## 2. Documentación que sigue teniendo valor

| Documento (agents) | Tamaño | Comparación con DEV | Propuesta |
|---|---|---|---|
| `docs/ONBOARDING.md` | 184 KB | DEV tiene 144 KB: la de agents es más nueva | Revisar las diferencias y actualizar DEV (parte de BL-004) |
| `docs/Modulos JS Referencia.md` | 117 KB | DEV tiene 102 KB | Igual que el anterior |
| `docs/BRIEFING.md` | 8,6 KB | DEV tiene 7,8 KB | Igual que el anterior |
| `CHANGELOG.md` | 130 KB | El de DEV no tiene la Armería (BL-004) | Llevar a DEV las entradas del producto, no las del equipo de agentes |
| `FEATURES.md` | 22 KB | Fichas de lo construido: Armería (cola de crafteo, materiales, árbol, filtros Tengo/Me faltan), caché que se borra con la cuenta, aviso de permisos al importar, confirmación y copia antes de sincronizar el Gist | Completar FEAT-000 con lo que ya está en producción |
| Guías de usuario (`docs/user-guide*.html`) | — | Más viejas que las de DEV (sin FEAT-004) | No migrar |

Solo para archivo histórico, sin migrar:

- `ALERTS_LOG.md` (590 KB), `SESSION_LOG.md` (312 KB) y `COMMS_LOG.md` (269 KB).
- `DASHBOARD_PO_IDEAS.md` (213 KB) y `PRE_BACKLOG_PO_*` (427 KB).
- `HEARTBEAT.md`, `TEAM_STATUS*.md`, `AGENTS.md`, `AGENTS_SYNC.md`, `ORG_MAP.md`, `CRON_SCHEDULE.md`, `PROMOTIONS.md`, `READY_FOR_PROMOTION.md`, `IN_PROGRESS.md`, `RESOLUCION_TIMEOUTS_20260930.md` y `_eco/ESTADO.md`.

Estos archivos describen cómo funcionaba el sistema de agentes, no el producto. Hay una excepción: en `ALERTS_LOG.md` puede haber errores del producto todavía abiertos (por ejemplo ALERT-30, la tarjeta de la Armería sin acción al hacer clic). Propongo leerlo una sola vez, con un objetivo acotado, y llevar a discovery solo lo que siga vivo.

## 3. Herramientas que siguen teniendo valor

| Herramienta | Propuesta | Por qué |
|---|---|---|
| `tests/` (unos 90 archivos: Armería, caché, permisos, Gist, raids, strikes, cartera, Cámara del Brujo) | **Migrar por tandas, revisando cada una** | Es la red de seguridad que le falta a DEV. Hay que revisarlos uno por uno porque algunos dependen de la posición de las líneas en `index.html` (por ejemplo `alert86`) y otros prueban código que solo existe en agents. Cada tanda tiene que pasar contra el código de DEV. Si falla, es un error real (va al backlog) o un test viejo (se adapta o se descarta) |
| `tests/_run-all.js`, `tools/run-suite.js` | Migrar solo si `node --test` no alcanza | DEV ya corre todo con `node --test` |
| `js/_build_legendary_data.py`, `_build_legendary_recipes.py`, `_build_legendary_precursors.py`, `_fetch_legendary_items.py`, `_fetch_thematic_prices.py` | **Migrar a `tools/legendary/`** | Regeneran los datos de la Armería cuando sale una legendaria nueva. Hoy DEV no puede hacerlo (RSK-018) |
| `scripts/medir-cache-logros.py`, `medir-campos-metadata.py` | Evaluar | Mediciones puntuales; sirven si vuelve el tema del caché de logros |
| `tools/hb*.mjs`, `tools/alert*.py`, `comms-*`, `renumber-*`, etc. (unos 90 scripts) | Archivar | Se escribieron para un ciclo del heartbeat o para mantener las bitácoras |
| `.github/workflows/github-metrics-to-ga4.yml` | **No migrar** | DEV ya tiene la versión con protección por repositorio. La de agents no la tiene: si el repo tiene los secretos de GA4, manda sus métricas al GA4 de producción todos los días a las 00:00 UTC. No puedo comprobarlo: no veo GitHub Actions (RSK-016) |
| gw2-agents-dashboard completo (`parser.js` de 109 KB, `data/comms.json` de 615 KB, 3 tests) | Archivar | El panel nuevo lo reemplaza (DEC-008). Mide el sistema de agentes, que ya no existe |

## 4. Trabajo de producto que solo está en agents

Archivos de `js/` que difieren de DEV:

- **Solo en agents:** `homestead-tracker.js`.
- **Distintos:**
  - `api-gw2.js`, `inventory-dashboard.js`, `legendary-tracker.js`, `raid-tracker.js`, `router.js` y `strike-tracker.js`;
  - `theme-selector.js`, que es más viejo: de antes de FEAT-004.

| Pieza | Estado real | Propuesta |
|---|---|---|
| **Panel de Homestead** (`homestead-tracker.js` + panel en `index.html`, rescatado en el HB#199) | Pantalla completa, nunca validada por vos | Candidata a funcionalidad nueva: la llevo a discovery con mi recomendación. Es alcance funcional, así que lo decidís vos |
| **Totales de la Armería** (`19fa3e8`, `ownedMap` → `stockMap`) | Arreglo de un error | Verificar si el error existe en DEV y en producción. Si existe, migrarlo con su test |
| **Modo legendario de Nexus (9472)** en `raid-tracker.js` | Descarga el dato pero no lo muestra | No copiar el código. Rehacerlo con la pantalla, usando el logro 9472 verificado |
| **Cámara del Brujo, monturas y plantillas** en `inventory-dashboard.js` (`47af81e`, `03b684f`) | Hace 3 pedidos más por cuenta en cada actualización y no los muestra | **No migrar:** gasta cuota de la API sin dar nada (ALERT-27). Además, La Bóveda ya tiene diarias, semanales y especiales de la Cámara del Brujo |
| `getAccountMounts`, `getMountsCatalog`, `getAccountWizardsVault`, `getAccountBuildStorage` en `api-gw2.js` | Funciones sin ninguna pantalla que las use | Migrarlas solo junto con la pantalla que las use |
| Ideas abiertas en `PRE_BACKLOG.md` (monturas, colecciones, Homestead, modo legendario) | Ideas sin construir | A discovery, respetando el límite de 15 |

## 5. Qué archivar

- **Los dos repositorios**, con "Archive repository" de GitHub, después de migrar lo de las secciones 2 a 4:
  - quedan de solo lectura, con toda la historia intacta;
  - se puede deshacer;
  - GitHub no corre workflows en un repo archivado, así que el de métricas se apaga solo.
- **Antes de archivar, apagar sus GitHub Pages.** Archivar no despublica el sitio:
  - `pablosnchz.github.io/gw2-wallet-agents/` sirve una copia vieja de La Bóveda en el dominio de producción. Comparte `localStorage` con producción (API keys, cuentas y theme) y trae el selector de themes de antes de FEAT-004;
  - `pablosnchz.github.io/gw2-agents-dashboard/` muestra un panel que ya no refleja nada.
- **Las dos cosas son acciones tuyas:** la Factory no tiene permiso para archivar repositorios ni para cambiar la configuración de Pages.

## 6. Qué migrar y en qué orden

Cada paso es un micro-ciclo en gw2-factory-dev: la migración se copia, nada se mueve. Los repos viejos quedan intactos hasta que los archives.

1. **MIG-1 — Hechos de la API** a `docs/GW2-API-HECHOS.md` (DEC-003: documentación del producto). La lección nueva va a `lessons/`.
2. **MIG-2 — Generadores de la Armería** a `tools/legendary/`, con una prueba que regenere y compare contra los datos actuales.
3. **MIG-3 — Arreglo de los totales de la Armería**, si el error existe en DEV.
4. **MIG-4 — Tests por tandas:** Armería, caché, cuentas y Gist, raids y strikes, cartera y Cámara del Brujo. Cada tanda tiene que estar en verde contra DEV.
5. **MIG-5 — Documentación** (ONBOARDING, módulos, BRIEFING, CHANGELOG del producto): cierra BL-004.
6. **MIG-6 — Discovery:** Homestead, modo legendario con pantalla, monturas, colecciones y los errores que sigan vivos en `ALERTS_LOG.md`.
7. **ARCH — Tus acciones:** apagar Pages en los dos repos y archivarlos.

## Incidente durante el análisis

El 2026-10-21 a las 08:05Z hice por error una llamada de escritura a gw2-wallet-agents (`push_files` con la rama `__never__` y sin archivos). GitHub rechazó el commit, pero la rama quedó creada:

- apunta a `eb91075`, el mismo commit que `main`;
- no agrega contenido, y `main` no cambió.

No tengo herramienta para borrar ramas: se borra desde GitHub (Branches → `__never__` → borrar) o desaparece en la práctica al archivar el repo. Causa: armé una llamada de prueba sobre el repo equivocado. A partir de ahora no hago llamadas de escritura de prueba: solo publicaciones reales, sobre el repo verificado antes de llamar.

## Riesgos

- **Pages de agents activo (ALTO, hoy):** si alguien abre la copia vieja, puede cambiar el theme o los datos guardados que usa producción en ese navegador. Apagar Pages lo resuelve y no depende del resto del plan.
- **Workflow de métricas sin protección (MEDIO, sin verificar):** puede estar mezclando métricas de agents en el GA4 de producción. Se resuelve al archivar, o deshabilitando el workflow.
- **Migrar tests sin revisarlos (MEDIO):** un test viejo que falla puede dejar `main` de DEV en rojo sin que yo lo vea (RSK-016). Lo controlo así: solo publico tandas que pasan en local.
- **Archivar antes de migrar (BAJO):** el repo archivado se puede leer igual y se puede desarchivar, así que no se pierde nada. Pero conviene seguir el orden.
