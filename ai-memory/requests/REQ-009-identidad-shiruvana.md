# REQ-009 — ¿Aprobás la identidad visual de Shiruvana en el panel y con qué imagen?

- Estado: CERRADA
- Tipo: decisión
- Fecha: 2026-10-21
- Prioridad: BAJO
- Área: panel
- Relacionado: DEC-010, DEC-013, DEC-019, DEC-023
- Bloquea: nada (solo la implementación de la identidad visual; el producto sigue)
- Cerrado: 2026-10-21 · RESP-009 (opción A, avatar 48/56 px, DEC-024)

## Qué pasó

Pediste integrar visualmente a Shiruvana en el panel a partir de tu imagen de referencia (FACTORY-DASHBOARD-IDENTITY-001). La propuesta completa está en `missions/FACTORY-DASHBOARD-IDENTITY-001-propuesta.md`. En resumen:

- el avatar marca autoría: aparece solo cuando Shiruvana recomienda, decide, advierte o resume una sesión; los datos del sistema nunca lo llevan;
- es un círculo de 28 px (40 px en el resumen) con un anillo arcano, siempre junto a un rótulo y un ícono ("Shiruvana recomienda ➜");
- no aparece en la cabecera, estados vacíos, métricas ni en la app La Bóveda; no se anima.

## Por qué importa

Hoy en el panel no se distingue a simple vista un dato medido de una opinión de la Factory. El avatar con rótulo lo hace evidente, sobre todo en las recomendaciones de los pedidos.

## Riesgo

- **Publicación:** el panel es público (GitHub Pages). La imagen queda visible para cualquiera. Si es una persona real o deriva de una foto, hace falta su consentimiento.
- **Coherencia visual:** con A, el fondo verde azulado no es parte de la paleta GDS; a 28 px queda como un borde fino.
- **Edición:** con B, editar la imagen puede alterar la expresión que imaginaste.
- **Foco:** riesgo bajo de que el panel se vuelva "de personaje"; lo controlan las reglas de "qué NO debe hacer".

## Por qué te lo pregunto

La identidad visual y la experiencia de uso del panel son decisiones tuyas (DEC-018). Además, solo vos sabés si la imagen se puede publicar: de dónde salió y quién aparece. La parte técnica (componente, tamaños, contraste) la resuelve la Factory.

## Opciones

- A — Imagen tal cual: recorte circular del rostro, anillo arcano, sin retoques. Confirmás que se puede publicar.
- B — Imagen adaptada al GDS: el mismo recorte con el fondo verde azulado reemplazado por obsidiana. Confirmás que se puede publicar y editar.
- C — Sin imagen: el mismo componente con un monograma "S" arcano. No publica ninguna imagen.
- D — Posponer: no se implementa la identidad por ahora.

## Recomendación

A — Respeta la imagen que elegiste, no requiere edición, y a 28 px el fondo casi no se nota frente al anillo arcano. Se implementa después de BL-034, como trabajo de panel dentro del 15 % semanal. Si tenés dudas sobre los derechos de la imagen, elegí C: el componente es el mismo y la imagen se puede sumar después.
