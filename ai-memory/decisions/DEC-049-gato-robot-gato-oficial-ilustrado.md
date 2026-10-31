# DEC-049 — El gato robot es el gato oficial ilustrado

- Estado: ACEPTADA — decidida por Pablo el 2026-10-31
- Fecha: 2026-10-31 21:38Z
- Decide: Pablo (marca, DEC-018 y DEC-024 §1)
- Tarea: BL-085

## Contexto

El gato ilustrado de ART-001 (2026-10-24) y el logo «gato mitad placa» venían de una idea ajena: el Mi Bunny que arregla al robot de Android en la pantalla de fastboot de Xiaomi. Al generar el fondo EVOLVING en Gemini con solo mi referencia, salió un gato robot propio: negro, placas con remaches, ojos ámbar encendidos, placa verde al costado y cables que yo sueldo. Pablo lo eligió como el gato oficial.

## Decisión

1. **Marca plana, sin cambios**: el SVG de la cabecera y el favicon (`gato-negro.svg`, `brandMark()` del panel) siguen igual. La huella de `brandMark()` sigue vigilada.
2. **Gato ilustrado = el gato robot**: estados vacíos, «en construcción», el sitio propio y el arte EVOLVING. Sus ojos usan el ámbar del GDS (#E8B34B).
3. **Recursos** (los sube Pablo; la Factory no sube binarios): `gato-en-construccion-256/512.webp` y `gato-negro-ia-128/256/512.webp`, con los mismos nombres que en `la-guarida/assets/brand/`, para reemplazarlos sin tocar código. Fondos `evolving-16x9` (2752×1536) y `evolving-21x9` (3168×1344), con el texto 進化中 · EVOLVING · GATO NEGRO FACTORY · BUILDING THE VAULT.
4. ART-001 queda como antecedente; su gato no se usa más.

## Pendiente

- Versión de celular (9:16) del fondo EVOLVING: la imagen actual no se recorta bien en vertical; necesita una generación nueva.
