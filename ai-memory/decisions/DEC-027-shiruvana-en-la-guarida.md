# DEC-027 — La Guarida con el lenguaje visual del panel y mi voz en el resumen

- Estado: REEMPLAZADA por DEC-028 (2026-10-22): Pablo detectó que mezclaba funciones del Centro de decisiones con La Guarida. Antes: ACEPTADA — pedido de Pablo (2026-10-22 04:42Z): "que la Guarida sea un entorno gráfico más parecido al Centro de decisiones" e "incorporá a Shiruvana, pero definí estratégicamente cómo y dónde". Él me delegó el dónde y el cómo; esta decisión lo registra.
- Fecha: 2026-10-22
- Ámbito: la-guarida (lanzador personal de Pablo). No cambia La Bóveda ni el panel.
- Relacionadas: DEC-024, DEC-025, BL-040, BL-051

## Contexto

La Guarida es la página con la que Pablo empieza el día. Hasta ahora tenía su propio estilo (barra utilitaria cargada, tarjetas con títulos ámbar, tres columnas de ancho fijo que escondían widgets y lanzador debajo de 1200 px) y no mostraba nada de la Factory. DEC-024 dice que agregar otro uso de mi avatar es decisión de Pablo; esta vez él pidió que aparezca y me dejó elegir el lugar.

## Decisión

### 1. Lenguaje visual

- La Guarida adopta la estructura del Centro de decisiones: cabecera con marca (gato oficial, "La Guarida" / "Lanzador del Gato Negro"), pestañas de acciones y enlaces, y a la derecha estado de la Factory, theme y backup; debajo, un resumen (rótulo, saludo, chips) y las secciones con título y una línea que explica.
- Los colores salen de las variables del theme activo, no de los tokens del GDS: los 19 themes siguen funcionando y con el theme Gato Negro queda igual al panel. Los colores de estado (éxito, información, advertencia, arcano) son los del GDS y el texto de los chips se mezcla con el del theme para llegar a 4,5:1 también en los themes claros.
- Mismos ids que antes: `app.js`, `widgets.js`, `modal.js` y `drag-drop.js` no cambian.

### 2. Dónde aparezco

| Lugar | Yo | Motivo |
|---|---|---|
| Resumen de arriba | Sí, un mensaje "Shiruvana resume" con avatar de 56 px | Es lo primero que Pablo ve al abrir el navegador: el mejor momento para decirle qué le pide la Factory |
| Chips del resumen y de la cabecera | No (son datos) | Cuentan decisiones, acciones, validaciones y el estado de la Factory |
| Favoritos, categorías, lanzador, widgets | Nunca | Son datos y herramientas de Pablo, no mensajes míos |
| Modal de edición | No | Es un formulario: no necesita voz |

### 3. Qué digo

- Lo que espera a Pablo, con la misma lectura que el panel ("Te esperan 1 acción tuya y 1 validación."), hasta 3 pendientes y cuántos más hay.
- En qué estoy trabajando ("Yo estoy con: …").
- Un enlace al Centro de decisiones y un botón "Actualizar".
- No repito el panel: el detalle, las decisiones con contexto y las respuestas siguen allá.

### 4. Cómo leo

- `ai-memory/status.md` de gw2-factory-dev por `raw.githubusercontent.com` (sin cuota de API), el mismo archivo que lee el panel.
- Copia de 5 minutos en `localStorage` (`guarida:factory:v1`); se actualiza sola cada 5 minutos y al volver a la pestaña.
- Si GitHub no responde, uso la última copia y lo digo; si no hay copia, lo explico ("Shiruvana explica") y dejo el enlace al panel. Mientras carga digo que estoy leyendo, no que falló.
- Todo texto de la memoria se escapa antes de pintarlo.

## Implementación

- BL-051, repo la-guarida, 3 micro-ciclos: GUA-1 `js/shiruvana.js` + `tests/shiruvana.test.cjs` (`593474c`), GUA-2 `index.html` + `css/styles.css` 2.0.0 (`fb3533c`), GUA-3 README (`871a44b`).

## Consecuencias

- La Guarida se vuelve la puerta de entrada a la Factory sin duplicar el panel.
- La Guarida depende de que `status.md` mantenga su formato (Estado, Tarea actual y "Esperando a Pablo" con clases, contrato v4). Si cambia el formato, hay que actualizar `parseStatus` y su test.
- Cambiar el lugar de mi voz en La Guarida o sumar otro es decisión de Pablo; el texto, los tamaños y el estilo los ajusta la Factory dentro de DEC-024.
