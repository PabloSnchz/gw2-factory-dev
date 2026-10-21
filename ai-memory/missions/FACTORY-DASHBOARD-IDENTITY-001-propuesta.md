# FACTORY-DASHBOARD-IDENTITY-001 — Identidad visual de Shiruvana en el panel

- Estado: PROPUESTA — análisis sin implementar; decisión de Pablo en REQ-009
- Fecha: 2026-10-21
- Repositorio afectado: gw2-factory-dashboard (solo el panel; la app La Bóveda no cambia)
- Relacionadas: DEC-010 (GDS), DEC-013 (Centro de decisiones), DEC-018, DEC-019, DEC-023

## 1. Propuesta conceptual

**Shiruvana es una voz, no un personaje.** El panel sigue mostrando datos del sistema. El avatar marca la autoría: cuando aparece, lo que sigue es una opinión, una decisión o una advertencia de Shiruvana, no un dato medido. Así el avatar tiene una función: separar "lo que el sistema mide" de "lo que Shiruvana interpreta".

- **Un solo componente lleva el avatar:** la *voz de Shiruvana* (`gds-voice`). Nunca aparece suelto.
- **Jerarquía de marca sin cambios:** el gato es la marca de la Factory, Shiruvana la operadora y La Bóveda el producto. El avatar no reemplaza al gato ni usa sus tokens de marca (`brand-frame`, `brand-eyes`).
- **Si no hay nada que comunicar, no hay avatar.** Un panel tranquilo no muestra a Shiruvana.

### Análisis de la imagen de referencia

- Retrato digital ilustrado, de 245 × 282 px: mujer de pelo rubio rojizo con cola de caballo, que mira por encima del hombro con una media sonrisa.
- Fondo verde azulado con hojas, top violeta y aro verde.
- **Coincide con el GDS:** el violeta del top está cerca de arcane-500 (`#7B5CFF`), el color de identidad del sistema.
- **No coincide:** el verde azulado del fondo no existe en la paleta. Recortado en círculo a 28–40 px, el fondo queda como un borde fino y el anillo arcano lo separa del resto.
- **Escala:** la imagen tiene 245 px de ancho. Alcanza para 28 px (1x y 2x) y 40 px (2x = 80 px). No alcanza para usos grandes, que además no se proponen.
- **Expresión:** cálida y confiada, coherente con "claridad, confianza, tranquilidad". Por eso no se agregan variantes de humor: una sola imagen fija.

## 2. Dónde aparece

| Lugar | Tipo de mensaje | Tamaño | Cuándo |
|---|---|---|---|
| Hoy, debajo de las métricas | Resumen de sesión ("Shiruvana informa") | 40 px | Siempre que hubo una sesión; máximo 3 viñetas |
| Hoy, arriba de todo | Advertencia | 28 px | Solo si hay riesgo CRÍTICO, ALTO sin mitigar, vigilia vencida (> 48 h) o detención |
| Necesita tu decisión, en cada tarjeta REQ | Recomendación | 28 px | Siempre: es la sección "Recomendación" del pedido |
| Historial "Decidido por la Factory" | Decisión | 28 px | Cada decisión técnica tomada por la Factory (DEC/LES), en orden cronológico |
| Ideas, en "Esperando criterio" | Recomendación | 28 px | Solo la idea que Shiruvana propone promover, con su motivo |
| Salud, junto a una métrica fuera de rango | Advertencia | 28 px | Solo cuando una métrica de DEC-023 sale de su rango sano |

**No aparece en:** cabecera, navegación, pie, estados vacíos, cargas, métricas, listas de backlog, contexto de un pedido (eso es dato), errores del canal (son del sistema) ni en la app La Bóveda.

## 3. Qué comunica

| Tipo | Rótulo visible | Ícono | Color (siempre con rótulo e ícono) | Contenido |
|---|---|---|---|---|
| Dato del sistema | Nombre del dato | — | Neutro (obsidiana) | Valores medidos. **Sin avatar.** |
| Recomendación | Shiruvana recomienda | ➜ | Tinte arcano 0.14, borde arcane-500, rótulo arcane-300 | Opción sugerida y su motivo en 1–2 frases |
| Decisión | Shiruvana decidió | ✓ | Tinte arcano 0.14, borde jade, rótulo jade | Qué decidió, por qué y enlace a DEC/LES |
| Advertencia ALTO | Shiruvana advierte · ALTO | ▲ | Tinte ámbar 0.14, borde y anillo ámbar | Riesgo, efecto y qué hace la Factory |
| Advertencia CRÍTICO | Shiruvana advierte · CRÍTICO | ■ | Tinte carmesí 0.14, borde y anillo carmesí | Qué se detuvo y qué necesita de Pablo |
| Resumen de sesión | Shiruvana informa | ◆ | Superficie 1, borde arcane-500 | Qué cerró, qué registró y qué sigue |

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
- Ocupar más espacio que la información: máximo 40 px y un avatar por tarjeta.
- Agrupar o repetir: con más de 5 mensajes visibles en una vista, se agrupan por tipo.
- Usar los tokens de marca del gato o colores de estado sin rótulo e ícono.
- Aparecer en la app La Bóveda: la identidad de Shiruvana es del panel de gobierno, no del producto.
- Persuadir: la recomendación se muestra junto a las otras opciones, nunca en su lugar ni preseleccionada.

## 5. Descripción visual

Mockup conceptual entregado aparte a Pablo (`shiruvana-mockup-panel.html`, fuera del repositorio).

```text
┌──────────────────────────────────────────────────────────────┐
│ ▌(◯) ➜ SHIRUVANA RECOMIENDA              2026-10-21 · REQ-009 │
│ ▌ A — Es tu imagen sin retoques. A 28 px el fondo casi no se │
│ ▌     ve y el anillo arcano la separa de la paleta.           │
└──────────────────────────────────────────────────────────────┘
  ▌ = borde izquierdo de 4 px (color del tipo)
  (◯) = avatar circular de 28 px con anillo de 2 px
```

## 6. Accesibilidad

- El avatar es redundante con el rótulo visible: `aria-hidden="true"` y `alt` vacío, para que el lector de pantalla no lo lea dos veces.
- El significado lo dan el rótulo y el ícono; el color solo acompaña.
- El componente no es interactivo: no agrega paradas de foco. Los botones vecinos mantienen 40 px de alto y foco visible.
- Sin animación, así que `prefers-reduced-motion` no aplica.
- Si la imagen no carga, se muestra un monograma "S" sobre arcane-700.

## 7. Implementación propuesta (después de REQ-009 y de BL-034)

Es trabajo de panel (soporte): entra en el ≤ 15 % semanal de DEC-023 y no se adelanta al producto. Son 3 micro-ciclos en gw2-factory-dashboard:

1. Avatar `assets/shiruvana-28.webp` y `-80.webp` (menos de 10 KB) y componente `gds-voice` en el GDS, con su test de contraste.
2. Resumen de sesión y advertencias en Hoy; recomendación en las tarjetas REQ.
3. Historial "Decidido por la Factory", recomendación en Ideas y tests del parser.

La elección técnica del componente es de la Factory y se registra como DEC al implementar. La imagen y su uso público los decide Pablo (REQ-009).
