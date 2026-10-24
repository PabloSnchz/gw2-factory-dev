# FEAT-011 — La Cámara del Brujo renovada

- **Estado:** validada por Pablo (CAM-0 a CAM-6) y en producción desde 2026-10-24 por orden de Pablo (BL-068, Armería y Cámara juntas). gw2-wallet-ligero `3cd00da`…`374b6f0`; vuelta atrás: rama `rollback/pre-camara-armeria` (`f72cde8`).
- **Fecha:** 2026-10-24
- **Backlog:** BL-064, paso 2 (segundo módulo del restyle; el resto sigue en BL-067)
- **Propuesta aprobada:** `docs/propuestas/propuesta-camara-bl064.html` (CAM-0)
- **Producción:** sí (BL-068, 2026-10-24). `router.js` queda 2.17.0 en producción: la limpieza de la Tienda de respaldo (2.18.0) es solo de DEV.

## Qué cambió para el usuario

La Cámara del Brujo habla el mismo idioma que la Cartera, Metas y Eventos, la Bienvenida y la Armería:

- Cabecera con la temporada y los días que quedan, reset diario y semanal con cuenta regresiva, AA disponible, avance de hoy y de la semana, AA gastada y «¿Por qué tarda?».
- Tres pestañas: Objetivos (Diarias, Semanales, Especiales), Tienda y Todas las cuentas (Objetivos semanales, Compras fijadas). Los 5 botones viejos ya no existen.
- Objetivos agrupados por estado: Listos para reclamar, En curso y Reclamados; filtros PvE / PvP / WvW; recompensa del día y de la semana.
- Tienda con la línea de AA, selector −/+, vista lista, filtros, «Gestionar» con confirmación y «Deshacer».
- Todas las cuentas: matriz de objetivos semanales con columna de cuentas fija, leyenda, orden y «Solo con pendientes»; Compras fijadas con −/+ por cuenta, sincronizadas con la Tienda.
- Mi voz: una sola línea en la cabecera y solo si hay algo para hacer (CAM-0 §7).

## Pasos

| Paso | Qué | Archivos | Referencia |
|---|---|---|---|
| CAM-0 | Propuesta visual | `docs/propuestas/propuesta-camara-bl064.html` | aprobada |
| CAM-1 | Cabecera, tres pestañas, indicadores | `js/wv-view.js` 1.0.0 (manifiesto) | validado |
| CAM-2 | Objetivos agrupados y priorizados | `js/wv-objectives-ui.js` 2.0.0 | validado |
| CAM-3 | Tienda | `js/wv-shop-ui.js` 2.0.0, `js/wv-shop-manage.js` | validado |
| CAM-4 | Todas las cuentas → Objetivos semanales | `js/wv-objectives-dashboard.js` 2.0.0 | validado |
| CAM-5 | Compras fijadas | `js/wv-purchase-detail.js` 2.0.0 (91 → 28 KB), `js/wv-purchases-view.js` 1.0.0 | validado |
| CAM-6 | Voz, contraste, teclado, limpieza | `js/wv-view.js` 1.1.0 (PATCH-022), `index.html` y `js/router.js` 2.18.0 (PATCH-024) | espera validación |

## CAM-6

| Eje | Resultado |
|---|---|
| Mi voz | `pickVoice`: listos para reclamar (+AA) → reset en ≤ 60 min con pendientes → fijados sin AA (con semanas estimadas) → temporada en ≤ 7 días con fijados → nada. Usa `Shiruvana.voice`, `aria-live`, no repite la misma línea en cada tic del reloj. Fijados y marcas de la Tienda si ya cargó, si no del almacén de la temporada. Sin pedidos nuevos a la API. |
| 19 themes | La guarda de la Bienvenida (`contrastFixes`) corre sobre `#wvPanel` y corrige además los colores fijos de los módulos (`--color-red`, `--wvx-aa`, `--wvx-mark`); se recalcula al cambiar de theme. `tests/wv-camara-a11y.test.cjs` mide todos los colores de texto de los 6 módulos de la Cámara sobre `--bg-0`, `--bg-1` y la cabecera: 0 fallas; foco ≥ 3:1. |
| Teclado | Pestañas con flechas, Inicio y Fin; foco visible en pestañas, paneles y controles; nadie quita el contorno. |
| Lector de pantalla | `aria-controls` en cada pestaña y `aria-labelledby` en el panel visible. |
| Movimiento reducido | Respetado en toda la Cámara. |
| Limpieza | `index.html` 69.6 → 64.8 KB (5 botones, su script y CSS viejo). `router.js` 90.5 → 65.6 KB (Tienda de respaldo, `saveView`, `saveLegacyFilter`). Techos bajados en `tools/size-budget.json`. |

## Verificación

| Qué | Resultado |
|---|---|
| Tests de CAM-6 | `wv-view` + `wv-camara-a11y`: 38/38 locales; mutaciones 17/17 |
| Canal de parches | PATCH-022 aplicado; PATCH-023 rechazado (hb98, ver LES-035); PATCH-024 aplicado con la suite verde antes y después |
| Blobs | `wv-view.js` 6909434, `index.html` 64e3ff4, `router.js` 50ac0fe: idénticos a los locales |

## Cómo evaluarlo

1. Ctrl+F5 en DEV y abrir la Cámara del Brujo: sin botones viejos; todo por las 3 pestañas.
2. Con objetivos listos o fijados sin AA, mi línea aparece en la cabecera; con todo al día, no.
3. Theme claro (macOS, Notion): la AA, lo marcado y los rojos se leen bien.
4. Teclado: Tab hasta las pestañas, flechas, Enter.

## Riesgos y deudas

- **DEBT-CAM-1:** la lista de cuentas se lee de `gw2_keys` (tolerado por idea61).
- Título viejo, línea de temporada y nota de sincronización siguen en el HTML, ocultos: los usan `router.js` y `wizards-vault.js`.
- `wv-view.js` pisa colores de otros módulos con selectores `#wvPanel` (documentado en su cabecera).
- **RSK-020:** caché del navegador; pedir Ctrl+F5.
