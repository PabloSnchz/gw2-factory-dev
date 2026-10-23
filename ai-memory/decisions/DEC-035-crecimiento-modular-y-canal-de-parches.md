# DEC-035 — Crecimiento modular y canal de parches

- Estado: ACEPTADA (conceptualmente) — Pablo (2026-10-23 18:55Z: «BL-065 Aprobado. DEC-035 aprobada conceptualmente»)
- Fecha: 2026-10-23
- Ámbito: gw2-factory-dev (app, `.github/`, `factory/patches/`). Producción no cambia.
- Propuesta: `docs/propuestas/propuesta-archivos-grandes-bl065.md` (`c066e56`)
- Relacionadas: BL-065, BL-064, LES-028, DEC-021, DEC-004, LES-016, LES-018, LES-019, RSK-016, RSK-020, BL-005, BL-053

## Contexto

La Factory publica cada archivo entero en una sola operación, con un tope de unos 64 KB (LES-028). El 2026-10-23, en DEV, 13 archivos ya no entraban (8 de código, 3 de datos generados, 2 documentos) y 6 más estaban entre 56 y 64 KB. Son dos problemas:

1. No puedo escribir un archivo grande.
2. No puedo sumar archivos nuevos, porque cada JS nuevo tiene que estar en `index.html` (69 KB). Esto empuja todo a los archivos que ya se cargan, y por eso crecen.

## Decisión

Se combinan tres mecanismos, **en este orden** (aprobado por Pablo):

1. **Primero, el canal de parches (solo DEV).** Un archivo de más de 40 KB se modifica publicando un parche chico (`factory/patches/PATCH-NNN.json`) que un workflow de GitHub Actions aplica, valida y commitea. Las reglas:
   - cada ancla tiene que aparecer **exactamente una vez**;
   - el parche declara el blob sha base esperado de cada archivo; si no coincide, se rechaza (además lo hace idempotente);
   - se aplica todo o nada;
   - el resultado queda escrito en el repo (`RESULT-NNN`), porque la Factory no lee CI (RSK-016);
   - corre `node --check` y los tests antes del commit, y dispara `dev-pages`, porque los commits del workflow no disparan otros workflows;
   - lleva una guarda de repositorio y va en serie (`concurrency`, LES-018).

   Los archivos de menos de 40 KB se siguen publicando enteros, como hasta ahora.
2. **Después, el manifiesto de módulos.** Un cargador chico (`js/boot.js`) lee `js/modules.js` (archivo y versión `?v=`) e inserta los scripts en orden. `index.html` se toca una vez para cargar el cargador. Solo para módulos nuevos, que arrancan aunque el documento ya esté cargado; los módulos actuales siguen como están.
3. **Al final, archivos chicos como regla de crecimiento, nunca como migración masiva.**
   - **Presupuesto: 40 KB por archivo** (aprobado por Pablo).
   - Un archivo que ya pasa los 48 KB no puede crecer: un test en CI lo compara con una línea base que solo baja.
   - Cada módulo que se renueva extrae su vista a archivos nuevos y deja el original más chico. Primer candidato: la Cámara del Brujo (`wv-purchase-detail.js`, 91 KB).

Los datos generados (`legendary-*.js`) no se parchean a mano: los regenera un workflow con `tools/legendary/` (trabajo aparte).

## Consecuencias

- Se acaba el «cambio de dos líneas que pesa 61 KB»: un micro-ciclo pesa lo que el cambio.
- Se destraban `index.html` (BL-005, `viewport-fit`, cache-busting de RSK-020), `legendary-tracker.js` (DEBT-ARM-3) y `CHANGELOG.md` (BL-053).
- Ante una interrupción: RESULT aplicado → sigo; rechazado → leo el motivo; sin RESULT → espero. Nunca reenvío sin revisar el sha base.
- Si Actions falla, no se rompe nada: el archivo queda igual y lo chico se sigue publicando como hoy.
- Producción no usa el canal. Lo que se promueve, y cómo, lo sigue decidiendo Pablo.

## Implementación (BL-065)

FP-1 script + tests locales · FP-2 workflow probado primero por el camino de error · FP-3 prueba feliz sobre un archivo inofensivo · FP-4 `index.html` (cargador, `viewport-fit`, BL-005) · FP-5 manifiesto · FP-6 trinquete de tamaño + LES.
