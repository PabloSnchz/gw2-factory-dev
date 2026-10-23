# FEAT-007 — Metas y Eventos renovado

- Estado: EN DEV, validada por Pablo en pantalla (2026-10-23 04:14Z: «coincide con la propuesta aprobada. Aprobado.»). Producción la decide Pablo.
- Fecha: 2026-10-23
- Backlog: BL-057 (incluye BL-041) · Propuesta: MET-0 (aprobada por Pablo 2026-10-23 00:39Z, con la vista previa de infusiones como diferencial y sin «Vista compacta») · Decisiones: DEC-031, DEC-021, DEC-024, DEC-025 · Riesgo: RSK-020 · Lecciones: LES-017, LES-028
- Commits (gw2-factory-dev): `e98a25a`, `8838217` MET-1 · `3375bfd`, `2361b96`, `d0540c7`, `2f298db` cierre de MET-1b · `28df57a`, `7f17458`, `30b0f18` MET-1c · `c381ed9`, `3630a56` MET-2 · `31fb0d4`, `14377ef` MET-2b

## Qué resuelve

Metas y Eventos (`meta.js` 3.5.0) mostraba «✕ Pendiente» en rojo en 30 de 49 metas que la API no sigue, no se redibujaba solo, el filtro de tipo dejaba afuera 14 metas, repetía el estado tres veces por tarjeta, perdía las metas que cruzan la medianoche UTC (BL-041) y 8 de sus 10 vistas previas eran imágenes rotas de la wiki. Pablo pidió el mismo nivel que la Cartera.

## Qué cambió

| Paso | Archivo | Versión | Blob | Lo que ve el jugador |
|---|---|---|---|---|
| MET-1 | `js/meta.js` | 4.0.0 | af42ca2 | «Ahora» (en curso y lo que empieza en ≤ 20 min), agenda de las próximas 3 horas por hora local, Fijadas (hasta 6) y todas las metas por expansión en orden de salida; filtros desde los datos, en español y con su cantidad; «Hecho hoy» solo donde la API lo sabe; todo se redibuja cada 30 s; BL-041. |
| MET-1c | `assets/meta-drops.json` · `js/meta.js` | 4.0.1 | 4eaa46f · d70026a | Las vistas previas salen de `assets/previews/` (8 de 10). Chak y Dragon's End, o cualquiera que no cargue, muestran «Sin vista previa» con el nombre de la infusión; mientras carga, «Cargando vista previa…». Nunca la imagen rota ni el texto alternativo suelto. |
| MET-2b | `js/meta-theme.js` | 2.1.0 | 37a2981 | Cabecera de la propuesta: «Metas y Eventos · Horarios en tu hora local · 49 metas» con botones sutiles de Local, Servidor (UTC), Reset diario (00:00 UTC) y Reset semanal (lunes 07:30 UTC) con cuenta regresiva (el cercano en dorado); «Hoy en tu cuenta · N de 19 que puedo seguir por la API» con barra fina, «↻ Actualizar» y «¿Por qué 19?». |
| MET-2b | `js/meta-theme.js` | 2.1.0 | 37a2981 | Mi voz, un mensaje y solo cuando sirve: reset cerca con una pendiente en curso > fijada que empieza o está en curso > pendiente en curso > lo que está en curso > lo que empieza en ≤ 20 min > Key sin «progression» > día completo. El nombre va en negrita y el waypoint se copia con un botón. |

- **Sin tocar `index.html`** (69 KB, LES-028): la cabecera vieja («Pendientes / Hecho hoy») y los filtros viejos quedan ocultos, no borrados.
- **Datos intactos:** se sigue leyendo `meta-events.json`, `meta-drops.json` y `/v2/account/worldbosses` y `/mapchests`. Sin claves nuevas en el navegador; las Fijadas siguen en `gn:meta:favs`.
- **API para otros módulos:** `Meta.snapshot()` y el evento `gn:meta-rendered` (los usa la cabecera; los puede usar la Bienvenida).
- **MET-1b cerrado por Pablo (DEC-031):** la recuperación automática de imágenes (workflow, herramienta y test) se retiró del repo. Las dos vistas previas que faltan son deuda visual; si algún día aparece el archivo, se agrega a mano en `assets/previews/`.

## Cómo evaluarlo

Para mirar (Pablo), en DEV (https://pablosnchz.github.io/gw2-factory-dev/), con Ctrl+F5 (RSK-020) → Metas y Eventos:

1. La cabecera: los cuatro botones corren solos; cerca del reset diario se pone dorado.
2. «Ahora» y la agenda: tocar una meta de la agenda lleva a su tarjeta.
3. Fijar una meta con ★ y ver mi aviso cuando empieza.
4. Las vistas previas: Furienredadera y Drakkar se ven; Chak y Dragon's End dicen «Sin vista previa».

Verificado por la Factory:

| Paso | Tests | Prueba de humo | Mutaciones |
|---|---|---|---|
| MET-1 | 24 (`meta-view` 9 + `meta-events` 15) en UTC, Buenos Aires y Kolkata | 56 comprobaciones | 20/20 |
| MET-1c | 8 nuevos o cambiados en `meta-view` | DOM mínimo: carga, error y «Sin vista previa» | 7/8 (la otra, equivalente) |
| MET-2 | 7 en tres zonas horarias | 19 | 10/10 |
| MET-2b | 9 en tres zonas horarias | 34 | 17/17 |

Todos los blobs publicados son idénticos a los validados en local.

## Riesgos y notas

- **RSK-020 (BAJO, aceptado):** `index.html` sigue pidiendo `meta.js?v=3.4.1` y `meta-theme.js?v=1.4.2`; hace falta Ctrl+F5 hasta que se pueda publicar `index.html`. Para producción, el mismo aviso.
- **Desvío menor de LES-017:** entre `31fb0d4` y `14377ef` CI quedó en rojo unos 45 s (el test viejo contra el código nuevo).
- **Lección de proceso:** la maqueta MET-0 no quedó guardada en el repo y MET-2 se hizo de memoria; Pablo tuvo que pedir la cabecera de la propuesta con una captura. Desde WEL-0, las maquetas aprobadas se guardan en `docs/propuestas/`.
- **Para producción:** `meta-drops.json` apunta a `assets/previews/`, que hay que copiar junto con `meta.js` 4.0.1 (8 archivos WebP, 4,4 MB en total).
