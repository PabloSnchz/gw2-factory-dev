# FEAT-008 — Bienvenida: la puerta de entrada de la Bóveda

- Estado: EN PRODUCCIÓN desde 2026-10-23 (BL-062 y BL-063, orden de Pablo). Validada por Pablo en pantalla paso a paso (WEL-1, WEL-2 y WEL-3; WEL-3 el 2026-10-23 05:54Z: «El rol de Shiruvana como guía de la Bóveda es el correcto») y en la validación final del ciclo de restyle (2026-10-24 13:10Z). Sin cambios en DEV desde BL-063: BL-069 no la tocó.
- Fecha: 2026-10-23
- Backlog: BL-058 · Propuesta: WEL-0b (aprobada por Pablo 2026-10-23 05:00Z), maqueta en `docs/propuestas/propuesta-bienvenida-bl058.html` (`9b45215`) · Decisiones: DEC-032, DEC-033, DEC-024, DEC-025, DEC-021 · Riesgo: RSK-020 · Lecciones: LES-013, LES-028
- Commits (gw2-factory-dev): `4ec91ff` WEL-0 · `9b45215`, `e696be8` WEL-0b y DEC-032 · `5ee02d8`, `08ea3a1` WEL-1 · `c55503e` WEL-2 · `01b0778` WEL-3 · `2c7184e`, `767e0fd` WEL-4a · `3b668ff` WEL-4b

## Qué resuelve

La Bienvenida era un saludo heredado con enlaces sueltos. Pablo pidió que fuera la puerta de entrada de la Bóveda, con el nivel de la Cartera y de Metas y Eventos. Tiene que contestar qué puedo hacer acá, qué módulos tengo, qué configuré, qué me falta y dónde me conviene seguir. Nunca asume funciones de otro módulo: nada de timers, agendas, metas ni world bosses (DEC-032).

## Qué cambió

| Paso | Archivo | Versión | Blob | Lo que ve el jugador |
|---|---|---|---|---|
| WEL-1 | `js/welcome-panel.js` · `assets/welcome-news.json` | 2.0.0 | — | Cabecera con el gato y el estado de la API Key y las cuentas; los 9 módulos de la barra lateral como tarjetas («¿Qué puedo hacer aquí?»); Novedades; Guías y ayuda; pie compacto. Sin API Key, tres pasos para empezar. |
| WEL-2 | `js/welcome-panel.js` | 2.1.0 | 1654e57 | «Seguí donde quedaste» (último módulo y los que más usás) y «Tu Bóveda»: Keys y permisos faltantes con cómo arreglarlo, cuenta activa, copia de seguridad (botón «Guardar copia») y theme, con «N de 4 listo». Aviso «Falta permiso» en los módulos que la Key activa no alcanza. |
| WEL-3 | `js/shiruvana-places.js` | 1.1.0 | f32e964 | «Shiruvana te guía»: un mensaje por vez, lo más importante primero (1 lo que impide funcionar, 2 permisos, 3 copia, 4 configuración, 5 continuidad, 6 orientación general), con su botón, «Siguiente» y «Preguntame». El modal de Keys ya no promete el Gist. |
| WEL-4a | `js/welcome-panel.js` | 2.2.0 | cd8587a | Guarda de contraste: en cada cambio de theme corrijo, solo dentro de la Bienvenida, los colores que no llegan a 4.5:1. Grupos con nombre, barra de progreso con nombre y foco visible en «Ver cuáles». |
| WEL-4b | `js/shiruvana-places.js` | 1.2.0 | 23a718e | «Siguiente» y «Preguntame» anuncian el mensaje nuevo a quien usa lector de pantalla; el foco no se mueve. |

- **Solo datos de este navegador:** Keys y permisos (`gn:account:keys`), cuenta activa y una clave nueva, `gn:global:welcome` (último módulo, visitas por módulo y fecha de la última copia; solo ids y fechas). No hace pedidos a la API.
- **Sin tocar `index.html`** (69 KB, LES-028): sigue pidiendo `welcome-panel.js?v=1.4.0` y `shiruvana-places.js?v=1.0.0`; hace falta Ctrl+F5 (RSK-020).
- **Los themes no se tocan.** La guarda corrige solo dentro de `#welcomePanel`, y en 13 de los 19 themes. Gato Negro, Bóveda, Dracula, Glassmorphism, Material Dark y PS5 no necesitan corrección. En macOS y Notion, el verde de «listo» pasaba de 1.1:1 a 4.5:1 o más, y los tintes oscuros se rehacen sobre la superficie clara.

## Revisión final (WEL-4)

| Revisión | Cómo | Resultado |
|---|---|---|
| 19 themes | Contraste WCAG calculado para cada par texto/fondo que usa la Bienvenida (19 pares por theme), sobre los tokens reales de `css/themes/` | La auditoría inicial encontró 45 pares bajo 4.5:1 en 12 themes; con la guarda, 0 en los 19. Lo vigila `tests/welcome-contrast.test.cjs`. |
| Celular | Cortes de 980 y 720 px del CSS | Pastillas en una fila con scroll, módulos en 2 columnas, controles de 44 px (también los botones de mi guía). |
| Teclado | Recorrido del marcado | Todo lo que se toca es `button`, `a` o `summary`; foco visible en los tres; nada de clics en `div`. |
| Lector de pantalla | Nombres y anuncios | Secciones con nombre, grupos con `role`, barra de progreso con nombre y región «polite» para mi guía. |
| Movimiento reducido | `prefers-reduced-motion` | Sin desplazamiento de las tarjetas. |

## Cómo evaluarlo

Para mirar (Pablo), en DEV (https://pablosnchz.github.io/gw2-factory-dev/), con Ctrl+F5 (RSK-020) → Bienvenida:

1. Con API Key: «Shiruvana te guía» arriba, «Seguí donde quedaste», «Tu Bóveda», módulos, novedades y ayuda.
2. «Cambiar» en «Tu Bóveda» → elegir macOS o Notion: los «✓» y los textos en verde y ámbar se leen.
3. En el celular: pastillas con scroll, módulos en dos columnas.

Verificado por la Factory:

| Paso | Tests | Prueba de humo | Mutaciones |
|---|---|---|---|
| WEL-1 y WEL-2 | `welcome-view` y `welcome-vault` (20) | DOM mínimo | detectadas en cada paso |
| WEL-3 | `shiruvana-places` (15) e `index-identity` (5) | Bienvenida 2.1.0 real: 16/16 | 18/18 |
| WEL-4a | `welcome-contrast` (8) | — | 14/15 (la que vive es equivalente: volver a medir con cualquier hoja que carga) |
| WEL-4b | `shiruvana-places` (17) | Bienvenida 2.2.0 real: 16/16 | 7/7 |

Los 50 tests de la Bienvenida pasan juntos. Todos los blobs publicados son idénticos a los validados en local.

## Riesgos y notas

- **RSK-020 (BAJO, aceptado):** `index.html` pide versiones viejas; hace falta Ctrl+F5 hasta que se pueda publicar `index.html`.
- **Contraste de los themes en el resto de la Bóveda (BL-060):** el texto tenue (`--tx-3`) no llega a 4.5:1 en 9 themes, el acento falla como texto en Discord, Fluent, Solarized Dark, macOS y Notion, y los colores de estado son de tema oscuro en macOS y Notion. La Bienvenida ya lo corrige; los demás módulos no.
- **Lo que quedó fuera a propósito (DEC-032):** horarios, agenda, metas y world bosses. Viven en Metas y Eventos.
- **Para producción:** van juntos `js/welcome-panel.js` 2.2.0, `js/shiruvana-places.js` 1.2.0 y `assets/welcome-news.json`.
