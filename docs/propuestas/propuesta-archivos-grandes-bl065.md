# Propuesta BL-065 — Archivos grandes: cómo sigue creciendo la Bóveda

- **Estado:** aprobada por Pablo (2026-10-23 18:55Z) como DEC-035. FP-1 a FP-3 hechos; esta línea la mantiene el canal de parches (PATCH-006 y PATCH-008).
- **Fecha:** 2026-10-23
- **Pedido:** Pablo (18:46Z). Pausa BL-064 hasta resolver esto.
- **Decisión:** `ai-memory/decisions/DEC-035-crecimiento-modular-y-canal-de-parches.md`.
- **Relacionado:** LES-028, DEC-021, DEC-004, LES-018, LES-019, RSK-016, RSK-020, BL-005, BL-053.

## 1. Medición (DEV, 2026-10-23)

La Factory publica cada archivo mandando su contenido entero en una sola operación, con un tope de unos 64 KB. Además, cuanto más grande es la operación, más riesgo de timeout (por eso DEC-021 pide ≤ 40 KB por micro-ciclo).

| Zona | Archivos |
|---|---|
| **Ya no entran (> 64 KB)** | `api-gw2.js` 132,3 KB · `raid-tracker.js` 100,1 · `wv-purchase-detail.js` 91,2 · `router.js` 90,5 · `inventory-hub.js` 70,3 · `index.html` 69,4 · `accounts-panel.js` 67,6 · `app.js` 66,9 |
| **Datos generados (> 64 KB)** | `legendary-precursors.js` 273,3 KB · `legendary-recipes.js` 109,5 · `legendary-data.js` 83,4 |
| **Documentos (> 64 KB)** | `CHANGELOG.md` 79,2 KB · `README.md` 71,7 |
| **Al borde (56–64 KB)** | `activities.js` 64,9 · `legendary-tracker.js` 64,0 · `meta.js` 63,6 · `characters.js` 62,0 · `render-catologo.js` 61,5 · `strike-tracker.js` 57,8 |
| **Creciendo (45–56 KB)** | `inventory-dashboard.js` 53,5 · `wallet-dashboard.js` 52,5 · `achievements.js` 52,4 · `welcome-panel.js` 49,2 · `converter-modal.js` 48,7 · `activities-theme.js` 47,3 |

`meta-theme.js` (21,4 KB) está lejos del límite.

## 2. El problema son dos, no uno

1. **No puedo escribir un archivo grande.** Afecta a 13 archivos hoy y a 12 más pronto.
2. **No puedo agregar archivos nuevos.** Cada JS nuevo hay que declararlo en `index.html`, que no puedo escribir. Este es el problema de fondo: me obliga a meter todo en los archivos que ya se cargan, y por eso crecen (`render-catologo.js` pasó de 30 a 61 KB en un día).

Cualquier solución que no resuelva el punto 2 alimenta el punto 1.

## 3. Evaluación de las tres opciones

### Opción 1 — Canal de parches por GitHub Actions

Publico un archivo chico `factory/patches/PATCH-NNN.json` con operaciones (`replace`, `insert_before`, `insert_after`, `delete`) y un workflow las aplica sobre el archivo real, valida y hace el commit.

- **Viabilidad: alta.** Ya existe el mismo patrón: `decision-response.yml` escribe en el repo con `contents: write`, y `factory-scripts.yml` testea los scripts de `.github/scripts/`.
- **Resuelve:** los dos problemas, para cualquier tamaño. Destraba `index.html` (BL-005, `viewport-fit`, `?v=` de RSK-020) y BL-053.
- **Riesgos y cómo los cubro:**

| Riesgo | Mitigación |
|---|---|
| Un ancla aparece 0 o 2 veces y el reemplazo cae donde no va | Cada ancla tiene que aparecer **exactamente una vez**; si no, se rechaza el parche entero |
| Parche sobre una versión vieja del archivo (o aplicado dos veces) | El parche lleva el `blob sha` base esperado; si no coincide, se rechaza. Esto también lo hace idempotente |
| Aplicación a medias | Todo o nada: se aplica en memoria, se valida y recién ahí se hace el commit |
| No puedo leer CI (RSK-016) | El workflow escribe su resultado en el repo (`factory/patches/RESULT-NNN.md`: aplicado, con el blob nuevo, o rechazado, con el motivo). Lo leo como cualquier archivo |
| Los commits hechos con `GITHUB_TOKEN` no disparan otros workflows: DEV no se republicaría y `app-checks` no correría | El workflow corre él mismo `node --check` y los tests antes del commit, y después dispara `dev-pages` con `workflow_dispatch` (la excepción que GitHub sí permite) |
| Choque con mis escrituras directas | Ya está cubierto: mis escrituras exigen el sha actual y fallan si el archivo cambió. El workflow va con `concurrency` en serie (LES-018) |
| Que alcance a producción | Una guarda `github.repository == 'PabloSnchz/gw2-factory-dev'`, como los otros workflows |
| Que el canal haga indoloro seguir engordando monolitos | Por eso no va solo: se combina con el presupuesto de tamaño (opción 2) |

- **Complejidad: media y acotada.** Un workflow, un script de unos 150 líneas y sus tests.
- **Compatibilidad:** total. Un parche es un micro-ciclo chico y es su propio checkpoint.

### Opción 2 — Archivos pequeños

- **Beneficio:** ataca la causa. Archivos de una responsabilidad son más fáciles de leer, testear y revisar para mí y para cualquier persona.
- **Costo:** alto si se hace de golpe. Son 8 archivos de código y unos 760 KB; un refactor masivo de código heredado es el tipo de cambio que más regresiones trae (LES-029).
- **Bloqueo:** **sola no es posible.** Para partir un archivo, la parte extraída es un archivo nuevo, y ese archivo nuevo tiene que estar en `index.html`. Depende de la opción 1 o de la 3.
- **Cómo sí:** de a poco y con regla. Cada módulo que toca el restyle (BL-064) termina más chico que como empezó, y un test de CI impide que un archivo grande siga creciendo.

### Opción 3 — Manifiesto de módulos

Un cargador chico (`js/boot.js`) que lee una lista (`js/modules.js`: archivo y versión) e inserta los scripts. `index.html` se toca una vez para cargar el cargador y después no se toca más para sumar módulos.

- **Beneficio:** resuelve el problema 2 de raíz y da cache-busting por versión (RSK-020) sin tocar el HTML.
- **Riesgo técnico real:** los scripts insertados por JS cargan **después** de `DOMContentLoaded`. Los módulos heredados que se enganchan a ese evento quedarían mudos. Por eso: los módulos actuales siguen en `index.html` como están; el manifiesto es solo para los módulos nuevos, escritos para arrancar con el documento ya cargado (`readyState`). El orden se respeta con `async = false`.
- **Dependencia:** necesita un único cambio en `index.html`: el canal de parches, o que Pablo suba ese cambio a mano una vez.
- **Compatibilidad:** buena con DEC-004 (IIFE + `window.*`). No suma build ni dependencias.

### Resumen

| | Resuelve escribir grandes | Resuelve sumar archivos | Costo | Riesgo | Sola alcanza |
|---|---|---|---|---|---|
| 1 Parches | Sí | Sí (vía `index.html`) | Medio | Medio, mitigado | Sí, pero los monolitos siguen creciendo |
| 2 Archivos chicos | Sí, a largo plazo | No | Alto | Medio | No, depende de 1 o 3 |
| 3 Manifiesto | No | Sí | Bajo | Bajo-medio | No |

## 4. Recomendación: combinar las tres, en orden 1 → 3 → 2

- La **1** es la llave: sin ella nada más se puede hacer, y es el seguro para los archivos que nunca van a bajar de 64 KB (`api-gw2.js`, `router.js`).
- La **3** evita volver a tocar `index.html` y termina con el «no puedo sumar archivos».
- La **2** es la regla de crecimiento: se aplica de a poco, nunca como migración masiva.

No recomiendo «no tocar nada y solo achicar»: sin el canal no se puede achicar (punto 3, opción 2).

**Datos generados** (`legendary-*.js`): no se editan a mano ni por parche. Los regenera un workflow con `tools/legendary/` (siguiente paso natural después de BL-065, no parte de esta propuesta).

### DEC-035 propuesta — Crecimiento modular y canal de parches

1. **Presupuesto de tamaño:** un archivo de la app apunta a ≤ 40 KB. Un archivo que ya pasa los 48 KB no puede crecer: un test en `app-checks` compara contra una línea base, como un trinquete, y la línea base solo baja.
2. **Archivos nuevos por el manifiesto:** todo JS nuevo entra por `js/modules.js`; `index.html` solo cambia por el cargador o por algo que no se pueda resolver de otra forma.
3. **Canal de parches:** un archivo de más de 40 KB se modifica por parche; uno de menos, como hasta ahora. Solo en DEV.
4. **Achicar al pasar:** cada módulo que se renueva extrae su vista a un archivo nuevo y deja el original más chico. Primer candidato: la Cámara del Brujo (`wv-purchase-detail.js`, 91 KB).
5. **Producción:** sin cambios. Lo que se promueve y cómo lo sigue decidiendo Pablo.

## 5. Roadmap por micro-ciclos

| Paso | Qué | Resultado verificable |
|---|---|---|
| FP-1 | Script `apply-patch.cjs` + tests locales (ancla única, sha base, todo o nada, rechazo con motivo) | Tests y mutaciones en local; nada en `.github/workflows` todavía |
| FP-2 | Workflow `factory-patch.yml` + prueba por el camino de error primero (LES-016): un parche con sha base equivocado tiene que dar RESULT «rechazado» | Leo RESULT; el archivo no cambió |
| FP-3 | Prueba feliz sobre un archivo inofensivo (por ejemplo `docs/`) | RESULT «aplicado», blob nuevo verificado, `dev-pages` disparado |
| FP-4 | Primer uso real: `index.html` carga `js/boot.js` + `viewport-fit=cover` + el script duplicado de BL-005 | DEV andando, validación visual de Pablo |
| FP-5 | Manifiesto `js/modules.js` con un módulo de prueba y versión `?v=` | Se carga en orden, con la caché renovada |
| FP-6 | Test trinquete de tamaño en `app-checks` + DEC-035 + LES | CI protege el presupuesto |
| → | Vuelve BL-064: Cámara del Brujo ya con la regla de achicar al pasar | |

Cada paso es un micro-ciclo con su commit, su checkpoint en `status.md` y la validación de Pablo cuando hay algo visible.

## 6. Cómo se sostiene el modelo de trabajo

- **Micro-ciclos:** un parche pesa lo que el cambio (unos pocos KB), no lo que el archivo. Se acaba el «cambio de 2 líneas que pesa 61 KB».
- **Publicación temprana:** cada parche es un commit propio; no espera a nada más.
- **Recuperación incremental:** cada PATCH tiene su RESULT. Ante una interrupción: RESULT aplicado → seguir; rechazado → leer el motivo; sin RESULT → esperar. Nunca reenvío un parche sin mirar el sha base, que además impide aplicarlo dos veces.
- **Resiliencia:** si Actions no responde, nada se rompe: el archivo queda igual y lo chico se sigue publicando como hoy. El canal es un camino más, no el único.
