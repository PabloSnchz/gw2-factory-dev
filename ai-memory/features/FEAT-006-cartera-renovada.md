# FEAT-006 — La Cartera renovada

- Estado: EN DEV, validada por Pablo en pantalla paso a paso (CAR-1, CAR-2A, CAR-2B, CAR-3). No está en producción: promover es decisión de Pablo.
- Fecha: 2026-10-22
- Backlog: BL-056 · Propuesta: CAR-0 (`propuesta-cartera-bl056.html`, aprobada tal cual a las 16:19Z) · Riesgo: RSK-020 (BAJO, aceptado) · Decisiones: DEC-021, DEC-024 · Lecciones: LES-017, LES-028
- Commits (gw2-factory-dev): `ef04409` CAR-1 · `0dca9f6`, `49953fe`, `8abdc38` CAR-2A · `9450267`, `17e75f0` CAR-2B · `c371549`, `84b39d6`, `7bb1f60` CAR-3 · `a2c38b8` validación funcional de CAR-3

## Qué resuelve

La Cartera arrastraba el diseño viejo: tarjetas sin jerarquía, un conversor en un modal que tapaba la pantalla y una tabla de todas las cuentas que mostraba 0 cuando una cuenta no se podía leer. Pablo pidió el nivel de la pantalla de la legendaria (BL-049) y la ve como el disparador del restyle de toda la webapp.

## Qué cambió

La Cartera es una sola pantalla con tres pestañas: **Mi cartera**, **Todas las cuentas** y **Cambio de divisas**.

| Paso | Archivo | Versión | Blob | Lo que ve el jugador |
|---|---|---|---|---|
| CAR-1 | `js/wallet-theme.js` | 2.0.0 | 669467a | Mi cartera: cabecera con la cuenta, chips por categoría, las fijadas con ★ arriba, tarjetas y tabla con el mismo lenguaje que la legendaria. |
| CAR-2A | `js/converter-modal.js` | 2.0.0 | e311da4 | Cambio de divisas en dos columnas, «Shiruvana recomienda» y Populares plegado. |
| CAR-2B | `js/wallet-theme.js` | 2.1.0 | 3083c87 | Cambio de divisas es una pestaña de la Cartera, sin modal. |
| CAR-3 | `js/wallet-dashboard.js` | 3.0.0 | dce7b5d | Todas las cuentas: KPIs, columnas como chips con buscador, cuenta, cabecera y totales fijos, mejor valor en dorado, tarjetas en el celular. |

- **Sin tocar `app.js`** (66,8 KB, no se publica entero): la vista nueva toma lo que dibuja `app.js` (mismos ids, mismos botones de fijar, mismos filtros) y lo reordena desde `wallet-theme.js`, que ya se cargaba.
- **Datos intactos:** la lectura de cuentas, la ETA de carga, los errores por columna y lo que se guarda en el navegador no cambiaron. `localStorage`: una sola clave nueva, `gn:wallet:hidezero` (CAR-1, «ocultar en cero», `'1'` o `'0'`); ninguna borrada ni renombrada; el conversor sigue usando `gw2_conv_cache_v3`.
- **Arreglos en el camino:** Escape cierra el conversor; el ícono 155048; `renderSkeletonOfertas` no existía; espera por campo al tipear; una cuenta que falla muestra «— ⚠» con el motivo y el total dice «Total (n de m)» (antes sumaba ceros falsos); estado sin divisas bien armado; el borde del KPI de suerte; el selector ya no suma un oyente por cada dibujo.

## Cómo evaluarlo

Para mirar (Pablo), en DEV (https://pablosnchz.github.io/gw2-factory-dev/), con Ctrl+F5 (RSK-020) → Cartera:

1. Mi cartera: chips por categoría, fijar una divisa con ★ y verla subir.
2. Cambio de divisas: pestaña sin modal; Escape y volver a Mi cartera.
3. Todas las cuentas: agregar y quitar columnas, ordenar, mirar en el celular.

Verificado por la Factory:

| Paso | Tests | Prueba de humo | Mutaciones |
|---|---|---|---|
| CAR-1 | 8 | 36 comprobaciones (HTML real y funciones reales de `app.js`) | 15/15 |
| CAR-2A | 11 (idea47 37/37, commerce-delivery 8/8) | 58 | 23/23 |
| CAR-2B | 9 | 52 (conversor real montado en la Cartera) | 17/17 |
| CAR-3 | 9 (idea48b 29/29 con 2.9.0 y 3.0.0) | 35 | 23/23 |
| CAR-3 integración | — | 27 (dashboard 3.0.0 + theme 2.1.0 en el mismo DOM) | 2/3 (la tercera, equivalente) |

Todos los blobs publicados son idénticos a los validados en local.

## Riesgos y notas

- **RSK-020 (BAJO, aceptado por Pablo):** `index.html` (69 KB) no se publica entero, así que sus `?v=` quedan viejos: converter-modal 1.2.0, wallet-dashboard 2.9.0, wallet-theme 1.3.1. GitHub Pages revalida, pero un navegador con caché puede mostrar lo anterior hasta Ctrl+F5. La próxima vez que se toque `index.html`, subir esas tres versiones.
- **Desvíos de DEC-021 registrados:** CAR-2B en un commit de 43,7 KB para no dejar CI en rojo entre commits (LES-017); CAR-3 con un archivo de 52,5 KB (excepción de archivo grande).
- **Promoción a producción:** son 3 archivos de código (`wallet-theme.js`, `converter-modal.js`, `wallet-dashboard.js`) más sus tests; cada uno cabe en una publicación propia.
