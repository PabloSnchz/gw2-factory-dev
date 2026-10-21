# DEC-025 — La Bóveda adopta la identidad Gato Negro y mi voz

- Estado: ACEPTADA — pedida por Pablo en la conversación (2026-10-21 04:52Z) con las definiciones que confirmó a las 05:00Z
- Fecha: 2026-10-21
- Ámbito: La Bóveda del Gato Negro (gw2-factory-dev, publicada en DEV: https://gw2-factory-dev.vercel.app). Producción no se toca: pasar esto a producción lo decide Pablo.
- Reemplaza: la regla de DEC-024 que dejaba mi voz fuera de La Bóveda (DEC-022: prevalece la regla aprobada más recientemente)
- Relacionadas: DEC-010 (GDS), DEC-021 (micro-ciclos), DEC-022, DEC-024

## Contexto

Pablo pidió alinear la interfaz de La Bóveda con el ecosistema: la marca Gato Negro, mi presencia donde le hablo al jugador y un theme basado en el Gato Design System. En sus palabras: "Gato Negro es la marca, pero vos sos el corazón y el espíritu del producto". Voy a ser la compañía principal del jugador y, más adelante, podré tener interacciones dinámicas.

## Decisión

### 1. Marca

- El gato oficial (el mismo dibujo de `brandMark()` del panel: bóveda obsidiana, marco arcano, gato negro, ojos ámbar) reemplaza a `assets/logo-gato-negro.png` en la cabecera y el pie de La Bóveda, y pasa a ser el favicon.
- Vive en `assets/brand/gato-negro.svg`. Un test exige que el dibujo coincida con el del panel: un solo gato en todo el ecosistema.
- El nombre "Bóveda del Gato Negro" no cambia.

### 2. Theme oficial "Gato Negro"

- `css/themes/gato.css`, construido con los colores del Gato Design System, con el contraste calculado por test (WCAG 2.1 AA).
- Es el theme por defecto. "Bóveda" sigue disponible en el selector.
- Migración de una sola vez: quien tenía "Bóveda" (el default anterior, que el selector guardaba solo) pasa a "Gato Negro". Quien había elegido otro theme lo conserva. La marca `gn:theme:official` evita repetir la migración: si después alguien elige "Bóveda", se respeta.

### 3. Mi presencia

- Aparezco donde le hablo al jugador:
  - la bienvenida, cuando todavía no hay API Key;
  - el modal de API Keys (qué permisos pide y por qué tus datos quedan en tu navegador);
  - la guía de usuario y los modales de ayuda;
  - los errores que el jugador puede resolver;
  - los avisos sobre datos.
- Nunca aparezco en saldos, tablas, listas, filtros, la cabecera ni la navegación: ahí habla el sistema.
- Un avatar por modal o sección; los mensajes siguientes van sin imagen.
- Hablo en primera persona, con voseo y un tono cercano y preciso, sin chistes ni jerga de bot. Firmo "Shiruvana", sin explicar la Factory.
- Mi componente usa las variables del theme activo y tiene que verse bien en todos los themes, también en los claros.

## Implementación (misión FACTORY-BOVEDA-UI-001, BL-038)

Orden: marca y theme primero, porque definen los colores que uso yo.

1. Esta decisión, BL-038 y el índice.
2. `css/themes/gato.css` y su test de contraste.
3. `js/theme-selector.js` 1.2.0 (theme oficial y migración) y su test.
4. `assets/brand/gato-negro.svg` y su test.
5. `index.html`: logo, pie, favicon y theme por defecto (micro-ciclo de archivo grande).
6. Mi componente en La Bóveda (CSS, JS y test).
7. Bienvenida, modal de API Keys y ayuda, uno por micro-ciclo.
8. Cierre: funcionalidad, backlog y estado.

## Consecuencias

- La Bóveda y el panel comparten marca, colores y voz.
- El favicon pasa de 405 KB (PNG) a menos de 1 KB (SVG).
- Pasar a producción sigue siendo decisión de Pablo.
