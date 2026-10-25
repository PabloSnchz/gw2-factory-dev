# FEAT-014 — Raids renovado

- **Estado:** HECHO EN DEV (2026-10-25 00:15Z), espera la validación de Pablo.
- **Fecha:** 2026-10-24 15:49Z (RAI-0) → 2026-10-25 00:15Z (RAI-6).
- **Backlog:** BL-070, paso 1 (Raids y Strikes).
- **Propuesta:** `docs/propuestas/propuesta-raids-bl070.html` (366801f), aprobada con D1 a D4 (2026-10-24 15:57Z).
- **Producción:** no. La promoción la decide Pablo.

## Qué cambió para el usuario

- **Un solo módulo, «Raids».** Antes había Raids y Strikes por separado. Strikes nunca marcaba nada porque la API no informa los encuentros nuevos desde la unificación del 2026-02-03. Ahora es un solo módulo con dos pestañas:
  - **Alas:** las 8 alas, con 30 jefes y eventos.
  - **Encuentros:** 16 encuentros.
- **Marcador viejo.** `#/account/strikes` lleva a la pestaña Encuentros.
- **Cabecera:** hora local, servidor y reset semanal.
- **4 indicadores:**
  - alas;
  - conocimiento legendario: el de la cartera y el que queda por cobrar (44 por semana);
  - fragmentos por cobrar (tope 800) o cristales de Gaeting (moneda 77, tope 150);
  - encuentros.
- **Mi línea:** el ala empezada que está más cerca de terminarse.
- **Tarjetas:** cada una muestra la miniatura oficial, lo que da, el modo desafío (+10) y la dificultad de 1 a 5.
- **Estados honestos:** si una lectura falla dice «Sin datos», nunca un «Pendiente» falso.
- **Marcado automático:** 14 de los 16 encuentros se marcan solos con los objetivos del logro semanal 9125.
- **Marcado a mano:** Forjando acero y Nexo de la Eternidad se marcan con «Marcar hecho» (clave `gn:raids:marks`, guardada por cuenta con una huella, nunca la Key; vale hasta el reset).
- **Ficha a pantalla completa** de cada encuentro, como la de la legendaria:
  - **«Lo que te llevás»:** conocimiento legendario, fragmentos o cristales, el cofre con su ícono y su nombre en español.
  - **«Lo que te puede tocar del cofre»:** por rareza.
  - **«Modo desafío».**
  - **«Cómo se pelea»:** resumen, «Antes del jefe», fases en una línea de tiempo, hasta 7 mecánicas con su rol, «En modo desafío cambia», «Shiruvana recomienda» y las fuentes con la fecha.
- **Ficha en el celular:** dos pestañas, Recompensas y Cómo se pelea.
- **Sin videos de relleno.** Los 46 enlaces viejos eran el mismo video. Ahora solo hay enlaces verificados a la wiki oficial y a MetaBattle.

## Pasos

| Paso | Qué | Fecha | Evidencia |
|---|---|---|---|
| RAI-0 | Propuesta visual | 2026-10-24 15:49Z | `propuesta-raids-bl070.html` 366801f, aprobada 15:57Z |
| RAI-1 | Catálogo verificado: 46 encuentros, íconos oficiales | 16:15Z | `assets/data/raids/catalog.json` 17e273e, `tests/raids-catalog.test.cjs` |
| RAI-2 | Vista unificada (Alas / Encuentros, filtros, marcas) | 16:55Z | `js/raids-view.js` 1.0.0, validado 18:36Z |
| RAI-3 | Ficha a pantalla completa con recompensas | 19:05Z | `js/raids-sheet.js` 1.0.0, `rewards.json` (36 cofres semanales y 12 magníficos), validado 19:12Z |
| RAI-4 | «Cómo se pelea» por tandas | 19:25Z → 23:14Z | `mechanics/jw`, `hot`, `pof`, `ibs`, `core`, `eod`, `soto` (.json); 44 de 46 fichas |
| RAI-5 | Retiro de Strikes y nombre «Raids» | 23:27Z → 23:57Z | PATCH-054 a PATCH-063; `strike-tracker.js` borrado (580165c); LES-039 |
| RAI-6 | Revisión final | 2026-10-25 00:15Z | PATCH-064, `tests/raids-a11y.test.cjs` (29fdc74), RUN-040 verde |

## Revisión final (RAI-6)

| Eje | Qué medí | Hallazgo | Arreglo |
|---|---|---|---|
| 19 themes | Cada `color:` de las dos hojas contra bg-0, bandeja, tarjeta, pista y cabecera | MEDIO: el acento `--acc-1` como texto (enlaces, «marcado por vos», rareza «raro») no llegaba a 4.5:1 en 8 themes (bóveda, discord, dracula, fluent, gruvbox, macOS, notion, solarized-dark). El color del módulo en `.rs-tip b` daba 2.40 en macOS y 2.62 en Notion. El error en la cabecera daba 4.28 y 4.30 | Los enlaces van con `--gn-link`; el consejo y el error van en el texto principal, y el error lleva un borde rojo. Ahora los 19 themes pasan |
| Teclado | Pestañas de la lista y de la ficha | BAJO: las pestañas de la ficha no tenían `aria-controls` ni foco itinerante | Patrón tablist completo: flechas, Inicio y Fin; `aria-controls` a `rsPaneRew` y `rsPaneFight` |
| Lector de pantalla | Regiones, nombres y estados | Correcto: cada ala es una región con su título, las filas dicen «ver ficha», la dificultad se lee y los íconos son decorativos | — |
| Celular | Objetivos táctiles | Correcto: 44 px en pestañas, filtros y botones | — |
| Movimiento reducido | `prefers-reduced-motion` | Correcto en las dos hojas | — |
| Restos | Router | BAJO: `MODULOS_CON_LATCH`, `showPanel` y `updateSidebarFor` todavía nombraban StrikeTracker | `router.js` 2.18.2 |

## Verificación

- `tests/raids-a11y.test.cjs`: 6 tests. Cubre el contraste en los 19 themes, que no haya acento ni color del módulo como texto, el marco común, el teclado, el lector de pantalla, el celular, el movimiento reducido y que no queden restos de Strikes.
- `tests/raids-view.test.cjs`: 12 tests. `tests/raids-sheet.test.cjs`: 18 tests. `tests/raids-catalog.test.cjs`: 10 tests.
- RESULT-064: suite verde antes y después. RUN-040 verde.

## Cómo evaluarlo

1. En DEV, Ctrl+F5 y abrir Raids desde la barra lateral.
2. Cambiar a un theme claro (macOS o Notion): los enlaces de las fuentes, «marcado por vos» y el consejo de la ficha se leen bien.
3. Abrir la ficha de un encuentro (por ejemplo, Greer). En el celular, pasar entre Recompensas y Cómo se pelea con las flechas del teclado o tocando las pestañas.
4. Entrar con el marcador viejo `#/account/strikes`: abre Raids en la pestaña Encuentros.

## Riesgos y deudas

- **MEDIO:** Visions of Eternity (Guardian's Glade y Nexo de la Eternidad) no tiene «Cómo se pelea». El Nexo no tiene guía en la wiki ni en MetaBattle. Los datos de Guardian's Glade están listos para publicar cuando haya una fuente verificada (LES-030: nada provisorio).
- **BAJO:** la región `aria-live` de la vista se rearma en cada render, así que algún aviso puede repetirse o perderse con el lector de pantalla. No lo toqué en este ciclo.
- **BAJO:** el router conserva la ruta `#/account/strikes` a propósito, como alias de Raids.
- **BAJO:** el contenido de los cofres magníficos de Void y Decima no se pudo verificar. La ficha lo dice y enlaza la wiki.
- `raid-tracker.js` (congelado) sigue cargándose como base del panel. `tools/legacy/` no se toca.
