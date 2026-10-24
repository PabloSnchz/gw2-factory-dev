# LES-036 — La maqueta se valida en el contenedor real

- Fecha de registro: 2026-10-24
- Origen: CAM-POLISH-001 (RUN-015), BL-067

## Qué pasó

La Cámara y Logros pasaron todos sus tests de contraste y Pablo los validó, pero al compararlos con las propuestas aprobadas las tarjetas se mezclaban con el fondo. Las maquetas usaban tres superficies (lienzo, tarjeta y pista). En la Bóveda la tarjeta vive dentro de un `.panel` que pinta el mismo `--bg-1` (1.00:1), y en 17 de los 19 themes `--bg-2` es igual a `--bg-1`, así que las barras no tenían pista. Mis tests medían el texto sobre el fondo del theme, no la tarjeta sobre lo que tiene detrás.

## Lección

1. Una maqueta aprobada define relaciones entre superficies (tarjeta contra fondo, pista contra tarjeta), no solo colores de texto. Esas relaciones se miden en el contenedor real y en los 19 themes, igual que el contraste del texto.
2. Las guardas de contraste se calculan sobre las superficies que de verdad se ven. Al elevar la tarjeta, el acento de Notion bajó a 4.09:1 y la marca de la Cámara a 2.96:1; por eso `surfaceTokens` le pasa a cada guarda la bandeja y la tarjeta reales.
3. Cuando una superficie también es fondo de texto (hover, botón apretado), el texto manda: la pista se limita para que `--tx-1` y `--tx-2` sigan en AA.

## Cómo aplicar

- Cada propuesta visual anota sus superficies con sus ratios objetivo (tarjeta/fondo ≥ 1.2, pista ≥ 1.4, borde ≥ 1.5) y el test del módulo las mide en los 19 themes.
- Un módulo nuevo que se ve en un panel lo registra en `GNSurface` y calcula su guarda con `GNSurface.surfaceTokens`.
