# DEC-045 — Canal de recursos: los íconos oficiales los baja Actions, no se suben a mano

- Fecha: 2026-10-30 01:36Z
- Decide: la Factory (técnica, DEC-018), al cumplir el pedido de Pablo de usar el ícono oficial de plantillas en Builds
- Tarea: BL-082 BLD-ICON

## Problema

La Factory no puede subir archivos binarios (la API que usa solo escribe texto). Hasta hoy, cada ícono nuevo dependía de que Pablo lo subiera (Chak, retratos de jefes) o se quedaba afuera. Pegar base64 a mano no es seguro: un carácter mal copiado rompe la imagen sin aviso.

## Decisión

Canal nuevo, gemelo del de parches (DEC-035): la Factory escribe `factory/assets/ASSET-NNN.json` con la dirección del recurso y la ruta destino; `.github/workflows/factory-asset.yml` corre `.github/scripts/factory-asset.cjs`, que lo baja, lo verifica y lo deja en `assets/icons/`, con el resultado en `factory/assets/ASSET-NNN.md` (tamaño, medidas, sha256). Republica DEV.

Reglas (todo o nada): solo https de hosts de recursos de Guild Wars 2 (render.guildwars2.com, assets.gw2dat.com, la wiki oficial, icons-gw2.darthmaim-cdn.com); solo imágenes reales por firma (PNG, WebP, GIF, JPG); hasta 5 archivos de 300 KB; solo `assets/icons/`; nunca pisa un archivo existente; sha256 opcional para fijar el contenido. Solo corre con pushes del dueño y solo commitea lo que el script declara.

## Por qué así

El ícono queda en el repo (no dependemos de que un sitio de terceros siga en pie) y el byte que se publica es el que bajó el juego, no uno copiado.

## Primer uso

ASSET-001: textura 156720 del juego (32×32, la pestaña Build del Panel del héroe que mostró Pablo), sha256 5e18c9407c886e06d6817bc7183a8f85ceafc651291e5800911f987cc5b47b5a. No está en la API oficial (/v2/files no tiene íconos de interfaz de plantillas; los objetos de expansión de plantillas 92203/92206/92209 tienen otros dibujos). La identifiqué por el módulo BuildsManager de Blish HUD (lo usa como ícono) y la comparé con la captura en RUN-224.
