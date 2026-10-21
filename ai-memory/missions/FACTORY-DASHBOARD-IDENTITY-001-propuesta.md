# FACTORY-DASHBOARD-IDENTITY-001 — Identidad visual de Shiruvana en el panel

- Estado: APROBADA (v2) — opción A de REQ-009 (RESP-009), con reglas y tamaños de Pablo; normativa en DEC-024; implementación en BL-037
- Fecha: 2026-10-21
- Repositorio afectado: gw2-factory-dashboard (solo el panel; la app La Bóveda no cambia)
- Relacionadas: DEC-010 (GDS), DEC-013 (Centro de decisiones), DEC-018, DEC-019, DEC-023, DEC-024

> **v2 (2026-10-21).** Pablo aprobó la opción A y ajustó: avatar más grande (48 px en advertencias, recomendaciones y explicaciones; 56 px en resúmenes y decisiones importantes), un solo avatar por sección visible, nada de avatar en tarjetas de datos, y la explicación o el análisis como uso permitido. Este documento ya incluye esos cambios; si algo difiere, manda DEC-024.

## 1. Propuesta conceptual

**Shiruvana es una voz, no un personaje.** El panel sigue mostrando datos del sistema. El avatar marca la autoría: cuando aparece, lo que sigue es una opinión, una decisión o una advertencia de Shiruvana, no un dato medido. Así el avatar tiene una función: separar "lo que el sistema mide" de "lo que Shiruvana interpreta".

- **Un solo componente lleva el avatar:** la *voz de Shiruvana* (`gds-voice`). Nunca aparece suelto.
- **Jerarquía de marca sin cambios:** el gato es la marca de la Factory, Shiruvana la operadora y La Bóveda el producto. El avatar no reemplaza al gato ni usa sus tokens de marca (`brand-frame`, `brand-eyes`).
- **Si no hay nada que comunicar, no hay avatar.** Un panel tranquilo no muestra a Shiruvana.

### Análisis de la imagen de referencia

- Retrato digital ilustrado, de 245 × 282 px: mujer de pelo rubio rojizo con cola de caballo, que mira por encima del hombro con una media sonrisa.
- Fondo verde azulado con hojas, top violeta y aro verde.
- **Coincide con el GDS:** el violeta del top está cerca de arcane-500 (`#7B5CFF`), el color de identidad del sistema.
- **No coincide:** el verde azulado del fondo no existe en la paleta. Recortado en círculo a 48–56 px, el fondo queda como un borde alrededor del rostro y el anillo arcano lo separa del resto.
- **Escala:** el recorte del rostro mide 210 px. Alcanza para 56 px a 2x (112 px). No alcanza para usos más grandes, que además no se proponen.
- **Expresión:** cálida y confiada, coherente con "claridad, confianza, tranquilidad". Por eso no se agregan variantes de humor: una sola imagen fija.

## 2. Dónde aparece

| Lugar | Tipo de mensaje | Tamaño | Cuándo |
|---|---|---|---|
| Hoy, debajo de las métricas (bloque propio, no dentro de una tarjeta) | Resumen de sesión ("Shiruvana resume") | 56 px | Siempre que hubo una sesión; máximo 3 viñetas |
| Hoy, arriba de todo | Advertencia (agrupadas en un bloque) | 48 px | Solo si hay riesgo CRÍTICO, ALTO sin mitigar, vigilia vencida (> 48 h) o detención |
| Necesita tu decisión, en la tarjeta REQ | Recomendación | 48 px | Siempre: es la sección "Recomendación" del pedido |
| Historial "Decidido por la Factory" | Decisión importante + lista | 56 px | La última decisión importante con avatar; el resto, lista sin avatar |
| Ideas, en "Esperando criterio" | Recomendación | 48 px | Solo la idea que Shiruvana propone promover, con su motivo |
| Salud, debajo de la grilla de métricas | Explicación o advertencia | 48 px | Solo cuando una métrica de DEC-023 sale de su rango sano |

**Un avatar por sección visible:** el primer mensaje de Shiruvana de la sección lleva la imagen; los siguientes conservan rótulo, ícono y borde, sin imagen.

**No aparece en:** cabecera (ahí sigue el gato), navegación, pie, estados vacíos, cargas, métricas, tarjetas de datos, listas de backlog, contexto de un pedido (eso es dato), errores del canal (son del sistema) ni en la app La Bóveda.

### Tamaño y densidad

- **Columna izquierda:** el avatar va en una columna a la izquierda del mensaje, alineado arriba, no dentro de la línea del rótulo.
- **Sin altura extra:** un mensaje mide como mínimo rótulo + 2 líneas, 64 px con avatar de 48 y 88 px en el resumen con avatar de 56. El avatar más grande solo ocupa 60–68 px de ancho.
- **Pantallas de 480 px o menos:** se baja un escalón, de 48 a 40 px y de 56 a 48 px, para que el texto conserve al menos 260 px de ancho.

## 3. Qué comunica

| Tipo | Rótulo visible | Ícono | Color (siempre con rótulo e ícono) | Contenido |
|---|---|---|---|---|
| Dato del sistema | Nombre del dato | — | Neutro (obsidiana) | Valores medidos. **Sin avatar.** |
| Recomendación | Shiruvana recomienda | ➜ | Tinte arcano 0.14, borde arcane-500, rótulo arcane-300 | Opción sugerida y su motivo en 1–2 frases |
| Decisión | Shiruvana decidió | ✓ | Tinte arcano 0.14, borde jade, rótulo jade | Qué decidió, por qué y enlace a DEC/LES |
| Advertencia ALTO | Shiruvana advierte · ALTO | ▲ | Tinte ámbar 0.14, borde y anillo ámbar | Riesgo, efecto y qué hace la Factory |
| Advertencia CRÍTICO | Shiruvana advierte · CRÍTICO | ■ | Tinte carmesí 0.14, borde y anillo carmesí | Qué se detuvo y qué necesita de Pablo |
| Explicación o análisis | Shiruvana explica | ◇ | Superficie 1, borde arcane-300 | Por qué un dato importa o cómo leerlo; siempre cita el dato |
| Resumen de sesión | Shiruvana resume | ◆ | Superficie 1, borde arcane-500 | Qué cerró, qué registró y qué sigue |

**Reglas de contenido:**

- Cada mensaje lleva fecha y la fuente (ID o archivo). Sin fuente, no se publica.
- Texto breve, en español rioplatense, sin adjetivos de venta. Puede hablar en primera persona sobre sus propias acciones ("Registré DEC-023"), nunca sobre datos medidos.
- Si una advertencia no requiere a Pablo, lo dice: "no necesitás hacer nada".

**Contraste calculado** (sobre surface-1 `#1A1F2B` con tinte 0.14):

| Par | Contraste |
|---|---|
| Rótulo arcane-300 sobre tinte arcano | 5.69 |
| Texto mist-100 sobre tinte arcano | 13.03 |
| Rótulo ámbar sobre tinte ámbar | 6.88 |
| Texto mist-100 sobre tinte ámbar | 11.29 |
| Rótulo crimson-300 sobre tinte carmesí | 5.50 |
| Texto mist-100 sobre tinte carmesí | 13.32 |
| Rótulo jade-300 sobre tinte arcano | 6.35 |
| Anillo arcane-500 sobre surface-1 (no texto, mínimo 3) | 3.78 |

Todos cumplen WCAG 2.1 AA.

## 4. Qué NO debe hacer

- Aparecer como decoración, en la cabecera, en estados vacíos o "para dar vida" al panel.
- Animarse, parpadear, cambiar de expresión o tener variantes de humor.
- Usar burbujas de chat, saludos o tono de mascota.
- Hablar sobre datos medidos como si fueran opinión, o presentar una opinión como dato.
- Ocupar más espacio que la información: máximo 56 px (48 px en la mayoría) y un avatar por sección visible.
- Repetirse: varias advertencias van en un solo bloque, y el historial muestra una sola imagen.
- Usar los tokens de marca del gato o colores de estado sin rótulo e ícono.
- Aparecer en la app La Bóveda: la identidad de Shiruvana es del panel de gobierno, no del producto.
- Persuadir: la recomendación se muestra junto a las otras opciones, nunca en su lugar ni preseleccionada.

## 5. Descripción visual

Mockup conceptual entregado aparte a Pablo (`shiruvana-mockup-panel.html`, fuera del repositorio).

```text
┌──────────────────────────────────────────────────────────────┐
│ ▌┌──────┐ ➜ SHIRUVANA RECOMIENDA         2026-10-21 · REQ-009 │
│ ▌│ (◯)  │ A — Es tu imagen sin retoques. A este tamaño se ve   │
│ ▌│ 48px │ claramente y el anillo arcano la separa de la paleta.│
│ ▌└──────┘                                                     │
└──────────────────────────────────────────────────────────────┘
  ▌ = borde izquierdo de 4 px (color del tipo)
  (◯) = avatar circular en columna propia, con anillo de 2 px
```

## 6. Accesibilidad

- El avatar es redundante con el rótulo visible: `aria-hidden="true"` y `alt` vacío, para que el lector de pantalla no lo lea dos veces.
- El significado lo dan el rótulo y el ícono; el color solo acompaña.
- El componente no es interactivo: no agrega paradas de foco. Los botones vecinos mantienen 40 px de alto y foco visible.
- Sin animación, así que `prefers-reduced-motion` no aplica.
- Si la imagen no carga, se muestra un monograma "S" sobre arcane-700.

## 7. Implementación (BL-037, después de BL-034)

Es trabajo de panel (soporte): entra en el ≤ 15 % semanal de DEC-023 y no se adelanta al producto. Son 3 micro-ciclos en gw2-factory-dashboard:

1. Avatar `assets/shiruvana-96.webp` y `-112.webp` (menos de 15 KB) y componente `gds-voice` en el GDS, con su test de contraste.
2. Resumen de sesión y advertencias en Hoy; recomendación en las tarjetas REQ.
3. Historial "Decidido por la Factory", recomendación en Ideas y tests: un avatar por sección y ningún avatar en tarjetas de datos.

La imagen, su uso público y la jerarquía de marca los decidió Pablo (REQ-009, DEC-024). Los tamaños y la disposición los ajusta la Factory dentro de esas reglas.
