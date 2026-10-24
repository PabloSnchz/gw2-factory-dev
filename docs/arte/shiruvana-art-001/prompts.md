# SHIRUVANA-ART-001 — Pack de prompts para generar «EVOLVING» con IA

Dos versiones, **realista** y **anime**, de la misma escena A + B.

## Generador recomendado (2026-10-24)

| Uso | Generador | Por qué |
|---|---|---|
| **Principal** | **Gemini (Nano Banana)** | Acepta varias imágenes de referencia a la vez y mantiene a dos personas reales distintas en la misma escena. |
| Alternativa | **ChatGPT (GPT Image 2)** | Edición conversacional que preserva la identidad: se corrige de a una cosa por vez. |
| Solo para anime | Midjourney (Niji) | El mejor estilo, pero su referencia de personaje orienta y no garantiza el parecido con una persona real. |

## Referencias

1. **Composición:** `evolving-1920x1080.png` (o la vertical).
2. **Pablo:** una foto suya actual, de frente o tres cuartos, con buena luz.
3. **Shiruvana:** la apariencia de Shiruvana se basa en una persona real. Pablo aporta su foto **con el consentimiento de esa persona**. La foto debe ser actual, de frente y con buena luz; si se puede, sumar una segunda desde otro ángulo.
4. **Sin texto.** `EVOLVING` y la firma se agregan después con el código o en un editor.

Privacidad: las fotos se suben al servicio elegido. Conviene desactivar la opción de usar los datos para entrenar (ChatGPT: Configuración → Controles de datos; Gemini: Actividad en las apps de Gemini). La foto real de Shiruvana no se publica en ningún repo.

---

## Escena base (en inglés, común a las dos)

> Night workshop scene, centered composition. In the middle, a giant sitting black cat sculpture with a geometric silhouette (two pointed triangular ears, flat head between the ears, rounded rectangular body, no fur, no whiskers, no mouth), shown half-built: its left half is solid glossy obsidian, its right half is still a glowing violet wireframe grid with small black cube pieces floating into place. Its two large oval amber eyes are already glowing brightly. On the right, the woman from the reference stands on a small crate and finishes the top of the cat's right ear with a slim teal light tool, amber sparks flying, a translucent teal holographic panel floating beside her; she wears a purple sleeveless top, teal belt and small green earring, blonde hair in a high ponytail. On the left, the man from the reference, black t-shirt and dark jeans, holds a blue blueprint of the finished cat in one hand and points with the other toward the ear she is building; a dotted light-blue line of light connects his fingertip to that spot. Floor with a subtle violet perspective grid. Color palette: obsidian #0F1117, arcane violet #7B5CFF, amber #F2B94B, teal #2C9398, deep purple #442283, blueprint blue #2C4A7A. Empty space at the bottom for a title. No text, no letters, no logos.

---

## Versión realista

### Gemini / ChatGPT (subir 3 imágenes en este orden)

```
Imagen 1: guía de composición. Imagen 2: el hombre. Imagen 3: la mujer.
Generá una foto cinematográfica y fotorrealista de esta escena, respetando la composición de la imagen 1: [ESCENA BASE]
Mantené exactamente las caras, rasgos, edad, tono de piel y pelo de las personas de las imágenes 2 y 3; no las embellezcas ni las rejuvenezcas. Luz nocturna, luz violeta de contorno y el brillo ámbar de los ojos del gato sobre las caras. Lente de 35 mm, poca profundidad de campo. Sin texto.
```

Si una cara sale poco parecida, no regenerar todo; pedir: «Corregí solo la cara del hombre (o de la mujer) para que coincida con la imagen 2 (o 3); no cambies nada más».

### Midjourney (si se usa)

```
[ESCENA BASE] cinematic photorealistic concept art, volumetric violet rim light, amber glow lighting the faces, 35mm, shallow depth of field --ar 16:9 --style raw --oref <URL foto> --ow 100
```

Una persona por generación; la segunda se integra con *Edit / Vary (Region)*.

---

## Versión anime

### Gemini / ChatGPT

```
Imagen 1: guía de composición. Imagen 2: el hombre. Imagen 3: la mujer.
Convertí la escena en una ilustración anime de alta calidad (key visual de serie): misma composición, sombreado cel en dos tonos, líneas de tinta limpias, ojos expresivos, rayos de luz detrás del gato y destellos. Los dos personajes tienen que ser reconocibles como las personas de las imágenes 2 y 3 (mismo corte de pelo, barba y rasgos). Ropa sobria. [ESCENA BASE]. Sin texto.
```

### Midjourney (Niji)

```
[ESCENA BASE] anime key visual, cel shading, clean ink lines, sparkling highlights, dramatic radial light rays behind the cat, star sparkles, violet and magenta night sky --ar 16:9 --niji 6 --sref <URL evolving-anime-1920x1080.png>
```

---

## Formatos

Pedir el mismo resultado en 16:9 (escritorio), 9:20 (celular) y 1.91:1 (para compartir). En Gemini/ChatGPT: «misma imagen, ahora en formato vertical 9:20, sin cambiar a las personas».

## Reglas para que siga siendo nuestra obra

- **El gato no es un animal.** Es la silueta de la marca: orejas triangulares, cabeza plana entre las orejas, cuerpo rectangular redondeado, sin pelo, bigotes ni boca. Si sale un gato real, repetir con `geometric silhouette, flat logo-like shape`.
- **Los ojos ámbar siempre encendidos**, aunque el cuerpo esté a medio construir.
- **Ropa sobria.** Las dos personas son reales; nada que no publicarían en su propio perfil.
- **Pablo señala, Shiruvana construye.** Si la IA invierte los roles: `the man only points and holds the blueprint, the woman is the one building`.
- **Texto, siempre después:** `EVOLVING` en ámbar #F2B94B y debajo «GATO NEGRO FACTORY · BUILDING THE VAULT» con la marca.
