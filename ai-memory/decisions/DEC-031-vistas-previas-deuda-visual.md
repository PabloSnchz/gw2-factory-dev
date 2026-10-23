# DEC-031 — Las vistas previas que faltan quedan como deuda visual; no hay recuperación automática de imágenes

- Estado: ACEPTADA — decisión de producto de Pablo (2026-10-23 02:47Z; confirmada 02:51Z y 03:29Z), definitiva
- Fecha: 2026-10-23
- Ámbito: gw2-factory-dev (`assets/meta-drops.json`, `assets/previews/`, `js/meta.js`; se retiraron `.github/workflows/meta-previews.yml`, `tools/meta-previews/build_previews.py` y `tests/meta-previews.test.cjs`)
- Relacionadas: BL-057, BL-048, RSK-016, LES-006

## Contexto

MET-1 (Metas y Eventos 4.0.0) mantuvo la vista previa de infusiones y drops, un diferencial de La Bóveda. 8 de las 10 vistas previas de `meta-drops.json` apuntaban a `wiki.guildwars2.com/images/…` y no cargaban: se veía el texto alternativo de la imagen rota.

MET-1b armó un workflow que bajaba las imágenes en CI y las convertía a WebP en `assets/previews/`. La wiki respondía HTML en vez de la imagen y el workflow pasó a buscar copias en el Internet Archive. Al cierre (`e775d97`, 01:59Z) quedaron 8 de 10 en `assets/previews/`; faltan Chak (`chak_gerent`) y Dragon's End (`dragons_end`).

## Decisión (de Pablo)

1. **Las vistas previas que faltan quedan como deuda visual.** Si algún día aparece el archivo, se agrega a mano en `assets/previews/`.
2. **No se sigue investigando** Internet Archive, Wayback, CDX ni fuentes alternativas, y no se construye ni optimiza infraestructura de recuperación de imágenes.
3. **La discusión está cerrada**: no se vuelve a abrir ni a consultar.

## Lo que hace la Factory

- Se retiraron el workflow, la herramienta y su test (`3375bfd`, `2361b96`, `d0540c7`): no puede volver a correr por accidente. `tools/meta-previews/REPORTE.md` queda solo como registro del origen y la licencia de las imágenes ya guardadas (© ArenaNet, uso no comercial).
- Se usan las 8 vistas previas que ya están en el repo (MET-1c): usar archivos existentes no es investigar.
- Toda vista previa que falte o no cargue muestra un estado «sin vista previa» limpio, con el lenguaje del GDS, nunca la imagen rota ni el texto alternativo suelto (MET-1c).

## Consecuencias

- 2 metas (Chak y Dragon's End) no tienen animación de su infusión; el jugador ve el nombre y un aviso claro.
- Menos superficie en CI: un workflow con permiso de escritura menos.
- BL-057 vuelve a ser la prioridad: sigue MET-1c y después MET-2.
