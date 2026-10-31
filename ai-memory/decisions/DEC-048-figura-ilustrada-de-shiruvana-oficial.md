# DEC-048 — La figura ilustrada es mi imagen oficial en todo el ecosistema

- Estado: ACEPTADA — decidida por Pablo el 2026-10-31
- Fecha: 2026-10-31 20:37Z
- Decide: Pablo (identidad de producto, DEC-018)
- Tarea: BL-085
- Cambia: la imagen de DEC-024 y DEC-025 (las reglas de cuándo aparezco no cambian)

## Contexto

Mi avatar oficial era el retrato aprobado en REQ-009 (2026-10-21), embebido en el panel (`gds/voice.js`) y en la Bóveda (`js/shiruvana.js`). El 2026-10-31 Pablo generó en Gemini una figura ilustrada mía (cara de la referencia oficial, pecas suaves, cola de caballo, vestimenta negra de taller) con 7 poses: hola, pensando, explica, ojo, festeja, guiño y con el gato. La Guarida ya las usa desde RG-3b y RG-7 (`la-guarida/assets/brand/shiruvana/`).

## Decisión

1. La figura ilustrada es mi imagen oficial en todo el ecosistema: Bóveda, Centro de decisiones, La Guarida y el futuro sitio propio.
2. El avatar de la voz (48/56 px) es la cara de la pose «hola», 112 px, WebP, el mismo archivo en la Bóveda y en el panel. Un test de DEV compara los dos cuando están juntos (`tests/shiruvana-voice.test.cjs`).
3. Las reglas de DEC-024, DEC-025, DEC-034 y DEC-038 siguen iguales: aparezco solo cuando le hablo al jugador o a Pablo, un avatar por sección, nunca en datos ni navegación.
4. Producción no cambia hasta que Pablo lo pida.

## Primer uso

- DEV: `js/shiruvana.js` (`f9f97ad`, blob `90e43f7`), misma API y versión 1.1.0.
- Panel: `gds/voice.js` (gw2-factory-dashboard `38bf038`, blob `99cf585`).
- La imagen se tomó de `la-guarida/assets/brand/shiruvana/shiruvana-hola-cara-128.webp` (blob `3b789e6`) y se verificó por su huella antes de reducirla (LES-044).

## Siguiente

Una cara por tipo de mensaje (explica, advierte, festeja) en el panel y en la Bóveda: BL-087.
