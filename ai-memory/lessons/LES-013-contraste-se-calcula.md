# LES-013 — El contraste se calcula, incluidos los fondos translúcidos

- Fecha de registro: 2026-10-20
- Origen: FACTORY-001B MC-2 (Gato Design System)

## Qué pasó

- La paleta propuesta para el GDS se veía correcta, pero al medirla falló WCAG 2.1 AA en 7 usos: el violeta como texto (3.29:1), blanco sobre el violeta (4.36:1), el rojo como texto (3.44:1), blanco sobre el rojo (4.18:1), el azul como texto (4.49:1) y los badges de éxito (4.41:1) y peligro (2.97:1) sobre su propio tinte.
- El borrador de tokens de la sesión interrumpida ya había corregido los cinco primeros "a ojo" y con cálculos sueltos, pero seguía fallando en los dos badges: nadie había compuesto el tinte translúcido sobre la superficie real antes de medir.
- El panel publicado (v1) tampoco cumple: badge "crítico" 3.70:1, texto crítico sobre su tinte 4.08:1, borde de botones 1.29:1.

## Lección

- El contraste no se estima ni se revisa visualmente: se calcula para cada par de uso real (texto + fondo + superficie debajo si el fondo es translúcido).
- Un valor que pasa a 4.49:1 no cumple; los márgenes chicos son exactamente donde el ojo engaña.
- Si la verificación no corre automáticamente, se degrada con el primer ajuste de paleta.

## Cómo aplicar

- Todo par de uso nuevo se agrega a `PAIRS` en `gw2-factory-dashboard/gds/contrast.mjs`; el test falla si no cumple.
- Los fondos translúcidos se declaran con la superficie sobre la que se usan (`over`).
- La tabla de contraste de GDS_FOUNDATION.md se genera del cálculo; el test exige que coincidan.
