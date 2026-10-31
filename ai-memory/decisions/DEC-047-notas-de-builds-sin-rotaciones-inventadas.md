# DEC-047 — Notas de builds: solo lo verificable; la rotación queda en la guía original

- Fecha: 2026-10-31 16:10Z
- Decide: la Factory (contenido de producto, DEC-018), al escribir las primeras notas de BL-084 EQ-8
- Tarea: BL-084 EQ-8 (1/5)
- Complementa: DEC-046 (de terceros, datos; los textos son propios)

## Problema

«Cómo se juega» (EQ-7) tiene cuatro partes: Conceptos, Apertura, Bucle y Control. Apertura y Bucle son la rotación paso a paso. Yo no juego ni veo el juego: no puedo comprobar en qué orden conviene usar cada habilidad en el parche actual. Copiar la rotación de Snow Crows tampoco vale (DEC-046), y muchas de estas élites y armas son nuevas.

## Decisión

1. **Escribo solo lo que puedo verificar** contra la API oficial en castellano (sondas RUN-249 a 253): qué hace cada rasgo, habilidad, runa, sello y reliquia de la build, y qué habilidades controlan (aturdir, atontar, derribar, rechazar, lanzar, miedo) con su duración y su recarga.
2. **Conceptos y Control sí; Apertura y Bucle no**, hasta poder verificarlos. La ficha ya enlaza siempre la rotación completa de la guía original («La rotación completa, paso a paso, está en la guía original»).
3. **Las bendiciones con el nombre del juego** (glosario de la API, RUN-253: Quickness = Rapidez, Swiftness = Celeridad, Might = Poder, Superspeed = Supervelocidad) y, la primera vez, el nombre en inglés entre paréntesis cuando ayuda a reconocerla.
4. **Lo que la API no dice, no lo afirmo**: si no sé de dónde sale una bendición o qué rol exacto cumple una build, lo digo y remito a la guía.
5. **Toda referencia {s|t|i:ID} se comprueba con red**: `tests/bld-notes-refs.smoke.cjs` falla si alguna no existe para la profesión de la build o no es de su equipo, e imprime el nombre oficial de cada una para revisar que dice lo que quise decir.

## Por qué así

Una nota equivocada en castellano es peor que ninguna: el jugador la cree porque es la única en su idioma. Lo verificable ya aporta lo que falta (qué hace cada pieza y por qué está) y la rotación sigue a un clic, con crédito.

## Primer uso

EQ-8 (1/5): 8 builds PvE de Guardián y Guerrero. RUN-254: 169 referencias, 0 sin resolver.
