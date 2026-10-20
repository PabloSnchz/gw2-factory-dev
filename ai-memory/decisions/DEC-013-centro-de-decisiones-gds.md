# DEC-013 — El panel es un Centro de decisiones construido con el Gato Design System

- Estado: ACEPTADA
- Fecha: 2026-10-20
- Ámbito: Dashboard Factory (gw2-factory-dashboard)
- Amplía: DEC-008, DEC-010, DEC-012
- Misión: FACTORY-001B (MC-5)

## Contexto

El panel informaba bien, pero era un monitor: todo pesaba parecido, Pablo tenía que interpretar códigos internos (DEC, BL, RSK, EN_CURSO) y lo que necesitaba de él competía con la historia. Además:

- la cola juntaba pendientes que no tenían relación: "Validar MC-4" (BL-020) quedaba escondido dentro de "Validar el panel" (BL-016) porque este lo citaba;
- si el canal de respuestas fallaba, el error solo se veía en GitHub (RSK-014).

## Decisión

1. **Orden de la vista Hoy por decisión.** Primero una frase que resume qué hacer ("Hay 4 cosas esperando tu decisión"). Después:
   1. las respuestas del canal que no se registraron;
   2. una tarjeta por cada pendiente: qué es, por qué importa, qué recomienda la Factory y los botones para responder (la recomendada es el único botón principal);
   3. "Ya respondiste";
   4. recién entonces qué hace la Factory, qué debería preocupar, la actividad de hoy y de la semana, los números y los entornos.
2. **Lenguaje.** Los títulos se muestran sin IDs delante. Los IDs quedan como referencia chica (`.gds-ref`) para quien quiera el detalle. Los estados se dicen en palabras: "Trabajando", "Esperando tu validación". Las etapas del workflow, en castellano.
3. **GDS como única fuente visual.** `index.html` carga `gds/tokens.css` y `gds/components.css`. `css/app.css` solo dispone las piezas, con tokens y sin colores ni medidas sueltas; lo verifica un test. Todo estado lleva ícono + texto.
4. **Cola.** Una línea de "Esperando a Pablo" que nombra su propio trabajo (BL o pedido) es un pendiente propio: no se agrupa dentro de otro ítem que solo la cita. La agrupación indirecta queda para los datos de contexto (por ejemplo, un riesgo citado por su tarea).
5. **Canal visible (cierra BL-028).** El panel lee los issues abiertos de Pablo con la marca del canal: 1 llamada más, 6 por carga, con caché de 10 min.
   - Un issue abierto hace menos de 5 min se muestra como "Registrando tu respuesta".
   - Uno más viejo se muestra como "no se pudo registrar", con el enlace al motivo. Aparece en el veredicto, dentro de la tarjeta, en "Qué debería preocuparte" y en Salud.
   - Al volver de GitHub después de tocar un botón, el panel relee sin caché.
6. **Accesibilidad.**
   - Al cambiar de vista, el foco pasa al contenido.
   - Las lecturas se anuncian en una región `aria-live`.
   - Después de Refrescar, el foco vuelve al botón.
   - El paso actual lleva `aria-current="step"` y los contadores tienen texto para lector de pantalla.
   - Cada `aria-labelledby` apunta a un id que existe.
7. **GDS 1.0.1 (PATCH).** Un botón o una métrica usados como `<a>` conservan el color de su variante; antes heredaban el color de enlace por especificidad. Se corrige en el sistema, no en la aplicación.

## Alternativas descartadas

- **Mantener el orden por secciones fijas** (estado → decisiones → riesgos): obliga a leer el estado de la Factory antes de saber si hay algo para hacer.
- **Ocultar los IDs por completo**: la Factory y Pablo los usan para conversar sobre un ítem. Quedan como metadato secundario.
- **Corregir los colores de enlace-botón en `app.css`**: el problema es del sistema y le pasaría a cualquier consumidor del GDS (la webapp, después).
- **Leer los comentarios de cada issue para mostrar el motivo exacto del error**: es 1 llamada por issue. El enlace al issue alcanza y el costo queda fijo.

## Consecuencias

- La pregunta "¿tengo que hacer algo?" se contesta en la primera línea; la tarjeta trae todo lo necesario para responder sin salir de la vista.
- Presupuesto de API: 6 llamadas por carga (RSK-005).
- No se pudo verificar en un navegador real: el entorno de la Factory no tiene navegador. La revisión fue estructural (jerarquía, contraste calculado, reglas por test, mutaciones). La verificación visual queda a cargo de Pablo (RSK-015).
- Verificado con 72 tests y 16 mutaciones. Panel: `gw2-factory-dashboard` @ `9c8726b`.
