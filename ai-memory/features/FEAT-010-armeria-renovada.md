# FEAT-010 — La Armería Legendaria renovada

- **Estado:** en DEV. ARM-1 a ARM-4 validados por Pablo en pantalla; ARM-5 (revisión final) y el ajuste 1.6.1 esperan su validación.
- **Fecha:** 2026-10-23
- **Backlog:** BL-064 (primer módulo del restyle completo de la Bóveda)
- **Propuesta aprobada:** `docs/propuestas/propuesta-armeria-bl064.html` (`7ac2f3f`)
- **Producción:** no. La decide Pablo.

## Qué cambió para el usuario

El catálogo de la Armería ahora habla el mismo idioma que la ficha de la legendaria (BL-049), la Cartera, Metas, la Bienvenida y la Sidebar:

- Cabecera con resumen («tenés N de 206»), buscador sin acentos ni mayúsculas y pestañas Catálogo / Mi cola. La barra vieja «Modo: Catálogo / Mi progreso» ya no aparece: las pestañas la reemplazan.
- Filtros en una fila: «Todas / Las tengo / Me faltan», tipo, expansión y generación.
- Tarjetas que se usan con teclado: el nombre abre la receta y «+ A la cola» es un botón aparte; «✓ La tengo» reemplaza a «PENDING»; precio «≈» con fecha o «No se vende».
- Secciones por expansión con su progreso; grilla que se adapta (1 columna en ≤560 px).
- «Mi cola» como vista propia: numerada, las 3 primeras destacadas, «Ver receta y materiales» y «Quitar».
- Armaduras por set: 132 piezas sueltas pasan a 23 tarjetas (7 sets × 3 pesos, más Eikasia y Selachimorpha) con «tenés N de 6 piezas»; la búsqueda abre el set que coincide.
- Mi voz una sola vez en la cabecera (N1–N2, DEC-024, DEC-033).

## Pasos

| Paso | Qué | render-catologo | Commit | Blob | Tests |
|---|---|---|---|---|---|
| ARM-1 | Cabecera, buscador y pestañas | 1.2.0 | `1fba76e` | `da14de0` | `413ee9c` |
| ARM-2 | Filtros y tarjetas | 1.3.0 | `70380ec` | `3472f07` | `ceca631` |
| ARM-3 | «Mi cola» como vista propia | 1.4.0 | `eb365e4` | `5d4ac65` | `8890425`, `3b062ec`, `cfb6649` |
| ARM-4 | Armaduras por set | 1.5.0 | `67d2f58` | `e9fca2e` | `d97dfc1` |
| ARM-5 | Revisión final: contraste y foco | 1.6.0 | `d767fb9` | `bedfa6a` | `3b7eb67` |
| Ajuste | Sin «Modo: Catálogo / Mi progreso» (captura de Pablo) | 1.6.1 | `84ac02f` | `fe6ed4f` | `e326313` |

`js/legendary-tracker.js` no se tocó: las firmas `renderFilterBar`, `renderCatalogGrid` y `renderProgress` se mantienen, y siguen las 206 tarjetas `card lt-item-card` con `data-id`.

## Revisión final (ARM-5)

| Eje | Resultado |
|---|---|
| 19 themes | `tests/armeria-contrast.test.cjs` mide cada token sobre sus superficies reales (fondos y tintes). Hallazgos corregidos: el subtítulo pasa a `--tx-2` (`--tx-3` no llegaba a 4.5:1 sobre el tinte de la cabecera) y el tinte de «La tengo» baja de .14 a .10 (One Dark daba 4.45). Además, la guarda de la Bienvenida (`contrastFixes`) se aplica dentro de `#legendaryArmoryPanel` y se recalcula al cambiar de theme. 0 fallas. |
| Celular | Controles de 44 px; 1 columna en ≤560 px; la voz se oculta en ≤900 px. |
| Teclado | Foco visible en todo; al repintar el tracker, el foco vuelve al control equivalente en vez de saltar al principio. |
| Lector de pantalla | Regiones `aria-live` (resultados y «Quitar»), `aria-pressed`, `aria-current` y etiquetas en botones e íconos. |
| Movimiento reducido | Respetado. |

## Ajuste 1.6.1: la barra «Modo:» seguía visible

Pablo la vio en pantalla después de ARM-5. ARM-1 ya la ocultaba con `{display:none}`, pero el tracker la pinta con `style="display:flex"` en línea y un estilo en línea le gana a una regla de hoja. Ahora va con `!important`. El test lo cubre: falla contra la 1.6.0 y pasa con la 1.6.1. Lección: un test de CSS que solo comprueba que la regla existe no prueba que gane la cascada; cuando el elemento trae estilo en línea, hay que mirarlo.

## Verificación

| Qué | Resultado |
|---|---|
| Suites de la Armería (6) | 38/38 |
| Heredados `hb119-2-2` / `hb126` | 7/7 y 15/15 |
| Réplica local de los chequeos del legado | 22/22 |
| Mutaciones por paso | ARM-1 18/18 · ARM-2 24/24 · ARM-3 24/25 · ARM-4 23/24 · ARM-5 14/15 (las sobrevivientes son equivalentes) |
| Blobs publicados | idénticos a los locales en cada paso |

## Cómo evaluarlo

1. Ctrl+F5 en DEV (RSK-020) y abrir la Armería: arriba de la cabecera ya no hay «Modo:»; se navega con las pestañas Catálogo / Mi cola.
2. Probar themes claros y oscuros (macOS, Notion, Tokyo Night): el subtítulo y «La tengo» se leen bien.
3. Con teclado: Tab por filtros y tarjetas, Enter en un filtro; el foco queda en el mismo filtro.
4. Celular: una columna, botones cómodos.

## Riesgos y deudas

- **DEBT-ARM-3:** el panel viejo de la cola del tracker y su barra «Modo:» se siguen pintando y se ocultan por CSS. Se limpian cuando se pueda tocar `legendary-tracker.js` (63.9 KB).
- **Tamaño:** `render-catologo.js` pesa 61.5 KB; no le entra otro paso grande sin separar en otro archivo (LES-028).
- **RSK-020:** caché del navegador; pedir Ctrl+F5.
- La guarda de contraste no conoce los tintes de cada módulo: el texto sobre tintes usa `--tx-1`/`--tx-2`. El arreglo general sigue en BL-060.
