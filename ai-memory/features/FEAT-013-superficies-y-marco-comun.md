# FEAT-013 — Superficies y marco común de la Bóveda

- **Estado:** hecho en DEV (2026-10-24 07:34Z). Cierra CAM-POLISH-001 (POL-1 a POL-4) y los pasos 4 a 8 de BL-067.
- **Fecha:** 2026-10-24
- **Backlog:** BL-067 (restyle, pasos 4 a 8) y CAM-POLISH-001
- **Propuesta aprobada:** `docs/propuestas/propuesta-cam-polish-001.html` (`d3c89f0`), aprobada por Pablo el 2026-10-24 a las 07:15Z con tres decisiones: bandeja oscura detrás de las tarjetas, anillo dorado «A UN PASO» en los íconos de los logros y un módulo de superficies reutilizable para Logros, Actividades, Raids y Strikes, Inventario y Personajes y Cuentas.
- **Autorización:** Pablo autorizó BL-067 de punta a punta sin validaciones intermedias (07:15Z).
- **Producción:** no. La decide Pablo.

## Qué cambió para el usuario

### Cámara del Brujo y Logros (POL-1 a POL-4)

- **Bandeja oscura:** el panel pasa a ser el fondo y las tarjetas se elevan sobre él. En Gato Negro: bandeja `#0f1117`, como en la maqueta. Antes la tarjeta y su panel pintaban el mismo color (1.00:1).
- **La pista de las barras vuelve:** en 17 de los 19 themes `--bg-2` era igual a `--bg-1`. Ahora la pista llega a 1.4:1 en 17 themes; en One Dark y Everforest queda más suave (1.15 y 1.33) porque esa superficie también es fondo de texto y el texto manda.
- **Profundidad:** sombra suave en tarjetas, indicadores y tablas; bordes visibles (≈1.55:1) y borde fuerte (≈1.9:1).
- **Tienda:** ícono oficial a 52 px con su anillo de rareza; lo fijado, en dorado.
- **Compras fijadas:** indicadores con filete por significado (AA, acento, ámbar, verde), íconos a 34 px, encabezados de tabla en placa.
- **Logros:** ícono oficial del logro a 52 px dentro de una placa de 60 px (regla de Pablo: nunca se oculta ni se achica); a un paso, anillo dorado y la etiqueta «A UN PASO» (el lector no la repite, la tarjeta ya lo dice); el % al lado de la barra; recompensas en placa; jerarquía ícono → título → progreso → recompensa.
- **Enlaces:** el acento ajustado para leerse en AA sobre la tarjeta elevada.

### Actividades, Raids y Strikes, Inventario y Personajes, Cuentas (pasos 4 a 8)

- Los mismos paneles con bandeja, tarjeta elevada, pista y bordes.
- **Cabecera común:** el ícono oficial del módulo a 40 px en su placa, con un anillo del color del módulo (el mismo que muestra la Bienvenida), y el título a 1.3rem con un filete del color del módulo.
- **Guarda de contraste:** cada color de texto que usan esos módulos (`--tx-2`, `--tx-3`, `--muted`, `--gw-muted`, verde, ámbar, rojo, azul y dorado) llega a 4.5:1 sobre la tarjeta y la bandeja reales en los 19 themes. Solo se corrige lo que falla, conservando el tono; Gato Negro no necesita nada.
- **Accesibilidad:** foco visible en todo lo que se toca; sin animaciones con movimiento reducido; botones y campos de 44 px en el celular; cada panel nombrado por su título.
- **Comportamiento, datos y navegación:** sin cambios. No se tocó ninguno de los siete archivos congelados (`activities.js`, `raid-tracker.js`, `strike-tracker.js`, `characters.js`, `inventory-hub.js`, `inventory-dashboard.js`, `accounts-panel.js`).

## Cómo está hecho

| Archivo | Qué hace |
|---|---|
| `js/gn-surface.js` 1.0.0 (13045 B, `b534c3f`) | Calcula desde el theme activo bandeja, tarjeta, pista, bordes, placa, enlace y sombra, y los declara solo dentro de los paneles registrados (`GNSurface.register(id)`). Como los módulos ya pintan con `--bg-1`, `--bg-2` y `--bd-*`, no hubo que tocarlos. `surfaceTokens(tokens)` les da a las guardas de contraste las superficies reales. Se reaplica al cambiar de theme. |
| `js/gn-frame.js` 1.0.0 (9139 B, `bbb18ed`) | Marco común de los siete paneles heredados: registra sus superficies y pone cabecera, guarda AA y accesibilidad. Los paneles que arma el JS al navegar (Actividades, Personajes) se marcan cuando aparecen (`hashchange`, `gn:tabchange`, `gn:render-home-nodes`). |
| PATCH-033 | `ach-view.js` 1.3.0 y `wv-view.js` 1.2.0 calculan su guarda sobre `GNSurface.surfaceTokens`; sin el módulo, igual que antes. |
| `js/modules.json` | `gn-surface.js` primero y `gn-frame.js` segundo, antes que las vistas. |

Si `gn-surface.js` o `gn-frame.js` no cargan, la Bóveda se ve exactamente como antes: todo su CSS vive dentro de `[data-gn-surface]` y `[data-gn-frame]`. Vuelta atrás: sacarlos de `js/modules.json`.

## Verificación

| Qué | Resultado |
|---|---|
| `tests/gn-surface.test.cjs` | 8/8 (RUN-017 y RUN-019): superficies en los 19 themes, AA de la Cámara y de Logros con guardas sobre superficies reales, alcance del CSS, íconos |
| `tests/gn-frame.test.cjs` | 9/9 (RUN-019): siete paneles con ícono y color de la Bienvenida, AA en los 19 themes, paneles tardíos, sin `gn-surface.js`, foco, movimiento reducido, 44 px, no nombra los congelados |
| Vecinos | `ach-view` 20/20, `wv-view` 15/15, `wv-camara-a11y` 11/11, `ach-a11y` 7/7, `ach-cards` 16/16, `index-versions`, `size-budget`, `boot`, `welcome-contrast`, `welcome-view` y `psna-day` en verde |
| Suite local con el árbol de DEV | 106/106 |
| PATCH-033 y PATCH-034 | APLICADOS, suite verde antes y después |
| Blobs publicados | idénticos a los locales |

## Riesgos y deudas

- **BAJO:** colores fijos en estilos en línea de los heredados (`#ffd36b` del contador de LI en Raids y Strikes, `typeColor` en `raid-tracker.js`) no pasan por la guarda. Se corrigen cuando esos archivos se renueven por el canal de parches.
- **BAJO:** si Cuentas redibuja su cabecera sin id, el nombre de la región se repone en el siguiente cambio de ruta.
- **Voz de Shiruvana en estos módulos:** no la agregué. Los heredados no publican sus datos (`ActivitiesAPI` solo expone token y Home Nodes) y una línea sin datos sería inventar (LES-006). Queda para cuando cada módulo exponga su estado.
- **Marco común, lo que no incluye:** la barra de arriba, los modales, los avisos y el pie siguen como estaban; el marco cubre los paneles. Los modales y avisos son globales y conviene renovarlos con su propia propuesta.
