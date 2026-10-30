# BL-084 — Ficha de build con equipo y notas en castellano (estilo Snow Crows)

- Fecha: 2026-10-30 · Pedido de Pablo (con capturas de Snow Crows) · Estado: propuesta, espera OK
- Maqueta: `docs/propuestas/bld2-maqueta.html` (DEV Pages: /gw2-factory-dev/docs/propuestas/bld2-maqueta.html)
- Base: Builds en PRD desde BL-083 (PRD 2adaada, 28 archivos = manifiesto).

## 1. Producto
**Problema:** hoy la ficha muestra rasgos y habilidades. Faltan el equipo y el «cómo funciona». Sin eso el jugador tiene que ir a Snow Crows igual.
**Valor:** la ficha completa en castellano: qué ponerse, por qué y cómo jugarla. Es el diferencial frente a sitios que están solo en inglés.
**Prioridad:** alta (pedido explícito; el módulo ya está en PRD).

## 2. Lo que investigué
| Fuente | Qué ofrece | Cómo lo usamos |
|---|---|---|
| Snow Crows (ficha de build) | Secciones plegables «— Gear», «— Traits & Skills», «— Rotation & Extras». Desplegables: Skill Notes, Skill Reference Guide, Trait Notes, Equipment Notes, Relic Notes, listas de prioridad. El equipo va en 3 tablas: armadura, abalorios + reliquia, juegos de armas + «Other Items» (comida, utilidad, núcleo de robot de jade, enriquecimiento). | Copiamos la **estructura**. El equipo se marca con ids oficiales (GW2 Armory: `data-armory-ids`, `-stat`, `-upgrades`), así que tomamos **solo datos**: pieza, estadística, runa y sellos. |
| API oficial (`lang=es`) | Nombres, íconos y descripciones **en castellano** de objetos, estadísticas, runas (bonos 1–6), sellos, reliquias, habilidades y rasgos. Verificado en RUN-226. | Todo lo que se ve y los tooltips. |
| MetaBattle | Variantes de armas, habilidades y equipo, y uso. | Fuente de builds de WvW. Solo datos (estadística por pieza). |
| Hardstuck / Discretize | Builds y guías, y el optimizador de equipo de Discretize (GPL). | Referencia de diseño. Ya enlazamos el simulador y el optimizador. |

## 3. Decisión de contenido (DEC-046, la publico al empezar)
- **Datos** (qué pieza, estadística, runa, sello, reliquia y comida): sí, con crédito y enlace a la fuente.
- **Textos de Snow Crows, MetaBattle y Discretize: NO los traduzco ni los copio.** Son obra de sus autores (las guías de Discretize ni siquiera tienen licencia). Traducirlos también es copiarlos.
- **Notas en castellano: las escribo yo, con palabras propias**, apoyadas en dos cosas:
  - la descripción **oficial** de cada pieza, que sale de la API en castellano y va en el tooltip;
  - los datos de la build.
- Cada nota dice «Notas de Shiruvana · revisadas para el parche X». La rotación completa y detallada queda enlazada en la fuente.

## 4. Arquitectura
- `catalog.json`: campo nuevo `gear` por build, solo con ids:
  `{armor:[{slot,stat,rune}], trinkets:[...], relic, weapons:[{set,slot,type,stat,sigils:[..]}], food, utility, jade, enrich}`.
- `assets/data/builds/notes.json` (nuevo): mis notas por build, con las secciones `skills`, `traits`, `gear`, `relic`, `concepts`, `opener`, `loop` y `cc`.
  - El texto hace referencia a ids (`{s:6161}` o `{t:2279}`), y la app pone el ícono y el nombre oficial en castellano.
- `.github/scripts/bld-curate.cjs` lee también el equipo (ids) de cada ficha de Snow Crows.
  - Corre solo cada semana en **DEV y en PRD** (DEC-041).
  - Si cambia el equipo, la nota queda «para revisar»: el aviso no se ve como si estuviera al día.
- `js/bld-sheet.js` (nuevo): la ficha completa (cabecera, navegación de secciones, Equipo, Rasgos y habilidades, Cómo se juega), desacoplada de la Biblioteca.
  - La usan la Biblioteca, Mis builds y el enlace para compartir.
- `js/bld-ref.js` suma `items`, `itemstats` y `skills` en castellano, pedidos en lote y guardados en memoria (sin `localStorage` nuevo).
- El equipo entra en el **AE2** (bld-ae2.js ya existe) con los ids reales de la build, no con la sugerencia por reglas.

## 5. Micro-ciclos (uno por vez, suite verde en cada uno)
| MC | Qué | Resultado visible |
|---|---|---|
| EQ-1 | Curación del equipo: el script lee los ids de Snow Crows → `gear` en las 69 builds de Snow Crows, más tests | (datos) |
| EQ-2 | Referencias en castellano: objetos, estadísticas, runas, sellos, reliquias, comida (API `lang=es`), en lote y con caché | (motor) |
| EQ-3 | Nueva ficha `bld-sheet.js`: cabecera con bench, navegación de secciones y secciones plegables | ficha nueva |
| EQ-4 | **Equipo**: 3 tablas como Snow Crows, con íconos oficiales, tooltips accesibles (cursor, foco y toque) y resumen de estadística | ficha de equipo |
| EQ-5 | **Rasgos y habilidades**: banda de habilidades + armas 1–5/F1–F3; 3 líneas con su fondo oficial y los 9 rasgos (elegidos resaltados); guía de teclas | como la captura 1 |
| EQ-6 | **Desplegables de notas** (habilidades, rasgos, equipo, reliquia), con la descripción oficial debajo | notas |
| EQ-7 | **Cómo se juega**: conceptos, apertura, bucle y control, con íconos en línea | como la captura 3 |
| EQ-8 | Notas escritas: primero las 36 de PvE, después WvW y PvP. Las que todavía no tengan nota muestran equipo y descripciones oficiales y «nota en preparación» | contenido |
| EQ-9 | AE2 con el equipo real + Mis builds y Editor con la misma ficha | exportar |
| EQ-10 | Revisión: 19 temas AA, teclado, celular, rendimiento < 200 ms, docs y dashboard | cierre |

Builds de MetaBattle (WvW): su equipo se carga a mano en EQ-8 (son 8), sin leer su página automáticamente.

## 6. Riesgos
- **MEDIO:** si Snow Crows cambia el formato de su página, la curación se rompe. Mitigación: el test del script falla y la build queda «para revisar»; no se muestra equipo viejo como si estuviera vigente.
- **MEDIO:** el volumen de notas. Mitigación: las escribo por tandas y la ficha funciona igual sin ellas (datos más descripciones oficiales).
- **BAJO:** muchos pedidos a la API. Mitigación: lotes de 200 ids y caché por sesión.
