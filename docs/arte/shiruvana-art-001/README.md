# SHIRUVANA-ART-001 — «EVOLVING»

- **Estado:** obra entregada a Pablo el 2026-10-24. Concepto aprobado por Pablo: «A + B» (mi recomendación). Variante anime y pack de prompts (realista y anime con IA) entregados el mismo día.
- **Inspiración:** la pantalla Fastboot de Xiaomi (Mi Bunny arreglando al robot de Android). Se tomó solo la idea: «una entidad construyendo otra». No se copió la imagen ni se usa la palabra FASTBOOT.
- **No es parte de la Bóveda.** Es identidad del ecosistema: fondo de pantalla, portada, panel o La Guarida, cuando Pablo lo decida.

## Qué cuenta

Pablo + Shiruvana → evolucionan → Gato Negro.

| Personaje | Rol | En la obra |
|---|---|---|
| Gato Negro | La Bóveda, el producto, el ecosistema | Silueta oficial de la marca (`assets/brand/gato-negro.svg`, misma geometría). Mitad obsidiana, mitad malla arcana con piezas encastrándose. Los ojos ámbar ya están encendidos: el producto vive mientras evoluciona. |
| Shiruvana | Conocimiento, criterio, arquitectura, construcción | Basada en el avatar oficial (DEC-024): rubia con coleta, top violeta, aro verde. Termina la oreja con una herramienta de luz turquesa, parada sobre un cajón «40 KB» (DEC-035). Panel holográfico a su lado. |
| Pablo | Visión, producto, dirección (el «meat proxy») | Basado en su foto: fade, barba con mentón gris, remera negra con el gato. Sostiene el plano (el gato terminado) y señala; una línea de puntos azul va de su dedo hasta la oreja que estoy terminando: él marca el qué, yo el cómo. |

Texto: `EVOLVING` (reemplaza a FASTBOOT: describe un estado), barra de progreso al 62% y firma `GATO NEGRO FACTORY · BUILDING THE VAULT` con la marca.

## Versiones

| Versión | Generador | Archivos | Qué cambia |
|---|---|---|---|
| Original (plana) | `art.py` | `evolving-*.png` | Ilustración vectorial plana, fondo obsidiana. |
| Anime | `art_anime.py` (reusa la escena de `art.py`) | `evolving-anime-*.png` | Cielo violeta-magenta con rayos desde el gato, líneas de velocidad, contorno de tinta, sombreado cel en dos tonos, ojos anime con brillos, destellos de 4 puntas y subtítulo 進化中 («evolucionando»). |
| Realista | IA externa (no se puede con código) | — | `prompts.md`: escena base, prompts para Midjourney, ChatGPT/Gemini y Stable Diffusion, y reglas para que siga siendo nuestra obra. |

La variante anime con código es una aproximación (póster plano con estética anime), no un dibujo de ilustrador. Para anime «de serie» o realismo, `prompts.md`.

## Paleta

| Uso | Color |
|---|---|
| Fondo, gato | Obsidiana `#0F1117` (gato `#07080C`) |
| Superficies | Surface 2 `#232A3A` |
| Lo que está en construcción | Arcano 500 `#7B5CFF` |
| Ojos, chispas, título | Ámbar 500 `#F2B94B` |
| Shiruvana: luz y paneles | Turquesa `#2C9398` (medido en el avatar oficial) |
| Shiruvana: ropa | Violeta `#442283` (medido en el avatar oficial) |
| Plano de Pablo | Azul `#2C4A7A` |
| Anime: tinta, cielo | Tinta `#120A24`, cielo `#1A0F3A` → `#0B0716`, horizonte magenta `#C0479E` |

## Formatos (en cada versión)

| Archivo | Tamaño | Uso |
|---|---|---|
| `…-1080x2400.png` | 1080 × 2400 | Celular / pantalla de arranque |
| `…-1920x1080.png` | 1920 × 1080 | Escritorio |
| `…-1200x630.png` | 1200 × 630 | Para compartir (tarjeta social) |
| `…-icono-1024.png` | 1024 × 1024 | Ícono: solo el gato a medio construir |

Los PNG se los entregué a Pablo en el chat. Son binarios y no puedo subirlos al repo: si los quiere acá, se suben a esta carpeta con «Add file → Upload files».

## Cómo regenerarla

```
pip install pillow
python3 art.py            # versión plana, los 4 formatos en ./out
python3 art_anime.py      # versión anime
python3 art.py d          # solo uno: v (vertical), d (escritorio), s (social), i (ícono)
FONT=/ruta/fuente.otf OUT=destino python3 art.py
```

La fuente tiene que incluir japonés para el 進化中 (por ejemplo Noto Sans CJK). Todo es vectorial dibujado con Pillow (supersampling 2×), sin imágenes externas. La escena vive en coordenadas propias (1800 × 1500) y cada formato es solo una escala y una posición, así una variante nueva no toca los personajes.

## Reglas de identidad (todas las versiones)

- El gato es la silueta de la marca, no un animal: sin pelo, bigotes ni boca.
- Los ojos ámbar siempre encendidos.
- Shiruvana sale del avatar oficial ilustrado, con ropa sobria; nunca de la foto de una persona real.
- Pablo señala y sostiene el plano; Shiruvana construye.

## Pendiente (no implementar sin pedido de Pablo)

- Concepto C «Factory» como banner ancho (panel o La Guarida), con la puerta «PRD» y la llave de Pablo.
- Lema reservado para C: «The Vault Never Sleeps».
- Propuesta original con los tres conceptos: entregada a Pablo como `propuesta-shiruvana-art-001.html`.
