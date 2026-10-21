# FEAT-004 — La Bóveda con la identidad de Gato Negro y mi voz

- Estado: EN PRODUCCIÓN desde 2026-10-21 06:45Z (gw2-wallet-ligero `4629e7e`), por orden de Pablo (BL-039)
- Fecha: 2026-10-21
- Backlog: BL-038 (FACTORY-BOVEDA-UI-001) · Decisiones: DEC-025, DEC-024, DEC-010, DEC-026
- Commits (gw2-factory-dev): `css/themes/gato.css` · `js/theme-selector.js` 1.2.0 · `assets/brand/gato-negro.svg` · `index.html` (`e881e38`, `10ef622`) · guías (`84c5a4e`) · `js/shiruvana.js` (`2f467d2`) · `js/shiruvana-places.js` (`57dd06c`)
- Commit (bio): `9551c57`

## Qué resuelve

La Bóveda no se parecía al resto del ecosistema: logo y favicon viejos, un theme propio que no seguía el Gato Design System, guías con otra marca y ninguna voz que acompañara al jugador. Gato Negro es la marca; yo soy la voz que le habla al jugador.

## Qué cambió

- **Marca:** el gato oficial del panel (`assets/brand/gato-negro.svg`) es el logo de la cabecera, el del pie y el favicon. No queda la marca anterior.
- **Theme oficial "Gato Negro"** (`css/themes/gato.css`), basado en el GDS. Es el theme por defecto. "Bóveda" sigue disponible en el selector.
  - El selector 1.2.0 migra una sola vez a quien tenía "Bóveda" guardado. La marca `gn:theme:official` = `gato-v1` evita repetir la migración: si el jugador después elige otro theme, se respeta.
- **Guías** (básica y avanzada): el gato oficial y el theme que el jugador tenga activo.
- **Enlace a la bio:** colores oficiales fijos (obsidiana y arcano, 6,7:1), no siguen el theme. La página de la bio (repo `bio`) usa el theme oficial y el gato en el enlace a La Bóveda.
- **Mi voz** (`js/shiruvana.js` + `js/shiruvana-places.js`, cargados al final de los módulos):
  - en la bienvenida me presento. Sin API Key te digo cómo empezar; con API Key te saludo de nuevo;
  - en el modal de API Keys explico qué necesito y adónde viaja la clave;
  - en el modal de guías recomiendo por cuál empezar.
  - Aparezco con avatar solo cuando hablo, nunca en datos ni métricas. El texto se inserta como texto, nunca como HTML, y los colores salen del theme activo.
- Tests: `theme-gato`, `theme-selector`, `brand`, `index-identity`, `guides-identity`, `shiruvana-voice` y `shiruvana-places` (70 en total en `tests/`). Cada micro-ciclo pasó su prueba de mutaciones.

## Cómo evaluarlo

Para mirar (Pablo), en DEV (https://pablosnchz.github.io/gw2-factory-dev/), en pantalla y en el celular:

1. Inicio: arriba de la bienvenida aparezco yo.
2. Gestión de API Keys: aparezco al principio del modal.
3. Guía: aparezco recomendando por dónde empezar, y las dos guías tienen el gato y el theme activo.
4. Cambiá a un theme claro: mi voz tiene que seguir siendo legible.

Verificado por la Factory, sin herramientas de Pablo: contraste del theme calculado, orden de carga de los scripts, migración del theme, textos insertados sin HTML y reaparición cuando la bienvenida se vuelve a dibujar, todo con tests y mutaciones.

## Riesgos y notas

- **Mismo origen que producción (DEC-026):** DEV y producción comparten `localStorage` en `pablosnchz.github.io`. Al abrir DEV queda guardado `gn:theme` = `gato`. Desde la promoción, producción también tiene `gato.css`, así que ese caso ya no deja a producción sin theme.
- **Promoción (hecha, BL-039):** 5 commits en gw2-wallet-ligero (`f1b0a32`, `be8ad33`, `b763e14`, `873028b`, `4629e7e`), cada uno deja el sitio funcionando. Todos los archivos son blobs idénticos a DEV salvo `index.html`, que es el de producción con solo los cambios de esta funcionalidad (su bloque de GA no se tocó). Los tests de FEAT-004 pasan contra el `index.html` de producción. Vuelta atrás: `c0471e0` (index.html `41b65b8b`, theme-selector.js `a7d0457a`, guías `aac11f59` y `214cd6ef`; los archivos nuevos se borran).
- `js/welcome-panel.js` todavía dibuja sus propias insignias con colores anteriores y un error de estilo (`var(--tx-1)fff`). Queda como mejora menor fuera de esta funcionalidad.
