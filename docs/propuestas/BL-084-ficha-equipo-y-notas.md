# BL-084 — Ficha de build con equipo y notas en castellano (estilo Snow Crows)

- Fecha: 2026-10-30 · Pedido de Pablo (con capturas de Snow Crows) · Estado: EN CURSO (aprobado 00:47Z, «están perfectas ok arranca»). EQ-1, EQ-2, EQ-3, EQ-3b y EQ-4 hechos.
- Maquetas: `docs/propuestas/bld2-maqueta.html` (ficha) y `docs/propuestas/bld2-biblioteca.html` (lista → ficha)
- Base: Builds en PRD desde BL-083 (PRD 2adaada, 28 archivos = manifiesto).

## 1. Producto
**Problema:** hoy la ficha muestra rasgos y habilidades. Faltan el equipo y el «cómo funciona». Sin eso el jugador tiene que ir a Snow Crows igual.
**Valor:** la ficha completa en castellano: qué ponerse, por qué y cómo jugarla. Es el diferencial frente a sitios que están solo en inglés.
**Prioridad:** alta (pedido explícito; el módulo ya está en PRD).

## 2. Lo que investigué
| Fuente | Qué ofrece | Cómo lo usamos |
|---|---|---|
| Snow Crows (ficha de build) | Secciones plegables «— Gear», «— Traits & Skills», «— Rotation & Extras». Desplegables: Skill Notes, Skill Reference Guide, Trait Notes, Equipment Notes, Relic Notes, listas de prioridad. El equipo va en 3 tablas: armadura, abalorios + reliquia, juegos de armas + «Other Items». | Copiamos la **estructura**. El equipo se marca con ids oficiales (GW2 Armory: `data-armory-ids`, `-stat`, `-upgrades`), así que tomamos **solo datos**. |
| Snow Crows (lista de builds) | Una barra de filtros. Lista agrupada por profesión y élite, una fila por build (armas, fecha, rol). Se toca y abre la ficha en su página. | Misma estructura para la Biblioteca (sección 4b). |
| API oficial (`lang=es`) | Nombres, íconos y descripciones **en castellano** de objetos, estadísticas, runas (bonos 1–6), sellos, reliquias, habilidades y rasgos. Verificado en RUN-226. | Todo lo que se ve y los tooltips. |
| MetaBattle | Variantes de armas, habilidades y equipo, y uso. | Fuente de builds de WvW. Solo datos. |
| Hardstuck / Discretize | Builds y guías, y el optimizador de equipo de Discretize (GPL). | Referencia de diseño. |

## 3. Decisión de contenido (DEC-046, la publico al empezar)
- **Datos** (qué pieza, estadística, runa, sello, reliquia y comida): sí, con crédito y enlace a la fuente.
- **Textos de Snow Crows, MetaBattle y Discretize: NO los traduzco ni los copio.** Traducirlos también es copiarlos.
- **Notas en castellano: las escribo yo, con palabras propias**, apoyadas en la descripción **oficial** de la API (en el tooltip) y en los datos de la build.
- Cada nota dice «Notas de Shiruvana · revisadas para el parche X». La rotación completa queda enlazada en la fuente.

## 4. Arquitectura
- `catalog.json`: campo nuevo `gear` por build, solo con ids:
  `{armor:[{slot,stat,rune}], trinkets:[...], relic, weapons:[{set,slot,type,stat,sigils:[..]}], food, utility, jade, enrich}`.
  - En PvP: `{amulet, rune, relic, sigils}`.
- `assets/data/builds/notes.json` (nuevo): mis notas por build, con las secciones `skills`, `traits`, `gear`, `relic`, `concepts`, `opener`, `loop` y `cc`.
  - El texto hace referencia a ids (`{s:6161}` o `{t:2279}`), y la app pone el ícono y el nombre oficial en castellano.
- `.github/scripts/bld-curate.cjs` lee también el equipo (ids) de cada ficha de Snow Crows.
  - Corre solo cada semana en **DEV y en PRD** (DEC-041).
  - Si cambia el equipo, la nota queda «para revisar».
- `js/bld-sheet.js` (nuevo): la ficha completa, desacoplada. La usan la Biblioteca, Mis builds, el Importar y el enlace para compartir.
- `js/bld-ref.js` suma `items`, `itemstats` y `skills` en castellano, en lote y en memoria (sin `localStorage` nuevo).
- El equipo entra en el **AE2** con los ids reales de la build.

## 4b. Cómo encaja con la Biblioteca (restyle, sí)
Hoy la ficha se abre **dentro** de la tarjeta (ocupa todo el ancho y empuja la lista). Con equipo y notas sería una página enorme metida en una tarjeta, así que eso cambia:
- **La ficha pasa a ser su propia pantalla**: `#/builds/ver/<id>`. Arriba lleva «← Biblioteca», el camino (modo · profesión · élite) y «anterior / siguiente» dentro de los filtros actuales.
- **Volver** deja la Biblioteca como estaba: mismos filtros, mismo orden, misma fila con foco. El estado ya vive en memoria: no se agrega `localStorage`.
- **Enlace para compartir:** `#/builds/b/<código>` sigue funcionando y abre la misma ficha (para builds que no son de la Biblioteca).
- **Restyle de la Biblioteca** (el marco, la cabecera y las pestañas no cambian):
  - **filtros en una sola barra** (profesiones, modo, rol y búsqueda); «Más filtros» queda para arma, daño y vigencia;
  - **lista agrupada por profesión → élite**, una **fila** por build: nombre, armas, modo y sub, dificultad, etiquetas (vigente, rol, bendición) y DPS con barra. Al pasar el cursor, filo del color de la profesión. Se toca y abre la ficha;
  - «Por profesión» / «Más DPS primero» (este último en lista plana);
  - en el celular la fila pasa a dos líneas.
- **Mis builds:** mismas filas, en un solo grupo «Mis builds». Abren la misma ficha con «Editar» y «Borrar».
- Se pierde la vista de tarjetas grandes con la franja de élite (BUI-6b). La identidad de la élite pasa a la columna de élite del grupo y a la cabecera de la ficha.

## 5. Micro-ciclos (uno por vez, suite verde en cada uno)
| MC | Qué | Resultado visible |
|---|---|---|
| EQ-1 | Curación del equipo: el script lee los ids de Snow Crows → `gear` en las 96 builds de Snow Crows, más tests | (datos) |
| EQ-2 | Referencias en castellano: objetos, estadísticas, runas, sellos, reliquias, comida (API `lang=es`), en lote y con caché | (motor) |
| EQ-3 | Nueva ficha `bld-sheet.js` en su ruta `#/builds/ver/<id>`, con «← Biblioteca», anterior/siguiente y secciones plegables | ficha en su pantalla |
| EQ-3b | **Restyle de la Biblioteca**: barra de filtros, grupos profesión → élite, filas con DPS; volver conserva filtros y foco; Mis builds con las mismas filas | lista nueva |
| EQ-4 | **Equipo**: 3 tablas como Snow Crows, con íconos oficiales, tooltips accesibles y resumen de estadística | ficha de equipo |
| EQ-5 | **Rasgos y habilidades**: banda de habilidades + armas 1–5/F1–F3; 3 líneas con su fondo oficial y los 9 rasgos; guía de teclas | como la captura 1 |
| EQ-6 | **Desplegables de notas** (habilidades, rasgos, equipo, reliquia), con la descripción oficial debajo | notas |
| EQ-7 | **Cómo se juega**: conceptos, apertura, bucle y control, con íconos en línea | como la captura 3 |
| EQ-8 | Notas escritas: primero las 36 de PvE, después WvW y PvP. Las que no tengan nota muestran «nota en preparación» | contenido |
| EQ-9 | AE2 con el equipo real + Editor e Importar con la misma ficha | exportar |
| EQ-10 | Revisión: 19 temas AA, teclado, celular, rendimiento < 200 ms, docs y dashboard | cierre |

Builds de MetaBattle (8, WvW): su equipo se carga a mano en EQ-8.

## 5b. Avance
| MC | Estado | Qué quedó |
|---|---|---|
| EQ-1 | HECHO 04:15Z | `assets/data/builds/gear.json` (96 builds, ids oficiales) aparte de `catalog.json` para que la lista siga liviana; lo mantiene la curación semanal (`bld-curate.cjs` + `bld-gear-scrape.cjs`). DEC-046. |
| EQ-2 | HECHO 2026-10-30 05:05Z | `js/bld-items.js` 1.0.1, módulo propio (no en `bld-ref.js`): carga `gear.json` al abrir una ficha y trae objetos, estadísticas y amuletos en castellano por tandas de 150, con caché semanal en IndexedDB (no `localStorage`). `sheet()` arma armadura, abalorios, reliquia o amuleto, juegos de armas con sigilos, extras y resumen. RUN-236: 96/96 resueltas. `boot.js` 1.3.0: hasta 20 módulos por ruta. |
| EQ-3 | HECHO 2026-10-30 05:25Z | `js/bld-sheet.js` 1.0.0: ruta `#/builds/ver/<id>` (la pestaña Biblioteca queda marcada); «← Biblioteca» vuelve con los mismos filtros y el foco en esa build; camino modo · profesión · élite; anterior/siguiente sobre lo filtrado; franja de la élite, bench y acciones; secciones plegables Equipo (tablas con `bld-items`), Rasgos y habilidades (código validado) y Cómo se juega (aviso hasta EQ-6/8). `bld-view` 1.6.0, `bld-lib` 1.8.0. RUN-239: 71 tests verdes. |
| EQ-3b (1/2) | HECHO 2026-10-30 05:50Z | `js/bld-rows.js` 1.0.0 (puro): grupos por profesión con su color, columna por élite y una fila por build (nombre, armas, modo, dificultad, etiquetas, DPS con barra); la fila entera es un enlace a su ficha. `bld-lib` 1.9.0: una sola barra de filtros con búsqueda, «Orden: Por profesión / Más DPS primero» (plana), foco de vuelta en la fila. RUN-240: 75 tests verdes. |
| EQ-3b (2/2) | HECHO 2026-10-30 09:33Z | PATCH-310. `bld-mine` 1.5.0: las mismas filas (lista plana), etiquetas «basada en…/propia/con notas» y el DPS de la build de la Biblioteca en que se basa (mismo código o misma fuente) o «Tuya · sin bench propio». `bld-sheet` 1.1.0: ficha propia `#/builds/ver/m:<id>` con «← Mis builds», anterior/siguiente por Mis builds, secciones Nombre y notas (editables) / Equipo (de la build base, o aviso) / Rasgos y habilidades, y Editar, Duplicar, Borrar con confirmación. `bld-view` 1.6.1: ahí queda marcada la pestaña Mis builds. Suite completa verde. |
| EQ-4 | HECHO 2026-10-30 11:45Z | `js/bld-gearview.js` 1.0.0, módulo propio (la ficha solo lo llama): 3 tarjetas como Snow Crows —Armadura (estadística, pieza y runa de cada una), Abalorios y reliquia (en PvP, amuleto y reliquia) y Armas por juego con mano, tipo y sigilos, más «Otros»—. Ícono oficial con el borde de su rareza; la descripción oficial (bonos de la runa numerados, efecto del sigilo, reliquia o comida, atributos de la estadística) se abre con cursor, toque o Tab, el lector la lee por `aria-describedby` y Escape la cierra. Resumen de estadísticas con sus atributos. `bld-sheet` 1.2.0 sin tablas. PATCH-312/313. |

Cambios respecto del plan: el equipo vive en `gear.json` (no en `catalog.json`) y las referencias en `bld-items.js` (no en `bld-ref.js`), para no tocar módulos que ya funcionan. Snow Crows marcó la estadística 1967 (no existe) en 2 builds de WvW: se muestra la de la pieza.

## 6. Riesgos
- **MEDIO:** si Snow Crows cambia el formato de su página, la curación se rompe. Mitigación: el test falla y la build queda «para revisar».
- **MEDIO:** el volumen de notas (104 builds). Mitigación: van por tandas; la ficha sirve igual sin ellas.
- **MEDIO:** la ruta nueva de la ficha toca el router de Builds. Mitigación: tests de ida y vuelta de rutas, y el enlace para compartir viejo sigue funcionando.
- **BAJO:** muchos pedidos a la API. Mitigación: lotes de 200 ids y caché por sesión.
