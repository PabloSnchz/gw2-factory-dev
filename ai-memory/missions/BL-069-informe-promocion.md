# BL-069 — Informe final: promoción del ciclo de restyle a producción

- **Fecha:** 2026-10-24
- **Pedido:** Pablo validó BL-057, BL-058, BL-064 y BL-067 (13:10Z) y pidió preparar la promoción sin ejecutarla. Entregué la propuesta (comparación, archivos, riesgos, estrategia, rollback, orden). Pablo la aprobó con el plan A, de PRD-0 a PRD-9 (15:04Z).
- **Ejecución:** 2026-10-24 15:05Z a 15:21Z, en `gw2-wallet-ligero` (producción), en serie, un archivo por commit.
- **Resultado:** HECHO. Espera la validación de Pablo en producción.
- **Vuelta atrás:** rama `rollback/pre-restyle-ciclo` = `374b6f0` (HEAD de producción antes de empezar).

## 1. Comparación DEV contra producción (medida antes de escribir)

| Frente | Estado en producción antes | Qué faltaba |
|---|---|---|
| BL-057 Metas y Eventos (FEAT-007) | En producción desde BL-062 (2026-10-23) | Nada. DEV no cambió después |
| BL-058 Bienvenida (FEAT-008) | En producción desde BL-062 y BL-063 | Nada |
| BL-064 Cámara del Brujo (FEAT-011) | En producción desde BL-068, con `wv-view.js` 1.1.0 | `wv-view.js` 1.2.0 (superficies) |
| BL-067 Logros y marco común (FEAT-012, FEAT-013) | No estaba | Todo |

`css/` era idéntico. `index.html` de producción difería de DEV en el GA (a propósito, DEC-006), en `#achAsidePanel`, en `achievements.js?v`, en `achievements-theme.js` y en los `?v` de `router.js` y `wallet-theme.js` (excepciones de BL-068).

Supuestos confirmados en PRD-0: `router.js` 2.17.0 de producción busca `#achAsidePanel` con `if (ach)` (no falla si no existe); `achievements.js` 3.6.0 no usa `localStorage` (sin claves nuevas); los 5 íconos locales que usan los módulos de Logros existen en producción.

## 2. Commits en producción

| Paso | Commit | Archivo | Blob | = DEV |
|---|---|---|---|---|
| PRD-0 | — | rama `rollback/pre-restyle-ciclo` | `374b6f0` | — |
| PRD-1 | `bdd9ff1` | `js/gn-surface.js` 1.0.0 (nuevo, inerte) | `b534c3f` | sí |
| PRD-2 | `9dc9b91` | `js/ach-armory.js` 1.0.0 (nuevo, inerte) | `3c29765` | sí |
| PRD-2 | `f4ed647` | `js/ach-categories.js` 1.0.0 (nuevo, inerte) | `a7353e3` | sí |
| PRD-2 | `e7a490d` | `js/ach-cards.js` 1.2.0 (nuevo, inerte) | `a73c9ba` | sí |
| PRD-2 | `b775b8a` | `js/ach-view.js` 1.3.0 (nuevo, inerte) | `98b8dca` | sí |
| PRD-3 | `005edf3` | `js/wv-view.js` 1.1.0 → 1.2.0 | `3df488f` | sí |
| PRD-3 | `338bcab` | `js/modules.json` intermedio (sin `gn-frame`) | `54c39e0` | paso intermedio |
| PRD-4 | `cf3cedf` | `js/achievements.js` 3.2.1 → 3.6.0 | `b9cc84a` | sí |
| PRD-5 | `c013173` | `index.html`: sin `#achAsidePanel`, `achievements.js?v=3.6.0`, sin `achievements-theme.js` | `0cab653` | exactamente el calculado; GA intacto |
| PRD-6 | `b6e9d8a` | borra `js/achievements-theme.js` | — | igual que DEV `c1d0021` |
| PRD-7 | `ca6e6d9` | `js/gn-frame.js` 1.0.0 | `bbb18ed` | sí |
| PRD-7 | `0b60eee` | `js/modules.json` final | `4c37e08` | sí |

Los módulos nuevos no hacen nada hasta que el manifiesto los carga, y los de Logros no hacen nada hasta que `achievements.js` publica su estado: cada commit dejó el sitio andando. `gn-frame.js`, que cambia seis pantallas de uso diario, fue el último y aislado.

## 3. Integridad (PRD-8)

- `js/`: 58 archivos en cada lado, los mismos nombres. 54 idénticos blob a blob.
- Difieren a propósito: `analytics.js` (DEC-006), `router.js` (producción 2.17.0; la 2.18.0 de DEV solo borra código muerto), `wallet-theme.js` (producción 2.1.0; la 2.1.1 de BL-066 no se pidió) y `settings-manager.js` (solo la cabecera de versión, 1.0.2 → 1.0.4, de PATCH-014).
- `css/`: árbol idéntico.
- `index.html`: difiere de DEV solo en el GA y en los `?v` de `router.js` y `wallet-theme.js`.

## 4. Riesgos

| Riesgo | Nivel | Cómo quedó |
|---|---|---|
| `index.html` de 64 KB en una sola publicación | ALTO | Antes de escribir medí las 39 líneas con espacios finales y los caracteres invisibles; el blob publicado es el calculado (`0cab653`) |
| Ventana con `achievements.js` 3.6.0 y `achievements-theme.js` cargado | ALTO | 4 min 50 s (15:14:51Z a 15:19:41Z), sin errores posibles: el theme viejo solo buscaba tarjetas que ya no existen |
| Marco común sobre seis pantallas | MEDIO | Último paso; vuelta atrás = sacarlo de `js/modules.json` |
| Caché del navegador | BAJO | `?v` y manifiesto al día; validar con Ctrl+F5 (RSK-020) |
| Seis vistas previas de Metas sin subir a producción | BAJO | Sin cambio; siguen esperando la subida de Pablo (binarios) |

## 5. Vuelta atrás

- Marco común: sacar `js/gn-frame.js` de `js/modules.json`.
- Superficies: sacar también `js/gn-surface.js`; la Cámara y Logros vuelven a sus colores de antes.
- Cámara: `wv-view.js` 1.1.0 (blob `6909434`).
- Logros: restaurar `js/achievements.js`, `js/achievements-theme.js`, `index.html` y `js/modules.json` desde `rollback/pre-restyle-ciclo`.
- Total: republicar cada archivo tocado desde `rollback/pre-restyle-ciclo`. Todos pesan menos de 40 KB salvo `index.html`, que ya se publicó entero dos veces.

## 6. Validación para Pablo (producción)

Abrir https://pablosnchz.github.io/gw2-wallet-ligero/ con Ctrl+F5:

1. Logros: cabecera, tres pestañas, tarjetas con el ícono oficial grande y anillo dorado en los que están a un paso; la barra lateral ya no muestra el panel viejo de Logros.
2. Cámara del Brujo: tarjetas de la Tienda con ícono de 52 px y lo fijado en dorado.
3. Actividades, Raids, Strikes, Inventario, Personajes y Cuentas: cabecera con el ícono oficial en placa y tarjetas despegadas del fondo.
4. Un theme claro (Notion o macOS): todo se lee.

## 7. Documentación

FEAT-007, FEAT-008, FEAT-011, FEAT-012 y FEAT-013, backlog (BL-057, BL-058, BL-064, BL-067 y BL-069) y `docs/CHANGELOG-FACTORY.md` por el canal de parches (PATCH-035); `status.md` por PATCH-036.

## 8. Lo que sigue

Me detengo acá, como pidió Pablo. No empiezo BL-059 ni otro frente. La próxima tarea, cuando Pablo la abra, es SHIRUVANA-ART-001.
