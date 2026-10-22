# REQ-011 — ¿Aprobás el plan para llevar la Cartera renovada a producción?

- Estado: CERRADA
- Tipo: decisión
- Fecha: 2026-10-22
- Prioridad: ALTO
- Área: producto
- Relacionado: BL-056, FEAT-006, RSK-020, DEC-006, LES-028
- Bloquea: la promoción de la Cartera (PRD-11 a PRD-14)
- Cerrado: 2026-10-22 23:17Z · aprobada la opción A. Pablo acepta RSK-020 como BAJO y el riesgo ALTO de la vuelta atrás del conversor (la 2.0.0 está validada y con tests; la vuelta atrás es la rama `rollback/pre-cartera`). Autoriza PRD-0 y PRD-11 a PRD-14 en ese orden. Al terminar: verificar integridad, pasar FEAT-006 y el CHANGELOG a producción y pedirle la validación final. Próximo frente después de cerrar BL-056 en producción: restyle de Meta & Eventos.

## Qué pasó

Validaste la Cartera renovada en DEV (2026-10-22 23:11Z) y pediste preparar la promoción sin ejecutarla. Comparé DEV y producción (`gw2-wallet-ligero`, HEAD `dd5c0c6`) archivo por archivo en `js/`: solo difieren los tres archivos de la Cartera, más `analytics.js`, que es distinto a propósito (DEC-006).

| Archivo | Producción hoy (vuelta atrás) | DEV validado |
|---|---|---|
| `js/wallet-theme.js` | 1.3.1 · `d06748e` · 12.688 B | 2.1.0 · `3083c87` · 35.305 B |
| `js/converter-modal.js` | 1.2.0 · `b42da9c` · 68.346 B | 2.0.0 · `e311da4` · 48.689 B |
| `js/wallet-dashboard.js` | 2.9.0 · `ff3d319` · 49.290 B | 3.0.0 · `dce7b5d` · 52.505 B |

Lo que estos archivos necesitan ya está en producción y es idéntico a DEV: `app.js` (`7dc8c13`), `shiruvana.js` (`51ce29a`, la voz de «Shiruvana recomienda») y los íconos 733322, 578844, 502065, 619316 y 619317. `index.html` no se toca.

## Plan propuesto (opción A, recomendada)

Repetir en producción el mismo camino que recorrió DEV. Así, cada estado intermedio de producción es uno que ya viste y validaste en DEV:

| Paso | Archivo | Blob | Estado que queda (validado en DEV como) |
|---|---|---|---|
| PRD-0 | rama `rollback/pre-cartera` en `dd5c0c6` | — | punto de vuelta atrás exacto |
| PRD-11 | `wallet-theme.js` 2.0.0 | `669467a` | CAR-1 |
| PRD-12 | `converter-modal.js` 2.0.0 | `e311da4` | CAR-2A |
| PRD-13 | `wallet-theme.js` 2.1.0 | `3083c87` | CAR-2B |
| PRD-14 | `wallet-dashboard.js` 3.0.0 | `dce7b5d` | CAR-3 (final) |

- Un archivo por commit, en serie, y después de cada uno compruebo que el blob de producción sea idéntico al de DEV.
- Después actualizo la memoria: FEAT-006 y el CHANGELOG pasan a «En producción».
- Al final validás en producción con Ctrl+F5.

**Opción B:** 3 commits directos (conversor, theme 2.1.0, dashboard). Es un commit menos, pero el primer estado intermedio (theme 1.3.1 con conversor 2.0.0) nunca existió en DEV. No la recomiendo.

## Riesgo

- **ALTO — vuelta atrás del conversor:** la versión 1.2.0 pesa 68.346 B y no entra en una publicación de la Factory (LES-028). Si el conversor nuevo falla en producción, yo puedo corregir hacia adelante (la 2.0.0 pesa 48,7 KB). Volver a la 1.2.0 tal cual lo tenés que hacer vos con git, desde la rama `rollback/pre-cartera`. Por eso PRD-0 crea esa rama antes de tocar nada.
- **MEDIO — RSK-020 en producción:** `index.html` sigue pidiendo `?v=1.2.0`, `?v=2.9.0` y `?v=1.3.1`. GitHub Pages revalida a los 10 minutos, pero durante ese tiempo alguien puede tener mezclados archivos viejos y nuevos. Con el orden de la opción A, cualquier mezcla entre pasos vecinos es un estado que funciona.
- **BAJO — `gn:wallet:hidezero`:** es la única clave nueva en el navegador. Si se vuelve atrás, queda guardada sin uso y no molesta. DEV y producción comparten el dominio `pablosnchz.github.io`, así que lo que elegiste en DEV también se aplica en producción.
- **BAJO — sin red de tests en producción:** `gw2-wallet-ligero` no tiene tests ni CI de la app. La garantía son los blobs idénticos a DEV.

## Vuelta atrás

| Si falla después de | Qué hago | Quién |
|---|---|---|
| PRD-11 | publicar `wallet-theme.js` 1.3.1 (`d06748e`) | Factory |
| PRD-12 | corregir hacia adelante el conversor 2.0.x; o volver a la 1.2.0 desde `rollback/pre-cartera` | Factory / Pablo |
| PRD-13 | publicar `wallet-theme.js` 2.0.0 (`669467a`) | Factory |
| PRD-14 | publicar `wallet-dashboard.js` 2.9.0 (`ff3d319`) | Factory |
| Todo | restaurar los tres archivos desde `rollback/pre-cartera` (`dd5c0c6`) | Pablo |

## Por qué te lo pregunto

Producción es tuya: no la toco sin tu orden. Además, la vuelta atrás completa del conversor depende de vos (riesgo ALTO de arriba) y quiero que lo aceptes antes de empezar.
