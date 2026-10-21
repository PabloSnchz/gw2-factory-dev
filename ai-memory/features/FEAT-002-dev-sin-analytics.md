# FEAT-002 — DEV sin Analytics

- Estado: DISPONIBLE PARA EVALUACIÓN (en gw2-factory-dev `main`)
- Fecha: 2026-10-20
- Misión: FACTORY-LIVE-001, ciclo L1 (autonomía continua acotada, DEC-014)
- Backlog: BL-002 · Decisión: DEC-006 · Riesgo que mitiga: RSK-003
- Commits (gw2-factory-dev): `6d2f63e` index.html · `3bcfbe1` workflow GA4 · `74ed517` tests · `2399afc` app-checks

## Qué resuelve

Las visitas a DEV (GitHub Pages de gw2-factory-dev, y en el futuro Vercel y sus previews) se enviaban al GA4 de producción y ensuciaban las métricas de la Bóveda. El workflow diario de métricas GA4 también corría en DEV.

## Qué cambió

- `index.html`: el bloque fijo de gtag.js se reemplazó por un cargador (`<script id="ga-loader">`). Solo en `pablosnchz.github.io/gw2-wallet-ligero/` descarga gtag.js y configura `G-LB782QT9TR`. En cualquier otro host `gtag()` existe pero solo encola en `dataLayer`: no se descarga nada ni sale nada del navegador. `window.__gaEnabled` dice si GA está activo.
- `js/analytics.js`: sin cambios (ya toleraba la ausencia de GA).
- `.github/workflows/github-metrics-to-ga4.yml`: el job corre solo si `github.repository == 'PabloSnchz/gw2-wallet-ligero'`.
- `tests/ga-loader.test.cjs`: 5 tests (producción, 8 URLs que no son producción, gtag siempre definido, sin gtag.js fuera del cargador, guard del workflow).
- `.github/workflows/app-checks.yml`: corre `node --test tests/*.test.cjs` en cada push a `main` y en cada PR.

Los archivos son los mismos para DEV y PROD: se pueden promover sin editarlos (requisito de DEC-006).

## Cómo evaluarlo

Para mirar (Pablo): abrí DEV en https://gw2-factory-dev.vercel.app/ y usala como siempre. Si algo no carga o se ve distinto a producción, avisá.

Verificado por la Factory, sin herramientas de Pablo (DEC-019, LES-024):

1. Sin peticiones a `googletagmanager.com` ni a `google-analytics.com` fuera del host de producción, y `window.__gaEnabled` en `false`: lo cubren los tests de `tests/ga-loader.test.cjs`.
2. El workflow "Send GitHub Metrics to GA4" solo corre en el repo de producción: guard verificado por test.
3. `app-checks` corre en cada push. La Factory no puede leer su resultado (RSK-016, bloqueo de entorno).

## Verificación realizada

- 5/5 tests locales (Node 24); el workflow usa Node 22.
- 8/8 mutaciones detectadas: GA fijo como antes, sin chequeo de host, ruta sin límite, ruta sin ancla, config fuera del `if`, sin `gtag`, workflow sin guard, guard con el repo equivocado. La de "ruta sin ancla" sobrevivía a la primera versión de los tests y motivó un caso nuevo.
- Diff de `index.html` acotado al bloque GA (5 líneas quitadas, 17 agregadas). Sin Content-Security-Policy que bloquee la inyección.
- Cada archivo publicado coincide por SHA con la copia verificada.

## Riesgos y notas

- Si producción pasa a un dominio propio, el cargador deja de cargar GA hasta agregar ese host al cargador (BAJO).
- El resultado de CI de `app-checks` no lo puede leer la Factory con sus herramientas actuales (RSK-016).
- Un comentario heredado de `index.html` cita un test (`alert86.censo-clasificacion.test.js`) que ancla líneas por posición; las líneas se corrieron 12 posiciones. El test no existe en ningún repo de GitHub (búsqueda 2026-10-20), así que no rompe CI; si vive en una máquina local, habría que actualizarlo.
- Queda la rama `factory/bl-002-dev-sin-analytics` con el mismo contenido (no se pudo abrir PR; BL-017).
