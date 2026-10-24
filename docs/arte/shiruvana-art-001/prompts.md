# SHIRUVANA-ART-001 — Pack de prompts para generar «EVOLVING» con IA

Dos versiones, **realista** y **anime**, de la misma escena A + B. Sirven para Midjourney, ChatGPT (imágenes), Gemini, Leonardo o Stable Diffusion.

## Cómo usarlo (3 pasos)

1. **Referencia de composición:** subí `evolving-1920x1080.png` (o la vertical) como imagen de referencia. Así se mantienen la pose y la ubicación de cada uno.
2. **Referencias de personaje:**
   - Pablo: su foto actual.
   - Shiruvana: **solo el avatar oficial ilustrado** (fondo turquesa, top violeta). Nunca la foto de una persona real.
3. **El texto se agrega después.** Las IA suelen escribir mal. Pedí la imagen **sin texto** y después se agregan `EVOLVING` y la firma con el código (o en cualquier editor).

---

## Escena base (común a las dos)

> Night workshop scene, centered composition. In the middle, a giant sitting black cat sculpture with a geometric silhouette (two pointed triangular ears, flat head between the ears, rounded rectangular body), shown half-built: its left half is solid glossy obsidian, its right half is still a glowing violet wireframe grid with small black cube pieces floating into place. Its two large oval amber eyes are already glowing brightly. On the right, a young blonde woman with a high ponytail, purple sleeveless top, teal belt and small green earring stands on a small crate and finishes the top of the cat's right ear with a slim teal light tool, amber sparks flying, a translucent teal holographic panel floating beside her. On the left, a man in his 40s with a short dark fade haircut, full dark beard with a grey chin, black t-shirt and dark jeans holds a blue blueprint of the finished cat in one hand and points with the other toward the ear she is building; a dotted light-blue line of light connects his fingertip to that spot. Floor with a subtle violet perspective grid. Color palette: obsidian #0F1117, arcane violet #7B5CFF, amber #F2B94B, teal #2C9398, deep purple #442283, blueprint blue #2C4A7A. Space at the bottom for a title. No text, no letters, no logos.

---

## Versión realista

### Midjourney

```
[ESCENA BASE] cinematic photorealistic concept art, volumetric violet rim light, amber glow from the cat's eyes lighting the two people's faces, shallow depth of field, 35mm lens, high detail skin and hair, subtle haze and floating dust particles, dark moody background --ar 16:9 --style raw --v 6.1 --cref <URL foto Pablo> --cw 80 --sref <URL evolving-1920x1080.png>
```

Formatos: `--ar 9:20` (celular), `--ar 16:9` (escritorio), `--ar 1.91:1` (compartir).

Para Shiruvana, generar aparte con `--cref <URL avatar oficial> --cw 60` e integrarla con *Vary (Region)*: Midjourney toma un solo `--cref` por personaje de forma fiable.

### ChatGPT / Gemini (lenguaje natural)

```
Usando la primera imagen como guía de composición y la segunda como referencia del hombre de la izquierda, generá una versión fotorrealista y cinematográfica de esta escena: [ESCENA BASE]. La mujer de la derecha tiene que parecerse a la ilustración de la tercera imagen (rubia, coleta, top violeta), en versión realista pero sin copiar a ninguna persona real. Iluminación nocturna, luz violeta de contorno y el brillo ámbar de los ojos del gato sobre las caras. Sin texto.
```

### Stable Diffusion (SDXL)

- **Positive:** `[ESCENA BASE], photorealistic, cinematic lighting, 8k, detailed skin texture, volumetric light`
- **Negative:** `text, letters, watermark, logo, cartoon, extra fingers, deformed hands, cat with fur, realistic animal cat, lowres, blurry face`
- **ControlNet:** `canny` o `depth` con `evolving-1920x1080.png`, peso 0.6–0.75.
- **Caras:** IP-Adapter FaceID con la foto de Pablo (solo para él).

---

## Versión anime

### Midjourney (Niji)

```
[ESCENA BASE] anime key visual, cel shading, clean ink lines, sparkling highlights, big expressive eyes, dramatic radial light rays behind the cat, star sparkles, vibrant violet and magenta night sky, Makoto Shinkai inspired lighting --ar 16:9 --niji 6 --sref <URL evolving-anime-1920x1080.png>
```

### ChatGPT / Gemini

```
Convertí la primera imagen en una ilustración estilo anime de alta calidad (key visual de serie): misma composición y mismos personajes, sombreado cel en dos tonos, líneas de tinta limpias, ojos grandes y expresivos, rayos de luz detrás del gato y destellos. El hombre se basa en la segunda imagen; la mujer, en la tercera (ilustración rubia con top violeta), con ropa sobria. Sin texto.
```

### Stable Diffusion (modelo anime, por ejemplo Animagine XL)

- **Positive:** `masterpiece, best quality, anime key visual, 1girl, 1boy, blonde ponytail, purple sleeveless top, bearded man, black t-shirt, holding blueprint, pointing, giant black cat statue half built, violet wireframe, glowing amber eyes, sparks, light rays, night, cel shading`
- **Negative:** `text, watermark, logo, nsfw, revealing clothes, lowres, bad hands, extra digits`
- **ControlNet:** `lineart_anime` o `canny` con `evolving-anime-1920x1080.png`.

---

## Reglas para que siga siendo nuestra obra

- **El gato no es un animal.** Es la silueta de la marca: orejas triangulares, cabeza plana entre las orejas, cuerpo rectangular redondeado, sin pelo, sin bigotes y sin boca. Si la IA dibuja un gato de verdad, repetir con `geometric silhouette, flat logo-like shape, no fur, no whiskers`.
- **Los ojos ámbar siempre encendidos**, aunque el cuerpo esté a medio construir: es la idea central.
- **Shiruvana con ropa sobria** (top violeta sin escote marcado): es la voz de la Bóveda y del panel. Basada en el avatar ilustrado, nunca en una foto de una persona real.
- **Pablo señala, Shiruvana construye:** si la IA invierte los roles, repetir con `the man only points and holds the blueprint, the woman is the one building`.
- **Texto, siempre después:** `EVOLVING` en ámbar #F2B94B y debajo «GATO NEGRO FACTORY · BUILDING THE VAULT» con la marca.
