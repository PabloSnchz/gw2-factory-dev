# 🐈‍⬛ Briefing — La Bóveda del Gato Negro

> Estado al 2026-10-22. Reemplaza al briefing de la v6.6.2. Lo mantiene la Factory (Shiruvana) en cada cierre de trabajo.

## Qué es

Una webapp para jugadores de Guild Wars 2: cartera, inventario, metas, actividades, raids, la Cámara del Brujo y la Armería Legendaria, con varias cuentas a la vez. Vanilla JS en módulos IIFE (`window.*`), sin build ni dependencias de npm; todo corre en el navegador contra la API pública de GW2 con las API keys del jugador.

| Entorno | Dónde | Quién decide |
|---|---|---|
| Producción | `gw2-wallet-ligero` → GitHub Pages | Pablo, siempre por instrucción explícita |
| Desarrollo | `gw2-factory-dev` → https://pablosnchz.github.io/gw2-factory-dev/ (DEC-026) | La Factory |

## Qué hay hoy

| Área | Estado |
|---|---|
| Identidad | Gato Negro oficial como logo y favicon; theme oficial "Gato Negro" por defecto, "Bóveda" queda como opción. Mi voz aparece donde le hablo al jugador: bienvenida, modal de API Keys y guías (FEAT-004) |
| Cartera, Logros, Cámara del Brujo, Dashboards | Estables desde la v6.6.2 |
| Meta & Eventos | Metas de Janthir Wilds y Visions of Eternity, convergencias con tipo propio y filtro de expansión armado desde los datos (`meta.js` 3.5.0, FEAT-005) |
| Actividades — PSNA | Dice de qué día son los lugares y cuándo cambian (08:00 UTC), cuenta regresiva, ícono del waypoint servido por La Bóveda y botones "Copiar" (`activities.js` 3.23.0, FEAT-003) |
| Armería Legendaria | Catálogo de 206 legendarias con su expansión real y chips de la comunidad (Abalorio, Espaldar); cola de crafteo de hasta 5. Cada legendaria se abre como **pantalla** dentro de la Armería: receta en árbol a página completa y Materiales totales con lo que tenés en banco y almacén ("Tengo"). Si los íconos no cargan, la pantalla lo dice y ofrece Reintentar (`legendary-tracker.js` 1.3.0, `legendary-tree-ui.js` 2.2.0, `render-catologo.js` 1.1.0) |
| Raids y Strikes | Estables; navegación cruzada |
| Inventario y Personajes, Conversor, Cuentas | Estables. La sincronización con GitHub se retiró (DEC-030, BL-070 TOP-4) |

La versión real de cada archivo está en su encabezado. El `?v=` de `index.html` es solo para el caché del navegador y puede ir atrasado.

## Cómo se trabaja

### Antes de tocar código
- **Verificar contra el código real** (LES-001). Los snippets de cualquier documento pueden estar viejos.
- **Diagnosticar la causa** antes de probar arreglos (LES-002). Cada módulo tiene `_debug()` (ver `DESARROLLADORES.md`).
- **CSS:** para ver qué regla gana, el panel Styles de DevTools, no mediciones (LES-005).

### Al cambiar
- **Cambios quirúrgicos**, no reescrituras (LES-007).
- **Arquitectura** (DEC-004): CSS en 3 capas (`main.css` → `theme-polish.css` → `*-theme.js`, que solo toca `borderLeft`, nunca `!important`); router-first; un solo canal de cambio de cuenta, `gn:tokenchange`; claves nuevas con prefijo `gn:` por `storage.js`.
- **Antes de reutilizar una clase CSS**, mirar qué trae (LES-004).
- **Si la API no da el dato, no se fuerza la funcionalidad** (LES-006). Hechos verificados de la API: `GW2-API-HECHOS.md`.

### Tests
`node --test tests/*.test.cjs tests/*.test.js tests/*.smoke.js` corre todo, y CI (`app-checks`) lo hace en cada push. Son 95 archivos: los propios de DEV (`.test.cjs`) y 73 del legado de QwenPaw que siguen valiendo (ver `tools/legacy/README.md`).

### Datos que se generan
Catálogo, recetas y precursores de la Armería se regeneran con `tools/legendary/` (ver su README). No se editan a mano.

## Documentos

| Documento | Para qué |
|---|---|
| `DESARROLLADORES.md` | APIs públicas, eventos, storage y depuración |
| `CHANGELOG-FACTORY.md` | Qué cambió desde 2026-10-19, separado en producción y DEV. Lo anterior, en `../CHANGELOG.md` |
| `GW2-API-HECHOS.md` | Lo verificado de la API de GW2 (límites, logros, endpoints) |
| `user-guide.html` («Primeros pasos»), `user-guide-avanzado.html` («Guía por módulo») | Guías para el jugador; las vigila `tests/guides-content.test.cjs` |
| `../privacy.html` | Qué datos se guardan y dónde; lo vigila `tests/privacy.test.cjs` |
| `ONBOARDING.md`, `Modulos JS Referencia.md` | **Referencia histórica** de la v6.6.2: sirven para entender el porqué de módulos viejos, no describen la Armería ni lo agregado después. Ante una diferencia, manda el código |
| `../ai-memory/` | Memoria de la Factory: decisiones (DEC), lecciones (LES), backlog y estado |

## Si algo no se entiende

Preguntar antes de cambiar. Es mejor frenar dos minutos que entregar código roto.
