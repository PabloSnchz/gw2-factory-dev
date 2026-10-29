# DEC-040 — Contraste de Builds: mezclar con el texto del tema, no corregir por tema

- Fecha: 2026-10-29
- Decide: Shiruvana (decisión técnica delegada por Pablo)
- Tarea: BL-082 BUI-5

## Contexto

RUN-203/204 midieron el CSS de Builds contra los tokens reales de los 19 temas. Fallaban 11: el acento lavanda (#C9B6FF) no llegaba a 3:1 en Notion y macOS; el verde y el rojo de los temas claros son los mismos que los de los oscuros (#a0ffc8, #ff9d9d) y sobre blanco no se leen; el botón principal (lavanda al 38 % sobre --bg-2) bajaba el texto a menos de 4.5:1 en 9 temas oscuros; el foco de Discord quedaba en 2.99:1; las profesiones sin elegir tenían el texto con opacidad (One Dark, Everforest).

## Decisión

1. Todo en CSS, sin JS por tema: el acento del módulo es `color-mix(#C9B6FF 55%, var(--tx-1))`; el verde, el rojo y el foco se mezclan con `--tx-1` (30 %, 40 % y 65 %). En un tema claro la mezcla oscurece y en uno oscuro aclara: el mismo valor sirve para los 19.
2. Lo elegido y el botón principal van sobre `--bg-0` con el acento al 14 %; se distinguen por el borde y el peso de la letra, no por un fondo fuerte.
3. La opacidad atenuá solo íconos, nunca texto.
4. La guarda (tests/bld-ui.test.cjs) lee los porcentajes del CSS real y los tokens de css/themes/: si alguien cambia una mezcla o agrega un tema que no llega a AA, la suite falla. Incluye un control negativo (sin el arreglo, la guarda detecta el problema).

## Alternativas descartadas

- Correcciones por tema en JS (como la Bienvenida, contrastFixes): más código y un observador del tema; innecesario cuando una mezcla alcanza.
- Tocar los temas: afectaría a toda la Bóveda (eso es BL-060).
