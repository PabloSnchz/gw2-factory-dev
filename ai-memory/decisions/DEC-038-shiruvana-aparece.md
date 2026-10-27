# DEC-038 — Shiruvana aparece: mis mensajes como globo desde el rincón

- Estado: ACEPTADA — Pablo aprobó D1 a D5 de BL-075 (2026-10-27 00:43Z: «si a todo, vamos según tu recomendación»).
- Fecha: 2026-10-27
- Ámbito: cómo le hablo al jugador fuera de los módulos.
- Modifica: DEC-034 (el rincón global; «no interrumpo: nada se abre solo» pasa a la regla de abajo).
- Relacionadas: BL-075, BL-059, DEC-024, DEC-033, DEC-034

## Contexto

Pablo propuso (2026-10-27 00:30Z) que mis mensajes no sean un bloque escrito dentro del módulo, sino algo emergente: que aparezca mi cara y hable. La propuesta SHE-0 (`docs/propuestas/propuesta-shiruvana-emergente.html`) definió cómo hacerlo sin volverme una molestia.

## Decisión

1. **D1 — Globo, no modal**: salgo de mi avatar del rincón (pie de la barra lateral; en el celular, sobre la barra de abajo). No tapo nada, no oscurezco el fondo y no saco el foco.
2. **D2 — Cambia DEC-034**: puedo aparecer sola, con estas reglas: una vez por cosa nueva (lo que ya viste no vuelve), uno por pantalla, 2 segundos después de llegar, nunca con un diálogo abierto ni mientras escribís.
3. **D3 — Qué queda en el módulo**: los datos (saldos, tablas, la evolución) y los avisos críticos (errores, permisos de la Key) siguen escritos en el módulo. El globo lleva recomendaciones y novedades.
4. **D4 — 12 segundos**: me voy sola; me quedo mientras me mirás o tenés el foco adentro. Lo que no leíste queda como un punto en mi avatar; tocarlo me vuelve a abrir. Escape o ✕ me cierran.
5. **D5 — Bienvenida**: el globo reemplaza la línea de la Bienvenida que llevaba a la Cartera (D6 de SHV-0).
6. **Silenciar**: «Silenciar a Shiruvana» en Ajustes. Silenciada, hablo solo dentro de los módulos.
7. Accesible: el lector de pantalla me anuncia sin interrumpir (aria-live polite); con «Movimiento reducido» aparezco sin animación; colores del theme.

## Implementación

- `js/shv-bubble.js` (SHE-1): el globo, inerte hasta SHE-2. Guarda `gn:shv:seen` (solo huellas de 8 caracteres, nunca el texto; 200 como mucho, 60 días) y `gn:shv:quiet`. Las dos claves entran a privacidad cuando se conecten (SHE-2).
- SHE-2: la Cartera habla por el globo, el rincón muestra el punto y Ajustes suma «Silenciar a Shiruvana».
- SHE-3: el resto de los módulos, uno por vez.

## Consecuencias

- Más presencia mía sin ruido: cada mensaje sale una sola vez.
- Producción y DEV comparten el almacenamiento: lo que viste en uno no vuelve en el otro.
