# BL-081 — Informe de promoción a producción

- Fecha: 2026-10-28 03:24Z (Pablo corrió el comando de una línea, vía PowerShell, DEC-036).
- Qué subió: BL-078 «Una sola Bóveda» (FEAT-024) y BL-079 (la API Key real de 72 caracteres se acepta).
- DEV fijo: `761b1fc12eae2186bd0608d7a4be92568a9181c7` · manifiesto `factory/promote/BL-081.txt` (15 movimientos).
- Producción antes: `bc089b1` · producción ahora: `a501bea20f1cda0e0739e6afd370161d4e63ff5b`.
- Rollback: rama `rollback/pre-bl-081` = `bc089b1` (verificada en gw2-wallet-ligero).
- Salida del script: `15 | 15 | 0 distintos`, SI, push OK.

## Control blob a blob (Shiruvana, después del push)

| Qué | Resultado |
|---|---|
| `js/` (78 entradas) | 77 iguales a DEV 761b1fc; la única distinta es `js/analytics.js`, que es propia de producción y no se toca |
| `js/gn-kit.js` (nuevo) | `f49d17f` = DEV |
| `js/app.js` 2.9.2 (BL-079) | `29df2d8` = DEV |
| `index.html` | `d92e27c` = DEV |
| `assets/data/` (incluido `raids/catalog.json` `f41b063`) | árbol `649c5b4` = DEV |
| `assets/icons/` | árbol `f71ed44` = DEV (los íconos elegidos ya estaban) |
| `assets/meta-drops.json` | `e30b617`, la versión de producción, sin tocar |
| `css/`, `privacy.html`, guías | iguales a DEV, sin tocar |

Conclusión: producción quedó exactamente como DEV en todo lo que se publica.

## Para validar en producción (Chrome, Ctrl+F5)

1. Gestión de API Keys: una Key real se acepta (BL-079).
2. Metas: los 4 relojes grandes con ícono; el diario se pone dorado cuando falta menos de 1 h.
3. Actividades, Cámara del Brujo, Heredad y Raids: los relojes compactos con ícono; Raids solo el semanal.
4. Pestañas con ícono en Raids, Actividades, Heredad, Cámara, Logros, Inventario y Cuentas; en el celular, también la ficha de un encuentro de Raids.
5. Raids: la cabecera de cada ala se distingue de sus filas; los 5 encuentros sin miniatura muestran el emblema de su expansión.
6. Menú Enlaces de la barra: los 5 enlaces con su ícono.

## Notas

- Chak, Dragon's End y los retratos de jefes siguen sin imagen: BL-080, bloqueada por entorno.
- La primera vez que cada jugador abre producción, el navegador pide los módulos nuevos (`?v`): no hay migración de datos en este pase.
