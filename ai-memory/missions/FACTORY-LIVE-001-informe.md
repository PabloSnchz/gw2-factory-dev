# FACTORY-LIVE-001 — Primera sesión en autonomía continua acotada · Informe

- Estado: CERRADA (2026-10-20). Sesión 1 de 3 antes de revisar el acuerdo (DEC-014)
- Período: 2026-10-20T05:40Z → 2026-10-20T06:02Z
- Repositorio: gw2-factory-dev (código y memoria). Producción y panel: no se tocaron
- Elección de trabajo: la tarea READY de mayor prioridad sin decisión humana pendiente, y después las siguientes en orden

## 1. Qué se hizo

| Ciclo | Tarea | Resultado | Commits |
|---|---|---|---|
| L1 | BL-002 DEV sin Analytics | GA4 solo se carga en `pablosnchz.github.io/gw2-wallet-ligero/`; el workflow de métricas GA4 solo corre en el repo de producción; 5 tests y workflow `app-checks` (FEAT-002). Mitiga RSK-003 | `6d2f63e`, `3bcfbe1`, `74ed517`, `2399afc` |
| L2 | BL-006 Validación automática | `tests/ai-memory.test.cjs`: archivos obligatorios, UTF-8 sin BOM, enlaces del índice y claves de `status.md`. Corre en `app-checks` sobre la memoria real | `3f63d54` |
| L3 | BL-013 (parte) | BOM quitado de `js/analytics.js`, sin cambio de comportamiento (`node --check` OK) | `a3eea2d` |
| L4 | Cierre | Este informe, memoria y estado | (este commit y los siguientes) |

## 2. Verificación

- Tests de la app: 9 en local (Node 24), todos pasan. CI los corre con Node 22.
- Mutaciones: 8/8 detectadas en L1 y 5/5 en L2. Una mutación de L1 (ruta sin ancla) sobrevivía a la primera versión de los tests y motivó un caso nuevo.
- La memoria local coincide con la publicada en los 45 archivos que revisa el test de L2, así que el test pasa sobre la memoria real.
- Cada archivo publicado se comparó por SHA con la copia verificada; todos coinciden.
- No verificado: el resultado de CI en GitHub (RSK-016).

## 3. Qué salió mal y qué se aprendió

| Problema | Efecto | Qué se hizo |
|---|---|---|
| La herramienta para crear PRs no estaba disponible ("runtime settings are not configured") | No se pudo ver CI antes de integrar; `index.html` (68 KB) se publicó dos veces (rama y `main`) | Publicación directa en `main` en orden de dependencias, solo con tests que ya pasaban en local. LES-019, RSK-016 |
| Descarga directa desde `raw.githubusercontent.com` bloqueada (403) | No se pudo bajar el código de la app | Se usó una copia local de `index.html` verificada por SHA y la API de contenidos |
| Comentario heredado en `index.html` que cita un test anclado a números de línea | Las líneas se corrieron 12 posiciones | El test no existe en ningún repo de GitHub; queda anotado en FEAT-002 |

## 4. Por qué se detiene la sesión

Lo que queda en READY no se puede hacer ahora o conviene hacerlo en una sesión nueva:

| Tarea | Motivo |
|---|---|
| BL-031 `node --check` de `js/*.js` | Bloqueo operativo: sin lectura de CI, un fallo dejaría `main` en rojo sin que nadie lo note (RSK-016) |
| BL-007 Subresource Integrity | Dependencia externa: hay que descargar las librerías de la CDN para calcular los hashes y la red está bloqueada |
| BL-008 Email de commits | Se configura en el entorno de quien hace los commits; la Factory no tiene acceso |
| BL-017 Ramas sobrantes | La Factory no tiene herramienta para borrar ramas |
| BL-023 Ubicación del GDS | Pablo pidió registrarla y no resolverla todavía |
| BL-025 Verificación `dev_sin_pages` | Postergada en MC-5: suma una llamada a la API por lectura |
| BL-004, BL-005, resto de BL-013 | Elegibles. Pasan a la sesión siguiente (DEC-014: la Factory se detiene al terminar cada sesión) |

## 5. Próxima sesión

1. Procesar respuestas pendientes en `responses/`, si hay.
2. BL-004: sincronizar `docs/BRIEFING.md` y `docs/DESARROLLADORES.md` con el código real.
3. BL-005: analizar `js/characters-theme.js`, que se carga dos veces, antes de quitar una de las dos inclusiones (puede cambiar el comportamiento).
4. Si hay forma de leer CI: BL-031.

## 6. Qué conviene que mire Pablo

- **FEAT-002 en DEV**: en la pestaña Red del navegador no debe haber peticiones a Google Analytics, y `window.__gaEnabled` debe valer `false`.
- **GitHub Actions de gw2-factory-dev**: confirmar que `app-checks` está en verde. La Factory no lo puede ver.
- **Pedidos sin cambios**: REQ-001 (proteger `main` de producción) y REQ-002 (Vercel).
