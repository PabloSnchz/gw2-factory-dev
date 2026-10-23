# FEAT-009 — La Sidebar: la navegación de la Bóveda

- Estado: EN PRODUCCIÓN completa. SBR-1 y SBR-2 validados por Pablo y promovidos en BL-062; SBR-3, SBR-4 y SBR-5 promovidos por orden de Pablo (BL-063, 2026-10-23 14:12Z: «pasemos a producción la sidebar versión final»). Falta su mirada en pantalla sobre la versión final.
- Fecha: 2026-10-23
- Backlog: BL-061, BL-063 · Propuesta: SBR-0 (aprobada por Pablo 2026-10-23 06:37Z: Sidebar a la izquierda y DEC-034 sí), maqueta en `docs/propuestas/propuesta-sidebar-bl061.html` (`cc347f7`) · Decisiones: DEC-034, DEC-032, DEC-033, DEC-024 · Riesgo: RSK-020 · Lecciones: LES-013, LES-028, LES-030
- Commits (gw2-factory-dev): `24b13dd` SBR-1 · `d92f477` SBR-2 · `3ecd88f`, `8d27ca8` SBR-3 · `9bb2957`, `2b47351` SBR-4a · `6b041f2`, `6eb15d0` SBR-4b · `7bf11f3`, `dbf621c`, `81f4439` SBR-5
- Commits (gw2-wallet-ligero): `d5136bd` 2.1.0 (BL-062) · `fd03d1b` sidebar-nav.js 2.2.2 y `f72cde8` shiruvana-places.js 1.3.0 (BL-063). Vuelta atrás: rama `rollback/pre-sidebar-final` = `d5136bd`.

## Qué resuelve

La barra lateral era una lista heredada con «Gato identificado», «Próximas funciones» y «Próximos (Top 3)», que repetía lo de Metas y Eventos. En el celular quedaba al fondo de la página. Pablo pidió el mismo nivel que la Cartera, Metas y Eventos y la Bienvenida. La Sidebar es solo navegación: no muestra contenido de ningún módulo (DEC-032).

## Qué cambió

| Paso | Archivo | Versión | Blob | Lo que ve el jugador |
|---|---|---|---|---|
| SBR-1 | `js/sidebar-nav.js` | 2.0.0 | — | A la izquierda desde 901 px, fija al hacer scroll. Inicio, los 8 módulos con el orden, nombre, ícono y color de la Bienvenida, y Cuentas aparte. El activo se marca con su color, también en pantallas internas. |
| SBR-2 | `js/sidebar-nav.js` | 2.1.0 | 8934573 | «Cuenta activa» con nombre, estado de la Key y «Cambiar». Punto «Falta permiso» y «Nuevo» (novedad de 14 días o menos) en los módulos. Fuera «Próximas funciones» y «Próximos (Top 3)». |
| SBR-3 | `js/sidebar-nav.js` | 2.2.0 | 3b12afb | Celular (hasta 900 px): barra fija abajo con Inicio, Cartera, Metas, Armería y «Más». «Más» abre una hoja con la cuenta activa y los otros 6 destinos; foco atrapado, Escape, «Cerrar» o tocar afuera la cierran. Punto ámbar en «Más» si adentro hay algo para revisar. |
| SBR-4a | `js/sidebar-nav.js` | 2.2.1 | d2d4723 | Arranque corregido: con `defer`, la Sidebar arrancaba antes que la Bienvenida y «Nuevo» no aparecía nunca. |
| SBR-4b | `js/shiruvana-places.js` | 1.3.0 | 4a73342 | Mi rincón (DEC-034) al pie de la Sidebar y de la hoja «Más»: avatar de 48 px, «Shiruvana», una línea y como mucho un enlace a Inicio. «Empezá por tu API Key», «Todo en orden en tu Bóveda» o «Tengo N cosas para revisar; la primera: …». |
| SBR-5 | `js/sidebar-nav.js` | 2.2.2 | 13264c2 | «Nuevo» se lee «(nuevo)» con lector de pantalla, también en la barra del celular, donde es un punto. |

- **Sin pedidos nuevos a la API ni claves nuevas en el navegador.** El nombre sale del mismo `/v2/account` de siempre; Keys y permisos, de `gn:account:keys`.
- **Sin tocar `index.html`** (69 KB, LES-028): sigue pidiendo `sidebar-nav.js?v=1.2`; hace falta Ctrl+F5 (RSK-020).
- **Mismos ids y clases que antes** (`navCards`, `navMeta`… y `.side-nav a`): `router.js` no cambió.

## Revisión final (SBR-5)

| Revisión | Cómo | Resultado |
|---|---|---|
| 19 themes | Contraste WCAG de cada color de texto que usan la Sidebar, la barra, la hoja y mi rincón, sobre `--bg-0` (la Sidebar es transparente) y `--bg-1` (activo, barra, hoja, tarjeta y rincón), con la guarda de la Bienvenida aplicada. Foco a 3:1. | 0 fallas en los 19. Los colores usados son solo `--tx-1`, `--tx-2`, `--tx-3`, `--gn-gold` y `--acc-1`, todos cubiertos por la guarda. Lo vigila `tests/sidebar-contrast.test.cjs`, que también falla si alguien usa un color sin guarda. |
| Celular | CSS de 900 px | Pestañas de 52 × 44 px, «Cerrar» y «Cambiar» de 44 px, enlaces de la hoja de 48 px; un solo rincón a la vista. |
| Teclado | Recorrido del marcado y CSS | Todo es `a` o `button`; foco visible en enlaces, pestañas, «Cambiar», «Cerrar» y el enlace de mi rincón; ningún `outline: none`. Foco atrapado en la hoja y de vuelta a «Más» al cerrar. |
| Lector de pantalla | Nombres y textos | Navegaciones con nombre, `aria-current` en el activo, hoja como diálogo modal con título, «Más» con `aria-expanded`. Las marcas visuales son `aria-hidden` y se leen como texto: «(falta permiso)», «(nuevo)» y «(hay algo para revisar)». Hallazgo corregido: en la barra «Nuevo» era texto a tamaño 0, que VoiceOver puede saltear. |
| Movimiento reducido | `prefers-reduced-motion` | Sin transición en la lista ni animación en la hoja. |

## Cómo evaluarlo

Para mirar (Pablo), en producción o en DEV, con Ctrl+F5 (RSK-020):

1. Computadora: la Sidebar a la izquierda; al pie, mi rincón con una línea sobre tu Bóveda.
2. Celular: la barra abajo; «Más» abre la hoja con la cuenta activa, los otros módulos y mi rincón al pie.
3. Un theme claro (macOS o Notion): los textos de la Sidebar y de la barra se leen.

Verificado por la Factory:

| Paso | Tests | Mutaciones |
|---|---|---|
| SBR-1 y SBR-2 | `sidebar-nav` | 19/19 y 21/21 |
| SBR-3 | `sidebar-nav` (32) | 29/29 |
| SBR-4 | `sidebar-nav` (35), `shiruvana-places` (24) | 5/5 y 19/20 (la que vive es equivalente: un try/catch ya cubre el caso) |
| SBR-5 | `sidebar-nav` (35), `sidebar-contrast` (7) | 13/13 |

Los 66 tests de la Sidebar y mi rincón pasan juntos, con `welcome-contrast` (8). Todos los blobs publicados, en DEV y en producción, son idénticos a los validados en local. En producción, `js/` queda igual a DEV salvo `analytics.js` (DEC-006); las dependencias de mi rincón (`shiruvana.js` y `welcome-panel.js` 2.2.0) ya estaban.

## Riesgos y notas

- **RSK-020 (BAJO, aceptado):** `index.html` pide versiones viejas; hace falta Ctrl+F5.
- **Zona segura del iPhone:** queda en 0 hasta que `index.html` pida `viewport-fit=cover`; la barra igual deja su margen.
- **Mi rincón se rearma solo si cambia lo que digo.** Si se rearma con el foco adentro (por ejemplo, con la hoja abierta y una Key que cambia en otra pestaña), el foco vuelve al documento. BAJO, aceptado: no hay pérdida de datos y Tab sigue funcionando.
